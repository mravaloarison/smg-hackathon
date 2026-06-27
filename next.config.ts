import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Prevent router cache from serving stale page segments in production.
    // Default is 30 s (static) / 0 s (dynamic); setting both to 0 forces a
    // fresh client render on every navigation — eliminating the "search still
    // shows the old playlist song" glitch after Prev/Next.
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

export default nextConfig;
