"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, LoaderCircle, Mail, Phone } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { CustomPartRequest } from "@/lib/types";

export function AdminCustomPartRequests({ requests: initialRequests }: { requests: CustomPartRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [finishing, setFinishing] = useState<string | null>(null);

  const finish = async (request: CustomPartRequest) => {
    setFinishing(request.id);
    const toastId = toast.loading("Finishing request…");
    try {
      const response = await fetch(`/api/custom-part-requests/${request.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "The request could not be finished.");
      setRequests((current) => current.filter((item) => item.id !== request.id));
      toast.success("Request completed and removed.", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The request could not be finished.", { id: toastId });
    } finally {
      setFinishing(null);
    }
  };

  return (
    <section className="container pb-16">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Custom part requests</h2>
        <span className="rounded-full bg-[#dfe5dc] px-3 py-1 text-xs font-bold">{requests.length} total</span>
      </div>
      <AnimatePresence mode="popLayout">
        {requests.length ? (
          <motion.div layout className="grid gap-5 lg:grid-cols-2">
            {requests.map((request) => (
              <motion.article layout key={request.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .94, y: -16 }} transition={{ duration: .3 }} className="rounded-2xl border border-[#d5dad2] bg-white p-6">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs font-extrabold tracking-[.16em] text-[#607066]">CP-{request.orderNumber}</p>
                    <h3 className="text-lg font-extrabold">{request.name}</h3>
                    <p className="mt-1 text-xs text-[#61706b]">{new Date(request.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="h-fit rounded-full bg-[#e6f4cb] px-2 py-1 text-[.65rem] font-bold uppercase">{request.status}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <a href={`mailto:${request.email}`} className="inline-flex items-center gap-1"><Mail size={14}/>{request.email}</a>
                  <a href={`tel:${request.phone}`} className="inline-flex items-center gap-1"><Phone size={14}/>{request.phone}</a>
                </div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-[#53625b]">{request.description}</p>
                <p className="mt-3 text-xs"><b>Quantity:</b> {request.quantity || "Not specified"} · <b>Material:</b> {request.material || "Not specified"}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {request.files.map((file) => (
                    <a key={file.key} href={`/api/custom-part-requests/files?key=${encodeURIComponent(file.key)}&name=${encodeURIComponent(file.name)}`} className="button button-ghost !px-3 !py-2"><Download size={14}/>{file.name}</a>
                  ))}
                </div>
                <div className="mt-5 border-t border-[#e6e9e3] pt-4">
                  <button disabled={finishing === request.id} onClick={() => finish(request)} className="button button-primary">
                    {finishing === request.id ? <LoaderCircle className="animate-spin" size={16}/> : <Check size={16}/>} {finishing === request.id ? "Finishing…" : "Mark done"}
                  </button>
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-dashed border-[#b9c1b9] bg-white p-10 text-center text-sm text-[#61706b]">No requests yet.</motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
