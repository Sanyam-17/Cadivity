"use client";

import {
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Instagram,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 mb-12">

          {/* Brand */}
          <div className="space-y-8">
            <Image
              src="/Cadivity.png"
              alt="Cadivity"
              width={160}
              height={64}
              className="h-12 sm:h-14 w-auto bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            />

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Where CAD Automation boosts productivity. Empowering engineering
              teams and individuals to work smarter — not harder.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display font-semibold text-white mb-6 text-lg">
              Services
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              {[
                "CAD Automation",
                "Plugin Development",
                "Workflow Optimization",
                "Data Processing",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/services"
                    className="hover:text-accent hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Training */}
          <div>
            <h3 className="font-display font-semibold text-white mb-6 text-lg">
              Training
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              {[
                "Creo ProToolkit",
                "SolidWorks API",
                "Siemens NX Open",
                "CATIA CAA",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/courses"
                    className="hover:text-accent hover:translate-x-1 transition-all duration-300 inline-block"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-white mb-6 text-lg">
              Contact Us
            </h3>

            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3 group">
                <Mail className="h-5 w-5 text-accent mt-0.5 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <a
                  href="mailto:enquiry@cadivity.com"
                  className="hover:text-white transition-colors duration-300 break-all"
                >
                  enquiry@cadivity.com
                </a>
              </li>

              <li className="flex items-start gap-3 group">
                <Phone className="h-5 w-5 text-accent mt-0.5 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <a
                  href="tel:+916372495858"
                  className="hover:text-white transition-colors duration-300"
                >
                  +91-6372495858
                </a>
              </li>

              <li className="flex items-start gap-3 group">
                <MapPin className="h-5 w-5 text-accent mt-0.5 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span>Available Worldwide</span>
              </li>
            </ul>

            {/* Social */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-accent hover:text-white hover:scale-110 transition-all duration-300"
              >
                <Linkedin className="h-4 w-4" />
              </a>

              <a
                href="https://www.instagram.com/cadivitysolutions?igsh=OW9jazI0NTNyM3B2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-accent hover:text-white hover:scale-110 transition-all duration-300"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center text-xs text-slate-500">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Cadivity. All rights reserved.
          </p>

          <div className="flex justify-center sm:justify-end gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-300">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
