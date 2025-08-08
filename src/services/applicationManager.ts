import { ApplicationInfo, AIAppAnalysisResult } from '../types';
import { AIService } from './aiService';

/**
 * 应用程序管理器 - 扫描、分析和管理已安装的应用程序
 */
export class ApplicationManager {
  private static installedApps: ApplicationInfo[] = [];
  private static isScanning = false;

  /**
   * 扫描已安装的应用程序
   */
  static async scanInstalledApplications(): Promise<ApplicationInfo[]> {
    if (this.isScanning) {
      return this.installedApps;
    }

    this.isScanning = true;
    
    try {
      // 检查是否在Electron环境中
      if (this.isElectronEnvironment()) {
        this.installedApps = await this.scanWithElectron();
      } else {
        // 浏览器环境下使用模拟数据
        this.installedApps = this.getMockApplications();
      }

      // 使用AI分析应用程序
      await this.analyzeApplicationsWithAI();

      return this.installedApps;
    } catch (error) {
      console.error('扫描应用程序失败:', error);
      return this.getMockApplications();
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * 使用Electron API扫描应用程序
   */
  private static async scanWithElectron(): Promise<ApplicationInfo[]> {
    // 这里需要在Electron主进程中实现应用程序扫描功能
    // 暂时返回模拟数据
    return this.getMockApplications();
  }

  /**
   * 获取模拟应用程序数据
   */
  private static getMockApplications(): ApplicationInfo[] {
    return [
      {
        name: 'Google Chrome',
        version: '120.0.6099.109',
        publisher: 'Google LLC',
        installPath: 'C:\\Program Files\\Google\\Chrome\\Application',
        installDate: new Date('2023-01-15'),
        size: 250 * 1024 * 1024, // 250MB
        uninstallString: 'C:\\Program Files\\Google\\Chrome\\Application\\120.0.6099.109\\Installer\\setup.exe --uninstall --chrome',
        isSystemApp: false,
        category: 'Browser'
      },
      {
        name: 'Microsoft Edge',
        version: '120.0.2210.91',
        publisher: 'Microsoft Corporation',
        installPath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application',
        installDate: new Date('2023-02-01'),
        size: 180 * 1024 * 1024, // 180MB
        isSystemApp: true,
        category: 'Browser'
      },
      {
        name: 'Adobe Acrobat Reader DC',
        version: '23.008.20470',
        publisher: 'Adobe Inc.',
        installPath: 'C:\\Program Files\\Adobe\\Acrobat DC\\Acrobat',
        installDate: new Date('2023-03-10'),
        size: 450 * 1024 * 1024, // 450MB
        uninstallString: 'C:\\Program Files\\Adobe\\Acrobat DC\\Setup Files\\{AC76BA86-7AD7-1033-7B44-AC0F074E4100}\\setup.exe',
        isSystemApp: false,
        category: 'Productivity'
      },
      {
        name: 'WinRAR',
        version: '6.24',
        publisher: 'win.rar GmbH',
        installPath: 'C:\\Program Files\\WinRAR',
        installDate: new Date('2023-04-05'),
        size: 15 * 1024 * 1024, // 15MB
        uninstallString: 'C:\\Program Files\\WinRAR\\uninstall.exe',
        isSystemApp: false,
        category: 'Utility'
      },
      {
        name: 'Steam',
        version: '3.0',
        publisher: 'Valve Corporation',
        installPath: 'C:\\Program Files (x86)\\Steam',
        installDate: new Date('2023-05-20'),
        size: 2.5 * 1024 * 1024 * 1024, // 2.5GB
        uninstallString: 'C:\\Program Files (x86)\\Steam\\uninstall.exe',
        isSystemApp: false,
        category: 'Gaming'
      },
      {
        name: 'Microsoft Visual C++ 2019 Redistributable',
        version: '14.29.30139',
        publisher: 'Microsoft Corporation',
        installPath: 'C:\\Program Files\\Microsoft Visual Studio\\2019\\BuildTools\\VC\\Redist',
        installDate: new Date('2023-01-01'),
        size: 25 * 1024 * 1024, // 25MB
        isSystemApp: true,
        category: 'Runtime'
      },
      {
        name: 'Notepad++',
        version: '8.5.8',
        publisher: 'Notepad++ Team',
        installPath: 'C:\\Program Files\\Notepad++',
        installDate: new Date('2023-06-15'),
        size: 20 * 1024 * 1024, // 20MB
        uninstallString: 'C:\\Program Files\\Notepad++\\uninstall.exe',
        isSystemApp: false,
        category: 'Development'
      },
      {
        name: 'VLC Media Player',
        version: '3.0.18',
        publisher: 'VideoLAN',
        installPath: 'C:\\Program Files\\VideoLAN\\VLC',
        installDate: new Date('2023-07-01'),
        size: 120 * 1024 * 1024, // 120MB
        uninstallString: 'C:\\Program Files\\VideoLAN\\VLC\\uninstall.exe',
        isSystemApp: false,
        category: 'Media'
      },
      {
        name: 'Windows Security',
        version: '4.18.23110.3',
        publisher: 'Microsoft Corporation',
        installPath: 'C:\\Program Files\\Windows Defender',
        installDate: new Date('2023-01-01'),
        size: 100 * 1024 * 1024, // 100MB
        isSystemApp: true,
        category: 'Security'
      },
      {
        name: 'CCleaner',
        version: '6.18.10672',
        publisher: 'Piriform Ltd',
        installPath: 'C:\\Program Files\\CCleaner',
        installDate: new Date('2023-08-10'),
        size: 35 * 1024 * 1024, // 35MB
        uninstallString: 'C:\\Program Files\\CCleaner\\uninst.exe',
        isSystemApp: false,
        category: 'Utility'
      }
    ];
  }

  /**
   * 使用AI分析应用程序
   */
  private static async analyzeApplicationsWithAI(): Promise<void> {
    if (!AIService.isAvailable()) {
      return;
    }

    const analysisPromises = this.installedApps.map(async (app) => {
      try {
        const aiAnalysis = await AIService.analyzeApplication(app);
        if (aiAnalysis) {
          app.aiAnalysis = aiAnalysis;
        }
      } catch (error) {
        console.error(`分析应用 ${app.name} 失败:`, error);
      }
    });

    await Promise.all(analysisPromises);
  }

  /**
   * 获取应用程序统计信息
   */
  static getApplicationStats(): {
    total: number;
    systemApps: number;
    userApps: number;
    totalSize: number;
    categories: Record<string, number>;
  } {
    const stats = {
      total: this.installedApps.length,
      systemApps: 0,
      userApps: 0,
      totalSize: 0,
      categories: {} as Record<string, number>
    };

    this.installedApps.forEach(app => {
      if (app.isSystemApp) {
        stats.systemApps++;
      } else {
        stats.userApps++;
      }
      
      stats.totalSize += app.size;
      
      stats.categories[app.category] = (stats.categories[app.category] || 0) + 1;
    });

    return stats;
  }

  /**
   * 根据条件筛选应用程序
   */
  static filterApplications(criteria: {
    category?: string;
    safeToUninstall?: boolean;
    importance?: 'critical' | 'high' | 'medium' | 'low';
    systemApp?: boolean;
    minSize?: number;
    maxSize?: number;
  }): ApplicationInfo[] {
    return this.installedApps.filter(app => {
      if (criteria.category && app.category !== criteria.category) {
        return false;
      }
      
      if (criteria.systemApp !== undefined && app.isSystemApp !== criteria.systemApp) {
        return false;
      }
      
      if (criteria.minSize !== undefined && app.size < criteria.minSize) {
        return false;
      }
      
      if (criteria.maxSize !== undefined && app.size > criteria.maxSize) {
        return false;
      }
      
      if (app.aiAnalysis) {
        if (criteria.safeToUninstall !== undefined && 
            app.aiAnalysis.safeToUninstall !== criteria.safeToUninstall) {
          return false;
        }
        
        if (criteria.importance && app.aiAnalysis.importance !== criteria.importance) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * 获取推荐卸载的应用程序
   */
  static getRecommendedForUninstall(): ApplicationInfo[] {
    return this.installedApps.filter(app => {
      // 非系统应用
      if (app.isSystemApp) {
        return false;
      }
      
      // 有AI分析结果且安全卸载
      if (app.aiAnalysis) {
        return app.aiAnalysis.safeToUninstall && 
               app.aiAnalysis.importance === 'low' &&
               app.aiAnalysis.usageFrequency === 'rarely';
      }
      
      // 没有AI分析的情况下，根据类别和大小判断
      const lowPriorityCategories = ['Gaming', 'Media', 'Utility'];
      return lowPriorityCategories.includes(app.category) && app.size > 100 * 1024 * 1024; // 大于100MB
    });
  }

  /**
   * 获取高风险应用程序
   */
  static getHighRiskApplications(): ApplicationInfo[] {
    return this.installedApps.filter(app => {
      if (app.aiAnalysis) {
        return app.aiAnalysis.importance === 'critical' || 
               app.aiAnalysis.systemImpact === 'critical' ||
               !app.aiAnalysis.safeToUninstall;
      }
      
      // 没有AI分析的系统应用被认为是高风险
      return app.isSystemApp;
    });
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

  /**
   * 检查是否在Electron环境中
   */
  private static isElectronEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           window.electronAPI && 
           typeof window.electronAPI.scanJunkFiles === 'function';
  }

  /**
   * 获取已安装应用程序列表
   */
  static getInstalledApplications(): ApplicationInfo[] {
    return [...this.installedApps];
  }

  /**
   * 刷新应用程序列表
   */
  static async refreshApplications(): Promise<ApplicationInfo[]> {
    this.installedApps = [];
    return await this.scanInstalledApplications();
  }
}
