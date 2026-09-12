import { readFile } from "node:fs/promises";
import path from "node:path";
import { database } from "@/lib/db";
import { Project, ProjectKind } from "@/lib/types";
import { ProjectInput } from "@/lib/validation";
import { slugify } from "@/lib/utils";

type ProjectRow = {
  id: string;
  slug: string;
  kind: ProjectKind;
  title: string;
  summary: string;
  description: string;
  image: string;
  images: string[];
  videos: Project["videos"];
  tags: string[];
  featured: boolean;
  created_at: Date | string;
};

const columns = "id, slug, kind, title, summary, description, image, images, videos, tags, featured, created_at";
let lastKnownProjects: Project[] | null = null;
let snapshotLoad: Promise<Project[]> | null = null;
let backgroundRefresh: Promise<void> | null = null;
let lastRefreshAttempt = 0;

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    summary: row.summary,
    description: row.description,
    image: row.image,
    images: row.images,
    videos: row.videos,
    tags: row.tags,
    featured: row.featured,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

async function readProjectSnapshot(): Promise<Project[]> {
  const raw = await readFile(path.join(process.cwd(), "data", "projects.json"), "utf8");
  return (JSON.parse(raw) as Array<Project & { images?: string[]; videos?: Project["videos"] }>).map((project) => ({
    ...project,
    images: project.images?.length ? project.images : [project.image],
    videos: project.videos || [],
  }));
}

async function ensureProjectCache() {
  if (lastKnownProjects) return lastKnownProjects;
  if (!snapshotLoad) {
    snapshotLoad = readProjectSnapshot()
      .then((projects) => projects.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)))
      .then((projects) => {
        lastKnownProjects = projects;
        return projects;
      })
      .finally(() => {
        snapshotLoad = null;
      });
  }
  return snapshotLoad;
}

function refreshProjectsInBackground() {
  if (backgroundRefresh || Date.now() - lastRefreshAttempt < 30_000) return;
  lastRefreshAttempt = Date.now();
  backgroundRefresh = database.query<ProjectRow>(`SELECT ${columns} FROM projects ORDER BY created_at DESC`)
    .then((result) => {
      lastKnownProjects = result.rows.map(mapProject);
    })
    .catch(() => undefined)
    .finally(() => {
      backgroundRefresh = null;
    });
}

export async function getProjects(kind?: ProjectKind) {
  const projects = await ensureProjectCache();
  refreshProjectsInBackground();
  return projects.filter((project) => !kind || project.kind === kind);
}

export async function getFeaturedProjects(kind: ProjectKind) {
  return (await getProjects(kind)).filter((project) => project.featured).slice(0, 6);
}

export async function getProjectBySlug(kind: ProjectKind, slug: string) {
  return (await getProjects(kind)).find((project) => project.slug === slug);
}

export async function getProjectById(id: string) {
  return (await getProjects()).find((project) => project.id === id);
}

async function uniqueSlug(title: string, excludedId?: string) {
  const base = slugify(title) || "untitled-project";
  let slug = base;
  let number = 2;
  while ((await database.query("SELECT 1 FROM projects WHERE slug = $1 AND ($2::text IS NULL OR id <> $2) LIMIT 1", [slug, excludedId || null])).rowCount) {
    slug = `${base}-${number++}`;
  }
  return slug;
}

export async function createProject(input: ProjectInput) {
  const id = crypto.randomUUID();
  const slug = await uniqueSlug(input.title);
  const values = [id, slug, input.kind, input.title, input.summary, input.description, input.image, JSON.stringify(input.images), JSON.stringify(input.videos), JSON.stringify(input.tags), input.featured];
  const result = await database.query<ProjectRow>(`INSERT INTO projects (id, slug, kind, title, summary, description, image, images, videos, tags, featured) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11) RETURNING ${columns}`, values);
  const project = mapProject(result.rows[0]);
  lastKnownProjects = [project, ...(lastKnownProjects || []).filter((item) => item.id !== project.id)];
  return project;
}

export async function updateProject(id: string, input: ProjectInput) {
  const current = await getProjectById(id);
  if (!current) return null;
  const slug = input.title === current.title ? current.slug : await uniqueSlug(input.title, id);
  const values = [slug, input.kind, input.title, input.summary, input.description, input.image, JSON.stringify(input.images), JSON.stringify(input.videos), JSON.stringify(input.tags), input.featured, id];
  const result = await database.query<ProjectRow>(`UPDATE projects SET slug=$1, kind=$2, title=$3, summary=$4, description=$5, image=$6, images=$7::jsonb, videos=$8::jsonb, tags=$9::jsonb, featured=$10 WHERE id=$11 RETURNING ${columns}`, values);
  if (!result.rows[0]) return null;
  const project = mapProject(result.rows[0]);
  if (lastKnownProjects) lastKnownProjects = lastKnownProjects.map((item) => item.id === id ? project : item);
  return project;
}

export async function deleteProject(id: string) {
  const result = await database.query("DELETE FROM projects WHERE id = $1", [id]);
  if (result.rowCount && lastKnownProjects) lastKnownProjects = lastKnownProjects.filter((project) => project.id !== id);
  return Boolean(result.rowCount);
}
