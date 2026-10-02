import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Profile pictures are up to 10 MB (backend media limit), plus room
      // for multipart overhead. The default is 1 MB.
      bodySizeLimit: "11mb",
    },
  },
};

export default nextConfig;
