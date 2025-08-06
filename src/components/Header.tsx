import React from 'react';
import { Trash2, Shield, Sparkles, Search } from 'lucide-react';

interface HeaderProps {
  onOpenFileIdentifier: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFileIdentifier }) => {
  return (
    <div className="text-center mb-8 relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-2xl -z-10" />
      
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-xl shadow-lg">
          <Trash2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            WinCleaner
          </h1>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-blue-600 font-medium">Pro</span>
          </div>
        </div>
      </div>
      <p className="text-xl text-gray-700 mb-3 font-medium">智能垃圾清理工具</p>
      <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
        <Shield className="w-4 h-4" />
        <span className="font-medium">安全清理</span>
        <span className="text-gray-400">•</span>
        <span className="font-medium">智能建议</span>
        <span className="text-gray-400">•</span>
        <span className="font-medium">一键还原</span>
      </div>
      
      {/* 文件识别按钮 */}
      <div className="mt-6">
        <button
          onClick={onOpenFileIdentifier}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Search className="w-5 h-5" />
          智能文件识别
        </button>
        <p className="text-sm text-gray-500 mt-2">识别未知文件，获取删除建议</p>
      </div>
    </div>
  );
};