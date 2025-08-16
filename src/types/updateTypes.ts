export interface UpdateInfo {
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

export interface UpdateStatusData {
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

export interface ElectronAPI {
  getAppInfo(): Promise<{ version: string } | null>;
  openExternal(url: string): Promise<void>;
  downloadUpdate(url: string): Promise<string>;
  installUpdate(filePath: string): Promise<void>;
  checkForUpdates: () => Promise<{ success: boolean; error?: string }>;
  onUpdateStatus: (callback: (event: CustomEvent<UpdateStatusData>, data: UpdateStatusData) => void) => void;
  removeUpdateStatusListener: () => void;
  getCurrentVersion: () => Promise<string>;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  updateInfo?: UpdateInfo;
}