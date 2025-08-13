import React from 'react';
import { Loader2 } from 'lucide-react';
import { ScanItem } from '../types';
import { formatFileSize } from '../utils/helpers';
import { UpdateStatusIndicator } from './UpdateStatusIndicator';

interface StatusBarProps {
  scanResults: ScanItem[];
  selectedItems: Set<string>;
  totalSelectedSize: number;
  cleaningProgress: { current: number; total: number };
}

export const StatusBar: React.FC<StatusBarProps> = ({
  scanResults,
  selectedItems,
  totalSelectedSize,
  cleaningProgress,
}) => {
  const isCleaning = cleaningProgress.total > 0;

  // 计算当前显示结果中的选中项数量和大小
  const currentSelectedItems = scanResults.filter(item => selectedItems.has(item.id));
  const currentSelectedCount = currentSelectedItems.length;
  const currentSelectedSize = currentSelectedItems.reduce((total, item) => total + item.sizeBytes, 0);

  const getStatusText = () => {
    if (isCleaning) {
      return `正在清理... (${cleaningProgress.current}/${cleaningProgress.total})`;
    }
    if (scanResults.length === 0) {
      return '就绪';
    }
    if (currentSelectedCount === 0) {
      return `找到 ${scanResults.length} 项，总计 ${formatFileSize(scanResults.reduce((total, item) => total + item.sizeBytes, 0))}`;
    }
    return `已选择 ${currentSelectedCount} 项，可释放 ${formatFileSize(currentSelectedSize)}`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 h-[38px]">
      {/* 左侧：扫描状态 */}
      <div className="flex items-center gap-1.5 text-xs text-gray-700">
        {isCleaning && <Loader2 className="w-3 h-3 animate-spin" />}
        <span className="font-medium">{getStatusText()}</span>
      </div>

      {/* 右侧：更新状态 */}
      <UpdateStatusIndicator />
    </div>
  );
};