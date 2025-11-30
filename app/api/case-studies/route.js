import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRepoMetadata, getRepoLanguages } from "@/lib/github";
import { generateCaseStudyContent } from "@/lib/ai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return NextResponse.json({ error: "Repo URL is required" }, { status: 400 });
    }

    // 1. Fetch GitHub Data
    const [repoMeta, languages] = await Promise.all([
      getRepoMetadata(repoUrl),
      getRepoLanguages(repoUrl),
    ]);

    // 2. Generate AI Content
    const content = await generateCaseStudyContent(repoMeta, languages);

    // 3. Create Slug
    const slugBase = repoMeta.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    // 4. Save to DB
    const caseStudy = await prisma.caseStudy.create({
      data: {
        repoUrl,
        title: content.title,
        summary: content.summary,
        techStack: content.techStack,
        architectureOverview: content.architectureOverview,
        coreFeatures: content.coreFeatures,
        challengesAndSolutions: content.challengesAndSolutions,
        impact: content.impact,
        proofData: content.proofData,
        slug,
        // If user is logged in, link it. We need to find/create the User record first.
        // For simplicity in this demo, we only link if we have a User record.
        // In a real app, we'd sync Clerk users to our DB via webhook.
        // Here we'll skip linking if user not in DB, or try to find by clerkUserId.
        user: {
            connect: { clerkUserId: userId }
        }
      },
    });

    return NextResponse.json({ slug: caseStudy.slug });
  } catch (error) {
    console.error("Error creating case study:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
