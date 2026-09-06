"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { AlertTriangle, Check, ImagePlus, LoaderCircle, LogOut, Pencil, Plus, Save, Trash2, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Project, ProjectVideo } from "@/lib/types";

const tagOptions = { industry: ["Automation", "Conveying", "Fabrication", "Machine Guarding", "Steelwork", "Safety", "Process Systems", "Modular", "Engineering"], printing: ["FDM", "Prototyping", "Enclosures", "Fixtures", "Manufacturing Aids", "Nylon", "SLA", "Presentation", "Model Making"] } as const;
const schema = z.object({ kind: z.enum(["industry", "printing"]), title: z.string().min(3), summary: z.string().min(10).max(240), description: z.string().min(20).max(5000), tags: z.array(z.string()).min(1, "Choose at least one tag"), featured: z.boolean() });
type Values = z.infer<typeof schema>;
const blank: Values = { kind: "industry", title: "", summary: "", description: "", tags: [], featured: false };

export function AdminDashboard({ initialProjects, email }: { initialProjects: Project[]; email: string }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects); const [editing, setEditing] = useState<Project | null>(null); const [open, setOpen] = useState(false); const [candidate, setCandidate] = useState<Project | null>(null); const [removing, setRemoving] = useState<string | null>(null);
  const [existing, setExisting] = useState<string[]>([]); const [files, setFiles] = useState<File[]>([]); const [previews, setPreviews] = useState<string[]>([]); const [cover, setCover] = useState<string | null>(null);
  const [videos, setVideos] = useState<ProjectVideo[]>([]); const [videoFiles, setVideoFiles] = useState<File[]>([]); const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const { register, handleSubmit, reset, watch, getValues, setValue, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: blank });
  const kind = watch("kind"); const tags = watch("tags"); const images = [...existing, ...previews];
  const resetImages = () => { setExisting([]); setFiles([]); setPreviews([]); setCover(null); setVideos([]); setVideoFiles([]); setVideoProgress(null); };
  const openNew = () => { setEditing(null); reset(blank); resetImages(); setOpen(true); };
  const openEdit = (project: Project) => { setEditing(project); reset({ kind: project.kind, title: project.title, summary: project.summary, description: project.description, tags: project.tags, featured: project.featured }); setExisting(project.images); setFiles([]); setPreviews([]); setVideos(project.videos); setVideoFiles([]); setCover(project.image); setOpen(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const close = () => { setOpen(false); setEditing(null); reset(blank); resetImages(); };
  const chooseImages = (event: ChangeEvent<HTMLInputElement>) => { const input = Array.from(event.target.files || []); const valid = input.filter((file) => ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) && file.size <= 8 * 1024 * 1024); if (!valid.length) { toast.error("Choose JPG, PNG, WebP, or AVIF images under 8 MB."); return; } if (valid.length !== input.length) toast.error("Unsupported or oversized images were skipped."); const addedPreviews = valid.map((file) => URL.createObjectURL(file)); setFiles((current) => [...current, ...valid]); setPreviews((current) => [...current, ...addedPreviews]); setCover((current) => current || addedPreviews[0]); event.target.value = ""; };
  const removeImage = (image: string) => { const remaining = images.filter((item) => item !== image); if (!remaining.length) { toast.error("A project needs at least one image."); return; } if (existing.includes(image)) setExisting((current) => current.filter((item) => item !== image)); else { const index = previews.indexOf(image); if (index >= 0) { URL.revokeObjectURL(image); setPreviews((current) => current.filter((item) => item !== image)); setFiles((current) => current.filter((_file, fileIndex) => fileIndex !== index)); } } if (cover === image) setCover(remaining[0]); };
  const chooseVideos = (event: ChangeEvent<HTMLInputElement>) => { const chosen = Array.from(event.target.files || []); const valid = chosen.filter((file) => ["video/mp4", "video/webm", "video/quicktime"].includes(file.type) && file.size <= 300 * 1024 * 1024); if (!valid.length) { toast.error("Choose MP4, WebM, or MOV videos under 300 MB."); return; } if (valid.length !== chosen.length) toast.error("Unsupported or oversized videos were skipped."); const remaining = 3 - videos.length - videoFiles.length; if (remaining <= 0) { toast.error("A project can have up to 3 videos."); return; } setVideoFiles((current) => [...current, ...valid.slice(0, remaining)]); if (valid.length > remaining) toast.error("Only the first videos up to the 3-video limit were added."); event.target.value = ""; };
  const uploadVideo = (file: File, title: string) => new Promise<ProjectVideo>((resolve, reject) => { const form = new FormData(); form.append("video", file); form.append("title", title); const request = new XMLHttpRequest(); request.open("POST", "/api/uploads/project-video"); request.upload.onprogress = (event) => { if (event.lengthComputable) setVideoProgress(Math.round((event.loaded / event.total) * 100)); }; request.onerror = () => reject(new Error("The video upload failed.")); request.onload = () => { try { const data = JSON.parse(request.responseText); if (request.status < 200 || request.status >= 300) reject(new Error(data.message || "The video could not be uploaded.")); else resolve(data.video); } catch { reject(new Error("The video upload returned an invalid response.")); } }; request.send(form); });
  const save = async (values: Values) => { if (!images.length) { toast.error("Select at least one image."); return; } const uploadedByPreview = new Map<string, string>(); let uploaded: string[] = [];
    if (files.length) { const id = toast.loading(`Uploading ${files.length} image${files.length > 1 ? "s" : ""}…`); try { for (let index = 0; index < files.length; index += 1) { const form = new FormData(); form.append("image", files[index]); form.append("kind", values.kind); const response = await fetch("/api/uploads/project-image", { method: "POST", body: form }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "An image could not be uploaded."); uploaded.push(data.imageUrl); uploadedByPreview.set(previews[index], data.imageUrl); } toast.success("Images uploaded.", { id }); } catch (error) { toast.error(error instanceof Error ? error.message : "The images could not be uploaded.", { id }); return; } }
    const allImages = [...existing, ...uploaded]; const image = uploadedByPreview.get(cover || "") || cover || allImages[0]; if (!image || !allImages.includes(image)) { toast.error("Choose a cover image."); return; }
    let uploadedVideos: ProjectVideo[] = []; if (videoFiles.length) { const id = toast.loading(`Uploading ${videoFiles.length} video${videoFiles.length > 1 ? "s" : ""}…`); try { for (let index = 0; index < videoFiles.length; index += 1) { setVideoProgress(0); uploadedVideos.push(await uploadVideo(videoFiles[index], `${values.title} — Video ${videos.length + index + 1}`)); } setVideoProgress(null); toast.success("Videos uploaded and are being prepared.", { id }); } catch (error) { setVideoProgress(null); toast.error(error instanceof Error ? error.message : "The videos could not be uploaded.", { id }); return; } }
    const response = await fetch(editing ? `/api/projects/${editing.id}` : "/api/projects", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, image, images: allImages, videos: [...videos, ...uploadedVideos] }) }); const data = await response.json(); if (!response.ok) { toast.error(data.message || "The project could not be saved."); return; } setProjects((current) => editing ? current.map((project) => project.id === editing.id ? data : project) : [data, ...current]); toast.success(editing ? "Project updated." : "Project added."); close(); router.refresh(); };
  const deleteProject = async (project: Project) => { setRemoving(project.id); const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" }); const data = await response.json(); setRemoving(null); if (!response.ok) { toast.error(data.message || "The project could not be removed."); return; } setProjects((items) => items.filter((item) => item.id !== project.id)); setCandidate(null); toast.success("Project removed."); router.refresh(); };
  const kindRegister = register("kind", { onChange: (event) => { const next = event.target.value as keyof typeof tagOptions; setValue("tags", getValues("tags").filter((tag) => tagOptions[next].includes(tag as never))); } });
  return <div className="container py-10 md:py-14">
    <header className="flex flex-col gap-5 border-b border-[#d5dad2] pb-7 md:flex-row md:items-end md:justify-between">
<div>
<p className="eyebrow">Administration</p>
<h1 className="mt-4 text-4xl font-extrabold tracking-[-.065em] md:text-5xl">Project dashboard</h1>
<p className="mt-3 text-sm text-[#61706b]">Signed in as {email}</p>
</div>
<div className="flex gap-2">
<button className="button button-ghost" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/"); }}>
<LogOut size={16} /> Sign out</button>
<button className="button button-primary" onClick={openNew}>
<Plus size={17} /> New project</button>
</div>
</header>
    {open && <section className="mt-8 rounded-2xl border border-[#bfc9bc] bg-white p-5 shadow-sm md:p-8">
<div className="flex items-start justify-between">
<div>
<p className="eyebrow">{editing ? "Update project" : "New project"}</p>
<h2 className="mt-3 text-2xl font-extrabold">{editing?.title || "Add a project"}</h2>
</div>
<button onClick={close} className="grid h-9 w-9 place-items-center rounded-full border border-[#d5dad2]">
<X size={17} />
</button>
</div>
<form onSubmit={handleSubmit(save)} className="mt-7 grid gap-5">
<div className="grid gap-5 md:grid-cols-2">
<Field label="Project type">
<select className="input" {...kindRegister}>
<option value="industry">Industrial project</option>
<option value="printing">3D printing project</option>
</select>
</Field>
<Field label="Title" error={errors.title?.message}>
<input className="input" {...register("title")} />
</Field>
</div>
<Field label="Short summary" error={errors.summary?.message}>
<input className="input" {...register("summary")} />
</Field>
<Field label="Description" error={errors.description?.message}>
<textarea className="input resize-y" rows={5} {...register("description")} />
</Field>
<div className="grid gap-5 md:grid-cols-2">
<Field label="Project images">
<label className="button button-ghost w-fit cursor-pointer">
<ImagePlus size={16} /> Choose images<input className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={chooseImages} />
</label>
<p className="mt-2 text-xs text-[#61706b]">Select a thumbnail as the card cover. Changes are applied when you save.</p>{images.length > 0 && <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{images.map((image, index) => <div key={image} className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 ${cover === image ? "border-[#c7f36b] ring-2 ring-[#10201e]" : "border-[#d5dad2]"}`}>
<button type="button" onClick={() => setCover(image)} className="h-full w-full">
<img src={image} alt={`Project image ${index + 1}`} className="h-full w-full object-cover" />
</button>
<button type="button" onClick={() => removeImage(image)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#10201e]/90 text-white hover:bg-[#b8442a]" aria-label={`Remove image ${index + 1}`}>
<X size={14} />
</button>{cover === image && <span className="absolute inset-x-0 bottom-0 bg-[#10201e]/90 px-2 py-1 text-[.62rem] font-bold uppercase tracking-[.08em] text-[#c7f36b]">Card cover</span>}</div>)}</div>}</Field>
<Field label="Project videos (optional)">
<label className="button button-ghost w-fit cursor-pointer"><Video size={16} /> Choose videos<input className="sr-only" type="file" multiple accept="video/mp4,video/webm,video/quicktime" onChange={chooseVideos} /></label>
<p className="mt-2 text-xs text-[#61706b]">Up to 3 videos. MP4, WebM, or MOV; maximum 300 MB and 2 minutes each.</p>
{videoProgress !== null && <div className="mt-3"><div className="mb-1 flex justify-between text-xs font-bold text-[#53625b]"><span>Uploading</span><span>{videoProgress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#dfe5dc]"><div className="h-full rounded-full bg-[#91bd36] transition-all" style={{ width: `${videoProgress}%` }} /></div></div>}
<div className="mt-3 space-y-2">{videos.map((video) => <div key={video.id} className="flex items-center justify-between rounded-xl border border-[#d5dad2] bg-[#f7f8f5] px-3 py-2 text-sm"><span className="min-w-0 truncate font-bold">{video.title}</span><button type="button" onClick={() => setVideos((current) => current.filter((item) => item.id !== video.id))} className="ml-2 text-[#ab472d]" aria-label={`Remove ${video.title}`}><X size={16} /></button></div>)}{videoFiles.map((video, index) => <div key={`${video.name}-${index}`} className="flex items-center justify-between rounded-xl border border-dashed border-[#bfc9bc] px-3 py-2 text-sm"><span className="min-w-0 truncate">{video.name}</span><button type="button" onClick={() => setVideoFiles((current) => current.filter((_item, itemIndex) => itemIndex !== index))} className="ml-2 text-[#ab472d]" aria-label={`Remove ${video.name}`}><X size={16} /></button></div>)}</div>
</Field>
<Field label="Project tags" error={errors.tags?.message}>
<p className="mb-3 text-xs text-[#61706b]">Choose categories for this project.</p>
<div className="flex flex-wrap gap-2">{tagOptions[kind].map((tag) => { const active = tags.includes(tag); return <button key={tag} type="button" onClick={() => setValue("tags", active ? tags.filter((item) => item !== tag) : [...tags, tag], { shouldValidate: true })} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${active ? "border-[#10201e] bg-[#10201e] text-[#c7f36b]" : "border-[#d5dad2] text-[#53625b]"}`}>{active && <Check className="mr-1 inline-block" size={12} />}{tag}</button>; })}</div>
</Field>
</div>
<label className="flex w-fit items-center gap-3 rounded-lg bg-[#edf0ea] px-3 py-2 text-sm font-bold">
<input type="checkbox" {...register("featured")} /> Show in homepage slider</label>
<div className="flex gap-3">
<button disabled={isSubmitting} className="button button-dark">{isSubmitting ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />}{isSubmitting ? "Saving" : "Save project"}</button>
<button type="button" className="button button-ghost" onClick={close}>Cancel</button>
</div>
</form>
</section>}
    <section className="mt-9">
