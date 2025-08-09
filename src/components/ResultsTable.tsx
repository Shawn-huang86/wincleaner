import React, { useState, useMemo } from 'react';
import { CheckSquare, Square, AlertTriangle, CheckCircle, XCircle, HelpCircle, Search, Folder, Globe, User, Settings, Archive, Download, ChevronLeft, ChevronRight, Brain, Star } from 'lucide-react';
import { ScanItem } from '../types';
import { formatFileSize } from '../utils/helpers';

interface ResultsTableProps {
  results: ScanItem[];
  filteredResults: ScanItem[];
  selectedItems: Set<string>;
  selectedCategory: string | null;
  onSelectItem: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onCategorySelect: (category: string | null) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  filteredResults,
  selectedItems,
  selectedCategory,
  onSelectItem,
  onSelectAll,
  onCategorySelect,
}) => {
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // 每页显示50项，优化性能

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
      }
    ];

    return categories.map(cat => {
      const categoryItems = results.filter(item => item.category === cat.category);
      const totalSize = categoryItems.reduce((sum, item) => sum + item.size, 0);
      return {
        ...cat,
        count: categoryItems.length,
        totalSize
      };
    }).filter(cat => cat.count > 0);
  };

  const categoryStats = getCategoryStats();

  // 分页数据
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredResults.slice(startIndex, endIndex);
  }, [filteredResults, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  // 当筛选结果改变时重置到第一页
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredResults.length]);

  const getCategoryIcon = (category: string) => {
    const icons = {
      system: Settings,
      browser: Globe,
      user: User,
      registry: Settings,
      backup: Archive,
      downloads: Download,
    };
    const IconComponent = icons[category as keyof typeof icons] || Folder;
    return <IconComponent className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      system: 'bg-blue-100 text-blue-700',
      browser: 'bg-green-100 text-green-700',
      user: 'bg-purple-100 text-purple-700',
      registry: 'bg-orange-100 text-orange-700',
      backup: 'bg-indigo-100 text-indigo-700',
      downloads: 'bg-red-100 text-red-700',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };
  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'caution':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'high':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRiskText = (riskLevel: string, suggestion: string) => {
    const baseClasses = "text-sm font-medium";
    switch (riskLevel) {
      case 'safe':
        return <span className={`${baseClasses} text-green-600`}>{suggestion}</span>;
      case 'caution':
        return <span className={`${baseClasses} text-orange-600`}>{suggestion}</span>;
      case 'high':
        return <span className={`${baseClasses} text-red-600`}>{suggestion}</span>;
      default:
        return <span className={`${baseClasses} text-gray-600`}>{suggestion}</span>;
    }
  };

  // 渲染AI分析结果
  const renderAIAnalysis = (item: ScanItem) => {
    // 检查是否有AI分析结果（通过suggestion中的特定标识判断）
    const hasAIAnalysis = item.suggestion.includes('置信度') || item.suggestion.includes('AI建议');

    if (!hasAIAnalysis) {
      return (
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Brain className="w-3 h-3" />
          <span>未分析</span>
        </div>
      );
    }

    // 从suggestion中提取AI信息
    const confidenceMatch = item.suggestion.match(/置信度:\s*(\d+)%/);
    const safetyMatch = item.suggestion.match(/安全评分:\s*(\d+)/);
    const aiRecommendationMatch = item.suggestion.match(/AI建议:\s*([^)]+)/);

    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 0;
    const safetyScore = safetyMatch ? parseInt(safetyMatch[1]) : 0;
    const aiRecommendation = aiRecommendationMatch ? aiRecommendationMatch[1] : '';

    const getConfidenceColor = (conf: number) => {
      if (conf >= 80) return 'text-green-600 bg-green-100';
      if (conf >= 60) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    };

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <Brain className="w-3 h-3 text-purple-600" />
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getConfidenceColor(confidence)}`}>
            {confidence}%
          </span>
        </div>
        {safetyScore > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-blue-600" />
            <span className="text-xs text-gray-600">{safetyScore}/100</span>
          </div>
        )}
        {aiRecommendation && (
          <div className="text-xs text-gray-500 max-w-xs truncate" title={aiRecommendation}>
            {aiRecommendation}
          </div>
        )}
      </div>
    );
  };

  // 计算选择状态 - 基于所有筛选结果，不只是当前页
  const allFilteredSelected = filteredResults.length > 0 && filteredResults.every(item => selectedItems.has(item.id));
  const someFilteredSelected = filteredResults.some(item => selectedItems.has(item.id));

  // 当前页选择状态
  const allCurrentPageSelected = paginatedResults.length > 0 && paginatedResults.every(item => selectedItems.has(item.id));
  const someCurrentPageSelected = paginatedResults.some(item => selectedItems.has(item.id));

  // 全选功能 - 直接调用父组件的 onSelectAll
  const handleSelectAll = (selected: boolean) => {
    onSelectAll(selected);
  };

  // 当前页全选功能
  const handleSelectCurrentPage = (selected: boolean) => {
    if (selected) {
      paginatedResults.forEach(item => onSelectItem(item.id, true));
    } else {
      paginatedResults.forEach(item => onSelectItem(item.id, false));
    }
  };

  if (filteredResults.length === 0 && results.length === 0) {
    return (
      <div className="flex flex-col h-full">
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
      <div className="flex flex-col h-full">
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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 分类过滤器 */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium text-gray-700">清理分类</h3>
          <span className="text-xs text-gray-500">({results.length} 项)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* 全部分类 */}
          <button
            onClick={() => onCategorySelect(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
              selectedCategory === null
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Folder className="w-3 h-3" />
              <span>全部分类</span>
              <span className="bg-white bg-opacity-20 px-1.5 py-0.5 rounded text-xs">
                {results.length}
              </span>
            </div>
          </button>

          {/* 各个分类 */}
          {categoryStats.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.category;

            return (
              <button
                key={category.category}
                onClick={() => onCategorySelect(category.category)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  isSelected
                    ? `${category.color.replace('hover:', '')} border-current shadow-sm`
                    : `bg-white text-gray-700 border-gray-300 ${category.color.split(' ').find(c => c.startsWith('hover:'))}`
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <IconComponent className="w-3 h-3" />
                  <span>{category.displayName}</span>
                  <div className="flex items-center gap-1">
                    <span className="bg-white bg-opacity-20 px-1.5 py-0.5 rounded text-xs">
                      {category.count}
                    </span>
                    <span className="text-xs opacity-75">
                      {formatFileSize(category.totalSize)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left">
                <div className="flex items-center gap-2 flex-nowrap">
                  <button
                    onClick={() => handleSelectAll(!allFilteredSelected)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap"
                    title={`全选所有 ${filteredResults.length} 项`}
                  >
                    {allFilteredSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : someFilteredSelected ? (
                      <div className="w-4 h-4 bg-blue-600 rounded border border-blue-600 relative">
                        <div className="absolute inset-0.5 bg-white rounded-sm" />
                      </div>
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    全选
                  </button>

                  {filteredResults.length > itemsPerPage && (
                    <button
                      onClick={() => handleSelectCurrentPage(!allCurrentPageSelected)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors px-1.5 py-0.5 rounded border border-gray-300 hover:border-gray-400 whitespace-nowrap"
                      title={`仅选择当前页 ${paginatedResults.length} 项`}
                    >
                      {allCurrentPageSelected ? (
                        <CheckSquare className="w-3 h-3" />
                      ) : someCurrentPageSelected ? (
                        <div className="w-3 h-3 bg-gray-400 rounded border border-gray-400 relative">
                          <div className="absolute inset-0.5 bg-white rounded-sm" />
                        </div>
                      ) : (
                        <Square className="w-3 h-3" />
                      )}
                      本页
                    </button>
                  )}
                </div>
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">名称</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">大小</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">类型</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">分类</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">修改时间</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">安全评估</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">AI分析</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedResults.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-4 py-3">
                  <button
                    onClick={() => onSelectItem(item.id, !selectedItems.has(item.id))}
                    className="flex items-center"
                  >
                    {selectedItems.has(item.id) ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs" title={item.path}>
                      {item.path}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                  {item.size}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {getCategoryIcon(item.category)}
                    {item.category}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-600">
                    {item.lastModified ? (
                      <div>
                        <div>{item.lastModified.toLocaleDateString('zh-CN')}</div>
                        <div className="text-gray-400">{item.lastModified.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">未知</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(item.riskLevel)}
                    {getRiskText(item.riskLevel, item.suggestion)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {renderAIAnalysis(item)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 底部分页控制 */}
      {filteredResults.length > itemsPerPage && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-600">
            显示第 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredResults.length)} 项，
            共 {filteredResults.length} 项
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};