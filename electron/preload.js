const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露安全的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件对话框
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  
  // 通知
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  
  // 应用信息
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // 监听主进程消息
  onQuickScan: (callback) => ipcRenderer.on('quick-scan', callback),
  onDeepScan: (callback) => ipcRenderer.on('deep-scan', callback),
  onNewScan: (callback) => ipcRenderer.on('new-scan', callback),
  onExportReport: (callback) => ipcRenderer.on('export-report', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  
  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // 平台信息
  platform: process.platform,
  isElectron: true
});
