import "server-only";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.ARVAN_ENDPOINT;
const bucket = process.env.ARVAN_BUCKET;
const region = process.env.ARVAN_REGION;
const publicBaseUrl = process.env.ARVAN_PUBLIC_BASE_URL?.replace(/\/$/, "");

function client() {
  const accessKeyId = process.env.ARVAN_ACCESS_KEY;
  const secretAccessKey = process.env.ARVAN_SECRET_KEY;
  if (!accessKeyId || !secretAccessKey || !endpoint || !bucket || !region || !publicBaseUrl) throw new Error("Media storage is not configured.");
  return new S3Client({
    endpoint,
    region,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function storageConfig() {
  if (!bucket || !publicBaseUrl) throw new Error("Media storage is not configured.");
  return { bucket, publicBaseUrl };
}

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

export async function uploadProjectImage(file: File, kind: "industry" | "printing") {
  if (!allowedTypes.has(file.type)) throw new Error("Choose a JPG, PNG, WebP, or AVIF image.");
  if (file.size === 0 || file.size > 8 * 1024 * 1024) throw new Error("Image files must be smaller than 8 MB.");

  const folder = kind === "industry" ? "industrial" : "3d-printing";
  const storage = storageConfig();
  const key = `projects/${folder}/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${extensions[file.type]}`;
  await client().send(new PutObjectCommand({
    Bucket: storage.bucket,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
    CacheControl: "public, max-age=31536000, immutable",
    ACL: "public-read",
  }));
  return `${storage.publicBaseUrl}/${key}`;
}

export async function deleteProjectImage(imageUrl: string) {
  const storage = storageConfig();
  const parsed = new URL(imageUrl);
  const publicOrigin = new URL(storage.publicBaseUrl).origin;
  if (parsed.origin !== publicOrigin) return false;

  const key = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (!key.startsWith("projects/")) return false;
  await client().send(new DeleteObjectCommand({ Bucket: storage.bucket, Key: key }));
  return true;
}

export async function uploadCustomPartFile(orderNumber: number, file: File) {
  const storage = storageConfig();
  const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "attachment";
  const key = `custom-parts/${new Date().getUTCFullYear()}/CP-${orderNumber}/${crypto.randomUUID()}-${safeName}`;
  await client().send(new PutObjectCommand({ Bucket: storage.bucket, Key: key, Body: Buffer.from(await file.arrayBuffer()), ContentType: file.type || "application/octet-stream", ContentDisposition: `attachment; filename="${safeName}"` }));
  return { key, name: file.name, size: file.size, contentType: file.type || "application/octet-stream" };
}

export async function downloadCustomPartFile(key: string) {
  if (!key.startsWith("custom-parts/")) throw new Error("Invalid attachment.");
  const storage = storageConfig();
  return client().send(new GetObjectCommand({ Bucket: storage.bucket, Key: key }));
}

export async function deleteCustomPartFile(key: string) {
  if (!key.startsWith("custom-parts/")) throw new Error("Invalid attachment.");
  const storage = storageConfig();
  await client().send(new DeleteObjectCommand({ Bucket: storage.bucket, Key: key }));
}
