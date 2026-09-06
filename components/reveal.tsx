"use client";

import { motion } from "framer-motion";

export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: .65, delay, ease: [0.22, 1, .36, 1] }}>{children}</motion.div>;
}
