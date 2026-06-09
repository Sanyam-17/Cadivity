import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Cadivity | CAD Automation & Engineering Solutions",
  description:
    "CADIVITY is an engineering solutions provider specializing in CAD automation, workflow optimization, custom plugin development, and professional training.",
  openGraph: {
    title: "About Cadivity | CAD Automation & Engineering Solutions",
    description:
      "CADIVITY is an engineering solutions provider specializing in CAD automation, workflow optimization, custom plugin development, and professional training.",
    url: "https://cadivity.com/about",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
