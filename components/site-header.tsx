"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects/industry", label: "Industry" },
  { href: "/projects/3d-printing", label: "3D Printing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-[#d5dad2] bg-[#f4f4ef]/92 backdrop-blur">
      <div className="container flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-black tracking-[-.08em]" aria-label="ForgeWorks home">
          <span className="grid h-7 w-7 place-items-center bg-[#10201e] text-sm text-[#c7f36b]">F</span>
          <span className="text-xl">FORGEWORKS</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={`rounded-full px-3 py-2 text-sm font-semibold transition ${pathname === link.href ? "bg-[#10201e] text-white" : "hover:bg-[#e6e9e3]"}`}>
              {link.label}
            </Link>
          ))}
          <Link href="/dashboard" className="ml-2 rounded-full border border-[#d5dad2] px-3 py-2 text-sm font-semibold hover:border-[#10201e]">Admin</Link>
        </nav>
        <button className="grid h-10 w-10 place-items-center rounded-full border border-[#d5dad2] lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
      {open && (
        <nav className="container grid gap-1 border-t border-[#d5dad2] py-4 lg:hidden" aria-label="Mobile navigation">
          {[...links, { href: "/dashboard", label: "Admin" }].map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-semibold hover:bg-[#e6e9e3]">{link.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
