"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import HeroSection from "@/components/landing-page/HeroSection";
import SiteFooter from "@/components/landing-page/SiteFooter";

// Dynamic imports for below-fold sections (code splitting for faster initial load)
const HowItWorksSection = dynamic(
  () => import("@/components/landing-page/HowItWorksSection"),
  { 
    loading: () => <div className="w-full py-24 animate-pulse bg-secondary/10" />,
    ssr: true 
  }
);

const WhyDevHanceSection = dynamic(
  () => import("@/components/landing-page/WhyDevHanceSection"),
  { 
    loading: () => <div className="w-full py-24 animate-pulse bg-secondary/10" />,
    ssr: true 
  }
);

const FeaturesSection = dynamic(
  () => import("@/components/landing-page/FeaturesSection"),
  { 
    loading: () => <div className="w-full py-24 animate-pulse bg-secondary/10" />,
    ssr: true 
  }
);

const CTASection = dynamic(
  () => import("@/components/landing-page/CTASection"),
  { 
    loading: () => <div className="w-full py-24 animate-pulse bg-secondary/10" />,
    ssr: true 
  }
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-primary selection:text-primary-foreground">
      <header className="px-6 h-16 flex items-center border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Image 
            src="/DH Logo.png" 
            alt="DevHance Logo" 
            width={150} 
            height={150}
            priority
            fetchPriority="high"
          />
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="rounded-full btn-secondary-gradient border-none">
                Sign In
              </Button>
            </SignInButton>
            <Link href="/sign-up">
              <Button size="sm" className="rounded-full font-bold btn-primary-gradient">Get Started</Button>
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
        <HeroSection />
        <Suspense fallback={<div className="w-full py-24 animate-pulse bg-secondary/10" />}>
          <HowItWorksSection />
        </Suspense>
        <Suspense fallback={<div className="w-full py-24 animate-pulse bg-secondary/10" />}>
          <WhyDevHanceSection />
        </Suspense>
        <Suspense fallback={<div className="w-full py-24 animate-pulse bg-secondary/10" />}>
          <FeaturesSection />
        </Suspense>
        <Suspense fallback={<div className="w-full py-24 animate-pulse bg-secondary/10" />}>
          <CTASection />
        </Suspense>
      </main>
      
      <SiteFooter />
    </div>
  );
}

