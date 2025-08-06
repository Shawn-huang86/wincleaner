import React from 'react';
import { AlertTriangle, Trash2, X, Shield, Info, Clock } from 'lucide-react';
import { formatFileSize } from '../utils/helpers';
import { ScanItem } from '../types';

interface ConfirmDialogProps {
  isOpen: boolean;
  selectedCount: number;
  totalSize: number;
  hasHighRisk: boolean;
  selectedItems: ScanItem[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  selectedCount,
  totalSize,
  hasHighRisk,
  selectedItems,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  // 分析选中项目的详细信息
  const riskCounts = selectedItems.reduce((acc, item) => {
    acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryCounts = selectedItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryDisplayName = (category: string) => {
    const names = {
      system: '系统文件',
      browser: '浏览器数据',
      user: '用户文件',
      registry: '注册表项',
      backup: '备份文件',
      downloads: '下载文件'
    };
    return names[category as keyof typeof names] || category;
  };

  const getEstimatedTime = () => {
    // 根据文件数量和大小估算清理时间
    const baseTime = Math.max(2, Math.ceil(selectedCount / 10)); // 至少2秒，每10个文件1秒
    const sizeTime = Math.ceil(totalSize / (100 * 1024 * 1024)); // 每100MB 1秒
    return Math.max(baseTime, sizeTime);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">确认清理操作</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 清理概览 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-full ${hasHighRisk ? 'bg-red-100' : 'bg-blue-100'}`}>
                {hasHighRisk ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : (
                  <Trash2 className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">清理概览</h4>
                <p className="text-sm text-gray-600">
                  {selectedCount} 个项目 • {formatFileSize(totalSize)} 空间
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">预计用时: {getEstimatedTime()} 秒</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">可恢复: 回收站</span>
              </div>
            </div>
          </div>

          {/* 风险评估 */}
          {hasHighRisk && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">⚠️ 高风险警告</h4>
                  <div className="space-y-2 text-sm text-red-700">
                    <p>检测到以下高风险项目：</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {riskCounts.high && <li>{riskCounts.high} 个高风险文件（可能影响系统稳定性）</li>}
                      {riskCounts.caution && <li>{riskCounts.caution} 个需谨慎处理的文件</li>}
                    </ul>
                    <p className="font-medium">建议：仔细检查后再进行清理操作</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 分类统计 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              清理项目分类
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-700">{getCategoryDisplayName(category)}</span>
                  <span className="text-sm font-semibold text-gray-900">{count} 项</span>
                </div>
              ))}
            </div>
          </div>

          {/* 安全提示 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800 mb-2">🛡️ 安全保障</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 所有文件将移至系统回收站，可随时恢复</li>
                  <li>• 清理过程可随时中断</li>
                  <li>• 自动生成详细的清理报告</li>
                  <li>• 不会永久删除任何文件</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            取消操作
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
              hasHighRisk
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {hasHighRisk ? '⚠️ 仍要清理' : '🗑️ 开始清理'}
          </button>
        </div>
      </div>
    </div>
  );
};