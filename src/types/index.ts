export interface ScanItem {
  id: string;
  name: string;
  path: string;
  size: string;
  sizeBytes: number;
  type: string;
  category: 'system' | 'browser' | 'user' | 'registry' | 'backup' | 'downloads' | 'wechat' | 'qq';
  riskLevel: 'safe' | 'caution' | 'high' | 'unknown';
  suggestion: string;
  lastModified?: Date;
  isChatFile?: boolean;
  canDelete?: boolean; // 是否可以删除，默认根据riskLevel判断
}

export interface ScanProgress {
  current: number;
  total: number;
  currentItem: string;
}

export interface CleaningProgress {
  current: number;
  total: number;
}

export interface CategoryStats {
  category: string;
  displayName: string;
  count: number;
  totalSize: number;
  icon: string;
  color: string;
}

export interface ChatFileSettings {
  wechatMonths: number;
  qqMonths: number;
}

// AI分析相关类型定义
export interface AIAnalysisResult {
  confidence: number; // 0-1之间，表示AI分析的置信度
  purpose: string; // AI识别的文件用途
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  safetyScore: number; // 0-100，安全评分
  dependencies: string[]; // 可能的依赖关系
  recommendations: string[]; // AI建议
  analysisTime: Date; // 分析时间
}

export interface AIConfig {
  provider: 'openai' | 'claude' | 'local' | 'disabled';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  enabled: boolean;
}

export interface AIAnalysisRequest {
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: 'file' | 'directory';
  lastModified: Date;
  extension?: string;
  parentPath?: string;
  fileContent?: string; // 对于小文件，可能包含部分内容
}

export interface ApplicationInfo {
  name: string;
  version: string;
  publisher: string;
  installPath: string;
  installDate: Date;
  size: number;
  uninstallString?: string;
  isSystemApp: boolean;
  category: string;
  aiAnalysis?: AIAppAnalysisResult;
}

export interface AIAppAnalysisResult {
  importance: 'critical' | 'high' | 'medium' | 'low';
  safeToUninstall: boolean;
  dependencies: string[];
  usageFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
  systemImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  alternativeApps: string[];
  confidence: number;
}