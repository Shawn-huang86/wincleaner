import { ScanItem } from '../types';

export interface SystemLogItem {
  id: string;
  name: string;
  path: string;
  type: 'event-log' | 'error-report' | 'crash-dump' | 'install-log' | 'update-log';
  size: number;
  lastModified: Date;
  description: string;
  riskLevel: 'safe' | 'caution' | 'high';
  canDelete: boolean;
}

export interface LogCleaningStats {
  totalLogs: number;
  totalSize: number;
  eventLogs: number;
  errorReports: number;
  crashDumps: number;
  installLogs: number;
  updateLogs: number;
}

/**
 * 系统日志清理器 - 清理 Windows 系统日志和相关文件
 */
export class SystemLogCleaner {
  private static readonly LOG_PATHS = {
    // Windows 事件日志
    eventLogs: [
      'C:\\Windows\\System32\\winevt\\Logs',
      'C:\\Windows\\System32\\LogFiles'
    ],
    
    // 错误报告
    errorReports: [
      'C:\\ProgramData\\Microsoft\\Windows\\WER\\ReportQueue',
      'C:\\ProgramData\\Microsoft\\Windows\\WER\\ReportArchive',
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\Windows\\WER\\ReportQueue',
      'C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\Windows\\WER\\ReportArchive'
    ],
    
    // 崩溃转储文件
    crashDumps: [
      'C:\\Windows\\Minidump',
      'C:\\Windows\\MEMORY.DMP',
      'C:\\Users\\%USERNAME%\\AppData\\Local\\CrashDumps'
    ],
    
    // 安装日志
    installLogs: [
      'C:\\Windows\\Logs\\CBS',
      'C:\\Windows\\Logs\\DISM',
      'C:\\Windows\\Logs\\MoSetup',
      'C:\\Windows\\Panther'
    ],
    
    // 更新日志
    updateLogs: [
      'C:\\Windows\\Logs\\WindowsUpdate',
      'C:\\Windows\\SoftwareDistribution\\ReportingEvents.log',
      'C:\\Windows\\WindowsUpdate.log'
    ]
  };

  /**
   * 扫描系统日志文件
   */
  static async scanSystemLogs(
    onProgress?: (progress: number) => void
  ): Promise<SystemLogItem[]> {
    const logs: SystemLogItem[] = [];
    
    try {
      if (this.isElectronEnvironment()) {
        // 在 Electron 环境中使用真实扫描
        return await this.scanWithElectron(onProgress);
      } else {
        // 浏览器环境使用模拟数据
        return this.getMockSystemLogs();
      }
    } catch (error) {
      console.error('扫描系统日志失败:', error);
      return this.getMockSystemLogs();
    }
  }

