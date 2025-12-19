export const CASE_STUDY_PROMPT = `You are a technical analyst. Read the repo context and output a concise case study as STRICT JSON only.
Use ONLY provided context. Unknown values = null/0/[].

CONTEXT:
{{REPO_CONTEXT_LIGHT}}

METADATA:
{{REPO_METADATA_JSON}}

OUTPUT (JSON only, no markdown):
{
  "title": "Short project title",
  "summary": "3-4 sentences: what it does, who it serves",
  "problemSummary": "2-3 sentences: core problem solved",
  "solutionSummary": "2-3 sentences: how solution addresses problem",
  "techStack": "Comma-separated technologies",
  "architectureOverview": "1-2 paragraphs: high-level architecture",
  "coreFeatures": [{"name": "string", "description": "string"}],
  "challengesAndSolutions": "Technical challenges and solutions",
  "impact": "Concrete impact/benefits",
  "keyFolders": ["3-5 important folder paths"],
  "proofOfWorkSnapshot": {
    "approxLinesOfCode": 0,
    "keyFiles": ["5-15 core files"],
    "mainLanguages": [{"language": "string", "percentage": 0}],
    "recentCommitSummary": [{"message": "string"}]
  }
}`;

export const VC_REPORT_PROMPT = `You are an early-stage VC evaluator. Analyze case study and repo context. Output STRICT JSON only.
Be blunt, realistic, conservative. Scores 0-10. Use only provided info.

CASE STUDY:
{{CASE_STUDY_JSON}}

CONTEXT:
{{REPO_CONTEXT_LIGHT}}

METRICS:
{{REPO_METRICS_JSON}}

OUTPUT (JSON only):
{
  "scores": {
    "problemClarity": {"score": 0, "reason": "1-3 sentences"},
    "solutionStrength": {"score": 0, "reason": "1-3 sentences"},
    "marketPotential": {"score": 0, "reason": "1-3 sentences"},
    "technicalQuality": {"score": 0, "reason": "1-3 sentences"},
    "defensibility": {"score": 0, "reason": "1-3 sentences"},
    "tractionReadiness": {"score": 0, "reason": "1-3 sentences"},
    "executionRisk": {"score": 0, "reason": "1-3 sentences"},
    "overallStartupPotential": {"score": 0, "reason": "1-3 sentences"}
  },
  "narrativeSections": {
    "problemAndUserPain": "Problem & target users (2 paragraphs max)",
    "solutionAndProduct": "How project solves problem (2 paragraphs max)",
    "marketAndCompetition": "Market context, competition (2 paragraphs max)",
    "technologyAndArchitecture": "Tech strengths/weaknesses (2 paragraphs max)",
    "tractionAndValidation": "Usage signals or 'No traction visible'",
    "risksAndGaps": "Biggest blockers & gaps",
    "growthPathAndNextSteps": "Concrete next steps"
  },
  "verdict": "1-2 sentence punchline"
}`;
