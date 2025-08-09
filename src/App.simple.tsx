import React from 'react';

function SimpleApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🧹 WinCleaner
          </h1>
          <p className="text-lg text-gray-600">
            智能垃圾清理工具
          </p>
        </header>

        {/* 主要内容 */}
        <main className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              应用状态检查
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-green-800 font-medium">React 应用正常运行</span>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-blue-800 font-medium">Tailwind CSS 样式正常</span>
                </div>
              </div>
            </div>
          </div>

          {/* 功能测试区域 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              功能测试
            </h3>
            <div className="space-y-4">
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                onClick={() => alert('按钮点击正常！')}
              >
                测试按钮交互
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">✓</div>
                  <div className="text-sm text-gray-600 mt-1">组件渲染</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-sm text-gray-600 mt-1">样式加载</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">✓</div>
                  <div className="text-sm text-gray-600 mt-1">事件处理</div>
                </div>
              </div>
            </div>
          </div>

          {/* 调试信息 */}
          <div className="mt-6 bg-gray-800 text-white rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-3">调试信息</h4>
            <div className="space-y-2 text-sm font-mono">
              <div>环境: {import.meta.env.MODE}</div>
              <div>开发模式: {import.meta.env.DEV ? '是' : '否'}</div>
              <div>基础URL: {import.meta.env.BASE_URL}</div>
              <div>时间: {new Date().toLocaleString()}</div>
            </div>
          </div>
        </main>

        {/* 底部 */}
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>如果您能看到这个页面，说明应用基础功能正常运行</p>
        </footer>
      </div>
    </div>
  );
}

export default SimpleApp;
