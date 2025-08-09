import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Info, Lock, Unlock } from 'lucide-react';
import { PermissionManager } from '../utils/permissionManager';

interface PermissionStatusProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionStatus: React.FC<PermissionStatusProps> = ({ isOpen, onClose }) => {
  const [permissionReport, setPermissionReport] = useState<any>(null);
  const [permissionCheck, setPermissionCheck] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadPermissionInfo();
    }
  }, [isOpen]);

  const loadPermissionInfo = async () => {
    const report = PermissionManager.getPermissionReport();
    const check = await PermissionManager.checkPermissions();
    
    setPermissionReport(report);
    setPermissionCheck(check);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">权限状态检查</h2>
              <p className="text-gray-600 text-sm">查看应用程序的文件访问权限和安全策略</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 权限概览 */}
          {permissionCheck && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                权限概览
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  {permissionCheck.hasAdminRights ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium">管理员权限</div>
                    <div className="text-sm text-gray-600">
                      {permissionCheck.hasAdminRights ? '已获取' : '未获取'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {permissionCheck.canAccessSystemFolders ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium">系统文件夹访问</div>
                    <div className="text-sm text-gray-600">
                      {permissionCheck.canAccessSystemFolders ? '可访问' : '受限'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {permissionCheck.canDeleteFiles ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium">文件删除权限</div>
                    <div className="text-sm text-gray-600">
                      {permissionCheck.canDeleteFiles ? '可删除' : '受限'}
                    </div>
                  </div>
                </div>
              </div>

              {permissionCheck.recommendations.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-800">建议</span>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {permissionCheck.recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 用户信息 */}
          {permissionReport && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                当前用户信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">用户路径:</span>
                  <div className="text-gray-600 font-mono text-xs mt-1 break-all">
                    {permissionReport.currentUser}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">管理员状态:</span>
                  <div className="text-gray-600 mt-1">
                    {permissionReport.isAdmin ? (
                      <span className="text-green-600 font-medium">是</span>
                    ) : (
                      <span className="text-red-600 font-medium">否</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 可访问路径 */}
          {permissionReport && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Unlock className="w-5 h-5 mr-2 text-green-600" />
                安全扫描路径 ({permissionReport.accessiblePaths.length})
              </h3>
              <div className="bg-green-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="text-sm text-gray-600 mb-2">
                  以下路径被认为是安全的，可以进行扫描和清理：
                </div>
                <div className="space-y-1">
                  {permissionReport.accessiblePaths.map((path, index) => (
                    <div key={index} className="font-mono text-xs text-gray-700 bg-white px-2 py-1 rounded">
                      {path}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 受限路径 */}
          {permissionReport && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                受限访问路径 ({permissionReport.restrictedPaths.length})
              </h3>
              <div className="bg-yellow-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="text-sm text-gray-600 mb-2">
                  以下路径需要特殊权限，操作时会格外谨慎：
                </div>
                <div className="space-y-1">
                  {permissionReport.restrictedPaths.map((path, index) => (
                    <div key={index} className="font-mono text-xs text-gray-700 bg-white px-2 py-1 rounded">
                      {path}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 安全策略说明 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">安全策略</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">多重验证</div>
                  <div>结合传统规则和AI分析进行双重验证，确保操作安全</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">系统保护</div>
                  <div>绝对禁止访问系统关键文件和文件夹，防止系统损坏</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">用户确认</div>
                  <div>对于高风险操作，会要求用户明确确认后才执行</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">回收站保护</div>
                  <div>删除的文件会移动到回收站，而不是永久删除</div>
                </div>
              </div>
            </div>
          </div>

          {/* 权限测试 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">权限测试</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const testResult = PermissionManager.validateFileOperation(
                    'read',
                    'C:\\Windows\\Temp\\test.tmp',
                    'test.tmp'
                  );
                  alert(`测试结果: ${testResult.allowed ? '允许' : '禁止'}\n原因: ${testResult.reason}`);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm mr-2"
              >
                测试临时文件读取
              </button>
              
              <button
                onClick={() => {
                  const testResult = PermissionManager.validateFileOperation(
                    'delete',
                    'C:\\Windows\\System32\\kernel32.dll',
                    'kernel32.dll'
                  );
                  alert(`测试结果: ${testResult.allowed ? '允许' : '禁止'}\n原因: ${testResult.reason}`);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                测试系统文件删除（应被禁止）
              </button>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
