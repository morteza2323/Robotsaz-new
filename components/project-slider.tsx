"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Project } from "@/lib/types";
import { ProjectCard } from "@/components/project-card";

export function ProjectSlider({ projects }: { projects: Project[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const visible = projects.length ? [...projects.slice(index), ...projects.slice(0, index)].slice(0, 3) : [];
  const move = (direction: number) => setIndex((current) => (current + direction + projects.length) % projects.length);

  useEffect(() => {
    if (paused || reducedMotion || projects.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % projects.length), 3_000);
    return () => window.clearInterval(timer);
  }, [paused, projects.length, reducedMotion]);

  if (!projects.length) return null;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      <div className="mb-5 flex justify-end gap-2">
        <button onClick={() => move(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-[#d5dad2] hover:border-[#10201e]" aria-label="Previous projects"><ArrowLeft size={18} /></button>
        <button onClick={() => move(1)} className="grid h-10 w-10 place-items-center rounded-full bg-[#10201e] text-[#c7f36b]" aria-label="Next projects"><ArrowRight size={18} /></button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: .35 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((project) => <ProjectCard key={project.id} project={project} />)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
