"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home, Terminal } from "lucide-react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background p-6 text-center">
      <div className="space-y-6 max-w-lg w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center">
          <div className="p-4 bg-destructive/10 rounded-full relative">
            <div className="absolute inset-0 bg-destructive/5 blur-xl rounded-full" />
            <AlertTriangle className="h-12 w-12 text-destructive relative z-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {error.name || "Something went wrong!"}
          </h2>
          <p className="text-muted-foreground">
            {error.message || "An unexpected error occurred."}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Dynamic Stack / Details (Collapsible or Box) */}
        {(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_ERRORS === 'true') && error.stack && (
             <div className="bg-muted/50 p-4 rounded-md text-xs font-mono text-muted-foreground overflow-auto max-h-48 text-left border border-border/50 shadow-inner">
               <div className="flex items-center gap-2 mb-2 text-foreground font-semibold">
                 <Terminal className="w-3 h-3" />
                 Stack Trace
               </div>
               <pre className="whitespace-pre-wrap break-words">{error.stack}</pre>
             </div>
        )}

        <div className="flex justify-center gap-4 pt-4">
          <Button onClick={() => reset()} variant="default" className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
