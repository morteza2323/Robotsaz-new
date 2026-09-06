"use client";

import { Expand, Play } from "lucide-react";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProjectVideo } from "@/lib/types";

export function ProjectVideos({ videos, projectId }: { videos: ProjectVideo[]; projectId: string }) {
  const router = useRouter();
  useEffect(() => { if (!videos.some((video) => video.status === "processing" || (!video.streamUrl && !video.embedUrl))) return; fetch(`/api/projects/${projectId}/videos/refresh`, { method: "POST" }).then((response) => { if (response.ok) router.refresh(); }).catch(() => undefined); }, [projectId, router, videos]);
  if (!videos.length) return null;
  return <div className="mt-10 grid max-w-5xl gap-7 lg:grid-cols-2">{videos.map((video, index) => <VideoCard key={video.id} video={video} index={index} />)}</div>;
}

function VideoCard({ video, index }: { video: ProjectVideo; index: number }) {
  const frame = useRef<HTMLDivElement>(null);
  const fullscreen = () => frame.current?.requestFullscreen().catch(() => undefined);
  return <article ref={frame} className="overflow-hidden rounded-[1.35rem] border border-[#cbd4c7] bg-[#10201e] shadow-[0_20px_55px_rgba(16,32,30,.15)]"><div className="aspect-video overflow-hidden bg-[#07110f]">{video.embedUrl ? <iframe className="h-full w-full" src={video.embedUrl} title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /> : video.streamUrl ? <video className="h-full w-full object-contain" controls playsInline preload="metadata" poster={video.thumbnailUrl}><source src={video.streamUrl} /></video> : <div className="grid h-full place-items-center text-center text-sm text-[#b8c6bf]"><div><Play className="mx-auto mb-3 text-[#c7f36b]" /><p>{video.status === "processing" ? "Video is being prepared" : "Video playback will be available shortly"}</p></div></div>}</div><div className="flex items-center justify-between gap-4 border-t border-white/10 bg-[#10201e] px-5 py-4 text-white"><div><p className="text-[.65rem] font-bold uppercase tracking-[.16em] text-[#c7f36b]">Project film {String(index + 1).padStart(2, "0")}</p><h3 className="mt-1 font-extrabold tracking-[-.025em]">{video.title || `Project video ${index + 1}`}</h3></div><button type="button" onClick={fullscreen} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs font-bold text-white transition hover:border-[#c7f36b] hover:bg-[#c7f36b] hover:text-[#10201e]"><Expand size={15} /> Fullscreen</button></div></article>;
}
