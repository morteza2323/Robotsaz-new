import type { Metadata } from "next";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { getSiteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const { contactEmail, contactPhone, contactPhoneHref, companyAddress, businessHours } = getSiteConfig();

  return (
    <>
      <section className="container py-16 md:py-24">
        <Reveal>
          <p className="eyebrow">Contact us</p>
          <h1 className="display mt-5 max-w-4xl">Start with a <span className="text-[#719a2a]">good conversation.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#61706b]">Tell us what you are trying to make, improve, or solve. We will connect you with the right person on our team.</p>
        </Reveal>
      </section>
      <section className="container pb-16 md:pb-24">
        <div className="grid overflow-hidden rounded-2xl border border-[#d5dad2] bg-white lg:grid-cols-[1.1fr_.9fr]">
          <div className="p-7 md:p-11">
            <h2 className="text-3xl font-extrabold tracking-[-.055em]">Send an enquiry</h2>
            <p className="mt-3 text-sm leading-6 text-[#61706b]">We usually respond within one business day.</p>
            <div className="mt-8"><ContactForm /></div>
          </div>
          <aside className="bg-[#10201e] p-7 text-white md:p-11">
            <p className="eyebrow !text-[#c7f36b]">Direct contact</p>
            <div className="mt-8 grid gap-7 text-sm">
              <div className="flex gap-3"><Mail className="shrink-0 text-[#c7f36b]" size={19} /><div><p className="font-bold">Email</p><a href={`mailto:${contactEmail}`} className="mt-1 block text-[#b8c6bf] hover:text-white">{contactEmail}</a></div></div>
              <div className="flex gap-3"><Phone className="shrink-0 text-[#c7f36b]" size={19} /><div><p className="font-bold">Phone</p><a href={`tel:${contactPhoneHref}`} className="mt-1 block text-[#b8c6bf] hover:text-white">{contactPhone}</a></div></div>
              <div className="flex gap-3"><MapPin className="shrink-0 text-[#c7f36b]" size={19} /><div><p className="font-bold">Workshop</p><p className="mt-1 text-[#b8c6bf]">{companyAddress}</p></div></div>
              <div className="flex gap-3"><Clock3 className="shrink-0 text-[#c7f36b]" size={19} /><div><p className="font-bold">Hours</p><p className="mt-1 text-[#b8c6bf]">{businessHours}</p></div></div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
