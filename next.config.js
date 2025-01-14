/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ["geist"],
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },

  images: {
    domains: ["images.unsplash.com"],
  },

  async redirects() {
    return [
      {
        source: '/settings',
        destination: '/settings/profile',
        permanent: true, // This sets the status code to 308 for a permanent redirect
      },
    ];
  },

  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false, punycode: false };

    return config;
  },
};

export default config;
