"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const features = [
  "Client-Winning Case Study Page",
  "Visual System Architecture",
  "Automated \"How It Works\" Narrative",
  "Code Velocity & Impact Metrics",
  "\"Why We Built It\" Context Engine",
  "Technical Debt & Security Scan",
  "The Investor \"Buy Box\" Score",
  "Scalability Roadmap",
  "PDF Export for Proposals"
];

export default function FeaturesSection() {
  return (
    <section className="w-full py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            The High-Signal Asset Stack
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/20 transition-colors"
            >
              <div className="bg-primary/10 p-2 rounded-full">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-lg">{feature}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
