import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: { default: "Robotsaz | Built for what is next", template: "%s | Robotsaz" },
  description: "Industrial fabrication and additive manufacturing for complex ideas.",
  icons:{icon:'/site-logo.PNG'}
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
