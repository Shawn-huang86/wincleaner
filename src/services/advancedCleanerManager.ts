import { SystemLogCleaner, SystemLogItem, LogCleaningStats } from './systemLogCleaner';
import { WindowsUpdateCleaner, WindowsUpdateItem, UpdateCleaningStats } from './windowsUpdateCleaner';
import { SystemCacheCleaner, SystemCacheItem, CacheCleaningStats } from './systemCacheCleaner';
import { PrivacyCleaner, PrivacyItem, PrivacyCleaningStats } from './privacyCleaner';
import { MemoryOptimizer, MemoryItem, MemoryOptimizationStats } from './memoryOptimizer';
import { NetworkCleaner, NetworkItem, NetworkCleaningStats } from './networkCleaner';

export type AdvancedCleaningCategory = 
  | 'system-logs' 
  | 'windows-updates' 
  | 'system-cache' 
  | 'privacy-data' 
  | 'memory-optimization' 
  | 'network-cleanup';

export interface AdvancedCleaningItem {
  id: string;
  category: AdvancedCleaningCategory;
  name: string;
  path: string;
  size: number;
  description: string;
  riskLevel: 'safe' | 'caution' | 'high';
  canDelete: boolean;
  lastModified: Date;
  originalItem: SystemLogItem | WindowsUpdateItem | SystemCacheItem | PrivacyItem | MemoryItem | NetworkItem;
}

export interface AdvancedCleaningStats {
  totalItems: number;
  totalSize: number;
  categories: {
    systemLogs: LogCleaningStats;
    windowsUpdates: UpdateCleaningStats;
    systemCache: CacheCleaningStats;
    privacyData: PrivacyCleaningStats;
    memoryOptimization: MemoryOptimizationStats;
    networkCleanup: NetworkCleaningStats;
  };
  estimatedSpaceSaving: number;
  estimatedPerformanceGain: 'low' | 'medium' | 'high';
  riskDistribution: {
    safe: number;
    caution: number;
    high: number;
  };
}

export interface AdvancedCleaningProgress {
  category: AdvancedCleaningCategory;
  categoryName: string;
  current: number;
  total: number;
  currentItem?: string;
  overallProgress: number;
}

export interface AdvancedCleaningResult {
  success: boolean;
  totalProcessed: number;
  totalCleaned: number;
  totalFailed: number;
  spaceSaved: number;
  categoryResults: {
    [key in AdvancedCleaningCategory]: {
      processed: number;
      cleaned: number;
      failed: number;
      errors: string[];
      warnings: string[];
    };
  };
  overallErrors: string[];
  overallWarnings: string[];
}

/**
 * 高级清理管理器 - 统一管理所有高级清理功能
 */
export class AdvancedCleanerManager {
  private static readonly CATEGORY_NAMES = {
    'system-logs': '系统日志清理',
    'windows-updates': 'Windows 更新清理',
    'system-cache': '系统缓存清理',
    'privacy-data': '隐私数据清理',
    'memory-optimization': '内存优化',
    'network-cleanup': '网络清理'
  };

  /**
   * 扫描所有高级清理项目
   */
  static async scanAllCategories(
    categories: AdvancedCleaningCategory[] = [
      'system-logs',
      'windows-updates', 
      'system-cache',
      'privacy-data',
      'memory-optimization',
      'network-cleanup'
    ],
    onProgress?: (progress: AdvancedCleaningProgress) => void
  ): Promise<AdvancedCleaningItem[]> {
    const allItems: AdvancedCleaningItem[] = [];
    const totalCategories = categories.length;
    let processedCategories = 0;

    for (const category of categories) {
      try {
        const categoryName = this.CATEGORY_NAMES[category];
        
        if (onProgress) {
          onProgress({
            category,
            categoryName,
            current: 0,
            total: 100,
            currentItem: `正在扫描${categoryName}...`,
            overallProgress: Math.round((processedCategories / totalCategories) * 100)
          });
        }

        const items = await this.scanCategory(category, (progress) => {
          if (onProgress) {
            onProgress({
              category,
              categoryName,
              current: progress,
              total: 100,
              currentItem: `扫描${categoryName}中...`,
              overallProgress: Math.round(((processedCategories + progress / 100) / totalCategories) * 100)
            });
          }
        });

        allItems.push(...items);
        processedCategories++;

        if (onProgress) {
          onProgress({
            category,
            categoryName,
            current: 100,
            total: 100,
            currentItem: `${categoryName}扫描完成`,
            overallProgress: Math.round((processedCategories / totalCategories) * 100)
          });
        }
      } catch (error) {
        console.error(`扫描类别 ${category} 失败:`, error);
        processedCategories++;
      }
    }

    return allItems;
  }

