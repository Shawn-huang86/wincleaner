import React, { useState } from 'react';

function AppDebug() {
    const [step, setStep] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const testComponent = async (componentName: string, importPath: string) => {
      try {
        const module = await import(importPath);
        console.log(`✅ ${componentName} 导入成功:`, module);
        return { success: true, module };
      } catch (err) {
        console.error(`❌ ${componentName} 导入失败:`, err);
        setError(`${componentName} 导入失败: ${err instanceof Error ? err.message : '未知错误'}`);
        return { success: false, error: err };
      }
    };

    const renderStep = () => {
      switch (step) {
          case 1:
            return (
              <div className="min-h-screen bg-gray-100">
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold text-center mb-8">🔍 WinCleaner - 组件调试</h1>
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <p className="text-lg mb-4">步骤 1: 基础布局正常 ✅</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => testComponent('Header', './components/Header')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                      >
                        测试 Header 组件导入
                      </button>
                      <button
                        onClick={() => testComponent('Dashboard', './components/Dashboard')}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                      >
                        测试 Dashboard 组件导入
                      </button>
                      <button
                        onClick={() => testComponent('原始 App', './App')}
                        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-2"
                      >
                        测试原始 App 导入
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
                      >
                        尝试加载原始 App
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );

          case 2:
            // 尝试加载完整的原始 App
            try {
              const OriginalApp = React.lazy(() => import('./App'));
              return (
                <div className="min-h-screen bg-gray-100">
                  <div className="container mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                      <h2 className="text-xl font-bold mb-4">步骤 2: 加载原始 App</h2>
                      <button
                        onClick={() => setStep(1)}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4"
                      >
                        ← 返回步骤 1
                      </button>
                    </div>
                    <React.Suspense fallback={
                      <div className="flex items-center justify-center min-h-64">
                        <div className="text-lg">🔄 加载完整应用...</div>
                      </div>
                    }>
                      <OriginalApp />
                    </React.Suspense>
                  </div>
                </div>
              );
            } catch (err) {
              setError(`原始 App 加载失败: ${err instanceof Error ? err.message : '未知错误'}`);
              return (
                <div className="min-h-screen bg-red-50 flex items-center justify-center">
                  <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
                    <h2 className="text-xl font-bold text-red-600 mb-4">原始 App 加载错误</h2>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{error}</pre>
                    <button
                      onClick={() => { setError(null); setStep(1); }}
                      className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      返回步骤 1
                    </button>
                  </div>
                </div>
              );
            }

          default:
            return <div>未知步骤</div>;
        }
    };

    return (
      <div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            错误: {error}
          </div>
        )}
        {renderStep()}
      </div>
    );
  }

export default AppDebug;
