import React, { useState, useEffect } from 'react';
import { X, Key, Crown, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import LicenseManager, { LicenseInfo } from '../services/licenseManager';

interface LicenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLicenseChanged?: () => void;
}

export const LicenseDialog: React.FC<LicenseDialogProps> = ({
  isOpen,
  onClose,
  onLicenseChanged
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);

  const licenseManager = LicenseManager.getInstance();

  useEffect(() => {
    if (isOpen) {
      setLicenseInfo(licenseManager.getLicenseInfo());
      setMessage('');
      setLicenseKey('');
    }
  }, [isOpen]);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setMessage('请输入许可证密钥');
      setMessageType('error');
      return;
    }

    setIsActivating(true);
    setMessage('正在验证许可证...');
    setMessageType('info');

    try {
      const result = await licenseManager.activateLicense(licenseKey.trim());
      
      if (result.success) {
        setMessage(result.message);
        setMessageType('success');
        setLicenseInfo(licenseManager.getLicenseInfo());
        setLicenseKey('');
        onLicenseChanged?.();
        
        // 3秒后自动关闭
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setMessage(result.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('激活失败，请稍后重试');
      setMessageType('error');
    } finally {
      setIsActivating(false);
    }
  };

  const handleStartTrial = () => {
    const result = licenseManager.startTrial();
    setMessage(result.message);
    setMessageType(result.success ? 'success' : 'error');
    
    if (result.success) {
      setLicenseInfo(licenseManager.getLicenseInfo());
      onLicenseChanged?.();
      
      // 3秒后自动关闭
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };

  const handleReset = () => {
    licenseManager.resetLicense();
    setLicenseInfo(licenseManager.getLicenseInfo());
    setMessage('许可证已重置');
    setMessageType('info');
    onLicenseChanged?.();
  };

  if (!isOpen) return null;

  const trialDays = licenseManager.getTrialDaysRemaining();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">许可证管理</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 当前状态 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">当前状态</h3>
            <div className="flex items-center space-x-2">
              {licenseInfo?.isActivated ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">高级版已激活</span>
                </>
              ) : licenseInfo?.licenseType === 'trial' && trialDays > 0 ? (
                <>
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-blue-700 font-medium">
                    试用期 (剩余 {trialDays} 天)
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">免费版</span>
                </>
              )}
            </div>
          </div>

          {/* 功能对比 */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">功能对比</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>基础清理 (浏览器缓存)</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex justify-between">
                <span>应用管理</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex justify-between">
                <span>系统清理</span>
                {licenseInfo?.isActivated || (licenseInfo?.licenseType === 'trial' && trialDays > 0) ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <div className="flex justify-between">
                <span>注册表清理</span>
                {licenseInfo?.isActivated || (licenseInfo?.licenseType === 'trial' && trialDays > 0) ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <div className="flex justify-between">
                <span>聊天清理</span>
                {licenseInfo?.isActivated || (licenseInfo?.licenseType === 'trial' && trialDays > 0) ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <div className="flex justify-between">
                <span>深度扫描</span>
                {licenseInfo?.isActivated || (licenseInfo?.licenseType === 'trial' && trialDays > 0) ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>
          </div>

          {/* 激活区域 */}
          {!licenseInfo?.isActivated && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  许可证密钥
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="输入许可证密钥"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isActivating}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleActivate}
                  disabled={isActivating || !licenseKey.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isActivating ? '激活中...' : '激活许可证'}
                </button>
                
                {licenseInfo?.licenseType !== 'trial' && (
                  <button
                    onClick={handleStartTrial}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    开始试用
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 消息显示 */}
          {message && (
            <div className={`p-3 rounded-lg ${
              messageType === 'success' ? 'bg-green-50 text-green-700' :
              messageType === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {message}
            </div>
          )}

          {/* 测试按钮 (开发环境) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="pt-4 border-t">
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                重置许可证 (测试)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
