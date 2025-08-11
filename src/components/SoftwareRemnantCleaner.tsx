import React, { useState, useEffect } from 'react';
import { X, Search, Trash2, AlertTriangle, CheckCircle, RefreshCw, Filter, Package, Database, File, Link, Settings, Shield } from 'lucide-react';
import { SoftwareRemnant, SoftwareRemnantDetector } from '../services/softwareRemnantDetector';
import { RegistryItem, RegistryScanner } from '../services/registryScanner';
import { ApplicationManager } from '../services/applicationManager';
import { PrivacyItem, PrivacyCleaner } from '../services/privacyCleaner';

interface SoftwareRemnantCleanerProps {
  isOpen: boolean;
  onClose: () => void;
}

type RemnantType = 'all' | 'file' | 'folder' | 'registry' | 'shortcut' | 'service' | 'privacy';

export const SoftwareRemnantCleaner: React.FC<SoftwareRemnantCleanerProps> = ({ isOpen, onClose }) => {
  const [remnants, setRemnants] = useState<SoftwareRemnant[]>([]);
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>([]);
  const [privacyItems, setPrivacyItems] = useState<PrivacyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<RemnantType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, currentItem: '' });

  useEffect(() => {
    if (isOpen) {
      startScan();
    }
  }, [isOpen]);

  const startScan = async () => {
    console.log('开始专项清理扫描...');
    setLoading(true);
    setRemnants([]);
    setRegistryItems([]);
    setPrivacyItems([]);
    setSelectedItems(new Set());
    setScanProgress({ current: 0, total: 3, currentItem: '准备扫描...' });

    try {
      // 第一阶段：扫描软件残留
      console.log('第一阶段：扫描软件残留');
      setScanProgress({ current: 1, total: 3, currentItem: '正在扫描已安装的应用程序...' });

      // 添加延迟以确保用户能看到进度
      await new Promise(resolve => setTimeout(resolve, 1000));

      const installedApps = await ApplicationManager.scanInstalledApplications();

      setScanProgress({ current: 1, total: 3, currentItem: '正在检测软件残留文件...' });
      await new Promise(resolve => setTimeout(resolve, 800));

      const softwareRemnants = await SoftwareRemnantDetector.scanSoftwareRemnants(
        installedApps,
        (progress) => setScanProgress({ ...progress, current: 1, total: 3 })
      );
      console.log('软件残留扫描完成，找到:', softwareRemnants.length, '项');

      // 第二阶段：扫描注册表残留
      console.log('第二阶段：扫描注册表残留');
      setScanProgress({ current: 2, total: 3, currentItem: '正在扫描注册表项...' });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const registryRemnants = await RegistryScanner.scanRegistryRemnants(
        (progress) => setScanProgress({ ...progress, current: 2, total: 3 })
      );
      console.log('注册表残留扫描完成，找到:', registryRemnants.length, '项');

      // 第三阶段：扫描隐私数据
      console.log('第三阶段：扫描隐私数据');
      setScanProgress({ current: 3, total: 3, currentItem: '正在扫描隐私数据...' });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const privacyData = await PrivacyCleaner.scanPrivacyData(
        (progress) => setScanProgress({ current: 3, total: 3, currentItem: progress.currentPath || '扫描隐私数据...' })
      );
      console.log('隐私数据扫描完成，找到:', privacyData.length, '项');

      setRemnants(softwareRemnants);
      setRegistryItems(registryRemnants);
      setPrivacyItems(privacyData);

      console.log('所有扫描完成');
    } catch (error) {
      console.error('专项清理扫描失败:', error);
    } finally {
      setLoading(false);
      setScanProgress({ current: 0, total: 0, currentItem: '' });
    }
  };

  const getFilteredItems = () => {
    let allItems: (SoftwareRemnant | RegistryItem | PrivacyItem)[] = [...remnants];

    // 将注册表项转换为统一格式
    const convertedRegistryItems = registryItems.map(item => ({
      ...item,
      type: 'registry' as const,
      relatedSoftware: item.relatedSoftware || 'Unknown',
      size: 0
    }));

    // 将隐私数据项转换为统一格式
    const convertedPrivacyItems = privacyItems.map(item => ({
      ...item,
      type: 'privacy' as const,
      relatedSoftware: '系统隐私数据',
      confidence: 0.9 // 隐私数据通常可以安全清理
    }));

    allItems.push(...convertedRegistryItems);
    allItems.push(...convertedPrivacyItems);

    // 类型过滤
    if (filterType !== 'all') {
      allItems = allItems.filter(item => item.type === filterType);
    }

    // 搜索过滤
    if (searchTerm) {
      allItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.relatedSoftware.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.path.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 推荐清理过滤
    if (showOnlyRecommended) {
      allItems = allItems.filter(item =>
        item.canDelete &&
        ('confidence' in item ? item.confidence >= 0.7 : true) &&
        item.riskLevel !== 'dangerous'
      );
    }

    return allItems;
  };

  const handleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    const filteredItems = getFilteredItems();
    const selectableItems = filteredItems.filter(item => item.canDelete);
    
    if (selectedItems.size === selectableItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(selectableItems.map(item => item.id)));
    }
  };

  const handleCleanSelected = async () => {
    if (selectedItems.size === 0) return;

    const confirmed = window.confirm(
      `确定要清理选中的 ${selectedItems.size} 个残留项吗？\n\n此操作将删除选中的文件、文件夹和注册表项。`
    );

    if (confirmed) {
      // TODO: 实现实际的清理功能
      alert('清理功能开发中...');
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      file: File,
      folder: Package,
      registry: Database,
      privacy: Shield,
      shortcut: Link,
      service: Settings
    };
    const IconComponent = icons[type as keyof typeof icons] || File;
    return <IconComponent className="w-4 h-4" />;
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'text-green-600 bg-green-100';
      case 'caution': return 'text-yellow-600 bg-yellow-100';
      case 'dangerous': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredItems = getFilteredItems();
  const stats = {
    total: remnants.length + registryItems.length + privacyItems.length,
    files: remnants.filter(r => r.type === 'file').length,
    folders: remnants.filter(r => r.type === 'folder').length,
    registry: registryItems.length,
    privacy: privacyItems.length,
    shortcuts: remnants.filter(r => r.type === 'shortcut').length,
    services: remnants.filter(r => r.type === 'service').length,
    totalSize: remnants.reduce((sum, r) => sum + (r.size || 0), 0) + privacyItems.reduce((sum, p) => sum + p.size, 0),
    canDelete: filteredItems.filter(item => item.canDelete).length
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[95vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">专项清理</h2>
              <p className="text-gray-600 text-sm">软件残留清理和隐私数据清理工具集</p>
            </div>
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
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">总项目</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.files}</div>
              <div className="text-sm text-gray-600">文件</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.folders}</div>
              <div className="text-sm text-gray-600">文件夹</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.registry}</div>
              <div className="text-sm text-gray-600">注册表</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{stats.privacy}</div>
              <div className="text-sm text-gray-600">隐私数据</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.shortcuts}</div>
              <div className="text-sm text-gray-600">快捷方式</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.canDelete}</div>
              <div className="text-sm text-gray-600">可清理</div>
            </div>
          </div>
          {stats.totalSize > 0 && (
            <div className="mt-4 text-center">
              <span className="text-lg font-semibold text-gray-700">
                总大小: {SoftwareRemnantDetector.formatSize(stats.totalSize)}
              </span>
            </div>
          )}
        </div>

        {/* 搜索和过滤 */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索残留项..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as RemnantType)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">所有类型</option>
              <option value="file">文件</option>
              <option value="folder">文件夹</option>
              <option value="registry">注册表</option>
              <option value="privacy">隐私数据</option>
              <option value="shortcut">快捷方式</option>
              <option value="service">服务</option>
            </select>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnlyRecommended}
                onChange={(e) => setShowOnlyRecommended(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">仅显示推荐清理</span>
            </label>
            <button
              onClick={() => {
                console.log('重新扫描按钮被点击，当前loading状态:', loading);
                startScan();
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              重新扫描
            </button>
          </div>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-800 mb-2">
              {scanProgress.currentItem || '正在扫描软件残留...'}
            </p>
            {scanProgress.total > 0 && (
              <>
                <div className="mt-4 text-sm text-gray-500 mb-2">
                  阶段 {scanProgress.current} / {scanProgress.total}
                </div>
                <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 残留项列表 */}
        {!loading && (
          <div className="flex-1 overflow-auto">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">没有发现需要清理的项目</h3>
                <p className="text-gray-500">您的系统很干净，没有发现需要清理的软件残留或隐私数据。</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                        selectedItems.has(item.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => handleItemSelection(item.id)}
                            disabled={!item.canDelete}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getTypeIcon(item.type)}
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(item.riskLevel)}`}>
                                {item.riskLevel}
                              </span>
                              <span className={`text-sm font-medium ${getConfidenceColor(item.confidence)}`}>
                                {Math.round(item.confidence * 100)}%
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>路径:</strong> {item.path}</p>
                              <p><strong>相关软件:</strong> {item.relatedSoftware}</p>
                              <p><strong>描述:</strong> {item.description}</p>
                              <p><strong>原因:</strong> {item.reason}</p>
                              {'size' in item && item.size && (
                                <p><strong>大小:</strong> {SoftwareRemnantDetector.formatSize(item.size)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.canDelete ? (
                            <span className="text-green-600 text-sm flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              可清理
                            </span>
                          ) : (
                            <span className="text-red-600 text-sm flex items-center">
                              <Shield className="w-4 h-4 mr-1" />
                              受保护
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 底部操作栏 */}
        {!loading && filteredItems.length > 0 && (
          <div className="border-t p-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  {selectedItems.size === filteredItems.filter(item => item.canDelete).length ? '取消全选' : '全选可清理项'}
                </button>
                <span className="text-sm text-gray-600">
                  已选择 {selectedItems.size} 个项目
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  取消选择
                </button>
                <button
                  onClick={handleCleanSelected}
                  disabled={selectedItems.size === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清理选中项 ({selectedItems.size})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
