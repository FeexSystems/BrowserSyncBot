/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: false,
  },
  output: "standalone",
};

module.exports = nextConfig;
