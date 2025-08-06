import React from 'react';
import { CheckCircle, Download, X } from 'lucide-react';
import { formatFileSize } from '../utils/helpers';

interface SuccessDialogProps {
  isOpen: boolean;
  totalSpaceFreed: number;
  onClose: () => void;
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({
  isOpen,
  totalSpaceFreed,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">清理完成</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">清理成功！</h4>
              <p className="text-sm text-gray-700 mb-3">
                已成功释放 <span className="font-semibold text-green-600">{formatFileSize(totalSpaceFreed)}</span> 磁盘空间。
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800 text-sm font-medium mb-1">
                  <Download className="w-4 h-4" />
                  清理报告已生成
                </div>
                <p className="text-blue-700 text-sm">
                  详细的清理报告已自动下载到您的设备，包含所有清理项目的详细信息。
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};