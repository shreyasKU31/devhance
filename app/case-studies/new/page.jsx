"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewCaseStudyPage() {
  const [status, setStatus] = useState("Initializing...");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const repoParam = searchParams.get("repo");
    if (repoParam) {
      handleAutoSubmit(repoParam);
    } else {
      // If no repo param, redirect back to home
      router.push("/");
    }
  }, [searchParams]);

  const handleAutoSubmit = async (repoUrl) => {
    setStatus("Analyzing Repository...");
    try {
      const res = await fetch("/api/case-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        
        // Handle 429 (Already analyzing) specifically
        if (res.status === 429) {
          toast.warning("Analysis in Progress", {
            description: errorData.error || "You already have an active anlysis running.",
            duration: 5000,
          });
          // Redirect to dashboard after a short delay
          setTimeout(() => router.push("/dashboard"), 3000);
          return;
        }

        throw new Error(errorData.error || "Failed to generate case study");
      }

      const data = await res.json();
      setStatus("Finalizing...");
      toast.success("Case study generated!");
      router.push(`/case-studies/${data.slug}`);
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: error.message || "Something went wrong. Please try again.",
      });
      // On generic error, redirect to home after a delay so user sees the toast
      setTimeout(() => router.push("/"), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background p-4">
      <div className="flex flex-col items-center gap-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{status}</h2>
        <p className="text-muted-foreground max-w-sm">
          We are fetching the repository, analyzing the code with AI, and generating your case study. This may take a few seconds.
        </p>
      </div>
    </div>
  );
}
