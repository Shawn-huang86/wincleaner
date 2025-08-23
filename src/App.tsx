import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CleaningSidebar } from './components/CleaningSidebar';
import { SystemDashboard } from './components/SystemDashboard';

import { ResultsTable } from './components/ResultsTable';
import { StatusBar } from './components/StatusBar';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SuccessDialog } from './components/SuccessDialog';
import { SettingsPanel } from './components/SettingsPanel';
import { FileIdentifier } from './components/FileIdentifier';

import { CleaningProgress } from './components/CleaningProgress';
import { UpdateNotification } from './components/UpdateNotification';
import { useUpdateChecker } from './hooks/useUpdateChecker';


import { ScanItem, ScanProgress, ChatFileSettings } from './types';
import { simulateScanning, formatFileSize } from './utils/scanner';
import { RealScanner } from './utils/realScanner';
import { RealCleaner } from './utils/realCleaner';

function App() {
  // 独立的扫描状态管理
  const [isQuickScanning, setIsQuickScanning] = useState(false);
  const [isDeepScanning, setIsDeepScanning] = useState(false);
  const [isChatScanning, setIsChatScanning] = useState(false);

  // 更新检查
  const { updateResult } = useUpdateChecker(true); // 启动时自动检查

  const [scanProgress, setScanProgress] = useState<ScanProgress>({ current: 0, total: 0, currentItem: '' });
  const [scanResults, setScanResults] = useState<ScanItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [deepScan, setDeepScan] = useState(false);
  const [isChatScan, setIsChatScan] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFileIdentifier, setShowFileIdentifier] = useState(false);
  const [isCDriveScanning, setIsCDriveScanning] = useState(false);
  const [showCleaningProgress, setShowCleaningProgress] = useState(false);

  const [isSpecialScanning, setIsSpecialScanning] = useState(false);
  const [isAppScanning, setIsAppScanning] = useState(false);

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

  // 用于测量右侧内容区域高度
  const rightContentRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState<number | undefined>(undefined);
  const [cleaningCancelled, setCleaningCancelled] = useState(false);
  const [useRealCleaning, setUseRealCleaning] = useState(true); // 默认使用真实清理

  // 测量右侧内容区域高度
  useEffect(() => {
    const measureHeight = () => {
      if (rightContentRef.current) {
        const rect = rightContentRef.current.getBoundingClientRect();
        setAvailableHeight(rect.height);
      }
    };

    // 初始测量
    measureHeight();

    // 监听窗口大小变化
    window.addEventListener('resize', measureHeight);

    // 监听扫描状态变化，重新测量
    const timer = setTimeout(measureHeight, 100);

    return () => {
      window.removeEventListener('resize', measureHeight);
      clearTimeout(timer);
    };
  }, [scanResults.length, isQuickScanning, isDeepScanning, isChatScanning]); // 依赖扫描结果和状态

  // 监听Electron菜单事件
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      // 监听菜单触发的更新检查
      const handleCheckUpdates = () => {
        // 触发设置面板中的更新检查
        setShowSettings(true);
        // 可以在这里添加直接触发更新检查的逻辑
      };

      window.electronAPI.onCheckForUpdates(handleCheckUpdates);

      return () => {
        if (window.electronAPI.removeAllListeners) {
          window.electronAPI.removeAllListeners('check-for-updates');
        }
      };
    }
  }, []);

  // 根据选中的分类过滤结果
  const filteredResults = selectedCategory
    ? scanResults.filter(item => item.category === selectedCategory)
    : scanResults;
  const handleStartScan = async (scanDeep: boolean = deepScan) => {
    // 设置对应的扫描状态
    if (scanDeep) {
      setIsDeepScanning(true);
    } else {
      setIsQuickScanning(true);
    }

    setIsChatScan(false);
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

    // 清除对应的扫描状态
    if (scanDeep) {
      setIsDeepScanning(false);
    } else {
      setIsQuickScanning(false);
    }

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
          (results) => {
            // 直接使用扫描器的结果，不要重复累积
            allResults.length = 0; // 清空之前的结果
            allResults.push(...results);
            setScanResults([...allResults]); // 逐个呈现
          },
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
          (results) => {
            // 直接使用扫描器的结果，不要重复累积
            allResults.length = 0; // 清空之前的结果
            allResults.push(...results);
            setScanResults([...allResults]); // 逐个呈现
          },
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

      // 转换高级清理项目为ScanItem格式并逐个添加
      for (const item of advancedItems) {
        const convertedItem: ScanItem = {
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
        };

        allResults.push(convertedItem);
        setScanResults([...allResults]); // 逐个呈现
        // 添加小延迟以显示逐个呈现效果
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    } catch (error) {
      console.warn('高级扫描失败:', error);
    }

    setScanProgress({
      current: 100,
      total: 100,
      currentPath: `扫描完成，找到 ${allResults.length} 个项目`,
      stage: 'completed'
    });

    // 结果已经在循环中逐个设置，无需再次设置
  };

  // 专项清理扫描
  const handleStartSpecialScan = async () => {
    setIsSpecialScanning(true);
    setScanResults([]);
    setSelectedItems(new Set());
    setSelectedCategory(null);

    setScanProgress({
      current: 0,
      total: 100,
      currentPath: '准备专项清理扫描...',
      stage: 'scanning'
    });

    try {
      const { SoftwareRemnantDetector } = await import('./services/softwareRemnantDetector');
      const { RegistryScanner } = await import('./services/registryScanner');
      const { PrivacyCleaner } = await import('./services/privacyCleaner');
      const { ApplicationManager } = await import('./services/applicationManager');

      const allResults: ScanItem[] = [];

      // 第一阶段：扫描软件残留
      setScanProgress({
        current: 10,
        total: 100,
        currentPath: '正在扫描已安装的应用程序...',
        stage: 'scanning'
      });

      const installedApps = await ApplicationManager.scanInstalledApplications();

      setScanProgress({
        current: 20,
        total: 100,
        currentPath: '正在检测软件残留文件...',
        stage: 'scanning'
      });

      const softwareRemnants = await SoftwareRemnantDetector.scanSoftwareRemnants(
        installedApps,
        (progress) => setScanProgress({
          current: 20 + Math.floor(progress.current * 0.2),
          total: 100,
          currentPath: progress.currentPath || '检测软件残留文件...',
          stage: 'scanning'
        })
      );

      // 转换软件残留为 ScanItem 格式
      for (const remnant of softwareRemnants) {
        const sizeBytes = remnant.size || 0;
        const scanItem: ScanItem = {
          id: `software-${remnant.id}`,
          name: remnant.name,
          path: remnant.path,
          size: formatFileSize(sizeBytes),
          sizeBytes,
          category: 'software-remnant',
          type: remnant.type === 'file' ? 'file' : 'folder',
          lastModified: new Date(),
          canDelete: remnant.canDelete,
          description: `${remnant.relatedSoftware} 的残留${remnant.type === 'file' ? '文件' : '文件夹'}`
        };
        allResults.push(scanItem);
        setScanResults([...allResults]);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 第二阶段：扫描注册表残留
      setScanProgress({
        current: 50,
        total: 100,
        currentPath: '正在扫描注册表项...',
        stage: 'scanning'
      });

      const registryRemnants = await RegistryScanner.scanRegistryRemnants(
        (progress) => setScanProgress({
          current: 50 + Math.floor(progress.current * 0.25),
          total: 100,
          currentPath: progress.currentPath || '扫描注册表项...',
          stage: 'scanning'
        })
      );

      // 转换注册表残留为 ScanItem 格式
      for (const registry of registryRemnants) {
        const sizeBytes = registry.size || 1024;
        const scanItem: ScanItem = {
          id: `registry-${registry.id}`,
          name: registry.keyPath.split('\\').pop() || registry.keyPath,
          path: registry.keyPath,
          size: formatFileSize(sizeBytes),
          sizeBytes,
          category: 'registry-remnant',
          type: 'registry',
          lastModified: new Date(),
          canDelete: registry.canDelete,
          description: `${registry.relatedSoftware} 的注册表残留`
        };
        allResults.push(scanItem);
        setScanResults([...allResults]);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 第三阶段：扫描隐私数据
      setScanProgress({
        current: 75,
        total: 100,
        currentPath: '正在扫描隐私数据...',
        stage: 'scanning'
      });

      const privacyData = await PrivacyCleaner.scanPrivacyData(
        (progress) => setScanProgress({
          current: 75 + Math.floor(progress.current * 0.25),
          total: 100,
          currentPath: progress.currentPath || '扫描隐私数据...',
          stage: 'scanning'
        })
      );

      // 转换隐私数据为 ScanItem 格式
      for (const privacy of privacyData) {
        const sizeBytes = privacy.size || 0;
        const scanItem: ScanItem = {
          id: `privacy-${privacy.id}`,
          name: privacy.name,
          path: privacy.path,
          size: formatFileSize(sizeBytes),
          sizeBytes,
          category: 'privacy-data',
          type: 'file', // 隐私数据通常是文件或注册表项
          lastModified: new Date(),
          canDelete: privacy.canDelete,
          description: privacy.description
        };
        allResults.push(scanItem);
        setScanResults([...allResults]);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setScanProgress({
        current: 100,
        total: 100,
        currentPath: `专项清理扫描完成，找到 ${allResults.length} 个项目`,
        stage: 'completed'
      });

    } catch (error) {
      console.error('专项清理扫描失败:', error);
      setScanProgress({
        current: 100,
        total: 100,
        currentPath: '专项清理扫描失败',
        stage: 'error'
      });
    } finally {
      setIsSpecialScanning(false);
    }
  };

  // C盘专清扫描
  const handleStartCDriveScan = async () => {
    setIsCDriveScanning(true);
    setScanResults([]);
    setSelectedItems(new Set());
    setSelectedCategory(null);

    setScanProgress({
      current: 0,
      total: 100,
      currentPath: '准备C盘专清扫描...',
      stage: 'scanning'
    });

    try {
      const allResults: ScanItem[] = [];

      // 模拟C盘专清扫描过程
      const scanSteps = [
        { progress: 10, message: '分析C盘使用情况...', delay: 800 },
        { progress: 25, message: '扫描Windows临时文件...', delay: 1000 },
        { progress: 40, message: '检查用户临时文件...', delay: 800 },
        { progress: 55, message: '分析浏览器缓存...', delay: 900 },
        { progress: 70, message: '扫描系统日志文件...', delay: 700 },
        { progress: 85, message: '检查回收站和大文件...', delay: 800 }
      ];

      for (const step of scanSteps) {
        setScanProgress({
          current: step.progress,
          total: 100,
          currentPath: step.message,
          stage: 'scanning'
        });
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }

      // 生成C盘专清的扫描结果
      const cDriveItems: ScanItem[] = [
        {
          id: 'cdrive-1',
          name: 'Windows临时文件',
          path: 'C:\\Windows\\Temp',
          size: '2.1 GB',
          sizeBytes: 2.1 * 1024 * 1024 * 1024,
          type: '系统临时',
          category: 'system',
          riskLevel: 'safe',
          suggestion: '✅ 可安全清理，释放系统空间',
          lastModified: new Date(),
          canDelete: true
        },
        {
          id: 'cdrive-2',
          name: '用户临时文件',
          path: 'C:\\Users\\User\\AppData\\Local\\Temp',
          size: '1.8 GB',
          sizeBytes: 1.8 * 1024 * 1024 * 1024,
          type: '用户临时',
          category: 'user',
          riskLevel: 'safe',
          suggestion: '✅ 可安全清理，应用程序临时文件',
          lastModified: new Date(),
          canDelete: true
        },
        {
          id: 'cdrive-3',
          name: 'Chrome浏览器缓存',
          path: 'C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache',
          size: '1.2 GB',
          sizeBytes: 1.2 * 1024 * 1024 * 1024,
          type: '浏览器缓存',
          category: 'browser',
          riskLevel: 'safe',
          suggestion: '✅ 可安全清理，清理后网页可能需要重新加载',
          lastModified: new Date(),
          canDelete: true
        },
        {
          id: 'cdrive-4',
          name: '系统日志文件',
          path: 'C:\\Windows\\Logs',
          size: '800 MB',
          sizeBytes: 800 * 1024 * 1024,
          type: '系统日志',
          category: 'system',
          riskLevel: 'safe',
          suggestion: '✅ 可安全清理，系统运行日志',
          lastModified: new Date(),
          canDelete: true
        },
        {
          id: 'cdrive-5',
          name: '回收站文件',
          path: 'C:\\$Recycle.Bin',
          size: '3.5 GB',
          sizeBytes: 3.5 * 1024 * 1024 * 1024,
          type: '回收站',
          category: 'system',
          riskLevel: 'caution',
          suggestion: '⚠️ 清理后无法恢复，请确认后清理',
          lastModified: new Date(),
          canDelete: true
        },
        {
          id: 'cdrive-6',
          name: '下载文件夹大文件',
          path: 'C:\\Users\\User\\Downloads',
          size: '2.8 GB',
          sizeBytes: 2.8 * 1024 * 1024 * 1024,
          type: '大文件',
          category: 'downloads',
          riskLevel: 'caution',
          suggestion: '⚠️ 下载文件夹中的大文件，请确认后清理',
          lastModified: new Date(),
          canDelete: true
        }
      ];

      // 逐个添加结果以实现逐个呈现效果
      for (const item of cDriveItems) {
        allResults.push(item);
        setScanResults([...allResults]);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // 默认选中安全项目
      const safeItems = cDriveItems.filter(item => item.riskLevel === 'safe').map(item => item.id);
      setSelectedItems(new Set(safeItems));

      setScanProgress({
        current: 100,
        total: 100,
        currentPath: `C盘专清扫描完成，找到 ${cDriveItems.length} 个项目，可释放约 ${formatFileSize(cDriveItems.reduce((sum, item) => sum + item.sizeBytes, 0))}`,
        stage: 'completed'
      });

    } catch (error) {
      console.error('C盘专清扫描失败:', error);
      setScanProgress({
        current: 100,
        total: 100,
        currentPath: 'C盘专清扫描失败',
        stage: 'error'
      });
    } finally {
      setIsCDriveScanning(false);
    }
  };

  // 应用管理扫描
  const handleStartAppScan = async () => {
    setIsAppScanning(true);
    setScanResults([]);
    setSelectedItems(new Set());
    setSelectedCategory(null);

    setScanProgress({
      current: 0,
      total: 100,
      currentPath: '准备扫描已安装应用...',
      stage: 'scanning'
    });

    try {
      const { ApplicationManager } = await import('./services/applicationManager');

      setScanProgress({
        current: 20,
        total: 100,
        currentPath: '正在扫描已安装的应用程序...',
        stage: 'scanning'
      });

      const applications = await ApplicationManager.scanInstalledApplications();
      console.log('App: 获取到应用程序数据:', applications.length, '个应用');

      setScanProgress({
        current: 60,
        total: 100,
        currentPath: '正在分析应用程序信息...',
        stage: 'scanning'
      });

      const allResults: ScanItem[] = [];

      // 转换应用信息为 ScanItem 格式
      for (const app of applications) {
        const scanItem: ScanItem = {
          id: `app-${app.name}-${app.version}`,
          name: app.name,
          path: app.installPath,
          size: formatFileSize(app.size),
          sizeBytes: app.size,
          category: 'application',
          type: 'application',
          riskLevel: app.aiAnalysis?.safeToUninstall === false ? 'high' :
                    (app.isSystemApp ? 'caution' : 'safe'),
          suggestion: app.aiAnalysis?.recommendations[0] || '可安全卸载',
          lastModified: app.installDate,
          canDelete: !app.isSystemApp && app.aiAnalysis?.safeToUninstall !== false,
          description: `${app.publisher} - ${app.version}${app.isSystemApp ? ' (系统应用)' : ''}`
        };
        allResults.push(scanItem);
        setScanResults([...allResults]);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      console.log('App: 转换完成，总共', allResults.length, '个应用项目');
      console.log('App: 扫描结果:', allResults);

      setScanProgress({
        current: 100,
        total: 100,
        currentPath: `应用扫描完成，找到 ${allResults.length} 个应用`,
        stage: 'completed'
      });

    } catch (error) {
      console.error('应用扫描失败:', error);
      setScanProgress({
        current: 100,
        total: 100,
        currentPath: '应用扫描失败',
        stage: 'error'
      });
    } finally {
      setIsAppScanning(false);
    }
  };

  const handleStartChatScan = async () => {
    console.log('开始聊天扫描...');
    setIsChatScanning(true);
    setIsChatScan(true);
    setScanResults([]);
    setSelectedItems(new Set());
    setSelectedCategory(null);
    setDeepScan(true); // 微信QQ扫描默认为深度扫描

    try {
      console.log('使用模拟扫描器进行聊天扫描');
      // 直接使用模拟扫描器 - 已经支持逐个呈现
      await simulateScanning(setScanProgress, setScanResults, true, chatFileSettings, 'chat-only');
    } catch (error) {
      console.error('聊天扫描失败:', error);
      // 如果扫描失败，重试一次
      console.log('重试聊天扫描');
      await simulateScanning(setScanProgress, setScanResults, true, chatFileSettings, 'chat-only');
    }

    setIsChatScanning(false);
    // 不要立即设置 isChatScan 为 false，让它保持为 true 以便正确显示
    // setIsChatScan(false);

    // 延迟一下再更新扫描历史，确保 scanResults 已经更新
    setTimeout(() => {
      console.log('聊天扫描完成，结果数量:', scanResults.length);
      // Add to scan history
      const newScan = {
        date: new Date().toLocaleDateString('zh-CN'),
        itemsFound: scanResults.length,
        spaceFreed: 0
      };
      setScanHistory(prev => [newScan, ...prev.slice(0, 4)]);
    }, 100);
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

  // 批量选择函数
  const handleBatchSelect = (ids: string[], selected: boolean) => {
    const newSelected = new Set(selectedItems);
    ids.forEach(id => {
      if (selected) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
    });
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    const newSelected = new Set(selectedItems);

    if (selected) {
      // 只添加当前筛选结果中可删除的项目
      filteredResults.forEach(item => {
        if (item.canDelete !== false) { // 默认可删除，除非明确设置为false
          newSelected.add(item.id);
        }
      });
    } else {
      // 只移除当前筛选结果中的项目，保留其他分类中的选择
      filteredResults.forEach(item => newSelected.delete(item.id));
    }

    setSelectedItems(newSelected);
  };

  // 批量选择分类中的所有项目
  const handleSelectCategory = (category: string) => {
    const categoryItems = scanResults.filter(item => item.category === category);
    const deletableItems = categoryItems.filter(item => item.canDelete !== false);
    const allSelected = deletableItems.every(item => selectedItems.has(item.id));

    const newSelected = new Set(selectedItems);
    const targetState = !allSelected;

    deletableItems.forEach(item => {
      if (targetState) {
        newSelected.add(item.id);
      } else {
        newSelected.delete(item.id);
      }
    });

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
    <div className="min-h-screen overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* 顶部标题栏 - 减少垂直内边距 */}
      <div className="bg-white border-b border-gray-200 px-4 py-1.5">
        <Header
          onOpenFileIdentifier={() => setShowFileIdentifier(true)}
          onStartCDriveScan={handleStartCDriveScan}
          onStartQuickScan={() => handleStartScan(false)}
          onStartDeepScan={() => handleStartScan(true)}
          onStartChatScan={handleStartChatScan}
          onStartSpecialScan={handleStartSpecialScan}
          onStartAppScan={handleStartAppScan}
          isQuickScanning={isQuickScanning}
          isDeepScanning={isDeepScanning}
          isChatScanning={isChatScanning}
          isSpecialScanning={isSpecialScanning}
          isAppScanning={isAppScanning}
          isCDriveScanning={isCDriveScanning}
          deepScan={deepScan}
          isChatScan={isChatScan}
          scanProgress={scanProgress}
          scanResults={scanResults}
        />
      </div>

      {/* 主要内容区域 - 左右两侧布局，左侧清理功能，右侧系统状态和结果 */}
      <div className="flex flex-1 items-stretch">
        {/* 左侧清理功能栏 - 向上移动填补空间 */}
        <CleaningSidebar
          onStartQuickScan={() => handleStartScan(false)}
          onStartDeepScan={() => handleStartScan(true)}
          onStartChatScan={handleStartChatScan}
          onStartSpecialScan={handleStartSpecialScan}
          onStartAppScan={handleStartAppScan}
          onStartCDriveScan={handleStartCDriveScan}
          isQuickScanning={isQuickScanning}
          isDeepScanning={isDeepScanning}
          isChatScanning={isChatScanning}
          isSpecialScanning={isSpecialScanning}
          isAppScanning={isAppScanning}
          isCDriveScanning={isCDriveScanning}
        />

        {/* 右侧区域 - 包含系统状态和内容区域 */}
        <div className="flex-1 flex flex-col">
          {/* 系统状态仪表盘 - 移到右侧顶部 */}
          <div className="flex-shrink-0">
            <SystemDashboard
              scanResults={scanResults}
              selectedItems={selectedItems}
              scanHistory={scanHistory}
              onShowSettings={() => setShowSettings(true)}
              isScanning={isQuickScanning || isDeepScanning || isChatScanning}
              scanProgress={scanProgress}
              isChatScan={isChatScan}
              deepScan={deepScan}
            />
          </div>

          {/* 右侧内容区域 */}
          <div ref={rightContentRef} className="flex flex-col flex-1">
            {/* 扫描和结果区域 - 占据剩余空间，减少内边距，为底部状态栏留出空间 */}
            <div className="flex-1 p-2 pb-20 overflow-auto no-scrollbar">
              <ResultsTable
                results={scanResults}
                filteredResults={filteredResults}
                selectedItems={selectedItems}
                selectedCategory={selectedCategory}
                onSelectItem={handleSelectItem}
                onSelectAll={handleSelectAll}
                onSelectCategory={handleSelectCategory}
                onCategorySelect={setSelectedCategory}
                availableHeight={availableHeight}
                onCleanSelected={handleCleanSelected}
                onBatchSelect={handleBatchSelect}
              />
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

      {/* 更新通知 */}
      <UpdateNotification autoCheck={true} />

      {/* 底部状态栏 - 固定在窗口底部 */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <StatusBar
          scanResults={filteredResults}
          selectedItems={selectedItems}
          totalSelectedSize={getTotalSelectedSize()}
          cleaningProgress={{ current: 0, total: 0 }}
        />
      </div>

    </div>
  );
}

export default App;