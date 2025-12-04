import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, TrendingUp, Shield, Target } from "lucide-react";

async function getVCReport(id, userId) {
  const report = await prisma.vCReport.findUnique({
    where: { id },
    include: { caseStudy: true, user: true },
  });

  if (!report) return null;

  // Ensure user owns the report
  if (report.user.clerkUserId !== userId) {
    return null; // Or handle unauthorized
  }

  return report;
}

export default async function VCReportPage({ params }) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const report = await getVCReport(id, userId);

  if (!report) {
    notFound();
  }

  const { scores, narrativeSections, verdict } = report;

  // Calculate dynamic average
  // Standard scores (Higher is better)
  const standardMetrics = [
    scores.problemClarity,
    scores.solutionStrength,
    scores.marketPotential,
    scores.technicalQuality,
    scores.tractionReadiness,
    scores.defensibility
  ];

  let totalPoints = standardMetrics.reduce((sum, metric) => sum + (metric?.score || 0), 0);

  // Execution Risk (Lower is better, so for potential: 10 - risk)
  const riskScore = scores.executionRisk?.score || 0;
  totalPoints += (10 - riskScore);

  // Average over 7 metrics
  const averageScore = (totalPoints / 7).toFixed(1);

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
            <TrendingUp className="w-4 h-4" />
            VC Investment Memo
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            {report.caseStudy.title}
          </h1>
          <p className="text-xl text-muted-foreground">{verdict}</p>
        </div>

        <Separator />

        {/* Scores */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Overall Potential</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 gap-4">
              <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-8 border-primary/30">
                <span className="text-4xl font-bold text-primary">{averageScore}</span>
              </div>
              <p className="text-center text-sm text-muted-foreground px-4">
                {scores.overallStartupPotential?.reason}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <ScoreRow label="Problem Clarity" data={scores.problemClarity} />
            <ScoreRow label="Solution Strength" data={scores.solutionStrength} />
            <ScoreRow label="Market Potential" data={scores.marketPotential} />
            <ScoreRow label="Technical Quality" data={scores.technicalQuality} />
            <ScoreRow label="Traction / Readiness" data={scores.tractionReadiness} />
            <ScoreRow label="Defensibility" data={scores.defensibility} />
            <ScoreRow label="Execution Risk" data={scores.executionRisk} inverse />
          </div>
        </div>

        {/* Narrative Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard title="Problem & Solution" icon={Target}>
             <p className="font-semibold mb-2">Problem & User Pain:</p>
             <p className="text-sm text-muted-foreground mb-4">{narrativeSections.problemAndUserPain}</p>
             <p className="font-semibold mb-2">Solution & Product:</p>
             <p className="text-sm text-muted-foreground">{narrativeSections.solutionAndProduct}</p>
          </SectionCard>

          <SectionCard title="Market & Tech" icon={CheckCircle}>
             <p className="font-semibold mb-2">Market & Competition:</p>
             <p className="text-sm text-muted-foreground mb-4">{narrativeSections.marketAndCompetition}</p>
             <p className="font-semibold mb-2">Technology & Architecture:</p>
             <p className="text-sm text-muted-foreground">{narrativeSections.technologyAndArchitecture}</p>
          </SectionCard>

          <SectionCard title="Traction & Risks" icon={AlertTriangle}>
             <p className="font-semibold mb-2">Traction & Validation:</p>
             <p className="text-sm text-muted-foreground mb-4">{narrativeSections.tractionAndValidation}</p>
             <p className="font-semibold mb-2">Risks & Gaps:</p>
             <p className="text-sm text-muted-foreground">{narrativeSections.risksAndGaps}</p>
          </SectionCard>

          <SectionCard title="Growth & Next Steps" icon={Shield}>
             <p className="font-semibold mb-2">Growth Path:</p>
             <p className="text-sm text-muted-foreground">{narrativeSections.growthPathAndNextSteps}</p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, data, inverse }) {
  const score = data?.score || 0;
  const reason = data?.reason || "";
  
  // For inverse (Risk), usually 10 means High Risk (bad).
  // We want the progress bar to reflect "goodness" or just magnitude?
  // If it's "Execution Risk", 10/10 is scary.
  // Let's keep it simple: Progress bar fills up to the score.
  // But maybe color code it? (High risk = red?)
  // For now, just standard progress.
  
  const value = score * 10;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span>{score}/10</span>
      </div>
      <Progress value={value} className={`h-2 ${inverse ? "bg-red-100" : ""}`} indicatorClassName={inverse ? "bg-red-500" : ""} />
      <p className="text-xs text-muted-foreground">{reason}</p>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
