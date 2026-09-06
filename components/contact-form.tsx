"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { contactSchema } from "@/lib/validation";

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });
  const submit = async (values: ContactValues) => {
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (!response.ok) { toast.error(data.message || "We could not send your message."); return; }
    toast.success(data.message);
    reset();
  };
  return (
    <form onSubmit={handleSubmit(submit)} className={compact ? "grid gap-4" : "grid gap-5"} noValidate>
      <div className={compact ? "grid gap-4 sm:grid-cols-2" : "grid gap-5 sm:grid-cols-2"}>
        <div><label className="label" htmlFor="name">Your name</label><input id="name" className="input" placeholder="Jane Smith" {...register("name")} />{errors.name && <p className="error">{errors.name.message}</p>}</div>
        <div><label className="label" htmlFor="email">Email address</label><input id="email" type="email" className="input" placeholder="jane@company.com" {...register("email")} />{errors.email && <p className="error">{errors.email.message}</p>}</div>
      </div>
      <div><label className="label" htmlFor="message">How can we help?</label><textarea id="message" rows={compact ? 4 : 6} className="input resize-y" placeholder="Tell us about the project you have in mind..." {...register("message")} />{errors.message && <p className="error">{errors.message.message}</p>}</div>
      <button disabled={isSubmitting} className="button button-primary w-fit disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? <LoaderCircle className="animate-spin" size={17} /> : <Send size={16} />}{isSubmitting ? "Sending" : "Send enquiry"}</button>
    </form>
  );
}
