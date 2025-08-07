import React from 'react';
import { Folder, Globe, User, Settings, Archive, Download, CheckCircle, MessageCircle, Users } from 'lucide-react';
import { ScanItem, CategoryStats } from '../types';
import { formatFileSize } from '../utils/helpers';

interface CategoryFilterProps {
  scanResults: ScanItem[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  scanResults,
  selectedCategory,
  onCategorySelect,
}) => {
  const getCategoryStats = (): CategoryStats[] => {
    const categories = [
      { 
        category: 'system', 
        displayName: '系统文件', 
        icon: 'Settings', 
        color: 'bg-blue-100 text-blue-700 border-blue-200' 
      },
      { 
        category: 'browser', 
        displayName: '浏览器缓存', 
        icon: 'Globe', 
        color: 'bg-green-100 text-green-700 border-green-200' 
      },
      { 
        category: 'user', 
        displayName: '用户临时文件', 
        icon: 'User', 
        color: 'bg-purple-100 text-purple-700 border-purple-200' 
      },
      { 
        category: 'registry', 
        displayName: '注册表残留', 
        icon: 'Settings', 
        color: 'bg-orange-100 text-orange-700 border-orange-200' 
      },
      { 
        category: 'backup', 
        displayName: '备份文件', 
        icon: 'Archive', 
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200' 
      },
      {
        category: 'downloads',
        displayName: '下载文件',
        icon: 'Download',
        color: 'bg-red-100 text-red-700 border-red-200'
      },
      {
        category: 'wechat',
        displayName: '微信清理',
        icon: 'MessageCircle',
        color: 'bg-green-100 text-green-700 border-green-200'
      },
      {
        category: 'qq',
        displayName: 'QQ清理',
        icon: 'Users',
        color: 'bg-blue-100 text-blue-700 border-blue-200'
      },
    ];

    return categories.map(cat => {
      const items = scanResults.filter(item => item.category === cat.category);
      const totalSize = items.reduce((sum, item) => sum + item.sizeBytes, 0);
      
      return {
        ...cat,
        count: items.length,
        totalSize,
      };
    }).filter(cat => cat.count > 0);
  };

  const getIcon = (iconName: string) => {
    const icons = {
      Settings: Settings,
      Globe: Globe,
      User: User,
      Archive: Archive,
      Download: Download,
      Folder: Folder,
      MessageCircle: MessageCircle,
      Users: Users,
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Folder;
    return <IconComponent className="w-5 h-5" />;
  };

  const categoryStats = getCategoryStats();
  const totalItems = scanResults.length;
  const totalSize = scanResults.reduce((sum, item) => sum + item.sizeBytes, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">文件分类</h3>
        <div className="text-sm text-gray-500">
          共 {totalItems} 项 • {formatFileSize(totalSize)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* 全部分类 */}
        <button
          onClick={() => onCategorySelect(null)}
          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
            selectedCategory === null
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              selectedCategory === null ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <CheckCircle className={`w-5 h-5 ${
                selectedCategory === null ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
            <span className="font-medium text-gray-900">全部分类</span>
          </div>
          <div className="text-sm text-gray-600">
            {totalItems} 项 • {formatFileSize(totalSize)}
          </div>
        </button>

        {/* 各个分类 */}
        {categoryStats.map((category) => (
          <button
            key={category.category}
            onClick={() => onCategorySelect(category.category)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedCategory === category.category
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${
                selectedCategory === category.category ? 'bg-blue-100' : category.color
              }`}>
                {getIcon(category.icon)}
              </div>
              <span className="font-medium text-gray-900">{category.displayName}</span>
            </div>
            <div className="text-sm text-gray-600">
              {category.count} 项 • {formatFileSize(category.totalSize)}
            </div>
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 text-sm font-medium">
            <Folder className="w-4 h-4" />
            当前筛选: {categoryStats.find(c => c.category === selectedCategory)?.displayName}
          </div>
          <div className="text-blue-700 text-sm mt-1">
            显示 {scanResults.filter(item => item.category === selectedCategory).length} 项相关文件
          </div>
        </div>
      )}
    </div>
  );
};