<div className="mb-4 flex items-center justify-between">
<h2 className="text-xl font-extrabold tracking-[-.04em]">All projects</h2>
<span className="rounded-full bg-[#dfe5dc] px-3 py-1 text-xs font-bold">{projects.length} total</span>
</div>{projects.length ? <div className="grid gap-12">
<ProjectGroup title="Industrial projects" projects={projects.filter((project) => project.kind === "industry")} onEdit={openEdit} onDelete={setCandidate} />
<ProjectGroup title="3D printing projects" projects={projects.filter((project) => project.kind === "printing")} onEdit={openEdit} onDelete={setCandidate} />
</div> : <div className="rounded-2xl border border-dashed border-[#b9c1b9] bg-white p-12 text-center text-sm text-[#61706b]">No projects yet.</div>}</section>
    {candidate && <div className="fixed inset-0 z-[70] grid place-items-center bg-[#10201e]/55 p-4" role="dialog" aria-modal="true">
<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
<div className="flex justify-between">
<div className="grid h-11 w-11 place-items-center rounded-full bg-[#fff0eb] text-[#ab472d]">
<AlertTriangle size={21} />
</div>
<button onClick={() => setCandidate(null)}>
<X size={18} />
</button>
</div>
<h2 className="mt-5 text-2xl font-extrabold">Remove this project?</h2>
<p className="mt-3 text-sm leading-6 text-[#61706b]">“{candidate.title}” and all of its associated media will be permanently removed.</p>
<div className="mt-7 flex gap-3">
<button disabled={removing === candidate.id} onClick={() => deleteProject(candidate)} className="button bg-[#b8442a] text-white">{removing === candidate.id ? <LoaderCircle className="animate-spin" size={16} /> : <Trash2 size={16} />}Remove project</button>
<button className="button button-ghost" onClick={() => setCandidate(null)}>Keep project</button>
</div>
</div>
</div>}
  </div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div>
