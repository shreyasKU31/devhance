"use client";

import { motion, useReducedMotion } from "framer-motion";
import HeroForm from "@/components/hero-form";
import BGGradient from "./bgGradient";

export default function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      };

  return (
    <section 
      className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center pb-32 pt-10 bg-background relative overflow-hidden"
      aria-label="Hero section"
    >
      <BGGradient/>
      <div className="container px-4 md:px-6 mx-auto text-center z-10">
        <motion.div 
          {...animationProps}
          className="space-y-8 max-w-5xl mx-auto"
        >
          <h1 className="text-5xl w-full font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl uppercase leading-none text-foreground">
            Stop Sending <br />
            <span className="animate-text-gradient">Ugly GitHub Links.</span>
          </h1>
          
          <h2 className="text-xl md:text-2xl font-bold text-foreground/80 max-w-3xl mx-auto">
            Your code is genius. Your presentation is costing you money. We fix it in 30 seconds.
          </h2>

          <p className="mx-auto max-w-[800px] text-muted-foreground md:text-lg font-medium leading-relaxed">
            DevHance turns your raw repositories into client-winning Case Studies and investor-grade Technical Audits. You build great software, but you're terrible at selling it. Let our AI translate your messy code into undeniable business results. Don't let your hard work get ignored. Make it impossible to reject.
          </p>

          <div className="pt-8 w-full max-w-2xl mx-auto">
            <HeroForm />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

