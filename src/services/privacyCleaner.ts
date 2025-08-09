export interface PrivacyItem {
  id: string;
  name: string;
  path: string;
  type: 'recent-docs' | 'run-history' | 'search-history' | 'clipboard-history' | 'activity-history' | 'location-data' | 'jump-lists';
  size: number;
  lastModified: Date;
  description: string;
  riskLevel: 'safe' | 'caution' | 'high';
  canDelete: boolean;
  privacyLevel: 'low' | 'medium' | 'high'; // 隐私敏感度
  itemCount?: number; // 包含的项目数量
}

export interface PrivacyCleaningStats {
  totalItems: number;
  totalSize: number;
  recentDocs: number;
  runHistory: number;
  searchHistory: number;
  clipboardHistory: number;
  activityHistory: number;
  locationData: number;
  jumpLists: number;
  highPrivacyItems: number;
}

/**
 * 隐私数据清理器 - 清理 Windows 隐私相关数据
 */
export class PrivacyCleaner {
  private static readonly PRIVACY_PATHS = {
    // 最近使用的文档
    recentDocs: [
      'C:\\Users\\%USERNAME%\\AppData\\Roaming\\Microsoft\\Windows\\Recent',
      'C:\\Users\\%USERNAME%\\AppData\\Roaming\\Microsoft\\Office\\Recent'
    ],
    
    // 运行历史记录
    runHistory: [
      'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU',
      'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\TypedPaths'
    ],
    
    // 搜索历史记录
    searchHistory: [
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\Windows\\History',
      'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\WordWheelQuery'
    ],
    
    // 剪贴板历史
    clipboardHistory: [
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\Windows\\CloudClipboard'
    ],
    
    // Windows 活动历史
    activityHistory: [
      'C:\\Users\\%USERNAME%\\AppData\\Local\\ConnectedDevicesPlatform',
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\Windows\\UsrClass.dat'
    ],
    
    // 位置服务数据
    locationData: [
      'C:\\ProgramData\\Microsoft\\Diagnosis\\ETLLogs\\AutoLogger',
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\Windows\\LocationProvider'
    ],
    
    // 跳转列表
    jumpLists: [
      'C:\\Users\\%USERNAME%\\AppData\\Roaming\\Microsoft\\Windows\\Recent\\AutomaticDestinations',
      'C:\\Users\\%USERNAME%\\AppData\\Roaming\\Microsoft\\Windows\\Recent\\CustomDestinations'
    ]
  };

  /**
   * 扫描隐私数据
   */
  static async scanPrivacyData(
    onProgress?: (progress: number) => void
  ): Promise<PrivacyItem[]> {
    const privacyItems: PrivacyItem[] = [];
    
    try {
      if (this.isElectronEnvironment()) {
        return await this.scanWithElectron(onProgress);
      } else {
        return this.getMockPrivacyItems();
      }
    } catch (error) {
      console.error('扫描隐私数据失败:', error);
      return this.getMockPrivacyItems();
    }
  }

  /**
   * 使用 Electron API 扫描隐私数据
   */
  private static async scanWithElectron(
    onProgress?: (progress: number) => void
  ): Promise<PrivacyItem[]> {
    const privacyItems: PrivacyItem[] = [];
    const allPaths = Object.values(this.PRIVACY_PATHS).flat();
    let processedPaths = 0;

    for (const pathPattern of allPaths) {
      try {
        if (pathPattern.startsWith('HKEY_')) {
          // 处理注册表项
          const registryItem = await this.scanRegistryPrivacy(pathPattern);
          if (registryItem) {
            privacyItems.push(registryItem);
          }
        } else {
          // 处理文件系统路径
          const expandedPath = pathPattern.replace('%USERNAME%', process.env.USERNAME || 'User');
          
          const files = await window.electronAPI.scanDirectory(expandedPath, {
            recursive: true,
            maxDepth: 2,
            includeDirectories: true
          });

          for (const file of files) {
            const privacyItem = this.createPrivacyItem(file, pathPattern);
            if (privacyItem) {
              privacyItems.push(privacyItem);
            }
          }
        }
      } catch (error) {
        console.warn(`扫描隐私路径失败: ${pathPattern}`, error);
      }

      processedPaths++;
      if (onProgress) {
        onProgress(Math.round((processedPaths / allPaths.length) * 100));
      }
    }

    return privacyItems;
  }

