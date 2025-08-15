/// <reference types="vite/client" />

interface ElectronAPI {
  getAppInfo(): Promise<{ version: string } | null>;
  openExternal(url: string): Promise<void>;
  downloadUpdate(url: string): Promise<string>;
  installUpdate(filePath: string): Promise<void>;
}

declare interface Window {
  electronAPI: ElectronAPI;
}