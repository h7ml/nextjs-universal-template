// {{CHENGQI:
// 操作: 新增;
// 时间戳: 2025-10-30;
// 原因: [P1-LD-014] 公开Dashboard页面;
// 应用的原则: 无需登录访问, 只读模式;
// }}
import { notFound } from 'next/navigation';

export default function PublicDashboardPage({
  params,
}: {
  params: { shareId: string };
}) {
  // TODO: 从数据库查询Dashboard数据
  // const dashboard = await getDashboardByShareId(params.shareId);
  // if (!dashboard) {
  //   notFound();
  // }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Dashboard 名称
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                分享ID: {params.shareId}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
                只读
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-gray-600 dark:text-gray-400">
            这是一个公开的Dashboard页面。
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            实际实现中，这里会显示Dashboard的完整内容，包括所有图表和数据。
          </p>
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">实现要点：</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>无需登录即可访问</li>
              <li>只读模式，不能编辑</li>
              <li>支持实时数据刷新</li>
              <li>可能需要密码验证</li>
              <li>记录访问统计</li>
              <li>支持嵌入模式</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Powered by Next.js Universal Template
        </p>
      </footer>
    </div>
  );
}

/**
 * 元数据
 */
export async function generateMetadata({ params }: { params: { shareId: string } }) {
  // TODO: 从数据库查询Dashboard信息
  return {
    title: 'Dashboard - Public View',
    description: `Shared dashboard ${params.shareId}`,
  };
}
