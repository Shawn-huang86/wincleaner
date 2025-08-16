/// <reference types="vite/client" />

interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string[];
  fileSize?: number;
  isRequired?: boolean;
  downloadUrl?: string;
  checksum?: string;
  checksumSha256?: string;
  releaseName?: string;
}

interface UpdateStatusData {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  info?: {
    version: string;
    releaseDate?: string;
    releaseNotes?: string[];
    fileSize?: number;
    isRequired?: boolean;
    downloadUrl?: string;
    checksum?: string;
    checksumSha256?: string;
    releaseName?: string;
  };
  progress?: {
    percent: number;
    transferred?: number;
    total?: number;
    bytesPerSecond?: number;
  };
  error?: string;
}

interface ElectronAPI {
  // 原有的API
  getAppInfo(): Promise<{ version: string } | null>;
  openExternal(url: string): Promise<void>;
  downloadUpdate(url: string): Promise<string>;
  installUpdate(filePath: string): Promise<void>;
  checkForUpdates: () => Promise<{ success: boolean; error?: string }>;
  onUpdateStatus: (callback: (event: CustomEvent<UpdateStatusData>, data: UpdateStatusData) => void) => void;
  removeUpdateStatusListener: () => void;
  getCurrentVersion: () => Promise<string>;

  // 文件对话框
  showSaveDialog: () => Promise<{ canceled: boolean; filePath?: string }>;
  showOpenDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;

  // 通知
  showNotification: (title: string, body: string) => Promise<void>;

  // 文件操作 API
  scanJunkFiles: (options: {
    paths: string[];
    extensions: string[];
    maxDepth: number;
  }) => Promise<{
    success: boolean;
    data?: {
      files: Array<{
        path: string;
        name: string;
        size: number;
        type: 'file' | 'directory';
        lastModified: Date;
      }>;
      totalSize: number;
    };
    error?: string;
  }>;
  deleteFiles: (filePaths: string[]) => Promise<{
    success: boolean;
    data?: {
      success: boolean;
      deletedFiles: string[];
      failedFiles: { path: string; error: string }[];
      totalSize: number;
    };
    error?: string;
  }>;
  getTempDirs: () => Promise<{
    success: boolean;
    data?: string[];
    error?: string;
  }>;
  fileExists: (filePath: string) => Promise<{
    success: boolean;
    data?: boolean;
    error?: string;
  }>;
  getFileInfo: (filePath: string) => Promise<{
    success: boolean;
    data?: {
      path: string;
      name: string;
      size: number;
      type: 'file' | 'directory';
      lastModified: Date;
    };
    error?: string;
  }>;

  // 监听主进程消息
  onQuickScan: (callback: () => void) => void;
  onDeepScan: (callback: () => void) => void;
  onNewScan: (callback: () => void) => void;
  onExportReport: (callback: () => void) => void;
  onOpenSettings: (callback: () => void) => void;

  // 移除监听器
  removeAllListeners: (channel: string) => void;

  // 平台信息
  platform: string;
  isElectron: boolean;
}

declare interface Window {
  electronAPI: ElectronAPI;
}