<label className="label">{label}</label>{children}{error && <p className="error">{error}</p>}</div>; }

function ProjectGroup({ title, projects, onEdit, onDelete }: { title: string; projects: Project[]; onEdit: (project: Project) => void; onDelete: (project: Project) => void }) {
  if (!projects.length) return null;
  return <section>
<div className="mb-5 flex items-center gap-3">
<h3 className="text-lg font-extrabold tracking-[-.04em]">{title}</h3>
<span className="rounded-full bg-[#edf0ea] px-2.5 py-1 text-xs font-bold text-[#53625b]">{projects.length}</span>
</div>
<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{projects.map((project, index) => <motion.article key={project.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35, delay: Math.min(index * .05, .25) }} whileHover={{ y: -5 }} className="group overflow-hidden rounded-2xl border border-[#d5dad2] bg-white">
<div className="relative aspect-[16/9] overflow-hidden">
<img src={project.image} alt={project.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
<span className="absolute left-3 top-3 rounded-full bg-[#10201e] px-2.5 py-1 text-[.65rem] font-bold uppercase tracking-[.09em] text-[#c7f36b]">{project.kind === "printing" ? "3D Printing" : "Industrial"}</span>
</div>
<div className="p-5">
<div className="flex justify-between gap-3">
<h4 className="text-lg font-extrabold">{project.title}</h4>{project.featured ? <span className="rounded-full bg-[#e6f4cb] px-2 py-1 text-[.65rem] font-bold text-[#47691d]">Featured</span> : <span className="text-xs text-[#61706b]">Catalogue</span>}</div>
<div className="mt-4 flex flex-wrap gap-1.5">{project.tags.map((tag) => <span key={tag} className="rounded-full bg-[#edf0ea] px-2 py-1 text-[.62rem] font-bold text-[#53625b]">{tag}</span>)}</div>
<div className="mt-6 flex flex-wrap gap-2 border-t border-[#e6e9e3] pt-4">
<Link href={`/projects/${project.kind === "printing" ? "3d-printing" : "industry"}/${project.slug}`} className="button button-dark flex-1 !px-3 !py-2">View project</Link>
<button onClick={() => onEdit(project)} className="button button-ghost !px-3 !py-2">
<Pencil size={15} /> Edit</button>
<button onClick={() => onDelete(project)} className="button border border-[#edc5b7] !px-3 !py-2 text-[#ab472d]">
<Trash2 size={15} />
</button>
</div>
</div>
</motion.article>)}</div>
</section>;
}
