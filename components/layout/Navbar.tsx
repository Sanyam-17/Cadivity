"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut } from "lucide-react";
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
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={session ? dashboardUrl : "/"}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Image
            src="/Cadivity.png"
            alt="Cadivity Logo"
            width={160}
            height={64}
            className="h-10 sm:h-12 lg:h-14 w-auto object-contain"
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
          className="md:hidden rounded-md p-2 text-muted-foreground hover:text-primary hover:bg-muted transition"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 bg-background shadow-lg animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-4 px-6 py-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-base font-medium transition-colors hover:text-primary py-2 border-b last:border-0",
                    pathname === item.href ? "text-primary font-bold" : "text-muted-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {isPending ? null : session ? (
                <div className="space-y-4 pt-2">
                  <Link
                    href={dashboardUrl}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-base font-medium text-muted-foreground hover:text-primary py-2"
                  >
                    {userRole === "admin" ? "Admin Panel" : "My Batch"}
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full text-left text-base font-medium text-muted-foreground hover:text-primary py-2 flex items-center gap-2"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => { setMobileMenuOpen(false); open(); }}
                  className="mt-2 w-full bg-primary text-white rounded-full"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}


