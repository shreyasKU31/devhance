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

export default async function CaseStudyPage({ params, searchParams }) {
  const { slug } = await params;
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
                {caseStudy.title}
              </h1>
              <a
                href={caseStudy.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary text-sm mt-1 inline-block"
              >
                {caseStudy.repoUrl}
              </a>
            </div>
            <div>
              {hasVCReport ? (
                <Link href={`/vc-reports/${caseStudy.vcReport.id}`}>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    View VC Report
                  </Button>
                </Link>
              ) : (
                <>
                  {paymentSuccess || hasPaidPayment ? (
                    <div className="text-center">
                      <Button disabled className="bg-primary/50 text-primary-foreground cursor-not-allowed">
                        Generating Report... (Refresh in 30s)
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Please wait while we generate your report
                      </p>
                    </div>
                  ) : (
                    <>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                            Sign In to Generate Report ($5)
                          </Button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <GenerateReportButton caseStudyId={caseStudy.id} />
                      </SignedIn>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <section className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <h2 className="text-xl font-semibold mb-3">Project Summary</h2>
              <p className="text-muted-foreground leading-relaxed">
                {caseStudy.summary}
              </p>
            </div>
            {caseStudy.problemSummary && (
              <div className="md:col-span-1 bg-muted/20 p-4 rounded-lg border border-border/50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  The Problem
                </h3>
                <p className="text-sm text-muted-foreground">{caseStudy.problemSummary}</p>
              </div>
            )}
            {caseStudy.solutionSummary && (
              <div className="md:col-span-2 bg-muted/20 p-4 rounded-lg border border-border/50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  The Solution
                </h3>
                <p className="text-sm text-muted-foreground">{caseStudy.solutionSummary}</p>
              </div>
            )}
          </section>

          {/* Tech Stack & Architecture */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="w-5 h-5 text-primary" />
                  Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {caseStudy.techStack.split(",").map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech.trim()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers className="w-5 h-5 text-primary" />
                  Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {caseStudy.architectureOverview}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Core Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="w-5 h-5 text-primary" />
                Core Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid sm:grid-cols-2 gap-2">
                {caseStudy.coreFeatures?.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {feature.name || feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Challenges & Impact */}
          <div className="grid md:grid-cols-2 gap-6">
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Challenges & Solutions
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {caseStudy.challengesAndSolutions}
              </p>
            </section>
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Impact
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {caseStudy.impact}
              </p>
            </section>
          </div>

          {/* Proof of Work */}
          <Card className="bg-muted/30 border-none">
            <CardHeader>
              <CardTitle className="text-base">Proof of Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {caseStudy.totalCommits || caseStudy.proofData?.recentCommitSummary?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Commits</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {caseStudy.activePeriod || "Unknown"}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Period</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {caseStudy.proofData?.approxLinesOfCode ? `~${caseStudy.proofData.approxLinesOfCode}` : "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground">Lines of Code</div>
                </div>
                <div className="col-span-2 sm:col-span-1 text-left pl-4 border-l">
                  <div className="text-xs font-medium mb-1">Top Languages</div>
                  <div className="flex flex-wrap gap-1">
                    {caseStudy.proofData?.mainLanguages ? (
                      caseStudy.proofData.mainLanguages.slice(0, 3).map((langObj, idx) => (
                        <span key={idx} className="text-xs bg-background px-2 py-1 rounded border">
                          {langObj.language}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Not available</span>
                    )}
                  </div>
                </div>
              </div>

              {caseStudy.keyFolders && caseStudy.keyFolders.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground mr-2">Key Folders:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {caseStudy.keyFolders.map((folder, idx) => (
                        <Badge key={idx} variant="outline" className="font-mono text-xs">
                          {folder}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Report Details & Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Generated By</div>
                  <div className="text-sm">{caseStudy.user?.email || "Anonymous"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Generated On</div>
                  <div className="text-sm">
                    {new Date(caseStudy.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <a href={caseStudy.repoUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <Github className="w-4 h-4" />
                    View Repository
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}