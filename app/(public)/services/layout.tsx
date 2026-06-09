import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CAD Automation Services | Creo, SolidWorks, NX, AutoCAD - Cadivity",
  description:
    "Custom CAD automation services including drawing automation, plugin development, ERP integration, and batch processing across Creo, SolidWorks, NX, CATIA, and AutoCAD.",
  openGraph: {
    title: "CAD Automation Services | Cadivity",
    description:
      "Custom CAD automation services including drawing automation, plugin development, ERP integration, and batch processing.",
    url: "https://cadivity.com/services",
  },
  alternates: {
    canonical: "/services",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
