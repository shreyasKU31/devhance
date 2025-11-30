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
              <CardTitle>Overall Readiness</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
              <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-8 border-primary/30">
                <span className="text-4xl font-bold text-primary">{scores.overallScore}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <ScoreRow label="Market Potential" score={scores.marketPotential} />
            <ScoreRow label="Technical Quality" score={scores.technicalQuality} />
            <ScoreRow label="Execution Risk" score={scores.executionRisk} inverse />
            <ScoreRow label="Defensibility" score={scores.defensibility} />
          </div>
        </div>

        {/* Narrative Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard title="Problem & Market" icon={Target}>
             <p className="font-semibold mb-2">Problem:</p>
             <p className="text-sm text-muted-foreground mb-4">{narrativeSections.problem}</p>
             <p className="font-semibold mb-2">Market:</p>
             <p className="text-sm text-muted-foreground">{narrativeSections.market}</p>
          </SectionCard>

          <SectionCard title="Solution & Tech" icon={CheckCircle}>
             <p className="font-semibold mb-2">Solution:</p>
             <p className="text-sm text-muted-foreground mb-4">{narrativeSections.solution}</p>
             <p className="font-semibold mb-2">Technical Assessment:</p>
             <p className="text-sm text-muted-foreground">{narrativeSections.technicalAssessment}</p>
          </SectionCard>

          <SectionCard title="Risks & Moat" icon={AlertTriangle}>
             <p className="font-semibold mb-2">Risks:</p>
             <p className="text-sm text-muted-foreground mb-4">{narrativeSections.risks}</p>
             <p className="font-semibold mb-2">Differentiation:</p>
             <p className="text-sm text-muted-foreground">{narrativeSections.differentiation}</p>
          </SectionCard>

          <SectionCard title="Strategy" icon={Shield}>
             <p className="font-semibold mb-2">Monetization:</p>
             <p className="text-sm text-muted-foreground mb-4">{narrativeSections.monetization}</p>
             <p className="font-semibold mb-2">Recommendations:</p>
             <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
               {narrativeSections.recommendations.map((rec, i) => (
                 <li key={i}>{rec}</li>
               ))}
             </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, score, inverse }) {
  // For inverse (Risk), lower is better visually, but usually score is 0-10.
  // Let's assume 10 is "High Risk" (bad) and 0 is "Low Risk" (good) if inverse?
  // Or usually scores are "Goodness". Let's assume score is "Goodness" (10 = Low Risk).
  // If prompt says "Execution Risk", usually 10 means High Risk.
  // Let's assume standard 0-10 scale where 10 is "High/Strong".
  // So for Risk, 10 is bad.
  
  const value = inverse ? (10 - score) * 10 : score * 10;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium">
        <span>{label}</span>
        <span>{score}/10</span>
      </div>
      <Progress value={value} className="h-2" />
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
