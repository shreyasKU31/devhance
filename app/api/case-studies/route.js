import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateCaseStudyContent } from "@/lib/ai";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return NextResponse.json({ error: "Repo URL is required" }, { status: 400 });
    }

    // Ensure User exists in DB (Sync on demand if webhook failed)
    // Use upsert to handle race conditions where webhook might create user in parallel
    const email = user.emailAddresses[0]?.emailAddress || "no-email@example.com";
    const dbUser = await prisma.user.upsert({
      where: { clerkUserId: userId },
      update: {}, // No updates if exists
      create: {
        clerkUserId: userId,
        email: email,
      },
    });

    // 1. Generate AI Content (includes Repomix & Gemini)
    // This now handles fetching repo data and generating the JSON
    const { metadata, ...content } = await generateCaseStudyContent(repoUrl, userId);

    // 2. Create Slug
    // We can extract name from repoUrl for the slug base
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
        proofData: content.proofOfWorkSnapshot || content.proofData || {}, // Map to proofData column with fallback
        keyFolders: content.keyFolders || [],
        totalCommits: metadata.commitCount || 0, // From GitHub API
        activePeriod: metadata.activePeriod || "Unknown", // From GitHub API
        slug,
        user: {
            connect: { id: dbUser.id }
        }
      },
    });

    return NextResponse.json({ slug: caseStudy.slug });
  } catch (error) {
    console.error("Error creating case study:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
