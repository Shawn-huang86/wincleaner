/**
 * 注册表项接口
 */
export interface RegistryItem {
  id: string;
  keyPath: string;
  valueName?: string;
  valueData?: string;
  type: 'key' | 'value';
  category: 'uninstall' | 'startup' | 'file_association' | 'service' | 'driver' | 'other';
  description: string;
  relatedSoftware?: string;
  riskLevel: 'safe' | 'caution' | 'dangerous';
  canDelete: boolean;
  reason: string;
  lastModified?: Date;
  confidence: number;
  size: number; // 注册表项的估算大小（字节）
}

/**
 * 注册表扫描器
 */
export class RegistryScanner {
  // 常见的软件残留注册表位置
  private static readonly REMNANT_REGISTRY_PATHS = {
    // 卸载信息
    uninstall: [
      'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall'
    ],
    
    // 自启动项
    startup: [
      'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
      'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce',
      'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
      'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce',
      'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Run'
    ],
    
    // 文件关联
    fileAssociation: [
      'HKEY_CLASSES_ROOT',
      'HKEY_CURRENT_USER\\SOFTWARE\\Classes'
    ],
    
    // 服务
    services: [
      'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services'
    ],
    
    // 软件配置
    software: [
      'HKEY_LOCAL_MACHINE\\SOFTWARE',
      'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node',
      'HKEY_CURRENT_USER\\SOFTWARE'
    ]
  };

  // 已知的安全删除模式
  private static readonly SAFE_DELETE_PATTERNS = [
    /.*\\Uninstall\\.*_is1$/i,  // Inno Setup卸载项
    /.*\\Run\\.*Update.*$/i,    // 更新程序启动项
    /.*\\Classes\\.*\.tmp$/i,   // 临时文件关联
    /.*\\MuiCache\\.*$/i,       // MUI缓存
    /.*\\OpenWithList\\.*$/i,   // 打开方式列表
    /.*\\RecentDocs\\.*$/i      // 最近文档
  ];

  // 危险的注册表项模式
  private static readonly DANGEROUS_PATTERNS = [
    /HKEY_LOCAL_MACHINE\\SYSTEM\\.*\\Control/i,
    /HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion/i,
    /HKEY_LOCAL_MACHINE\\SOFTWARE\\Classes\\CLSID/i,
    /.*\\Shell\\.*\\Command/i
  ];

  /**
   * 扫描注册表残留项
   */
  static async scanRegistryRemnants(
    onProgress?: (progress: { current: number; total: number; currentItem: string }) => void
  ): Promise<RegistryItem[]> {
    const remnants: RegistryItem[] = [];
    const categories = Object.keys(this.REMNANT_REGISTRY_PATHS);
    let currentCategory = 0;

    try {
      for (const category of categories) {
        if (onProgress) {
          onProgress({
            current: currentCategory + 1,
            total: categories.length,
            currentItem: `扫描${category}注册表项...`
          });
        }

        const categoryRemnants = await this.scanRegistryCategory(
          category as keyof typeof this.REMNANT_REGISTRY_PATHS
        );
        remnants.push(...categoryRemnants);
        currentCategory++;
      }

      // 分析和过滤结果
      const analyzedRemnants = this.analyzeRegistryItems(remnants);
      return analyzedRemnants;

    } catch (error) {
      console.error('注册表扫描失败:', error);
      return [];
    }
  }

  /**
   * 扫描特定类别的注册表项
   */
  private static async scanRegistryCategory(
    category: keyof typeof this.REMNANT_REGISTRY_PATHS
  ): Promise<RegistryItem[]> {
    const items: RegistryItem[] = [];
    const paths = this.REMNANT_REGISTRY_PATHS[category];

    // 模拟注册表扫描结果（实际实现中会调用Electron主进程）
    const mockItems = this.getMockRegistryItems(category);
    items.push(...mockItems);

    return items;
  }

