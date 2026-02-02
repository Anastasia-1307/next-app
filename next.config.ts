import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_RESOURCE_SERVER_URL: 'http://localhost:5000'
  }
};

export default nextConfig;
