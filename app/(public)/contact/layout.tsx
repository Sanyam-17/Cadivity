import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Cadivity | CAD Automation Inquiries & Training",
  description:
    "Get in touch with Cadivity for CAD automation services, custom development projects, or training inquiries. We respond within 24 hours.",
  openGraph: {
    title: "Contact Cadivity | CAD Automation Inquiries & Training",
    description:
      "Get in touch with Cadivity for CAD automation services, custom development projects, or training inquiries.",
    url: "https://cadivity.com/contact",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
