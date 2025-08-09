import React from 'react';

function AppTest() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          WinCleaner 测试页面
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-lg text-gray-600 text-center">
            如果您能看到这个页面，说明 React 应用正常运行！
          </p>
          <div className="mt-4 text-center">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              测试按钮
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppTest;
