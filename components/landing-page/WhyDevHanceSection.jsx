"use client";

import { motion } from "framer-motion";

export default function WhyDevHanceSection() {
  return (
    <section className="w-full py-24 bg-secondary/30">
      <div className="container px-4 md:px-6 mx-auto text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Great Code dies in silence.
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Your technical work is invisible to money. Clients don't read code. Investors don't browse commits.Devhance translates your repository into the only language they speak: Proof. Stop being "another random coder." Become a High-Signal Builder.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
