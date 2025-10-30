import { NextResponse } from "next/server";
import { getPlatformInfo } from "@/lib/platform";

export const runtime = "edge"; // 使用 Edge Runtime 以支持多平台

export async function GET() {
  const platformInfo = getPlatformInfo();

  const platformNames: Record<string, string> = {
    vercel: "Vercel",
    deno: "Deno Deploy",
    cloudflare: "Cloudflare Pages",
    local: "Local Development",
  };

  return NextResponse.json({
    message: "Hello from Next.js Universal Template!",
    platform: platformNames[platformInfo.platform] || platformInfo.platform,
    platformInfo: {
      platform: platformInfo.platform,
      runtime: platformInfo.runtime,
      environment: platformInfo.isProduction
        ? "production"
        : platformInfo.isPreview
          ? "preview"
          : "development",
    },
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    message: "POST request received",
    received: body,
    timestamp: new Date().toISOString(),
  });
}
