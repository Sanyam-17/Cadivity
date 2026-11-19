"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { authClient } from "@/lib/auth-client";
import { useSignOut } from "@/hooks/use-signout";

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const handleSignOut = useSignOut();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { open } = useAuthModal();
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: "Services", href: "/services" },
    { label: "Programs", href: "/courses" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Role-based dashboard link
  const userRole = session?.user ? (session.user as any).role : null;
  const dashboardUrl = userRole === "admin"
    ? "/dashboard/admin"
    : userRole === "instructor"
      ? "/dashboard/instructor"
      : "/dashboard/student";

  // Determine if we're on a page with a dark hero
  const darkHeroPages = ["/", "/services", "/courses", "/contact", "/about"];
  const isDarkHero = darkHeroPages.includes(pathname);
  const isTransparent = isDarkHero && !scrolled;

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isTransparent
          ? "bg-gradient-to-b from-[#070B14] via-[#070B14]/85 to-transparent"
          : "border-b bg-[var(--cad-cream)]",
        scrolled && !isTransparent && "border-[var(--cad-hairline)]"
      )}
    >
      <div className="cad-container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link
          href={session ? dashboardUrl : "/"}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
        >
          <Image
            src="/Cadivity.png"
            alt="Cadivity Logo"
            width={160}
            height={64}
            className={cn(
              "h-10 sm:h-12 lg:h-14 w-auto object-contain transition-all",
              isTransparent && "brightness-0 invert"
            )}
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "cad-text-mono transition-colors relative py-1",
                isTransparent
                  ? "text-white/70 hover:text-white"
                  : "text-[var(--cad-muted)] hover:text-[var(--cad-ink)]",
                pathname === item.href && (
                  isTransparent
                    ? "text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-white"
                    : "text-[var(--cad-ink)] after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-[var(--cad-ink)]"
                )
              )}
            >
              {item.label}
            </Link>
          ))}

          {isPending ? null : session ? (
            <>
              <Link href={dashboardUrl}>
                <span className={cn(
                  "cad-text-mono transition-colors relative py-1 cursor-pointer",
                  isTransparent
                    ? "text-white/70 hover:text-white"
                    : "text-[var(--cad-muted)] hover:text-[var(--cad-ink)]",
                  pathname.startsWith(dashboardUrl) && (
                    isTransparent
                      ? "text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-white"
                      : "text-[var(--cad-ink)] after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-[var(--cad-ink)]"
                  )
                )}>
                  {userRole === "admin" ? "Admin Panel" : "My Batch"}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className={cn(
                  "cad-text-mono transition-colors py-1 cursor-pointer",
                  isTransparent
                    ? "text-white/70 hover:text-white"
                    : "text-[var(--cad-muted)] hover:text-[var(--cad-ink)]"
                )}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => open()}
              className={cn(
                "cad-btn",
                isTransparent
                  ? "cad-btn-outline text-white border-white"
                  : "cad-btn-primary"
              )}
            >
              Log in
              <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          aria-label="Toggle menu"
          className={cn(
            "lg:hidden p-2 transition-colors",
            isTransparent
              ? "text-white hover:text-white/80"
              : "text-[var(--cad-ink)] hover:text-[var(--cad-muted)]"
          )}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Full-Screen Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-[var(--cad-navy-950)] flex flex-col">
          {/* Header */}
          <div className="cad-container flex h-20 items-center justify-between">
            <Image
              src="/Cadivity.png"
              alt="Cadivity Logo"
              width={160}
              height={64}
              className="h-10 sm:h-12 w-auto object-contain brightness-0 invert"
              priority
            />
            <button
              aria-label="Close menu"
              className="text-white p-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 cad-container flex flex-col justify-center gap-0">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block py-6 border-b border-[var(--cad-hairline-dark)] transition-colors",
                  "font-[var(--font-manrope)] text-2xl font-light tracking-tight",
                  pathname === item.href ? "text-white" : "text-white/60 hover:text-white"
                )}
                style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {isPending ? null : session ? (
              <div className="pt-6 space-y-4">
                <Link
                  href={dashboardUrl}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-2xl font-light text-white/60 hover:text-white py-4 border-b border-[var(--cad-hairline-dark)]"
                  style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
                >
                  {userRole === "admin" ? "Admin Panel" : "My Batch"}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="block text-2xl font-light text-white/60 hover:text-white py-4 w-full text-left"
                  style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="pt-8">
                <button
                  onClick={() => { setMobileMenuOpen(false); open(); }}
                  className="cad-btn cad-btn-primary w-full"
                >
                  Log in
                  <ArrowUpRight className="h-3.5 w-3.5 cad-arrow" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
