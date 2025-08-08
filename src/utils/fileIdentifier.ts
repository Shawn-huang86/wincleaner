import { AIService } from '../services/aiService';
import { AIAnalysisResult, AIAnalysisRequest } from '../types';

export interface FileIdentification {
  name: string;
  type: 'file' | 'folder';
  category: 'system' | 'software' | 'user' | 'temp' | 'unknown';
  description: string;
  canDelete: 'safe' | 'caution' | 'dangerous' | 'never';
  reason: string;
  recommendation: string;
  aiAnalysis?: AIAnalysisResult;
}

// 系统文件夹识别数据库
const SYSTEM_FOLDERS = {
  'Windows': { desc: 'Windows操作系统核心文件夹', canDelete: 'never', reason: '删除会导致系统崩溃' },
  'Program Files': { desc: '64位程序安装目录', canDelete: 'never', reason: '包含已安装的软件' },
  'Program Files (x86)': { desc: '32位程序安装目录', canDelete: 'never', reason: '包含已安装的软件' },
  'ProgramData': { desc: '程序共享数据文件夹', canDelete: 'dangerous', reason: '包含程序配置和数据' },
  'Users': { desc: '用户账户文件夹', canDelete: 'never', reason: '包含所有用户数据' },
  'System Volume Information': { desc: '系统还原点存储', canDelete: 'caution', reason: '删除会失去系统还原功能' },
  '$Recycle.Bin': { desc: '回收站文件夹', canDelete: 'caution', reason: '删除会清空回收站' },
  'Recovery': { desc: '系统恢复文件夹', canDelete: 'dangerous', reason: '用于系统恢复' },
  'Boot': { desc: '系统启动文件夹', canDelete: 'never', reason: '删除会导致无法启动' },
  'Windows.old': { desc: '系统升级备份文件夹', canDelete: 'safe', reason: '升级后的旧系统备份，可安全删除' },
  'Temp': { desc: '临时文件夹', canDelete: 'safe', reason: '临时文件，可安全清理' },
  'tmp': { desc: '临时文件夹', canDelete: 'safe', reason: '临时文件，可安全清理' },
};

// 软件相关文件夹
const SOFTWARE_FOLDERS = {
  'AppData': { desc: '应用程序数据文件夹', canDelete: 'dangerous', reason: '包含程序设置和用户数据' },
  'node_modules': { desc: 'Node.js依赖包文件夹', canDelete: 'safe', reason: '可通过npm重新安装' },
  '.git': { desc: 'Git版本控制文件夹', canDelete: 'caution', reason: '删除会丢失版本历史' },
  '.vscode': { desc: 'VS Code配置文件夹', canDelete: 'caution', reason: '包含编辑器配置' },
  'cache': { desc: '缓存文件夹', canDelete: 'safe', reason: '缓存文件，可重新生成' },
  'Cache': { desc: '缓存文件夹', canDelete: 'safe', reason: '缓存文件，可重新生成' },
  'logs': { desc: '日志文件夹', canDelete: 'safe', reason: '日志文件，通常可删除' },
  'Logs': { desc: '日志文件夹', canDelete: 'safe', reason: '日志文件，通常可删除' },
};

// 系统文件识别
const SYSTEM_FILES = {
  'hiberfil.sys': { desc: '休眠文件', canDelete: 'caution', reason: '删除会禁用休眠功能' },
  'pagefile.sys': { desc: '虚拟内存文件', canDelete: 'dangerous', reason: '删除会影响系统性能' },
  'swapfile.sys': { desc: '交换文件', canDelete: 'dangerous', reason: '删除会影响系统性能' },
  'bootmgr': { desc: '启动管理器', canDelete: 'never', reason: '删除会导致无法启动' },
  'ntldr': { desc: '系统加载器', canDelete: 'never', reason: '删除会导致无法启动' },
  'autoexec.bat': { desc: '自动执行批处理文件', canDelete: 'caution', reason: '可能包含重要启动命令' },
  'config.sys': { desc: '系统配置文件', canDelete: 'caution', reason: '可能包含重要系统配置' },
};

// 文件扩展名识别
const FILE_EXTENSIONS = {
  '.tmp': { desc: '临时文件', canDelete: 'safe', reason: '临时文件，可安全删除' },
  '.temp': { desc: '临时文件', canDelete: 'safe', reason: '临时文件，可安全删除' },
  '.log': { desc: '日志文件', canDelete: 'safe', reason: '日志文件，通常可删除' },
  '.bak': { desc: '备份文件', canDelete: 'caution', reason: '备份文件，删除前确认不需要' },
  '.old': { desc: '旧版本文件', canDelete: 'caution', reason: '旧版本文件，删除前确认不需要' },
  '.cache': { desc: '缓存文件', canDelete: 'safe', reason: '缓存文件，可重新生成' },
  '.crdownload': { desc: 'Chrome下载中文件', canDelete: 'safe', reason: '未完成的下载文件' },
  '.part': { desc: '部分下载文件', canDelete: 'safe', reason: '未完成的下载文件' },
  '.dmp': { desc: '内存转储文件', canDelete: 'safe', reason: '系统崩溃转储文件，通常可删除' },
  '.chk': { desc: '磁盘检查恢复文件', canDelete: 'caution', reason: '磁盘检查恢复的文件碎片' },
  '.thumbs.db': { desc: 'Windows缩略图缓存', canDelete: 'safe', reason: '缩略图缓存，可重新生成' },
  '.ds_store': { desc: 'macOS文件夹配置', canDelete: 'safe', reason: 'macOS系统文件，Windows下可删除' },
};

