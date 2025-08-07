import { FileService } from '../services/fileService';
import { ScanItem } from '../types';

export interface CleaningProgress {
  current: number;
  total: number;
  currentFileName: string;
  estimatedTimeLeft: number;
  totalSize: number;
  cleanedSize: number;
}

export interface CleaningResult {
  success: boolean;
  deletedFiles: string[];
  failedFiles: { path: string; error: string }[];
  totalSize: number;
  skippedFiles: string[];
}

/**
 * 真实文件清理器 - 使用Electron API真正删除文件到回收站
 */
export class RealCleaner {
  /**
   * 清理选中的文件
   */
  static async cleanFiles(
    items: ScanItem[],
    onProgress?: (progress: CleaningProgress) => void,
    onCurrentItem?: (item: ScanItem | null) => void
  ): Promise<CleaningResult> {
    const result: CleaningResult = {
      success: false,
      deletedFiles: [],
      failedFiles: [],
      totalSize: 0,
      skippedFiles: []
    };

    if (items.length === 0) {
      return result;
    }

    const totalSize = items.reduce((sum, item) => sum + item.sizeBytes, 0);
    let cleanedSize = 0;

    // 初始化进度
    if (onProgress) {
      onProgress({
        current: 0,
        total: items.length,
        currentFileName: '准备清理...',
        estimatedTimeLeft: Math.ceil(items.length * 0.5), // 估算每个文件0.5秒
        totalSize,
        cleanedSize: 0
      });
    }

    // 过滤出可以安全删除的文件
    const safeItems = items.filter(item => this.isSafeToClean(item));
    const skippedItems = items.filter(item => !this.isSafeToClean(item));

    // 记录跳过的文件
    result.skippedFiles = skippedItems.map(item => item.path);

    try {
      // 检查是否在Electron环境中
      if (!this.isElectronEnvironment()) {
        throw new Error('不在Electron环境中，无法执行真实清理');
      }

      // 分批处理文件，避免一次性处理太多文件
      const batchSize = 5;
      const batches = this.createBatches(safeItems, batchSize);

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const filePaths = batch.map(item => item.path);

        try {
          // 更新当前处理的文件
          if (onCurrentItem && batch.length > 0) {
            onCurrentItem(batch[0]);
          }

          // 删除当前批次的文件
          const deleteResult = await FileService.deleteFiles(filePaths);

          // 更新结果
          result.deletedFiles.push(...deleteResult.deletedFiles);
          result.failedFiles.push(...deleteResult.failedFiles);
          
          // 计算已清理的大小
          const batchCleanedSize = batch
            .filter(item => deleteResult.deletedFiles.includes(item.path))
            .reduce((sum, item) => sum + item.sizeBytes, 0);
          
          cleanedSize += batchCleanedSize;
          result.totalSize += batchCleanedSize;

          // 更新进度
          if (onProgress) {
            const currentIndex = (batchIndex + 1) * batchSize;
            const remainingItems = Math.max(0, safeItems.length - currentIndex);
            const estimatedTimeLeft = Math.ceil(remainingItems * 0.5);

            onProgress({
              current: Math.min(currentIndex, safeItems.length),
              total: safeItems.length,
              currentFileName: batch[0]?.name || '',
              estimatedTimeLeft,
              totalSize,
              cleanedSize
            });
          }

          // 添加小延迟，避免系统过载
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          console.error(`批次 ${batchIndex + 1} 清理失败:`, error);
          
          // 将整个批次标记为失败
          batch.forEach(item => {
            result.failedFiles.push({
              path: item.path,
              error: error instanceof Error ? error.message : '删除失败'
            });
          });
        }
      }

      result.success = result.deletedFiles.length > 0;

    } catch (error) {
      console.error('清理过程失败:', error);
      
      // 如果是环境问题，将所有文件标记为跳过
      if (error instanceof Error && error.message.includes('Electron环境')) {
        result.skippedFiles.push(...safeItems.map(item => item.path));
      } else {
        // 其他错误，标记为失败
        safeItems.forEach(item => {
          result.failedFiles.push({
            path: item.path,
            error: error instanceof Error ? error.message : '清理失败'
          });
        });
      }
    }

