import { NextRequest, NextResponse } from "next/server";
import { getProjectById, updateProject } from "@/lib/projects";
import { getProjectVideo } from "@/lib/arvan-vod";

type Context = { params: Promise<{ id: string }> };
export async function POST(_request: NextRequest, { params }: Context) {
  const project = await getProjectById((await params).id);
  if (!project) return NextResponse.json({ message: "Project not found." }, { status: 404 });
  try {
    const videos = await Promise.all(project.videos.map((video) => getProjectVideo(video.id, video.title)));
    const updated = await updateProject(project.id, { kind: project.kind, title: project.title, summary: project.summary, description: project.description, image: project.image, images: project.images, tags: project.tags, featured: project.featured, videos });
    return NextResponse.json(updated);
  } catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Video status could not be refreshed." }, { status: 502 }); }
}
