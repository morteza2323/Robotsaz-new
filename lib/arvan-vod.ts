import "server-only";
import { ProjectVideo } from "@/lib/types";

const maxVideoBytes = 300 * 1024 * 1024;
const allowedTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function config() {
  const apiKey = process.env.ARVAN_VOD_API_KEY; const apiBase = process.env.ARVAN_VOD_API_BASE; const channelName = process.env.ARVAN_VOD_CHANNEL_NAME;
  if (!apiKey || !apiBase || !channelName) throw new Error("Video service is not configured.");
  return { apiKey, apiBase: apiBase.replace(/\/$/, ""), channelName };
}

function headers(apiKey: string) { return { Authorization: `Apikey ${apiKey}` }; }

async function responseJson(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((body as { message?: string }).message || "Arvan VOD rejected the request.");
  return body as Record<string, unknown>;
}

async function channelId() {
  const { apiKey, apiBase, channelName } = config();
  const response = await fetch(`${apiBase}/channels?filter=${encodeURIComponent(channelName)}`, { headers: headers(apiKey), cache: "no-store" });
  const body = await responseJson(response);
  const candidates = (body.data || body) as unknown;
  const items = Array.isArray(candidates) ? candidates : (candidates as { data?: unknown[] }).data || [];
  const match = (items as Array<{ id?: string; title?: string; name?: string }>).find((item) => item.title === channelName || item.name === channelName) || (items as Array<{ id?: string }>)[0];
  if (!match?.id) throw new Error("The configured Arvan VOD channel could not be found.");
  return match.id;
}

export async function uploadProjectVideo(file: File, title: string): Promise<ProjectVideo> {
  if (!allowedTypes.has(file.type)) throw new Error("Choose an MP4, WebM, or MOV video.");
  if (file.size > maxVideoBytes) throw new Error("Videos must be 300 MB or smaller.");
  const { apiKey, apiBase } = config(); const channel = await channelId();
  const metadata = `filename ${Buffer.from(file.name).toString("base64")},filetype ${Buffer.from(file.type).toString("base64")}`;
  const create = await fetch(`${apiBase}/channels/${channel}/files`, { method: "POST", headers: { ...headers(apiKey), "tus-resumable": "1.0.0", "upload-length": String(file.size), "upload-metadata": metadata } });
  if (!create.ok) throw new Error("Arvan VOD could not create an upload.");
  const location = create.headers.get("location");
  if (!location) throw new Error("Arvan VOD did not return an upload location.");
  const uploadUrl = new URL(location, apiBase).toString();
  const upload = await fetch(uploadUrl, { method: "PATCH", headers: { ...headers(apiKey), "tus-resumable": "1.0.0", "upload-offset": "0", "content-type": "application/offset+octet-stream" }, body: await file.arrayBuffer() });
  if (!upload.ok) throw new Error("The video could not be sent to Arvan VOD.");
  const fileId = uploadUrl.split("/").filter(Boolean).pop();
  if (!fileId) throw new Error("Arvan VOD did not return a file id.");
  const videoResponse = await fetch(`${apiBase}/channels/${channel}/videos`, { method: "POST", headers: { ...headers(apiKey), "content-type": "application/json" }, body: JSON.stringify({ title, file_id: fileId, convert_mode: "auto" }) });
  const body = await responseJson(videoResponse); const video = (body.data || body) as Record<string, unknown>;
  const id = String(video.id || ""); if (!id) throw new Error("Arvan VOD did not return a video id.");
  return { id, title, status: "processing", embedUrl: typeof video.embed_url === "string" ? video.embed_url : undefined, streamUrl: typeof video.stream_url === "string" ? video.stream_url : typeof video.video_url === "string" ? video.video_url : undefined, thumbnailUrl: typeof video.thumbnail_url === "string" ? video.thumbnail_url : undefined };
}

export async function deleteProjectVideo(videoId: string) {
  const { apiKey, apiBase } = config();
  const response = await fetch(`${apiBase}/videos/${encodeURIComponent(videoId)}`, { method: "DELETE", headers: headers(apiKey) });
  await responseJson(response);
}

export async function getProjectVideo(videoId: string, fallbackTitle: string): Promise<ProjectVideo> {
  const { apiKey, apiBase } = config();
  const response = await fetch(`${apiBase}/videos/${encodeURIComponent(videoId)}`, { headers: headers(apiKey), cache: "no-store" });
  const body = await responseJson(response); const video = (body.data || body) as Record<string, unknown>;
  const rawStatus = String(video.status || video.state || "processing").toLowerCase();
  const streamUrl = [video.hls_url, video.stream_url, video.play_url, video.mp4_url, video.video_url].find((value): value is string => typeof value === "string" && value.startsWith("http"));
  const embedUrl = [video.embed_url, video.player_url, video.iframe_url].find((value): value is string => typeof value === "string" && value.startsWith("http"));
  const thumbnailUrl = [video.thumbnail_url, video.poster_url, video.thumbnail].find((value): value is string => typeof value === "string" && value.startsWith("http"));
  const ready = Boolean(streamUrl || embedUrl) && !["processing", "pending", "queued", "converting", "failed", "error"].includes(rawStatus);
  return { id: videoId, title: typeof video.title === "string" ? video.title : fallbackTitle, status: ["failed", "error"].includes(rawStatus) ? "failed" : ready ? "ready" : "processing", streamUrl, embedUrl, thumbnailUrl };
}
