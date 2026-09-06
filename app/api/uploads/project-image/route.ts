import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { uploadProjectImage } from "@/lib/arvan";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const kind = formData.get("kind");
    if (!(image instanceof File)) return NextResponse.json({ message: "Choose an image to upload." }, { status: 400 });
    if (kind !== "industry" && kind !== "printing") return NextResponse.json({ message: "Choose a valid project type." }, { status: 400 });
    return NextResponse.json({ imageUrl: await uploadProjectImage(image, kind) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The image could not be uploaded.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
