import { useState, useEffect } from 'react';
import { UpdateCheckResult, UpdateInfo, UpdateStatusData, ElectronAPI } from '../types/updateTypes';
import { UpdateService } from '../services/updateService';

/**
 * 更新检查Hook
 */
export const useUpdateChecker = (autoCheck: boolean = true) => {
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      // 使用自定义更新服务
      const result = await UpdateService.checkForUpdates();
      setUpdateResult(result);
      return result;
    } catch (error) {
      console.error('检查更新失败:', error);
      setUpdateResult({
        hasUpdate: false,
        currentVersion: '1.3.1',
        error: error instanceof Error ? error.message : '检查更新失败'
      });
      return null;
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
                currentVersion: data.currentVersion || '1.3.1',
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
    if (autoCheck) {
      // 延迟5秒后自动检查，避免影响应用启动
      const timer = setTimeout(() => {
        checkForUpdates();
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