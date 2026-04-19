const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api-moonlight.kietvh.io.vn",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
