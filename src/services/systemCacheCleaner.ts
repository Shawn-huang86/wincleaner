export interface SystemCacheItem {
  id: string;
  name: string;
  path: string;
  type: 'prefetch' | 'icon-cache' | 'thumbnail-cache' | 'font-cache' | 'dns-cache' | 'search-index';
  size: number;
  lastModified: Date;
  description: string;
  riskLevel: 'safe' | 'caution' | 'high';
  canDelete: boolean;
  performanceImpact: 'low' | 'medium' | 'high'; // 对性能的影响
}

export interface CacheCleaningStats {
  totalItems: number;
  totalSize: number;
  prefetchFiles: number;
  iconCache: number;
  thumbnailCache: number;
  fontCache: number;
  dnsCache: number;
  searchIndex: number;
  estimatedPerformanceGain: string;
}

/**
 * 系统缓存清理器 - 清理 Windows 系统缓存文件
 */
export class SystemCacheCleaner {
  private static readonly CACHE_PATHS = {
    // 预取文件
    prefetch: [
      'C:\\Windows\\Prefetch'
    ],
    
    // 图标缓存
    iconCache: [
      'C:\\Users\\%USERNAME%\\AppData\\Local\\IconCache.db',
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\Windows\\Explorer\\iconcache_*.db'
    ],
    
    // 缩略图缓存
    thumbnailCache: [
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\Windows\\Explorer\\thumbcache_*.db',
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Temp\\Thumbs.db'
    ],
    
    // 字体缓存
    fontCache: [
      'C:\\Windows\\System32\\FNTCACHE.DAT',
      'C:\\Windows\\ServiceProfiles\\LocalService\\AppData\\Local\\FontCache'
    ],
    
    // Windows Search 索引
    searchIndex: [
      'C:\\ProgramData\\Microsoft\\Search\\Data\\Applications\\Windows\\Windows.edb',
      'C:\\ProgramData\\Microsoft\\Search\\Data\\Temp'
    ]
  };

  /**
   * 扫描系统缓存文件
   */
  static async scanSystemCache(
    onProgress?: (progress: number) => void
  ): Promise<SystemCacheItem[]> {
    const cacheItems: SystemCacheItem[] = [];
    
    try {
      if (this.isElectronEnvironment()) {
        return await this.scanWithElectron(onProgress);
      } else {
        return this.getMockCacheItems();
      }
    } catch (error) {
      console.error('扫描系统缓存失败:', error);
      return this.getMockCacheItems();
    }
  }

  /**
   * 使用 Electron API 扫描缓存文件
   */
  private static async scanWithElectron(
    onProgress?: (progress: number) => void
  ): Promise<SystemCacheItem[]> {
    const cacheItems: SystemCacheItem[] = [];
    const allPaths = Object.values(this.CACHE_PATHS).flat();
    let processedPaths = 0;

    // 首先处理 DNS 缓存（内存中的，需要特殊处理）
    try {
      const dnsCache = await this.getDNSCacheInfo();
      if (dnsCache) {
        cacheItems.push(dnsCache);
      }
    } catch (error) {
      console.warn('获取 DNS 缓存信息失败:', error);
    }

    for (const pathPattern of allPaths) {
      try {
        // 展开环境变量
        const expandedPath = pathPattern.replace('%USERNAME%', process.env.USERNAME || 'User');
        
        // 处理通配符路径
        if (expandedPath.includes('*')) {
          const files = await window.electronAPI.scanDirectory(
            expandedPath.substring(0, expandedPath.lastIndexOf('\\')), 
            {
              recursive: false,
              pattern: expandedPath.substring(expandedPath.lastIndexOf('\\') + 1)
            }
          );
          
          for (const file of files) {
            const cacheItem = this.createCacheItem(file, pathPattern);
            if (cacheItem) {
              cacheItems.push(cacheItem);
            }
          }
        } else {
          // 单个文件或目录
          const fileInfo = await window.electronAPI.getFileInfo(expandedPath);
          if (fileInfo) {
            const cacheItem = this.createCacheItem(fileInfo, pathPattern);
            if (cacheItem) {
              cacheItems.push(cacheItem);
            }
          }
        }
      } catch (error) {
        console.warn(`扫描缓存路径失败: ${pathPattern}`, error);
      }

      processedPaths++;
      if (onProgress) {
        onProgress(Math.round((processedPaths / allPaths.length) * 100));
      }
    }

    return cacheItems;
  }

