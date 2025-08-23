import React from 'react';
import { Zap, Scan, MessageCircle, Eraser, Package, HardDrive } from 'lucide-react';
import { ScanItem } from '../types';

interface CleaningSidebarProps {
  onStartQuickScan: () => void;
  onStartDeepScan: () => void;
  onStartChatScan: () => void;
  onStartSpecialScan: () => void;
  onStartAppScan: () => void;
  onStartCDriveScan: () => void;
  isQuickScanning?: boolean;
  isDeepScanning?: boolean;
  isChatScanning?: boolean;
  isSpecialScanning?: boolean;
  isAppScanning?: boolean;
  isCDriveScanning?: boolean;
}

export const CleaningSidebar: React.FC<CleaningSidebarProps> = ({
  onStartQuickScan,
  onStartDeepScan,
  onStartChatScan,
  onStartSpecialScan,
  onStartAppScan,
  onStartCDriveScan,
  isQuickScanning = false,
  isDeepScanning = false,
  isChatScanning = false,
  isSpecialScanning = false,
  isAppScanning = false,
  isCDriveScanning = false,
}) => {

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col">
      {/* 标题 */}
      <div className="p-2 border-b border-gray-200">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="p-1 bg-blue-100 rounded-md">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">清理功能</h2>
        </div>
        <p className="text-xs text-gray-500">选择清理模式开始扫描</p>
        <div className="mt-1.5 flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          <span className="text-green-700 font-medium">种子用户专享：全功能免费体验</span>
        </div>
      </div>

      {/* 清理功能按钮 - 垂直布局，统一高度 */}
      <div className="flex-1 p-2 pb-12 space-y-2 overflow-visible flex flex-col">
        {/* 基础清理 */}
        <button
          onClick={onStartQuickScan}
          disabled={isQuickScanning}
          className="w-full group p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left h-20 flex items-center"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="bg-blue-100 group-hover:bg-blue-200 p-2.5 rounded-lg flex items-center justify-center flex-shrink-0">
              <Scan className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {isQuickScanning ? '基础清理 - 扫描中...' : '基础清理'}
              </h3>
              <p className="text-xs text-gray-600">清理临时文件、缓存等基础垃圾</p>
            </div>
          </div>
        </button>

        {/* C盘专清 */}
        <button
          onClick={onStartCDriveScan}
          disabled={isCDriveScanning}
          className="w-full group p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left h-20 flex items-center"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="bg-indigo-100 group-hover:bg-indigo-200 p-2.5 rounded-lg flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {isCDriveScanning ? 'C盘专清 - 扫描中...' : 'C盘专清'}
              </h3>
              <p className="text-xs text-gray-600">专门清理C盘垃圾，释放系统空间</p>
            </div>
          </div>
        </button>

        {/* 全面清理 */}
        <button
          onClick={onStartDeepScan}
          disabled={isDeepScanning}
          className="w-full group p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left h-20 flex items-center"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="bg-purple-100 group-hover:bg-purple-200 p-2.5 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {isDeepScanning ? '全面清理 - 扫描中...' : '全面清理'}
              </h3>
              <p className="text-xs text-gray-600">系统级清理、内存优化、注册表</p>
            </div>
          </div>
        </button>

        {/* 聊天清理 */}
        <button
          onClick={onStartChatScan}
          disabled={isChatScanning}
          className="w-full group p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left h-20 flex items-center"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="bg-green-100 group-hover:bg-green-200 p-2.5 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {isChatScanning ? '聊天清理 - 扫描中...' : '聊天清理'}
              </h3>
              <p className="text-xs text-gray-600">微信QQ缓存、图片视频、时间保护</p>
            </div>
          </div>
        </button>

        {/* 专项清理 */}
        <button
          onClick={onStartSpecialScan}
          disabled={isSpecialScanning}
          className={`w-full group p-4 border rounded-lg transition-all duration-200 text-left disabled:cursor-not-allowed h-20 flex items-center ${
            isSpecialScanning
              ? 'border-red-300 bg-red-50 opacity-75'
              : 'border-gray-200 hover:border-red-500 hover:bg-red-50'
          }`}
        >
          <div className="flex items-center gap-3 w-full">
            <div className={`p-2.5 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isSpecialScanning
                ? 'bg-red-200'
                : 'bg-red-100 group-hover:bg-red-200'
            }`}>
              <Eraser className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {isSpecialScanning ? '专项清理 - 扫描中...' : '专项清理'}
              </h3>
              <p className="text-xs text-gray-600">软件残留、隐私数据清理</p>
            </div>
          </div>
        </button>

        {/* 应用管理 */}
        <button
          onClick={onStartAppScan}
          disabled={isAppScanning}
          className={`w-full group p-4 border rounded-lg transition-all duration-200 text-left disabled:cursor-not-allowed h-20 flex items-center ${
            isAppScanning
              ? 'border-orange-300 bg-orange-50 opacity-75'
              : 'border-gray-200 hover:border-orange-500 hover:bg-orange-50'
          }`}
        >
          <div className="flex items-center gap-3 w-full">
            <div className={`p-2.5 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isAppScanning
                ? 'bg-orange-200'
                : 'bg-orange-100 group-hover:bg-orange-200'
            }`}>
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {isAppScanning ? '应用管理 - 扫描中...' : '应用管理'}
              </h3>
              <p className="text-xs text-gray-600">卸载软件、管理启动项</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
