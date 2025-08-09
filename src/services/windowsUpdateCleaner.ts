export interface WindowsUpdateItem {
  id: string;
  name: string;
  path: string;
  type: 'update-cache' | 'old-installation' | 'restore-point' | 'defender-definitions' | 'driver-store';
  size: number;
  lastModified: Date;
  description: string;
  riskLevel: 'safe' | 'caution' | 'high';
  canDelete: boolean;
  estimatedSpace: number; // 预估可释放空间
}

export interface UpdateCleaningStats {
  totalItems: number;
  totalSize: number;
  updateCache: number;
  oldInstallations: number;
  restorePoints: number;
  defenderDefinitions: number;
  driverStore: number;
  estimatedSpaceSaving: number;
}

/**
 * Windows 更新清理器 - 清理 Windows 更新相关文件
 */
export class WindowsUpdateCleaner {
  private static readonly UPDATE_PATHS = {
    // Windows 更新缓存
    updateCache: [
      'C:\\Windows\\SoftwareDistribution\\Download',
      'C:\\Windows\\SoftwareDistribution\\DataStore\\Logs',
      'C:\\$Windows.~BT', // Windows 10/11 升级临时文件
      'C:\\$Windows.~WS'  // Windows 升级工作空间
    ],
    
    // 旧的 Windows 安装文件
    oldInstallation: [
      'C:\\Windows.old',
      'C:\\$Windows.~BT\\Sources\\Panther',
      'C:\\Windows\\Panther\\UnattendGC'
    ],
    
    // 系统还原点相关
    restorePoints: [
      'C:\\System Volume Information\\{*}', // 需要特殊处理
      'C:\\Windows\\System32\\restore'
    ],
    
    // Windows Defender 定义文件
    defenderDefinitions: [
      'C:\\ProgramData\\Microsoft\\Windows Defender\\Definition Updates',
      'C:\\Windows\\WindowsUpdate.log'
    ],
    
    // 驱动程序存储清理
    driverStore: [
      'C:\\Windows\\System32\\DriverStore\\FileRepository',
      'C:\\Windows\\inf'
    ]
  };

  /**
   * 扫描 Windows 更新相关文件
   */
  static async scanUpdateFiles(
    onProgress?: (progress: number) => void
  ): Promise<WindowsUpdateItem[]> {
    const items: WindowsUpdateItem[] = [];
    
    try {
      if (this.isElectronEnvironment()) {
        return await this.scanWithElectron(onProgress);
      } else {
        return this.getMockUpdateItems();
      }
    } catch (error) {
      console.error('扫描 Windows 更新文件失败:', error);
      return this.getMockUpdateItems();
    }
  }

  /**
   * 使用 Electron API 扫描更新文件
   */
  private static async scanWithElectron(
    onProgress?: (progress: number) => void
  ): Promise<WindowsUpdateItem[]> {
    const items: WindowsUpdateItem[] = [];
    const allPaths = Object.values(this.UPDATE_PATHS).flat();
    let processedPaths = 0;

    for (const pathPattern of allPaths) {
      try {
        // 特殊处理系统还原点路径
        if (pathPattern.includes('System Volume Information')) {
          const restorePoints = await this.scanRestorePoints();
          items.push(...restorePoints);
        } else {
          const files = await window.electronAPI.scanDirectory(pathPattern, {
            recursive: true,
            maxDepth: 2,
            includeDirectories: true
          });

          for (const file of files) {
            const updateItem = this.createUpdateItem(file, pathPattern);
            if (updateItem) {
              items.push(updateItem);
            }
          }
        }
      } catch (error) {
        console.warn(`扫描路径失败: ${pathPattern}`, error);
      }

      processedPaths++;
      if (onProgress) {
        onProgress(Math.round((processedPaths / allPaths.length) * 100));
      }
    }

    return items;
  }