// 可疑文件模式
const SUSPICIOUS_PATTERNS = [
  { pattern: /^[a-f0-9]{32}$/i, desc: '32位哈希文件名', canDelete: 'caution', reason: '可能是临时文件或缓存' },
  { pattern: /^[a-f0-9]{40}$/i, desc: '40位哈希文件名', canDelete: 'caution', reason: '可能是临时文件或缓存' },
  { pattern: /^\d{8,}$/i, desc: '纯数字文件名', canDelete: 'caution', reason: '可能是临时文件' },
  { pattern: /^temp\d+/i, desc: '临时文件模式', canDelete: 'safe', reason: '临时文件命名模式' },
  { pattern: /^~\$/, desc: 'Office临时文件', canDelete: 'safe', reason: 'Microsoft Office临时文件' },
  { pattern: /\.tmp\d+$/i, desc: '编号临时文件', canDelete: 'safe', reason: '临时文件' },
];

export const identifyFile = async (
  filePath: string,
  fileName: string,
  isDirectory: boolean,
  fileSize?: number,
  lastModified?: Date,
  useAI: boolean = true
): Promise<FileIdentification> => {
  const lowerName = fileName.toLowerCase();
  const fileExt = fileName.includes('.') ? '.' + fileName.split('.').pop()?.toLowerCase() : '';

  // 首先使用传统规则进行基础识别
  const baseIdentification = identifyFileWithRules(filePath, fileName, isDirectory);

  // 如果启用AI且AI服务可用，则进行AI分析
  if (useAI && AIService.isAvailable() && fileSize !== undefined && lastModified !== undefined) {
    try {
      const aiRequest: AIAnalysisRequest = {
        filePath,
        fileName,
        fileSize,
        fileType: isDirectory ? 'directory' : 'file',
        lastModified,
        extension: fileExt,
        parentPath: filePath.substring(0, filePath.lastIndexOf('\\'))
      };

      const aiAnalysis = await AIService.analyzeFile(aiRequest);
      if (aiAnalysis) {
        // 结合AI分析结果优化识别结果
        return enhanceWithAIAnalysis(baseIdentification, aiAnalysis);
      }
    } catch (error) {
      console.error('AI分析失败，使用基础识别:', error);
    }
  }

  return baseIdentification;
};

/**
 * 使用传统规则进行文件识别
 */
const identifyFileWithRules = (filePath: string, fileName: string, isDirectory: boolean): FileIdentification => {
  const lowerName = fileName.toLowerCase();
  const fileExt = fileName.includes('.') ? '.' + fileName.split('.').pop()?.toLowerCase() : '';

  // 检查系统文件夹
  if (isDirectory && SYSTEM_FOLDERS[fileName]) {
    const info = SYSTEM_FOLDERS[fileName];
    return {
      name: fileName,
      type: 'folder',
      category: 'system',
      description: info.desc,
      canDelete: info.canDelete,
      reason: info.reason,
      recommendation: getRecommendation(info.canDelete, info.reason)
    };
  }
  
  // 检查软件文件夹
  if (isDirectory && SOFTWARE_FOLDERS[lowerName]) {
    const info = SOFTWARE_FOLDERS[lowerName];
    return {
      name: fileName,
      type: 'folder',
      category: 'software',
      description: info.desc,
      canDelete: info.canDelete,
      reason: info.reason,
      recommendation: getRecommendation(info.canDelete, info.reason)
    };
  }

  // 检查系统文件
  if (!isDirectory && SYSTEM_FILES[lowerName]) {
    const info = SYSTEM_FILES[lowerName];
    return {
      name: fileName,
      type: 'file',
      category: 'system',
      description: info.desc,
      canDelete: info.canDelete,
      reason: info.reason,
      recommendation: getRecommendation(info.canDelete, info.reason)
    };
  }

  // 检查文件扩展名
  if (!isDirectory && fileExt && FILE_EXTENSIONS[fileExt]) {
    const info = FILE_EXTENSIONS[fileExt];
    return {
      name: fileName,
      type: 'file',
      category: 'temp',
      description: info.desc,
      canDelete: info.canDelete,
      reason: info.reason,
      recommendation: getRecommendation(info.canDelete, info.reason)
    };
  }

  // 检查可疑模式
  if (!isDirectory) {
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.pattern.test(fileName)) {
        return {
          name: fileName,
          type: 'file',
          category: 'temp',
          description: pattern.desc,
          canDelete: pattern.canDelete,
          reason: pattern.reason,
          recommendation: getRecommendation(pattern.canDelete, pattern.reason)
        };
      }
    }
  }

  // 路径分析
  const pathAnalysis = analyzeFilePath(filePath, fileName, isDirectory);
  if (pathAnalysis) {
    return pathAnalysis;
  }

  // 未知文件
  return {
    name: fileName,
    type: isDirectory ? 'folder' : 'file',
    category: 'unknown',
    description: `未知${isDirectory ? '文件夹' : '文件'}`,
    canDelete: 'caution',
    reason: '无法识别此文件的用途',
    recommendation: '⚠️ 建议先备份，确认不需要后再删除'
  };
};

