import React from 'react';
import { Zap, Scan, MessageCircle, Eraser, Package } from 'lucide-react';
import { ScanItem } from '../types';

interface CleaningSidebarProps {
  onStartQuickScan: () => void;
  onStartDeepScan: () => void;
  onStartChatScan: () => void;
  onOpenSpecialCleaner: () => void;
  onOpenApplicationManager: () => void;
  isQuickScanning?: boolean;
  isDeepScanning?: boolean;
  isChatScanning?: boolean;
}

export const CleaningSidebar: React.FC<CleaningSidebarProps> = ({
  onStartQuickScan,
  onStartDeepScan,
  onStartChatScan,
  onOpenSpecialCleaner,
  onOpenApplicationManager,
  isQuickScanning = false,
  isDeepScanning = false,
  isChatScanning = false,
}) => {

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* 标题 */}
      <div className="p-2 border-b border-gray-200">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="p-1 bg-blue-100 rounded-md">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">清理功能</h2>
        </div>
        <p className="text-xs text-gray-500">选择清理模式开始扫描</p>
      </div>

      {/* 清理功能按钮 - 垂直布局 */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {/* 快速清理 */}
        <button
          onClick={onStartQuickScan}
          disabled={isQuickScanning}
          className="w-full group p-2 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-100 group-hover:bg-blue-200 p-1.5 rounded-md flex items-center justify-center">
              <Scan className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">基础清理</h3>
              <p className="text-xs text-gray-600">清理临时文件、缓存等基础垃圾</p>
              <div className="mt-0.5 text-xs text-blue-600 font-medium">
                {isQuickScanning ? '扫描中...' : '安全 • 快速'}
              </div>
            </div>
          </div>
        </button>

        {/* 深度清理 */}
        <button
          onClick={onStartDeepScan}
          disabled={isDeepScanning}
          className="w-full group p-2 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="bg-purple-100 group-hover:bg-purple-200 p-1.5 rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">全面清理</h3>
              <p className="text-xs text-gray-600">系统级清理、内存优化、注册表</p>
              <div className="mt-0.5 text-xs text-purple-600 font-medium">
                {isDeepScanning ? '扫描中...' : '全面 • 高效'}
              </div>
            </div>
          </div>
        </button>

        {/* 微信QQ清理 */}
        <button
          onClick={onStartChatScan}
          disabled={isChatScanning}
          className="w-full group p-2 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="bg-green-100 group-hover:bg-green-200 p-1.5 rounded-md flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">聊天清理</h3>
              <p className="text-xs text-gray-600">微信QQ缓存、图片视频、时间保护</p>
              <div className="mt-0.5 text-xs text-green-600 font-medium">
                {isChatScanning ? '扫描中...' : '专业 • 保护'}
              </div>
            </div>
          </div>
        </button>

        {/* 专项清理 */}
        <button
          onClick={onOpenSpecialCleaner}
          className="w-full group p-2 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all duration-200 text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="bg-red-100 group-hover:bg-red-200 p-1.5 rounded-md flex items-center justify-center">
              <Eraser className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">专项清理</h3>
              <p className="text-xs text-gray-600">软件残留、隐私数据清理</p>
              <div className="mt-0.5 text-xs text-red-600 font-medium">
                高级 • 精准
              </div>
            </div>
          </div>
        </button>

        {/* 应用管理 */}
        <button
          onClick={onOpenApplicationManager}
          className="w-full group p-2 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="bg-orange-100 group-hover:bg-orange-200 p-1.5 rounded-md flex items-center justify-center">
              <Package className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">应用管理</h3>
              <p className="text-xs text-gray-600">卸载软件、管理启动项</p>
              <div className="mt-0.5 text-xs text-orange-600 font-medium">
                管理 • 优化
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* 底部状态栏 */}
      <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-2 py-2 h-[38px]">
        <div className="flex items-center justify-between h-full">
          <div className="text-xs text-gray-700">
            <span className="font-medium">清理功能</span>
          </div>
          <div className="text-xs text-gray-500">
            {(isQuickScanning || isDeepScanning || isChatScanning) ? '扫描中...' : '就绪'}
          </div>
        </div>
      </div>
    </div>
  );
};
