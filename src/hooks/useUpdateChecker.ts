import { useState, useEffect } from 'react';
import { UpdateCheckResult, UpdateInfo, UpdateStatusData, ElectronAPI } from '../types/updateTypes';

/**
 * 更新检查Hook
 */
export const useUpdateChecker = (autoCheck: boolean = true) => {
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkForUpdates = async () => {
    if (!window.electronAPI) return null;
    
    setIsChecking(true);
    try {
      const result = await window.electronAPI.checkForUpdates();
      // 注意：这里不直接设置结果，因为结果会通过事件监听器更新
      return result;
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // 监听更新状态
    if (window.electronAPI) {
      const handleUpdateStatus = (_event: CustomEvent<UpdateStatusData>, data: UpdateStatusData) => {
        switch (data.status) {
          case 'available':
            if (data.info) {
              setUpdateResult({
                hasUpdate: true,
                currentVersion: '1.0.0',
                latestVersion: data.info.version,
                updateInfo: {
                  version: data.info.version,
                  releaseDate: data.info.releaseDate,
                  releaseNotes: data.info.releaseNotes || []
                }
              });
            }
            break;
            
          case 'not-available':
            setUpdateResult(null);
            break;
        }
      };

      window.electronAPI.onUpdateStatus(handleUpdateStatus);
      
      return () => {
        window.electronAPI.removeUpdateStatusListener();
      };
    }
  }, []);

  useEffect(() => {
    if (autoCheck && window.electronAPI) {
      // 延迟5秒后自动检查，避免影响应用启动
      const timer = setTimeout(() => {
        window.electronAPI.checkForUpdates();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [autoCheck]);

  return {
    updateResult,
    isChecking,
    checkForUpdates,
    clearUpdate: () => setUpdateResult(null)
  };
};