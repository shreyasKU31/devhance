"use client";

import { motion } from "framer-motion";
import { Github, Zap, FileText, Lock } from "lucide-react";

const steps = [
  {
    icon: Github,
    title: "Paste GitHub Link",
    desc: "No manual entry. No drag-and-drop. Just the URL."
  },
  {
    icon: Zap,
    title: "The Extraction Engine",
    desc: "We pull the architecture, tech stack, and complexity metrics instantly."
  },
  {
    icon: FileText,
    title: "The Asset Generation",
    desc: "You get a deployed Case Study page ready to send to clients."
  },
  {
    icon: Lock,
    title: "The Reality Check ($5)",
    desc: "Add the \"Due Diligence\" report to prove your code is investor-ready."
  }
];

export default function HowItWorksSection() {
  return (
    <section className="w-full py-24 bg-secondary/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl mb-4">
            The 30-Second Transformation
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="p-4 bg-background rounded-full shadow-lg border border-border/50">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
