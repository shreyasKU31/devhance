"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Loader2, ArrowRight } from "lucide-react";

export default function HeroForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const targetUrl = `/case-studies/new?repo=${encodeURIComponent(url)}`;

    if (isSignedIn) {
      router.push(targetUrl);
    } else {
      openSignIn({
        forceRedirectUrl: targetUrl,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto mt-8">
      <div className="relative flex-1">
        <Github className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="https://github.com/username/repo"
          className="pl-10 h-12 text-base bg-background/50 backdrop-blur border-primary/20 focus-visible:ring-primary"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>
      <Button type="submit" size="lg" className="h-12 px-8 font-semibold shadow-lg shadow-primary/20" disabled={loading}>
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate"}
        {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
      </Button>
    </form>
  );
}
