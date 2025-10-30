#!/bin/bash
# 测试 Deno 服务器是否能正确提供 Next.js 构建文件

echo "🧪 测试 Deno 服务器配置..."
echo ""

# 检查构建文件
if [ ! -d ".next" ]; then
  echo "❌ 错误: .next 目录不存在"
  echo "   请先运行: npm run build"
  exit 1
fi

if [ ! -f ".next/server/app/index.html" ]; then
  echo "⚠️  警告: .next/server/app/index.html 不存在"
  echo "   可能需要重新构建: npm run build"
fi

echo "✅ 构建文件检查完成"
echo ""
echo "📋 可用的 HTML 页面:"
find .next/server/app -name "*.html" 2>/dev/null | sed 's/^/   - /'
echo ""
echo "🚀 启动 Deno 服务器..."
echo "   然后访问 http://localhost:8080"
echo ""

