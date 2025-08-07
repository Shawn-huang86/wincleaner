import { shell } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface FileOperationResult {
  success: boolean;
  error?: string;
  path: string;
}

/**
 * 将文件移动到回收站
 * @param filePath 要删除的文件路径
 * @returns 操作结果
 */
export const moveToTrash = async (filePath: string): Promise<FileOperationResult> => {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: '文件不存在',
        path: filePath
      };
    }

    // 使用 Electron 的 shell.trashItem 将文件移动到回收站
    await shell.trashItem(filePath);
    
    return {
      success: true,
      path: filePath
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      path: filePath
    };
  }
};

/**
 * 批量将文件移动到回收站
 * @param filePaths 要删除的文件路径数组
 * @param onProgress 进度回调函数
 * @returns 操作结果数组
 */
export const batchMoveToTrash = async (
  filePaths: string[],
  onProgress?: (current: number, total: number, currentFile: string) => void
): Promise<FileOperationResult[]> => {
  const results: FileOperationResult[] = [];
  
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    
    // 调用进度回调
    if (onProgress) {
      onProgress(i + 1, filePaths.length, path.basename(filePath));
    }
    
    // 移动到回收站
    const result = await moveToTrash(filePath);
    results.push(result);
    
    // 添加小延迟，避免系统过载
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

/**
 * 获取文件/文件夹的实际大小
 * @param filePath 文件路径
 * @returns 文件大小（字节）
 */
export const getFileSize = async (filePath: string): Promise<number> => {
  try {
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // 如果是文件夹，递归计算所有文件大小
      return await getDirectorySize(filePath);
    } else {
      return stats.size;
    }
  } catch (error) {
    return 0;
  }
};

/**
 * 递归计算文件夹大小
 * @param dirPath 文件夹路径
 * @returns 文件夹总大小（字节）
 */
const getDirectorySize = async (dirPath: string): Promise<number> => {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += await getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // 忽略权限错误等
  }
  
  return totalSize;
};

/**
 * 检查文件是否可以安全删除
 * @param filePath 文件路径
 * @returns 是否可以安全删除
 */
export const isSafeToDelete = (filePath: string): boolean => {
  const lowerPath = filePath.toLowerCase();
  
  // 系统关键目录，绝对不能删除
  const criticalPaths = [
    'c:\\windows\\system32',
    'c:\\windows\\syswow64',
    'c:\\program files',
    'c:\\program files (x86)',
    'c:\\users\\public',
    'c:\\boot',
    'c:\\recovery'
  ];
  
  // 检查是否在关键路径中
  for (const criticalPath of criticalPaths) {
    if (lowerPath.startsWith(criticalPath)) {
      return false;
    }
  }
  
  // 安全的临时目录和缓存目录
  const safePaths = [
    'temp',
    'tmp',
    'cache',
    'logs',
    'appdata\\local\\temp',
    'appdata\\roaming\\temp'
  ];
  
  // 检查是否在安全路径中
  for (const safePath of safePaths) {
    if (lowerPath.includes(safePath)) {
      return true;
    }
  }
  
  return false;
};

/**
 * 扫描指定目录下的垃圾文件
 * @param dirPath 要扫描的目录
 * @param extensions 要查找的文件扩展名
 * @returns 找到的文件列表
 */
export const scanJunkFiles = async (
  dirPath: string,
  extensions: string[] = ['.tmp', '.log', '.cache', '.bak']
): Promise<string[]> => {
  const junkFiles: string[] = [];
  
  try {
    if (!fs.existsSync(dirPath)) {
      return junkFiles;
    }
    
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // 递归扫描子目录
        const subFiles = await scanJunkFiles(filePath, extensions);
        junkFiles.push(...subFiles);
      } else {
        // 检查文件扩展名
        const ext = path.extname(file).toLowerCase();
        if (extensions.includes(ext)) {
          junkFiles.push(filePath);
        }
      }
    }
  } catch (error) {
    // 忽略权限错误等
  }
  
  return junkFiles;
};
