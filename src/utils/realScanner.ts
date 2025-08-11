import { FileService } from '../services/fileService';
import { ScanItem, ScanProgress, ChatFileSettings } from '../types';
import { formatFileSize } from './formatters';

/**
 * 真实文件扫描器 - 使用Electron API扫描实际文件
 */
export class RealScanner {
  /**
   * 执行真实文件扫描
   */
  static async scanFiles(
    setProgress: (progress: ScanProgress) => void,
    setResults: (results: ScanItem[]) => void,
    deepScan: boolean = false,
    chatSettings: ChatFileSettings = { wechatMonths: 3, qqMonths: 3 },
    scanType: 'all' | 'chat-only' | 'exclude-chat' = 'exclude-chat'
  ): Promise<void> {
    try {
      // 初始化进度
      setProgress({
        current: 0,
        total: 100,
        currentPath: '准备扫描...',
        stage: 'preparing'
      });

      // 获取扫描路径
      const scanPaths = await this.getScanPaths(scanType);
      const extensions = FileService.getDefaultExtensions();
      const maxDepth = deepScan ? 5 : 3;

      setProgress({
        current: 10,
        total: 100,
        currentPath: '获取系统临时目录...',
        stage: 'scanning'
      });

      // 执行扫描
      const scanResult = await FileService.scanJunkFiles({
        paths: scanPaths,
        extensions,
        maxDepth
      });

      setProgress({
        current: 70,
        total: 100,
        currentPath: '分析扫描结果...',
        stage: 'analyzing'
      });

      // 转换为ScanItem格式
      const scanItems = await this.convertToScanItems(scanResult.files, chatSettings, scanType);

      setProgress({
        current: 90,
        total: 100,
        currentPath: '完成扫描',
        stage: 'completed'
      });

      // 逐个设置结果以实现逐个呈现效果
      const results: ScanItem[] = [];
      for (const item of scanItems) {
        results.push(item);
        setResults([...results]);
        // 添加小延迟以显示逐个呈现效果
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setProgress({
        current: 100,
        total: 100,
        currentPath: `扫描完成，找到 ${scanItems.length} 个项目`,
        stage: 'completed'
      });

    } catch (error) {
      console.error('扫描失败:', error);
      
      // 如果真实扫描失败，回退到模拟扫描
      setProgress({
        current: 0,
        total: 100,
        currentPath: '真实扫描失败，使用模拟数据...',
        stage: 'fallback'
      });

      // 导入模拟扫描器作为后备
      const { simulateScanning } = await import('./scanner');
      await simulateScanning(setProgress, setResults, deepScan, chatSettings, scanType);
    }
  }

  /**
   * 获取扫描路径
   */
  private static async getScanPaths(scanType: 'all' | 'chat-only' | 'exclude-chat'): Promise<string[]> {
    try {
      const tempDirs = await FileService.getTempDirectories();
      const defaultPaths = FileService.getDefaultScanPaths();
      
      let allPaths = [...new Set([...tempDirs, ...defaultPaths])];

      // 根据扫描类型过滤路径
      if (scanType === 'chat-only') {
        // 只扫描聊天软件相关目录
        allPaths = allPaths.filter(path => 
          path.includes('WeChat') || 
          path.includes('Tencent') || 
          path.includes('QQ')
        );
      } else if (scanType === 'exclude-chat') {
        // 排除聊天软件目录
        allPaths = allPaths.filter(path => 
          !path.includes('WeChat') && 
          !path.includes('Tencent') && 
          !path.includes('QQ')
        );
      }

      return allPaths;
    } catch (error) {
      console.warn('获取扫描路径失败，使用默认路径:', error);
      return FileService.getDefaultScanPaths();
    }
  }

  /**
   * 将文件信息转换为ScanItem格式
   */
  private static async convertToScanItems(
    files: any[],
    chatSettings: ChatFileSettings,
    scanType: 'all' | 'chat-only' | 'exclude-chat'
  ): Promise<ScanItem[]> {
    const scanItems: ScanItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const scanItem: ScanItem = {
          id: `real-${i}`,
          name: this.getDisplayName(file.path),
          path: file.path,
          size: FileService.formatFileSize(file.size),
          sizeBytes: file.size,
          type: this.getFileType(file.path),
          category: this.getCategory(file.path),
          riskLevel: this.getRiskLevel(file.path),
          suggestion: this.getSuggestion(file.path),
          lastModified: new Date(file.lastModified),
          isChatFile: this.isChatFile(file.path)
        };

        // 应用时间筛选（如果是聊天文件）
        if (scanItem.isChatFile && this.shouldExcludeByTime(scanItem, chatSettings)) {
          scanItem.riskLevel = 'safe';
          const monthsToKeep = scanItem.category === 'wechat' ? chatSettings.wechatMonths : chatSettings.qqMonths;
          scanItem.suggestion = `🛡️ 受时间保护（保留最近${monthsToKeep}个月）`;
        }

        scanItems.push(scanItem);
      } catch (error) {
        console.warn(`处理文件失败: ${file.path}`, error);
      }
    }

