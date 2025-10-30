/**
 * Deno Deploy Server Entry Point
 * Adapts Next.js API Routes for Deno runtime
 *
 * This server handles API routes and serves as entry point for Deno Deploy.
 * For full Next.js functionality, consider deploying frontend separately.
 *
 * NOTE: This file is only for Deno runtime. TypeScript errors in Node.js environment are expected.
 * @ts-nocheck
 */

/// <reference lib="deno.ns" />

// Set Deno environment variables
Deno.env.set("DENO", "1");
// Default to development mode if NODE_ENV is not explicitly set to 'production'
if (!Deno.env.get("NODE_ENV")) {
  Deno.env.set("NODE_ENV", "development");
}

// Import Deno standard library
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

// Check if Next.js dev server is running (development mode)
async function checkNextDevServer(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    // Try multiple endpoints to check if Next.js is running
    const endpoints = [
      "http://localhost:3000/",
      "http://localhost:3000/api/health",
      "http://localhost:3000/api/hello",
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          method: "GET",
        }).catch(() => null);

        if (response && (response.ok || response.status === 404)) {
          // If we get any response (even 404), Next.js is running
          // 404 from Next.js means the route doesn't exist, but server is running
          clearTimeout(timeoutId);
          return true;
        }
      } catch {
        // Try next endpoint
        continue;
      }
    }

    clearTimeout(timeoutId);
    return false;
  } catch {
    return false;
  }
}

