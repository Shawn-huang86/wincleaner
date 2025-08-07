import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { ScanProgress } from '../types';

interface ScanSectionProps {
  isScanning: boolean;
  deepScan: boolean;
  scanProgress: ScanProgress;
  onStartScan: () => void;
  onToggleDeepScan: (enabled: boolean) => void;
}

export const ScanSection: React.FC<ScanSectionProps> = ({
  isScanning,
  deepScan,
  scanProgress,
  onStartScan,
  onToggleDeepScan,
}) => {
  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onStartScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
          >
            {isScanning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {isScanning ? '扫描中...' : '扫描垃圾文件'}
          </button>

          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-2 border border-white/50">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={deepScan}
              onChange={(e) => onToggleDeepScan(e.target.checked)}
              disabled={isScanning}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
            />
            <div>
              <span className="text-sm font-medium text-gray-800">深度扫描</span>
              <p className="text-xs text-gray-600">包含系统文件</p>
            </div>
          </label>
          </div>
        </div>
      </div>

      {isScanning && (
        <div className="mt-3 bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
          <div className="flex items-center justify-between text-xs text-gray-700 mb-2">
            <span className="truncate">正在扫描: {scanProgress.currentItem}</span>
            <span className="font-medium ml-2">{scanProgress.current} / {scanProgress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${scanProgress.total > 0 ? (scanProgress.current / scanProgress.total) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};