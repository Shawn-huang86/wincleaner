import React from 'react';
import { Loader2 } from 'lucide-react';
import { ScanItem } from '../types';
import { formatFileSize } from '../utils/helpers';

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
  const selectedCount = selectedItems.size;

  const getStatusText = () => {
    if (isCleaning) {
      return `正在清理... (${cleaningProgress.current}/${cleaningProgress.total})`;
    }
    if (scanResults.length === 0) {
      return '就绪';
    }
    if (selectedCount === 0) {
      return `找到 ${scanResults.length} 项，总计 ${formatFileSize(scanResults.reduce((total, item) => total + item.sizeBytes, 0))}`;
    }
    return `已选择 ${selectedCount} 项，可释放 ${formatFileSize(totalSelectedSize)}`;
  };

  return (
    <div className="flex items-center justify-center px-2 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 h-[38px]">
      <div className="flex items-center gap-1.5 text-xs text-gray-700">
        {isCleaning && <Loader2 className="w-3 h-3 animate-spin" />}
        <span className="font-medium">{getStatusText()}</span>
      </div>
    </div>
  );
};