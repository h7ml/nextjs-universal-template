"use client";

import { useEffect, useState } from "react";

interface PlatformData {
  platform: string;
  runtime: string;
  nodeVersion: string;
  environment: string;
}

export function PlatformInfo() {
  const [info, setInfo] = useState<PlatformData>({
    platform: "检测中...",
    runtime: "检测中...",
    nodeVersion: "N/A",
    environment: "development",
  });

  useEffect(() => {
    // 从 API 获取平台信息
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => {
        const platformNames: Record<string, string> = {
          vercel: "Vercel",
          local: "本地开发环境",
        };

        setInfo({
          platform:
            platformNames[data.platformInfo?.platform] ||
            data.platform ||
            "未知",
          runtime:
            data.platformInfo?.runtime === "edge"
              ? "Edge Runtime"
              : "Node.js Runtime",
          nodeVersion: typeof process !== "undefined" ? process.version : "N/A",
          environment:
            data.platformInfo?.environment ||
            process.env.NODE_ENV ||
            "development",
        });
      })
      .catch(() => {
        // 降级到客户端检测
        const detectedPlatform =
          typeof window !== "undefined" &&
          (window as any).location?.hostname?.includes("vercel")
            ? "Vercel"
            : "本地开发环境";

        setInfo({
          platform: detectedPlatform,
          runtime:
            typeof EdgeRuntime !== "undefined"
              ? "Edge Runtime"
              : "Node.js Runtime",
          nodeVersion: "N/A",
          environment: "development",
        });
      });
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>平台信息</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        <div>
          <strong>部署平台:</strong> {info.platform}
        </div>
        <div>
          <strong>运行时:</strong> {info.runtime}
        </div>
        <div>
          <strong>Node 版本:</strong> {info.nodeVersion}
        </div>
        <div>
          <strong>环境:</strong> {info.environment}
        </div>
      </div>
    </div>
  );
}
