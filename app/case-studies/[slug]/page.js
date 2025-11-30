import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Code, Layers, Lightbulb, TrendingUp, CheckCircle, Github } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

async function getCaseStudy(slug) {
  const caseStudy = await prisma.caseStudy.findUnique({
    where: { slug },
    include: { vcReport: true, user: true },
  });
  return caseStudy;
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);

  if (!caseStudy) {
    notFound();
  }

  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-background pb-12">
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
              {caseStudy.vcReport ? (
                <Link href={`/vc-reports/${caseStudy.vcReport.id}`}>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    View VC Report
                  </Button>
                </Link>
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
                    <form action="/api/payments/create-checkout" method="POST">
                      <input type="hidden" name="caseStudyId" value={caseStudy.id} />
                      <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                        Generate VC Report ($5)
                      </Button>
                    </form>
                  </SignedIn>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Project Summary</h2>
            <p className="text-muted-foreground leading-relaxed">
              {caseStudy.summary}
            </p>
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
                    {caseStudy.proofData?.recentCommitSummary?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Recent Commits</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {caseStudy.proofData?.keyFiles?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Key Files</div>
                </div>
                <div className="col-span-2 sm:col-span-2 text-left pl-4 border-l">
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