    return scanItems;
  }

  /**
   * 获取显示名称
   */
  private static getDisplayName(filePath: string): string {
    const pathParts = filePath.split('\\');
    const fileName = pathParts[pathParts.length - 1];
    const parentDir = pathParts[pathParts.length - 2];
    
    if (parentDir) {
      return `${parentDir}\\${fileName}`;
    }
    
    return fileName;
  }

  /**
   * 获取文件类型
   */
  private static getFileType(filePath: string): string {
    const lowerPath = filePath.toLowerCase();
    
    if (lowerPath.includes('temp')) return '临时文件';
    if (lowerPath.includes('cache')) return '缓存文件';
    if (lowerPath.includes('log')) return '日志文件';
    if (lowerPath.includes('chrome')) return '浏览器缓存';
    if (lowerPath.includes('edge')) return '浏览器缓存';
    if (lowerPath.includes('firefox')) return '浏览器缓存';
    if (lowerPath.includes('wechat')) return '微信文件';
    if (lowerPath.includes('qq')) return 'QQ文件';
    
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tmp': return '临时文件';
      case 'log': return '日志文件';
      case 'bak': return '备份文件';
      case 'old': return '旧文件';
      case 'cache': return '缓存文件';
      default: return '系统文件';
    }
  }

  /**
   * 获取文件分类
   */
  private static getCategory(filePath: string): 'system' | 'browser' | 'user' | 'downloads' | 'registry' | 'backup' | 'wechat' | 'qq' {
    const lowerPath = filePath.toLowerCase();
    
    if (lowerPath.includes('wechat')) return 'wechat';
    if (lowerPath.includes('qq') || lowerPath.includes('tencent')) return 'qq';
    if (lowerPath.includes('chrome') || lowerPath.includes('edge') || lowerPath.includes('firefox')) return 'browser';
    if (lowerPath.includes('downloads')) return 'downloads';
    if (lowerPath.includes('backup') || lowerPath.includes('.bak')) return 'backup';
    if (lowerPath.includes('windows') || lowerPath.includes('system32')) return 'system';
    
    return 'user';
  }

  /**
   * 获取风险级别
   */
  private static getRiskLevel(filePath: string): 'safe' | 'caution' | 'high' {
    const lowerPath = filePath.toLowerCase();
    
    // 系统关键目录 - 高风险
    if (lowerPath.includes('system32') || lowerPath.includes('windows\\system')) {
      return 'high';
    }
    
    // 程序文件目录 - 谨慎
    if (lowerPath.includes('program files')) {
      return 'caution';
    }
    
    // 用户数据 - 谨慎
    if (lowerPath.includes('documents') || lowerPath.includes('desktop')) {
      return 'caution';
    }
    
    // 临时文件和缓存 - 安全
    if (lowerPath.includes('temp') || lowerPath.includes('cache') || lowerPath.includes('log')) {
      return 'safe';
    }
    
    return 'safe';
  }

  /**
   * 获取建议
   */
  private static getSuggestion(filePath: string): string {
    const riskLevel = this.getRiskLevel(filePath);
    
    switch (riskLevel) {
      case 'safe':
        return '✅ 可安全清理';
      case 'caution':
        return '⚠️ 建议检查后清理';
      case 'high':
        return '❌ 高风险，不建议清理';
      default:
        return '❓ 无法判断';
    }
  }

  /**
   * 检查是否为聊天文件
   */
  private static isChatFile(filePath: string): boolean {
    const lowerPath = filePath.toLowerCase();
    return lowerPath.includes('wechat') || lowerPath.includes('qq') || lowerPath.includes('tencent');
  }

  /**
   * 检查是否应该被时间筛选排除
   */
  private static shouldExcludeByTime(item: ScanItem, chatSettings: ChatFileSettings): boolean {
    const isChatFile = item.category === 'wechat' || item.category === 'qq';
    if (!isChatFile) return false;

    // 临时文件和日志文件不受时间限制影响
    if (item.type === '临时文件' || item.type === '日志文件') return false;

    const monthsToKeep = item.category === 'wechat' ? chatSettings.wechatMonths : chatSettings.qqMonths;
    if (monthsToKeep === 0) return false; // 不保留，清理全部

    // 检查文件时间
    if (item.lastModified) {
      const now = new Date();
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsToKeep, now.getDate());
      return item.lastModified > cutoffDate; // 如果文件比截止日期新，则排除（不清理）
    }

    return false;
  }
}
