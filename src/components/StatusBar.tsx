import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { ScanItem } from '../types';
import { formatFileSize } from '../utils/helpers';

interface StatusBarProps {
  scanResults: ScanItem[];
  selectedItems: Set<string>;
  totalSelectedSize: number;
  cleaningProgress: { current: number; total: number };
  onCleanSelected: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  scanResults,
  selectedItems,
  totalSelectedSize,
  cleaningProgress,
  onCleanSelected,
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
    <div className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
      <div className="flex items-center gap-1.5 text-xs text-gray-700">
        {isCleaning && <Loader2 className="w-3 h-3 animate-spin" />}
        <span className="font-medium">{getStatusText()}</span>
      </div>

      <button
        onClick={onCleanSelected}
        disabled={selectedCount === 0 || isCleaning}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-md hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
      >
        <Trash2 className="w-3.5 h-3.5" />
        清理选中项
      </button>
    </div>
  );
};