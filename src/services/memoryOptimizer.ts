export interface MemoryItem {
  id: string;
  name: string;
  path: string;
  type: 'memory-dump' | 'virtual-memory' | 'hibernation-file' | 'page-file' | 'system-cache';
  size: number;
  lastModified: Date;
  description: string;
  riskLevel: 'safe' | 'caution' | 'high';
  canDelete: boolean;
  optimizationType: 'cleanup' | 'optimize' | 'rebuild'; // 优化类型
  memoryImpact: 'low' | 'medium' | 'high'; // 对内存的影响
}

export interface MemoryOptimizationStats {
  totalItems: number;
  totalSize: number;
  memoryDumps: number;
  virtualMemory: number;
  hibernationFiles: number;
  pageFiles: number;
  systemCache: number;
  estimatedMemoryGain: number; // 预估内存释放量（MB）
  currentMemoryUsage: number;  // 当前内存使用率
}

/**
 * 内存优化器 - 优化 Windows 内存使用和清理内存相关文件
 */
export class MemoryOptimizer {
  private static readonly MEMORY_PATHS = {
    // 内存转储文件
    memoryDumps: [
      'C:\\Windows\\MEMORY.DMP',
      'C:\\Windows\\Minidump',
      'C:\\Users\\%USERNAME%\\AppData\\Local\\CrashDumps',
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\Windows\\WER\\ReportQueue'
    ],
    
    // 休眠文件
    hibernationFiles: [
      'C:\\hiberfil.sys'
    ],
    
    // 页面文件
    pageFiles: [
      'C:\\pagefile.sys',
      'C:\\swapfile.sys'
    ],
    
    // 虚拟内存相关
    virtualMemory: [
      'C:\\Windows\\System32\\config\\systemprofile\\AppData\\Local\\Temp',
      'C:\\Windows\\ServiceProfiles\\LocalService\\AppData\\Local\\Temp',
      'C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Temp'
    ]
  };

  /**
   * 扫描内存相关项目
   */
  static async scanMemoryItems(
    onProgress?: (progress: number) => void
  ): Promise<MemoryItem[]> {
    const memoryItems: MemoryItem[] = [];
    
    try {
      if (this.isElectronEnvironment()) {
        return await this.scanWithElectron(onProgress);
      } else {
        return this.getMockMemoryItems();
      }
    } catch (error) {
      console.error('扫描内存项目失败:', error);
      return this.getMockMemoryItems();
    }
  }

  /**
   * 使用 Electron API 扫描内存项目
   */
  private static async scanWithElectron(
    onProgress?: (progress: number) => void
  ): Promise<MemoryItem[]> {
    const memoryItems: MemoryItem[] = [];
    const allPaths = Object.values(this.MEMORY_PATHS).flat();
    let processedPaths = 0;

    // 首先获取系统缓存信息
    try {
      const systemCacheInfo = await this.getSystemCacheInfo();
      if (systemCacheInfo) {
        memoryItems.push(systemCacheInfo);
      }
    } catch (error) {
      console.warn('获取系统缓存信息失败:', error);
    }

    for (const pathPattern of allPaths) {
      try {
        const expandedPath = pathPattern.replace('%USERNAME%', process.env.USERNAME || 'User');
        
        // 特殊处理系统文件
        if (expandedPath.endsWith('.sys')) {
          const fileInfo = await window.electronAPI.getFileInfo(expandedPath);
          if (fileInfo) {
            const memoryItem = this.createMemoryItem(fileInfo, pathPattern);
            if (memoryItem) {
              memoryItems.push(memoryItem);
            }
          }
        } else {
          // 扫描目录
          const files = await window.electronAPI.scanDirectory(expandedPath, {
            recursive: true,
            maxDepth: 2,
            extensions: ['.dmp', '.tmp', '.log']
          });

          for (const file of files) {
            const memoryItem = this.createMemoryItem(file, pathPattern);
            if (memoryItem) {
              memoryItems.push(memoryItem);
            }
          }
        }
      } catch (error) {
        console.warn(`扫描内存路径失败: ${pathPattern}`, error);
      }

      processedPaths++;
      if (onProgress) {
        onProgress(Math.round((processedPaths / allPaths.length) * 100));
      }
    }

    return memoryItems;
  }

