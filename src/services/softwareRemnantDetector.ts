import { ApplicationInfo } from '../types';
import { AIService } from './aiService';

/**
 * 软件残留项接口
 */
export interface SoftwareRemnant {
  id: string;
  type: 'file' | 'folder' | 'registry' | 'shortcut' | 'service';
  path: string;
  name: string;
  relatedSoftware: string;
  confidence: number; // 0-1，确信这是残留的程度
  size?: number;
  lastModified?: Date;
  description: string;
  riskLevel: 'safe' | 'caution' | 'dangerous';
  canDelete: boolean;
  reason: string;
}

/**
 * 软件残留检测器
 */
export class SoftwareRemnantDetector {
  // 常见的软件安装路径模式
  private static readonly COMMON_INSTALL_PATHS = [
    'C:\\Program Files\\',
    'C:\\Program Files (x86)\\',
    'C:\\ProgramData\\',
    '%USERPROFILE%\\AppData\\Local\\',
    '%USERPROFILE%\\AppData\\Roaming\\',
    'C:\\Users\\Public\\Desktop\\',
    'C:\\Users\\%USERNAME%\\Desktop\\',
    'C:\\Windows\\System32\\',
    'C:\\Windows\\SysWOW64\\'
  ];

  // 常见的残留文件扩展名
  private static readonly REMNANT_EXTENSIONS = [
    '.log', '.tmp', '.bak', '.old', '.cache',
    '.ini', '.cfg', '.conf', '.settings',
    '.lnk', '.url', '.pif'
  ];

  // 注册表残留常见位置
  private static readonly REGISTRY_REMNANT_PATHS = [
    'HKEY_LOCAL_MACHINE\\SOFTWARE\\',
    'HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\',
    'HKEY_CURRENT_USER\\SOFTWARE\\',
    'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\',
    'HKEY_CLASSES_ROOT\\',
    'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\',
    'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\\',
    'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\\'
  ];

  /**
   * 扫描软件残留
   */
  static async scanSoftwareRemnants(
    installedApps: ApplicationInfo[],
    onProgress?: (progress: { current: number; total: number; currentItem: string }) => void
  ): Promise<SoftwareRemnant[]> {
    const remnants: SoftwareRemnant[] = [];
    const totalSteps = 5;
    let currentStep = 0;

    try {
      // 1. 扫描文件系统残留
      if (onProgress) {
        onProgress({ current: ++currentStep, total: totalSteps, currentItem: '扫描文件系统残留...' });
      }
      const fileRemnants = await this.scanFileSystemRemnants(installedApps);
      remnants.push(...fileRemnants);

      // 2. 扫描注册表残留
      if (onProgress) {
        onProgress({ current: ++currentStep, total: totalSteps, currentItem: '扫描注册表残留...' });
      }
      const registryRemnants = await this.scanRegistryRemnants(installedApps);
      remnants.push(...registryRemnants);

      // 3. 扫描快捷方式残留
      if (onProgress) {
        onProgress({ current: ++currentStep, total: totalSteps, currentItem: '扫描快捷方式残留...' });
      }
      const shortcutRemnants = await this.scanShortcutRemnants(installedApps);
      remnants.push(...shortcutRemnants);

      // 4. 扫描服务残留
      if (onProgress) {
        onProgress({ current: ++currentStep, total: totalSteps, currentItem: '扫描服务残留...' });
      }
      const serviceRemnants = await this.scanServiceRemnants(installedApps);
      remnants.push(...serviceRemnants);

      // 5. 分析和评分
      if (onProgress) {
        onProgress({ current: ++currentStep, total: totalSteps, currentItem: '分析残留项...' });
      }
      const analyzedRemnants = await this.analyzeRemnants(remnants);

      return analyzedRemnants;
    } catch (error) {
      console.error('扫描软件残留失败:', error);
      return [];
    }
  }

