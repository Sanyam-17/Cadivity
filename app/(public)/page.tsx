import type { Metadata } from "next";
import { HomePageContent } from "@/components/home/HomePageContent";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Cadivity",
  url: "https://cadivity.com",
  logo: "https://cadivity.com/Cadivity.png",
  description:
    "Cadivity provides CAD automation services, Creo Toolkit development, SolidWorks API programming, and industry-level CAD automation training.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "enquiry@cadivity.com",
    telephone: "+91-6372495858",
    contactType: "customer service",
  },
  sameAs: [],
};

export default function Home() {
  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <HomePageContent />
    </>
  );
}
