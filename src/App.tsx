import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';

import { ScanSection } from './components/ScanSection';
import { ResultsTable } from './components/ResultsTable';
import { StatusBar } from './components/StatusBar';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SuccessDialog } from './components/SuccessDialog';
import { SettingsPanel } from './components/SettingsPanel';
import { FileIdentifier } from './components/FileIdentifier';
import { CleaningProgress } from './components/CleaningProgress';
import { ApplicationManager } from './components/ApplicationManager';
import { SoftwareRemnantCleaner } from './components/SoftwareRemnantCleaner';

import { ScanItem, ScanProgress, ChatFileSettings } from './types';
import { simulateScanning, formatFileSize } from './utils/scanner';
import { RealScanner } from './utils/realScanner';
import { RealCleaner } from './utils/realCleaner';

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
  const [showApplicationManager, setShowApplicationManager] = useState(false);
  const [showSoftwareRemnantCleaner, setShowSoftwareRemnantCleaner] = useState(false);

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
  const [useRealCleaning, setUseRealCleaning] = useState(true); // 默认使用真实清理



  // 根据选中的分类过滤结果
  const filteredResults = selectedCategory
    ? scanResults.filter(item => item.category === selectedCategory)
    : scanResults;
  const handleStartScan = async (scanDeep: boolean = deepScan) => {
    setIsScanning(true);
    setScanResults([]);
    setSelectedItems(new Set());
    setSelectedCategory(null);
    setDeepScan(scanDeep);

    try {
      if (scanDeep) {
        // 深度扫描：整合高级清理功能
        await handleDeepScanWithAdvanced();
      } else {
        // 快速扫描：只扫描基础垃圾文件
        if (useRealCleaning && window.electronAPI) {
          await RealScanner.scanFiles(setScanProgress, setScanResults, false, chatFileSettings, 'exclude-chat');
        } else {
          await simulateScanning(setScanProgress, setScanResults, false, chatFileSettings, 'exclude-chat');
        }
      }
    } catch (error) {
      console.error('扫描失败:', error);
      // 如果真实扫描失败，回退到模拟扫描
      await simulateScanning(setScanProgress, setScanResults, scanDeep, chatFileSettings, 'exclude-chat');
    }

    setIsScanning(false);

    // Add to scan history
    const newScan = {
      date: new Date().toLocaleDateString('zh-CN'),
      itemsFound: scanResults.length,
      spaceFreed: 0
    };
    setScanHistory(prev => [newScan, ...prev.slice(0, 4)]);
  };

  // 深度扫描整合高级清理功能
  const handleDeepScanWithAdvanced = async () => {
    const allResults: ScanItem[] = [];

    // 第一阶段：基础文件扫描
    setScanProgress({
      current: 10,
      total: 100,
      currentPath: '扫描基础垃圾文件...',
      stage: 'scanning'
    });

    try {
      if (useRealCleaning && window.electronAPI) {
        await RealScanner.scanFiles(
          (progress) => setScanProgress({
            ...progress,
            current: Math.floor(progress.current * 0.5), // 占50%进度
          }),
          (results) => allResults.push(...results),
          true,
          chatFileSettings,
          'exclude-chat'
        );
      } else {
        await simulateScanning(
          (progress) => setScanProgress({
            ...progress,
            current: Math.floor(progress.current * 0.5),
          }),
          (results) => allResults.push(...results),
          true,
          chatFileSettings,
          'exclude-chat'
        );
      }
    } catch (error) {
      console.warn('基础扫描失败，继续高级扫描:', error);
    }

    // 第二阶段：高级系统清理扫描
    setScanProgress({
      current: 50,
      total: 100,
      currentPath: '扫描系统级清理项目...',
      stage: 'scanning'
    });

    try {
      const { AdvancedCleanerManager } = await import('./services/advancedCleanerManager');
      const advancedItems = await AdvancedCleanerManager.scanAllCategories(
        undefined,
        (progress) => setScanProgress({
          current: 50 + Math.floor(progress.current * 0.4), // 占40%进度
          total: 100,
          currentPath: progress.currentPath || '扫描高级清理项目...',
          stage: 'scanning'
        })
      );

      // 转换高级清理项目为ScanItem格式
      const convertedAdvancedItems: ScanItem[] = advancedItems.map((item, index) => ({
        id: `advanced-${item.id}`,
        name: item.name,
        path: item.path,
        size: formatFileSize(item.size),
        sizeBytes: item.size,
        type: item.category === 'system-logs' ? '系统日志' :
              item.category === 'windows-updates' ? 'Windows更新' :
              item.category === 'system-cache' ? '系统缓存' :
              item.category === 'privacy-data' ? '隐私数据' :
              item.category === 'memory-optimization' ? '内存优化' :
              item.category === 'network-cleanup' ? '网络清理' : '系统文件',
        category: 'system' as const,
        riskLevel: item.riskLevel,
        suggestion: item.description,
        lastModified: new Date(),
        isChatFile: false
      }));

      allResults.push(...convertedAdvancedItems);
    } catch (error) {
      console.warn('高级扫描失败:', error);
    }

    setScanProgress({
      current: 100,
      total: 100,
      currentPath: `扫描完成，找到 ${allResults.length} 个项目`,
      stage: 'completed'
    });

    setScanResults(allResults);
  };

  const handleStartChatScan = async () => {
    setIsScanning(true);
    setScanResults([]);
    setSelectedItems(new Set());
    setSelectedCategory(null);
    setDeepScan(true); // 微信QQ扫描默认为深度扫描

    try {
      if (useRealCleaning && window.electronAPI) {
        // 使用真实扫描器
        await RealScanner.scanFiles(setScanProgress, setScanResults, true, chatFileSettings, 'chat-only');
      } else {
        // 使用模拟扫描器
        await simulateScanning(setScanProgress, setScanResults, true, chatFileSettings, 'chat-only');
      }
    } catch (error) {
      console.error('聊天扫描失败:', error);
      // 如果真实扫描失败，回退到模拟扫描
      await simulateScanning(setScanProgress, setScanResults, true, chatFileSettings, 'chat-only');
    }

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

  const confirmClean = async (timeRange?: string, appSelection?: { includeWechat: boolean; includeQQ: boolean }) => {
    setShowConfirmDialog(false);
    setShowCleaningProgress(true);
    setCleaningCancelled(false);

    let itemsToClean = scanResults.filter(item => selectedItems.has(item.id));

    // 如果指定了时间范围，进一步过滤文件
    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (timeRange) {
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
      }

      itemsToClean = itemsToClean.filter(item => {
        // 假设文件有lastModified属性，如果没有则包含在内
        if (!item.lastModified) return true;
        // 删除指定时间之前的文件（小于cutoffDate的文件）
        return new Date(item.lastModified) <= cutoffDate;
      });
    }

    // 根据应用选择过滤
    if (appSelection) {
      itemsToClean = itemsToClean.filter(item => {
        if (item.category === 'wechat') return appSelection.includeWechat;
        if (item.category === 'qq') return appSelection.includeQQ;
        return true; // 其他类型的文件保持不变
      });
    }

    const totalSize = itemsToClean.reduce((sum, item) => sum + item.sizeBytes, 0);

    try {
      if (useRealCleaning && window.electronAPI) {
        // 使用真实清理器
        const result = await RealCleaner.cleanFiles(
          itemsToClean,
          (progress) => {
            setCleaningProgress(progress);
          },
          (currentItem) => {
            setCurrentCleaningItem(currentItem);
          }
        );

        setShowCleaningProgress(false);
        setCurrentCleaningItem(null);

        if (!cleaningCancelled && result.success) {
          // Remove successfully cleaned items from results
          const cleanedItemIds = itemsToClean
            .filter(item => result.deletedFiles.includes(item.path))
            .map(item => item.id);

          setScanResults(prev => prev.filter(item => !cleanedItemIds.includes(item.id)));
          setSelectedItems(new Set());
          setTotalSpaceFreed(result.totalSize);

          // Update scan history with cleaned space
          setScanHistory(prev => prev.map((scan, index) =>
            index === 0 ? { ...scan, spaceFreed: result.totalSize } : scan
          ));

          setShowSuccessDialog(true);
        }
      } else {
        // 使用模拟清理（原有逻辑）
        await simulateCleaningProcess(itemsToClean, totalSize);
      }
    } catch (error) {
      console.error('清理失败:', error);
      // 如果真实清理失败，回退到模拟清理
      await simulateCleaningProcess(itemsToClean, totalSize);
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

  // 模拟清理过程（用于非Electron环境或作为后备）
  const simulateCleaningProcess = async (itemsToClean: ScanItem[], totalSize: number) => {
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

      setShowSuccessDialog(true);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* 顶部标题栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <Header
          onOpenFileIdentifier={() => setShowFileIdentifier(true)}
        />
      </div>

      {/* 主要内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 主内容 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 仪表板 */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <Dashboard
              scanResults={scanResults}
              selectedItems={selectedItems}
              scanHistory={scanHistory}
              onShowSettings={() => setShowSettings(true)}
              onStartQuickScan={() => handleStartScan(false)}
              onStartDeepScan={() => handleStartScan(true)}
              onStartChatScan={handleStartChatScan}
              onOpenSpecialCleaner={() => setShowSoftwareRemnantCleaner(true)}
              onOpenApplicationManager={() => setShowApplicationManager(true)}
              isScanning={isScanning}
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
                  scanResults={scanResults}
                />

                <div className="flex-1 flex flex-col min-h-0">
                  <ResultsTable
                    results={scanResults}
                    filteredResults={filteredResults}
                    selectedItems={selectedItems}
                    selectedCategory={selectedCategory}
                    onSelectItem={handleSelectItem}
                    onSelectAll={handleSelectAll}
                    onCategorySelect={setSelectedCategory}
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
        useRealCleaning={useRealCleaning}
        onUseRealCleaningChange={setUseRealCleaning}
      />

      <FileIdentifier
        isOpen={showFileIdentifier}
        onClose={() => setShowFileIdentifier(false)}
      />

      {showApplicationManager && (
        <ApplicationManager
          onClose={() => setShowApplicationManager(false)}
        />
      )}

      {showSoftwareRemnantCleaner && (
        <SoftwareRemnantCleaner
          isOpen={showSoftwareRemnantCleaner}
          onClose={() => setShowSoftwareRemnantCleaner(false)}
        />
      )}


    </div>
  );
}

export default App;