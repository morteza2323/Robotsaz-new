"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { loginSchema } from "@/lib/validation";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const submit = async (values: LoginValues) => {
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const data = await response.json();
    if (!response.ok) { toast.error(data.message || "We could not sign you in."); return; }
    toast.success("Welcome back.");
    router.replace("/dashboard");
    router.refresh();
  };
  return <form onSubmit={handleSubmit(submit)} className="mt-8 grid gap-5" noValidate><div><label htmlFor="email" className="label">Email address</label><input id="email" type="email" className="input" autoComplete="email" placeholder="admin@forgeworks.example" {...register("email")} />{errors.email && <p className="error">{errors.email.message}</p>}</div><div><label htmlFor="password" className="label">Password</label><input id="password" type="password" className="input" autoComplete="current-password" placeholder="••••••••" {...register("password")} />{errors.password && <p className="error">{errors.password.message}</p>}</div><button disabled={isSubmitting} className="button button-dark mt-1 w-full disabled:opacity-60">{isSubmitting ? <LoaderCircle className="animate-spin" size={17} /> : <LockKeyhole size={16} />}{isSubmitting ? "Signing in" : "Sign in securely"}</button></form>;
}
