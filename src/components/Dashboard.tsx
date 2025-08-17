import React from 'react';
import { BarChart3, Clock, HardDrive, Settings, TrendingUp, Shield, Zap, Scan, MessageCircle, Eraser, Package } from 'lucide-react';
import { ScanItem } from '../types';
import { formatFileSize } from '../utils/helpers';

interface DashboardProps {
  scanResults: ScanItem[];
  selectedItems: Set<string>;
  scanHistory: Array<{date: string, itemsFound: number, spaceFreed: number}>;
  onShowSettings: () => void;
  onStartQuickScan: () => void;
  onStartDeepScan: () => void;
  onStartChatScan: () => void;
  onOpenSpecialCleaner: () => void;
  onOpenApplicationManager: () => void;
  isScanning?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  scanResults,
  selectedItems,
  scanHistory,
  onShowSettings,
  onStartQuickScan,
  onStartDeepScan,
  onStartChatScan,
  onOpenSpecialCleaner,
  onOpenApplicationManager,
  isScanning = false,
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
    <div className="space-y-6">
      {/* 四大功能模块 */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 text-blue-600 mr-2" />
          清理功能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 快速清理 */}
          <button
            onClick={onStartQuickScan}
            disabled={isScanning}
            className="group p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center">
              <div className="bg-blue-100 group-hover:bg-blue-200 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Scan className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">基础清理</h3>
              <p className="text-sm text-gray-600">清理临时文件、缓存等基础垃圾</p>
              <div className="mt-2 text-xs text-blue-600 font-medium">
                {isScanning ? '扫描中...' : '安全 • 快速'}
              </div>
            </div>
          </button>

          {/* 深度清理 */}
          <button
            onClick={onStartDeepScan}
            disabled={isScanning}
            className="group p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center">
              <div className="bg-purple-100 group-hover:bg-purple-200 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">全面清理</h3>
              <p className="text-sm text-gray-600">系统级清理、内存优化、注册表</p>
              <div className="mt-2 text-xs text-purple-600 font-medium">
                {isScanning ? '扫描中...' : '全面 • 高效'}
              </div>
            </div>
          </button>

          {/* 微信QQ清理 */}
          <button
            onClick={onStartChatScan}
            disabled={isScanning}
            className="group p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center">
              <div className="bg-green-100 group-hover:bg-green-200 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">聊天清理</h3>
              <p className="text-sm text-gray-600">微信QQ缓存、图片视频、时间保护</p>
              <div className="mt-2 text-xs text-green-600 font-medium">
                {isScanning ? '扫描中...' : '专业 • 保护'}
              </div>
            </div>
          </button>

          {/* 专项清理 */}
          <button
            onClick={onOpenSpecialCleaner}
            className="group p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <div className="text-center">
              <div className="bg-red-100 group-hover:bg-red-200 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Eraser className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">专项清理</h3>
              <p className="text-sm text-gray-600">软件残留、隐私数据清理</p>
              <div className="mt-2 text-xs text-red-600 font-medium">
                高级 • 精准
              </div>
            </div>
          </button>

          {/* 应用管理 */}
          <button
            onClick={onOpenApplicationManager}
            className="group p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
          >
            <div className="text-center">
              <div className="bg-orange-100 group-hover:bg-orange-200 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">应用管理</h3>
              <p className="text-sm text-gray-600">卸载软件、管理启动项</p>
              <div className="mt-2 text-xs text-orange-600 font-medium">
                管理 • 优化
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 系统状态统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 系统状态卡片 */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-blue-100 p-2 rounded-md">
            <HardDrive className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-xs text-gray-500">系统状态</span>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold text-gray-900 whitespace-nowrap">
            {scanResults.length > 0 ? formatFileSize(totalSize) : '待扫描'}
          </div>
          <div className="text-xs text-gray-600">
            {scanResults.length > 0 ? `发现 ${scanResults.length} 项` : '点击扫描开始'}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: scanResults.length > 0 ? '75%' : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* 清理统计卡片 */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-green-100 p-2 rounded-md">
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-xs text-gray-500">清理统计</span>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold text-gray-900 whitespace-nowrap">
            {formatFileSize(totalHistorySpace)}
          </div>
          <div className="text-xs text-gray-600">
            历史累计释放空间
          </div>
          <div className="text-xs text-green-600 font-medium">
            {scanHistory.length > 0 ? `最近 ${scanHistory.length} 次` : '暂无记录'}
          </div>
        </div>
      </div>

      {/* 安全评估卡片 */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-orange-100 p-2 rounded-md">
            <Shield className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-xs text-gray-500">安全评估</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">安全项</span>
            <span className="text-xs font-medium text-green-600">{riskCounts.safe || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">注意项</span>
            <span className="text-xs font-medium text-orange-600">{riskCounts.caution || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">高风险</span>
            <span className="text-xs font-medium text-red-600">{riskCounts.high || 0}</span>
          </div>
        </div>
      </div>

      {/* 快速操作卡片 */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-purple-100 p-2 rounded-md">
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <button
            onClick={onShowSettings}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-semibold text-gray-900">快速操作</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">已选择</span>
              <span className="font-medium text-blue-600">
                {selectedItems.size} 项
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">可释放</span>
              <span className="font-medium text-green-600">
                {formatFileSize(selectedSize)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};