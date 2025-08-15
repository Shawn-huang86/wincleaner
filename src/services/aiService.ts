import { AIConfig, AIAnalysisRequest, AIAnalysisResult, AIAppAnalysisResult, ApplicationInfo } from '../types';

/**
 * AI服务类 - 提供文件和应用的智能分析功能
 */
export class AIService {
  private static config: AIConfig = {
    provider: 'disabled',
    enabled: false,
    maxTokens: 1000,
    temperature: 0.1
  };

  private static cache = new Map<string, AIAnalysisResult>();
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时

  /**
   * 设置AI配置
   */
  static setConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  static getConfig(): AIConfig {
    return { ...this.config };
  }

  /**
   * 检查AI服务是否可用
   */
  static isAvailable(): boolean {
    return this.config.enabled && 
           this.config.provider !== 'disabled' && 
           (this.config.provider === 'local' || !!this.config.apiKey);
  }

  /**
   * 分析文件安全性和用途
   */
  static async analyzeFile(request: AIAnalysisRequest): Promise<AIAnalysisResult | null> {
    if (!this.isAvailable()) {
      return null;
    }

    // 检查缓存
    const cacheKey = this.getCacheKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.analysisTime.getTime() < this.CACHE_EXPIRY) {
      return cached;
    }

    try {
      const result = await this.performFileAnalysis(request);
      
      // 缓存结果
      if (result) {
        this.cache.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('AI文件分析失败:', error);
      return null;
    }
  }