  /**
   * 使用 Electron API 扫描系统日志
   */
  private static async scanWithElectron(
    onProgress?: (progress: number) => void
  ): Promise<SystemLogItem[]> {
    const logs: SystemLogItem[] = [];
    const allPaths = Object.values(this.LOG_PATHS).flat();
    let processedPaths = 0;

    for (const pathPattern of allPaths) {
      try {
        // 展开环境变量
        const expandedPath = pathPattern.replace('%USERNAME%', process.env.USERNAME || 'User');
        
        // 调用 Electron API 扫描路径
        const files = await window.electronAPI.scanDirectory(expandedPath, {
          recursive: true,
          extensions: ['.log', '.dmp', '.evtx', '.etl', '.txt'],
          maxDepth: 3
        });

        for (const file of files) {
          const logItem = this.createLogItem(file, pathPattern);
          if (logItem) {
            logs.push(logItem);
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

    return logs;
  }

  /**
   * 创建日志项
   */
  private static createLogItem(file: any, pathPattern: string): SystemLogItem | null {
    try {
      const logType = this.getLogType(pathPattern, file.path);
      const riskLevel = this.getRiskLevel(logType, file.path);
      
      return {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        path: file.path,
        type: logType,
        size: file.size,
        lastModified: new Date(file.lastModified),
        description: this.getLogDescription(logType, file.name),
        riskLevel,
        canDelete: riskLevel !== 'high'
      };
    } catch (error) {
      console.warn('创建日志项失败:', error);
      return null;
    }
  }

  /**
   * 获取日志类型
   */
  private static getLogType(pathPattern: string, filePath: string): SystemLogItem['type'] {
    const lowerPath = filePath.toLowerCase();
    
    if (pathPattern.includes('winevt') || pathPattern.includes('LogFiles') || lowerPath.includes('.evtx')) {
      return 'event-log';
    }
    if (pathPattern.includes('WER') || lowerPath.includes('wer')) {
      return 'error-report';
    }
    if (pathPattern.includes('Minidump') || pathPattern.includes('CrashDumps') || lowerPath.includes('.dmp')) {
      return 'crash-dump';
    }
    if (pathPattern.includes('CBS') || pathPattern.includes('DISM') || pathPattern.includes('MoSetup') || pathPattern.includes('Panther')) {
      return 'install-log';
    }
    if (pathPattern.includes('WindowsUpdate') || lowerPath.includes('windowsupdate')) {
      return 'update-log';
    }
    
    return 'event-log'; // 默认类型
  }

  /**
   * 获取风险级别
   */
  private static getRiskLevel(type: SystemLogItem['type'], filePath: string): SystemLogItem['riskLevel'] {
    const lowerPath = filePath.toLowerCase();
    
    // 当前正在使用的日志文件 - 高风险
    if (lowerPath.includes('current') || lowerPath.endsWith('.log')) {
      return 'high';
    }
    
    // 系统关键日志 - 谨慎
    if (type === 'install-log' || lowerPath.includes('system') || lowerPath.includes('security')) {
      return 'caution';
    }
    
    // 其他日志文件 - 安全
    return 'safe';
  }

  /**
   * 获取日志描述
   */
  private static getLogDescription(type: SystemLogItem['type'], fileName: string): string {
    const descriptions = {
      'event-log': '系统事件日志文件，记录系统运行状态',
      'error-report': 'Windows 错误报告文件，用于诊断系统问题',
      'crash-dump': '程序崩溃转储文件，用于调试分析',
      'install-log': '软件安装/卸载日志文件',
      'update-log': 'Windows 更新日志文件'
    };
    
    return descriptions[type] || '系统日志文件';
  }

  /**
   * 获取模拟系统日志数据
   */
  private static getMockSystemLogs(): SystemLogItem[] {
    const mockLogs: SystemLogItem[] = [
      {
        id: 'log-1',
        name: 'Application.evtx',
        path: 'C:\\Windows\\System32\\winevt\\Logs\\Application.evtx',
        type: 'event-log',
        size: 20 * 1024 * 1024, // 20MB
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
        description: '应用程序事件日志',
        riskLevel: 'caution',
        canDelete: true
      },
      {
        id: 'log-2',
        name: 'System.evtx',
        path: 'C:\\Windows\\System32\\winevt\\Logs\\System.evtx',
        type: 'event-log',
        size: 15 * 1024 * 1024, // 15MB
        lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
        description: '系统事件日志',
        riskLevel: 'caution',
        canDelete: true
      },
      {
        id: 'log-3',
        name: 'Report.wer',
        path: 'C:\\ProgramData\\Microsoft\\Windows\\WER\\ReportQueue\\Report.wer',
        type: 'error-report',
        size: 2 * 1024 * 1024, // 2MB
        lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
        description: 'Windows 错误报告',
        riskLevel: 'safe',
        canDelete: true
      },
      {
        id: 'log-4',
        name: 'chrome.dmp',
        path: 'C:\\Users\\User\\AppData\\Local\\CrashDumps\\chrome.dmp',
        type: 'crash-dump',
        size: 50 * 1024 * 1024, // 50MB
        lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10天前
        description: 'Chrome 浏览器崩溃转储文件',
        riskLevel: 'safe',
        canDelete: true
      },
      {
        id: 'log-5',
        name: 'CBS.log',
        path: 'C:\\Windows\\Logs\\CBS\\CBS.log',
        type: 'install-log',
        size: 8 * 1024 * 1024, // 8MB
        lastModified: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15天前
        description: '组件安装日志',
        riskLevel: 'caution',
        canDelete: true
      },
      {
        id: 'log-6',
        name: 'WindowsUpdate.log',
        path: 'C:\\Windows\\Logs\\WindowsUpdate\\WindowsUpdate.log',
        type: 'update-log',
        size: 12 * 1024 * 1024, // 12MB
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
        description: 'Windows 更新日志',
        riskLevel: 'safe',
        canDelete: true
      }
    ];

    return mockLogs;
  }

  /**
   * 获取日志清理统计信息
   */
  static getCleaningStats(logs: SystemLogItem[]): LogCleaningStats {
    return {
      totalLogs: logs.length,
      totalSize: logs.reduce((sum, log) => sum + log.size, 0),
      eventLogs: logs.filter(log => log.type === 'event-log').length,
      errorReports: logs.filter(log => log.type === 'error-report').length,
      crashDumps: logs.filter(log => log.type === 'crash-dump').length,
      installLogs: logs.filter(log => log.type === 'install-log').length,
      updateLogs: logs.filter(log => log.type === 'update-log').length
    };
  }

  /**
   * 清理选中的日志文件
   */
  static async cleanLogs(
    logs: SystemLogItem[],
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; deletedCount: number; failedCount: number; errors: string[] }> {
    const result = {
      success: false,
      deletedCount: 0,
      failedCount: 0,
      errors: [] as string[]
    };

    if (logs.length === 0) {
      result.success = true;
      return result;
    }

    try {
      if (this.isElectronEnvironment()) {
        // 使用 Electron API 删除文件
        const filePaths = logs.filter(log => log.canDelete).map(log => log.path);
        const deleteResult = await window.electronAPI.deleteFiles(filePaths);
        
        result.deletedCount = deleteResult.deletedFiles.length;
        result.failedCount = deleteResult.failedFiles.length;
        result.errors = deleteResult.failedFiles.map(f => f.error);
        result.success = deleteResult.success;
      } else {
        // 浏览器环境模拟删除
        result.deletedCount = logs.filter(log => log.canDelete).length;
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
