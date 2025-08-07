import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Shield, Info, Clock, MessageCircle, Calendar } from 'lucide-react';
import { formatFileSize } from '../utils/helpers';
import { ScanItem } from '../types';

interface ConfirmDialogProps {
  isOpen: boolean;
  selectedCount: number;
  totalSize: number;
  hasHighRisk: boolean;
  selectedItems: ScanItem[];
  onConfirm: (timeRange?: string, appSelection?: { includeWechat: boolean; includeQQ: boolean }) => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  selectedCount,
  totalSize,
  hasHighRisk,
  selectedItems,
  onConfirm,
  onCancel,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  const [includeWechat, setIncludeWechat] = useState<boolean>(true);
  const [includeQQ, setIncludeQQ] = useState<boolean>(true);

  if (!isOpen) return null;

  // 检查是否包含微信QQ文件
  const chatItems = selectedItems.filter(item => item.category === 'wechat' || item.category === 'qq');
  const isChatCleanup = chatItems.length > 0;

  // 分析微信QQ文件
  const wechatItems = selectedItems.filter(item => item.category === 'wechat');
  const qqItems = selectedItems.filter(item => item.category === 'qq');
  const wechatSize = wechatItems.reduce((sum, item) => sum + item.sizeBytes, 0);
  const qqSize = qqItems.reduce((sum, item) => sum + item.sizeBytes, 0);

