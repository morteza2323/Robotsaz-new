import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  metadataBase:new URL('https://www.robotsaz.com'),
  title: {
    default: "Robotsaz | Built for what is next",
    template: "%s | Robotsaz",
  },
  description:
    "Industrial fabrication and additive manufacturing for complex ideas.",
  icons: { icon: "/site-logo.PNG" },
  openGraph: {
    title: "Robotsaz | Robotics & Engineering",
    description:
      "Robotics, industrial problem-solving, additive manufacturing and engineering solutions.",

    url: "https://www.robotsaz.com",
    siteName: "Robotsaz",

    images: [
      {
        url: "/og-image.PNG",
        width: 1200,
        height: 630,
        alt: "Robotsaz - Robotics and Engineering",
      },
    ],

    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
