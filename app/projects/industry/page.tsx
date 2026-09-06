import type { Metadata } from "next";
import { ProjectDirectory } from "@/components/project-directory";
import { Reveal } from "@/components/reveal";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = { title: "Industrial projects" };
export const dynamic = "force-dynamic";

export default async function IndustryProjectsPage() {
  const projects = await getProjects("industry");
  return (
    <>
      <section className="container pb-8 pt-16 md:pb-12 md:pt-24">
        <Reveal>
          <p className="eyebrow">Industrial projects</p>
          <h1 className="display mt-5 max-w-5xl">
            Systems made to <span className="text-[#719a2a]">keep moving.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#61706b]">
            Fabrication, automation, safety, and process systems—designed to
            meet the realities of the work around them.
          </p>
        </Reveal>
      </section>
      <ProjectDirectory projects={projects} kindLabel="industrial projects" />
    </>
  );
}
