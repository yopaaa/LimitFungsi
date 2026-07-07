import type { NextConfig } from "next";

const remotePatterns: any[] = [
  {
    protocol: 'https',
    hostname: 'nwqca40wjnkzdrmj.public.blob.vercel-storage.com',
  },
];

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8100";
try {
  const url = new URL(pbUrl);
  remotePatterns.push({
    protocol: url.protocol.replace(":", ""),
    hostname: url.hostname,
    port: url.port || "",
  });
} catch (e) {
  console.error("Gagal mem-parsing URL PocketBase untuk images config:", e);
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
