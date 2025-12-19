import { GoogleGenerativeAI } from "@google/generative-ai";
import { CASE_STUDY_PROMPT, VC_REPORT_PROMPT } from "./prompts";
import prisma from "./prisma";
import { generateRepoContext } from "./repomix";
import { getRepoMetadata } from "./github";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateWithGemini({ type, repoContextLight, caseStudyJson, repoMetrics }) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using Flash for speed/cost

  let prompt;

  if (type === "CASE_STUDY") {
    prompt = CASE_STUDY_PROMPT
      .replace("{{REPO_CONTEXT_LIGHT}}", repoContextLight)
      .replace("{{REPO_METADATA_JSON}}", JSON.stringify(repoMetrics || null));
  } else if (type === "VC_REPORT") {
    prompt = VC_REPORT_PROMPT
      .replace("{{CASE_STUDY_JSON}}", JSON.stringify(caseStudyJson))
      .replace("{{REPO_CONTEXT_LIGHT}}", repoContextLight)
      .replace("{{REPO_METRICS_JSON}}", JSON.stringify(repoMetrics || null));
  } else {
    throw new Error("Unknown report type");
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate content with AI");
  }
}

export async function generateCaseStudyContent(repoUrl, userId) {
  // 1. Generate Repo Context (Repomix)
  const repoContext = await generateRepoContext(repoUrl);
  
  // 2. Fetch Metadata (Owner, Commits, etc.) - Transient, NOT saved to DB
  const metadata = await getRepoMetadata(repoUrl);
  const { owner, name } = metadata;

  // 3. Store Repo Data (Only Text Context & Basic Info)
  await prisma.repoData.upsert({
    where: { repoUrl },
    update: {
      contextText: repoContext,
      updatedAt: new Date(),
    },
    create: {
      repoUrl,
      owner: owner?.login || "unknown", // Only basic owner name
      name: name || "unknown",
      stars: metadata.stargazers_count || 0,
      defaultBranch: metadata.default_branch || "main",
      contextText: repoContext,
    },
  });

  // 4. Generate Case Study JSON (Pass Metadata Dynamically)
  const aiData = await generateWithGemini({
    type: "CASE_STUDY",
    repoContextLight: repoContext,
    repoMetrics: metadata, // Pass full metadata (commits, owner bio) to AI
  });

  return {
    ...aiData,
    repoContext,
    metadata, // Return metadata so API route can use it for DB
  };
}

export async function generateVCReportContent(caseStudy) {
  // 1. Fetch Repo Context from DB
  const repoData = await prisma.repoData.findUnique({
    where: { repoUrl: caseStudy.repoUrl },
  });

  const repoContext = repoData?.contextText || "Repo context not found.";

  // 2. Generate VC Report JSON
  const aiData = await generateWithGemini({
    type: "VC_REPORT",
    repoContextLight: repoContext,
    caseStudyJson: caseStudy,
    repoMetrics: { stars: repoData?.stars || 0 }, // Pass metrics
  });

  return aiData;
}
