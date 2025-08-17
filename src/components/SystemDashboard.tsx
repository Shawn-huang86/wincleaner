import React from 'react';
import { HardDrive, TrendingUp, Shield, Zap, Settings, BarChart3, Clock, MessageCircle, Scan } from 'lucide-react';
import { ScanItem } from '../types';
import { formatFileSize } from '../utils/helpers';

interface SystemDashboardProps {
  scanResults: ScanItem[];
  selectedItems: Set<string>;
  scanHistory: Array<{date: string, itemsFound: number, spaceFreed: number}>;
  onShowSettings: () => void;
  isScanning?: boolean;
  scanProgress?: {
    current: number;
    total: number;
    currentItem: string;
  };
  isChatScan?: boolean;
  deepScan?: boolean;
}

export const SystemDashboard: React.FC<SystemDashboardProps> = ({
  scanResults,
  selectedItems,
  scanHistory,
  onShowSettings,
  isScanning = false,
  scanProgress,
  isChatScan = false,
  deepScan = false,
}) => {
  const totalSize = scanResults.reduce((sum, item) => sum + item.sizeBytes, 0);
  const selectedSize = scanResults
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.sizeBytes, 0);
  
  const riskCounts = scanResults.reduce((acc, item) => {
    acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalHistorySpace = scanHistory.reduce((sum, scan) => sum + scan.spaceFreed, 0);

  return (
    <div className="bg-white border-b border-gray-200 p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-blue-100 rounded-md">
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">系统状态</h2>
        </div>

        {/* 扫描状态提示 - 居中显示 */}
        <div className="flex-1 flex justify-center">
          {!isScanning && scanResults.length === 0 && (
            <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded border border-blue-200">
              <div className="flex items-center justify-center gap-1">
                <Scan className="w-3 h-3 text-blue-500" />
                <span className="font-medium">点击上方清理按钮开始扫描</span>
              </div>
            </div>
          )}

          {!isScanning && scanResults.length > 0 && (
            <div className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded border border-green-200">
              <div className="flex items-center justify-center gap-1">
                <span>✓ 扫描完成，发现 {scanResults.length} 个可清理项目</span>
              </div>
            </div>
          )}

          {/* 扫描进度条 - 居中显示 */}
          {isScanning && scanProgress && (
            <div className="flex items-center gap-2 max-w-md">
              {/* 状态指示器 */}
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  {isChatScan ? (
                    <>
                      <MessageCircle className="w-3 h-3 text-green-600" />
                      <span>聊天清理</span>
                    </>
                  ) : deepScan ? (
                    <>
                      <Zap className="w-3 h-3 text-purple-600" />
                      <span>全面清理</span>
                    </>
                  ) : (
                    <>
                      <Scan className="w-3 h-3 text-blue-600" />
                      <span>基础清理</span>
                    </>
                  )}
                </div>
              </div>

              {/* 进度条 */}
              <div className="flex-1 min-w-0">
                <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      isChatScan
                        ? 'bg-gradient-to-r from-green-500 to-blue-500'
                        : deepScan
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                    style={{
                      width: `${scanProgress.total > 0 ? (scanProgress.current / scanProgress.total) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* 进度数字 */}
              <div className="text-xs font-medium text-gray-600 flex-shrink-0">
                {scanProgress.current}/{scanProgress.total}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onShowSettings}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100 flex-shrink-0"
          title="设置"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* 扫描结果卡片 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200 overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <div className="bg-blue-100 p-1.5 rounded-md">
              <HardDrive className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">扫描结果</span>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-900 whitespace-nowrap">
              {scanResults.length > 0 ? formatFileSize(totalSize) : '待扫描'}
            </div>
            <div className="text-sm text-gray-700">
              {scanResults.length > 0 ? `发现 ${scanResults.length} 项垃圾文件` : '点击左侧按钮开始扫描'}
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: scanResults.length > 0 ? '75%' : '0%' }}
              ></div>
            </div>
            {isScanning && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                <span>扫描中...</span>
              </div>
            )}
          </div>
        </div>

        {/* 清理统计卡片 */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 border border-green-200 overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <div className="bg-green-100 p-1.5 rounded-md">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">清理统计</span>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-900 whitespace-nowrap">
              {formatFileSize(totalHistorySpace)}
            </div>
            <div className="text-sm text-gray-700">
              历史累计释放空间
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-600 font-medium">
                {scanHistory.length > 0 ? `最近 ${scanHistory.length} 次清理` : '暂无清理记录'}
              </span>
              {scanHistory.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>最近清理</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 安全评估卡片 */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-2 border border-yellow-200 overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <div className="bg-yellow-100 p-1.5 rounded-md">
              <Shield className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-xs text-yellow-600 font-medium">安全评估</span>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-900 whitespace-nowrap">
              {scanResults.length > 0 ? `${Math.round((riskCounts.low || 0) / scanResults.length * 100)}%` : '100%'}
            </div>
            <div className="text-sm text-gray-700">
              安全文件占比
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">安全项</span>
                </div>
                <span className="font-medium text-green-600">
                  {riskCounts.low || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">注意项</span>
                </div>
                <span className="font-medium text-yellow-600">
                  {riskCounts.medium || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">风险项</span>
                </div>
                <span className="font-medium text-red-600">
                  {riskCounts.high || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作卡片 */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 border border-purple-200 overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <div className="bg-purple-100 p-1.5 rounded-md">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs text-purple-600 font-medium">快速操作</span>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-900 whitespace-nowrap">
              {selectedItems.size}
            </div>
            <div className="text-sm text-gray-700">
              已选择项目
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">可释放空间</span>
                <span className="font-medium text-purple-600">
                  {formatFileSize(selectedSize)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">选择进度</span>
                <span className="font-medium text-gray-600">
                  {scanResults.length > 0 ? Math.round(selectedItems.size / scanResults.length * 100) : 0}%
                </span>
              </div>
            </div>
            {selectedItems.size > 0 && (
              <div className="w-full bg-purple-200 rounded-full h-1 mt-1.5">
                <div
                  className="bg-purple-600 h-1 rounded-full transition-all duration-300"
                  style={{
                    width: scanResults.length > 0 ? `${selectedItems.size / scanResults.length * 100}%` : '0%'
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
