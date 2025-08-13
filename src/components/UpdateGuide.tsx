import React, { useState } from 'react';
import { HelpCircle, X, Download, Globe, Shield, Wifi, ExternalLink } from 'lucide-react';
import { UPDATE_CONFIG, getRecommendedDownloadPage } from '../config/updateConfig';

interface UpdateGuideProps {
  onClose?: () => void;
}

export const UpdateGuide: React.FC<UpdateGuideProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleDownloadOption = (option: string) => {
    const url = UPDATE_CONFIG.DOWNLOAD_PAGES[option as keyof typeof UPDATE_CONFIG.DOWNLOAD_PAGES];
    window.open(url, '_blank');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
        title="更新下载指南"
      >
        <HelpCircle className="w-3 h-3" />
        下载指南
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">WinCleaner 更新下载指南</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-4">
          {/* 无需账号说明 */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">✅ 无需GitHub账号</h4>
                <p className="text-sm text-green-700 mt-1">
                  WinCleaner使用GitHub的公开API检查更新，<strong>任何用户都可以免费访问</strong>，无需注册GitHub账号。
                </p>
              </div>
            </div>
          </div>

          {/* 下载选项 */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Download className="w-4 h-4" />
              多种下载方式
            </h4>
            <div className="space-y-2">
              {UPDATE_CONFIG.USER_GUIDE.downloadOptions.options.map((option, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{option.name}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                  <button
                    onClick={() => handleDownloadOption(option.url)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    访问
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 网络问题解决方案 */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              网络访问问题
            </h4>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 mb-2">如果无法访问GitHub，可以尝试：</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {UPDATE_CONFIG.USER_GUIDE.networkIssues.solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 更新源说明 */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              智能更新源
            </h4>
            <div className="space-y-2">
              {UPDATE_CONFIG.UPDATE_SOURCES.map((source, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                    {source.priority}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{source.name}</div>
                    <div className="text-xs text-gray-600">{source.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              应用会自动按优先级尝试各个更新源，确保您能获取最新版本。
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
