"use client";

import Link from "next/link";
import Image from "next/image";
import { Twitter, Github } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="w-full py-12 md:py-16 bg-background border-t border-border">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: The Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
               <Image src="/DH Logo.png" alt="DevHance Logo" width={120} height={120} loading="lazy" className="opacity-90 hover:opacity-100 transition-opacity"/>
            </div>
            <p className="text-muted-foreground font-medium">
              Turn code into leverage.
            </p>
            <p className="text-sm text-muted-foreground">
              Built by <span className="text-foreground font-bold">@DevHance</span> for builders who ship.
            </p>
          </div>

          {/* Column 2: The Product */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">The Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#audit" className="text-muted-foreground hover:text-primary transition-colors">
                  The $5 Audit
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Sample Case Study
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: The Boring Stuff */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">The Boring Stuff</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="mailto:founder@devhance.in" className="text-muted-foreground hover:text-primary transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Socials */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Socials</h3>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-6 h-6" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-6 h-6" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 Devhance. No naked repos allowed.</p>
          <p>Made for High-Signal Developers.</p>
        </div>
      </div>
    </footer>
  );
}
