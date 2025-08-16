import React from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { useUpdateChecker } from '../hooks/useUpdateChecker';

interface UpdateButtonProps {
  className?: string;
  showText?: boolean;
}

export const UpdateButton: React.FC<UpdateButtonProps> = ({ 
  className = '', 
  showText = true 
}) => {
  const { updateResult, isChecking, checkForUpdates } = useUpdateChecker(false);

  const handleClick = async () => {
    if (updateResult?.hasUpdate && updateResult.updateInfo) {
      // 如果有更新，直接打开下载页面
      const { UpdateService } = await import('../services/updateService');
      await UpdateService.openDownloadPage(updateResult.updateInfo.downloadUrl);
    } else {
      // 否则检查更新
      await checkForUpdates();
    }
  };

  const hasUpdate = updateResult?.hasUpdate;
  const buttonText = hasUpdate ? '下载更新' : (isChecking ? '检查中...' : '检查更新');
  const buttonIcon = hasUpdate ? Download : RefreshCw;
  const IconComponent = buttonIcon;

  return (
    <button
      onClick={handleClick}
      disabled={isChecking}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
        hasUpdate 
          ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      } rounded-lg ${className}`}
      title={hasUpdate ? `新版本 ${updateResult.latestVersion} 可用` : '检查应用更新'}
    >
      <IconComponent className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
      {showText && (
        <span className="hidden sm:inline">
          {buttonText}
          {hasUpdate && updateResult.latestVersion && (
            <span className="ml-1 text-xs opacity-75">
              v{updateResult.latestVersion}
            </span>
          )}
        </span>
      )}
      {hasUpdate && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
      )}
    </button>
  );
};
