import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rnsdsclvovqpgqdrvzmv.supabase.co"
      }
    ]
  },
  webpack: (config) => {
    // Ignore warnings from Supabase realtime
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message:
          /Critical dependency: the request of a dependency is an expression/
      }
    ];
    return config;
  }
};

export default nextConfig;
