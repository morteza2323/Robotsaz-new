import "server-only";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.ARVAN_ENDPOINT || "https://s3.ir-thr-at1.arvanstorage.ir";
const bucket = process.env.ARVAN_BUCKET || "robotsaz-portfolio";
const publicBaseUrl = (process.env.ARVAN_PUBLIC_BASE_URL || `https://${bucket}.s3.ir-thr-at1.arvanstorage.ir`).replace(/\/$/, "");

function client() {
  const accessKeyId = process.env.ARVAN_ACCESS_KEY;
  const secretAccessKey = process.env.ARVAN_SECRET_KEY;
  if (!accessKeyId || !secretAccessKey) throw new Error("Arvan object storage is not configured.");
  return new S3Client({
    endpoint,
    region: "ir-thr-at1",
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

export async function uploadProjectImage(file: File, kind: "industry" | "printing") {
  if (!allowedTypes.has(file.type)) throw new Error("Choose a JPG, PNG, WebP, or AVIF image.");
  if (file.size === 0 || file.size > 8 * 1024 * 1024) throw new Error("Image files must be smaller than 8 MB.");

  const folder = kind === "industry" ? "industrial" : "3d-printing";
  const key = `projects/${folder}/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${extensions[file.type]}`;
  await client().send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
    CacheControl: "public, max-age=31536000, immutable",
    ACL: "public-read",
  }));
  return `${publicBaseUrl}/${key}`;
}

export async function deleteProjectImage(imageUrl: string) {
  const parsed = new URL(imageUrl);
  const publicOrigin = new URL(publicBaseUrl).origin;
  if (parsed.origin !== publicOrigin) return false;

  const key = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (!key.startsWith("projects/")) return false;
  await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  return true;
}