  /**
   * 扫描单个类别
   */
  private static async scanCategory(
    category: AdvancedCleaningCategory,
    onProgress?: (progress: number) => void
  ): Promise<AdvancedCleaningItem[]> {
    const items: AdvancedCleaningItem[] = [];

    switch (category) {
      case 'system-logs':
        const logItems = await SystemLogCleaner.scanSystemLogs(onProgress);
        items.push(...logItems.map(item => this.convertToAdvancedItem(item, category)));
        break;

      case 'windows-updates':
        const updateItems = await WindowsUpdateCleaner.scanUpdateFiles(onProgress);
        items.push(...updateItems.map(item => this.convertToAdvancedItem(item, category)));
        break;

      case 'system-cache':
        const cacheItems = await SystemCacheCleaner.scanSystemCache(onProgress);
        items.push(...cacheItems.map(item => this.convertToAdvancedItem(item, category)));
        break;

      case 'privacy-data':
        const privacyItems = await PrivacyCleaner.scanPrivacyData(onProgress);
        items.push(...privacyItems.map(item => this.convertToAdvancedItem(item, category)));
        break;

      case 'memory-optimization':
        const memoryItems = await MemoryOptimizer.scanMemoryItems(onProgress);
        items.push(...memoryItems.map(item => this.convertToAdvancedItem(item, category)));
        break;

      case 'network-cleanup':
        const networkItems = await NetworkCleaner.scanNetworkItems(onProgress);
        items.push(...networkItems.map(item => this.convertToAdvancedItem(item, category)));
        break;

      default:
        console.warn(`未知的清理类别: ${category}`);
    }

    return items;
  }

  /**
   * 转换为统一的高级清理项目格式
   */
  private static convertToAdvancedItem(
    item: SystemLogItem | WindowsUpdateItem | SystemCacheItem | PrivacyItem | MemoryItem | NetworkItem,
    category: AdvancedCleaningCategory
  ): AdvancedCleaningItem {
    return {
      id: `${category}-${item.id}`,
      category,
      name: item.name,
      path: item.path,
      size: item.size,
      description: item.description,
      riskLevel: item.riskLevel,
      canDelete: item.canDelete,
      lastModified: item.lastModified,
      originalItem: item
    };
  }

  /**
   * 获取高级清理统计信息
   */
  static async getAdvancedCleaningStats(items: AdvancedCleaningItem[]): Promise<AdvancedCleaningStats> {
    // 按类别分组
    const itemsByCategory = this.groupItemsByCategory(items);
    
    // 获取各类别的统计信息
    const systemLogs = itemsByCategory['system-logs'].map(item => item.originalItem as SystemLogItem);
    const windowsUpdates = itemsByCategory['windows-updates'].map(item => item.originalItem as WindowsUpdateItem);
    const systemCache = itemsByCategory['system-cache'].map(item => item.originalItem as SystemCacheItem);
    const privacyData = itemsByCategory['privacy-data'].map(item => item.originalItem as PrivacyItem);
    const memoryItems = itemsByCategory['memory-optimization'].map(item => item.originalItem as MemoryItem);
    const networkItems = itemsByCategory['network-cleanup'].map(item => item.originalItem as NetworkItem);

    const stats: AdvancedCleaningStats = {
      totalItems: items.length,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      categories: {
        systemLogs: SystemLogCleaner.getCleaningStats(systemLogs),
        windowsUpdates: WindowsUpdateCleaner.getCleaningStats(windowsUpdates),
        systemCache: SystemCacheCleaner.getCleaningStats(systemCache),
        privacyData: PrivacyCleaner.getCleaningStats(privacyData),
        memoryOptimization: await MemoryOptimizer.getOptimizationStats(memoryItems),
        networkCleanup: NetworkCleaner.getCleaningStats(networkItems)
      },
      estimatedSpaceSaving: items.filter(item => item.canDelete).reduce((sum, item) => sum + item.size, 0),
      estimatedPerformanceGain: this.calculatePerformanceGain(items),
      riskDistribution: {
        safe: items.filter(item => item.riskLevel === 'safe').length,
        caution: items.filter(item => item.riskLevel === 'caution').length,
        high: items.filter(item => item.riskLevel === 'high').length
      }
    };

    return stats;
  }

