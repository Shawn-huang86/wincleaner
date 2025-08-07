import React from 'react';
import { Trash2, Shield, Sparkles, Search, MessageCircle, Scan } from 'lucide-react';

interface HeaderProps {
  onOpenFileIdentifier: () => void;
  onOpenChatCleaning: () => void;
  onStartMainScan: () => void;
  isScanning?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFileIdentifier, onOpenChatCleaning, onStartMainScan, isScanning = false }) => {
  return (
    <div className="flex items-center justify-between">
      {/* 左侧标题 */}
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
          <Trash2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WinCleaner
            </h1>
            <div className="flex items-center gap-0.5">
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-600 font-medium">Pro</span>
            </div>
          </div>
          <p className="text-xs text-gray-600">智能垃圾清理工具</p>
        </div>
      </div>

      {/* 右侧功能区 */}
      <div className="flex items-center gap-3">
        {/* 安全标识 */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-gray-600">
          <Shield className="w-3 h-3" />
          <span>安全清理</span>
          <span className="text-gray-400">•</span>
          <span>智能建议</span>
        </div>

        {/* 主扫描按钮 */}
        <button
          onClick={onStartMainScan}
          disabled={isScanning}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <Scan className="w-3 h-3" />
          <span className="hidden sm:inline">{isScanning ? '扫描中...' : '扫描垃圾文件'}</span>
          <span className="sm:hidden">{isScanning ? '扫描中' : '扫描'}</span>
        </button>

        {/* 微信QQ清理按钮 */}
        <button
          onClick={onOpenChatCleaning}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm font-medium rounded-md hover:from-green-700 hover:to-blue-700 transition-all duration-200"
        >
          <MessageCircle className="w-3 h-3" />
          <span className="hidden sm:inline">微信QQ清理</span>
          <span className="sm:hidden">微信QQ</span>
        </button>

        {/* 文件识别按钮 */}
        <button
          onClick={onOpenFileIdentifier}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium rounded-md hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
        >
          <Search className="w-3 h-3" />
          <span className="hidden sm:inline">文件识别</span>
          <span className="sm:hidden">识别</span>
        </button>
      </div>
    </div>
  );
};