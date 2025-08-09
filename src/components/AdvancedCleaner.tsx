import React, { useState, useEffect } from 'react';
import { X, Search, Trash2, AlertTriangle, CheckCircle, RefreshCw, Filter, Shield, Zap, Database, Lock, Wifi, HardDrive } from 'lucide-react';
import { 
  AdvancedCleanerManager, 
  AdvancedCleaningItem, 
  AdvancedCleaningCategory, 
  AdvancedCleaningStats,
  AdvancedCleaningProgress,
  AdvancedCleaningResult
} from '../services/advancedCleanerManager';

interface AdvancedCleanerProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | AdvancedCleaningCategory;

export const AdvancedCleaner: React.FC<AdvancedCleanerProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<AdvancedCleaningItem[]>([]);
  const [stats, setStats] = useState<AdvancedCleaningStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlySafe, setShowOnlySafe] = useState(false);
  const [scanProgress, setScanProgress] = useState<AdvancedCleaningProgress | null>(null);
  const [cleaningResult, setCleaningResult] = useState<AdvancedCleaningResult | null>(null);

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setItems([]);
      setStats(null);
      setSelectedItems(new Set());
      setScanProgress(null);
      setCleaningResult(null);
    }
  }, [isOpen]);

  const startScan = async () => {
    setLoading(true);
    setItems([]);
    setStats(null);
    setSelectedItems(new Set());
    setScanProgress(null);

    try {
      const scannedItems = await AdvancedCleanerManager.scanAllCategories(
        undefined,
        (progress) => setScanProgress(progress)
      );
      
      setItems(scannedItems);
      
      const scanStats = await AdvancedCleanerManager.getAdvancedCleaningStats(scannedItems);
      setStats(scanStats);
    } catch (error) {
      console.error('高级扫描失败:', error);
    } finally {
      setLoading(false);
      setScanProgress(null);
    }
  };

  const startCleaning = async () => {
    const itemsToClean = items.filter(item => selectedItems.has(item.id));
    if (itemsToClean.length === 0) return;

    setCleaning(true);
    setCleaningResult(null);

    try {
      const result = await AdvancedCleanerManager.performAdvancedCleaning(
        itemsToClean,
        (progress) => setScanProgress(progress)
      );
      
      setCleaningResult(result);
      
      // 重新扫描以更新列表
      if (result.success) {
        setTimeout(() => {
          startScan();
        }, 1000);
      }
    } catch (error) {
      console.error('高级清理失败:', error);
    } finally {
      setCleaning(false);
      setScanProgress(null);
    }
  };

  const getFilteredItems = () => {
    let filteredItems = items;

    // 类型过滤
    if (filterType !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === filterType);
    }

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.path.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    }

    // 安全级别过滤
    if (showOnlySafe) {
      filteredItems = filteredItems.filter(item => item.riskLevel === 'safe');
    }

    return filteredItems;
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const selectAllSafeItems = () => {
    const safeItems = getFilteredItems().filter(item => item.riskLevel === 'safe' && item.canDelete);
    const newSelection = new Set(selectedItems);
    safeItems.forEach(item => newSelection.add(item.id));
    setSelectedItems(newSelection);
  };

  const selectAllItems = () => {
    const allItems = getFilteredItems().filter(item => item.canDelete);
    const allItemIds = new Set(allItems.map(item => item.id));
    setSelectedItems(allItemIds);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const getCategoryIcon = (category: AdvancedCleaningCategory) => {
    const icons = {
      'system-logs': Database,
      'windows-updates': RefreshCw,
      'system-cache': Zap,
      'privacy-data': Lock,
      'memory-optimization': HardDrive,
      'network-cleanup': Wifi
    };
    const IconComponent = icons[category] || Database;
    return <IconComponent className="w-4 h-4" />;
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'safe': return 'text-green-600';
      case 'caution': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredItems = getFilteredItems();
  const selectedCount = selectedItems.size;
  const selectedSize = items
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.size, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">高级系统清理</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 统计信息 */}
        {stats && (
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
                <div className="text-sm text-gray-600">总项目</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatFileSize(stats.estimatedSpaceSaving)}</div>
                <div className="text-sm text-gray-600">可释放空间</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.estimatedPerformanceGain}</div>
                <div className="text-sm text-gray-600">性能提升</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.riskDistribution.safe}/{stats.riskDistribution.caution}/{stats.riskDistribution.high}
                </div>
                <div className="text-sm text-gray-600">安全/谨慎/高风险</div>
              </div>
            </div>
          </div>
        )}

        {/* 扫描进度 */}
        {scanProgress && (
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">{scanProgress.categoryName}</span>
              <span className="text-sm text-blue-700">{scanProgress.overallProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress.overallProgress}%` }}
              ></div>
            </div>
            {scanProgress.currentItem && (
              <div className="text-xs text-blue-600 mt-1">{scanProgress.currentItem}</div>
            )}
          </div>
        )}

        {/* 清理结果 */}
        {cleaningResult && (
          <div className="p-4 bg-green-50 border-b">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-900">
                清理完成: {cleaningResult.totalCleaned}/{cleaningResult.totalProcessed} 项
              </span>
            </div>
            {cleaningResult.overallWarnings.length > 0 && (
              <div className="text-sm text-yellow-700 mt-2">
                <strong>注意事项:</strong>
                <ul className="list-disc list-inside mt-1">
                  {cleaningResult.overallWarnings.slice(0, 3).map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 控制栏 */}
        <div className="p-4 border-b bg-white">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={startScan}
              disabled={loading || cleaning}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? '扫描中...' : '开始扫描'}
            </button>

            <button
              onClick={startCleaning}
              disabled={selectedCount === 0 || loading || cleaning}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {cleaning ? '清理中...' : `清理选中项 (${selectedCount})`}
            </button>

            <button
              onClick={selectAllItems}
              disabled={loading || cleaning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              全选
            </button>

            <button
              onClick={selectAllSafeItems}
              disabled={loading || cleaning}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              选择安全项
            </button>
          </div>

          {selectedCount > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              已选择 {selectedCount} 项，预计释放 {formatFileSize(selectedSize)}
            </div>
          )}
        </div>

        {/* 过滤器 */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">所有类别</option>
                <option value="system-logs">系统日志</option>
                <option value="windows-updates">Windows 更新</option>
                <option value="system-cache">系统缓存</option>
                <option value="privacy-data">隐私数据</option>
                <option value="memory-optimization">内存优化</option>
                <option value="network-cleanup">网络清理</option>
              </select>
            </div>

            <div className="flex items-center">
              <Search className="w-4 h-4 mr-2 text-gray-500" />
              <input
                type="text"
                placeholder="搜索项目..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnlySafe}
                onChange={(e) => setShowOnlySafe(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">仅显示安全项</span>
            </label>
          </div>
        </div>

        {/* 项目列表 */}
        <div className="flex-1 overflow-auto">
          {filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              {loading ? '正在扫描...' : '点击"开始扫描"来查找可清理的项目'}
            </div>
          ) : (
            <div className="p-4">
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 ${
                      selectedItems.has(item.id) ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      disabled={!item.canDelete}
                      className="mr-3"
                    />
                    
                    <div className="flex items-center mr-3">
                      {getCategoryIcon(item.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getRiskColor(item.riskLevel)}`}>
                          {item.riskLevel === 'safe' ? '安全' : item.riskLevel === 'caution' ? '谨慎' : '高风险'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{item.description}</p>
                      <p className="text-xs text-gray-500 truncate">{item.path}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{formatFileSize(item.size)}</div>
                      <div className="text-xs text-gray-500">
                        {AdvancedCleanerManager.getCategoryName(item.category)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
