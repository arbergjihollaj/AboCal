import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Erlaubt das Testen von anderen Handys / Tablets im selben Netzwerk (HMR Fetching)
  // @ts-ignore
  allowedDevOrigins: ["192.168.178.115", "localhost"],
  
  serverExternalPackages: ['pg'],
  output: 'standalone',

  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.178.115:3000", "localhost:3000"],
    }
  }
};

export default nextConfig;