  /**
   * 获取系统缓存信息
   */
  private static async getSystemCacheInfo(): Promise<MemoryItem | null> {
    try {
      const memoryInfo = await window.electronAPI.getSystemMemoryInfo();
      
      return {
        id: 'system-cache',
        name: '系统内存缓存',
        path: 'System Memory Cache',
        type: 'system-cache',
        size: memoryInfo.cacheSize,
        lastModified: new Date(),
        description: `当前缓存: ${Math.round(memoryInfo.cacheSize / 1024 / 1024)} MB`,
        riskLevel: 'safe',
        canDelete: true,
        optimizationType: 'optimize',
        memoryImpact: 'high'
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 创建内存项
   */
  private static createMemoryItem(file: any, pathPattern: string): MemoryItem | null {
    try {
      const memoryType = this.getMemoryType(pathPattern, file.path);
      const riskLevel = this.getRiskLevel(memoryType, file.path);
      const optimizationType = this.getOptimizationType(memoryType);
      const memoryImpact = this.getMemoryImpact(memoryType);
      
      return {
        id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        path: file.path,
        type: memoryType,
        size: file.size,
        lastModified: new Date(file.lastModified),
        description: this.getMemoryDescription(memoryType, file.name, file.size),
        riskLevel,
        canDelete: riskLevel !== 'high',
        optimizationType,
        memoryImpact
      };
    } catch (error) {
      console.warn('创建内存项失败:', error);
      return null;
    }
  }

  /**
   * 获取内存类型
   */
  private static getMemoryType(pathPattern: string, filePath: string): MemoryItem['type'] {
    const lowerPath = filePath.toLowerCase();
    
    if (lowerPath.includes('memory.dmp') || lowerPath.includes('minidump') || lowerPath.includes('crashdumps')) {
      return 'memory-dump';
    }
    if (lowerPath.includes('hiberfil.sys')) {
      return 'hibernation-file';
    }
    if (lowerPath.includes('pagefile.sys') || lowerPath.includes('swapfile.sys')) {
      return 'page-file';
    }
    if (pathPattern.includes('ServiceProfiles') || pathPattern.includes('systemprofile')) {
      return 'virtual-memory';
    }
    
    return 'memory-dump'; // 默认类型
  }

  /**
   * 获取风险级别
   */
  private static getRiskLevel(type: MemoryItem['type'], filePath: string): MemoryItem['riskLevel'] {
    // 页面文件和休眠文件 - 高风险（系统关键文件）
    if (type === 'page-file' || type === 'hibernation-file') {
      return 'high';
    }
    
    // 虚拟内存相关 - 谨慎
    if (type === 'virtual-memory') {
      return 'caution';
    }
    
    // 内存转储和系统缓存 - 安全
    return 'safe';
  }

  /**
   * 获取优化类型
   */
  private static getOptimizationType(type: MemoryItem['type']): MemoryItem['optimizationType'] {
    const types = {
      'memory-dump': 'cleanup',      // 清理
      'virtual-memory': 'cleanup',   // 清理
      'hibernation-file': 'optimize', // 优化
      'page-file': 'optimize',       // 优化
      'system-cache': 'optimize'     // 优化
    };
    
    return types[type] || 'cleanup';
  }

  /**
   * 获取内存影响
   */
  private static getMemoryImpact(type: MemoryItem['type']): MemoryItem['memoryImpact'] {
    const impacts = {
      'memory-dump': 'low',        // 内存转储影响小
      'virtual-memory': 'medium',  // 虚拟内存中等影响
      'hibernation-file': 'high',  // 休眠文件影响大
      'page-file': 'high',         // 页面文件影响大
      'system-cache': 'high'       // 系统缓存影响大
    };
    
    return impacts[type] || 'low';
  }

  /**
   * 获取内存描述
   */
  private static getMemoryDescription(type: MemoryItem['type'], fileName: string, size: number): string {
    const sizeInMB = Math.round(size / 1024 / 1024);
    
    const descriptions = {
      'memory-dump': `内存转储文件 (${sizeInMB} MB)，用于系统崩溃分析`,
      'virtual-memory': `虚拟内存临时文件 (${sizeInMB} MB)`,
      'hibernation-file': `休眠文件 (${sizeInMB} MB)，用于快速启动`,
      'page-file': `页面文件 (${sizeInMB} MB)，虚拟内存交换文件`,
      'system-cache': `系统内存缓存 (${sizeInMB} MB)`
    };
    
    return descriptions[type] || `内存相关文件 (${sizeInMB} MB)`;
  }

  /**
   * 获取模拟内存数据
   */
  private static getMockMemoryItems(): MemoryItem[] {
    const mockItems: MemoryItem[] = [
      {
        id: 'memory-1',
        name: 'MEMORY.DMP',
        path: 'C:\\Windows\\MEMORY.DMP',
        type: 'memory-dump',
        size: 2 * 1024 * 1024 * 1024, // 2GB
        lastModified: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15天前
        description: '完整内存转储文件 (2048 MB)，用于系统崩溃分析',
        riskLevel: 'safe',
        canDelete: true,
        optimizationType: 'cleanup',
        memoryImpact: 'low'
      },
      {
        id: 'memory-2',
        name: 'Minidump 文件夹',
        path: 'C:\\Windows\\Minidump',
        type: 'memory-dump',
        size: 150 * 1024 * 1024, // 150MB
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
        description: '小型内存转储文件 (150 MB)，包含 12 个转储文件',
        riskLevel: 'safe',
        canDelete: true,
        optimizationType: 'cleanup',
        memoryImpact: 'low'
      },
      {
        id: 'memory-3',
        name: 'hiberfil.sys',
        path: 'C:\\hiberfil.sys',
        type: 'hibernation-file',
        size: 8 * 1024 * 1024 * 1024, // 8GB
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
        description: '休眠文件 (8192 MB)，用于快速启动',
        riskLevel: 'high',
        canDelete: false,
        optimizationType: 'optimize',
        memoryImpact: 'high'
      },
      {
        id: 'memory-4',
        name: 'pagefile.sys',
        path: 'C:\\pagefile.sys',
        type: 'page-file',
        size: 4 * 1024 * 1024 * 1024, // 4GB
        lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1小时前
        description: '页面文件 (4096 MB)，虚拟内存交换文件',
        riskLevel: 'high',
        canDelete: false,
        optimizationType: 'optimize',
        memoryImpact: 'high'
      },
      {
        id: 'memory-5',
        name: '系统内存缓存',
        path: 'System Memory Cache',
        type: 'system-cache',
        size: 1024 * 1024 * 1024, // 1GB
        lastModified: new Date(),
        description: '当前缓存: 1024 MB',
        riskLevel: 'safe',
        canDelete: true,
        optimizationType: 'optimize',
        memoryImpact: 'high'
      },
      {
        id: 'memory-6',
        name: '服务临时文件',
        path: 'C:\\Windows\\ServiceProfiles\\LocalService\\AppData\\Local\\Temp',
        type: 'virtual-memory',
        size: 200 * 1024 * 1024, // 200MB
        lastModified: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6小时前
        description: '系统服务临时文件 (200 MB)',
        riskLevel: 'caution',
        canDelete: true,
        optimizationType: 'cleanup',
        memoryImpact: 'medium'
      }
    ];

    return mockItems;
  }

  /**
   * 获取内存优化统计信息
   */
  static async getOptimizationStats(items: MemoryItem[]): Promise<MemoryOptimizationStats> {
    let currentMemoryUsage = 0;
    
    try {
      if (this.isElectronEnvironment()) {
        const memoryInfo = await window.electronAPI.getSystemMemoryInfo();
        currentMemoryUsage = Math.round((memoryInfo.used / memoryInfo.total) * 100);
      } else {
        currentMemoryUsage = 65; // 模拟数据
      }
    } catch (error) {
      currentMemoryUsage = 65; // 默认值
    }

    const cleanupItems = items.filter(item => item.optimizationType === 'cleanup' && item.canDelete);
    const estimatedMemoryGain = Math.round(
      cleanupItems.reduce((sum, item) => sum + item.size, 0) / 1024 / 1024
    );

    return {
      totalItems: items.length,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      memoryDumps: items.filter(item => item.type === 'memory-dump').length,
      virtualMemory: items.filter(item => item.type === 'virtual-memory').length,
      hibernationFiles: items.filter(item => item.type === 'hibernation-file').length,
      pageFiles: items.filter(item => item.type === 'page-file').length,
      systemCache: items.filter(item => item.type === 'system-cache').length,
      estimatedMemoryGain,
      currentMemoryUsage
    };
  }

  /**
   * 执行内存优化
   */
  static async optimizeMemory(
    items: MemoryItem[],
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; optimizedCount: number; failedCount: number; memoryFreed: number; errors: string[]; warnings: string[] }> {
    const result = {
      success: false,
      optimizedCount: 0,
      failedCount: 0,
      memoryFreed: 0,
      errors: [] as string[],
      warnings: [] as string[]
    };

    if (items.length === 0) {
      result.success = true;
      return result;
    }

    try {
      if (this.isElectronEnvironment()) {
        // 分类处理不同类型的内存优化
        const cleanupItems = items.filter(item => item.optimizationType === 'cleanup' && item.canDelete);
        const optimizeItems = items.filter(item => item.optimizationType === 'optimize' && item.canDelete);
        
        // 清理内存转储文件
        for (const item of cleanupItems) {
          try {
            await window.electronAPI.deleteFiles([item.path]);
            result.optimizedCount++;
            result.memoryFreed += Math.round(item.size / 1024 / 1024);
          } catch (error) {
            result.failedCount++;
            result.errors.push(`清理 ${item.name} 失败: ${error}`);
          }
        }
        
        // 优化系统缓存
        for (const item of optimizeItems) {
          try {
            if (item.type === 'system-cache') {
              await window.electronAPI.clearSystemCache();
              result.optimizedCount++;
              result.memoryFreed += Math.round(item.size / 1024 / 1024);
              result.warnings.push('系统缓存已清理，可能会暂时影响系统响应速度');
            }
          } catch (error) {
            result.failedCount++;
            result.errors.push(`优化 ${item.name} 失败: ${error}`);
          }
        }
        
        result.success = result.failedCount === 0;
      } else {
        // 浏览器环境模拟优化
        const optimizableItems = items.filter(item => item.canDelete);
        result.optimizedCount = optimizableItems.length;
        result.memoryFreed = Math.round(
          optimizableItems.reduce((sum, item) => sum + item.size, 0) / 1024 / 1024
        );
        result.success = true;
        result.warnings.push('在浏览器环境中运行，实际优化需要在桌面应用中进行');
      }
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : '未知错误');
    }

    return result;
  }

  /**
   * 获取当前内存使用情况
   */
  static async getCurrentMemoryUsage(): Promise<{
    total: number;
    used: number;
    free: number;
    usagePercent: number;
    cached: number;
  }> {
    try {
      if (this.isElectronEnvironment()) {
        const memoryInfo = await window.electronAPI.getSystemMemoryInfo();
        return {
          total: Math.round(memoryInfo.total / 1024 / 1024), // MB
          used: Math.round(memoryInfo.used / 1024 / 1024),   // MB
          free: Math.round(memoryInfo.free / 1024 / 1024),   // MB
          usagePercent: Math.round((memoryInfo.used / memoryInfo.total) * 100),
          cached: Math.round(memoryInfo.cached / 1024 / 1024) // MB
        };
      } else {
        // 浏览器环境返回模拟数据
        return {
          total: 16384,  // 16GB
          used: 10650,   // 10.4GB
          free: 5734,    // 5.6GB
          usagePercent: 65,
          cached: 2048   // 2GB
        };
      }
    } catch (error) {
      console.error('获取内存使用情况失败:', error);
      return {
        total: 16384,
        used: 10650,
        free: 5734,
        usagePercent: 65,
        cached: 2048
      };
    }
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
