// 文件操作服务 - 与Electron主进程通信

export interface ScanOptions {
  paths: string[];
  extensions: string[];
  maxDepth: number;
}

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  type: 'file' | 'directory';
  lastModified: Date;
}

export interface ScanResult {
  files: FileInfo[];
  totalSize: number;
}

export interface ScanResponse {
  success: boolean;
  data?: ScanResult;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  deletedFiles: string[];
  failedFiles: { path: string; error: string }[];
  totalSize: number;
}

export interface DeleteResponse {
  success: boolean;
  data?: DeleteResult;
  error?: string;
}

export interface TempDirsResponse {
  success: boolean;
  data?: string[];
  error?: string;
}

export interface FileExistsResponse {
  success: boolean;
  data?: boolean;
  error?: string;
}

export interface FileInfoResponse {
  success: boolean;
  data?: FileInfo;
  error?: string;
}

/**
 * 文件服务类 - 处理与Electron主进程的文件操作通信
 */
export class FileService {
  /**
   * 检查Electron API是否可用
   */
  private static isElectronAvailable(): boolean {
    return typeof window !== 'undefined' && window.electronAPI;
  }

  /**
   * 扫描垃圾文件
   */
  static async scanJunkFiles(options: ScanOptions): Promise<ScanResult> {
    if (!this.isElectronAvailable()) {
      throw new Error('Electron API 不可用');
    }

    const response = await window.electronAPI.scanJunkFiles(options);
    
    if (!response.success) {
      throw new Error(response.error || '扫描失败');
    }

    return response.data!;
  }

  /**
   * 删除文件到回收站
   */
  static async deleteFiles(filePaths: string[]): Promise<DeleteResult> {
    if (!this.isElectronAvailable()) {
      throw new Error('Electron API 不可用');
    }

    const response = await window.electronAPI.deleteFiles(filePaths);
    
    if (!response.success) {
      throw new Error(response.error || '删除失败');
    }

    return response.data!;
  }

  /**
   * 获取系统临时目录
   */
  static async getTempDirectories(): Promise<string[]> {
    if (!this.isElectronAvailable()) {
      throw new Error('Electron API 不可用');
    }

    const response = await window.electronAPI.getTempDirs();
    
    if (!response.success) {
      throw new Error(response.error || '获取临时目录失败');
    }

    return response.data!;
  }

  /**
   * 检查文件是否存在
   */
  static async fileExists(filePath: string): Promise<boolean> {
    if (!this.isElectronAvailable()) {
      throw new Error('Electron API 不可用');
    }

    const response = await window.electronAPI.fileExists(filePath);
    
    if (!response.success) {
      throw new Error(response.error || '检查文件失败');
    }

    return response.data!;
  }

  /**
   * 获取文件信息
   */
  static async getFileInfo(filePath: string): Promise<FileInfo> {
    if (!this.isElectronAvailable()) {
      throw new Error('Electron API 不可用');
    }

    const response = await window.electronAPI.getFileInfo(filePath);
    
    if (!response.success) {
      throw new Error(response.error || '获取文件信息失败');
    }

    return response.data!;
  }

  /**
   * 获取默认扫描路径
   */
  static getDefaultScanPaths(): string[] {
    const paths: string[] = [];
    
    if (typeof window !== 'undefined' && navigator.platform.includes('Win')) {
      // Windows 默认扫描路径
      const userProfile = 'C:\\Users\\' + (process.env.USERNAME || 'User');
      
      paths.push(
        // 系统临时目录
        'C:\\Windows\\Temp',
        userProfile + '\\AppData\\Local\\Temp',
        
        // 浏览器缓存
        userProfile + '\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache',
        userProfile + '\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache',
        userProfile + '\\AppData\\Local\\Mozilla\\Firefox\\Profiles',
        
        // 系统缓存
        'C:\\Windows\\SoftwareDistribution\\Download',
        userProfile + '\\AppData\\Local\\Microsoft\\Windows\\INetCache',
        
        // 回收站
        'C:\\$Recycle.Bin'
      );
    }
    
    return paths;
  }

  /**
   * 获取默认扫描文件扩展名
   */
  static getDefaultExtensions(): string[] {
    return [
      '.tmp',
      '.temp',
      '.log',
      '.bak',
      '.old',
      '.cache',
      '.dmp',
      '.chk',
      '.gid'
    ];
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 批量删除文件（带进度回调）
   */
  static async deleteFilesWithProgress(
    filePaths: string[],
    onProgress?: (current: number, total: number, currentFile: string) => void
  ): Promise<DeleteResult> {
    const batchSize = 10; // 每批处理10个文件
    const results: DeleteResult = {
      success: true,
      deletedFiles: [],
      failedFiles: [],
      totalSize: 0
    };

    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      
      // 调用进度回调
      if (onProgress) {
        const currentFile = batch[0] ? batch[0].split('\\').pop() || batch[0] : '';
        onProgress(i + 1, filePaths.length, currentFile);
      }

      try {
        const batchResult = await this.deleteFiles(batch);
        
        // 合并结果
        results.deletedFiles.push(...batchResult.deletedFiles);
        results.failedFiles.push(...batchResult.failedFiles);
        results.totalSize += batchResult.totalSize;
        
        // 添加小延迟，避免系统过载
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        // 如果整批失败，将所有文件标记为失败
        batch.forEach(filePath => {
          results.failedFiles.push({
            path: filePath,
            error: error instanceof Error ? error.message : '删除失败'
          });
        });
      }
    }

    results.success = results.deletedFiles.length > 0;
    return results;
  }
}
