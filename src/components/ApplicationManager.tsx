import React, { useState, useEffect } from 'react';
import { Package, Trash2, Shield, AlertTriangle, Info, Search, Filter, RefreshCw } from 'lucide-react';
import { ApplicationInfo } from '../types';
import { ApplicationManager as AppManager } from '../services/applicationManager';

interface ApplicationManagerProps {
  onClose: () => void;
}

export const ApplicationManager: React.FC<ApplicationManagerProps> = ({ onClose }) => {
  const [applications, setApplications] = useState<ApplicationInfo[]>([]);
  const [filteredApps, setFilteredApps] = useState<ApplicationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, selectedCategory, showOnlyRecommended]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const apps = await AppManager.scanInstalledApplications();
      setApplications(apps);
    } catch (error) {
      console.error('加载应用程序失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.publisher.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 类别过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }

    // 推荐卸载过滤
    if (showOnlyRecommended) {
      filtered = AppManager.getRecommendedForUninstall().filter(app =>
        (!searchTerm || app.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedCategory === 'all' || app.category === selectedCategory)
      );
    }

    setFilteredApps(filtered);
  };

  const handleAppSelection = (appName: string) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(appName)) {
      newSelected.delete(appName);
    } else {
      newSelected.add(appName);
    }
    setSelectedApps(newSelected);
  };

  const getImportanceColor = (importance?: string) => {
    switch (importance) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (app: ApplicationInfo) => {
    if (app.isSystemApp) {
      return <Shield className="w-4 h-4 text-blue-600" />;
    }
    if (app.aiAnalysis?.safeToUninstall === false) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    return <Package className="w-4 h-4 text-gray-600" />;
  };

  const categories = ['all', ...new Set(applications.map(app => app.category))];
  const stats = AppManager.getApplicationStats();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg">正在扫描应用程序...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">应用程序管理器</h2>
            <p className="text-gray-600 mt-1">
              共 {stats.total} 个应用，占用 {AppManager.formatSize(stats.totalSize)} 空间
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 统计信息 */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.userApps}</div>
              <div className="text-sm text-gray-600">用户应用</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.systemApps}</div>
              <div className="text-sm text-gray-600">系统应用</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {AppManager.getRecommendedForUninstall().length}
              </div>
              <div className="text-sm text-gray-600">推荐卸载</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {AppManager.getHighRiskApplications().length}
              </div>
              <div className="text-sm text-gray-600">高风险</div>
            </div>
          </div>
        </div>

        {/* 搜索和过滤 */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索应用程序..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? '所有类别' : category}
                </option>
              ))}
            </select>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnlyRecommended}
                onChange={(e) => setShowOnlyRecommended(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">仅显示推荐卸载</span>
            </label>
            <button
              onClick={loadApplications}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </button>
          </div>
        </div>

        {/* 应用程序列表 */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {filteredApps.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">没有找到匹配的应用程序</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApps.map((app) => (
                  <div
                    key={app.name}
                    className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                      selectedApps.has(app.name) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedApps.has(app.name)}
                          onChange={() => handleAppSelection(app.name)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {getRiskIcon(app)}
                            <h3 className="font-semibold text-gray-900">{app.name}</h3>
                            {app.aiAnalysis && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                getImportanceColor(app.aiAnalysis.importance)
                              }`}>
                                {app.aiAnalysis.importance}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <p>发布商: {app.publisher} | 版本: {app.version}</p>
                            <p>大小: {AppManager.formatSize(app.size)} | 安装日期: {app.installDate.toLocaleDateString()}</p>
                            {app.aiAnalysis && (
                              <p className="mt-2 text-blue-600">
                                AI分析: {app.aiAnalysis.recommendations[0] || '无特殊建议'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {app.aiAnalysis?.safeToUninstall && (
                          <span className="text-green-600 text-sm">可安全卸载</span>
                        )}
                        {app.isSystemApp && (
                          <span className="text-blue-600 text-sm">系统应用</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        {selectedApps.size > 0 && (
          <div className="border-t p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                已选择 {selectedApps.size} 个应用程序
              </span>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedApps(new Set())}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  取消选择
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  onClick={() => {
                    // TODO: 实现批量卸载功能
                    alert('批量卸载功能开发中...');
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  批量卸载
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
