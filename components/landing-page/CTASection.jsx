"use client";

import { motion } from "framer-motion";
import HeroForm from "@/components/hero-form";

export default function CTASection() {
  return (
    <section className="w-full py-24 bg-secondary/30">
      <div className="container px-4 md:px-6 mx-auto text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Your Work Deserves Better Than <br />
            <span className="animate-text-gradient">“Check My GitHub.”</span>
          </h2>
          
          <p className="text-xl text-muted-foreground font-medium">
           A naked repo loses the client. A professional case study closes the deal. The choice is yours.
          </p>

          <div className="pt-4 w-full max-w-2xl mx-auto">
            <HeroForm />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
