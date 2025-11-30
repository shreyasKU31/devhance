import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, TrendingUp, Lock } from "lucide-react";

async function getUserCaseStudies(userId) {
  // Find user by clerkUserId first
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) return [];

  return await prisma.caseStudy.findMany({
    where: { userId: user.id },
    include: { vcReport: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const caseStudies = await getUserCaseStudies(userId);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Link href="/case-studies/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Case Study
            </Button>
          </Link>
        </div>

        {caseStudies.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-muted/10 border-dashed">
            <h3 className="text-lg font-medium">No case studies yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate your first case study from a GitHub repo.
            </p>
            <Link href="/case-studies/new">
              <Button variant="outline">Get Started</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <Card key={study.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg truncate" title={study.title}>
                    {study.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {study.summary}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4 bg-muted/20">
                  <Link href={`/case-studies/${study.slug}`}>
                    <Button variant="ghost" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  {study.vcReport ? (
                    <Link href={`/vc-reports/${study.vcReport.id}`}>
                      <Badge variant="default" className="bg-primary hover:bg-primary/90 cursor-pointer">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        VC Report Ready
                      </Badge>
                    </Link>
                  ) : (
                    <Link href={`/case-studies/${study.slug}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                        <Lock className="mr-1 h-3 w-3" />
                        Get Report ($5)
                      </Badge>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
