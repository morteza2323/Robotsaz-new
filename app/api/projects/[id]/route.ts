import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { deleteProject, getProjectById, updateProject } from "@/lib/projects";
import { deleteProjectImage } from "@/lib/arvan";
import { deleteProjectVideo } from "@/lib/arvan-vod";
import { projectSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

function revalidateProjectPages() {
  revalidatePath("/");
  revalidatePath("/projects/industry");
  revalidatePath("/projects/3d-printing");
  revalidatePath("/projects/[type]/[slug]", "page");
}

export async function PUT(request: NextRequest, { params }: Context) {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
  const parsed = projectSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Project data is invalid." }, { status: 400 });
  const id = (await params).id;
  const current = await getProjectById(id);
  if (!current) return NextResponse.json({ message: "Project not found" }, { status: 404 });
  const removedImages = current.images.filter((image) => !parsed.data.images.includes(image));
  const removedVideos = current.videos.filter((video) => !parsed.data.videos.some((next) => next.id === video.id));
  try {
    await Promise.all(removedImages.map(deleteProjectImage));
    await Promise.all(removedVideos.map((video) => deleteProjectVideo(video.id)));
  } catch {
    return NextResponse.json({ message: "A managed project file could not be removed from storage. The project was not updated." }, { status: 502 });
  }
  const updated = await updateProject(id, parsed.data);
  if (!updated) return NextResponse.json({ message: "Project not found" }, { status: 404 });
  revalidateProjectPages();
  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
  const id = (await params).id;
  const project = await getProjectById(id);
  if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 });
  try {
    await Promise.all(Array.from(new Set(project.images)).map(deleteProjectImage));
    await Promise.all(project.videos.map((video) => deleteProjectVideo(video.id)));
  } catch {
    return NextResponse.json({ message: "A project media file could not be removed from storage. The project was not deleted." }, { status: 502 });
  }
  const removed = await deleteProject(id);
  if (!removed) return NextResponse.json({ message: "Project not found" }, { status: 404 });
  revalidateProjectPages();
  return NextResponse.json({ ok: true });
}
