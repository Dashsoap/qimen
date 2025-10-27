/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用React严格模式
  reactStrictMode: true,
  
  // API代理配置
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:3001/api/:path*',
      },
      {
        source: '/health',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/health`
          : 'http://localhost:3001/health',
      },
    ];
  },
  
  // 图片优化配置
  images: {
    domains: ['localhost', '101.201.148.8'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 实验性特性
  experimental: {
    optimizePackageImports: ['lucide-react', '@headlessui/react'],
  },
  
  // 输出配置（SSR模式，充分利用Next.js优势）
  // 不使用 output: 'export'，保留SSR/SSG能力
};

export default nextConfig;

