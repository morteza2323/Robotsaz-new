export type ProjectKind = "industry" | "printing";

export type ProjectVideo = {
  id: string;
  title: string;
  status: "processing" | "ready" | "failed";
  embedUrl?: string;
  streamUrl?: string;
  thumbnailUrl?: string;
};

export type Project = {
  id: string;
  slug: string;
  kind: ProjectKind;
  title: string;
  summary: string;
  description: string;
  image: string;
  images: string[];
  videos: ProjectVideo[];
  tags: string[];
  featured: boolean;
  createdAt: string;
};

export const projectKindLabels: Record<ProjectKind, string> = {
  industry: "Industrial Projects",
  printing: "3D Printing Projects",
};
