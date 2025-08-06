import React from 'react';
import { BarChart3, Clock, HardDrive, Settings, TrendingUp, Shield, Zap } from 'lucide-react';
import { ScanItem } from '../types';
import { formatFileSize } from '../utils/helpers';

interface DashboardProps {
  scanResults: ScanItem[];
  selectedItems: Set<string>;
  scanHistory: Array<{date: string, itemsFound: number, spaceFreed: number}>;
  onShowSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  scanResults,
  selectedItems,
  scanHistory,
  onShowSettings,
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* 系统状态卡片 */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <HardDrive className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm text-gray-500">系统状态</span>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {scanResults.length > 0 ? formatFileSize(totalSize) : '待扫描'}
          </div>
          <div className="text-sm text-gray-600">
            {scanResults.length > 0 ? `发现 ${scanResults.length} 项` : '点击扫描开始'}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: scanResults.length > 0 ? '75%' : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* 清理统计卡片 */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-sm text-gray-500">清理统计</span>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {formatFileSize(totalHistorySpace)}
          </div>
          <div className="text-sm text-gray-600">
            历史累计释放空间
          </div>
          <div className="text-xs text-green-600 font-medium">
            {scanHistory.length > 0 ? `最近 ${scanHistory.length} 次扫描` : '暂无记录'}
          </div>
        </div>
      </div>

      {/* 安全评估卡片 */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-orange-100 p-3 rounded-lg">
            <Shield className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-sm text-gray-500">安全评估</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">安全项</span>
            <span className="text-sm font-medium text-green-600">{riskCounts.safe || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">注意项</span>
            <span className="text-sm font-medium text-orange-600">{riskCounts.caution || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">高风险</span>
            <span className="text-sm font-medium text-red-600">{riskCounts.high || 0}</span>
          </div>
        </div>
      </div>

      {/* 快速操作卡片 */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <button
            onClick={onShowSettings}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="text-lg font-semibold text-gray-900">快速操作</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">已选择</span>
              <span className="font-medium text-blue-600">
                {selectedItems.size} 项
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">可释放</span>
              <span className="font-medium text-green-600">
                {formatFileSize(selectedSize)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};