// Proxy request to Next.js dev server
async function proxyToNextDev(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const nextUrl = `http://localhost:3000${url.pathname}${url.search}`;

  try {
    const response = await fetch(nextUrl, {
      method: req.method,
      headers: req.headers,
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? await req.clone().arrayBuffer()
          : undefined,
    });

    const responseBody = await response.arrayBuffer();

    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to proxy to Next.js dev server",
        message: error instanceof Error ? error.message : "Unknown error",
        hint: "Make sure Next.js dev server is running on port 3000 (npm run dev)",
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Serve static file from path
async function serveStaticFile(filePath: string): Promise<Response | null> {
  try {
    const file = await Deno.readFile(filePath).catch(() => null);
    if (!file) return null;

    const ext = filePath.split(".").pop()?.toLowerCase() || "";
    const contentTypeMap: Record<string, string> = {
      html: "text/html; charset=utf-8",
      js: "application/javascript; charset=utf-8",
      mjs: "application/javascript; charset=utf-8",
      css: "text/css; charset=utf-8",
      json: "application/json; charset=utf-8",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      svg: "image/svg+xml",
      ico: "image/x-icon",
      webp: "image/webp",
      woff: "font/woff",
      woff2: "font/woff2",
      ttf: "font/ttf",
      eot: "application/vnd.ms-fontobject",
    };

    const contentType = contentTypeMap[ext] || "application/octet-stream";

    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return null;
  }
}

// Simple handler for Deno Deploy
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  // Check if we're in development mode (default when not explicitly production)
  const nodeEnv = Deno.env.get("NODE_ENV") || "development";
  const isDevelopment = nodeEnv !== "production";

  try {
    // In development: Try to proxy to Next.js dev server first
    if (isDevelopment && !url.pathname.startsWith("/api/")) {
      const nextDevRunning = await checkNextDevServer();
      if (nextDevRunning) {
        console.log(`[Deno] Proxying ${url.pathname} to Next.js dev server`);
        return await proxyToNextDev(req);
      }
    }

    // Try to serve from Next.js build output (production or static files)
    if (!url.pathname.startsWith("/api/")) {
      // Handle Next.js static assets (_next/static)
      if (url.pathname.startsWith("/_next/static/")) {
        // Try multiple possible paths for static assets
        const staticPaths = [
          `.next${url.pathname}`, // Standard path
          `.next/static${url.pathname.replace("/_next/static/", "/")}`, // Alternative
        ];

        for (const staticPath of staticPaths) {
          try {
            const stat = await Deno.stat(staticPath);
            if (stat.isFile) {
              const response = await serveStaticFile(staticPath);
              if (response) {
                console.log(`[Deno] Serving static asset: ${staticPath}`);
                return response;
              }
            }
          } catch {
            // File doesn't exist, try next path
          }
        }
      }

      // Handle public assets
      if (url.pathname.startsWith("/") && !url.pathname.startsWith("/_next/")) {
        const publicPath = `public${url.pathname}`;
        try {
          const stat = await Deno.stat(publicPath);
          if (stat.isFile) {
            const response = await serveStaticFile(publicPath);
            if (response) {
              console.log(`[Deno] Serving public file: ${publicPath}`);
              return response;
            }
          }
        } catch {
          // File doesn't exist
        }
      }

      // Handle HTML pages from Next.js build
      // Try to find HTML file for the current path
      let htmlPath: string | null = null;

      if (url.pathname === "/" || url.pathname === "") {
        // Root path
        htmlPath = ".next/server/app/index.html";
      } else {
        // Try different HTML file locations
        const cleanPath = url.pathname.replace(/^\//, "").replace(/\/$/, "");
        const possiblePaths = [
          `.next/server/app/${cleanPath}.html`,
          `.next/server/app/${cleanPath}/index.html`,
          `out/${cleanPath}.html`,
          `out/${cleanPath}/index.html`,
        ];

        for (const path of possiblePaths) {
          try {
            const stat = await Deno.stat(path);
            if (stat.isFile) {
              htmlPath = path;
              break;
            }
          } catch {
            // Try next path
          }
        }
      }

      if (htmlPath) {
        const response = await serveStaticFile(htmlPath);
        if (response) {
          console.log(`[Deno] Serving HTML page: ${htmlPath}`);
          return response;
        }
      }

      // If in development and Next.js is not running, show helpful message for non-root paths
      if (isDevelopment && url.pathname !== "/" && url.pathname !== "") {
        const nextDevRunning = await checkNextDevServer();
        if (!nextDevRunning) {
          return new Response(
            `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Next.js 开发服务器未运行</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 20px;
                }
                .container {
                  background: white;
                  border-radius: 16px;
                  padding: 40px;
                  max-width: 500px;
                  width: 100%;
                  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                  text-align: center;
                }
                h1 { color: #333; margin-bottom: 20px; }
                .code {
                  background: #2d2d2d;
                  color: #f8f8f2;
                  padding: 10px 15px;
                  border-radius: 4px;
                  font-family: 'Monaco', 'Courier New', monospace;
                  display: inline-block;
                  margin: 20px 0;
                }
                .info {
                  background: #f5f5f5;
                  border-left: 4px solid #667eea;
                  padding: 20px;
                  margin: 20px 0;
                  border-radius: 4px;
                  text-align: left;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>⚠️ Next.js 开发服务器未运行</h1>
                <p style="color: #666; margin-bottom: 20px;">
                  此页面需要 Next.js 开发服务器才能访问。
                </p>
                <div class="code">npm run dev</div>
                <div class="info">
                  <p><strong>如何启动：</strong></p>
                  <p>1. 在新的终端窗口中运行：<code style="background: #e0e0e0; padding: 2px 6px; border-radius: 3px;">npm run dev</code></p>
                  <p>2. 等待 Next.js 启动完成（通常运行在 localhost:3000）</p>
                  <p>3. Deno 服务器会自动代理请求到 Next.js</p>
                </div>
                <p style="margin-top: 20px;">
                  <a href="/" style="color: #667eea; text-decoration: none;">← 返回首页</a>
                </p>
              </div>
            </body>
            </html>
            `,
            {
              headers: { "Content-Type": "text/html; charset=utf-8" },
            }
          );
        }
      }
    }
    // Health check
    if (
      url.pathname === "/api/health" ||
      url.pathname === "/api/trpc/health.check"
    ) {
      return new Response(
        JSON.stringify({
          status: "ok",
          platform: "deno",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Platform info API
    if (url.pathname === "/api/hello") {
      return new Response(
        JSON.stringify({
          message: "Hello from Next.js Universal Template!",
          platform: "Deno Deploy",
          platformInfo: {
            platform: "deno",
            runtime: "edge",
            environment: Deno.env.get("NODE_ENV") || "production",
          },
          timestamp: new Date().toISOString(),
          note: "This is the Deno API server. For full Next.js frontend, use npm run dev",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Env API (safe env variables only)
    if (url.pathname === "/api/env") {
      return new Response(
        JSON.stringify({
          platform: "deno",
          runtime: "edge",
          environment: Deno.env.get("NODE_ENV") || "production",
          DENO: Deno.env.get("DENO") || "1",
          // Only expose safe environment variables
          note: "Only safe environment variables are exposed",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // tRPC endpoint - Use actual tRPC handler in Deno
    if (url.pathname.startsWith("/api/trpc/")) {
      // In development, try to proxy to Next.js first (if available)
      if (isDevelopment) {
        const nextDevRunning = await checkNextDevServer();
        if (nextDevRunning) {
          console.log(
            `[Deno] Proxying tRPC ${url.pathname} to Next.js dev server`
          );
          return await proxyToNextDev(req);
        }
      }

      // Use actual tRPC handler in Deno
      try {
        const { createDenoTrpcHandler } = await import(
          "./src/server/deno/create-trpc-handler.ts"
        );
        const trpcHandler = await createDenoTrpcHandler();
        return await trpcHandler(req);
      } catch (error) {
        console.error("[Deno] tRPC handler error:", error);
        return new Response(
          JSON.stringify({
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to handle tRPC request: ${error instanceof Error ? error.message : "Unknown error"}`,
              hint: "Make sure DATABASE_URL is set and database is accessible",
              details: error instanceof Error ? error.stack : String(error),
            },
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // API routes that can be proxied or have basic implementation
    // In development, proxy to Next.js if available
    if (
      url.pathname.startsWith("/api/") &&
      !url.pathname.startsWith("/api/trpc/")
    ) {
      if (isDevelopment) {
        const nextDevRunning = await checkNextDevServer();
        if (nextDevRunning) {
          console.log(
            `[Deno] Proxying API ${url.pathname} to Next.js dev server`
          );
          return await proxyToNextDev(req);
        }
      }

      // For production, provide basic implementations or return helpful errors
      if (url.pathname === "/api/users") {
        return new Response(
          JSON.stringify({
            message: "Users API endpoint",
            hint: "This endpoint requires Next.js for full functionality",
            note: "In development, start Next.js dev server (npm run dev) to get full API support",
            availableViaTrpc: "/api/trpc/user.list",
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Database test endpoint (optional)
    if (url.pathname === "/api/test-db") {
      try {
        // Note: Database connection in Deno requires proper setup
        // This is a placeholder for demonstration
        return new Response(
          JSON.stringify({
            message: "Database connection test",
            status: "Not implemented yet",
            hint: "Use Neon HTTP client for Deno database connections",
            note: "Database connection in Deno requires proper setup with Neon Serverless or similar",
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "Database connection failed",
            message: error instanceof Error ? error.message : "Unknown error",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Default response - improved information page
    if (url.pathname === "/" || url.pathname === "") {
      // Check Next.js status for info page
      const nextDevStatus = isDevelopment ? await checkNextDevServer() : false;

      return new Response(
        `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Next.js Universal Template - Deno Deploy</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              color: #333;
            }
            .container {
              background: white;
              border-radius: 16px;
              padding: 40px;
              max-width: 600px;
              width: 100%;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            h1 {
              font-size: 2.5rem;
              margin-bottom: 10px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .subtitle {
              color: #666;
              margin-bottom: 30px;
              font-size: 1.1rem;
            }
            .info-box {
              background: #f5f5f5;
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-box h2 {
              font-size: 1.2rem;
              margin-bottom: 15px;
              color: #333;
            }
            .info-box ul {
              list-style: none;
              padding-left: 0;
            }
            .info-box li {
              padding: 8px 0;
              border-bottom: 1px solid #ddd;
            }
            .info-box li:last-child {
              border-bottom: none;
            }
            .info-box a {
              color: #667eea;
              text-decoration: none;
              font-weight: 500;
            }
            .info-box a:hover {
              text-decoration: underline;
            }
            .code {
              background: #2d2d2d;
              color: #f8f8f2;
              padding: 3px 8px;
              border-radius: 4px;
              font-family: 'Monaco', 'Courier New', monospace;
              font-size: 0.9em;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #856404;
            }
            .success {
              background: #d4edda;
              border-left: 4px solid #28a745;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #155724;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 Next.js Universal Template</h1>
            <p class="subtitle">Deno Deploy API Server</p>
            
            ${
              isDevelopment
                ? `
            <div class="warning">
              <strong>⚠️ 开发模式</strong><br>
              Deno 服务器正在检查 Next.js 开发服务器...
              <br><br>
              ${
                nextDevStatus
                  ? `
                <span style="color: green;">✅ Next.js 开发服务器正在运行</span>
                <br>Deno 会代理请求到 Next.js (http://localhost:3000)
              `
                  : `
                <span style="color: orange;">⚠️ Next.js 开发服务器未运行</span>
                <br>请启动: <span class="code">npm run dev</span>
                <br>启动后，Deno 会自动代理请求到 Next.js
              `
              }
            </div>
            `
                : `
            <div class="info-box">
              <h2>📦 生产模式</h2>
              <p style="margin-top: 10px;">
                正在尝试提供 Next.js 构建后的静态文件...
                <br>如果看到此页面，说明静态文件未找到。
                <br>请运行: <span class="code">DENO=1 npm run build</span>
              </p>
            </div>
            `
            }
            
            <div class="info-box">
              <h2>📡 可用的 API 端点</h2>
              <ul>
                <li>
                  <a href="/api/health">/api/health</a>
                  <span style="color: #999; margin-left: 10px;">- 健康检查</span>
                </li>
                <li>
                  <a href="/api/hello">/api/hello</a>
                  <span style="color: #999; margin-left: 10px;">- 平台信息</span>
                </li>
                <li>
                  <a href="/api/env">/api/env</a>
                  <span style="color: #999; margin-left: 10px;">- 环境变量（安全）</span>
                </li>
                <li>
                  <a href="/api/trpc/health.check">/api/trpc/health.check</a>
                  <span style="color: #999; margin-left: 10px;">- tRPC 健康检查</span>
                </li>
              </ul>
              <p style="margin-top: 10px; color: #666; font-size: 0.9em;">
                💡 <strong>提示:</strong> 完整的 tRPC 支持需要 Next.js 环境。
                <br>开发时请使用 <span class="code">npm run dev</span> 获得完整 API 支持。
              </p>
            </div>
            
            <div class="success">
              <strong>✅ 服务器状态</strong><br>
              <strong>平台:</strong> Deno Deploy<br>
              <strong>运行时:</strong> Deno Runtime<br>
              <strong>环境:</strong> ${Deno.env.get("NODE_ENV") || "production"}<br>
              <strong>端口:</strong> ${port}
            </div>
            
            ${
              isDevelopment
                ? `
            <div class="info-box">
              <h2>💡 集成模式</h2>
              <p style="margin-top: 10px;">
                当前 Deno 服务器已配置为与 Next.js 集成：
                <br>1. <strong>前端页面:</strong> 自动代理到 Next.js (如果运行中)
                <br>2. <strong>API 路由:</strong> 由 Deno 服务器直接处理
                <br>3. <strong>启动 Next.js:</strong> <span class="code">npm run dev</span>
              </p>
              <p style="margin-top: 10px; color: #666;">
                💡 <strong>提示:</strong> 同时在两个终端运行：
                <br>• 终端 1: <span class="code">npm run dev</span> (Next.js)
                <br>• 终端 2: <span class="code">deno task dev</span> (Deno API)
              </p>
            </div>
            `
                : `
            <div class="info-box">
              <h2>ℹ️ 关于 Deno Deploy</h2>
              <p style="margin-top: 10px;">
                生产模式下，Deno 服务器会尝试提供构建后的静态文件。
                <br>建议：
                <br>• 使用 <strong>Vercel</strong> 进行完整部署 (推荐)
                <br>• 或使用 <strong>Cloudflare Pages</strong> (静态导出)
                <br>• Deno Deploy 适合 API 路由和边缘计算
              </p>
            </div>
            `
            }
          </div>
        </body>
        </html>
        `,
        {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // 404 for unknown routes
    return new Response("Not Found", { status: 404 });
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Start server
const port = parseInt(Deno.env.get("PORT") || "8080");

console.log(`🚀 Deno server running on port ${port}`);
console.log(`📦 Platform: Deno Deploy`);
console.log(`🌍 Environment: ${Deno.env.get("NODE_ENV") || "production"}`);
console.log(`\n💡 提示:`);
console.log(`   - 开发模式: 确保 Next.js dev 服务器在 localhost:3000 运行`);
console.log(`   - 生产模式: 确保已运行 'npm run build' 生成构建文件`);
console.log(`   - 访问 http://localhost:${port} 查看应用\n`);

serve(handler, { port });
