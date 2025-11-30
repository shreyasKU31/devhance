"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center font-sans">
          <div className="space-y-6 max-w-md w-full">
            <div className="flex justify-center">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Critical System Error
              </h2>
              <p className="text-muted-foreground">
                {error.message || "A critical error occurred in the application root."}
              </p>
            </div>

            <Button onClick={() => reset()} variant="default" className="gap-2">
              <RefreshCcw className="w-4 h-4" />
              Reload Application
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
