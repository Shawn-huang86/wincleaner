export interface NetworkItem {
  id: string;
  name: string;
  path: string;
  type: 'wifi-profiles' | 'network-cache' | 'connection-history' | 'remote-desktop' | 'network-logs' | 'dns-cache';
  size: number;
  lastModified: Date;
  description: string;
  riskLevel: 'safe' | 'caution' | 'high';
  canDelete: boolean;
  networkImpact: 'none' | 'temporary' | 'permanent'; // 对网络连接的影响
  itemCount?: number; // 包含的项目数量
}

export interface NetworkCleaningStats {
  totalItems: number;
  totalSize: number;
  wifiProfiles: number;
  networkCache: number;
  connectionHistory: number;
  remoteDesktop: number;
  networkLogs: number;
  dnsCache: number;
  estimatedSpeedImprovement: string;
}

/**
 * 网络清理器 - 清理网络配置和连接相关数据
 */
export class NetworkCleaner {
  private static readonly NETWORK_PATHS = {
    // WiFi 配置文件
    wifiProfiles: [
      'C:\\ProgramData\\Microsoft\\Wlansvc\\Profiles\\Interfaces',
      'C:\\Windows\\System32\\config\\systemprofile\\AppData\\Local\\Microsoft\\Windows\\Caches'
    ],
    
    // 网络缓存
    networkCache: [
      'C:\\Windows\\System32\\config\\systemprofile\\AppData\\Local\\Microsoft\\Windows\\INetCache',
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\Windows\\INetCache',
      'C:\\Windows\\ServiceProfiles\\LocalService\\AppData\\Local\\Microsoft\\Windows\\INetCache'
    ],
    
    // 连接历史
    connectionHistory: [
      'C:\\ProgramData\\Microsoft\\Network\\Connections',
      'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\NetworkList\\Profiles'
    ],
    
    // 远程桌面连接
    remoteDesktop: [
      'C:\\Users\\%USERNAME%\\Documents\\Default.rdp',
      'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Terminal Server Client\\Default'
    ],
    
    // 网络日志
    networkLogs: [
      'C:\\Windows\\System32\\LogFiles\\WMI\\RtBackup',
      'C:\\Windows\\System32\\LogFiles\\HTTPERR',
      'C:\\Windows\\System32\\winevt\\Logs\\Microsoft-Windows-WLAN-AutoConfig%4Operational.evtx'
    ]
  };

  /**
   * 扫描网络相关项目
   */
  static async scanNetworkItems(
    onProgress?: (progress: number) => void
  ): Promise<NetworkItem[]> {
    const networkItems: NetworkItem[] = [];
    
    try {
      if (this.isElectronEnvironment()) {
        return await this.scanWithElectron(onProgress);
      } else {
        return this.getMockNetworkItems();
      }
    } catch (error) {
      console.error('扫描网络项目失败:', error);
      return this.getMockNetworkItems();
    }
  }

  /**
   * 使用 Electron API 扫描网络项目
   */
  private static async scanWithElectron(
    onProgress?: (progress: number) => void
  ): Promise<NetworkItem[]> {
    const networkItems: NetworkItem[] = [];
    const allPaths = Object.values(this.NETWORK_PATHS).flat();
    let processedPaths = 0;

    // 首先获取 DNS 缓存信息
    try {
      const dnsCache = await this.getDNSCacheInfo();
      if (dnsCache) {
        networkItems.push(dnsCache);
      }
    } catch (error) {
      console.warn('获取 DNS 缓存信息失败:', error);
    }

    for (const pathPattern of allPaths) {
      try {
        if (pathPattern.startsWith('HKEY_')) {
          // 处理注册表项
          const registryItem = await this.scanRegistryNetwork(pathPattern);
          if (registryItem) {
            networkItems.push(registryItem);
          }
        } else {
          // 处理文件系统路径
          const expandedPath = pathPattern.replace('%USERNAME%', process.env.USERNAME || 'User');
          
          const files = await window.electronAPI.scanDirectory(expandedPath, {
            recursive: true,
            maxDepth: 3,
            includeDirectories: true
          });

          for (const file of files) {
            const networkItem = this.createNetworkItem(file, pathPattern);
            if (networkItem) {
              networkItems.push(networkItem);
            }
          }
        }
      } catch (error) {
        console.warn(`扫描网络路径失败: ${pathPattern}`, error);
      }

      processedPaths++;
      if (onProgress) {
        onProgress(Math.round((processedPaths / allPaths.length) * 100));
      }
    }

    return networkItems;
  }

