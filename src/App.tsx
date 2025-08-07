import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CategoryFilter } from './components/CategoryFilter';
import { Sidebar } from './components/Sidebar';
import { ScanSection } from './components/ScanSection';
import { ResultsTable } from './components/ResultsTable';
import { StatusBar } from './components/StatusBar';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SuccessDialog } from './components/SuccessDialog';
import { SettingsPanel } from './components/SettingsPanel';
import { FileIdentifier } from './components/FileIdentifier';
import { CleaningProgress } from './components/CleaningProgress';
import { ChatCleaningPanel } from './components/ChatCleaningPanel';
import { ScanItem, ScanProgress, ChatFileSettings } from './types';
import { simulateScanning, generateReport } from './utils/scanner';

function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({ current: 0, total: 0, currentItem: '' });
  const [scanResults, setScanResults] = useState<ScanItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [deepScan, setDeepScan] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFileIdentifier, setShowFileIdentifier] = useState(false);
  const [showCleaningProgress, setShowCleaningProgress] = useState(false);
  const [showChatCleaningPanel, setShowChatCleaningPanel] = useState(false);
  const [chatFileSettings, setChatFileSettings] = useState<ChatFileSettings>({
    wechatMonths: 3,
    qqMonths: 3
  });
  const [cleaningProgress, setCleaningProgress] = useState({
    current: 0,
    total: 0,
    currentFileName: '',
    estimatedTimeLeft: 0,
    totalSize: 0,
    cleanedSize: 0
  });
  const [currentCleaningItem, setCurrentCleaningItem] = useState<ScanItem | null>(null);
  const [totalSpaceFreed, setTotalSpaceFreed] = useState(0);
  const [scanHistory, setScanHistory] = useState<Array<{date: string, itemsFound: number, spaceFreed: number}>>([]);
  const [cleaningCancelled, setCleaningCancelled] = useState(false);

  // 根据选中的分类过滤结果
  const filteredResults = selectedCategory 
    ? scanResults.filter(item => item.category === selectedCategory)
    : scanResults;
  const handleStartScan = async () => {
    setIsScanning(true);
    setScanResults([]);
    setSelectedItems(new Set());
    setSelectedCategory(null);
    
    // 主扫描排除微信QQ文件
    await simulateScanning(setScanProgress, setScanResults, deepScan, chatFileSettings, 'exclude-chat');
    
    setIsScanning(false);
    
    // Add to scan history
    const newScan = {
      date: new Date().toLocaleDateString('zh-CN'),
      itemsFound: scanResults.length,
      spaceFreed: 0
    };
    setScanHistory(prev => [newScan, ...prev.slice(0, 4)]);
  };

  const handleSelectItem = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    const newSelected = new Set(selectedItems);

    if (selected) {
      // 添加当前筛选结果中的所有项目
      filteredResults.forEach(item => newSelected.add(item.id));
    } else {
      // 只移除当前筛选结果中的项目，保留其他分类中的选择
      filteredResults.forEach(item => newSelected.delete(item.id));
    }

    setSelectedItems(newSelected);
  };

  const getTotalSelectedSize = () => {
    return scanResults
      .filter(item => selectedItems.has(item.id))
      .reduce((total, item) => total + item.sizeBytes, 0);
  };

  const hasHighRiskItems = () => {
    return scanResults
      .filter(item => selectedItems.has(item.id))
      .some(item => item.riskLevel === 'high');
  };

  const handleCleanSelected = () => {
    if (selectedItems.size === 0) return;
    setShowConfirmDialog(true);
  };

  const confirmClean = async () => {
    setShowConfirmDialog(false);
    setShowCleaningProgress(true);
    setCleaningCancelled(false);

    const itemsToClean = scanResults.filter(item => selectedItems.has(item.id));
    const totalSize = getTotalSelectedSize();
    let cleanedSize = 0;

    // 初始化清理进度
    setCleaningProgress({
      current: 0,
      total: itemsToClean.length,
      currentFileName: '',
      estimatedTimeLeft: Math.max(2, Math.ceil(itemsToClean.length / 10)),
      totalSize,
      cleanedSize: 0
    });

    // 模拟真实的清理过程
    for (let i = 0; i < itemsToClean.length; i++) {
      if (cleaningCancelled) break;

      const item = itemsToClean[i];
      setCurrentCleaningItem(item);
      cleanedSize += item.sizeBytes;

      // 根据文件大小计算处理时间（大文件需要更长时间）
      const processingTime = Math.max(300, Math.min(2000, item.sizeBytes / (1024 * 1024) * 100));
      const remainingItems = itemsToClean.length - i - 1;
      const estimatedTimeLeft = Math.ceil(remainingItems * (processingTime / 1000));

      setCleaningProgress({
        current: i + 1,
        total: itemsToClean.length,
        currentFileName: item.name,
        estimatedTimeLeft,
        totalSize,
        cleanedSize
      });

      await new Promise(resolve => setTimeout(resolve, processingTime));
    }

    setShowCleaningProgress(false);
    setCurrentCleaningItem(null);

    if (!cleaningCancelled) {
      // Remove cleaned items from results
      setScanResults(prev => prev.filter(item => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      setTotalSpaceFreed(totalSize);

      // Update scan history with cleaned space
      setScanHistory(prev => prev.map((scan, index) =>
        index === 0 ? { ...scan, spaceFreed: totalSize } : scan
      ));

      // Generate and download report
      const report = generateReport(itemsToClean, totalSize);
      const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `清理报告_${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      setShowSuccessDialog(true);
    }

    // 重置清理进度
    setCleaningProgress({
      current: 0,
      total: 0,
      currentFileName: '',
      estimatedTimeLeft: 0,
      totalSize: 0,
      cleanedSize: 0
    });
  };

  const handleCancelCleaning = () => {
    setCleaningCancelled(true);
    setShowCleaningProgress(false);
    setCurrentCleaningItem(null);
  };

  const handleChatCleanFiles = (fileIds: string[]) => {
    // 选中指定的文件
    setSelectedItems(new Set(fileIds));
    // 直接开始清理
    setShowConfirmDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* 顶部标题栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <Header
          onOpenFileIdentifier={() => setShowFileIdentifier(true)}
          onOpenChatCleaning={() => setShowChatCleaningPanel(true)}
          onStartMainScan={handleStartScan}
          isScanning={isScanning}
        />
      </div>

      {/* 主要内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 */}
        <Sidebar
          scanResults={scanResults}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          isScanning={isScanning}
        />

        {/* 右侧主内容 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 仪表板 */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <Dashboard
              scanResults={scanResults}
              selectedItems={selectedItems}
              scanHistory={scanHistory}
              onShowSettings={() => setShowSettings(true)}
            />
          </div>

          {/* 扫描和结果区域 */}
          <div className="flex-1 flex flex-col">
            <div className="p-3">
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col" style={{height: 'calc(100vh - 200px)'}}>
                <ScanSection
                  isScanning={isScanning}
                  deepScan={deepScan}
                  scanProgress={scanProgress}
                  onToggleDeepScan={setDeepScan}
                />

                <div className="flex-1 flex flex-col min-h-0">
                  <ResultsTable
                    results={scanResults}
                    filteredResults={filteredResults}
                    selectedItems={selectedItems}
                    onSelectItem={handleSelectItem}
                    onSelectAll={handleSelectAll}
                  />
                </div>

                <StatusBar
                  scanResults={filteredResults}
                  selectedItems={selectedItems}
                  totalSelectedSize={getTotalSelectedSize()}
                  cleaningProgress={{ current: 0, total: 0 }}
                  onCleanSelected={handleCleanSelected}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 对话框组件 */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        selectedCount={selectedItems.size}
        totalSize={getTotalSelectedSize()}
        hasHighRisk={hasHighRiskItems()}
        selectedItems={scanResults.filter(item => selectedItems.has(item.id))}
        onConfirm={confirmClean}
        onCancel={() => setShowConfirmDialog(false)}
      />

      <CleaningProgress
        isOpen={showCleaningProgress}
        currentItem={currentCleaningItem}
        progress={cleaningProgress}
        onCancel={handleCancelCleaning}
      />

      <SuccessDialog
        isOpen={showSuccessDialog}
        totalSpaceFreed={totalSpaceFreed}
        onClose={() => setShowSuccessDialog(false)}
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        chatFileSettings={chatFileSettings}
        onChatFileSettingsChange={setChatFileSettings}
      />

      <FileIdentifier
        isOpen={showFileIdentifier}
        onClose={() => setShowFileIdentifier(false)}
      />

      <ChatCleaningPanel
        isOpen={showChatCleaningPanel}
        onClose={() => setShowChatCleaningPanel(false)}
        onCleanFiles={handleChatCleanFiles}
        chatFileSettings={chatFileSettings}
      />
    </div>
  );
}

export default App;