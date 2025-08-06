import React, { useState, useMemo } from 'react';
import { CheckSquare, Square, AlertTriangle, CheckCircle, XCircle, HelpCircle, Search, Folder, Globe, User, Settings, Archive, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScanItem } from '../types';
import { formatFileSize } from '../utils/helpers';

interface ResultsTableProps {
  results: ScanItem[];
  filteredResults: ScanItem[];
  selectedItems: Set<string>;
  onSelectItem: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  filteredResults,
  selectedItems,
  onSelectItem,
  onSelectAll,
}) => {
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // 每页显示50项，优化性能

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
      <div className="p-16 text-center text-gray-500 bg-gradient-to-b from-gray-50 to-white">
        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">准备开始扫描</h3>
        <p className="text-gray-500 mb-4">点击"扫描垃圾文件"开始检测系统中的垃圾文件</p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>临时文件</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>浏览器缓存</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>注册表残留</span>
          </div>
        </div>
      </div>
    );
  }

  if (filteredResults.length === 0 && results.length > 0) {
    return (
      <div className="p-16 text-center text-gray-500 bg-gradient-to-b from-gray-50 to-white">
        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">该分类下暂无文件</h3>
        <p className="text-gray-500">请选择其他分类或查看全部文件</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white">
      {/* 分页信息和统计 */}
      {filteredResults.length > itemsPerPage && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            显示第 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredResults.length)} 项，
            共 {filteredResults.length} 项
          </div>
          <div className="flex items-center gap-2">
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectAll(!allFilteredSelected)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                    title={`全选所有 ${filteredResults.length} 项`}
                  >
                    {allFilteredSelected ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : someFilteredSelected ? (
                      <div className="w-5 h-5 bg-blue-600 rounded border-2 border-blue-600 relative">
                        <div className="absolute inset-1 bg-white rounded-sm" />
                      </div>
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                    全选
                  </button>

                  {filteredResults.length > itemsPerPage && (
                    <button
                      onClick={() => handleSelectCurrentPage(!allCurrentPageSelected)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors ml-2 px-2 py-1 rounded border border-gray-300 hover:border-gray-400"
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">名称</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">大小</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">类型</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">分类</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">安全评估</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedResults.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-6 py-5">
                  <button
                    onClick={() => onSelectItem(item.id, !selectedItems.has(item.id))}
                    className="flex items-center"
                  >
                    {selectedItems.has(item.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-5">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-1">{item.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-sm" title={item.path}>
                      {item.path}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-gray-900 font-semibold">
                  {item.size}
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {getCategoryIcon(item.category)}
                    {item.category}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    {getRiskIcon(item.riskLevel)}
                    {getRiskText(item.riskLevel, item.suggestion)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};