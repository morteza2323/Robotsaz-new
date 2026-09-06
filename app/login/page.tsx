import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Admin sign in" };

export default function LoginPage() {
  return <section className="container grid min-h-[calc(100vh-14rem)] place-items-center py-14"><div className="w-full max-w-md rounded-2xl border border-[#d5dad2] bg-white p-7 shadow-[0_22px_60px_rgba(16,32,30,.08)] md:p-10"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#61706b] hover:text-[#10201e]"><ArrowLeft size={16} /> Back to website</Link><p className="eyebrow mt-10">Administration</p><h1 className="mt-4 text-4xl font-extrabold tracking-[-.065em]">Welcome back.</h1><p className="mt-3 text-sm leading-6 text-[#61706b]">Sign in to manage the ForgeWorks project catalogue.</p><LoginForm /></div></section>;
}