  /**
   * 扫描系统还原点
   */
  private static async scanRestorePoints(): Promise<WindowsUpdateItem[]> {
    try {
      // 调用 Electron API 获取系统还原点信息
      const restorePoints = await window.electronAPI.getSystemRestorePoints();
      
      return restorePoints.map((point: any, index: number) => ({
        id: `restore-point-${index}`,
        name: `系统还原点 - ${point.description}`,
        path: point.path,
        type: 'restore-point' as const,
        size: point.size,
        lastModified: new Date(point.creationTime),
        description: `创建于 ${new Date(point.creationTime).toLocaleDateString()}`,
        riskLevel: 'caution' as const,
        canDelete: !point.isCritical,
        estimatedSpace: point.size
      }));
    } catch (error) {
      console.warn('获取系统还原点失败:', error);
      return [];
    }
  }

  /**
   * 创建更新项
   */
  private static createUpdateItem(file: any, pathPattern: string): WindowsUpdateItem | null {
    try {
      const updateType = this.getUpdateType(pathPattern, file.path);
      const riskLevel = this.getRiskLevel(updateType, file.path);
      
      return {
        id: `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        path: file.path,
        type: updateType,
        size: file.size,
        lastModified: new Date(file.lastModified),
        description: this.getUpdateDescription(updateType, file.name),
        riskLevel,
        canDelete: riskLevel !== 'high',
        estimatedSpace: file.size
      };
    } catch (error) {
      console.warn('创建更新项失败:', error);
      return null;
    }
  }

  /**
   * 获取更新类型
   */
  private static getUpdateType(pathPattern: string, filePath: string): WindowsUpdateItem['type'] {
    const lowerPath = filePath.toLowerCase();
    
    if (pathPattern.includes('SoftwareDistribution') || pathPattern.includes('$Windows.~')) {
      return 'update-cache';
    }
    if (pathPattern.includes('Windows.old') || lowerPath.includes('windows.old')) {
      return 'old-installation';
    }
    if (pathPattern.includes('System Volume Information') || pathPattern.includes('restore')) {
      return 'restore-point';
    }
    if (pathPattern.includes('Windows Defender') || pathPattern.includes('Definition Updates')) {
      return 'defender-definitions';
    }
    if (pathPattern.includes('DriverStore') || pathPattern.includes('inf')) {
      return 'driver-store';
    }
    
    return 'update-cache'; // 默认类型
  }

  /**
   * 获取风险级别
   */
  private static getRiskLevel(type: WindowsUpdateItem['type'], filePath: string): WindowsUpdateItem['riskLevel'] {
    const lowerPath = filePath.toLowerCase();
    
    // 系统还原点 - 谨慎
    if (type === 'restore-point') {
      return 'caution';
    }
    
    // 驱动程序存储 - 高风险
    if (type === 'driver-store' && !lowerPath.includes('backup')) {
      return 'high';
    }
    
    // 旧安装文件超过30天 - 安全
    if (type === 'old-installation') {
      return 'safe';
    }
    
    // 其他更新缓存 - 安全
    return 'safe';
  }

  /**
   * 获取更新描述
   */
  private static getUpdateDescription(type: WindowsUpdateItem['type'], fileName: string): string {
    const descriptions = {
      'update-cache': 'Windows 更新下载缓存文件',
      'old-installation': '旧版本 Windows 安装文件',
      'restore-point': '系统还原点数据',
      'defender-definitions': 'Windows Defender 病毒定义文件',
      'driver-store': '驱动程序存储文件'
    };
    
    return descriptions[type] || 'Windows 更新相关文件';
  }

  /**
   * 获取模拟更新数据
   */
  private static getMockUpdateItems(): WindowsUpdateItem[] {
    const mockItems: WindowsUpdateItem[] = [
      {
        id: 'update-1',
        name: 'Windows.old',
        path: 'C:\\Windows.old',
        type: 'old-installation',
        size: 15 * 1024 * 1024 * 1024, // 15GB
        lastModified: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45天前
        description: '旧版本 Windows 安装文件',
        riskLevel: 'safe',
        canDelete: true,
        estimatedSpace: 15 * 1024 * 1024 * 1024
      },
      {
        id: 'update-2',
        name: 'Download',
        path: 'C:\\Windows\\SoftwareDistribution\\Download',
        type: 'update-cache',
        size: 3 * 1024 * 1024 * 1024, // 3GB
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
        description: 'Windows 更新下载缓存',
        riskLevel: 'safe',
        canDelete: true,
        estimatedSpace: 3 * 1024 * 1024 * 1024
      },
      {
        id: 'update-3',
        name: '$Windows.~BT',
        path: 'C:\\$Windows.~BT',
        type: 'update-cache',
        size: 2 * 1024 * 1024 * 1024, // 2GB
        lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
        description: 'Windows 升级临时文件',
        riskLevel: 'safe',
        canDelete: true,
        estimatedSpace: 2 * 1024 * 1024 * 1024
      },
      {
        id: 'update-4',
        name: '系统还原点 - 2024-01-15',
        path: 'C:\\System Volume Information\\{3808876B-C176-4e48-B7AE-04046E6CC752}',
        type: 'restore-point',
        size: 1 * 1024 * 1024 * 1024, // 1GB
        lastModified: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20天前
        description: '自动创建的系统还原点',
        riskLevel: 'caution',
        canDelete: true,
        estimatedSpace: 1 * 1024 * 1024 * 1024
      },
      {
        id: 'update-5',
        name: 'Definition Updates',
        path: 'C:\\ProgramData\\Microsoft\\Windows Defender\\Definition Updates',
        type: 'defender-definitions',
        size: 500 * 1024 * 1024, // 500MB
        lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
        description: '旧版本病毒定义文件',
        riskLevel: 'safe',
        canDelete: true,
        estimatedSpace: 500 * 1024 * 1024
      }
    ];

    return mockItems;
  }

  /**
   * 获取更新清理统计信息
   */
  static getCleaningStats(items: WindowsUpdateItem[]): UpdateCleaningStats {
    return {
      totalItems: items.length,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      updateCache: items.filter(item => item.type === 'update-cache').length,
      oldInstallations: items.filter(item => item.type === 'old-installation').length,
      restorePoints: items.filter(item => item.type === 'restore-point').length,
      defenderDefinitions: items.filter(item => item.type === 'defender-definitions').length,
      driverStore: items.filter(item => item.type === 'driver-store').length,
      estimatedSpaceSaving: items.reduce((sum, item) => sum + item.estimatedSpace, 0)
    };
  }

  /**
   * 清理选中的更新文件
   */
  static async cleanUpdateFiles(
    items: WindowsUpdateItem[],
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; deletedCount: number; failedCount: number; spaceSaved: number; errors: string[] }> {
    const result = {
      success: false,
      deletedCount: 0,
      failedCount: 0,
      spaceSaved: 0,
      errors: [] as string[]
    };

    if (items.length === 0) {
      result.success = true;
      return result;
    }

    try {
      if (this.isElectronEnvironment()) {
        // 分类处理不同类型的清理
        const safeItems = items.filter(item => item.canDelete && item.riskLevel === 'safe');
        const cautionItems = items.filter(item => item.canDelete && item.riskLevel === 'caution');
        
        // 先清理安全项
        if (safeItems.length > 0) {
          const filePaths = safeItems.map(item => item.path);
          const deleteResult = await window.electronAPI.deleteFiles(filePaths);
          
          result.deletedCount += deleteResult.deletedFiles.length;
          result.failedCount += deleteResult.failedFiles.length;
          result.spaceSaved += safeItems
            .filter(item => deleteResult.deletedFiles.includes(item.path))
            .reduce((sum, item) => sum + item.estimatedSpace, 0);
        }
        
        // 谨慎项需要特殊处理（如系统还原点）
        for (const item of cautionItems) {
          try {
            if (item.type === 'restore-point') {
              await window.electronAPI.deleteRestorePoint(item.id);
            } else {
              await window.electronAPI.deleteFiles([item.path]);
            }
            result.deletedCount++;
            result.spaceSaved += item.estimatedSpace;
          } catch (error) {
            result.failedCount++;
            result.errors.push(`删除 ${item.name} 失败: ${error}`);
          }
        }
        
        result.success = result.failedCount === 0;
      } else {
        // 浏览器环境模拟删除
        const deletableItems = items.filter(item => item.canDelete);
        result.deletedCount = deletableItems.length;
        result.spaceSaved = deletableItems.reduce((sum, item) => sum + item.estimatedSpace, 0);
        result.success = true;
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
