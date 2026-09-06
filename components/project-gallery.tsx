"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

export function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  const close = () => setActive(null);
  const move = (delta: number) => setActive((current) => current === null ? null : (current + delta + images.length) % images.length);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => { if (active === null) return; if (event.key === "Escape") close(); if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [active, images.length]);
  return <><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{images.map((image, index) => <button key={image} onClick={() => setActive(index)} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#dfe5dc] text-left"><img src={image} alt={`${title} — gallery image ${index + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><span className="absolute inset-0 bg-[#10201e]/0 transition group-hover:bg-[#10201e]/20" /><span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#10201e] opacity-0 transition group-hover:opacity-100">View full image</span></button>)}</div><AnimatePresence>{active !== null && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07110f]/95 p-4" role="dialog" aria-modal="true" aria-label="Image gallery"><button onClick={close} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20" aria-label="Close gallery"><X size={20} /></button><button onClick={() => move(-1)} className="absolute left-3 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 sm:left-7" aria-label="Previous image"><ChevronLeft size={24} /></button><motion.img key={images[active]} initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} src={images[active]} alt={`${title} — full image ${active + 1}`} className="max-h-[88vh] max-w-[86vw] rounded-lg object-contain shadow-2xl" /><button onClick={() => move(1)} className="absolute right-3 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 sm:right-7" aria-label="Next image"><ChevronRight size={24} /></button><p className="absolute bottom-5 text-xs font-bold tracking-[.12em] text-white/75">{active + 1} / {images.length}</p></motion.div>}</AnimatePresence></>;
}
