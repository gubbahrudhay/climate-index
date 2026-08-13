import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/temperature/**/*": ["./data/**/*"],
  },
};

export default nextConfig;