  /**
   * 获取 DNS 缓存信息
   */
  private static async getDNSCacheInfo(): Promise<NetworkItem | null> {
    try {
      const dnsInfo = await window.electronAPI.getDNSCacheInfo();
      
      return {
        id: 'dns-cache-network',
        name: 'DNS 解析缓存',
        path: 'System DNS Cache',
        type: 'dns-cache',
        size: dnsInfo.entryCount * 512, // 估算大小
        lastModified: new Date(),
        description: `包含 ${dnsInfo.entryCount} 个 DNS 解析记录`,
        riskLevel: 'safe',
        canDelete: true,
        networkImpact: 'temporary',
        itemCount: dnsInfo.entryCount
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 扫描注册表网络数据
   */
  private static async scanRegistryNetwork(registryPath: string): Promise<NetworkItem | null> {
    try {
      const registryData = await window.electronAPI.readRegistry(registryPath);
      
      if (registryData && registryData.values && registryData.values.length > 0) {
        const type = this.getNetworkTypeFromPath(registryPath);
        
        return {
          id: `network-reg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: this.getRegistryDisplayName(registryPath),
          path: registryPath,
          type,
          size: registryData.values.length * 200, // 估算大小
          lastModified: new Date(),
          description: this.getNetworkDescription(type, registryData.values.length.toString()),
          riskLevel: this.getNetworkRiskLevel(type),
          canDelete: true,
          networkImpact: this.getNetworkImpact(type),
          itemCount: registryData.values.length
        };
      }
    } catch (error) {
      console.warn(`读取网络注册表失败: ${registryPath}`, error);
    }
    
    return null;
  }

  /**
   * 创建网络项
   */
  private static createNetworkItem(file: any, pathPattern: string): NetworkItem | null {
    try {
      const networkType = this.getNetworkTypeFromPath(pathPattern);
      const riskLevel = this.getNetworkRiskLevel(networkType);
      const networkImpact = this.getNetworkImpact(networkType);
      
      return {
        id: `network-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        path: file.path,
        type: networkType,
        size: file.size,
        lastModified: new Date(file.lastModified),
        description: this.getNetworkDescription(networkType, file.name),
        riskLevel,
        canDelete: riskLevel !== 'high',
        networkImpact
      };
    } catch (error) {
      console.warn('创建网络项失败:', error);
      return null;
    }
  }

  /**
   * 从路径获取网络类型
   */
  private static getNetworkTypeFromPath(pathPattern: string): NetworkItem['type'] {
    const lowerPath = pathPattern.toLowerCase();
    
    if (lowerPath.includes('wlansvc') || lowerPath.includes('profiles')) {
      return 'wifi-profiles';
    }
    if (lowerPath.includes('inetcache') || lowerPath.includes('caches')) {
      return 'network-cache';
    }
    if (lowerPath.includes('connections') || lowerPath.includes('networklist')) {
      return 'connection-history';
    }
    if (lowerPath.includes('terminal server') || lowerPath.includes('.rdp')) {
      return 'remote-desktop';
    }
    if (lowerPath.includes('logfiles') || lowerPath.includes('httperr') || lowerPath.includes('wlan')) {
      return 'network-logs';
    }
    
    return 'network-cache'; // 默认类型
  }

  /**
   * 获取注册表显示名称
   */
  private static getRegistryDisplayName(registryPath: string): string {
    if (registryPath.includes('NetworkList')) {
      return '网络连接历史';
    }
    if (registryPath.includes('Terminal Server Client')) {
      return '远程桌面连接历史';
    }
    
    return '网络注册表数据';
  }

  /**
   * 获取网络风险级别
   */
  private static getNetworkRiskLevel(type: NetworkItem['type']): NetworkItem['riskLevel'] {
    // WiFi 配置文件 - 谨慎（可能需要重新输入密码）
    if (type === 'wifi-profiles') {
      return 'caution';
    }
    
    // 连接历史 - 谨慎（可能影响网络自动连接）
    if (type === 'connection-history') {
      return 'caution';
    }
    
    // 其他网络数据 - 安全
    return 'safe';
  }

  /**
   * 获取网络影响
   */
  private static getNetworkImpact(type: NetworkItem['type']): NetworkItem['networkImpact'] {
    const impacts = {
      'wifi-profiles': 'permanent',     // WiFi 配置删除后需要重新配置
      'network-cache': 'temporary',     // 网络缓存清理后会重新生成
      'connection-history': 'permanent', // 连接历史删除后不会恢复
      'remote-desktop': 'permanent',    // 远程桌面配置删除后需要重新配置
      'network-logs': 'none',           // 网络日志删除不影响连接
      'dns-cache': 'temporary'          // DNS 缓存清理后会重新解析
    };
    
    return impacts[type] || 'none';
  }

  /**
   * 获取网络描述
   */
  private static getNetworkDescription(type: NetworkItem['type'], fileName: string): string {
    const descriptions = {
      'wifi-profiles': 'WiFi 网络配置文件',
      'network-cache': '网络缓存和临时文件',
      'connection-history': '网络连接历史记录',
      'remote-desktop': '远程桌面连接配置',
      'network-logs': '网络连接日志文件',
      'dns-cache': 'DNS 域名解析缓存'
    };
    
    return descriptions[type] || '网络相关数据';
  }

  /**
   * 获取模拟网络数据
   */
  private static getMockNetworkItems(): NetworkItem[] {
    const mockItems: NetworkItem[] = [
      {
        id: 'network-1',
        name: 'WiFi 配置文件',
        path: 'C:\\ProgramData\\Microsoft\\Wlansvc\\Profiles\\Interfaces',
        type: 'wifi-profiles',
        size: 2 * 1024 * 1024, // 2MB
        lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10天前
        description: '包含 8 个已保存的 WiFi 网络配置',
        riskLevel: 'caution',
        canDelete: true,
        networkImpact: 'permanent',
        itemCount: 8
      },
      {
        id: 'network-2',
        name: '网络缓存',
        path: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\INetCache',
        type: 'network-cache',
        size: 150 * 1024 * 1024, // 150MB
        lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
        description: '网络临时文件和缓存数据',
        riskLevel: 'safe',
        canDelete: true,
        networkImpact: 'temporary'
      },
      {
        id: 'network-3',
        name: '网络连接历史',
        path: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\NetworkList\\Profiles',
        type: 'connection-history',
        size: 5 * 1024, // 5KB
        lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
        description: '包含 15 个网络连接记录',
        riskLevel: 'caution',
        canDelete: true,
        networkImpact: 'permanent',
        itemCount: 15
      },
      {
        id: 'network-4',
        name: '远程桌面连接历史',
        path: 'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Terminal Server Client\\Default',
        type: 'remote-desktop',
        size: 3 * 1024, // 3KB
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
        description: '包含 5 个远程桌面连接记录',
        riskLevel: 'safe',
        canDelete: true,
        networkImpact: 'permanent',
        itemCount: 5
      },
      {
        id: 'network-5',
        name: 'HTTP 错误日志',
        path: 'C:\\Windows\\System32\\LogFiles\\HTTPERR',
        type: 'network-logs',
        size: 25 * 1024 * 1024, // 25MB
        lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
        description: 'HTTP 服务错误日志文件',
        riskLevel: 'safe',
        canDelete: true,
        networkImpact: 'none'
      },
      {
        id: 'network-6',
        name: 'DNS 解析缓存',
        path: 'System DNS Cache',
        type: 'dns-cache',
        size: 1 * 1024 * 1024, // 1MB
        lastModified: new Date(),
        description: '包含 342 个 DNS 解析记录',
        riskLevel: 'safe',
        canDelete: true,
        networkImpact: 'temporary',
        itemCount: 342
      }
    ];

    return mockItems;
  }

  /**
   * 获取网络清理统计信息
   */
  static getCleaningStats(items: NetworkItem[]): NetworkCleaningStats {
    const stats = {
      totalItems: items.length,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      wifiProfiles: items.filter(item => item.type === 'wifi-profiles').length,
      networkCache: items.filter(item => item.type === 'network-cache').length,
      connectionHistory: items.filter(item => item.type === 'connection-history').length,
      remoteDesktop: items.filter(item => item.type === 'remote-desktop').length,
      networkLogs: items.filter(item => item.type === 'network-logs').length,
      dnsCache: items.filter(item => item.type === 'dns-cache').length,
      estimatedSpeedImprovement: 'medium'
    };

    // 根据清理的网络项目评估速度提升
    const cacheItems = items.filter(item => item.type === 'network-cache' || item.type === 'dns-cache').length;
    const logItems = items.filter(item => item.type === 'network-logs').length;
    
    if (cacheItems > 2 && logItems > 1) {
      stats.estimatedSpeedImprovement = 'high';
    } else if (cacheItems > 1 || logItems > 0) {
      stats.estimatedSpeedImprovement = 'medium';
    } else {
      stats.estimatedSpeedImprovement = 'low';
    }

    return stats;
  }

  /**
   * 清理选中的网络项目
   */
  static async cleanNetworkItems(
    items: NetworkItem[],
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; cleanedCount: number; failedCount: number; errors: string[]; warnings: string[] }> {
    const result = {
      success: false,
      cleanedCount: 0,
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
        // 分类处理不同类型的网络清理
        for (const item of items.filter(item => item.canDelete)) {
          try {
            if (item.type === 'dns-cache') {
              // 清理 DNS 缓存
              await window.electronAPI.flushDNSCache();
              result.cleanedCount++;
              result.warnings.push('DNS 缓存已清理，首次访问网站可能稍慢');
            } else if (item.path.startsWith('HKEY_')) {
              // 清理注册表项
              await window.electronAPI.deleteRegistryKey(item.path);
              result.cleanedCount++;
              
              if (item.type === 'wifi-profiles') {
                result.warnings.push('WiFi 配置已清理，可能需要重新输入密码');
              } else if (item.type === 'connection-history') {
                result.warnings.push('网络连接历史已清理，自动连接功能可能受影响');
              }
            } else {
              // 删除文件或文件夹
              await window.electronAPI.deleteFiles([item.path]);
              result.cleanedCount++;
              
              if (item.type === 'remote-desktop') {
                result.warnings.push('远程桌面配置已清理，需要重新配置连接');
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
        result.cleanedCount = items.filter(item => item.canDelete).length;
        result.success = true;
        result.warnings.push('在浏览器环境中运行，实际清理需要在桌面应用中进行');
      }
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : '未知错误');
    }

    return result;
  }

  /**
   * 重置网络配置
   */
  static async resetNetworkConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      if (this.isElectronEnvironment()) {
        await window.electronAPI.resetNetworkConfiguration();
        return {
          success: true,
          message: '网络配置已重置，建议重启计算机以完全生效'
        };
      } else {
        return {
          success: false,
          message: '网络重置功能需要在桌面应用中运行'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `网络重置失败: ${error instanceof Error ? error.message : '未知错误'}`
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
