import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateCaseStudyContent } from "@/lib/ai";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ValidationError, AuthError, handleApiError } from "@/lib/errors";

export async function POST(req) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      throw new AuthError("Please sign in to create a case study");
    }

    const body = await req.json().catch(() => ({}));
    const { repoUrl } = body;

    if (!repoUrl) {
      throw new ValidationError("Repository URL is required", "repoUrl");
    }

    // Validate GitHub URL format
    if (!repoUrl.includes("github.com/")) {
      throw new ValidationError("Please provide a valid GitHub repository URL", "repoUrl");
    }

    // Normalize repoUrl (remove trailing slashes, .git suffix)
    const normalizedUrl = repoUrl.replace(/\.git$/, '').replace(/\/$/, '');

    // Check if case study already exists for this repo
    const existingCaseStudy = await prisma.caseStudy.findFirst({
      where: { repoUrl: normalizedUrl },
      select: { slug: true, title: true }
    });

    if (existingCaseStudy) {
      return NextResponse.json({
        error: "A case study for this repository already exists",
        code: "DUPLICATE_REPO",
        existingSlug: existingCaseStudy.slug,
        existingTitle: existingCaseStudy.title
      }, { status: 409 });
    }

    // Ensure User exists in DB (Sync on demand if webhook failed)
    // Ensure User exists in DB (Sync on demand to handle race conditions)
    const email = user.emailAddresses[0]?.emailAddress || "no-email@example.com";
    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!dbUser) {
      // Not found by Clerk ID, try by email to avoid P2002
      dbUser = await prisma.user.findUnique({
        where: { email }
      });

      if (dbUser) {
        // User exists with this email but different/missing Clerk ID. Update it.
        dbUser = await prisma.user.update({
          where: { email },
          data: { clerkUserId: userId }
        });
      } else {
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            clerkUserId: userId,
            email: email,
          },
        });
      }
    }


    // 1. CHECK FOR ACTIVE ANALYSIS (Locking Mechanism)
    const existingAnalysis = await prisma.analysisStatus.findUnique({
      where: { userId }
    });

    if (existingAnalysis) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      
      if (existingAnalysis.createdAt > tenMinutesAgo) {
        // Analysis is fresh (less than 10 mins old) -> BLOCK
        return NextResponse.json({
          error: "An analysis is already in progress. Please wait for it to finish.",
          code: "ANALYSIS_IN_PROGRESS"
        }, { status: 429 });
      } else {
        // Analysis is stale (older than 10 mins) -> CLEAR & PROCEED
        await prisma.analysisStatus.delete({
          where: { userId }
        });
        console.log(`Cleared stale analysis for user ${userId}`);
      }
    }

    // 2. CREATE LOCK
    await prisma.analysisStatus.create({
      data: {
        userId,
        repoUrl: normalizedUrl,
        status: "processing"
      }
    });

    try {
      // 3. GENERATE CONTENT
      const { metadata, ...content } = await generateCaseStudyContent(normalizedUrl, userId);

      // 4. CREATE SLUG
      const repoName = repoUrl.split("/").pop() || "project";
      const slugBase = repoName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

      // 5. SAVE TO DB
      const caseStudy = await prisma.caseStudy.create({
        data: {
          repoUrl: normalizedUrl,
          title: content.title || "Untitled Project",
          summary: content.summary || "No summary available.",
          problemSummary: content.problemSummary || "",
          solutionSummary: content.solutionSummary || "",
          techStack: content.techStack || "",
          architectureOverview: content.architectureOverview || "",
          coreFeatures: content.coreFeatures || [],
          challengesAndSolutions: content.challengesAndSolutions || "Not available",
          impact: content.impact || "",
          proofData: content.proofOfWorkSnapshot || content.proofData || {},
          keyFolders: content.keyFolders || [],
          totalCommits: metadata.commitCount || 0,
          activePeriod: metadata.activePeriod || "Unknown",
          slug,
          user: {
              connect: { id: dbUser.id }
          }
        },
      });

      return NextResponse.json({ slug: caseStudy.slug });

    } finally {
      // 6. REMOVE LOCK (Always, success or failure)
      // Use deleteMany to avoid error if it was already deleted by race condition (though unlikely with unique userId)
      // or simple delete wrapped in try-catch to be safe
      try {
        await prisma.analysisStatus.delete({
          where: { userId }
        }).catch(() => {}); // Ignore if already deleted
      } catch (e) {
        console.error("Failed to clear analysis lock:", e);
      }
    }
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return NextResponse.json({ error: message, code }, { status });
  }
}

