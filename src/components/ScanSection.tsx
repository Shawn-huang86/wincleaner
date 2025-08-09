import React from 'react';
import { Search, Loader2, Scan, Zap, MessageCircle } from 'lucide-react';
import { ScanProgress } from '../types';

interface ScanSectionProps {
  isScanning: boolean;
  deepScan: boolean;
  scanProgress: ScanProgress;
  scanResults: any[];
}

export const ScanSection: React.FC<ScanSectionProps> = ({
  isScanning,
  deepScan,
  scanProgress,
  scanResults,
}) => {
  // 检测是否为微信QQ扫描
  const isChatScan = scanResults.some(item => item.category === 'wechat' || item.category === 'qq') &&
                     scanResults.every(item => item.category === 'wechat' || item.category === 'qq');
  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
      {/* 扫描状态指示 */}
      {!isScanning && (
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Scan className="w-4 h-4 text-blue-600" />
            <span>选择清理模式开始扫描</span>
          </div>
          <div className="text-gray-400">•</div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-blue-600 font-medium">基础清理</span>
            <span>•</span>
            <span className="text-purple-600 font-medium">全面清理</span>
            <span>•</span>
            <span className="text-green-600 font-medium">聊天清理</span>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-5 h-5 bg-blue-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                  {isChatScan ? (
                    <>
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <span>聊天清理中...</span>
                    </>
                  ) : deepScan ? (
                    <>
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span>全面清理中...</span>
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4 text-blue-600" />
                      <span>基础清理中...</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {scanProgress.currentItem}
                </div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-700">
              {scanProgress.current} / {scanProgress.total}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>扫描进度</span>
              <span>{scanProgress.total > 0 ? Math.round((scanProgress.current / scanProgress.total) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
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
        </div>
      )}
    </div>
  );
};