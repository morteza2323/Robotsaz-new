import { NextRequest, NextResponse } from "next/server";
import { deleteCustomPartFile, uploadCustomPartFile } from "@/lib/arvan";
import { addCustomPartRequest, deleteCustomPartRequest, setCustomPartRequestFiles } from "@/lib/custom-part-requests";
import { allowRequest } from "@/lib/rate-limit";
import { CustomPartFile } from "@/lib/types";
import { customPartRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "model/3mf", "application/vnd.ms-package.3dmanufacturing-3dmodel+xml", "model/stl", "application/sla", "application/step", "model/step", "application/pdf", "application/zip", "application/x-zip-compressed", "application/octet-stream"]);
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "avif", "3mf", "stl", "step", "stp", "pdf", "zip"]);

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (!allowRequest(`custom-part:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
  }

  let requestId: string | null = null;
  const uploaded: CustomPartFile[] = [];

  try {
    const form = await request.formData();
    const parsed = customPartRequestSchema.safeParse(Object.fromEntries(
      ["name", "email", "phone", "description", "quantity", "material", "website"].map((key) => [key, String(form.get(key) || "")] as const),
    ));
    if (!parsed.success || parsed.data.website) {
      return NextResponse.json({ message: "Please check the form details." }, { status: 400 });
    }

    const files = form.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > 10) {
      return NextResponse.json({ message: "You can attach up to 10 files." }, { status: 400 });
    }
    if (files.some((file) => file.size > 50 * 1024 * 1024 || !allowed.has(file.type || "application/octet-stream") || !allowedExtensions.has(file.name.split(".").pop()?.toLowerCase() || ""))) {
      return NextResponse.json({ message: "An attachment type or size is not allowed." }, { status: 400 });
    }

    requestId = crypto.randomUUID();
    const { website: _honeypot, ...details } = parsed.data;
    let record = await addCustomPartRequest({
      id: requestId,
      ...details,
      files: [],
      status: "new",
      createdAt: new Date().toISOString(),
    });

    for (const file of files) uploaded.push(await uploadCustomPartFile(record.orderNumber, file));
    if (uploaded.length) {
      const finalized = await setCustomPartRequestFiles(record.id, uploaded);
      if (!finalized) throw new Error("The request could not be finalized.");
      record = finalized;
    }

    return NextResponse.json({ id: record.id, orderNumber: record.orderNumber }, { status: 201 });
  } catch {
    await Promise.allSettled(uploaded.map((file) => deleteCustomPartFile(file.key)));
    if (requestId) await deleteCustomPartRequest(requestId).catch(() => false);
    return NextResponse.json({ message: "Your request could not be submitted." }, { status: 500 });
  }
}
