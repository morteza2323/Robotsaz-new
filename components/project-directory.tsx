"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Project } from "@/lib/types";
import { ProjectCard } from "@/components/project-card";

export function ProjectDirectory({ projects, kindLabel }: { projects: Project[]; kindLabel: string }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const tags = ["All", ...Array.from(new Set(projects.flatMap((project) => project.tags)))];
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch = !needle || [project.title, project.summary, project.description, ...project.tags].join(" ").toLowerCase().includes(needle);
      return matchesSearch && (activeTag === "All" || project.tags.includes(activeTag));
    });
  }, [projects, query, activeTag]);
  return (
    <section className="container py-14 md:py-20">
      <div className="grid gap-5 border-y border-[#d5dad2] py-5 md:grid-cols-[1fr_auto] md:items-center">
        <label className="relative block"><input value={query} onChange={(event) => setQuery(event.target.value)} className="input pr-11" placeholder={`Search ${kindLabel.toLowerCase()}...`} /><Search className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#61706b]" size={18} /></label>
        <p className="flex items-center gap-2 text-sm text-[#61706b]"><SlidersHorizontal size={16} /> {results.length} project{results.length === 1 ? "" : "s"}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag) => <button key={tag} onClick={() => setActiveTag(tag)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${tag === activeTag ? "bg-[#10201e] text-white" : "border border-[#d5dad2] hover:border-[#10201e]"}`}>{tag}</button>)}
      </div>
      {results.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{results.map((project) => <ProjectCard key={project.id} project={project} />)}</div> : <div className="mt-9 rounded-2xl border border-dashed border-[#b9c1b9] p-12 text-center"><p className="text-xl font-bold">No projects match that search.</p><button className="mt-4 text-sm font-bold underline" onClick={() => { setQuery(""); setActiveTag("All"); }}>Clear filters</button></div>}
    </section>
  );
}