  /**
   * 按类别分组项目
   */
  private static groupItemsByCategory(items: AdvancedCleaningItem[]): Record<AdvancedCleaningCategory, AdvancedCleaningItem[]> {
    const grouped: Record<AdvancedCleaningCategory, AdvancedCleaningItem[]> = {
      'system-logs': [],
      'windows-updates': [],
      'system-cache': [],
      'privacy-data': [],
      'memory-optimization': [],
      'network-cleanup': []
    };

    for (const item of items) {
      grouped[item.category].push(item);
    }

    return grouped;
  }

  /**
   * 计算性能提升预估
   */
  private static calculatePerformanceGain(items: AdvancedCleaningItem[]): 'low' | 'medium' | 'high' {
    const highImpactCategories = ['system-cache', 'memory-optimization'];
    const mediumImpactCategories = ['windows-updates', 'network-cleanup'];
    
    const highImpactItems = items.filter(item => 
      highImpactCategories.includes(item.category) && item.canDelete
    ).length;
    
    const mediumImpactItems = items.filter(item => 
      mediumImpactCategories.includes(item.category) && item.canDelete
    ).length;

    if (highImpactItems > 5) {
      return 'high';
    } else if (highImpactItems > 2 || mediumImpactItems > 5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 执行高级清理
   */
  static async performAdvancedCleaning(
    items: AdvancedCleaningItem[],
    onProgress?: (progress: AdvancedCleaningProgress) => void
  ): Promise<AdvancedCleaningResult> {
    const result: AdvancedCleaningResult = {
      success: false,
      totalProcessed: 0,
      totalCleaned: 0,
      totalFailed: 0,
      spaceSaved: 0,
      categoryResults: {
        'system-logs': { processed: 0, cleaned: 0, failed: 0, errors: [], warnings: [] },
        'windows-updates': { processed: 0, cleaned: 0, failed: 0, errors: [], warnings: [] },
        'system-cache': { processed: 0, cleaned: 0, failed: 0, errors: [], warnings: [] },
        'privacy-data': { processed: 0, cleaned: 0, failed: 0, errors: [], warnings: [] },
        'memory-optimization': { processed: 0, cleaned: 0, failed: 0, errors: [], warnings: [] },
        'network-cleanup': { processed: 0, cleaned: 0, failed: 0, errors: [], warnings: [] }
      },
      overallErrors: [],
      overallWarnings: []
    };

    const itemsByCategory = this.groupItemsByCategory(items);
    const categories = Object.keys(itemsByCategory) as AdvancedCleaningCategory[];
    const totalCategories = categories.length;
    let processedCategories = 0;

    for (const category of categories) {
      const categoryItems = itemsByCategory[category];
      if (categoryItems.length === 0) {
        processedCategories++;
        continue;
      }

      try {
        const categoryName = this.CATEGORY_NAMES[category];
        
        if (onProgress) {
          onProgress({
            category,
            categoryName,
            current: 0,
            total: categoryItems.length,
            currentItem: `开始清理${categoryName}...`,
            overallProgress: Math.round((processedCategories / totalCategories) * 100)
          });
        }

        const categoryResult = await this.cleanCategory(category, categoryItems, (current, total, currentItem) => {
          if (onProgress) {
            onProgress({
              category,
              categoryName,
              current,
              total,
              currentItem,
              overallProgress: Math.round(((processedCategories + current / total) / totalCategories) * 100)
            });
          }
        });

        // 更新结果
        result.categoryResults[category] = categoryResult;
        result.totalProcessed += categoryResult.processed;
        result.totalCleaned += categoryResult.cleaned;
        result.totalFailed += categoryResult.failed;
        result.overallErrors.push(...categoryResult.errors);
        result.overallWarnings.push(...categoryResult.warnings);

        processedCategories++;
      } catch (error) {
        result.overallErrors.push(`清理类别 ${category} 失败: ${error}`);
        processedCategories++;
      }
    }

    result.success = result.totalFailed === 0;
    return result;
  }

  /**
   * 清理单个类别
   */
  private static async cleanCategory(
    category: AdvancedCleaningCategory,
    items: AdvancedCleaningItem[],
    onProgress?: (current: number, total: number, currentItem?: string) => void
  ): Promise<{ processed: number; cleaned: number; failed: number; errors: string[]; warnings: string[] }> {
    const originalItems = items.map(item => item.originalItem);
    
    switch (category) {
      case 'system-logs':
        const logResult = await SystemLogCleaner.cleanLogs(originalItems as SystemLogItem[], (progress) => {
          if (onProgress) onProgress(progress, 100, '清理系统日志...');
        });
        return {
          processed: originalItems.length,
          cleaned: logResult.deletedCount,
          failed: logResult.failedCount,
          errors: logResult.errors,
          warnings: []
        };

      case 'windows-updates':
        const updateResult = await WindowsUpdateCleaner.cleanUpdateFiles(originalItems as WindowsUpdateItem[], (progress) => {
          if (onProgress) onProgress(progress, 100, '清理更新文件...');
        });
        return {
          processed: originalItems.length,
          cleaned: updateResult.deletedCount,
          failed: updateResult.failedCount,
          errors: updateResult.errors,
          warnings: []
        };

      case 'system-cache':
        const cacheResult = await SystemCacheCleaner.cleanCache(originalItems as SystemCacheItem[], (progress) => {
          if (onProgress) onProgress(progress, 100, '清理系统缓存...');
        });
        return {
          processed: originalItems.length,
          cleaned: cacheResult.deletedCount,
          failed: cacheResult.failedCount,
          errors: cacheResult.errors,
          warnings: cacheResult.warnings
        };

      case 'privacy-data':
        const privacyResult = await PrivacyCleaner.cleanPrivacyData(originalItems as PrivacyItem[], (progress) => {
          if (onProgress) onProgress(progress, 100, '清理隐私数据...');
        });
        return {
          processed: originalItems.length,
          cleaned: privacyResult.deletedCount,
          failed: privacyResult.failedCount,
          errors: privacyResult.errors,
          warnings: privacyResult.warnings
        };

      case 'memory-optimization':
        const memoryResult = await MemoryOptimizer.optimizeMemory(originalItems as MemoryItem[], (progress) => {
          if (onProgress) onProgress(progress, 100, '优化内存...');
        });
        return {
          processed: originalItems.length,
          cleaned: memoryResult.optimizedCount,
          failed: memoryResult.failedCount,
          errors: memoryResult.errors,
          warnings: memoryResult.warnings
        };

      case 'network-cleanup':
        const networkResult = await NetworkCleaner.cleanNetworkItems(originalItems as NetworkItem[], (progress) => {
          if (onProgress) onProgress(progress, 100, '清理网络数据...');
        });
        return {
          processed: originalItems.length,
          cleaned: networkResult.cleanedCount,
          failed: networkResult.failedCount,
          errors: networkResult.errors,
          warnings: networkResult.warnings
        };

      default:
        return {
          processed: 0,
          cleaned: 0,
          failed: originalItems.length,
          errors: [`未知的清理类别: ${category}`],
          warnings: []
        };
    }
  }

  /**
   * 获取类别显示名称
   */
  static getCategoryName(category: AdvancedCleaningCategory): string {
    return this.CATEGORY_NAMES[category] || category;
  }

  /**
   * 获取所有支持的清理类别
   */
  static getSupportedCategories(): AdvancedCleaningCategory[] {
    return [
      'system-logs',
      'windows-updates',
      'system-cache',
      'privacy-data',
      'memory-optimization',
      'network-cleanup'
    ];
  }
}
