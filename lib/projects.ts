import { promises as fs } from "node:fs";
import path from "node:path";
import { Project, ProjectKind } from "@/lib/types";
import { ProjectInput } from "@/lib/validation";
import { slugify } from "@/lib/utils";

const filePath = path.join(process.cwd(), "data", "projects.json");

async function readProjects(): Promise<Project[]> {
  const raw = await fs.readFile(filePath, "utf8");
  return (JSON.parse(raw) as Array<Project & { images?: string[]; videos?: Project["videos"] }>).map((project) => ({
    ...project,
    images: project.images?.length ? project.images : [project.image],
    videos: project.videos || [],
  }));
}

async function saveProjects(projects: Project[]) {
  await fs.writeFile(filePath, JSON.stringify(projects, null, 2) + "\n", "utf8");
}

export async function getProjects(kind?: ProjectKind) {
  const projects = await readProjects();
  return projects
    .filter((project) => !kind || project.kind === kind)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getFeaturedProjects(kind: ProjectKind) {
  const projects = await getProjects(kind);
  return projects.filter((project) => project.featured).slice(0, 6);
}

export async function getProjectBySlug(kind: ProjectKind, slug: string) {
  const projects = await getProjects(kind);
  return projects.find((project) => project.slug === slug);
}

export async function getProjectById(id: string) {
  const projects = await readProjects();
  return projects.find((project) => project.id === id);
}

export async function createProject(input: ProjectInput) {
  const projects = await readProjects();
  const baseSlug = slugify(input.title);
  const slug = makeUniqueSlug(baseSlug, projects);
  const project: Project = {
    ...input,
    id: crypto.randomUUID(),
    slug,
    createdAt: new Date().toISOString(),
  };
  await saveProjects([project, ...projects]);
  return project;
}

export async function updateProject(id: string, input: ProjectInput) {
  const projects = await readProjects();
  const index = projects.findIndex((project) => project.id === id);
  if (index === -1) return null;

  const current = projects[index];
  const desiredSlug = slugify(input.title);
  const slug = desiredSlug === current.slug ? current.slug : makeUniqueSlug(desiredSlug, projects, id);
  const updated: Project = { ...current, ...input, slug };
  projects[index] = updated;
  await saveProjects(projects);
  return updated;
}

export async function deleteProject(id: string) {
  const projects = await readProjects();
  const remaining = projects.filter((project) => project.id !== id);
  if (remaining.length === projects.length) return false;
  await saveProjects(remaining);
  return true;
}

function makeUniqueSlug(baseSlug: string, projects: Project[], excludedId?: string) {
  const safeBase = baseSlug || "untitled-project";
  const used = new Set(projects.filter((project) => project.id !== excludedId).map((project) => project.slug));
  if (!used.has(safeBase)) return safeBase;
  let number = 2;
  while (used.has(`${safeBase}-${number}`)) number += 1;
  return `${safeBase}-${number}`;
}
