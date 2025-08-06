import React, { useState } from 'react';
import { Search, FileText, Folder, AlertTriangle, CheckCircle, XCircle, Shield, HelpCircle, Upload, X } from 'lucide-react';
import { identifyFile, FileIdentification } from '../utils/fileIdentifier';

interface FileIdentifierProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileIdentifier: React.FC<FileIdentifierProps> = ({
  isOpen,
  onClose,
}) => {
  const [inputPath, setInputPath] = useState('');
  const [identificationResults, setIdentificationResults] = useState<FileIdentification[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!inputPath.trim()) return;
    
    setIsAnalyzing(true);
    
    // 模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 解析输入的路径
    const paths = inputPath.split('\n').filter(path => path.trim());
    const results: FileIdentification[] = [];
    
    paths.forEach(path => {
      const trimmedPath = path.trim();
      const fileName = trimmedPath.split('\\').pop() || trimmedPath.split('/').pop() || trimmedPath;
      const isDirectory = !fileName.includes('.') || trimmedPath.endsWith('\\') || trimmedPath.endsWith('/');
      
      const identification = identifyFile(trimmedPath, fileName, isDirectory);
      results.push(identification);
    });
    
    setIdentificationResults(results);
    setIsAnalyzing(false);
  };

  const getRiskIcon = (canDelete: string) => {
    switch (canDelete) {
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'caution':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'dangerous':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'never':
        return <Shield className="w-5 h-5 text-red-700" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskColor = (canDelete: string) => {
    switch (canDelete) {
      case 'safe':
        return 'border-green-200 bg-green-50';
      case 'caution':
        return 'border-orange-200 bg-orange-50';
      case 'dangerous':
        return 'border-red-200 bg-red-50';
      case 'never':
        return 'border-red-300 bg-red-100';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system':
        return <Shield className="w-4 h-4" />;
      case 'software':
        return <FileText className="w-4 h-4" />;
      case 'temp':
        return <FileText className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system':
        return 'bg-blue-100 text-blue-700';
      case 'software':
        return 'bg-purple-100 text-purple-700';
      case 'temp':
        return 'bg-green-100 text-green-700';
      case 'user':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">智能文件识别</h3>
              <p className="text-sm text-gray-600">识别未知文件和文件夹，获取删除建议</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* 输入区域 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输入文件或文件夹路径（每行一个）
            </label>
            <div className="relative">
              <textarea
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
                placeholder="例如：&#10;C:\Windows.old&#10;C:\Users\用户名\AppData\Local\Temp&#10;hiberfil.sys&#10;node_modules"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="absolute bottom-3 right-3">
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                支持Windows路径格式，如：C:\Windows\Temp 或相对路径
              </p>
              <button
                onClick={handleAnalyze}
                disabled={!inputPath.trim() || isAnalyzing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    开始识别
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 结果显示 */}
          {identificationResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">识别结果</h4>
                <span className="text-sm text-gray-500">共 {identificationResults.length} 项</span>
              </div>
              
              <div className="space-y-3">
                {identificationResults.map((result, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 ${getRiskColor(result.canDelete)}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {result.type === 'folder' ? (
                          <Folder className="w-8 h-8 text-blue-600" />
                        ) : (
                          <FileText className="w-8 h-8 text-gray-600" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className="text-lg font-semibold text-gray-900 truncate">
                            {result.name}
                          </h5>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(result.category)}`}>
                            {getCategoryIcon(result.category)}
                            {result.category}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{result.description}</p>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getRiskIcon(result.canDelete)}
                            <span className="font-medium text-gray-900">
                              {result.recommendation}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 p-3 bg-white/70 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>原因：</strong>{result.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 使用说明 */}
          {identificationResults.length === 0 && !isAnalyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">使用说明</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 在上方文本框中输入您不认识的文件或文件夹路径</li>
                    <li>• 每行输入一个路径，支持完整路径或文件名</li>
                    <li>• 系统会自动识别文件类型并给出删除建议</li>
                    <li>• 绿色表示安全，橙色需谨慎，红色高风险</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={() => {
              setInputPath('');
              setIdentificationResults([]);
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            清空结果
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};