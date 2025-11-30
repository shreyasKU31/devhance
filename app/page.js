import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, TrendingUp, Github } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 h-16 flex items-center border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <TrendingUp className="w-6 h-6" />
          <span>DevHance</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </SignInButton>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-secondary/20">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Turn Code into <span className="text-primary">Proof</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Instantly generate professional case studies from your GitHub repositories. 
                Get a VC-grade investment report for just $5.
              </p>
            </div>
            <div className="space-y-4 mt-8">
              <SignedOut>
                <div className="flex flex-col items-center gap-4">
                  <p className="text-muted-foreground">Sign in to generate your first case study.</p>
                  <div className="flex gap-4">
                    <SignInButton mode="modal">
                      <Button size="lg" className="font-semibold text-lg px-8 py-6 h-auto">
                        Sign In to Start
                      </Button>
                    </SignInButton>
                    <Link href="/case-studies/example">
                      <Button variant="outline" size="lg" className="font-semibold text-lg px-8 py-6 h-auto">
                        View Example
                      </Button>
                    </Link>
                  </div>
                </div>
              </SignedOut>
              <SignedIn>
                <Link href="/case-studies/new">
                  <Button size="lg" className="font-semibold text-lg px-8 py-6 h-auto">
                    <Github className="mr-2 w-5 h-5" />
                    Paste GitHub Repo
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:gap-16">
              <Card className="border-primary/20 shadow-lg shadow-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <FileText className="w-6 h-6 text-primary" />
                    Free Case Study
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <p>
                    Perfect for portfolios and sharing your work. We analyze your repo and generate:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Project Summary & Architecture</li>
                    <li>Tech Stack & Core Features</li>
                    <li>Challenges & Solutions</li>
                    <li>Proof of Work Metrics</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-primary/20 shadow-lg shadow-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  $5 Only
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    VC Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <p>
                    Investment-grade analysis for founders and serious developers. Includes:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Market Potential Score</li>
                    <li>Technical Due Diligence</li>
                    <li>Execution Risk Assessment</li>
                    <li>Actionable Recommendations</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2024 DevHance. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
