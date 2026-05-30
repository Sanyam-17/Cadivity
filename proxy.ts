import { NextRequest, NextResponse } from "next/server";

function withNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionToken) {
    if (pathname.startsWith("/dashboard")) {
      return withNoCacheHeaders(NextResponse.redirect(new URL("/", request.url)));
    }
    return withNoCacheHeaders(NextResponse.next());
  }

  try {
    const baseUrl = process.env.BETTER_AUTH_URL || request.nextUrl.origin;
    const sessionRes = await fetch(`${baseUrl}/api/auth/get-session`, {
      headers: { cookie: request.headers.get("cookie") || "" },
    });

    if (!sessionRes.ok) {
      if (pathname.startsWith("/dashboard")) {
        return withNoCacheHeaders(NextResponse.redirect(new URL("/", request.url)));
      }
      return withNoCacheHeaders(NextResponse.next());
    }

    const session = await sessionRes.json();
    const role = session?.user?.role || "student";

    // ✅ Root /dashboard redirect — routes user based on role
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      const dest =
        role === "admin"
          ? "/dashboard/admin"
          : role === "instructor"
          ? "/dashboard/instructor"
          : "/dashboard/student";
      return withNoCacheHeaders(NextResponse.redirect(new URL(dest, request.url)));
    }

    // Admin routes
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      const dest = role === "instructor" ? "/dashboard/instructor" : "/dashboard/student";
      return withNoCacheHeaders(NextResponse.redirect(new URL(dest, request.url)));
    }

    // Instructor routes
    if (pathname.startsWith("/dashboard/instructor") && role !== "instructor" && role !== "admin") {
      return withNoCacheHeaders(NextResponse.redirect(new URL("/dashboard/student", request.url)));
    }

    // Student routes
    if (pathname.startsWith("/dashboard/student") && role !== "student") {
      const dest = role === "admin" ? "/dashboard/admin" : `/dashboard/${role}`;
      return withNoCacheHeaders(NextResponse.redirect(new URL(dest, request.url)));
    }

  } catch (error) {
    // ✅ Log errors so you can debug in Vercel logs
    console.error("[proxy] Session fetch failed:", error);
    if (pathname.startsWith("/dashboard")) {
      return withNoCacheHeaders(NextResponse.redirect(new URL("/", request.url)));
    }
    return withNoCacheHeaders(NextResponse.next());
  }

  return withNoCacheHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/dashboard/:path*"],
};