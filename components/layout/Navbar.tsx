"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";
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

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Courses", href: "/courses" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Role-based dashboard link
  const userRole = session?.user ? (session.user as any).role : null;
  const dashboardUrl = userRole === "admin"
    ? "/dashboard/admin"
    : userRole === "instructor"
      ? "/dashboard/instructor"
      : "/dashboard/student";

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo - Always Visible */}
          <Link
            href={session ? dashboardUrl : "/"}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <Image
              src="/Cadivity.png"
              alt="Cadivity Logo"
              width={160}
              height={64}
              className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-1",
                  pathname === item.href
                    ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}

            {isPending ? null : session ? (
              <div className="flex items-center gap-6 lg:gap-8">
                <Link href={dashboardUrl}>
                  <span className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative py-1 cursor-pointer",
                    pathname.startsWith(dashboardUrl)
                      ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                      : "text-muted-foreground"
                  )}>
                    {userRole === "admin" ? "Admin Panel" : "My Batch"}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground py-1 cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Button
                onClick={open}
                size="sm"
                className="text-white shadow-md rounded-full px-6 hover:scale-105 transition-transform"
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            aria-label="Toggle menu"
            className="md:hidden rounded-md p-2 text-muted-foreground hover:text-primary hover:bg-muted transition-all duration-200"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 animate-in fade-in rotate-in" />
            ) : (
              <Menu className="h-6 w-6 animate-in fade-in" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu - Slides from Right */}
      <div
        className={cn(
          "fixed right-0 top-0 z-40 h-full w-80 max-w-[90vw] bg-background shadow-2xl md:hidden",
          "transform transition-transform duration-300 ease-out",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-foreground">Menu</h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-md p-2 text-muted-foreground hover:text-primary hover:bg-muted transition-all"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          <div className="flex flex-col divide-y divide-border">
            {/* Navigation Items */}
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "group px-4 py-3 transition-all duration-200 flex items-center justify-between hover:bg-muted",
                  pathname === item.href ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{item.label}</span>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-x-0 group-hover:translate-x-1" />
              </Link>
            ))}

            {/* Auth Section */}
            <div className="px-4 py-4 space-y-3">
              {isPending ? null : session ? (
                <>
                  <Link
                    href={dashboardUrl}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block px-3 py-2 rounded-lg font-medium transition-all duration-200",
                      pathname.startsWith(dashboardUrl)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {userRole === "admin" ? "Admin Panel" : "My Batch"}
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full px-3 py-2 rounded-lg text-left font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    open();
                  }}
                  className="w-full bg-primary text-white rounded-lg font-medium hover:scale-[1.02] transition-transform"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


