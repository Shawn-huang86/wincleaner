import React from 'react';
import { CheckSquare, Square, CheckCircle, Search, Folder, Globe, User, Settings, Archive, Download, MessageCircle, Trash2, Eraser, Shield, Database } from 'lucide-react';
import { ScanItem } from '../types';
import { formatFileSize } from '../utils/helpers';

interface ResultsTableProps {
  results: ScanItem[];
  filteredResults: ScanItem[];
  selectedItems: Set<string>;
  selectedCategory: string | null;
  onSelectItem: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onSelectCategory: (category: string) => void;
  onCategorySelect: (category: string | null) => void;
  availableHeight?: number; // 可用高度，用于动态调整卡片尺寸
  onCleanSelected?: () => void; // 新增：清理选中项的回调函数
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  filteredResults,
  selectedItems,
  selectedCategory,
  onSelectItem,
  onSelectAll,
  onSelectCategory,
  onCategorySelect,
  availableHeight,
  onCleanSelected
}) => {

  // 分类统计
  const getCategoryStats = () => {
    const categories = [
      {
        category: 'system',
        displayName: '系统文件',
        icon: Settings,
        color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
      },
      {
        category: 'browser',
        displayName: '浏览器缓存',
        icon: Globe,
        color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
      },
      {
        category: 'user',
        displayName: '用户临时文件',
        icon: User,
        color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'
      },
      {
        category: 'registry',
        displayName: '注册表残留',
        icon: Settings,
        color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200'
      },
      {
        category: 'backup',
        displayName: '备份文件',
        icon: Archive,
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200'
      },
      {
        category: 'downloads',
        displayName: '下载文件',
        icon: Download,
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200'
      },
      {
        category: 'wechat',
        displayName: '微信文件',
        icon: MessageCircle,
        color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
      },
      {
        category: 'qq',
        displayName: 'QQ文件',
        icon: MessageCircle,
        color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
      },
      {
        category: 'software-remnant',
        displayName: '软件残留',
        icon: Eraser,
        color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
      },
      {
        category: 'registry-remnant',
        displayName: '注册表残留',
        icon: Database,
        color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200'
      },
      {
        category: 'privacy-data',
        displayName: '隐私数据',
        icon: Shield,
        color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200'
      }
    ];

    return categories.map(cat => {
      const categoryItems = filteredResults.filter(item => item.category === cat.category);
      const deletableItems = categoryItems.filter(item => item.canDelete !== false);
      const totalSize = categoryItems.reduce((sum, item) => sum + item.size, 0);
      const deletableSize = deletableItems.reduce((sum, item) => sum + item.size, 0);
      return {
        ...cat,
        count: categoryItems.length,
        deletableCount: deletableItems.length,
        totalSize,
        deletableSize
      };
    }).filter(cat => cat.count > 0);
  };

  const categoryStats = getCategoryStats();

  // 动态计算卡片网格配置
  const getGridConfig = () => {
    if (!availableHeight || results.length === 0) {
      // 默认配置（扫描前或无可用高度时）
      return {
        gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        cardHeight: 'auto',
        gap: 'gap-3',
        isCompact: false
      };
    }

    // 扫描后动态调整
    const statusBarHeight = 45; // 底部状态栏高度
    const padding = 32; // 上下内边距
    const availableCardHeight = availableHeight - statusBarHeight - padding;

    const categoryCount = categoryStats.length;

    // 根据可用高度和分类数量动态调整
    if (availableCardHeight < 250) {
      // 高度很小时，使用超紧凑布局
      return {
        gridCols: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
        cardHeight: 'h-12',
        gap: 'gap-1.5',
        isCompact: true
      };
    } else if (availableCardHeight < 350) {
      // 高度较小时，使用紧凑布局
      return {
        gridCols: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        cardHeight: 'h-16',
        gap: 'gap-2',
        isCompact: true
      };
    } else if (availableCardHeight < 450) {
      // 中等高度，使用中等紧凑布局
      return {
        gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        cardHeight: 'h-20',
        gap: 'gap-2.5',
        isCompact: true
      };
    } else {
      // 高度充足时使用默认配置
      return {
        gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        cardHeight: 'auto',
        gap: 'gap-3',
        isCompact: false
      };
    }
  };

  const gridConfig = getGridConfig();

  if (filteredResults.length === 0 && results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-500 bg-gradient-to-b from-gray-50 to-white">
          <div>
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">准备开始扫描</h3>
            <p className="text-gray-500 mb-4">点击"扫描垃圾文件"开始检测系统中的垃圾文件</p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>临时文件</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>浏览器缓存</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>注册表残留</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (filteredResults.length === 0 && results.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-500 bg-gradient-to-b from-gray-50 to-white">
          <div>
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">该分类下暂无文件</h3>
            <p className="text-gray-500">请选择其他分类或查看全部文件</p>
          </div>
        </div>
      </div>
    );
  }

  // 计算选中项的总数和总大小
  const selectedCount = selectedItems.size;
  const selectedSize = results
    .filter(item => selectedItems.has(item.id))
    .reduce((total, item) => total + item.size, 0);

  // 计算当前筛选结果中的选中项数量（用于清理按钮）
  const filteredSelectedCount = filteredResults
    .filter(item => selectedItems.has(item.id))
    .length;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* 头部区域 - 包含清理按钮 */}
      {results.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">扫描结果</h3>
            <span className="text-sm text-gray-500">
              共 {results.length} 项，{formatFileSize(results.reduce((total, item) => total + item.size, 0))}
            </span>
          </div>

          {onCleanSelected && (
            <button
              onClick={onCleanSelected}
              disabled={selectedCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              清理选中项 {selectedCount > 0 && `(${selectedCount})`}
            </button>
          )}
        </div>
      )}

      {/* 分类汇总卡片 - 动态调整布局 */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className={`grid ${gridConfig.gridCols} ${gridConfig.gap} auto-rows-max`}>
          {categoryStats.map((category) => {
            const IconComponent = category.icon;
            const selectedCount = results.filter(item =>
              item.category === category.category && selectedItems.has(item.id)
            ).length;

            // 获取分类对应的标签样式
            const getCategoryTag = (cat: string) => {
              const tagStyles = {
                system: { bg: 'bg-blue-100', text: 'text-blue-700', label: '系统', displayName: '系统' },
                browser: { bg: 'bg-green-100', text: 'text-green-700', label: '浏览器', displayName: '浏览器' },
                user: { bg: 'bg-purple-100', text: 'text-purple-700', label: '用户', displayName: '用户' },
                registry: { bg: 'bg-gray-100', text: 'text-gray-700', label: '注册表', displayName: '注册表' },
                downloads: { bg: 'bg-red-100', text: 'text-red-700', label: '下载', displayName: '下载' },
                backup: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: '备份', displayName: '备份' }
              };
              return tagStyles[cat as keyof typeof tagStyles] || tagStyles.system;
            };

            const tagStyle = getCategoryTag(category.category);

            return (
              <div
                key={category.category}
                className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-gray-300 ${gridConfig.isCompact ? `${gridConfig.cardHeight} p-2` : 'h-40 p-3'} flex flex-col`}
              >
                {!gridConfig.isCompact ? (
                  // 正常模式 - 完整布局
                  <>
                    {/* 卡片头部 - 正常布局 */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${category.color} shadow-sm`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{category.displayName}</h4>
                          <p className="text-xs text-gray-500">{category.count} 个文件</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-gray-900">
                          {formatFileSize(category.totalSize)}
                        </div>
                      </div>
                    </div>
                  </>
                ) : gridConfig.cardHeight === 'h-12' ? (
                  // 超紧凑模式 - 极简单行布局
                  <div className="flex items-center justify-between h-full px-1">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <div className={`p-0.5 rounded ${category.color} flex-shrink-0`}>
                        <IconComponent className="w-2.5 h-2.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-medium text-gray-900 truncate">{category.displayName}</h4>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-1">
                      <div className="text-xs font-bold text-gray-900">
                        {formatFileSize(category.totalSize)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onSelectCategory(category.category);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors ml-1"
                      >
                        {(() => {
                          const totalCategoryItems = results.filter(item => item.category === category.category).length;
                          return selectedCount === totalCategoryItems ? '✓' : selectedCount > 0 ? selectedCount.toString() : '○';
                        })()}
                      </button>
                    </div>
                  </div>
                ) : (
                  // 紧凑模式 - 单行布局
                  <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`p-1 rounded-md ${category.color} shadow-sm flex-shrink-0`}>
                        <IconComponent className="w-3 h-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-gray-900 truncate">{category.displayName}</h4>
                        <p className="text-xs text-gray-500">{category.count} 项</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-sm font-bold text-gray-900">
                        {formatFileSize(category.totalSize)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onSelectCategory(category.category);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {(() => {
                          const deletableCategoryItems = results.filter(item =>
                            item.category === category.category && item.canDelete !== false
                          ).length;
                          return selectedCount === deletableCategoryItems ? '已全选' : selectedCount > 0 ? `已选${selectedCount}` : '选择';
                        })()}
                      </button>
                    </div>
                  </div>
                )}

                {!gridConfig.isCompact && (
                  <>
                    {/* 分类标签和选择状态 - 正常布局 */}
                    <div className="flex items-center justify-between mb-2 flex-1">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tagStyle.bg} ${tagStyle.text} border border-current border-opacity-20`}>
                        <IconComponent className="w-3 h-3" />
                        <span>{tagStyle.label}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onSelectCategory(category.category);
                        }}
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50 border border-gray-200 hover:border-blue-200"
                      >
                        {(() => {
                          const deletableCategoryItems = results.filter(item =>
                            item.category === category.category && item.canDelete !== false
                          ).length;
                          const isFullySelected = selectedCount === deletableCategoryItems;
                          return isFullySelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                          ) : selectedCount > 0 ? (
                            <div className="w-3.5 h-3.5 bg-blue-600 rounded border border-blue-600 relative">
                              <div className="absolute inset-0.5 bg-white rounded-sm" />
                            </div>
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          );
                        })()}
                        <span className="font-medium">
                          {selectedCount > 0 ? `已选择 ${selectedCount}` : '全选'}
                        </span>
                      </button>
                    </div>
                  </>
                )}

                {!gridConfig.isCompact && (
                  /* 底部信息 - 正常布局，固定在底部 */
                  <div className="mt-auto pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">可安全清理 ({category.deletableCount})</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        未分析
                      </div>
                    </div>

                    {/* 修改时间信息 - 更小字体 */}
                    <div className="text-xs text-gray-400">
                      最近修改: {new Date().toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};