    // 清除当前项目显示
    if (onCurrentItem) {
      onCurrentItem(null);
    }

    // 最终进度更新
    if (onProgress) {
      onProgress({
        current: safeItems.length,
        total: safeItems.length,
        currentFileName: '清理完成',
        estimatedTimeLeft: 0,
        totalSize,
        cleanedSize
      });
    }

    return result;
  }

  /**
   * 检查文件是否可以安全清理
   */
  private static isSafeToClean(item: ScanItem): boolean {
    // 高风险文件不清理
    if (item.riskLevel === 'high') {
      return false;
    }

    // 受时间保护的文件不清理
    if (item.suggestion.includes('受时间保护')) {
      return false;
    }

    // 系统关键路径不清理
    const lowerPath = item.path.toLowerCase();
    const criticalPaths = [
      'c:\\windows\\system32',
      'c:\\windows\\syswow64',
      'c:\\program files',
      'c:\\program files (x86)',
      'c:\\boot',
      'c:\\recovery'
    ];

    if (criticalPaths.some(criticalPath => lowerPath.startsWith(criticalPath))) {
      return false;
    }

    return true;
  }

  /**
   * 检查是否在Electron环境中
   */
  private static isElectronEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           window.electronAPI && 
           typeof window.electronAPI.deleteFiles === 'function';
  }

  /**
   * 将数组分批
   */
  private static createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * 预检查文件是否存在
   */
  static async preCheckFiles(items: ScanItem[]): Promise<{
    existingFiles: ScanItem[];
    missingFiles: ScanItem[];
  }> {
    const existingFiles: ScanItem[] = [];
    const missingFiles: ScanItem[] = [];

    if (!this.isElectronEnvironment()) {
      // 如果不在Electron环境中，假设所有文件都存在
      return { existingFiles: items, missingFiles: [] };
    }

    for (const item of items) {
      try {
        const exists = await FileService.fileExists(item.path);
        if (exists) {
          existingFiles.push(item);
        } else {
          missingFiles.push(item);
        }
      } catch (error) {
        console.warn(`检查文件失败: ${item.path}`, error);
        // 检查失败时，假设文件存在
        existingFiles.push(item);
      }
    }

    return { existingFiles, missingFiles };
  }

  /**
   * 获取清理统计信息
   */
  static getCleaningStats(result: CleaningResult): {
    successCount: number;
    failedCount: number;
    skippedCount: number;
    totalProcessed: number;
    successRate: number;
  } {
    const successCount = result.deletedFiles.length;
    const failedCount = result.failedFiles.length;
    const skippedCount = result.skippedFiles.length;
    const totalProcessed = successCount + failedCount + skippedCount;
    const successRate = totalProcessed > 0 ? (successCount / totalProcessed) * 100 : 0;

    return {
      successCount,
      failedCount,
      skippedCount,
      totalProcessed,
      successRate: Math.round(successRate * 100) / 100
    };
  }

  /**
   * 格式化清理结果为可读文本
   */
  static formatCleaningResult(result: CleaningResult): string {
    const stats = this.getCleaningStats(result);
    const sizeFormatted = FileService.formatFileSize(result.totalSize);

    let report = `清理完成！\n\n`;
    report += `📊 统计信息:\n`;
    report += `• 成功删除: ${stats.successCount} 个文件\n`;
    report += `• 删除失败: ${stats.failedCount} 个文件\n`;
    report += `• 跳过文件: ${stats.skippedCount} 个文件\n`;
    report += `• 释放空间: ${sizeFormatted}\n`;
    report += `• 成功率: ${stats.successRate}%\n\n`;

    if (result.failedFiles.length > 0) {
      report += `❌ 删除失败的文件:\n`;
      result.failedFiles.forEach(file => {
        report += `• ${file.path} (${file.error})\n`;
      });
      report += `\n`;
    }

    if (result.skippedFiles.length > 0) {
      report += `⏭️ 跳过的文件:\n`;
      result.skippedFiles.forEach(filePath => {
        report += `• ${filePath}\n`;
      });
    }

    return report;
  }
}
