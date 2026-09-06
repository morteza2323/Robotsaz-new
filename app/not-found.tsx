import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <section className="container grid min-h-[65vh] place-items-center py-16 text-center"><div><p className="text-8xl font-black tracking-[-.1em] text-[#c7f36b]">404</p><h1 className="mt-4 text-4xl font-extrabold tracking-[-.06em]">That page is not on the workshop floor.</h1><p className="mx-auto mt-4 max-w-md text-[#61706b]">The resource may have moved, or you may not have permission to access it.</p><Link href="/" className="button button-dark mt-8"><ArrowLeft size={16} /> Back to home</Link></div></section>;
}