  /**
   * 扫描文件系统残留
   */
  private static async scanFileSystemRemnants(installedApps: ApplicationInfo[]): Promise<SoftwareRemnant[]> {
    const remnants: SoftwareRemnant[] = [];
    
    // 获取已安装软件的名称列表
    const installedAppNames = new Set(installedApps.map(app => app.name.toLowerCase()));
    
    // 模拟扫描结果（实际实现中会调用Electron主进程进行文件系统扫描）
    const mockRemnants = [
      {
        id: 'remnant-1',
        type: 'folder' as const,
        path: 'C:\\Program Files\\Adobe\\Adobe Reader DC_OLD',
        name: 'Adobe Reader DC_OLD',
        relatedSoftware: 'Adobe Reader DC',
        confidence: 0.9,
        description: '旧版本Adobe Reader残留文件夹',
        riskLevel: 'safe' as const,
        canDelete: true,
        reason: '软件升级后的旧版本残留',
        size: 150 * 1024 * 1024,
        lastModified: new Date('2023-06-15')
      },
      {
        id: 'remnant-2',
        type: 'file' as const,
        path: 'C:\\Users\\User\\AppData\\Roaming\\Skype\\skype.log',
        name: 'skype.log',
        relatedSoftware: 'Skype',
        confidence: 0.8,
        description: 'Skype日志文件残留',
        riskLevel: 'safe' as const,
        canDelete: true,
        reason: '应用卸载后的日志文件',
        size: 2 * 1024 * 1024,
        lastModified: new Date('2023-05-20')
      },
      {
        id: 'remnant-3',
        type: 'folder' as const,
        path: 'C:\\ProgramData\\McAfee',
        name: 'McAfee',
        relatedSoftware: 'McAfee Antivirus',
        confidence: 0.95,
        description: 'McAfee杀毒软件残留数据',
        riskLevel: 'caution' as const,
        canDelete: true,
        reason: '杀毒软件卸载不完整',
        size: 500 * 1024 * 1024,
        lastModified: new Date('2023-04-10')
      },
      {
        id: 'remnant-4',
        type: 'file' as const,
        path: 'C:\\Users\\User\\Desktop\\WinRAR.lnk',
        name: 'WinRAR.lnk',
        relatedSoftware: 'WinRAR',
        confidence: 0.7,
        description: 'WinRAR桌面快捷方式',
        riskLevel: 'safe' as const,
        canDelete: true,
        reason: '软件卸载后遗留的快捷方式',
        size: 1024,
        lastModified: new Date('2023-03-25')
      },
      {
        id: 'remnant-5',
        type: 'folder' as const,
        path: 'C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\deleted_extension',
        name: 'deleted_extension',
        relatedSoftware: 'Chrome Extension',
        confidence: 0.85,
        description: '已删除的Chrome扩展残留',
        riskLevel: 'safe' as const,
        canDelete: true,
        reason: '浏览器扩展卸载残留',
        size: 5 * 1024 * 1024,
        lastModified: new Date('2023-07-01')
      }
    ];

    // 过滤掉仍然安装的软件相关文件
    const filteredRemnants = mockRemnants.filter(remnant => {
      const softwareName = remnant.relatedSoftware.toLowerCase();
      return !installedAppNames.has(softwareName);
    });

    remnants.push(...filteredRemnants);
    return remnants;
  }

  /**
   * 扫描注册表残留
   */
  private static async scanRegistryRemnants(installedApps: ApplicationInfo[]): Promise<SoftwareRemnant[]> {
    const remnants: SoftwareRemnant[] = [];
    
    // 模拟注册表残留扫描结果
    const mockRegistryRemnants = [
      {
        id: 'reg-remnant-1',
        type: 'registry' as const,
        path: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Adobe\\Adobe Reader DC',
        name: 'Adobe Reader DC Registry Key',
        relatedSoftware: 'Adobe Reader DC',
        confidence: 0.9,
        description: 'Adobe Reader DC注册表残留项',
        riskLevel: 'safe' as const,
        canDelete: true,
        reason: '软件卸载后的注册表残留'
      },
      {
        id: 'reg-remnant-2',
        type: 'registry' as const,
        path: 'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\\SkypeAutoStart',
        name: 'SkypeAutoStart',
        relatedSoftware: 'Skype',
        confidence: 0.85,
        description: 'Skype自启动注册表项',
        riskLevel: 'safe' as const,
        canDelete: true,
        reason: '软件卸载后的自启动项残留'
      },
      {
        id: 'reg-remnant-3',
        type: 'registry' as const,
        path: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\McAfeeService',
        name: 'McAfeeService',
        relatedSoftware: 'McAfee Antivirus',
        confidence: 0.95,
        description: 'McAfee服务注册表项',
        riskLevel: 'caution' as const,
        canDelete: true,
        reason: '杀毒软件服务残留'
      }
    ];

    remnants.push(...mockRegistryRemnants);
    return remnants;
  }

  /**
   * 扫描快捷方式残留
   */
  private static async scanShortcutRemnants(installedApps: ApplicationInfo[]): Promise<SoftwareRemnant[]> {
    const remnants: SoftwareRemnant[] = [];
    
    // 模拟快捷方式残留扫描
    const mockShortcutRemnants = [
      {
        id: 'shortcut-remnant-1',
        type: 'shortcut' as const,
        path: 'C:\\Users\\Public\\Desktop\\Uninstalled App.lnk',
        name: 'Uninstalled App.lnk',
        relatedSoftware: 'Unknown Application',
        confidence: 0.8,
        description: '指向不存在程序的快捷方式',
        riskLevel: 'safe' as const,
        canDelete: true,
        reason: '目标程序已被卸载',
        size: 2048,
        lastModified: new Date('2023-02-15')
      }
    ];

    remnants.push(...mockShortcutRemnants);
    return remnants;
  }

