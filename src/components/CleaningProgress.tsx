import React from 'react';
import { Loader2, Trash2, CheckCircle, X } from 'lucide-react';
import { ScanItem } from '../types';
import { formatFileSize } from '../utils/helpers';

interface CleaningProgressProps {
  isOpen: boolean;
  currentItem: ScanItem | null;
  progress: {
    current: number;
    total: number;
    currentFileName: string;
    estimatedTimeLeft: number;
    totalSize: number;
    cleanedSize: number;
  };
  onCancel: () => void;
}

export const CleaningProgress: React.FC<CleaningProgressProps> = ({
  isOpen,
  currentItem,
  progress,
  onCancel,
}) => {
  if (!isOpen) return null;

  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
  const sizeProgressPercentage = progress.totalSize > 0 ? (progress.cleanedSize / progress.totalSize) * 100 : 0;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} 秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} 分 ${remainingSeconds} 秒`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">正在清理文件</h3>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="取消清理"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 当前处理的文件 */}
          {currentItem && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Trash2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 mb-1">正在处理</h4>
                  <p className="text-sm font-semibold text-blue-700 mb-1 truncate">
                    {currentItem.name}
                  </p>
                  <p className="text-xs text-gray-600 truncate" title={currentItem.path}>
                    {currentItem.path}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>大小: {currentItem.size}</span>
                    <span>类型: {currentItem.type}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 进度信息 */}
          <div className="space-y-4">
            {/* 文件数量进度 */}
            <div>
              <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                <span>清理进度</span>
                <span className="font-semibold">{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {progressPercentage.toFixed(1)}% 完成
              </div>
            </div>

            {/* 空间释放进度 */}
            <div>
              <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                <span>空间释放</span>
                <span className="font-semibold">
                  {formatFileSize(progress.cleanedSize)} / {formatFileSize(progress.totalSize)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${sizeProgressPercentage}%` }}
                />
              </div>
            </div>

            {/* 时间信息 */}
            <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>剩余时间: {formatTime(progress.estimatedTimeLeft)}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium">{progress.current} 已完成</span>
              </div>
            </div>
          </div>

          {/* 操作提示 */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">清理进行中</p>
                <p>文件正在移至回收站，请勿关闭窗口。如需中断，请点击取消按钮。</p>
              </div>
            </div>
          </div>

          {/* 取消按钮 */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              取消清理
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
