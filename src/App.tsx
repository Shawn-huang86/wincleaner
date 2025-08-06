import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CategoryFilter } from './components/CategoryFilter';
import { ScanSection } from './components/ScanSection';
import { ResultsTable } from './components/ResultsTable';
import { StatusBar } from './components/StatusBar';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SuccessDialog } from './components/SuccessDialog';
import { SettingsPanel } from './components/SettingsPanel';
import { FileIdentifier } from './components/FileIdentifier';
import { CleaningProgress } from './components/CleaningProgress';
import { ScanItem, ScanProgress } from './types';
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
    
    await simulateScanning(setScanProgress, setScanResults, deepScan);
    
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
    if (selected) {
      const allIds = filteredResults.map(item => item.id);
      setSelectedItems(new Set(allIds));
    } else {
      setSelectedItems(new Set());
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        <Header onOpenFileIdentifier={() => setShowFileIdentifier(true)} />
        
        {/* Dashboard */}
        <Dashboard 
          scanResults={scanResults}
          selectedItems={selectedItems}
          scanHistory={scanHistory}
          onShowSettings={() => setShowSettings(true)}
        />
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-6">
          <ScanSection
            isScanning={isScanning}
            deepScan={deepScan}
            scanProgress={scanProgress}
            onStartScan={handleStartScan}
            onToggleDeepScan={setDeepScan}
          />
          
          {scanResults.length > 0 && (
            <CategoryFilter
              scanResults={scanResults}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          )}
          
          <ResultsTable
            results={scanResults}
            filteredResults={filteredResults}
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onSelectAll={handleSelectAll}
          />
          
          <StatusBar
            scanResults={filteredResults}
            selectedItems={selectedItems}
            totalSelectedSize={getTotalSelectedSize()}
            cleaningProgress={{ current: 0, total: 0 }}
            onCleanSelected={handleCleanSelected}
          />
        </div>
      </div>

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
      />

      <FileIdentifier
        isOpen={showFileIdentifier}
        onClose={() => setShowFileIdentifier(false)}
      />
    </div>
  );
}

export default App;