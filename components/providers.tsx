"use client";

import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: "12px", background: "#10201e", color: "#fff" } }} />
    </>
  );
}
