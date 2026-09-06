import { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="heading mt-4">{title}</h2>
      {children && <div className="mt-5 body-copy">{children}</div>}
    </div>
  );
}
