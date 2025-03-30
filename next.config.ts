import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding")
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: new URL(process.env.NEXT_PUBLIC_IPFS_GATEWAY as string).hostname,
        pathname: "/ipfs/**",
      },
    ],
  },
}

export default nextConfig
