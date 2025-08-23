import React, { useState } from 'react';
import { X, Shield, Clock, HardDrive, Bell, Info, Brain, Lock, RefreshCw } from 'lucide-react';
import { AIConfigPanel } from './AIConfigPanel';
import { PermissionStatus } from './PermissionStatus';
import { UpdateNotification } from './UpdateNotification';
import { useUpdateChecker } from '../hooks/useUpdateChecker';
import { UpdateHelp } from './UpdateHelp';
import { UpdateConfigWizard } from './UpdateConfigWizard';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  useRealCleaning: boolean;
  onUseRealCleaningChange: (useReal: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  useRealCleaning,
  onUseRealCleaningChange,
}) => {
  const [autoScan, setAutoScan] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [deepScanDefault, setDeepScanDefault] = useState(false);
  const [autoCleanSafe, setAutoCleanSafe] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showPermissionStatus, setShowPermissionStatus] = useState(false);
  const { updateResult, isChecking, checkForUpdates } = useUpdateChecker(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">设置</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* 扫描设置 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">扫描设置</h4>
            </div>
            
            <div className="space-y-4 ml-10">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-gray-700">启用真实清理</span>
                  <p className="text-xs text-gray-500">
                    {useRealCleaning
                      ? '✅ 真正删除文件到回收站（推荐）'
                      : '⚠️ 仅模拟清理过程（演示模式）'
                    }
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={useRealCleaning}
                  onChange={(e) => onUseRealCleaningChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-gray-700">默认启用深度扫描</span>
                  <p className="text-xs text-gray-500">包含系统文件和注册表扫描</p>
                </div>
                <input
                  type="checkbox"
                  checked={deepScanDefault}
                  onChange={(e) => setDeepScanDefault(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-gray-700">自动清理安全项</span>
                  <p className="text-xs text-gray-500">扫描完成后自动清理标记为安全的项目</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoCleanSafe}
                  onChange={(e) => setAutoCleanSafe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </label>
            </div>
          </div>



          {/* 自动化设置 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">自动化</h4>
            </div>
            
            <div className="space-y-4 ml-10">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-gray-700">定时扫描</span>
                  <p className="text-xs text-gray-500">每周自动扫描一次</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoScan}
                  onChange={(e) => setAutoScan(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </label>
            </div>
          </div>

          {/* 通知设置 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">通知</h4>
            </div>
            
            <div className="space-y-4 ml-10">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-gray-700">扫描完成通知</span>
                  <p className="text-xs text-gray-500">扫描完成后显示通知</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </label>
            </div>
          </div>

          {/* 存储信息 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <HardDrive className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">存储信息</h4>
            </div>
            
            <div className="ml-10 bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">C: 盘可用空间</span>
                  <div className="font-medium text-gray-900">156.7 GB</div>
                </div>
                <div>
                  <span className="text-gray-600">总容量</span>
                  <div className="font-medium text-gray-900">512 GB</div>
                </div>
                <div>
                  <span className="text-gray-600">已用空间</span>
                  <div className="font-medium text-gray-900">355.3 GB</div>
                </div>
                <div>
                  <span className="text-gray-600">使用率</span>
                  <div className="font-medium text-gray-900">69.4%</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '69.4%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* 权限和安全 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">权限和安全</h4>
            </div>

            <div className="ml-10 space-y-3">
              <p className="text-sm text-gray-600">
                查看应用程序的文件访问权限，了解哪些文件和文件夹可以安全访问。
              </p>
              <button
                onClick={() => setShowPermissionStatus(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                检查权限状态
              </button>
            </div>
          </div>

          {/* AI智能分析 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">AI智能分析</h4>
            </div>

            <div className="ml-10 space-y-3">
              <p className="text-sm text-gray-600">
                启用AI功能可以更准确地识别文件用途和安全性，提供智能清理建议。
              </p>
              <button
                onClick={() => setShowAIConfig(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                配置AI服务
              </button>
            </div>
          </div>

          {/* 关于信息 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Info className="w-5 h-5 text-gray-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">关于</h4>
            </div>

            <div className="ml-10 space-y-3">
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>WinCleaner v{updateResult?.currentVersion || '1.3.1'}</span>
                  {updateResult?.hasUpdate && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      有新版本
                    </span>
                  )}
                </div>
                <div>智能垃圾清理工具</div>
                <div>© 2025 WinCleaner Team</div>
              </div>

              {/* 更新检查 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={checkForUpdates}
                  disabled={isChecking}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                  {isChecking ? '检查中...' : '检查更新'}
                </button>

                {updateResult && !updateResult.hasUpdate && !updateResult.error && (
                  <span className="text-xs text-green-600">已是最新版本</span>
                )}

                {updateResult?.error && (
                  <span className="text-xs text-red-600">检查失败</span>
                )}
              </div>

              {/* 更新帮助 */}
              <div className="ml-10 flex gap-3">
                <UpdateHelp />
                <UpdateConfigWizard />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存设置
          </button>
        </div>
      </div>

      {/* AI配置面板 */}
      <AIConfigPanel
        isOpen={showAIConfig}
        onClose={() => setShowAIConfig(false)}
      />

      {/* 权限状态面板 */}
      <PermissionStatus
        isOpen={showPermissionStatus}
        onClose={() => setShowPermissionStatus(false)}
      />
    </div>
  );
};