"use client";

import {
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Instagram,
  ArrowUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="cad-bg-navy">
      <div className="cad-container cad-section-sm">

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 mb-16">

          {/* Brand */}
          <div className="space-y-6">
            <Image
              src="/Cadivity.png"
              alt="Cadivity"
              width={160}
              height={64}
              className="h-10 sm:h-12 w-auto brightness-0 invert"
            />

            <p className="cad-text-body text-white/40 max-w-[280px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Where CAD Automation boosts productivity. Empowering engineering
              teams and individuals to work smarter — not harder.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="cad-text-mono-12 text-[var(--cad-sky)] mb-6">
              Services
            </h3>
            <ul className="space-y-3">
              {[
                "CAD Automation",
                "Plugin Development",
                "Workflow Optimization",
                "Data Processing",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/services"
                    className="cad-text-mono text-white/50 hover:text-white transition-colors duration-200"
                    style={{ fontSize: '12px', letterSpacing: '0.06em', textTransform: 'none' }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Training */}
          <div>
            <h3 className="cad-text-mono-12 text-[var(--cad-sky)] mb-6">
              Training
            </h3>
            <ul className="space-y-3">
              {[
                "Creo ProToolkit",
                "SolidWorks API",
                "Siemens NX Open",
                "CATIA CAA",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/courses"
                    className="cad-text-mono text-white/50 hover:text-white transition-colors duration-200"
                    style={{ fontSize: '12px', letterSpacing: '0.06em', textTransform: 'none' }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="cad-text-mono-12 text-[var(--cad-sky)] mb-6">
              Contact
            </h3>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-white/30 mt-0.5 shrink-0" strokeWidth={1.5} />
                <a
                  href="mailto:enquiry@cadivity.com"
                  className="text-sm text-white/50 hover:text-white transition-colors duration-200 break-all"
                  style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
                >
                  enquiry@cadivity.com
                </a>
              </li>

              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-white/30 mt-0.5 shrink-0" strokeWidth={1.5} />
                <a
                  href="tel:+916372495858"
                  className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                  style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
                >
                  +91-6372495858
                </a>
              </li>

              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-white/30 mt-0.5 shrink-0" strokeWidth={1.5} />
                <span
                  className="text-sm text-white/50"
                  style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
                >
                  Available Worldwide
                </span>
              </li>
            </ul>

            {/* Social — circular outlined */}
            <div className="flex gap-3 mt-6">
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/40 hover:border-white/40 hover:text-white transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" strokeWidth={1.5} />
              </a>

              <a
                href="https://www.instagram.com/cadivitysolutions?igsh=OW9jazI0NTNyM3B2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/40 hover:border-white/40 hover:text-white transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[var(--cad-hairline-dark)] pt-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <p className="cad-text-mono text-white/30 text-center sm:text-left">
            © {new Date().getFullYear()} Cadivity. All rights reserved.
          </p>

          <p className="cad-text-mono text-white/30 text-center sm:text-right">
            Precision, by design.
          </p>
        </div>

      </div>
    </footer>
  );
}
