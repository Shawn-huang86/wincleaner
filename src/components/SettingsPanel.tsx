import React, { useState } from 'react';
import { X, Shield, Clock, HardDrive, Bell, Info, MessageCircle } from 'lucide-react';
import { ChatFileSettings as ChatFileSettingsType } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  chatFileSettings: ChatFileSettingsType;
  onChatFileSettingsChange: (settings: ChatFileSettingsType) => void;
  useRealCleaning: boolean;
  onUseRealCleaningChange: (useReal: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  chatFileSettings,
  onChatFileSettingsChange,
  useRealCleaning,
  onUseRealCleaningChange,
}) => {
  const [autoScan, setAutoScan] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [deepScanDefault, setDeepScanDefault] = useState(false);
  const [autoCleanSafe, setAutoCleanSafe] = useState(false);

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

          {/* 聊天文件时间筛选 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">聊天文件时间筛选</h3>
              </div>
              <button
                onClick={() => {
                  onChatFileSettingsChange({ wechatMonths: 3, qqMonths: 3 });
                }}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:border-gray-400 transition-colors"
              >
                恢复默认
              </button>
            </div>

            <div className="space-y-4">
              {/* 当前设置预览 */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">当前保护设置</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/60 rounded p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-3 h-3 bg-green-500 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">微</span>
                      </div>
                      <span className="font-medium text-gray-700">微信</span>
                    </div>
                    <p className="text-gray-600">
                      {chatFileSettings.wechatMonths === 0 ? '清理全部文件' : `保留最近 ${chatFileSettings.wechatMonths} 个月`}
                    </p>
                  </div>
                  <div className="bg-white/60 rounded p-2">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Q</span>
                      </div>
                      <span className="font-medium text-gray-700">QQ</span>
                    </div>
                    <p className="text-gray-600">
                      {chatFileSettings.qqMonths === 0 ? '清理全部文件' : `保留最近 ${chatFileSettings.qqMonths} 个月`}
                    </p>
                  </div>
                </div>
              </div>

              {/* 微信设置 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">微</span>
                  </div>
                  <label className="text-sm font-medium text-gray-700">微信文件保留时间</label>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 0, label: '不保留' },
                    { value: 1, label: '1个月' },
                    { value: 3, label: '3个月' },
                    { value: 6, label: '6个月' },
                    { value: 12, label: '1年' },
                  ].map((option) => (
                    <button
                      key={`wechat-${option.value}`}
                      onClick={() => onChatFileSettingsChange({ ...chatFileSettings, wechatMonths: option.value })}
                      className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                        chatFileSettings.wechatMonths === option.value
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">自定义：</span>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={chatFileSettings.wechatMonths}
                    onChange={(e) => onChatFileSettingsChange({ ...chatFileSettings, wechatMonths: parseInt(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-xs text-gray-600">个月</span>
                </div>
              </div>

              {/* QQ设置 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Q</span>
                  </div>
                  <label className="text-sm font-medium text-gray-700">QQ文件保留时间</label>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 0, label: '不保留' },
                    { value: 1, label: '1个月' },
                    { value: 3, label: '3个月' },
                    { value: 6, label: '6个月' },
                    { value: 12, label: '1年' },
                  ].map((option) => (
                    <button
                      key={`qq-${option.value}`}
                      onClick={() => onChatFileSettingsChange({ ...chatFileSettings, qqMonths: option.value })}
                      className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                        chatFileSettings.qqMonths === option.value
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">自定义：</span>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={chatFileSettings.qqMonths}
                    onChange={(e) => onChatFileSettingsChange({ ...chatFileSettings, qqMonths: parseInt(e.target.value) || 0 })}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-xs text-gray-600">个月</span>
                </div>
              </div>

              {/* 说明 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">说明</span>
                </div>
                <p className="text-xs text-gray-600">
                  设置保留时间可避免误删重要的聊天文件。临时文件和日志文件不受时间限制影响，始终可以安全清理。
                </p>
              </div>
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

          {/* 关于信息 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Info className="w-5 h-5 text-gray-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">关于</h4>
            </div>
            
            <div className="ml-10 text-sm text-gray-600 space-y-1">
              <div>WinCleaner v1.0.0</div>
              <div>智能垃圾清理工具</div>
              <div>© 2025 WinCleaner Team</div>
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
    </div>
  );
};