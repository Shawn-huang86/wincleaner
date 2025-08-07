import React from 'react';
import { Folder, Globe, User, Settings, Archive, Download, MessageCircle, Users, CheckCircle, HardDrive } from 'lucide-react';
import { ScanItem } from '../types';
import { formatFileSize } from '../utils/helpers';

interface SidebarProps {
  scanResults: ScanItem[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  isScanning: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  scanResults,
  selectedCategory,
  onCategorySelect,
  isScanning,
}) => {
  const categories = [
    { 
      category: 'system', 
      displayName: '系统文件', 
      icon: Settings, 
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      description: '系统临时文件、缓存等'
    },
    { 
      category: 'browser', 
      displayName: '浏览器缓存', 
      icon: Globe, 
      color: 'bg-green-100 text-green-700 border-green-200',
      description: 'Chrome、Edge等浏览器缓存'
    },
    { 
      category: 'user', 
      displayName: '用户临时文件', 
      icon: User, 
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      description: '用户临时文件和缓存'
    },
    { 
      category: 'wechat', 
      displayName: '微信清理', 
      icon: MessageCircle, 
      color: 'bg-green-100 text-green-700 border-green-200',
      description: '微信聊天缓存、图片、视频等'
    },
    { 
      category: 'qq', 
      displayName: 'QQ清理', 
      icon: Users, 
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      description: 'QQ聊天缓存、表情、语音等'
    },
    { 
      category: 'downloads', 
      displayName: '下载文件', 
      icon: Download, 
      color: 'bg-red-100 text-red-700 border-red-200',
      description: '下载文件夹中的文件'
    },
    { 
      category: 'registry', 
      displayName: '注册表残留', 
      icon: Settings, 
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      description: '软件卸载后的注册表项'
    },
    { 
      category: 'backup', 
      displayName: '备份文件', 
      icon: Archive, 
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      description: '系统升级备份文件'
    },
  ];

  const getCategoryStats = (categoryId: string) => {
    const items = scanResults.filter(item => item.category === categoryId);
    const totalSize = items.reduce((sum, item) => sum + item.sizeBytes, 0);
    return { count: items.length, totalSize };
  };

  const totalItems = scanResults.length;
  const totalSize = scanResults.reduce((sum, item) => sum + item.sizeBytes, 0);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* 标题 */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <HardDrive className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">清理分类</h2>
        </div>
        <p className="text-xs text-gray-600">选择要清理的文件类型</p>
      </div>

      {/* 分类列表 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* 全部分类 */}
        <button
          onClick={() => onCategorySelect(null)}
          className={`w-full p-2 rounded-md border transition-all duration-200 text-left ${
            selectedCategory === null
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${
              selectedCategory === null ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <CheckCircle className={`w-4 h-4 ${
                selectedCategory === null ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900">全部分类</div>
              {scanResults.length > 0 && (
                <div className="text-xs text-gray-600 truncate">
                  {totalItems} 项 • {formatFileSize(totalSize)}
                </div>
              )}
            </div>
          </div>
        </button>

        {/* 各个分类 */}
        {categories.map((category) => {
          const stats = getCategoryStats(category.category);
          const IconComponent = category.icon;
          const hasResults = stats.count > 0;
          
          return (
            <button
              key={category.category}
              onClick={() => onCategorySelect(category.category)}
              disabled={!hasResults && !isScanning}
              className={`w-full p-2 rounded-md border transition-all duration-200 text-left ${
                selectedCategory === category.category
                  ? 'border-blue-500 bg-blue-50'
                  : hasResults || isScanning
                  ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${
                  selectedCategory === category.category
                    ? 'bg-blue-100'
                    : hasResults || isScanning
                    ? category.color
                    : 'bg-gray-200'
                }`}>
                  <IconComponent className={`w-4 h-4 ${
                    selectedCategory === category.category
                      ? 'text-blue-600'
                      : hasResults || isScanning
                      ? ''
                      : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{category.displayName}</div>
                  {hasResults ? (
                    <div className="text-xs text-gray-600 truncate">
                      {stats.count} 项 • {formatFileSize(stats.totalSize)}
                    </div>
                  ) : !isScanning ? (
                    <div className="text-xs text-gray-400 truncate">暂无文件</div>
                  ) : (
                    <div className="text-xs text-blue-500 truncate">扫描中...</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 底部提示 */}
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          {isScanning ? (
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              扫描中...
            </div>
          ) : scanResults.length > 0 ? (
            `共 ${totalItems} 项`
          ) : (
            '开始扫描'
          )}
        </div>
      </div>
    </div>
  );
};
