import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { deleteCustomPartFile } from "@/lib/arvan";
import { deleteCustomPartRequest, getCustomPartRequest } from "@/lib/custom-part-requests";

type Context = { params: Promise<{ id: string }> };
export async function DELETE(_request: NextRequest, { params }: Context) {
  if (!(await getAdminSession())) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
  const id = (await params).id; const request = await getCustomPartRequest(id);
  if (!request) return NextResponse.json({ message: "Request not found." }, { status: 404 });
  try { await Promise.all(request.files.map((file) => deleteCustomPartFile(file.key))); }
  catch { return NextResponse.json({ message: "The request files could not be removed. Nothing was changed." }, { status: 502 }); }
  if (!(await deleteCustomPartRequest(id))) return NextResponse.json({ message: "Request not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
