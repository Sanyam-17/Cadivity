import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import LoginModal from "@/components/auth/LoginModal";
import { BfcacheGuard } from "@/components/auth/BfcacheGuard";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cadivity.com"),
  title: "CAD Automation Services & Training | Creo, SolidWorks API - Cadivity",
  description:
    "Cadivity provides CAD automation services, Creo Toolkit development, SolidWorks API programming, and industry-level CAD automation training with real-world projects.",
  openGraph: {
    title: "CAD Automation Services & Training | Cadivity",
    description:
      "Cadivity provides CAD automation services, Creo Toolkit development, SolidWorks API programming, and industry-level CAD automation training with real-world projects.",
    url: "https://www.cadivity.com",
    siteName: "Cadivity",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cadivity - CAD Automation Services & Training",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CAD Automation Services & Training | Cadivity",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"
      data-arp="">
      <body className={`${manrope.variable} ${jetbrainsMono.variable}`}>
        {children}
        <BfcacheGuard />
        <Toaster />
        <LoginModal />
      </body>
    </html>
  );
}
