import React, { useState, useEffect } from 'react';
import { X, Brain, Key, Settings, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { AIConfig } from '../types';
import { AIService } from '../services/aiService';

interface AIConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIConfigPanel: React.FC<AIConfigPanelProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<AIConfig>({
    provider: 'disabled',
    enabled: false,
    maxTokens: 1000,
    temperature: 0.1
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      // 加载当前配置
      const currentConfig = AIService.getConfig();
      setConfig(currentConfig);
    }
  }, [isOpen]);

  const handleConfigChange = (key: keyof AIConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setConnectionStatus('idle');
  };

  const handleSave = () => {
    AIService.setConfig(config);
    
    // 保存到本地存储
    localStorage.setItem('aiConfig', JSON.stringify(config));
    
    onClose();
  };

  const handleTestConnection = async () => {
    if (!config.apiKey && config.provider !== 'local') {
      setErrorMessage('请先输入API密钥');
      setConnectionStatus('error');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      // 临时设置配置进行测试
      AIService.setConfig({ ...config, enabled: true });
      
      // 创建测试请求
      const testRequest = {
        filePath: 'C:\\test\\test.txt',
        fileName: 'test.txt',
        fileSize: 1024,
        fileType: 'file' as const,
        lastModified: new Date(),
        extension: '.txt'
      };

      const result = await AIService.analyzeFile(testRequest);
      
      if (result) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setErrorMessage('AI服务返回空结果');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '连接测试失败');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleLoadFromStorage = () => {
    const saved = localStorage.getItem('aiConfig');
    if (saved) {
      try {
        const savedConfig = JSON.parse(saved);
        setConfig(savedConfig);
      } catch (error) {
        console.error('加载配置失败:', error);
      }
    }
  };

  useEffect(() => {
    handleLoadFromStorage();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI 智能分析配置</h2>
              <p className="text-gray-600 text-sm">配置大模型服务以启用智能文件和应用分析</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 配置内容 */}
        <div className="p-6 space-y-6">
          {/* 启用开关 */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">启用AI分析</h3>
              <p className="text-gray-600 text-sm">开启后将使用AI对文件和应用进行智能分析</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {config.enabled && (
            <>
              {/* 服务提供商选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI服务提供商
                </label>
                <select
                  value={config.provider}
                  onChange={(e) => handleConfigChange('provider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="disabled">禁用</option>
                  <option value="openai">OpenAI (GPT-4)</option>
                  <option value="claude">Claude (Anthropic)</option>
                  <option value="local">本地模型 (Ollama)</option>
                </select>
              </div>

              {/* API配置 */}
              {config.provider !== 'disabled' && config.provider !== 'local' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API密钥
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="password"
                      value={config.apiKey || ''}
                      onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                      placeholder="请输入API密钥"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    API密钥将安全存储在本地，不会上传到服务器
                  </p>
                </div>
              )}

              {/* 模型选择 */}
              {config.provider === 'openai' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    模型选择
                  </label>
                  <select
                    value={config.model || 'gpt-4'}
                    onChange={(e) => handleConfigChange('model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="gpt-4">GPT-4 (推荐)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>
              )}

              {/* 高级设置 */}
              <div className="border-t pt-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3">高级设置</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最大Token数
                    </label>
                    <input
                      type="number"
                      value={config.maxTokens}
                      onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
                      min="100"
                      max="4000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      温度参数
                    </label>
                    <input
                      type="number"
                      value={config.temperature}
                      onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                      min="0"
                      max="1"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* 连接测试 */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-gray-900">连接测试</h4>
                  <button
                    onClick={handleTestConnection}
                    disabled={testingConnection || (!config.apiKey && config.provider !== 'local')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {testingConnection ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Settings className="w-4 h-4" />
                    )}
                    <span>{testingConnection ? '测试中...' : '测试连接'}</span>
                  </button>
                </div>

                {connectionStatus === 'success' && (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span>连接测试成功！AI服务可正常使用</span>
                  </div>
                )}

                {connectionStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span>连接测试失败: {errorMessage}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};