  /**
   * 扫描服务残留
   */
  private static async scanServiceRemnants(installedApps: ApplicationInfo[]): Promise<SoftwareRemnant[]> {
    const remnants: SoftwareRemnant[] = [];
    
    // 模拟服务残留扫描
    const mockServiceRemnants = [
      {
        id: 'service-remnant-1',
        type: 'service' as const,
        path: 'Services\\OldAntivirusService',
        name: 'OldAntivirusService',
        relatedSoftware: 'Old Antivirus',
        confidence: 0.9,
        description: '已卸载杀毒软件的服务残留',
        riskLevel: 'caution' as const,
        canDelete: true,
        reason: '服务对应的程序已被卸载'
      }
    ];

    remnants.push(...mockServiceRemnants);
    return remnants;
  }

  /**
   * 分析残留项
   */
  private static async analyzeRemnants(remnants: SoftwareRemnant[]): Promise<SoftwareRemnant[]> {
    const analyzedRemnants: SoftwareRemnant[] = [];

    for (const remnant of remnants) {
      let analyzedRemnant = { ...remnant };

      // 基础分析：根据文件大小调整置信度
      if (remnant.size && remnant.size > 100 * 1024 * 1024) { // 大于100MB
        analyzedRemnant.confidence = Math.min(analyzedRemnant.confidence + 0.1, 1.0);
      }

      // 根据最后修改时间调整置信度
      if (remnant.lastModified) {
        const daysSinceModified = (Date.now() - remnant.lastModified.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceModified > 30) { // 超过30天未修改
          analyzedRemnant.confidence = Math.min(analyzedRemnant.confidence + 0.05, 1.0);
        }
      }

      // AI分析增强
      if (AIService.isAvailable()) {
        try {
          const aiAnalysis = await AIService.analyzeSoftwareRemnant({
            path: remnant.path,
            name: remnant.name,
            type: remnant.type,
            relatedSoftware: remnant.relatedSoftware,
            size: remnant.size,
            lastModified: remnant.lastModified
          });

          if (aiAnalysis) {
            // 结合AI分析结果
            analyzedRemnant.confidence = Math.max(analyzedRemnant.confidence, aiAnalysis.confidence);
            analyzedRemnant.riskLevel = aiAnalysis.riskLevel;
            analyzedRemnant.canDelete = aiAnalysis.canDelete;
            analyzedRemnant.reason = `${analyzedRemnant.reason} (AI: ${aiAnalysis.reason})`;

            // 添加AI建议到描述中
            if (aiAnalysis.recommendations.length > 0) {
              analyzedRemnant.description += ` AI建议: ${aiAnalysis.recommendations[0]}`;
            }
          }
        } catch (error) {
          console.error(`AI分析残留项 ${remnant.name} 失败:`, error);
        }
      }

      analyzedRemnants.push(analyzedRemnant);
    }

    return analyzedRemnants;
  }

  /**
   * 获取残留统计信息
   */
  static getRemnantStats(remnants: SoftwareRemnant[]): {
    total: number;
    byType: Record<string, number>;
    byRiskLevel: Record<string, number>;
    totalSize: number;
    canDeleteCount: number;
  } {
    const stats = {
      total: remnants.length,
      byType: {} as Record<string, number>,
      byRiskLevel: {} as Record<string, number>,
      totalSize: 0,
      canDeleteCount: 0
    };

    remnants.forEach(remnant => {
      // 按类型统计
      stats.byType[remnant.type] = (stats.byType[remnant.type] || 0) + 1;
      
      // 按风险级别统计
      stats.byRiskLevel[remnant.riskLevel] = (stats.byRiskLevel[remnant.riskLevel] || 0) + 1;
      
      // 总大小
      if (remnant.size) {
        stats.totalSize += remnant.size;
      }
      
      // 可删除数量
      if (remnant.canDelete) {
        stats.canDeleteCount++;
      }
    });

    return stats;
  }

  /**
   * 按软件分组残留项
   */
  static groupRemnantsBySoftware(remnants: SoftwareRemnant[]): Record<string, SoftwareRemnant[]> {
    const grouped: Record<string, SoftwareRemnant[]> = {};
    
    remnants.forEach(remnant => {
      const software = remnant.relatedSoftware;
      if (!grouped[software]) {
        grouped[software] = [];
      }
      grouped[software].push(remnant);
    });

    return grouped;
  }

  /**
   * 过滤高置信度残留项
   */
  static getHighConfidenceRemnants(remnants: SoftwareRemnant[], threshold: number = 0.8): SoftwareRemnant[] {
    return remnants.filter(remnant => remnant.confidence >= threshold);
  }

  /**
   * 获取推荐清理的残留项
   */
  static getRecommendedForCleaning(remnants: SoftwareRemnant[]): SoftwareRemnant[] {
    return remnants.filter(remnant => 
      remnant.canDelete && 
      remnant.confidence >= 0.7 && 
      remnant.riskLevel !== 'dangerous'
    );
  }

  /**
   * 格式化文件大小
   */
  static formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