  // 分析选中项目的详细信息
  const riskCounts = selectedItems.reduce((acc, item) => {
    acc[item.riskLevel] = (acc[item.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryCounts = selectedItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryDisplayName = (category: string) => {
    const names = {
      system: '系统文件',
      browser: '浏览器数据',
      user: '用户文件',
      registry: '注册表项',
      backup: '备份文件',
      downloads: '下载文件',
      wechat: '微信文件',
      qq: 'QQ文件'
    };
    return names[category as keyof typeof names] || category;
  };

  // 时间范围选项
  const timeRangeOptions = [
    { value: 'all', label: '全部时间', desc: '删除所有选中的文件' },
    { value: '1week', label: '1周前', desc: '删除1周以前的文件' },
    { value: '1month', label: '1个月前', desc: '删除1个月以前的文件' },
    { value: '3months', label: '3个月前', desc: '删除3个月以前的文件' },
    { value: '6months', label: '6个月前', desc: '删除6个月以前的文件' },
    { value: '1year', label: '1年前', desc: '删除1年以前的文件' },
  ];

  // 根据时间范围过滤文件
  const getFilteredItems = () => {
    if (selectedTimeRange === 'all') return selectedItems;

    const now = new Date();
    const cutoffDate = new Date();

    switch (selectedTimeRange) {
      case '1week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '1month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return selectedItems;
    }

    return selectedItems.filter(item => {
      // 假设文件有lastModified属性，如果没有则包含在内
      if (!item.lastModified) return true;
      // 删除指定时间之前的文件（小于cutoffDate的文件）
      return new Date(item.lastModified) <= cutoffDate;
    });
  };

  // 根据用户选择过滤应用类型
  const getAppFilteredItems = () => {
    const timeFilteredItems = getFilteredItems();
    return timeFilteredItems.filter(item => {
      if (item.category === 'wechat') return includeWechat;
      if (item.category === 'qq') return includeQQ;
      return true; // 其他类型的文件保持不变
    });
  };

  const filteredItems = getAppFilteredItems();
  const filteredCount = filteredItems.length;
  const filteredSize = filteredItems.reduce((sum, item) => sum + item.sizeBytes, 0);
  const filteredWechatItems = filteredItems.filter(item => item.category === 'wechat');
  const filteredQqItems = filteredItems.filter(item => item.category === 'qq');
  const filteredWechatSize = filteredWechatItems.reduce((sum, item) => sum + item.sizeBytes, 0);
  const filteredQqSize = filteredQqItems.reduce((sum, item) => sum + item.sizeBytes, 0);

  const getEstimatedTime = () => {
    // 根据文件数量和大小估算清理时间
    const baseTime = Math.max(2, Math.ceil(selectedCount / 10)); // 至少2秒，每10个文件1秒
    const sizeTime = Math.ceil(totalSize / (100 * 1024 * 1024)); // 每100MB 1秒
    return Math.max(baseTime, sizeTime);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {isChatCleanup ? (
              <>
                <MessageCircle className="w-5 h-5 text-green-600" />
                微信QQ清理操作
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5 text-blue-600" />
                确认清理操作
              </>
            )}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isChatCleanup ? (
            <>
              {/* 微信QQ清理界面 */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-green-100">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">清理概览</h4>
                    <p className="text-sm text-gray-600">
                      {filteredCount} 个项目 • {formatFileSize(filteredSize)} 空间
                    </p>
                  </div>
                </div>

                {/* 应用选择 */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">清理项目分类</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {wechatItems.length > 0 && (
                      <div
                        className={`bg-white rounded-lg p-3 border cursor-pointer transition-all ${
                          includeWechat
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-green-200 hover:border-green-300'
                        }`}
                        onClick={() => setIncludeWechat(!includeWechat)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            includeWechat
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300'
                          }`}>
                            {includeWechat && (
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">微信</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {wechatItems.length} 项 • {formatFileSize(wechatSize)}
                          {includeWechat && filteredWechatItems.length !== wechatItems.length && (
                            <span className="text-green-600 ml-1">
                              → {filteredWechatItems.length} 项 • {formatFileSize(filteredWechatSize)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {qqItems.length > 0 && (
                      <div
                        className={`bg-white rounded-lg p-3 border cursor-pointer transition-all ${
                          includeQQ
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-blue-200 hover:border-blue-300'
                        }`}
                        onClick={() => setIncludeQQ(!includeQQ)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            includeQQ
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {includeQQ && (
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">QQ</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {qqItems.length} 项 • {formatFileSize(qqSize)}
                          {includeQQ && filteredQqItems.length !== qqItems.length && (
                            <span className="text-blue-600 ml-1">
                              → {filteredQqItems.length} 项 • {formatFileSize(filteredQqSize)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 时间范围选择 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  选择要删除的文件时间
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  选择删除指定时间之前的文件，保留较新的文件
                </p>
                <div className="space-y-2">
                  {timeRangeOptions.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="timeRange"
                        value={option.value}
                        checked={selectedTimeRange === option.value}
                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 选择提示 */}
              {!includeWechat && !includeQQ && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-800 mb-1">请选择要清理的应用</h4>
                      <p className="text-sm text-yellow-700">
                        请至少选择一个应用（微信或QQ）进行清理
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 安全提醒 */}
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-green-800 mb-1">安全提醒</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• 所有文件将被移至系统回收站，可恢复</li>
                      <li>• 清理过程中请勿关闭微信和QQ应用</li>
                      <li>• 建议先备份重要的聊天记录</li>
                      <li>• 不会删除联系人和好友信息</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 普通清理界面 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Trash2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">清理概览</h4>
                    <p className="text-sm text-gray-600">
                      {selectedCount} 个项目 • {formatFileSize(totalSize)} 空间
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            取消操作
          </button>
          <button
            onClick={() => {
              if (isChatCleanup) {
                onConfirm(selectedTimeRange, { includeWechat, includeQQ });
              } else {
                onConfirm();
              }
            }}
            disabled={isChatCleanup && !includeWechat && !includeQQ}
            className={`px-6 py-2.5 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg ${
              isChatCleanup && !includeWechat && !includeQQ
                ? 'bg-gray-400 cursor-not-allowed'
                : isChatCleanup
                ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 hover:shadow-xl transform hover:scale-105'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isChatCleanup
              ? !includeWechat && !includeQQ
                ? '请选择应用'
                : `🧹 开始清理 (${filteredCount}项)`
              : '🗑️ 开始清理'
            }
          </button>
        </div>
      </div>
    </div>
  );
};