/**
 * 结合AI分析结果增强文件识别
 */
const enhanceWithAIAnalysis = (baseIdentification: FileIdentification, aiAnalysis: AIAnalysisResult): FileIdentification => {
  const enhanced = { ...baseIdentification, aiAnalysis };

  // 如果AI分析置信度高，优先使用AI的建议
  if (aiAnalysis.confidence > 0.8) {
    // 根据AI的风险等级调整canDelete
    switch (aiAnalysis.riskLevel) {
      case 'low':
        enhanced.canDelete = 'safe';
        break;
      case 'medium':
        enhanced.canDelete = 'caution';
        break;
      case 'high':
        enhanced.canDelete = 'dangerous';
        break;
      case 'critical':
        enhanced.canDelete = 'never';
        break;
    }

    // 更新描述和建议
    enhanced.description = `${baseIdentification.description} (AI: ${aiAnalysis.purpose})`;
    enhanced.reason = aiAnalysis.recommendations.join('; ') || baseIdentification.reason;
    enhanced.recommendation = generateEnhancedRecommendation(enhanced.canDelete, aiAnalysis);
  } else {
    // AI置信度较低时，保持保守策略
    if (baseIdentification.canDelete === 'safe' && aiAnalysis.riskLevel !== 'low') {
      enhanced.canDelete = 'caution';
      enhanced.recommendation = '⚠️ AI分析存在不确定性，建议谨慎处理';
    }
  }

  return enhanced;
};

/**
 * 生成增强的推荐信息
 */
const generateEnhancedRecommendation = (canDelete: string, aiAnalysis: AIAnalysisResult): string => {
  const baseRecommendation = getRecommendation(canDelete, '');
  const aiConfidence = Math.round(aiAnalysis.confidence * 100);
  const safetyScore = aiAnalysis.safetyScore;

  let enhancedRecommendation = baseRecommendation;

  if (aiAnalysis.recommendations.length > 0) {
    enhancedRecommendation += ` (AI建议: ${aiAnalysis.recommendations[0]})`;
  }

  enhancedRecommendation += ` [置信度: ${aiConfidence}%, 安全评分: ${safetyScore}]`;

  return enhancedRecommendation;
};

const analyzeFilePath = (filePath: string, fileName: string, isDirectory: boolean): FileIdentification | null => {
  const lowerPath = filePath.toLowerCase();
  
  // 临时目录
  if (lowerPath.includes('temp') || lowerPath.includes('tmp')) {
    return {
      name: fileName,
      type: isDirectory ? 'folder' : 'file',
      category: 'temp',
      description: '位于临时目录',
      canDelete: 'safe',
      reason: '临时目录中的文件通常可以安全删除',
      recommendation: '✅ 可安全删除'
    };
  }
  
  // 缓存目录
  if (lowerPath.includes('cache')) {
    return {
      name: fileName,
      type: isDirectory ? 'folder' : 'file',
      category: 'temp',
      description: '位于缓存目录',
      canDelete: 'safe',
      reason: '缓存文件可以重新生成',
      recommendation: '✅ 可安全删除'
    };
  }
  
  // 日志目录
  if (lowerPath.includes('log')) {
    return {
      name: fileName,
      type: isDirectory ? 'folder' : 'file',
      category: 'temp',
      description: '位于日志目录',
      canDelete: 'safe',
      reason: '日志文件通常可以删除',
      recommendation: '✅ 可安全删除'
    };
  }
  
  // 回收站
  if (lowerPath.includes('recycle')) {
    return {
      name: fileName,
      type: isDirectory ? 'folder' : 'file',
      category: 'system',
      description: '回收站相关文件',
      canDelete: 'caution',
      reason: '回收站文件，删除会清空回收站',
      recommendation: '⚠️ 谨慎删除'
    };
  }
  
  return null;
};

const getRecommendation = (canDelete: string, reason: string): string => {
  switch (canDelete) {
    case 'safe':
      return '✅ 可安全删除';
    case 'caution':
      return '⚠️ 建议检查后删除';
    case 'dangerous':
      return '❌ 高风险，不建议删除';
    case 'never':
      return '🚫 绝对不要删除';
    default:
      return '❓ 无法判断';
  }
};