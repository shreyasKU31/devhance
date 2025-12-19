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
    <div className="min-h-screen bg-background pb-12">
      <header className="px-6 h-16 flex items-center border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur z-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary mr-6">
          <TrendingUp className="w-6 h-6" />
          <span>DevHance</span>
        </Link>
        <Link href={`/case-studies/${report.caseStudy.slug}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Case Study
          </Button>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <div className="space-y-4 border-b pb-8">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-xs bg-primary/10 w-fit px-3 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            VC Investment Memo
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            {report.caseStudy.title}
          </h1>
          <p className="text-2xl text-muted-foreground font-light leading-relaxed max-w-3xl">
            "{verdict}"
          </p>
        </div>

        {/* Scores Section */}
        <div className="grid gap-8 md:grid-cols-12">
          {/* Overall Score Card */}
          <Card className="md:col-span-4 border-primary/20 bg-primary/5 h-full flex flex-col justify-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg font-medium text-muted-foreground uppercase tracking-widest">Overall Potential</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 gap-6 flex-1">
              <div className="relative flex items-center justify-center w-40 h-40">
                 {/* SVG Circle for visual flair */}
                 <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary/10" />
                    <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary" strokeDasharray={`${(averageScore / 10) * 440} 440`} strokeLinecap="round" />
                 </svg>
                 <div className="text-center">
                    <span className="text-5xl font-extrabold text-foreground">{averageScore}</span>
                    <span className="text-sm text-muted-foreground block font-medium">/ 10</span>
                 </div>
              </div>
              <p className="text-center text-sm text-muted-foreground px-4 leading-relaxed">
                {scores.overallStartupPotential?.reason}
              </p>
            </CardContent>
          </Card>

          {/* Detailed Scores */}
          <Card className="md:col-span-8">
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                   <Target className="w-5 h-5 text-primary" />
                   Investment Criteria Breakdown
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
               <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                 <ScoreRow label="Problem Clarity" data={scores.problemClarity} />
                 <ScoreRow label="Solution Strength" data={scores.solutionStrength} />
                 <ScoreRow label="Market Potential" data={scores.marketPotential} />
                 <ScoreRow label="Technical Quality" data={scores.technicalQuality} />
                 <ScoreRow label="Traction / Readiness" data={scores.tractionReadiness} />
                 <ScoreRow label="Defensibility" data={scores.defensibility} />
               </div>
               <Separator />
               <ScoreRow label="Execution Risk" data={scores.executionRisk} inverse />
             </CardContent>
          </Card>
        </div>

        {/* Narrative Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SectionCard title="The Opportunity" icon={Lightbulb} className="bg-yellow-50/50 border-yellow-100 dark:bg-yellow-950/10 dark:border-yellow-900/30">
             <div className="space-y-4">
                <div>
                  <p className="font-semibold text-sm mb-1 text-foreground">Problem & User Pain</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{narrativeSections.problemAndUserPain}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1 text-foreground">Solution & Product</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{narrativeSections.solutionAndProduct}</p>
                </div>
             </div>
          </SectionCard>

          <SectionCard title="Market & Tech" icon={CheckCircle} className="bg-blue-50/50 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/30">
             <div className="space-y-4">
                <div>
                  <p className="font-semibold text-sm mb-1 text-foreground">Market & Competition</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{narrativeSections.marketAndCompetition}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1 text-foreground">Tech Stack & Architecture</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{narrativeSections.technologyAndArchitecture}</p>
                </div>
             </div>
          </SectionCard>

          <SectionCard title="Strategic Analysis" icon={Shield} className="bg-purple-50/50 border-purple-100 dark:bg-purple-950/10 dark:border-purple-900/30">
             <div className="space-y-4">
                <div>
                  <p className="font-semibold text-sm mb-1 text-foreground">Traction & Validation</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{narrativeSections.tractionAndValidation}</p>
                </div>
                <Separator className="bg-border/50" />
                <div>
                  <p className="font-semibold text-sm mb-1 text-red-600 dark:text-red-400">Risks & Gaps</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{narrativeSections.risksAndGaps}</p>
                </div>
             </div>
          </SectionCard>
          
           <div className="md:col-span-2 lg:col-span-3">
              <Card className="bg-gradient-to-r from-background to-muted/30">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <TrendingUp className="w-5 h-5 text-green-500" />
                       Growth Path & Next Steps
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                       {narrativeSections.growthPathAndNextSteps}
                    </p>
                 </CardContent>
              </Card>
           </div>
        </div>
      </main>
    </div>
  );
}

function ScoreRow({ label, data, inverse }) {
  const score = data?.score || 0;
  const reason = data?.reason || "";
  
  // Inverse logic: High risk (8/10) means "bad", visually we might want to show it as "danger"
  const percentage = score * 10;
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm font-bold ${inverse ? (score > 6 ? 'text-red-500' : 'text-foreground') : (score > 7 ? 'text-green-600' : 'text-foreground')}`}>
           {score}/10
        </span>
      </div>
      <Progress 
         value={percentage} 
         className={`h-2 ${inverse ? "bg-red-100 dark:bg-red-950/30" : "bg-primary/20"}`} 
         indicatorClassName={inverse ? "bg-red-500" : (score > 8 ? "bg-green-500" : "bg-primary")} 
      />
      <p className="text-xs text-muted-foreground truncate" title={reason}>{reason}</p>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, className }) {
  return (
    <Card className={`h-full ${className} transition-all hover:shadow-md`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="w-5 h-5 opacity-70" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {children}
      </CardContent>
    </Card>
  );
}
