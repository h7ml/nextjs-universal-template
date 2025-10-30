const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 动态输出配置：根据平台调整
  // 注意：项目包含大量动态路由（users/[id], dashboards/[id]）
  // Cloudflare Pages 的静态导出模式不适合，推荐使用 Vercel
  ...(process.env.CF_PAGES
    ? {} // Cloudflare Pages: 不使用静态导出，保持默认模式
    : process.env.DENO
      ? { output: "standalone" } // Deno 可以使用 standalone
      : {}), // Vercel 自动处理，不需要指定 output

  // Webpack 配置：确保路径别名正确解析
  webpack: (config, { isServer }) => {
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    config.resolve.alias["@/components"] = path.resolve(
      __dirname,
      "src/components"
    );
    config.resolve.alias["@/lib"] = path.resolve(__dirname, "src/lib");
    config.resolve.alias["@/types"] = path.resolve(__dirname, "src/types");
    return config;
  },

  // ESLint 配置：在构建时忽略错误（生产构建时专注于编译）
  eslint: {
    // 忽略 ESLint 错误，避免构建失败
    // ESLint 错误应在 CI 的 lint 步骤中修复
    ignoreDuringBuilds: true,
  },

  // TypeScript 配置：在构建时忽略类型错误
  typescript: {
    // 忽略 TypeScript 类型错误，避免构建失败
    // 类型错误应在开发时和 CI 的 type-check 步骤中修复
    ignoreBuildErrors: true,
  },

  // 实验性功能
  experimental: {
    // Edge Runtime 默认启用以支持多平台
  },

  // 图片优化配置
  images: {
    unoptimized: process.env.CF_PAGES ? true : false, // Cloudflare Pages 需要禁用图片优化或使用外部服务
    remotePatterns: [],
  },

  // 环境变量配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || "default-value",
  },

  // 支持多平台部署的适配
  // Vercel 特定配置
  ...(process.env.VERCEL &&
    {
      // Vercel 会自动优化，通常不需要额外配置
    }),

  // Deno Deploy 特定配置
  ...(process.env.DENO &&
    {
      // Next.js standalone mode will automatically include necessary files
      // outputFileTracingIncludes is not a valid Next.js config option
    }),

  // Cloudflare Pages 特定配置
  // 注意：Cloudflare Pages 使用静态导出时，动态路由需要 generateStaticParams()
  // 如果项目有很多动态路由，建议不使用静态导出，改用 Vercel 或 Cloudflare Workers
  ...(process.env.CF_PAGES && {
    swcMinify: true,
    // 禁用一些 Cloudflare 不支持的特性
    poweredByHeader: false,
  }),
};

module.exports = nextConfig;
