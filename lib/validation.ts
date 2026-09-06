import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(80),
  email: z.string().email("Enter a valid email address"),
  message: z.string().min(12, "Tell us a little more about your project").max(2000),
});

export const projectSchema = z.object({
  kind: z.enum(["industry", "printing"]),
  title: z.string().min(3, "Title must contain at least 3 characters").max(120),
  summary: z.string().min(10, "Summary must contain at least 10 characters").max(240),
  description: z.string().min(20, "Description must contain at least 20 characters").max(5000),
  image: z.string().url("Enter a complete image URL"),
  images: z.array(z.string().url()).min(1, "Add at least one image").max(12),
  videos: z.array(z.object({ id: z.string().min(1), title: z.string().min(1).max(120), status: z.enum(["processing", "ready", "failed"]), embedUrl: z.string().url().optional(), streamUrl: z.string().url().optional(), thumbnailUrl: z.string().url().optional() })).max(3, "A project can have up to 3 videos").default([]),
  tags: z.array(z.string().min(1).max(32)).min(1, "Add at least one tag").max(8),
  featured: z.boolean().default(false),
});

export type ProjectInput = z.infer<typeof projectSchema>;
