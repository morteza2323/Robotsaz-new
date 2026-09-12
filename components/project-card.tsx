import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Project } from "@/lib/types";

export function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  const href = `/projects/${project.kind === "printing" ? "3d-printing" : "industry"}/${project.slug}`;
  return (
    <Link href={href} className={`group card block ${compact ? "min-w-[280px]" : ""}`}>
      <div className="relative aspect-[1.25] overflow-hidden bg-[#d7ded8]">
        <Image unoptimized src={project.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
        <div className="image-overlay absolute inset-0" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <span className="text-xs font-bold uppercase tracking-[.14em]">{project.kind === "industry" ? "Industrial" : "3D Printing"}</span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#c7f36b] text-[#10201e] transition group-hover:rotate-45"><ArrowUpRight size={18} /></span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2">{project.tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-[#edf0ea] px-2.5 py-1 text-[.65rem] font-bold uppercase tracking-[.08em] text-[#53625b]">{tag}</span>)}</div>
        <h3 className="mt-4 text-xl font-extrabold tracking-[-.045em]">{project.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#61706b]">{project.summary}</p>
      </div>
    </Link>
  );
}
