import React from 'react';
import { Trash2, Shield, Search, Sparkles, Scan, Zap, MessageCircle, Eraser, Package } from 'lucide-react';
import { ScanProgress } from '../types';

interface HeaderProps {
  onOpenFileIdentifier: () => void;
  onStartQuickScan: () => void;
  onStartDeepScan: () => void;
  onStartChatScan: () => void;
  onOpenSpecialCleaner: () => void;
  onOpenApplicationManager: () => void;
  isScanning: boolean;
  deepScan: boolean;
  scanProgress: ScanProgress;
  scanResults: any[];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFileIdentifier,
  onStartQuickScan,
  onStartDeepScan,
  onStartChatScan,
  onOpenSpecialCleaner,
  onOpenApplicationManager,
  isScanning,
  deepScan,
  scanProgress,
  scanResults
}) => {
  // 检测是否为微信QQ扫描
  const isChatScan = scanResults.some(item => item.category === 'wechat' || item.category === 'qq') &&
                     scanResults.every(item => item.category === 'wechat' || item.category === 'qq');
  return (
    <div className="space-y-3">
      {/* 主导航栏 */}
      <div className="flex items-center justify-between">
        {/* 左侧标题 */}
        <div className="flex items-center gap-1.5">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-1.5 rounded-md">
            <Trash2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WinCleaner
              </h1>
              <div className="flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                <span className="text-xs text-blue-600 font-medium">Pro</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">智能垃圾清理工具</p>
          </div>
        </div>

      {/* 中间清理操作区 */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* 基础清理 */}
        <button
          onClick={onStartQuickScan}
          disabled={isScanning}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Scan className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">基础清理</span>
          <span className="lg:hidden">基础</span>
        </button>

        {/* 全面清理 */}
        <button
          onClick={onStartDeepScan}
          disabled={isScanning}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium rounded-md hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">全面清理</span>
          <span className="lg:hidden">全面</span>
        </button>

        {/* 聊天清理 */}
        <button
          onClick={onStartChatScan}
          disabled={isScanning}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-md hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">聊天清理</span>
          <span className="lg:hidden">聊天</span>
        </button>

        {/* 专项清理 */}
        <button
          onClick={onOpenSpecialCleaner}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-md hover:from-red-600 hover:to-red-700 transition-all duration-200"
        >
          <Eraser className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">专项清理</span>
          <span className="lg:hidden">专项</span>
        </button>

        {/* 应用管理 */}
        <button
          onClick={onOpenApplicationManager}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-md hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
        >
          <Package className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">应用管理</span>
          <span className="lg:hidden">应用</span>
        </button>

        {/* 文件识别 */}
        <button
          onClick={onOpenFileIdentifier}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-medium rounded-md hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">文件识别</span>
          <span className="lg:hidden">识别</span>
        </button>
      </div>

        {/* 右侧功能区 */}
        <div className="flex items-center gap-2">
          {/* 安全标识 */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span>安全清理</span>
            <span className="text-gray-400">•</span>
            <span>智能建议</span>
          </div>
        </div>
      </div>

      {/* 扫描进度区域 */}
      {isScanning && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg p-2.5 border border-blue-200/50">
          <div className="bg-white/80 backdrop-blur-sm rounded-md p-2.5 border border-white/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3.5 h-3.5 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                    {isChatScan ? (
                      <>
                        <MessageCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                        <span>聊天清理中</span>
                      </>
                    ) : deepScan ? (
                      <>
                        <Zap className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                        <span>全面清理中</span>
                      </>
                    ) : (
                      <>
                        <Scan className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span>基础清理中</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {scanProgress.currentItem}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700 flex-shrink-0 ml-2">
                {scanProgress.current} / {scanProgress.total}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>进度</span>
                <span>{scanProgress.total > 0 ? Math.round((scanProgress.current / scanProgress.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
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
        </div>
      )}

      {/* 扫描状态提示 */}
      {!isScanning && scanResults.length === 0 && (
        <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Scan className="w-3.5 h-3.5 text-gray-400" />
              <span>点击上方清理按钮开始扫描</span>
            </div>
          </div>
        </div>
      )}

      {!isScanning && scanResults.length > 0 && (
        <div className="bg-green-50 rounded-md p-2 border border-green-200">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <span>✓ 扫描完成，发现 {scanResults.length} 个可清理项目</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};