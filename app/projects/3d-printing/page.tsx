import type { Metadata } from "next";
import { ProjectDirectory } from "@/components/project-directory";
import { Reveal } from "@/components/reveal";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = { title: "3D printing projects" };
export const dynamic = "force-dynamic";

export default async function PrintingProjectsPage() {
  const projects = await getProjects("printing");
  return <><section className="container pb-8 pt-16 md:pb-12 md:pt-24"><Reveal><p className="eyebrow">3D printing projects</p><h1 className="display mt-5 max-w-5xl">Prototype quickly. <span className="text-[#719a2a]">Make precisely.</span></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[#61706b]">Additive manufacturing for product teams, manufacturers, and designers who need their ideas in hand—and working.</p></Reveal></section><ProjectDirectory projects={projects} kindLabel="3D printing projects" /></>;
}
