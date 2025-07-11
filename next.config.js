/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  exportPathMap: function () {
    return {
      "/": { page: "/", query: {} },
    };
  },
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig;
