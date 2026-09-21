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

export async function getProjects(kind?: ProjectKind) {
  const result = kind
    ? await database.query<ProjectRow>(`SELECT ${columns} FROM projects WHERE kind = $1 ORDER BY created_at DESC`, [kind])
    : await database.query<ProjectRow>(`SELECT ${columns} FROM projects ORDER BY created_at DESC`);
  return result.rows.map(mapProject);
}

export async function getFeaturedProjects(kind: ProjectKind) {
  const result = await database.query<ProjectRow>(`SELECT ${columns} FROM projects WHERE kind = $1 AND featured = true ORDER BY created_at DESC LIMIT 6`, [kind]);
  return result.rows.map(mapProject);
}

export async function getProjectBySlug(kind: ProjectKind, slug: string) {
  const result = await database.query<ProjectRow>(`SELECT ${columns} FROM projects WHERE kind = $1 AND slug = $2 LIMIT 1`, [kind, slug]);
  return result.rows[0] ? mapProject(result.rows[0]) : undefined;
}

export async function getProjectById(id: string) {
  const result = await database.query<ProjectRow>(`SELECT ${columns} FROM projects WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] ? mapProject(result.rows[0]) : undefined;
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
  return mapProject(result.rows[0]);
}

export async function updateProject(id: string, input: ProjectInput) {
  const current = await getProjectById(id);
  if (!current) return null;
  const slug = input.title === current.title ? current.slug : await uniqueSlug(input.title, id);
  const values = [slug, input.kind, input.title, input.summary, input.description, input.image, JSON.stringify(input.images), JSON.stringify(input.videos), JSON.stringify(input.tags), input.featured, id];
  const result = await database.query<ProjectRow>(`UPDATE projects SET slug=$1, kind=$2, title=$3, summary=$4, description=$5, image=$6, images=$7::jsonb, videos=$8::jsonb, tags=$9::jsonb, featured=$10 WHERE id=$11 RETURNING ${columns}`, values);
  if (!result.rows[0]) return null;
  return mapProject(result.rows[0]);
}

export async function deleteProject(id: string) {
  const result = await database.query("DELETE FROM projects WHERE id = $1", [id]);
  return Boolean(result.rowCount);
}
