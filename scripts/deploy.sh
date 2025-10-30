#!/bin/bash

# Universal deployment script for Next.js
# Supports: Vercel, Deno Deploy, Cloudflare Pages

set -e

PLATFORM=${1:-"help"}

case $PLATFORM in
  vercel)
    echo "🚀 Deploying to Vercel..."
    if command -v vercel &> /dev/null; then
      vercel --prod
    else
      echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
      echo "   Or connect your repo at https://vercel.com"
      exit 1
    fi
    ;;
  
  deno)
    echo "🚀 Deploying to Deno Deploy..."
    if command -v deno &> /dev/null; then
      echo "⚠️  Note: Deno Deploy requires a custom server setup."
      echo "   See: https://deno.com/deploy/docs/deploying-from-git"
      echo "   You may need to create a deno_server.ts file."
    else
      echo "❌ Deno CLI not found. Install from: https://deno.land"
      exit 1
    fi
    ;;
  
  cloudflare)
    echo "🚀 Deploying to Cloudflare Pages..."
    if command -v wrangler &> /dev/null; then
      npm run build
      wrangler pages publish .next --project-name=nextjs-universal-template
    else
      echo "❌ Wrangler CLI not found. Install with: npm i -g wrangler"
      echo "   Or connect your repo at https://dash.cloudflare.com"
      exit 1
    fi
    ;;
  
  build)
    echo "🔨 Building for all platforms..."
    npm run build
    echo "✅ Build complete!"
    ;;
  
  help|*)
    echo "Usage: ./scripts/deploy.sh [platform]"
    echo ""
    echo "Platforms:"
    echo "  vercel      - Deploy to Vercel"
    echo "  deno        - Deploy to Deno Deploy (requires setup)"
    echo "  cloudflare  - Deploy to Cloudflare Pages"
    echo "  build       - Build for all platforms"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy.sh vercel"
    echo "  ./scripts/deploy.sh cloudflare"
    echo ""
    ;;
esac

