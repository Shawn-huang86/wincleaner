import { ipcMain, shell } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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
  error?: string;
}

export interface CleanResult {
  success: boolean;
  deletedFiles: string[];
  failedFiles: { path: string; error: string }[];
  totalSize: number;
}

/**
 * 注册文件操作相关的IPC处理器
 */
export const registerFileHandlers = () => {
  // 扫描垃圾文件
  ipcMain.handle('scan-junk-files', async (event, options: {
    paths: string[];
    extensions: string[];
    maxDepth: number;
  }) => {
    try {
      const result = await scanJunkFiles(options.paths, options.extensions, options.maxDepth);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '扫描失败' 
      };
    }
  });

  // 删除文件到回收站
  ipcMain.handle('delete-files', async (event, filePaths: string[]) => {
    try {
      const result = await deleteFilesToTrash(filePaths);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '删除失败' 
      };
    }
  });

  // 获取系统临时目录
  ipcMain.handle('get-temp-dirs', async () => {
    try {
      const tempDirs = getTempDirectories();
      return { success: true, data: tempDirs };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取临时目录失败' 
      };
    }
  });

  // 检查文件是否存在
  ipcMain.handle('file-exists', async (event, filePath: string) => {
    try {
      return { success: true, data: fs.existsSync(filePath) };
    } catch (error) {
      return { success: false, error: '检查文件失败' };
    }
  });

  // 获取文件信息
  ipcMain.handle('get-file-info', async (event, filePath: string) => {
    try {
      const info = await getFileInfo(filePath);
      return { success: true, data: info };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取文件信息失败' 
      };
    }
  });
};

/**
 * 扫描垃圾文件
 */
const scanJunkFiles = async (
  scanPaths: string[],
  extensions: string[],
  maxDepth: number = 3
): Promise<ScanResult> => {
  const allFiles: FileInfo[] = [];
  let totalSize = 0;

  for (const scanPath of scanPaths) {
    if (fs.existsSync(scanPath)) {
      const files = await scanDirectory(scanPath, extensions, maxDepth, 0);
      allFiles.push(...files);
    }
  }

  totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);

  return {
    files: allFiles,
    totalSize
  };
};

/**
 * 递归扫描目录
 */
const scanDirectory = async (
  dirPath: string,
  extensions: string[],
  maxDepth: number,
  currentDepth: number
): Promise<FileInfo[]> => {
  const files: FileInfo[] = [];

  if (currentDepth >= maxDepth) {
    return files;
  }

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      try {
        if (entry.isDirectory()) {
          // 跳过系统关键目录
          if (isSystemCriticalDirectory(fullPath)) {
            continue;
          }

          // 递归扫描子目录
          const subFiles = await scanDirectory(fullPath, extensions, maxDepth, currentDepth + 1);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          
          // 检查文件扩展名或特殊文件名
          if (extensions.includes(ext) || isJunkFile(entry.name, fullPath)) {
            const stats = fs.statSync(fullPath);
            files.push({
              path: fullPath,
              name: entry.name,
              size: stats.size,
              type: 'file',
              lastModified: stats.mtime
            });
          }
        }
      } catch (error) {
        // 忽略权限错误等，继续处理其他文件
        console.warn(`无法访问文件: ${fullPath}`, error);
      }
    }
  } catch (error) {
    console.warn(`无法扫描目录: ${dirPath}`, error);
  }

  return files;
};

/**
 * 删除文件到回收站
 */
const deleteFilesToTrash = async (filePaths: string[]): Promise<CleanResult> => {
  const deletedFiles: string[] = [];
  const failedFiles: { path: string; error: string }[] = [];
  let totalSize = 0;

  for (const filePath of filePaths) {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        failedFiles.push({ path: filePath, error: '文件不存在' });
        continue;
      }

      // 安全检查
      if (!isSafeToDelete(filePath)) {
        failedFiles.push({ path: filePath, error: '文件位于系统关键目录，不允许删除' });
        continue;
      }

      // 获取文件大小
      const stats = fs.statSync(filePath);
      const fileSize = stats.isDirectory() ? await getDirectorySize(filePath) : stats.size;

      // 移动到回收站
      await shell.trashItem(filePath);
      
      deletedFiles.push(filePath);
      totalSize += fileSize;
    } catch (error) {
      failedFiles.push({ 
        path: filePath, 
        error: error instanceof Error ? error.message : '删除失败' 
      });
    }
  }

  return {
    success: deletedFiles.length > 0,
    deletedFiles,
    failedFiles,
    totalSize
  };
};

