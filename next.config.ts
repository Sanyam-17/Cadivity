import type { NextConfig } from "next";

// ─── Environment helpers ─────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === "production";

// ─── Content-Security-Policy ─────────────────────────────────────────────────
//
// Each directive explained:
//
//   default-src 'self'
//     → Fallback: only allow resources from our own origin unless a more
//       specific directive overrides it.
//
//   script-src 'self' 'unsafe-inline' https://*.youtube.com https://*.youtube-nocookie.com https://va.vercel-scripts.com
//     → Our own JS bundles, inline <script> tags that Next.js injects
//       (see "CSP quirks" note below), YouTube IFrame API scripts, and
//       Vercel Analytics.
//     ⚠ Next.js 16 still requires 'unsafe-inline' for its hydration
//       bootstrap. A nonce-based approach is possible via middleware but is
//       non-trivial — see note at the bottom of this file.
//
//   frame-src https://*.youtube.com https://*.youtube-nocookie.com
//     → Allow embedding YouTube players in <iframe>. Nothing else may be
//       framed into our pages.
//
//   img-src 'self' data: blob: https:
//     → Our own images, base64 data-URI logos stored in the DB, blob URLs
//       generated client-side, and any external HTTPS thumbnail URL an
//       instructor may set.
//
//   style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
//     → Our CSS bundles, any inline styles (Next.js / Radix UI inject them),
//       and the Google Fonts stylesheet.
//
//   font-src 'self' https://fonts.gstatic.com
//     → Our own fonts (if any) + Google Fonts WOFF2 files.
//
//   connect-src 'self' https://va.vercel-scripts.com https://*.neon.tech
//     → fetch / XHR / WebSocket destinations: our own API, Vercel Analytics
//       beacon, and Neon DB for any edge-runtime Prisma calls.
//
//   media-src 'self'
//     → Only allow <video> / <audio> from our origin (YouTube plays inside
//       iframes so it doesn't need this).
//
//   object-src 'none'
//     → Block <object>, <embed>, <applet> — we don't use Flash / plugins.
//
//   base-uri 'self'
//     → Prevent <base href="…"> injection that could redirect relative URLs.
//
//   form-action 'self'
//     → Forms can only POST to our own origin (better-auth endpoints etc.).
//
//   frame-ancestors 'none'
//     → Nobody may embed *our* pages in an iframe. This is the CSP-level
//       replacement for X-Frame-Options: DENY (we keep both for legacy
//       browser coverage).
//
//   upgrade-insecure-requests
//     → Tell the browser to automatically rewrite any http:// sub-resource
//       requests to https://.
//
// ─────────────────────────────────────────────────────────────────────────────

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.youtube.com https://*.youtube-nocookie.com https://va.vercel-scripts.com",
  "frame-src https://*.youtube.com https://*.youtube-nocookie.com",
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://va.vercel-scripts.com https://*.neon.tech https://*.phonepe.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
];
const generalCSP = cspDirectives.join("; ");

// Stricter CSP for dashboard & API routes — YouTube is not needed there,
// and we can lock script sources down further.
const strictCspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "frame-src 'none'",
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://va.vercel-scripts.com https://*.neon.tech https://*.phonepe.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
];
const strictCSP = strictCspDirectives.join("; ");

// ─── Shared security headers (applied to every response) ────────────────────
const sharedSecurityHeaders = [
  // Prevent the page from being embedded in frames (legacy header, kept
  // alongside frame-ancestors for older browsers).
  { key: "X-Frame-Options", value: "DENY" },

  // Stop browsers from MIME-sniffing the Content-Type.
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Send the full URL as Referer only to same-origin; origin-only cross-origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Disable browser features we never use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },

  // Prevent Adobe cross-domain policy files from granting access.
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

// HSTS — only on production to avoid locking localhost into HTTPS.
// 63 072 000 seconds = 2 years; includeSubDomains covers www.cadivity.com;
// preload allows submission to https://hstspreload.org.
if (isProduction) {
  sharedSecurityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

// ─── Next.js config ──────────────────────────────────────────────────────────

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours
  },

  async headers() {
    return [
      // ── Stricter CSP for dashboard & API (no YouTube needed) ───────────
      {
        source: "/dashboard/:path*",
        headers: [
          ...sharedSecurityHeaders,
          { key: "Content-Security-Policy", value: strictCSP },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          ...sharedSecurityHeaders,
          { key: "Content-Security-Policy", value: strictCSP },
        ],
      },

      // ── General CSP for all other routes ───────────────────────────────
      {
        source: "/:path*",
        headers: [
          ...sharedSecurityHeaders,
          { key: "Content-Security-Policy", value: generalCSP },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Redirect non-www -> www
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "cadivity.com",
          },
        ],
        destination: "https://www.cadivity.com/:path*",
        permanent: true,
      },

      {
        source: "/admin/:path*",
        destination: "/dashboard/admin/:path*",
        permanent: true,
      },
      {
        source: "/admin",
        destination: "/dashboard/admin",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

// ─── TESTING & DEPLOYMENT NOTES ──────────────────────────────────────────────
//
// ## How to test the CSP locally
//
// 1. Run `pnpm dev` and open Chrome DevTools → Console.
//    Any CSP violation shows as a red "[Report Only]" or blocked error with the
//    directive that fired. Fix violations one by one.
//
// 2. Temporarily swap "Content-Security-Policy" → "Content-Security-Policy-Report-Only"
//    in this file to see violations without breaking the page. Revert before deploying.
//
// 3. Copy-paste the CSP string into https://csp-evaluator.withgoogle.com/ to get
//    a quick risk assessment from Google.
//
// 4. After deploying, check https://securityheaders.com/?q=cadivity.com for an
//    overall grade (target: A or A+).
//
// ## Next.js 16 CSP quirks — nonce-based vs 'unsafe-inline'
//
// Next.js injects inline <script> tags for hydration bootstrap and chunk
// loading. As of Next.js 16 the recommended path for nonce-based CSP is:
//
//   a) Create a middleware.ts that generates a per-request nonce.
//   b) Set `script-src 'nonce-<value>' 'strict-dynamic'` in the CSP header
//      from that middleware.
//   c) Pass the nonce to <Script> components via `nonce` prop.
//
// This is significantly more complex and requires every third-party script
// (Vercel Analytics, YouTube IFrame API) to also receive the nonce. For a
// solo-maintained project 'unsafe-inline' is a pragmatic starting point.
// When you're ready to tighten further, follow the Next.js docs:
//   https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
//
// ─────────────────────────────────────────────────────────────────────────────