  /**
   * 分析应用程序
   */
  static async analyzeApplication(app: ApplicationInfo): Promise<AIAppAnalysisResult | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      return await this.performAppAnalysis(app);
    } catch (error) {
      console.error('AI应用分析失败:', error);
      return null;
    }
  }

  /**
   * 分析软件残留项
   */
  static async analyzeSoftwareRemnant(remnant: {
    path: string;
    name: string;
    type: string;
    relatedSoftware: string;
    size?: number;
    lastModified?: Date;
  }): Promise<{
    confidence: number;
    riskLevel: 'safe' | 'caution' | 'dangerous';
    canDelete: boolean;
    reason: string;
    recommendations: string[];
  } | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const prompt = this.buildRemnantAnalysisPrompt(remnant);
      const response = await this.callAI(prompt);
      return this.parseRemnantAnalysisResponse(response);
    } catch (error) {
      console.error('AI残留分析失败:', error);
      return null;
    }
  }

  /**
   * 批量分析文件
   */
  static async analyzeFiles(requests: AIAnalysisRequest[]): Promise<Map<string, AIAnalysisResult>> {
    const results = new Map<string, AIAnalysisResult>();
    
    if (!this.isAvailable()) {
      return results;
    }

    // 分批处理，避免API限制
    const batchSize = 5;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(async (request) => {
        const result = await this.analyzeFile(request);
        if (result) {
          results.set(request.filePath, result);
        }
      });
      
      await Promise.all(batchPromises);
      
      // 添加延迟避免API限制
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * 执行文件分析
   */
  private static async performFileAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
    const prompt = this.buildFileAnalysisPrompt(request);
    const response = await this.callAI(prompt);
    return this.parseFileAnalysisResponse(response);
  }

  /**
   * 执行应用分析
   */
  private static async performAppAnalysis(app: ApplicationInfo): Promise<AIAppAnalysisResult> {
    const prompt = this.buildAppAnalysisPrompt(app);
    const response = await this.callAI(prompt);
    return this.parseAppAnalysisResponse(response);
  }

  /**
   * 构建文件分析提示词
   */
  private static buildFileAnalysisPrompt(request: AIAnalysisRequest): string {
    return `请分析以下文件的安全性和用途：

文件信息：
- 文件名: ${request.fileName}
- 文件路径: ${request.filePath}
- 文件大小: ${request.fileSize} 字节
- 文件类型: ${request.fileType}
- 最后修改时间: ${request.lastModified.toISOString()}
- 文件扩展名: ${request.extension || '无'}
- 父目录: ${request.parentPath || '未知'}

请以JSON格式返回分析结果，包含以下字段：
{
  "confidence": 0.95,
  "purpose": "文件用途描述",
  "riskLevel": "low|medium|high|critical",
  "safetyScore": 85,
  "dependencies": ["可能的依赖文件或程序"],
  "recommendations": ["具体的操作建议"],
  "analysisTime": "${new Date().toISOString()}"
}

请基于文件路径、名称、大小等信息判断：
1. 文件的主要用途
2. 删除该文件的风险等级
3. 是否为系统关键文件
4. 是否为临时文件或缓存
5. 具体的处理建议`;
  }

  /**
   * 构建应用分析提示词
   */
  private static buildAppAnalysisPrompt(app: ApplicationInfo): string {
    return `请分析以下应用程序的重要性和卸载风险：

应用信息：
- 应用名称: ${app.name}
- 版本: ${app.version}
- 发布商: ${app.publisher}
- 安装路径: ${app.installPath}
- 安装日期: ${app.installDate.toISOString()}
- 占用空间: ${app.size} 字节
- 是否系统应用: ${app.isSystemApp}
- 应用类别: ${app.category}

请以JSON格式返回分析结果：
{
  "importance": "critical|high|medium|low",
  "safeToUninstall": true,
  "dependencies": ["依赖的其他应用"],
  "usageFrequency": "daily|weekly|monthly|rarely|never",
  "systemImpact": "none|low|medium|high|critical",
  "recommendations": ["具体建议"],
  "alternativeApps": ["替代应用推荐"],
  "confidence": 0.9
}

请判断：
1. 应用的重要性等级
2. 卸载是否安全
3. 对系统的影响程度
4. 可能的依赖关系
5. 使用频率估计`;
  }

  /**
   * 构建软件残留分析提示词
   */
  private static buildRemnantAnalysisPrompt(remnant: {
    path: string;
    name: string;
    type: string;
    relatedSoftware: string;
    size?: number;
    lastModified?: Date;
  }): string {
    return `请分析以下软件残留项的安全性和清理建议：

残留项信息：
- 名称: ${remnant.name}
- 路径: ${remnant.path}
- 类型: ${remnant.type}
- 相关软件: ${remnant.relatedSoftware}
- 大小: ${remnant.size || 0} 字节
- 最后修改时间: ${remnant.lastModified?.toISOString() || '未知'}

请以JSON格式返回分析结果：
{
  "confidence": 0.95,
  "riskLevel": "safe|caution|dangerous",
  "canDelete": true,
  "reason": "详细的分析原因",
  "recommendations": ["具体的处理建议"]
}

请基于以下因素进行分析：
1. 文件/注册表项的位置和名称
2. 与已知软件的关联性
3. 删除的安全性和风险
4. 是否为真正的残留项
5. 推荐的处理方式`;
  }

  /**
   * 调用AI API
   */
  private static async callAI(prompt: string): Promise<string> {
    switch (this.config.provider) {
      case 'openai':
        return await this.callOpenAI(prompt);
      case 'claude':
        return await this.callClaude();
      case 'local':
        return await this.callLocalModel();
      default:
        throw new Error('未配置AI服务提供商');
    }
  }

  /**
   * 调用OpenAI API
   */
  private static async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的Windows系统文件和应用程序分析专家。请提供准确、安全的分析建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API错误: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * 调用Claude API
   */
  private static async callClaude(): Promise<string> {
    // Claude API实现
    throw new Error('Claude API暂未实现');
  }

  /**
   * 调用本地模型
   */
  private static async callLocalModel(): Promise<string> {
    // 本地模型实现（如Ollama）
    throw new Error('本地模型暂未实现');
  }

  /**
   * 解析文件分析响应
   */
  private static parseFileAnalysisResponse(response: string): AIAnalysisResult {
    try {
      const parsed = JSON.parse(response);
      return {
        confidence: parsed.confidence || 0.5,
        purpose: parsed.purpose || '未知用途',
        riskLevel: parsed.riskLevel || 'medium',
        safetyScore: parsed.safetyScore || 50,
        dependencies: parsed.dependencies || [],
        recommendations: parsed.recommendations || [],
        analysisTime: new Date(parsed.analysisTime || Date.now())
      };
    } catch (error) {
      console.error('解析AI响应失败:', error);
      return {
        confidence: 0.1,
        purpose: '解析失败',
        riskLevel: 'medium',
        safetyScore: 50,
        dependencies: [],
        recommendations: ['AI分析失败，请手动检查'],
        analysisTime: new Date()
      };
    }
  }

  /**
   * 解析应用分析响应
   */
  private static parseAppAnalysisResponse(response: string): AIAppAnalysisResult {
    try {
      const parsed = JSON.parse(response);
      return {
        importance: parsed.importance || 'medium',
        safeToUninstall: parsed.safeToUninstall !== false,
        dependencies: parsed.dependencies || [],
        usageFrequency: parsed.usageFrequency || 'rarely',
        systemImpact: parsed.systemImpact || 'low',
        recommendations: parsed.recommendations || [],
        alternativeApps: parsed.alternativeApps || [],
        confidence: parsed.confidence || 0.5
      };
    } catch (error) {
      console.error('解析AI响应失败:', error);
      return {
        importance: 'medium',
        safeToUninstall: false,
        dependencies: [],
        usageFrequency: 'rarely',
        systemImpact: 'medium',
        recommendations: ['AI分析失败，请手动检查'],
        alternativeApps: [],
        confidence: 0.1
      };
    }
  }

  /**
   * 解析软件残留分析响应
   */
  private static parseRemnantAnalysisResponse(response: string): {
    confidence: number;
    riskLevel: 'safe' | 'caution' | 'dangerous';
    canDelete: boolean;
    reason: string;
    recommendations: string[];
  } {
    try {
      const parsed = JSON.parse(response);
      return {
        confidence: parsed.confidence || 0.5,
        riskLevel: parsed.riskLevel || 'caution',
        canDelete: parsed.canDelete !== false,
        reason: parsed.reason || '未知原因',
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      console.error('解析AI残留分析响应失败:', error);
      return {
        confidence: 0.1,
        riskLevel: 'caution',
        canDelete: false,
        reason: 'AI分析失败，建议手动检查',
        recommendations: ['请手动验证此残留项的安全性']
      };
    }
  }

  /**
   * 生成缓存键
   */
  private static getCacheKey(request: AIAnalysisRequest): string {
    return `${request.filePath}_${request.fileSize}_${request.lastModified.getTime()}`;
  }

  /**
   * 清理过期缓存
   */
  static clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, result] of this.cache.entries()) {
      if (now - result.analysisTime.getTime() > this.CACHE_EXPIRY) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 清除指定缓存
   */
  static clearCacheByKey(cacheKey: string): void {
    this.cache.delete(cacheKey);
  }
}
