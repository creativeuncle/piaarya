/** @type {import('next').NextConfig} */
// /api/* and /uploads/* are proxied to the backend by middleware.ts instead
// of a plain rewrite here, so the original Host can be forwarded explicitly
// (see middleware.ts for why).
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
