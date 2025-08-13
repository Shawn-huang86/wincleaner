import React, { useState } from 'react';
import { Settings, X, Globe, Server, FileText, ExternalLink, Copy, Check } from 'lucide-react';

interface UpdateConfigWizardProps {
  onClose?: () => void;
}

export const UpdateConfigWizard: React.FC<UpdateConfigWizardProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'static' | 'api' | 'local'>('static');
  const [customUrl, setCustomUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const deploymentMethods = [
    {
      id: 'static',
      name: '静态文件托管',
      icon: FileText,
      description: '最简单的方式，上传JSON文件到任何静态托管服务',
      pros: ['完全免费', '部署简单', '高可用性', '无需服务器'],
      example: 'https://your-username.github.io/wincleaner-updates/latest.json'
    },
    {
      id: 'api',
      name: '动态API服务',
      icon: Server,
      description: '使用Vercel、Netlify等平台创建API端点',
      pros: ['功能丰富', '可扩展', '支持统计', '动态配置'],
      example: 'https://your-app.vercel.app/api/latest'
    },
    {
      id: 'local',
      name: '本地文件',
      icon: Globe,
      description: '使用应用内置的版本文件（仅用于演示）',
      pros: ['无需网络', '即时可用', '演示友好', '开发测试'],
      example: '/version.json'
    }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        title="配置更新源"
      >
        <Settings className="w-3 h-3" />
        配置更新源
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">更新源配置向导</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>注意：</strong>由于您的项目是私有的，需要配置自定义更新源。选择最适合您的部署方式：
            </p>
          </div>

          {/* 部署方式选择 */}
          <div className="space-y-3">
            {deploymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod(method.id as any)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{method.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {method.pros.map((pro, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                          >
                            {pro}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        示例: {method.example}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 配置示例 */}
          {selectedMethod && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">配置示例</h4>
              {selectedMethod === 'static' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">1. 创建 latest.json 文件：</p>
                  <div className="bg-gray-800 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
{`{
  "version": "1.1.0",
  "releaseDate": "2025-01-13T00:00:00Z",
  "downloadUrl": "https://your-domain.com/WinCleaner-Setup-1.1.0.exe",
  "releaseNotes": ["更新内容1", "更新内容2"],
  "isRequired": false,
  "fileSize": 157286400
}`}
                  </div>
                  <p className="text-sm text-gray-600">2. 上传到GitHub Pages、Vercel或您的网站</p>
                  <p className="text-sm text-gray-600">3. 在 updateConfig.ts 中配置URL</p>
                </div>
              )}

              {selectedMethod === 'api' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">使用 server-examples/update-api.js 部署到：</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Vercel Functions</li>
                    <li>• Netlify Functions</li>
                    <li>• 您的服务器</li>
                  </ul>
                </div>
              )}

              {selectedMethod === 'local' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">当前使用本地 public/version.json 文件</p>
                  <p className="text-sm text-yellow-600">⚠️ 仅适用于演示，实际部署需要配置在线更新源</p>
                </div>
              )}
            </div>
          )}

          {/* 自定义URL配置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自定义更新源URL（可选）
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://your-domain.com/api/latest.json"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => copyToClipboard(customUrl)}
                disabled={!customUrl}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              配置后需要修改 src/config/updateConfig.ts 文件
            </p>
          </div>
        </div>

        {/* 底部 */}
        <div className="px-4 py-3 bg-gray-50 flex justify-between">
          <a
            href="https://github.com/your-username/wincleaner/blob/main/server-examples/deploy-guide.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            查看详细部署指南
          </a>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