  /**
   * 获取模拟注册表数据
   */
  private static getMockRegistryItems(category: string): RegistryItem[] {
    const mockData: Record<string, RegistryItem[]> = {
      uninstall: [
        {
          id: 'reg-uninstall-1',
          keyPath: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{DEAD-BEEF-1234-5678}',
          type: 'key',
          category: 'uninstall',
          description: '已卸载软件的卸载信息残留',
          relatedSoftware: 'Old Software v1.0',
          riskLevel: 'safe',
          canDelete: true,
          reason: '软件已卸载但卸载信息仍存在',
          confidence: 0.9,
          size: 2048 // 2KB
        },
        {
          id: 'reg-uninstall-2',
          keyPath: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Adobe Reader DC_OLD',
          type: 'key',
          category: 'uninstall',
          description: 'Adobe Reader旧版本卸载信息',
          relatedSoftware: 'Adobe Reader DC',
          riskLevel: 'safe',
          canDelete: true,
          reason: '软件升级后的旧版本信息',
          confidence: 0.85,
          size: 1536 // 1.5KB
        }
      ],

      startup: [
        {
          id: 'reg-startup-1',
          keyPath: 'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
          valueName: 'SkypeAutoStart',
          valueData: 'C:\\Program Files\\Skype\\Skype.exe /minimized',
          type: 'value',
          category: 'startup',
          description: 'Skype自启动项（程序已卸载）',
          relatedSoftware: 'Skype',
          riskLevel: 'safe',
          canDelete: true,
          reason: '指向的程序文件不存在',
          confidence: 0.95,
          size: 512 // 512B
        },
        {
          id: 'reg-startup-2',
          keyPath: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
          valueName: 'AdobeUpdater',
          valueData: 'C:\\Program Files\\Adobe\\Updater\\AdobeUpdater.exe',
          type: 'value',
          category: 'startup',
          description: 'Adobe更新程序自启动项',
          relatedSoftware: 'Adobe Updater',
          riskLevel: 'caution',
          canDelete: true,
          reason: '更新程序可能不再需要',
          confidence: 0.7,
          size: 768 // 768B
        }
      ],

      fileAssociation: [
        {
          id: 'reg-assoc-1',
          keyPath: 'HKEY_CLASSES_ROOT\\.oldext',
          type: 'key',
          category: 'file_association',
          description: '未知软件的文件关联残留',
          relatedSoftware: 'Unknown Application',
          riskLevel: 'safe',
          canDelete: true,
          reason: '关联的程序已不存在',
          confidence: 0.8,
          size: 256 // 256B
        }
      ],

      services: [
        {
          id: 'reg-service-1',
          keyPath: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\OldAntivirusService',
          type: 'key',
          category: 'service',
          description: '已卸载杀毒软件的服务残留',
          relatedSoftware: 'Old Antivirus',
          riskLevel: 'caution',
          canDelete: true,
          reason: '服务对应的程序已被卸载',
          confidence: 0.9,
          size: 1024 // 1KB
        }
      ],

      software: [
        {
          id: 'reg-software-1',
          keyPath: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\RemovedSoftware',
          type: 'key',
          category: 'other',
          description: '已删除软件的配置残留',
          relatedSoftware: 'Removed Software',
          riskLevel: 'safe',
          canDelete: true,
          reason: '软件配置信息残留',
          confidence: 0.75,
          size: 3072 // 3KB
        }
      ]
    };

    return mockData[category] || [];
  }

