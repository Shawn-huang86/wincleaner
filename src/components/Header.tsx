import React from 'react';
import { Trash2, Shield, Search, Sparkles, Scan, Zap, MessageCircle, Eraser, Package, HardDrive } from 'lucide-react';
import { ScanProgress } from '../types';


interface HeaderProps {
  onOpenFileIdentifier: () => void;
  onStartCDriveScan: () => void;
  onStartQuickScan: () => void;
  onStartDeepScan: () => void;
  onStartChatScan: () => void;
  onStartSpecialScan: () => void;
  onStartAppScan: () => void;
  isQuickScanning: boolean;
  isDeepScanning: boolean;
  isChatScanning: boolean;
  isSpecialScanning: boolean;
  isAppScanning: boolean;
  isCDriveScanning: boolean;
  deepScan: boolean;
  isChatScan: boolean;
  scanProgress: ScanProgress;
  scanResults: any[];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFileIdentifier,
  onStartCDriveScan,
  onStartQuickScan,
  onStartDeepScan,
  onStartChatScan,
  onStartSpecialScan,
  onStartAppScan,
  isQuickScanning,
  isDeepScanning,
  isChatScanning,
  isSpecialScanning,
  isAppScanning,
  isCDriveScanning,
  deepScan,
  isChatScan,
  scanProgress,
  scanResults
}) => {
  return (
    <div className="space-y-2">
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
          disabled={isQuickScanning}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-white text-sm font-medium rounded-md transition-all duration-200 disabled:cursor-not-allowed ${
            isQuickScanning
              ? 'bg-gradient-to-r from-blue-400 to-blue-500 opacity-75'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}
        >
          <Scan className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{isQuickScanning ? '扫描中...' : '基础清理'}</span>
          <span className="lg:hidden">{isQuickScanning ? '扫描中' : '基础'}</span>
        </button>

        {/* C盘专清 */}
        <button
          onClick={onStartCDriveScan}
          disabled={isCDriveScanning}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-white text-sm font-medium rounded-md transition-all duration-200 disabled:cursor-not-allowed ${
            isCDriveScanning
              ? 'bg-gradient-to-r from-indigo-400 to-indigo-500 opacity-75'
              : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{isCDriveScanning ? '扫描中...' : 'C盘专清'}</span>
          <span className="lg:hidden">{isCDriveScanning ? '扫描中' : 'C盘'}</span>
        </button>

        {/* 全面清理 */}
        <button
          onClick={onStartDeepScan}
          disabled={isDeepScanning}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-white text-sm font-medium rounded-md transition-all duration-200 disabled:cursor-not-allowed ${
            isDeepScanning
              ? 'bg-gradient-to-r from-purple-400 to-purple-500 opacity-75'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{isDeepScanning ? '扫描中...' : '全面清理'}</span>
          <span className="lg:hidden">{isDeepScanning ? '扫描中' : '全面'}</span>
        </button>

        {/* 聊天清理 */}
        <button
          onClick={onStartChatScan}
          disabled={isChatScanning}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-white text-sm font-medium rounded-md transition-all duration-200 disabled:cursor-not-allowed ${
            isChatScanning
              ? 'bg-gradient-to-r from-green-400 to-green-500 opacity-75'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{isChatScanning ? '扫描中...' : '聊天清理'}</span>
          <span className="lg:hidden">{isChatScanning ? '扫描中' : '聊天'}</span>
        </button>

        {/* 专项清理 */}
        <button
          onClick={onStartSpecialScan}
          disabled={isSpecialScanning}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-white text-sm font-medium rounded-md transition-all duration-200 disabled:cursor-not-allowed ${
            isSpecialScanning
              ? 'bg-gradient-to-r from-red-400 to-red-500 opacity-75'
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
          }`}
        >
          <Eraser className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{isSpecialScanning ? '扫描中...' : '专项清理'}</span>
          <span className="lg:hidden">{isSpecialScanning ? '扫描中' : '专项'}</span>
        </button>

        {/* 应用管理 */}
        <button
          onClick={onStartAppScan}
          disabled={isAppScanning}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-white text-sm font-medium rounded-md transition-all duration-200 disabled:cursor-not-allowed ${
            isAppScanning
              ? 'bg-gradient-to-r from-orange-400 to-orange-500 opacity-75'
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{isAppScanning ? '扫描中...' : '应用管理'}</span>
          <span className="lg:hidden">{isAppScanning ? '扫描中' : '应用'}</span>
        </button>

        {/* 文件识别 */}
        <button
          onClick={onOpenFileIdentifier}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-medium rounded-md hover:from-gray-700 hover:to-gray-800 transition-all duration-200"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">文件识别</span>
          <span className="lg:hidden">识别</span>
        </button>
      </div>

        {/* 右侧功能区 */}
        <div className="flex items-center gap-3">
          {/* 安全标识 */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span>安全清理</span>
            <span className="text-gray-400">•</span>
            <span>智能建议</span>
          </div>
        </div>
      </div>




    </div>
  );
};