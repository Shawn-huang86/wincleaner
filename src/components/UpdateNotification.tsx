import React, { useState, useEffect } from 'react';
import { Download, X, RefreshCw, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { UpdateService, UpdateCheckResult } from '../services/updateService';
import { UpdateGuide } from './UpdateGuide';

interface UpdateNotificationProps {
  onClose?: () => void;
  autoCheck?: boolean; // 是否在组件加载时自动检查
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  onClose,
  autoCheck = false
}) => {
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (autoCheck) {
      checkForUpdates();
    }
  }, [autoCheck]);

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      const result = await UpdateService.checkForUpdates();
      setUpdateResult(result);
      
      // 如果有更新，显示通知
      if (result.hasUpdate) {
        setShowNotification(true);
      }
    } catch (error) {
      console.error('检查更新失败:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDownload = async () => {
    if (updateResult?.updateInfo) {
      await UpdateService.openDownloadPage(updateResult.updateInfo.downloadUrl);
    }
  };

  const handleClose = () => {
    setShowNotification(false);
    onClose?.();
  };

  // 如果没有更新或不显示通知，返回检查按钮
  if (!showNotification || !updateResult?.hasUpdate) {
    return (
      <button
        onClick={checkForUpdates}
        disabled={isChecking}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        title="检查更新"
      >
        <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
        {isChecking ? '检查中...' : '检查更新'}
      </button>
    );
  }

  const { updateInfo } = updateResult;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* 头部 */}
        <div className={`px-4 py-3 ${updateInfo?.isRequired ? 'bg-red-50' : 'bg-blue-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {updateInfo?.isRequired ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              )}
              <h3 className={`font-semibold ${updateInfo?.isRequired ? 'text-red-800' : 'text-blue-800'}`}>
                {updateInfo?.isRequired ? '重要更新可用' : '新版本可用'}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-3">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>当前版本:</span>
              <span className="font-medium">{updateResult.currentVersion}</span>
            </div>
            <div className="flex justify-between">
              <span>最新版本:</span>
              <span className="font-medium text-green-600">{updateResult.latestVersion}</span>
            </div>
            {updateInfo && (
              <div className="flex justify-between">
                <span>文件大小:</span>
                <span className="font-medium">{UpdateService.formatFileSize(updateInfo.fileSize)}</span>
              </div>
            )}
          </div>

          {/* 更新说明 */}
          {updateInfo?.releaseNotes && updateInfo.releaseNotes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-800 mb-2">更新内容:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {updateInfo.releaseNotes.map((note, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 发布日期 */}
          {updateInfo?.releaseDate && (
            <div className="text-xs text-gray-500">
              发布时间: {new Date(updateInfo.releaseDate).toLocaleDateString('zh-CN')}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="px-4 py-3 bg-gray-50 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              稍后提醒
            </button>
            <button
              onClick={handleDownload}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm text-white rounded-md transition-colors ${
                updateInfo?.isRequired
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Download className="w-4 h-4" />
              立即下载
            </button>
          </div>

          {/* 帮助链接 */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowGuide(true)}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              下载遇到问题？查看帮助
            </button>
          </div>
        </div>

        {/* 更新指南弹窗 */}
        {showGuide && (
          <UpdateGuide onClose={() => setShowGuide(false)} />
        )}
      </div>
    </div>
  );
};

/**
 * 更新检查Hook
 */
export const useUpdateChecker = (autoCheck: boolean = true) => {
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      const result = await UpdateService.checkForUpdates();
      setUpdateResult(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (autoCheck) {
      // 延迟5秒后自动检查，避免影响应用启动
      const timer = setTimeout(() => {
        UpdateService.autoCheckForUpdates().then(result => {
          if (result?.hasUpdate) {
            setUpdateResult(result);
          }
        });
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
