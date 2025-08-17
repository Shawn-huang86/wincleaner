import React, { useState, useEffect } from 'react';
import { Download, X, RefreshCw, AlertCircle, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';
import { UpdateGuide } from './UpdateGuide';
import { useUpdateChecker } from '../hooks/useUpdateChecker';
import { UpdateInfo, UpdateStatusData, ElectronAPI, UpdateCheckResult } from '../types/updateTypes';

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
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'downloading' | 'installing' | 'completed' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // 监听更新状态
    if (window.electronAPI) {
      window.electronAPI.onUpdateStatus(handleUpdateStatus);
    }
    
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeUpdateStatusListener();
      }
    };
  }, []);

  useEffect(() => {
    if (autoCheck) {
      // 延迟检查更新，让应用完全启动
      const timer = setTimeout(() => {
        checkForUpdates();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoCheck]);

  const checkForUpdates = async () => {
    if (!window.electronAPI) return;
    
    setIsChecking(true);
    try {
      const result = await window.electronAPI.checkForUpdates();
      if (result && !result.success) {
        console.error('检查更新失败:', result.error);
      }
    } catch (error: unknown) {
      console.error('检查更新失败:', error instanceof Error ? error.message : String(error));
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdateStatus = (_event: CustomEvent<UpdateStatusData>, data: UpdateStatusData) => {
    console.log('更新状态:', data);
    
    switch (data.status) {
      case 'checking':
        setIsChecking(true);
        setStatusMessage('正在检查更新...');
        break;
        
      case 'available':
        setIsChecking(false);
        setShowNotification(true);
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
        setIsChecking(false);
        setShowNotification(false);
        setStatusMessage('当前已是最新版本');
        setTimeout(() => setStatusMessage(''), 3000);
        break;
        
      case 'downloading':
        setUpdateStatus('downloading');
        if (data.progress) {
          setDownloadProgress(Math.round(data.progress.percent));
          setStatusMessage(`正在下载更新... ${Math.round(data.progress.percent)}%`);
        }
        break;
        
      case 'downloaded':
        setUpdateStatus('idle');
        setStatusMessage('更新下载完成，点击安装');
        break;
        
      case 'error':
        setIsChecking(false);
        setUpdateStatus('error');
        setErrorMessage(data.error || '更新失败');
        setStatusMessage('更新失败');
        break;
    }
  };

  const handleDownload = async () => {
    if (!window.electronAPI) return;
    
    try {
      setUpdateStatus('installing');
      setStatusMessage('正在安装更新...');
      setErrorMessage('');
      
      // 安装更新
      await window.electronAPI.installUpdate('');
      
      // 如果没有抛出异常，说明安装成功
      setUpdateStatus('completed');
      setStatusMessage('更新完成！应用将重启...');
      
      // 延迟关闭通知
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error: unknown) {
      console.error('安装失败:', error);
      setUpdateStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '安装失败');
      setStatusMessage('安装失败');
    }
  };

  const handleManualDownload = () => {
    // 打开GitHub releases页面
    window.open('https://github.com/Shawn-huang86/wincleaner/releases', '_blank');
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

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
            {updateInfo && updateInfo.fileSize && (
              <div className="flex justify-between">
                <span>文件大小:</span>
                <span className="font-medium">{formatFileSize(updateInfo.fileSize)}</span>
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
          {/* 下载进度条 */}
          {updateStatus === 'downloading' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{statusMessage}</span>
                <span>{downloadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* 状态消息 */}
          {updateStatus === 'installing' && (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{statusMessage}</span>
            </div>
          )}
          
          {/* 完成消息 */}
          {updateStatus === 'completed' && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 py-2">
              <CheckCircle className="w-4 h-4" />
              <span>{statusMessage}</span>
            </div>
          )}
          
          {/* 错误消息 */}
          {updateStatus === 'error' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
              {errorMessage && (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                  {errorMessage}
                </div>
              )}
            </div>
          )}
          
          {/* 操作按钮 */}
          {updateStatus === 'idle' && (
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
                立即更新
              </button>
            </div>
          )}
          
          {/* 错误状态下的按钮 */}
          {updateStatus === 'error' && (
            <div className="flex gap-2">
              <button
                onClick={handleManualDownload}
                className="flex-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                手动下载
              </button>
              <button
                onClick={() => {
                  setUpdateStatus('idle');
                  setErrorMessage('');
                }}
                className="flex-1 px-3 py-2 text-sm text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
              >
                重试
              </button>
            </div>
          )}
          
          {/* 帮助链接 */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowGuide(true)}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              更新遇到问题？查看帮助
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
