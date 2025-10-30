import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { MainLayout } from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Next.js Universal Template",
  description:
    "A universal Next.js template for Vercel, Deno Deploy, and Cloudflare Pages",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
