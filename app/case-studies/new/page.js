"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Github, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewCaseStudyPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.includes("github.com")) {
      toast.error("Please enter a valid GitHub URL");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/case-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });

      if (!res.ok) throw new Error("Failed to generate case study");

      const data = await res.json();
      toast.success("Case study generated!");
      router.push(`/case-studies/${data.slug}`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-muted/30 p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">New Case Study</CardTitle>
          <CardDescription className="text-center">
            Paste a GitHub repository URL to generate a professional case study.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="https://github.com/username/repo"
                className="pl-9"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Repo...
                </>
              ) : (
                "Generate Case Study"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
