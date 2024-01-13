/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/convex-vs-prisma",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/convex-vs-prisma",
        basePath: false,
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
