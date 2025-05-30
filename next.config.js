/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      },
      {
        source: '/r/:path*',
        destination: '/api/r/:path*'
      }
    ]
  }
}

module.exports = nextConfig 