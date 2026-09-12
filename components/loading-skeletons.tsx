function Block({ className = "" }: { className?: string }) {
  return <div className={`rounded-xl bg-[#dfe5dc] ${className}`} />;
}

export function PageLoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading page" className="motion-safe:animate-pulse">
      <section className="bg-[#10201e] py-20 md:py-28">
        <div className="container">
          <Block className="h-3 w-40 !bg-white/20" />
          <Block className="mt-7 h-14 max-w-2xl !bg-white/15 md:h-20" />
          <Block className="mt-4 h-14 max-w-xl !bg-white/10" />
          <Block className="mt-8 h-12 w-44 !bg-[#c7f36b]/30" />
        </div>
      </section>
      <ProjectGridLoadingSkeleton compact />
    </div>
  );
}

export function ProjectGridLoadingSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <section aria-busy="true" aria-label="Loading projects" className={`container motion-safe:animate-pulse ${compact ? "py-16" : "py-16 md:py-24"}`}>
      <Block className="h-3 w-36" />
      <Block className="mt-5 h-12 max-w-xl" />
      <Block className="mt-4 h-5 max-w-md" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-[#d5dad2] bg-white">
            <Block className="aspect-[1.35] w-full rounded-none" />
            <div className="p-5">
              <Block className="h-5 w-3/4" />
              <Block className="mt-4 h-4 w-full" />
              <Block className="mt-2 h-4 w-2/3" />
              <div className="mt-5 flex gap-2"><Block className="h-7 w-16 rounded-full" /><Block className="h-7 w-20 rounded-full" /></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading dashboard" className="container py-16 motion-safe:animate-pulse md:py-24">
      <Block className="h-3 w-32" />
      <Block className="mt-5 h-14 max-w-md" />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-[#d5dad2] bg-white p-5">
            <Block className="aspect-[1.5] w-full" />
            <Block className="mt-5 h-5 w-3/4" />
            <Block className="mt-3 h-4 w-1/2" />
            <Block className="mt-6 h-10 w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
