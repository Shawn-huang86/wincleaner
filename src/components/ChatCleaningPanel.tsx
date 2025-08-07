import React, { useState } from 'react';
import { X, MessageCircle, Calendar, Trash2, Shield, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { ScanItem, ScanProgress, ChatFileSettings } from '../types';
import { formatFileSize } from '../utils/helpers';
import { simulateScanning } from '../utils/scanner';

interface ChatCleaningPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCleanFiles: (fileIds: string[]) => void;
  chatFileSettings: ChatFileSettings;
}

interface TimeRange {
  label: string;
  value: number; // 月数，0表示全部
  description: string;
}

const TIME_RANGES: TimeRange[] = [
  { label: '全部文件', value: 0, description: '清理所有聊天文件（不推荐）' },
  { label: '6个月前', value: 6, description: '清理6个月前的聊天文件' },
  { label: '3个月前', value: 3, description: '清理3个月前的聊天文件' },
  { label: '1个月前', value: 1, description: '清理1个月前的聊天文件' },
  { label: '1周前', value: 0.25, description: '清理1周前的聊天文件' },
];

export const ChatCleaningPanel: React.FC<ChatCleaningPanelProps> = ({
  isOpen,
  onClose,
  onCleanFiles,
  chatFileSettings,
}) => {
  const [selectedApp, setSelectedApp] = useState<'wechat' | 'qq' | 'both'>('both');
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(3); // 默认3个月前
  const [showPreview, setShowPreview] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({ current: 0, total: 0, currentItem: '' });
  const [scanResults, setScanResults] = useState<ScanItem[]>([]);

  if (!isOpen) return null;

  // 独立的微信QQ扫描功能
  const handleScanChatFiles = async () => {
    setIsScanning(true);
    setScanResults([]);
    
    // 只扫描微信和QQ文件
    await simulateScanning(
      setScanProgress, 
      setScanResults, 
      true, // 深度扫描
      chatFileSettings,
      'chat-only' // 只扫描聊天文件
    );
    
    setIsScanning(false);
  };

  // 获取聊天文件
  const getChatFiles = () => {
    return scanResults.filter(item => 
      item.category === 'wechat' || item.category === 'qq'
    );
  };

  // 根据选择筛选文件
  const getFilteredFiles = () => {
    const chatFiles = getChatFiles();
    
    return chatFiles.filter(item => {
      // 应用筛选
      if (selectedApp === 'wechat' && item.category !== 'wechat') return false;
      if (selectedApp === 'qq' && item.category !== 'qq') return false;
      
      // 时间筛选（模拟）
      if (selectedTimeRange > 0) {
        // 这里应该根据真实文件时间判断，现在用随机模拟
        const shouldInclude = Math.random() > 0.3; // 70%的文件符合时间条件
        if (!shouldInclude) return false;
      }
      
      return true;
    });
  };

  const filteredFiles = getFilteredFiles();
  const totalSize = filteredFiles.reduce((sum, file) => sum + file.sizeBytes, 0);
  const wechatFiles = filteredFiles.filter(f => f.category === 'wechat');
  const qqFiles = filteredFiles.filter(f => f.category === 'qq');

  const handleClean = () => {
    if (filteredFiles.length === 0) return;
    
    const fileIds = filteredFiles.map(file => file.id);
    onCleanFiles(fileIds);
    onClose();
  };

  const getAppIcon = (app: string) => {
    if (app === 'wechat') {
      return <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
        <span className="text-white text-xs font-bold">微</span>
      </div>;
    }
    return <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
      <span className="text-white text-xs font-bold">Q</span>
    </div>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">微信QQ清理</h2>
              <p className="text-sm text-gray-600">独立扫描和清理微信QQ文件</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 扫描区域 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                扫描微信QQ文件
              </h3>
              <button
                onClick={handleScanChatFiles}
                disabled={isScanning}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Search className="w-4 h-4" />
                {isScanning ? '扫描中...' : '开始扫描'}
              </button>
            </div>
            
            {isScanning && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-6 h-6 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <span className="text-sm font-medium text-blue-800">正在扫描微信QQ文件...</span>
                  </div>
                  <div className="text-sm font-medium text-blue-700">
                    {scanProgress.current}/{scanProgress.total}
                  </div>
                </div>
                
                {scanProgress.currentItem && (
                  <div className="text-sm text-blue-600 mb-3 bg-white/50 rounded px-2 py-1">
                    <span className="font-medium">当前扫描:</span> {scanProgress.currentItem}
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-blue-600">
                    <span>扫描进度</span>
                    <span>{scanProgress.total > 0 ? Math.round((scanProgress.current / scanProgress.total) * 100) : 0}%</span>
                  </div>
                  <div className="bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${scanProgress.total > 0 ? (scanProgress.current / scanProgress.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            {scanResults.length > 0 && !isScanning && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">扫描完成！</span>
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    找到 {scanResults.length} 个文件
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/70 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-600">
                      {scanResults.filter(f => f.category === 'wechat').length}
                    </div>
                    <div className="text-xs text-gray-600">微信文件</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {scanResults.filter(f => f.category === 'qq').length}
                    </div>
                    <div className="text-xs text-gray-600">QQ文件</div>
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <div className="text-sm text-gray-600">
                    总大小: <span className="font-medium text-gray-800">
                      {formatFileSize(scanResults.reduce((sum, file) => sum + file.sizeBytes, 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 提示信息 */}
          {scanResults.length === 0 && !isScanning && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">请先点击"开始扫描"来查找微信QQ文件</span>
              </div>
              <div className="text-xs text-yellow-700 mt-1">
                扫描完成后，您可以选择要清理的应用和时间范围
              </div>
            </div>
          )}

          {/* 应用选择和时间范围选择 - 只有扫描完成后才显示 */}
          {scanResults.length > 0 && (
            <>
              {/* 应用选择 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  选择应用
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedApp('both')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedApp === 'both'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {getAppIcon('wechat')}
                      {getAppIcon('qq')}
                    </div>
                    <div className="text-sm font-medium text-gray-900">微信 + QQ</div>
                    <div className="text-xs text-gray-500">清理两个应用</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedApp('wechat')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedApp === 'wechat'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {getAppIcon('wechat')}
                    </div>
                    <div className="text-sm font-medium text-gray-900">仅微信</div>
                    <div className="text-xs text-gray-500">只清理微信文件</div>
                  </button>
                  
                  <button
                    onClick={() => setSelectedApp('qq')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedApp === 'qq'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {getAppIcon('qq')}
                    </div>
                    <div className="text-sm font-medium text-gray-900">仅QQ</div>
                    <div className="text-xs text-gray-500">只清理QQ文件</div>
                  </button>
                </div>
              </div>

              {/* 时间范围选择 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  时间范围
                </h3>
                <div className="space-y-2">
                  {TIME_RANGES.map((range) => (
                    <label
                      key={range.value}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedTimeRange === range.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="timeRange"
                          value={range.value}
                          checked={selectedTimeRange === range.value}
                          onChange={() => setSelectedTimeRange(range.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{range.label}</div>
                          <div className="text-sm text-gray-500">{range.description}</div>
                        </div>
                      </div>
                      {range.value === 0 && (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showPreview ? '隐藏详情' : '查看详情'}
            </button>
            {filteredFiles.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                将清理 {filteredFiles.length} 个文件，释放 {formatFileSize(totalSize)}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleClean}
              disabled={filteredFiles.length === 0 || isScanning}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Trash2 className="w-4 h-4" />
              {scanResults.length === 0 ? '请先扫描' : '开始清理'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
