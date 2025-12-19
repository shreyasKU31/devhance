import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Code, Layers, Lightbulb, TrendingUp, CheckCircle, Github, AlertTriangle } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import GenerateReportButton from "@/components/GenerateReportButton";
import AutoRefresh from "@/components/AutoRefresh";
import { CaseStudyJsonLd } from "@/components/JsonLd";

async function getCaseStudy(slug) {
  const caseStudy = await prisma.caseStudy.findUnique({
    where: { slug },
    include: { 
      vcReport: true, 
      user: true, 
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
  });
  return caseStudy;
}

// Dynamic SEO metadata for each case study
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);

  if (!caseStudy) {
    return {
      title: "Case Study Not Found",
      description: "The requested case study could not be found.",
    };
  }

  const title = `${caseStudy.title} - Case Study`;
  const description = caseStudy.summary?.slice(0, 160) || 
    `Technical case study for ${caseStudy.title}. Built with ${caseStudy.techStack}`;

  return {
    title,
    description,
    keywords: [
      caseStudy.title,
      ...caseStudy.techStack.split(",").map(t => t.trim()),
      "case study",
      "portfolio",
      "GitHub project",
    ],
    openGraph: {
      title,
      description,
      url: `https://devhance.in/case-studies/${slug}`,
      siteName: "DevHance",
      type: "article",
      publishedTime: caseStudy.createdAt?.toISOString(),
      modifiedTime: caseStudy.updatedAt?.toISOString(),
      authors: [caseStudy.user?.email || "DevHance User"],
      images: [
        {
          url: "/DH Logo.png",
          width: 1200,
          height: 630,
          alt: caseStudy.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/DH Logo.png"],
    },
    alternates: {
      canonical: `https://devhance.in/case-studies/${slug}`,
    },
  };
}

export default async function CaseStudyPage(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { slug } = params;
  const paymentStatus = searchParams.payment;
  const caseStudy = await getCaseStudy(slug);

  if (!caseStudy) {
    notFound();
  }

  const { userId } = await auth();
  const hasVCReport = !!caseStudy.vcReport;
  const hasPaidPayment = caseStudy.payments?.some(p => p.status === "paid");
  const paymentSuccess = searchParams?.payment === "success";

  return (
    <div className="min-h-screen bg-background pb-12">
      <CaseStudyJsonLd caseStudy={caseStudy} />
      <AutoRefresh hasReport={hasVCReport} />
      <header className="px-6 h-16 flex items-center border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur z-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary mr-6">
          <TrendingUp className="w-6 h-6" />
          <span>DevHance</span>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
                {caseStudy.title}
              </h1>
              <a
                href={caseStudy.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                <Github className="w-4 h-4" />
                {caseStudy.repoUrl.replace("https://github.com/", "")}
              </a>
            </div>
            <div className="flex-shrink-0">
              {hasVCReport ? (
                <Link href={`/vc-reports/${caseStudy.vcReport.id}`}>
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                    <TrendingUp className="w-4 h-4" />
                    View VC Report
                  </Button>
                </Link>
              ) : (
                <>
                  {paymentSuccess || hasPaidPayment ? (
                    <div className="text-center bg-muted/30 px-4 py-2 rounded-lg border">
                      <div className="flex items-center gap-2 text-primary font-medium mb-1 justify-center">
                         <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                         Generating Report
                      </div>
                      <p className="text-xs text-muted-foreground">Refresh in ~30s</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <SignedIn>
                        <GenerateReportButton caseStudyId={caseStudy.id} />
                      </SignedIn>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <Button size="lg" className="shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/80">
                            Sign In to Generate Report ($5)
                          </Button>
                        </SignInButton>
                      </SignedOut>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Project Summary */}
          <section className="prose prose-gray dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              Project Summary
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {caseStudy.summary}
            </p>
          </section>

          {/* Problem & Solution Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {caseStudy.problemSummary && (
              <Card className="border-orange-200/50 bg-orange-50/30 dark:bg-orange-950/10 dark:border-orange-900/50 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl text-orange-700 dark:text-orange-400">
                    <AlertTriangle className="w-5 h-5" />
                    The Problem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {caseStudy.problemSummary}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {caseStudy.solutionSummary && (
              <Card className="border-green-200/50 bg-green-50/30 dark:bg-green-950/10 dark:border-green-900/50 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl text-green-700 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    The Solution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {caseStudy.solutionSummary}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tech Stack & Architecture */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="w-5 h-5 text-blue-500" />
                  Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {caseStudy.techStack.split(",").map((tech) => (
                    <Badge key={tech} variant="secondary" className="px-3 py-1 text-sm bg-secondary/50 hover:bg-secondary">
                      {tech.trim()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="w-5 h-5 text-purple-500" />
                  Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {caseStudy.architectureOverview}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Core Features */}
          <div className="bg-card rounded-xl border p-6 shadow-sm">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Core Features
             </h3>
             <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                {caseStudy.coreFeatures?.map((feature, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                       <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground block">
                         {feature.name || (typeof feature === 'string' ? feature : `Feature ${idx + 1}`)}
                      </span>
                      {feature.description && (
                         <span className="text-sm text-muted-foreground">{feature.description}</span>
                      )}
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Challenges & Impact */}
          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-muted/5 rounded-xl p-6 border">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Challenges & Solutions
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {caseStudy.challengesAndSolutions}
              </p>
            </section>
            <section className="bg-muted/5 rounded-xl p-6 border">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Impact
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {caseStudy.impact}
              </p>
            </section>
          </div>

          {/* Proof of Work */}
          <div className="space-y-4">
             <h3 className="text-xl font-bold">Proof of Work</h3>
             <Card className="bg-gradient-to-br from-background to-muted/50 border-border/60">
                <CardContent className="p-8">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      <div className="text-center space-y-1">
                         <div className="text-3xl font-extrabold text-primary tracking-tight">
                            {caseStudy.totalCommits || caseStudy.proofData?.recentCommitSummary?.length || 0}
                         </div>
                         <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Commits</div>
                      </div>
                      <div className="text-center space-y-1">
                         <div className="text-3xl font-extrabold text-primary tracking-tight">
                            {caseStudy.activePeriod || "Unknown"}
                         </div>
                         <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Period</div>
                      </div>
                      <div className="text-center space-y-1">
                         <div className="text-3xl font-extrabold text-primary tracking-tight">
                            {caseStudy.proofData?.approxLinesOfCode ? caseStudy.proofData.approxLinesOfCode.toLocaleString() : "N/A"}
                         </div>
                         <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lines of Code</div>
                      </div>
                      <div className="flex flex-col justify-center gap-2 border-l pl-8">
                         <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Top Languages</div>
                         <div className="flex flex-wrap gap-2">
                            {caseStudy.proofData?.mainLanguages ? (
                               caseStudy.proofData.mainLanguages.slice(0, 3).map((langObj, idx) => (
                                  <Badge key={idx} variant="outline" className="bg-background">
                                     {langObj.language}
                                     <span className="ml-1 opacity-50 text-[10px]">{langObj.percentage}%</span>
                                  </Badge>
                               ))
                            ) : (
                               <span className="text-sm text-muted-foreground">Not available</span>
                            )}
                         </div>
                      </div>
                   </div>
                   
                   {caseStudy.keyFolders && caseStudy.keyFolders.length > 0 && (
                      <div className="mt-8 pt-6 border-t flex flex-wrap items-center gap-3">
                         <span className="font-medium text-sm text-muted-foreground">Key Architecture Folders:</span>
                         {caseStudy.keyFolders.map((folder, idx) => (
                            <code key={idx} className="px-2 py-1 bg-muted rounded text-xs font-mono text-foreground border border-border/50">
                               {folder}
                            </code>
                         ))}
                      </div>
                   )}
                </CardContent>
             </Card>
          </div>

          {/* Report Details Footer */}
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
             <div className="flex flex-col gap-1">
                <span>Generated by <span className="font-medium text-foreground">{caseStudy.user?.email || "Anonymous"}</span></span>
                <span>on {new Date(caseStudy.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
             </div>
             <a href={caseStudy.repoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="gap-2">
                   <Github className="w-4 h-4" />
                   View Repository source
                </Button>
             </a>
          </div>
        </div>
      </main>
    </div>
  );
}