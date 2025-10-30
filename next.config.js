const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // 图片优化配置
  images: {
    remotePatterns: [],
  },

  // 环境变量配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || "default-value",
  },
};

module.exports = nextConfig;
