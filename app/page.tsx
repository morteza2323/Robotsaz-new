import Link from "next/link";
import { ArrowRight, Award, Boxes, CheckCircle2, Clock3, Layers3, MoveUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { ProjectSlider } from "@/components/project-slider";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { getFeaturedProjects } from "@/lib/projects";
import { CustomPartForm } from "@/components/custom-part-form";

export const revalidate = 300;

const advantages = [
  ["One capable team", "From CAD to installation, a connected team takes ownership of the entire job.", Boxes],
  ["Built for real work", "We choose materials and methods around performance, serviceability, and people.", ShieldCheck],
  ["Fast where it matters", "Clear decisions, rapid prototyping, and direct communication keep projects moving.", Clock3],
];

const trustPoints = ["Transparent project updates", "Quality-led fabrication", "Practical problem solving", "Long-term partnerships"];

export default async function HomePage() {
  const [industry, printing] = await Promise.all([getFeaturedProjects("industry"), getFeaturedProjects("printing")]);
  return (
    <>
      <section className="relative min-h-[min(740px,calc(100svh-4.5rem))] overflow-hidden bg-[#10201e] text-white">
        <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "linear-gradient(90deg, rgba(16,32,30,.85), rgba(16,32,30,.2)), url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2200&q=90')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="grid-noise absolute inset-0 opacity-70" />
        <div className="container relative flex min-h-[min(740px,calc(100svh-4.5rem))] items-end py-14 md:py-20">
          <div className="max-w-4xl">
            <Reveal><p className="eyebrow !text-[#c7f36b]">Industrial ingenuity, made tangible</p></Reveal>
            <Reveal delay={.08}><h1 className="display mt-6">Built for<br /><span className="text-[#c7f36b]">what is next.</span></h1></Reveal>
            <Reveal delay={.16}><p className="mt-7 max-w-xl text-lg leading-8 text-[#d7e0db]">ForgeWorks creates the machinery, systems, prototypes, and production tools that carry ambitious ideas into the real world.</p></Reveal>
            <Reveal delay={.24} className="mt-8 flex flex-wrap gap-3"><Link href="/projects/industry" className="button button-primary">Explore our work <ArrowRight size={17} /></Link><Link href="#custom-part-request" className="button border border-white/30 text-white hover:border-white">Request a custom part</Link></Reveal>
          </div>
          <div className="absolute bottom-7 right-0 hidden text-right md:block"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#c7f36b]">Independent. Precise. Practical.</p><p className="mt-2 text-sm text-[#c3d0c8]">Fabrication + additive manufacturing</p></div>
        </div>
      </section>

      <section className="py-18 md:py-28">
        <div className="container">
          <Reveal><div className="flex flex-col gap-5 border-b border-[#d5dad2] pb-8 md:flex-row md:items-end md:justify-between"><SectionHeading eyebrow="Selected industrial work" title={<>Systems that <em className="not-italic text-[#719a2a]">earn their place.</em></>}><p>Designed for demanding environments, then made with a clear eye on the details that keep operations moving.</p></SectionHeading><Link href="/projects/industry" className="button button-ghost w-fit">View all industry projects <MoveUpRight size={16} /></Link></div></Reveal>
          <div className="mt-8"><ProjectSlider projects={industry} /></div>
        </div>
      </section>

      <section className="bg-[#e6e9e3] py-18 md:py-28">
        <div className="container">
          <Reveal><div className="flex flex-col gap-5 border-b border-[#cbd2ca] pb-8 md:flex-row md:items-end md:justify-between"><SectionHeading eyebrow="Additive manufacturing" title={<>Make the <em className="not-italic text-[#719a2a]">impossible</em> useful.</>}><p>From one-off concept models to robust production fixtures, we print parts that move your thinking forward.</p></SectionHeading><Link href="/projects/3d-printing" className="button button-ghost w-fit">View 3D printing work <MoveUpRight size={16} /></Link></div></Reveal>
          <div className="mt-8"><ProjectSlider projects={printing} /></div>
        </div>
      </section>

      <section className="container py-18 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
          <Reveal><SectionHeading eyebrow="How we work" title={<>Good work starts with <em className="not-italic text-[#719a2a]">good questions.</em></>}><p>We listen closely, surface the essential constraints, then make the path forward clear. It is a practical approach that delivers more dependable results.</p></SectionHeading></Reveal>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-[#d5dad2] bg-[#d5dad2] sm:grid-cols-3">
            {advantages.map(([title, text, Icon], index) => { const AdvantageIcon = Icon as typeof Boxes; return <Reveal key={title as string} delay={index * .08} className="h-full"><div className="h-full bg-white p-6"><AdvantageIcon size={25} className="text-[#719a2a]" /><h3 className="mt-9 text-lg font-extrabold tracking-[-.04em]">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#61706b]">{text as string}</p></div></Reveal>; })}
          </div>
        </div>
      </section>

      <section className="bg-[#10201e] py-18 text-white md:py-28">
        <div className="container grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <Reveal><p className="eyebrow !text-[#c7f36b]">Why trust us</p><h2 className="heading mt-4 max-w-xl">We take responsibility for the result, not just the work order.</h2><p className="mt-6 max-w-xl leading-7 text-[#b9c8c0]">Our clients choose us for the careful thinking before fabrication, the craft during it, and the accountability after handover.</p></Reveal>
          <Reveal delay={.1}><div className="grid gap-3">{trustPoints.map((point) => <div key={point} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-4"><CheckCircle2 size={20} className="shrink-0 text-[#c7f36b]" /><span className="font-bold">{point}</span></div>)}</div></Reveal>
        </div>
      </section>

      <section className="container py-18 md:py-28">
        <div className="grid overflow-hidden rounded-2xl bg-[#dfe5dc] lg:grid-cols-[.9fr_1.1fr]">
          <img src="/factory.avif" alt="ForgeWorks workshop" className="min-h-[300px] h-full w-full object-cover" />
          <Reveal className="p-8 md:p-14"><p className="eyebrow">A short history</p><h2 className="heading mt-4">Made by people who care how things are made.</h2><p className="mt-6 body-copy">ForgeWorks began with a small workshop, a handful of tools, and a belief that industrial work should be both intelligent and honest. Today, we bring fabrication and additive manufacturing together to solve the practical problems behind better products.</p><p className="mt-4 body-copy">We are still hands-on. Still curious. And still happiest when a difficult brief becomes a clean, lasting piece of work.</p><Link href="/about" className="button button-dark mt-7">Our story <ArrowRight size={17} /></Link></Reveal>
        </div>
      </section>

      <section className="container pb-18 md:pb-28">
        <div className="relative overflow-hidden rounded-2xl bg-[#c7f36b] p-8 md:p-14"><div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full border-[28px] border-[#10201e]/10" /><div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end"><div><p className="eyebrow !text-[#506927]">Custom projects, welcome</p><h2 className="heading mt-4 max-w-2xl">Have a difficult thing to make?</h2><p className="mt-4 max-w-lg leading-7 text-[#263724]">Tell us what needs to work better. We will help you find a robust route from idea to finished project.</p></div><Link href="/contact" className="button button-dark w-fit">Talk to our team <ArrowRight size={17} /></Link></div></div>
      </section>
      <section className="container pb-18 md:pb-28"><CustomPartForm /></section>
    </>
  );
}
