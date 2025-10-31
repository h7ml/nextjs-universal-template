const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack 配置：确保路径别名正确解析，排除服务端专用模块
  webpack: (config, { isServer }) => {
    // 配置路径别名
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

    // 在客户端构建时排除服务端专用的数据库驱动
    // 这些模块需要 Node.js 核心模块（fs, path, stream 等），在浏览器中不可用
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        // PostgreSQL 驱动
        pg: "commonjs pg",
        "pg-native": "commonjs pg-native",
        // MySQL 驱动
        mysql2: "commonjs mysql2",
        // MongoDB 驱动
        mongodb: "commonjs mongodb",
        // Redis 驱动
        ioredis: "commonjs ioredis",
        // 其他可能需要排除的 Node.js 专用模块
        pino: "commonjs pino",
        "pino-pretty": "commonjs pino-pretty",
      });

      // 为客户端提供 Node.js 核心模块的 polyfill fallback
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        // 以下模块在某些情况下可能需要 browserify polyfill
        // 但通常直接设为 false 更安全
        stream: false,
        crypto: false,
        path: false,
        os: false,
        http: false,
        https: false,
        zlib: false,
        querystring: false,
      };
    }

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
