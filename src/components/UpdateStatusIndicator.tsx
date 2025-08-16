import React from 'react';
import { Download, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useUpdateChecker } from '../hooks/useUpdateChecker';

interface UpdateStatusIndicatorProps {
  className?: string;
}

export const UpdateStatusIndicator: React.FC<UpdateStatusIndicatorProps> = ({ 
  className = '' 
}) => {
  const { updateResult, isChecking } = useUpdateChecker(true);

  // 如果正在检查，显示检查状态
  if (isChecking) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-gray-500 ${className}`}>
        <Wifi className="w-3 h-3 animate-pulse" />
        <span>检查更新中...</span>
      </div>
    );
  }

  // 如果有错误，显示离线状态
  if (updateResult?.error) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-gray-400 ${className}`}>
        <WifiOff className="w-3 h-3" />
        <span>离线模式</span>
      </div>
    );
  }

  // 如果有更新，显示更新提示
  if (updateResult?.hasUpdate) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-green-600 ${className}`}>
        <Download className="w-3 h-3" />
        <span>v{updateResult.latestVersion} 可用</span>
      </div>
    );
  }

  // 如果是最新版本，显示最新状态
  if (updateResult && !updateResult.hasUpdate) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-gray-500 ${className}`}>
        <CheckCircle className="w-3 h-3" />
        <span>已是最新版本</span>
      </div>
    );
  }

  // 默认状态
  return (
    <div className={`flex items-center gap-1.5 text-xs text-gray-400 ${className}`}>
      <CheckCircle className="w-3 h-3" />
      <span>v1.1.0</span>
    </div>
  );
};
