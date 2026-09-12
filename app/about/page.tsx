import type { Metadata } from "next";
import { Award, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { getSiteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "About us" };

const strengths = [
  [
    "Craft with context",
    "Every decision is grounded in the physical world: the workspace, the material, and the people using it.",
    Award,
  ],
  [
    "Open collaboration",
    "You will always know where the project stands, what is changing, and why.",
    Sparkles,
  ],
  [
    "Designed to last",
    "We favour clear details, dependable materials, and solutions that remain serviceable over time.",
    ShieldCheck,
  ],
];

export default function AboutPage() {
  const { companyAddress, mapEmbedUrl } = getSiteConfig();
  return (
    <>
      <section className="container py-16 md:py-24">
        <Reveal>
          <p className="eyebrow">About ForgeWorks</p>
          <h1 className="display mt-5 max-w-5xl">
            A more thoughtful kind of{" "}
            <span className="text-[#719a2a]">industrial partner.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-[#61706b]">
            We combine practical engineering with a maker&apos;s instinct for
            detail, creating machinery, systems, and prototypes that work hard
            and feel right.
          </p>
        </Reveal>
      </section>
      <section className="bg-[#10201e] py-16 text-white md:py-24">
        <div className="container grid gap-10 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <Reveal>
            <img
              src="/plant.avif"
              alt="Welding work in a workshop"
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow !text-[#c7f36b]">Our history</p>
            <h2 className="heading mt-4">
              Started small. Kept the standards high.
            </h2>
            <div className="mt-6 max-w-xl space-y-4 leading-7 text-[#bdcac3]">
              <p>
                ForgeWorks started as a close-knit team taking on the complex
                fabrication work that other shops avoided. Our earliest projects
                taught us to be rigorous, resourceful, and plain-spoken with
                clients.
              </p>
              <p>
                As customer needs evolved, we added digital design and additive
                manufacturing to our workshop capabilities. That lets us bridge
                rapid iteration and robust industrial delivery under one roof.
              </p>
              <p>
                Today, our work reaches manufacturing floors, product teams, and
                innovators who need a partner that understands both the drawing
                and the workbench.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="container py-16 md:py-24">
        <SectionHeading
          eyebrow="Our principles"
          title="Useful by design. Reliable by nature."
        />
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {strengths.map(([title, text, Icon], index) => {
            const StrengthIcon = Icon as typeof Award;
            return (
              <Reveal key={title as string} delay={index * 0.1}>
                <div className="card h-full p-6">
                  <StrengthIcon className="text-[#719a2a]" />
                  <h3 className="mt-10 text-xl font-extrabold tracking-[-.04em]">
                    {title as string}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#61706b]">
                    {text as string}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
      <section className="container pb-16 md:pb-24">
        <div className="overflow-hidden rounded-2xl border border-[#d5dad2] bg-white">
          <div className="grid md:grid-cols-[.9fr_1.1fr]">
            <div className="p-8 md:p-12">
              <p className="eyebrow">Find us</p>
              <h2 className="heading mt-4">Come and see how we work.</h2>
              <p className="mt-5 body-copy">
                Our workshop is set up for design reviews, project
                walk-throughs, and honest conversations about what it will take
                to make something well.
              </p>
              <div className="mt-8 flex gap-3 text-sm">
                <MapPin className="shrink-0 text-[#719a2a]" size={19} />
                <span>
                  <strong>ForgeWorks Studio</strong>
                  <br />
                  {companyAddress}
                </span>
              </div>
            </div>
            <div className="min-h-[320px] bg-[#dfe5dc]">
              <iframe
                title="ForgeWorks location"
                className="h-full min-h-[320px] w-full border-0"
                loading="lazy"
                src={mapEmbedUrl}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
