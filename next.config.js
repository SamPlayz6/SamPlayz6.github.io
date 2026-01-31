/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    // Type checking runs on Vercel where prisma generate creates the types.
    // Locally, the Prisma engine binaries can't be downloaded, so the
    // generated client types are unavailable and tsc would fail.
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
