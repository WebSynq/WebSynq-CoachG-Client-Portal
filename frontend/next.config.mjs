/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "static.prod-images.emergentagent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "kajabi-storefronts-production.kajabi-cdn.com" },
      { protocol: "https", hostname: "cdn.commoninja.com" },
    ],
  },
  // Quiet down strict mode warnings in dev for now
  reactStrictMode: true,
};

export default nextConfig;
