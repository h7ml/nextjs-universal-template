"use client";

import { cn } from "@/lib/utils";
import { ExternalLink, Github, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/40 bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto max-w-screen-2xl py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xl">🚀</span>
              </div>
              <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Universal Template
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              支持 Vercel、Deno Deploy 和 Cloudflare Pages 的全栈 Next.js 模板
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/h7ml/nextjs-universal-template"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-accent rounded-md"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-foreground">快速链接</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/", label: "首页" },
                { href: "/dashboard", label: "数据看板" },
                { href: "/dashboards", label: "看板管理" },
                { href: "/data-sources", label: "数据源管理" },
                { href: "/users", label: "用户管理" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 hover:translate-x-1 transform transition-transform"
                  >
                    <span className="w-1 h-1 rounded-full bg-muted-foreground group-hover:bg-primary" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-foreground">资源</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "https://nextjs.org/docs", label: "Next.js 文档" },
                { href: "https://trpc.io", label: "tRPC 文档" },
                { href: "https://orm.drizzle.team", label: "Drizzle ORM" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 group"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-foreground">部署平台</h4>
            <ul className="space-y-3 text-sm">
              {[
                {
                  href: "https://vercel.com",
                  label: "Vercel",
                  color: "from-black to-gray-800",
                },
                {
                  href: "https://deno.com/deploy",
                  label: "Deno Deploy",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  href: "https://developers.cloudflare.com/pages",
                  label: "Cloudflare Pages",
                  color: "from-orange-400 to-orange-500",
                },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2 group"
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full bg-gradient-to-r",
                        link.color
                      )}
                    />
                    {link.label}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Next.js Universal Template. 保留所有权利。
            </p>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                用{" "}
                <Heart className="h-4 w-4 fill-red-500 text-red-500 animate-pulse" />{" "}
                制作
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
