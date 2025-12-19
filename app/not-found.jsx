import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-background p-4 text-center">
      <Link href="/" className="mb-8">
         <Image src="/DH Logo.png" alt="DevHance" width={150} height={40} className="object-contain" />
      </Link>
      <div className="space-y-6 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center">
          <div className="p-4 bg-muted rounded-full relative">
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
            <FileQuestion className="h-12 w-12 text-primary relative z-10" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
            404
          </h1>
          <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button className="gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
