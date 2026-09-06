import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { uploadProjectVideo } from "@/lib/arvan-vod";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
  try { const form = await request.formData(); const video = form.get("video"); const title = form.get("title"); if (!(video instanceof File)) return NextResponse.json({ message: "Choose a video." }, { status: 400 }); return NextResponse.json({ video: await uploadProjectVideo(video, typeof title === "string" ? title : video.name) }, { status: 201 }); }
  catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "The video could not be uploaded." }, { status: 400 }); }
}