  /**
   * 分析注册表项
   */
  private static analyzeRegistryItems(items: RegistryItem[]): RegistryItem[] {
    return items.map(item => {
      // 检查是否匹配安全删除模式
      const isSafePattern = this.SAFE_DELETE_PATTERNS.some(pattern => 
        pattern.test(item.keyPath)
      );
      
      if (isSafePattern) {
        item.confidence = Math.min(item.confidence + 0.1, 1.0);
        item.riskLevel = 'safe';
      }

      // 检查是否匹配危险模式
      const isDangerousPattern = this.DANGEROUS_PATTERNS.some(pattern => 
        pattern.test(item.keyPath)
      );
      
      if (isDangerousPattern) {
        item.riskLevel = 'dangerous';
        item.canDelete = false;
        item.reason = '系统关键注册表项，不建议删除';
      }

      // 验证关联的程序是否存在
      if (item.relatedSoftware && item.type === 'value' && item.valueData) {
        const programPath = this.extractProgramPath(item.valueData);
        if (programPath && !this.programExists(programPath)) {
          item.confidence = Math.min(item.confidence + 0.15, 1.0);
          item.reason = '关联的程序文件不存在';
        }
      }

      return item;
    });
  }

  /**
   * 从注册表值中提取程序路径
   */
  private static extractProgramPath(valueData: string): string | null {
    // 简单的路径提取逻辑
    const match = valueData.match(/^"?([C-Z]:\\[^"]*\.exe)/i);
    return match ? match[1] : null;
  }

  /**
   * 检查程序是否存在（模拟）
   */
  private static programExists(programPath: string): boolean {
    // 在实际实现中，这里会调用Electron主进程检查文件是否存在
    // 模拟一些程序不存在的情况
    const nonExistentPrograms = [
      'C:\\Program Files\\Skype\\Skype.exe',
      'C:\\Program Files\\OldSoftware\\app.exe',
      'C:\\Program Files\\RemovedApp\\main.exe'
    ];
    
    return !nonExistentPrograms.some(path => 
      programPath.toLowerCase().includes(path.toLowerCase())
    );
  }

  /**
   * 获取注册表统计信息
   */
  static getRegistryStats(items: RegistryItem[]): {
    total: number;
    byCategory: Record<string, number>;
    byRiskLevel: Record<string, number>;
    canDeleteCount: number;
    highConfidenceCount: number;
  } {
    const stats = {
      total: items.length,
      byCategory: {} as Record<string, number>,
      byRiskLevel: {} as Record<string, number>,
      canDeleteCount: 0,
      highConfidenceCount: 0
    };

    items.forEach(item => {
      // 按类别统计
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      
      // 按风险级别统计
      stats.byRiskLevel[item.riskLevel] = (stats.byRiskLevel[item.riskLevel] || 0) + 1;
      
      // 可删除数量
      if (item.canDelete) {
        stats.canDeleteCount++;
      }
      
      // 高置信度数量
      if (item.confidence >= 0.8) {
        stats.highConfidenceCount++;
      }
    });

    return stats;
  }

  /**
   * 按类别分组注册表项
   */
  static groupItemsByCategory(items: RegistryItem[]): Record<string, RegistryItem[]> {
    const grouped: Record<string, RegistryItem[]> = {};
    
    items.forEach(item => {
      const category = item.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });

    return grouped;
  }

  /**
   * 获取推荐清理的注册表项
   */
  static getRecommendedForCleaning(items: RegistryItem[]): RegistryItem[] {
    return items.filter(item => 
      item.canDelete && 
      item.confidence >= 0.7 && 
      item.riskLevel !== 'dangerous'
    );
  }

  /**
   * 验证注册表项是否安全删除
   */
  static validateDeletion(item: RegistryItem): {
    safe: boolean;
    reason: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    if (!item.canDelete) {
      return {
        safe: false,
        reason: item.reason,
        warnings
      };
    }

    if (item.riskLevel === 'dangerous') {
      return {
        safe: false,
        reason: '高风险注册表项，不建议删除',
        warnings
      };
    }

    if (item.confidence < 0.5) {
      warnings.push('置信度较低，建议谨慎处理');
    }

    if (item.riskLevel === 'caution') {
      warnings.push('需要用户确认的操作');
    }

    return {
      safe: true,
      reason: '可以安全删除',
      warnings
    };
  }
}
