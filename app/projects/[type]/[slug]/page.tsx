import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/project-card";
import { ProjectGallery } from "@/components/project-gallery";
import { ProjectVideos } from "@/components/project-videos";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import { getSiteConfig } from "@/lib/site-config";
import { ProjectKind } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type PageProps = { params: Promise<{ type: string; slug: string }> };

function kindFromRoute(type: string): ProjectKind | null {
  if (type === "industry") return "industry";
  if (type === "3d-printing") return "printing";
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type, slug } = await params;
  const kind = kindFromRoute(type);
  const project = kind ? await getProjectBySlug(kind, slug) : null;
  return { title: project ? project.title : "Project not found" };
}

export const revalidate = 300;

export default async function ProjectDetailPage({ params }: PageProps) {
  const { contactEmail } = getSiteConfig();
  const { type, slug } = await params;
  const kind = kindFromRoute(type);
  if (!kind) notFound();

  const project = await getProjectBySlug(kind, slug);
  if (!project) notFound();

  const related = (await getProjects(kind)).filter((item) => item.id !== project.id).slice(0, 3);
  const listPath = kind === "industry" ? "/projects/industry" : "/projects/3d-printing";
  const subject = encodeURIComponent(`Enquiry about ${project.title}`);
  const galleryImages = project.images.filter((image) => image !== project.image);

  return (
    <>
      <section className="container py-8 md:py-12">
        <Link href={listPath} className="inline-flex items-center gap-2 text-sm font-bold text-[#53625b] hover:text-[#10201e]"><ArrowLeft size={16} /> Back to projects</Link>
      </section>
      <section className="container pb-16 md:pb-24">
        <div className="grid gap-9 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
          <div>
            <p className="eyebrow">{kind === "industry" ? "Industrial project" : "3D printing project"}</p>
            <h1 className="heading mt-5 max-w-2xl text-[clamp(2.7rem,5vw,5.25rem)]">{project.title}</h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#61706b]">{project.summary}</p>
            <div className="mt-7 flex flex-wrap gap-2">{project.tags.map((tag) => <span key={tag} className="rounded-full bg-[#dfe5dc] px-3 py-1.5 text-xs font-bold uppercase tracking-[.08em] text-[#53625b]">{tag}</span>)}</div>
          </div>
          <div className="relative aspect-[1.25] overflow-hidden rounded-2xl bg-[#dfe5dc]"><Image src={project.image} alt={project.title} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" /></div>
        </div>
      </section>
      <section className="border-y border-[#d5dad2] bg-white py-16 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-[1fr_.8fr]">
          <div className="prose-copy max-w-2xl"><p className="eyebrow !mb-5">Project brief</p><h2 className="heading !mb-7 text-[clamp(2rem,3.5vw,3.5rem)]">The work behind the result.</h2><p>{project.description}</p></div>
          <aside className="rounded-2xl bg-[#10201e] p-7 text-white md:p-9">
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#c7f36b]">Have a similar challenge?</p>
            <h2 className="mt-4 text-2xl font-extrabold tracking-[-.05em]">Let&apos;s make it work.</h2>
            <p className="mt-4 text-sm leading-6 text-[#b8c6bf]">Send our projects team a note and we will get back to you with the next practical step.</p>
            <a className="button button-primary mt-7" href={`mailto:${contactEmail}?subject=${subject}`}><Mail size={16} /> Contact us about this project</a>
            <p className="mt-8 border-t border-white/15 pt-4 text-xs text-[#a8b8af]">Published {formatDate(project.createdAt)}</p>
          </aside>
        </div>
      </section>
      {galleryImages.length > 0 && <section className="container py-16 md:py-24"><div className="max-w-2xl"><p className="eyebrow">Project gallery</p><h2 className="heading mt-4">More from the work.</h2><p className="mt-4 body-copy">Select an image for a full-resolution view and browse the gallery with the arrows.</p></div><ProjectGallery images={galleryImages} title={project.title} /></section>}
      {project.videos.length > 0 && <section className="container py-16 md:py-24"><div className="max-w-2xl"><p className="eyebrow">Project videos</p><h2 className="heading mt-4">See the work in motion.</h2><p className="mt-4 body-copy">A closer look at the process and finished result.</p></div><ProjectVideos videos={project.videos} projectId={project.id} /></section>}
      {related.length > 0 && <section className="container py-16 md:py-24"><div className="flex items-end justify-between gap-4"><div><p className="eyebrow">More work</p><h2 className="heading mt-4">Keep exploring.</h2></div><Link href={listPath} className="button button-ghost hidden sm:inline-flex">All projects <ArrowRight size={16} /></Link></div><div className="mt-8 grid gap-5 md:grid-cols-3">{related.map((item) => <ProjectCard key={item.id} project={item} />)}</div></section>}
    </>
  );
}
