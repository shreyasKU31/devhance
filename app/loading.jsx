import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background p-4">
      <div className="flex flex-col items-center gap-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Loading...</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Preparing your content. This won't take long.
        </p>
      </div>
    </div>
  );
}
