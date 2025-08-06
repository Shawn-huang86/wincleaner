import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { formatFileSize } from '../utils/helpers';

interface ConfirmDialogProps {
  isOpen: boolean;
  selectedCount: number;
  totalSize: number;
  hasHighRisk: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  selectedCount,
  totalSize,
  hasHighRisk,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">确认清理</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${hasHighRisk ? 'bg-red-100' : 'bg-blue-100'}`}>
              {hasHighRisk ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <Trash2 className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 mb-2">
                您即将清理 <span className="font-semibold">{selectedCount}</span> 项，
                可释放 <span className="font-semibold">{formatFileSize(totalSize)}</span> 空间。
              </p>
              
              {hasHighRisk && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-red-800 text-sm font-medium mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    高风险警告
                  </div>
                  <p className="text-red-700 text-sm">
                    选中项目包含系统文件或注册表项，请谨慎操作。
                  </p>
                </div>
              )}
              
              <p className="text-sm text-gray-600">
                所有文件将被移至回收站，您可以随时恢复。
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${
              hasHighRisk 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {hasHighRisk ? '仍要清理' : '确认清理'}
          </button>
        </div>
      </div>
    </div>
  );
};