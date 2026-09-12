import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { createProject, getProjects } from "@/lib/projects";
import { projectSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const projects = await getProjects(type === "industry" || type === "printing" ? type : undefined);
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
  const parsed = projectSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Project data is invalid." }, { status: 400 });
  const project = await createProject(parsed.data);
  revalidatePath("/");
  revalidatePath("/projects/industry");
  revalidatePath("/projects/3d-printing");
  return NextResponse.json(project, { status: 201 });
}
