import Link from "next/link";

const groups = [
  { title: "Explore", links: [["Home", "/"], ["Industrial projects", "/projects/industry"], ["3D printing", "/projects/3d-printing"]] },
  { title: "Company", links: [["About us", "/about"], ["Contact", "/contact"], ["Admin", "/dashboard"]] },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#10201e] py-14 text-[#f4f4ef]">
      <div className="container grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="text-2xl font-black tracking-[-.08em]">FORGEWORKS</div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#b7c3bd]">Industrial problem-solving and additive manufacturing, built with care from first sketch to final install.</p>
          <a href="mailto:hello@forgeworks.example" className="mt-5 inline-block text-sm font-bold text-[#c7f36b]">hello@forgeworks.example</a>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#c7f36b]">{group.title}</p>
            <div className="mt-4 grid gap-3">
              {group.links.map(([label, href]) => <Link key={href} href={href} className="w-fit text-sm text-[#dbe2dc] hover:text-[#c7f36b]">{label}</Link>)}
            </div>
          </div>
        ))}
      </div>
      <div className="container mt-12 border-t border-white/15 pt-5 text-xs text-[#8fa097]">© {new Date().getFullYear()} ForgeWorks. Built for what is next.</div>
    </footer>
  );
}
