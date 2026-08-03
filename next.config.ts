import type { NextConfig } from "next";

// The ETF Screener is a separate Next.js app (its own build/Tailwind), served
// under /etf via a Multi-Zones rewrite. Override the origin for local testing
// (e.g. ETF_ZONE_URL=http://localhost:3100); defaults to its production deploy.
const ETF_ZONE_URL = process.env.ETF_ZONE_URL ?? "https://etf-comparateur.vercel.app";

const nextConfig: NextConfig = {
  typedRoutes: true,
  async rewrites() {
    return [
      { source: "/etf", destination: `${ETF_ZONE_URL}/etf` },
      { source: "/etf/:path*", destination: `${ETF_ZONE_URL}/etf/:path*` },
    ];
  },
  async redirects() {
    // Value Investor moved under /value; keep old links and installed PWAs working.
    // About is a shared, top-level page (/about); point the old per-app URLs at
    // it. Redirects run before rewrites, so /etf/about is caught here before the
    // /etf/:path* proxy would forward it into the ETF zone.
    return [
      { source: "/screen", destination: "/value/screen", permanent: false },
      { source: "/compare", destination: "/value/compare", permanent: false },
      { source: "/value/about", destination: "/about", permanent: false },
      { source: "/etf/about", destination: "/about", permanent: false },
    ];
  },
};

export default nextConfig;
