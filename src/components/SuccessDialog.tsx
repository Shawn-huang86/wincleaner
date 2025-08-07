import React from 'react';
import { CheckCircle, X } from 'lucide-react';
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
        
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">清理成功！</h4>
            <p className="text-gray-600">
              已成功释放 <span className="font-semibold text-green-600 text-lg">{formatFileSize(totalSpaceFreed)}</span> 磁盘空间
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              🎉 所有文件已安全移至回收站，如需恢复可从回收站还原
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ✨ 完成
          </button>
        </div>
      </div>
    </div>
  );
};