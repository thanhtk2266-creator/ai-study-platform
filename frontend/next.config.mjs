/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    const isProd = process.env.NODE_ENV === "production";
    const apiTarget =
      process.env.NEXT_SERVER_API_URL ||
      (isProd ? "http://backend:8000" : "http://localhost:8000");

    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;