/**
 * 获取系统临时目录列表
 */
const getTempDirectories = (): string[] => {
  const tempDirs: string[] = [];
  
  // 系统临时目录
  tempDirs.push(os.tmpdir());
  
  // Windows 特定的临时目录
  if (process.platform === 'win32') {
    const userProfile = os.homedir();
    
    tempDirs.push(
      path.join(userProfile, 'AppData', 'Local', 'Temp'),
      'C:\\Windows\\Temp',
      'C:\\Windows\\SoftwareDistribution\\Download',
      path.join(userProfile, 'AppData', 'Local', 'Microsoft', 'Windows', 'INetCache'),
      path.join(userProfile, 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'Cache'),
      path.join(userProfile, 'AppData', 'Local', 'Microsoft', 'Edge', 'User Data', 'Default', 'Cache')
    );
  }
  
  return tempDirs.filter(dir => fs.existsSync(dir));
};

/**
 * 获取文件信息
 */
const getFileInfo = async (filePath: string): Promise<FileInfo> => {
  const stats = fs.statSync(filePath);
  
  return {
    path: filePath,
    name: path.basename(filePath),
    size: stats.isDirectory() ? await getDirectorySize(filePath) : stats.size,
    type: stats.isDirectory() ? 'directory' : 'file',
    lastModified: stats.mtime
  };
};

/**
 * 计算目录大小
 */
const getDirectorySize = async (dirPath: string): Promise<number> => {
  let totalSize = 0;
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      try {
        if (entry.isDirectory()) {
          totalSize += await getDirectorySize(fullPath);
        } else if (entry.isFile()) {
          const stats = fs.statSync(fullPath);
          totalSize += stats.size;
        }
      } catch (error) {
        // 忽略权限错误
      }
    }
  } catch (error) {
    // 忽略权限错误
  }
  
  return totalSize;
};

/**
 * 检查是否为系统关键目录
 */
const isSystemCriticalDirectory = (dirPath: string): boolean => {
  const lowerPath = dirPath.toLowerCase();
  
  const criticalDirs = [
    'c:\\windows\\system32',
    'c:\\windows\\syswow64',
    'c:\\program files',
    'c:\\program files (x86)',
    'c:\\boot',
    'c:\\recovery',
    'c:\\$recycle.bin',
    'c:\\system volume information'
  ];
  
  return criticalDirs.some(criticalDir => lowerPath.startsWith(criticalDir));
};

/**
 * 检查文件是否可以安全删除
 */
const isSafeToDelete = (filePath: string): boolean => {
  const lowerPath = filePath.toLowerCase();
  
  // 系统关键文件和目录
  const criticalPaths = [
    'c:\\windows\\system32',
    'c:\\windows\\syswow64',
    'c:\\program files',
    'c:\\program files (x86)',
    'c:\\boot',
    'c:\\recovery'
  ];
  
  return !criticalPaths.some(criticalPath => lowerPath.startsWith(criticalPath));
};

/**
 * 检查是否为垃圾文件
 */
const isJunkFile = (fileName: string, filePath: string): boolean => {
  const lowerName = fileName.toLowerCase();
  const lowerPath = filePath.toLowerCase();
  
  // 临时文件模式
  const junkPatterns = [
    /^~.*\.tmp$/,
    /^.*\.temp$/,
    /^.*\.bak$/,
    /^.*\.old$/,
    /^thumbs\.db$/,
    /^desktop\.ini$/,
    /^\.ds_store$/,
    /^.*\.log$/
  ];
  
  // 检查文件名模式
  if (junkPatterns.some(pattern => pattern.test(lowerName))) {
    return true;
  }
  
  // 检查是否在临时目录中
  const tempKeywords = ['temp', 'tmp', 'cache', 'log'];
  return tempKeywords.some(keyword => lowerPath.includes(keyword));
};
