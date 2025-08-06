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
    <div className="p-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-200/20 rounded-full translate-y-12 -translate-x-12" />
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <button
            onClick={onStartScan}
            disabled={isScanning}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isScanning ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {isScanning ? '扫描中...' : '扫描垃圾文件'}
          </button>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={deepScan}
              onChange={(e) => onToggleDeepScan(e.target.checked)}
              disabled={isScanning}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <div>
              <span className="text-sm font-semibold text-gray-800">启用深度扫描</span>
              <p className="text-xs text-gray-600">包含系统文件和注册表扫描</p>
            </div>
          </label>
          </div>
        </div>
      </div>

      {isScanning && (
        <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50">
          <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
            <span>正在扫描: {scanProgress.currentItem}</span>
            <span className="font-medium">{scanProgress.current} / {scanProgress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 relative"
              style={{
                width: `${scanProgress.total > 0 ? (scanProgress.current / scanProgress.total) * 100 : 0}%`
              }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};