  /**
   * 扫描注册表隐私数据
   */
  private static async scanRegistryPrivacy(registryPath: string): Promise<PrivacyItem | null> {
    try {
      const registryData = await window.electronAPI.readRegistry(registryPath);
      
      if (registryData && registryData.values && registryData.values.length > 0) {
        const type = this.getPrivacyTypeFromPath(registryPath);
        
        return {
          id: `privacy-reg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: this.getRegistryDisplayName(registryPath),
          path: registryPath,
          type,
          size: registryData.values.length * 100, // 估算大小
          lastModified: new Date(),
          description: this.getPrivacyDescription(type, registryData.values.length.toString()),
          riskLevel: 'safe',
          canDelete: true,
          privacyLevel: this.getPrivacyLevel(type),
          itemCount: registryData.values.length
        };
      }
    } catch (error) {
      console.warn(`读取注册表失败: ${registryPath}`, error);
    }
    
    return null;
  }

  /**
   * 创建隐私项
   */
  private static createPrivacyItem(file: any, pathPattern: string): PrivacyItem | null {
    try {
      const privacyType = this.getPrivacyTypeFromPath(pathPattern);
      const riskLevel = this.getRiskLevel(privacyType, file.path);
      const privacyLevel = this.getPrivacyLevel(privacyType);
      
      return {
        id: `privacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        path: file.path,
        type: privacyType,
        size: file.size,
        lastModified: new Date(file.lastModified),
        description: this.getPrivacyDescription(privacyType, file.name),
        riskLevel,
        canDelete: riskLevel !== 'high',
        privacyLevel
      };
    } catch (error) {
      console.warn('创建隐私项失败:', error);
      return null;
    }
  }

  /**
   * 从路径获取隐私类型
   */
  private static getPrivacyTypeFromPath(pathPattern: string): PrivacyItem['type'] {
    const lowerPath = pathPattern.toLowerCase();
    
    if (lowerPath.includes('recent') && !lowerPath.includes('destinations')) {
      return 'recent-docs';
    }
    if (lowerPath.includes('runmru') || lowerPath.includes('typedpaths')) {
      return 'run-history';
    }
    if (lowerPath.includes('history') || lowerPath.includes('wordwheelquery')) {
      return 'search-history';
    }
    if (lowerPath.includes('cloudclipboard')) {
      return 'clipboard-history';
    }
    if (lowerPath.includes('connecteddevices') || lowerPath.includes('usrclass')) {
      return 'activity-history';
    }
    if (lowerPath.includes('location') || lowerPath.includes('diagnosis')) {
      return 'location-data';
    }
    if (lowerPath.includes('destinations')) {
      return 'jump-lists';
    }
    
    return 'recent-docs'; // 默认类型
  }

  /**
   * 获取注册表显示名称
   */
  private static getRegistryDisplayName(registryPath: string): string {
    if (registryPath.includes('RunMRU')) {
      return '运行命令历史';
    }
    if (registryPath.includes('TypedPaths')) {
      return '地址栏输入历史';
    }
    if (registryPath.includes('WordWheelQuery')) {
      return '搜索查询历史';
    }
    
    return '注册表隐私数据';
  }

  /**
   * 获取风险级别
   */
  private static getRiskLevel(type: PrivacyItem['type'], filePath: string): PrivacyItem['riskLevel'] {
    // 位置数据 - 谨慎（可能影响位置服务）
    if (type === 'location-data') {
      return 'caution';
    }
    
    // 活动历史 - 谨慎（可能影响时间线功能）
    if (type === 'activity-history' && filePath.includes('UsrClass.dat')) {
      return 'caution';
    }
    
    // 其他隐私数据 - 安全
    return 'safe';
  }

  /**
   * 获取隐私级别
   */
  private static getPrivacyLevel(type: PrivacyItem['type']): PrivacyItem['privacyLevel'] {
    const levels = {
      'recent-docs': 'high',        // 最近文档隐私敏感度高
      'run-history': 'medium',      // 运行历史中等敏感
      'search-history': 'high',     // 搜索历史高敏感
      'clipboard-history': 'high',  // 剪贴板历史高敏感
      'activity-history': 'high',   // 活动历史高敏感
      'location-data': 'high',      // 位置数据高敏感
      'jump-lists': 'medium'        // 跳转列表中等敏感
    };
    
    return levels[type] || 'medium';
  }

  /**
   * 获取隐私描述
   */
  private static getPrivacyDescription(type: PrivacyItem['type'], fileName: string): string {
    const descriptions = {
      'recent-docs': '最近打开的文档记录',
      'run-history': '运行对话框的历史命令',
      'search-history': '文件搜索和网页搜索历史',
      'clipboard-history': '剪贴板历史记录',
      'activity-history': 'Windows 时间线活动记录',
      'location-data': '位置服务和诊断数据',
      'jump-lists': '任务栏跳转列表记录'
    };
    
    return descriptions[type] || '隐私相关数据';
  }

  /**
   * 获取模拟隐私数据
   */
  private static getMockPrivacyItems(): PrivacyItem[] {
    const mockItems: PrivacyItem[] = [
      {
        id: 'privacy-1',
        name: 'Recent 文件夹',
        path: 'C:\\Users\\User\\AppData\\Roaming\\Microsoft\\Windows\\Recent',
        type: 'recent-docs',
        size: 5 * 1024 * 1024, // 5MB
        lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
        description: '包含 234 个最近文档的快捷方式',
        riskLevel: 'safe',
        canDelete: true,
        privacyLevel: 'high',
        itemCount: 234
      },
      {
        id: 'privacy-2',
        name: '运行命令历史',
        path: 'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU',
        type: 'run-history',
        size: 2 * 1024, // 2KB
        lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
        description: '包含 15 个运行命令记录',
        riskLevel: 'safe',
        canDelete: true,
        privacyLevel: 'medium',
        itemCount: 15
      },
      {
        id: 'privacy-3',
        name: '搜索查询历史',
        path: 'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\WordWheelQuery',
        type: 'search-history',
        size: 5 * 1024, // 5KB
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
        description: '包含 67 个搜索查询记录',
        riskLevel: 'safe',
        canDelete: true,
        privacyLevel: 'high',
        itemCount: 67
      },
      {
        id: 'privacy-4',
        name: '云剪贴板数据',
        path: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\CloudClipboard',
        type: 'clipboard-history',
        size: 10 * 1024 * 1024, // 10MB
        lastModified: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6小时前
        description: '剪贴板历史和同步数据',
        riskLevel: 'safe',
        canDelete: true,
        privacyLevel: 'high'
      },
      {
        id: 'privacy-5',
        name: '活动历史数据',
        path: 'C:\\Users\\User\\AppData\\Local\\ConnectedDevicesPlatform',
        type: 'activity-history',
        size: 25 * 1024 * 1024, // 25MB
        lastModified: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12小时前
        description: 'Windows 时间线和跨设备活动记录',
        riskLevel: 'safe',
        canDelete: true,
        privacyLevel: 'high'
      },
      {
        id: 'privacy-6',
        name: '位置服务数据',
        path: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\LocationProvider',
        type: 'location-data',
        size: 8 * 1024 * 1024, // 8MB
        lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
        description: '位置历史和地理位置缓存',
        riskLevel: 'caution',
        canDelete: true,
        privacyLevel: 'high'
      },
      {
        id: 'privacy-7',
        name: '自动跳转列表',
        path: 'C:\\Users\\User\\AppData\\Roaming\\Microsoft\\Windows\\Recent\\AutomaticDestinations',
        type: 'jump-lists',
        size: 15 * 1024 * 1024, // 15MB
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
        description: '任务栏应用程序跳转列表记录',
        riskLevel: 'safe',
        canDelete: true,
        privacyLevel: 'medium'
      }
    ];

    return mockItems;
  }

  /**
   * 获取隐私清理统计信息
   */
  static getCleaningStats(items: PrivacyItem[]): PrivacyCleaningStats {
    return {
      totalItems: items.length,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      recentDocs: items.filter(item => item.type === 'recent-docs').length,
      runHistory: items.filter(item => item.type === 'run-history').length,
      searchHistory: items.filter(item => item.type === 'search-history').length,
      clipboardHistory: items.filter(item => item.type === 'clipboard-history').length,
      activityHistory: items.filter(item => item.type === 'activity-history').length,
      locationData: items.filter(item => item.type === 'location-data').length,
      jumpLists: items.filter(item => item.type === 'jump-lists').length,
      highPrivacyItems: items.filter(item => item.privacyLevel === 'high').length
    };
  }

  /**
   * 清理选中的隐私数据
   */
  static async cleanPrivacyData(
    items: PrivacyItem[],
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
        // 分类处理不同类型的隐私数据清理
        for (const item of items.filter(item => item.canDelete)) {
          try {
            if (item.path.startsWith('HKEY_')) {
              // 清理注册表项
              await window.electronAPI.deleteRegistryKey(item.path);
              result.deletedCount++;
            } else {
              // 删除文件或文件夹
              await window.electronAPI.deleteFiles([item.path]);
              result.deletedCount++;
            }
            
            // 添加相关警告
            if (item.type === 'activity-history') {
              result.warnings.push('活动历史已清理，Windows 时间线功能可能受影响');
            } else if (item.type === 'location-data') {
              result.warnings.push('位置数据已清理，位置服务可能需要重新授权');
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
