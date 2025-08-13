import React, { useState } from 'react';
import { HelpCircle, X, Download, Globe, Shield } from 'lucide-react';

interface UpdateHelpProps {
  onClose?: () => void;
}

export const UpdateHelp: React.FC<UpdateHelpProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
        title="更新帮助"
      >
        <HelpCircle className="w-3 h-3" />
        更新说明
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">应用更新说明</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">无需GitHub账号</h4>
                <p className="text-sm text-gray-600 mt-1">
                  更新检查使用GitHub的公开API，任何人都可以访问，无需注册或登录GitHub账号。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">多重更新源</h4>
                <p className="text-sm text-gray-600 mt-1">
                  如果GitHub无法访问，应用会自动尝试备用更新源，确保您能获取最新版本。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Download className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">简单下载</h4>
                <p className="text-sm text-gray-600 mt-1">
                  点击"立即下载"会直接打开下载页面，无需登录即可下载安装包。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800 mb-2">更新检查频率</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 应用启动时自动检查（24小时一次）</li>
              <li>• 手动点击"检查更新"按钮</li>
              <li>• 通过菜单栏"帮助 → 检查更新"</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">网络要求</h4>
            <p className="text-xs text-yellow-700">
              更新检查需要网络连接。如果网络受限，可以手动访问项目主页获取最新版本。
            </p>
          </div>
        </div>

        {/* 底部 */}
        <div className="px-4 py-3 bg-gray-50 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};
