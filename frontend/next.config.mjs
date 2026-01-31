/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/ws/:path*",
        destination: "http://localhost:9090/ws/:path*",
      },
    ];
  },
};

export default nextConfig;