  /**
   * 获取 DNS 缓存信息
   */
  private static async getDNSCacheInfo(): Promise<SystemCacheItem | null> {
    try {
      const dnsInfo = await window.electronAPI.getDNSCacheInfo();
      
      return {
        id: 'dns-cache',
        name: 'DNS 解析缓存',
        path: 'Memory (DNS Resolver Cache)',
        type: 'dns-cache',
        size: dnsInfo.entryCount * 1024, // 估算大小
        lastModified: new Date(),
        description: `包含 ${dnsInfo.entryCount} 个 DNS 解析记录`,
        riskLevel: 'safe',
        canDelete: true,
        performanceImpact: 'low'
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 创建缓存项
   */
  private static createCacheItem(file: any, pathPattern: string): SystemCacheItem | null {
    try {
      const cacheType = this.getCacheType(pathPattern, file.path);
      const riskLevel = this.getRiskLevel(cacheType, file.path);
      const performanceImpact = this.getPerformanceImpact(cacheType);
      
      return {
        id: `cache-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        path: file.path,
        type: cacheType,
        size: file.size,
        lastModified: new Date(file.lastModified),
        description: this.getCacheDescription(cacheType, file.name),
        riskLevel,
        canDelete: riskLevel !== 'high',
        performanceImpact
      };
    } catch (error) {
      console.warn('创建缓存项失败:', error);
      return null;
    }
  }

  /**
   * 获取缓存类型
   */
  private static getCacheType(pathPattern: string, filePath: string): SystemCacheItem['type'] {
    const lowerPath = filePath.toLowerCase();
    
    if (pathPattern.includes('Prefetch') || lowerPath.includes('prefetch')) {
      return 'prefetch';
    }
    if (pathPattern.includes('IconCache') || lowerPath.includes('iconcache')) {
      return 'icon-cache';
    }
    if (pathPattern.includes('thumbcache') || lowerPath.includes('thumbs.db')) {
      return 'thumbnail-cache';
    }
    if (pathPattern.includes('FNTCACHE') || pathPattern.includes('FontCache')) {
      return 'font-cache';
    }
    if (pathPattern.includes('Search') || lowerPath.includes('windows.edb')) {
      return 'search-index';
    }
    
    return 'prefetch'; // 默认类型
  }

  /**
   * 获取风险级别
   */
  private static getRiskLevel(type: SystemCacheItem['type'], filePath: string): SystemCacheItem['riskLevel'] {
    // Windows Search 索引 - 谨慎（重建需要时间）
    if (type === 'search-index') {
      return 'caution';
    }
    
    // 字体缓存 - 谨慎（可能影响字体显示）
    if (type === 'font-cache') {
      return 'caution';
    }
    
    // 其他缓存文件 - 安全
    return 'safe';
  }

  /**
   * 获取性能影响
   */
  private static getPerformanceImpact(type: SystemCacheItem['type']): SystemCacheItem['performanceImpact'] {
    const impacts = {
      'prefetch': 'high',      // 预取文件对启动速度影响大
      'icon-cache': 'medium',  // 图标缓存对界面响应有影响
      'thumbnail-cache': 'medium', // 缩略图缓存对文件浏览有影响
      'font-cache': 'medium',  // 字体缓存对文本渲染有影响
      'dns-cache': 'low',      // DNS 缓存影响相对较小
      'search-index': 'high'   // 搜索索引对搜索性能影响大
    };
    
    return impacts[type] || 'low';
  }

  /**
   * 获取缓存描述
   */
  private static getCacheDescription(type: SystemCacheItem['type'], fileName: string): string {
    const descriptions = {
      'prefetch': '程序预取文件，用于加速程序启动',
      'icon-cache': '图标缓存文件，用于快速显示文件图标',
      'thumbnail-cache': '缩略图缓存文件，用于快速显示图片预览',
      'font-cache': '字体缓存文件，用于加速字体渲染',
      'dns-cache': 'DNS 解析缓存，用于加速网络访问',
      'search-index': 'Windows 搜索索引，用于快速文件搜索'
    };
    
    return descriptions[type] || '系统缓存文件';
  }

  /**
   * 获取模拟缓存数据
   */
  private static getMockCacheItems(): SystemCacheItem[] {
    const mockItems: SystemCacheItem[] = [
      {
        id: 'cache-1',
        name: 'Prefetch 文件夹',
        path: 'C:\\Windows\\Prefetch',
        type: 'prefetch',
        size: 150 * 1024 * 1024, // 150MB
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
        description: '程序预取文件，包含 1,247 个文件',
        riskLevel: 'safe',
        canDelete: true,
        performanceImpact: 'high'
      },
      {
        id: 'cache-2',
        name: 'IconCache.db',
        path: 'C:\\Users\\User\\AppData\\Local\\IconCache.db',
        type: 'icon-cache',
        size: 25 * 1024 * 1024, // 25MB
        lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
        description: '系统图标缓存数据库',
        riskLevel: 'safe',
        canDelete: true,
        performanceImpact: 'medium'
      },
      {
        id: 'cache-3',
        name: 'thumbcache_1920.db',
        path: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\Explorer\\thumbcache_1920.db',
        type: 'thumbnail-cache',
        size: 80 * 1024 * 1024, // 80MB
        lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
        description: '1920x1080 分辨率缩略图缓存',
        riskLevel: 'safe',
        canDelete: true,
        performanceImpact: 'medium'
      },
      {
        id: 'cache-4',
        name: 'FNTCACHE.DAT',
        path: 'C:\\Windows\\System32\\FNTCACHE.DAT',
        type: 'font-cache',
        size: 15 * 1024 * 1024, // 15MB
        lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10天前
        description: '系统字体缓存文件',
        riskLevel: 'caution',
        canDelete: true,
        performanceImpact: 'medium'
      },
      {
        id: 'cache-5',
        name: 'DNS 解析缓存',
        path: 'Memory (DNS Resolver Cache)',
        type: 'dns-cache',
        size: 2 * 1024 * 1024, // 2MB
        lastModified: new Date(),
        description: '包含 156 个 DNS 解析记录',
        riskLevel: 'safe',
        canDelete: true,
        performanceImpact: 'low'
      },
      {
        id: 'cache-6',
        name: 'Windows.edb',
        path: 'C:\\ProgramData\\Microsoft\\Search\\Data\\Applications\\Windows\\Windows.edb',
        type: 'search-index',
        size: 200 * 1024 * 1024, // 200MB
        lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
        description: 'Windows 搜索索引数据库',
        riskLevel: 'caution',
        canDelete: true,
        performanceImpact: 'high'
      }
    ];

    return mockItems;
  }

  /**
   * 获取缓存清理统计信息
   */
  static getCleaningStats(items: SystemCacheItem[]): CacheCleaningStats {
    const stats = {
      totalItems: items.length,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      prefetchFiles: items.filter(item => item.type === 'prefetch').length,
      iconCache: items.filter(item => item.type === 'icon-cache').length,
      thumbnailCache: items.filter(item => item.type === 'thumbnail-cache').length,
      fontCache: items.filter(item => item.type === 'font-cache').length,
      dnsCache: items.filter(item => item.type === 'dns-cache').length,
      searchIndex: items.filter(item => item.type === 'search-index').length,
      estimatedPerformanceGain: 'medium'
    };

    // 根据清理的缓存类型评估性能提升
    const highImpactItems = items.filter(item => item.performanceImpact === 'high').length;
    const mediumImpactItems = items.filter(item => item.performanceImpact === 'medium').length;
    
    if (highImpactItems > 2) {
      stats.estimatedPerformanceGain = 'high';
    } else if (mediumImpactItems > 3) {
      stats.estimatedPerformanceGain = 'medium';
    } else {
      stats.estimatedPerformanceGain = 'low';
    }

    return stats;
  }

  /**
   * 清理选中的缓存文件
   */
  static async cleanCache(
    items: SystemCacheItem[],
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; deletedCount: number; failedCount: number; errors: string[]; warnings: string[] }> {
    const result = {
      success: false,
      deletedCount: 0,
      failedCount: 0,
      errors: [] as string[],
      warnings: [] as string[]
    };

    if (items.length === 0) {
      result.success = true;
      return result;
    }

    try {
      if (this.isElectronEnvironment()) {
        // 分类处理不同类型的缓存清理
        for (const item of items.filter(item => item.canDelete)) {
          try {
            if (item.type === 'dns-cache') {
              // 清理 DNS 缓存
              await window.electronAPI.flushDNSCache();
              result.deletedCount++;
            } else if (item.type === 'search-index') {
              // 重建搜索索引
              await window.electronAPI.rebuildSearchIndex();
              result.deletedCount++;
              result.warnings.push('搜索索引已重建，可能需要一些时间来重新索引文件');
            } else {
              // 删除文件或文件夹
              await window.electronAPI.deleteFiles([item.path]);
              result.deletedCount++;
              
              // 对于某些缓存，提供重建提示
              if (item.type === 'icon-cache') {
                result.warnings.push('图标缓存已清理，系统将自动重建');
              } else if (item.type === 'font-cache') {
                result.warnings.push('字体缓存已清理，可能需要重启以完全生效');
              }
            }
          } catch (error) {
            result.failedCount++;
            result.errors.push(`清理 ${item.name} 失败: ${error}`);
          }
        }
        
        result.success = result.failedCount === 0;
      } else {
        // 浏览器环境模拟清理
        result.deletedCount = items.filter(item => item.canDelete).length;
        result.success = true;
        result.warnings.push('在浏览器环境中运行，实际清理需要在桌面应用中进行');
      }
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : '未知错误');
    }

    return result;
  }

  /**
   * 检查是否在 Electron 环境中
   */
  private static isElectronEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           window.electronAPI && 
           typeof window.electronAPI.scanDirectory === 'function';
  }
}
