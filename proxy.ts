import { NextRequest, NextResponse } from "next/server";

/**
 * Adds no-cache headers to prevent browser back-button from showing
 * stale protected pages after logout or role switch.
 */
function withNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session token from cookies (better-auth stores it as "better-auth.session_token")
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // If no session token, redirect protected routes to home
  if (!sessionToken) {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/dashboard/admin")
    ) {
      return withNoCacheHeaders(NextResponse.redirect(new URL("/", request.url)));
    }
    return withNoCacheHeaders(NextResponse.next());
  }

  // For authenticated users, fetch session to get role
  // Use the internal API to validate the session
  try {
    const sessionRes = await fetch(
      `${request.nextUrl.origin}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (!sessionRes.ok) {
      // Session invalid — redirect to home for protected routes
      if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/dashboard/admin")
      ) {
        return withNoCacheHeaders(NextResponse.redirect(new URL("/", request.url)));
      }
      return withNoCacheHeaders(NextResponse.next());
    }

    const session = await sessionRes.json();
    const role = session?.user?.role || "student";

    // Admin routes — admin only
    if (pathname.startsWith("/dashboard/admin")) {
      if (role !== "admin") {
        const dest =
          role === "instructor"
            ? "/dashboard/instructor"
            : "/dashboard/student";
        return withNoCacheHeaders(NextResponse.redirect(new URL(dest, request.url)));
      }
    }

    // Instructor dashboard — instructor or admin
    if (pathname.startsWith("/dashboard/instructor")) {
      if (role !== "instructor" && role !== "admin") {
        const dest =
          role === "admin" ? "/dashboard/admin" : "/dashboard/student";
        return withNoCacheHeaders(NextResponse.redirect(new URL(dest, request.url)));
      }
    }

    // Student dashboard — student only
    if (pathname.startsWith("/dashboard/student")) {
      if (role !== "student") {
        const dest =
          role === "admin"
            ? "/dashboard/admin"
            : `/dashboard/${role}`;
        return withNoCacheHeaders(NextResponse.redirect(new URL(dest, request.url)));
      }
    }
  } catch {
    // If session fetch fails, let the page-level guards handle it
    return withNoCacheHeaders(NextResponse.next());
  }

  return withNoCacheHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard/admin/:path*"],
};
