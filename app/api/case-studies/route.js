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

    // Ensure User exists in DB (Sync on demand if webhook failed)
    const email = user.emailAddresses[0]?.emailAddress || "no-email@example.com";
    const dbUser = await prisma.user.upsert({
      where: { clerkUserId: userId },
      update: {},
      create: {
        clerkUserId: userId,
        email: email,
      },
    });

    // 1. Generate AI Content (includes Repomix & Gemini)
    const { metadata, ...content } = await generateCaseStudyContent(repoUrl, userId);

    // 2. Create Slug
    const repoName = repoUrl.split("/").pop() || "project";
    const slugBase = repoName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    // 3. Save to DB
    const caseStudy = await prisma.caseStudy.create({
      data: {
        repoUrl,
        title: content.title,
        summary: content.summary,
        problemSummary: content.problemSummary,
        solutionSummary: content.solutionSummary,
        techStack: content.techStack,
        architectureOverview: content.architectureOverview,
        coreFeatures: content.coreFeatures,
        challengesAndSolutions: content.challengesAndSolutions,
        impact: content.impact,
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
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return NextResponse.json({ error: message, code }, { status });
  }
}

