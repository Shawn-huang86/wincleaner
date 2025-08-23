/**
 * 许可证管理器 - 处理免费和收费功能的访问控制
 */

export interface LicenseInfo {
  isActivated: boolean;
  licenseType: 'free' | 'premium' | 'trial';
  expiryDate?: Date;
  activationDate?: Date;
  licenseKey?: string;
  trialDaysRemaining?: number;
}

export interface FeatureAccess {
  basicCleaning: boolean;      // 基础清理 (浏览器缓存 + 用户临时文件)
  appManagement: boolean;      // 应用管理
  systemCleaning: boolean;     // 系统清理 (Windows临时文件、系统缓存等)
  registryCleaning: boolean;   // 注册表清理
  downloadsCleaning: boolean;  // 下载文件清理
  chatCleaning: boolean;       // 聊天清理 (微信、QQ)
  specialCleaning: boolean;    // 专项清理
  cDriveCleaning: boolean;     // C盘专清
  deepScan: boolean;           // 深度扫描
  aiAnalysis: boolean;         // AI智能分析
}

class LicenseManager {
  private static instance: LicenseManager;
  private licenseInfo: LicenseInfo;
  private readonly TRIAL_DAYS = 7; // 试用期天数

  private constructor() {
    this.licenseInfo = this.loadLicenseInfo();
  }

  public static getInstance(): LicenseManager {
    if (!LicenseManager.instance) {
      LicenseManager.instance = new LicenseManager();
    }
    return LicenseManager.instance;
  }

  /**
   * 获取当前许可证信息
   */
  public getLicenseInfo(): LicenseInfo {
    return { ...this.licenseInfo };
  }

  /**
   * 检查功能访问权限 - 种子用户阶段，所有功能免费开放
   */
  public getFeatureAccess(): FeatureAccess {
    // 种子用户阶段：所有功能都免费开放
    return {
      basicCleaning: true,      // 基础清理
      appManagement: true,      // 应用管理
      systemCleaning: true,     // 系统清理
      registryCleaning: true,   // 注册表清理
      downloadsCleaning: true,  // 下载文件清理
      chatCleaning: true,       // 聊天清理
      specialCleaning: true,    // 专项清理
      cDriveCleaning: true,     // C盘专清
      deepScan: true,           // 深度扫描
      aiAnalysis: true          // AI智能分析
    };
  }

  /**
   * 检查特定功能是否可用
   */
  public canAccessFeature(feature: keyof FeatureAccess): boolean {
    const access = this.getFeatureAccess();
    return access[feature];
  }

  /**
   * 激活许可证
   */
  public async activateLicense(licenseKey: string): Promise<{ success: boolean; message: string }> {
    try {
      // 这里应该调用服务器验证许可证
      const isValid = await this.validateLicenseKey(licenseKey);
      
      if (isValid) {
        this.licenseInfo = {
          isActivated: true,
          licenseType: 'premium',
          activationDate: new Date(),
          licenseKey: licenseKey
        };
        this.saveLicenseInfo();
        return { success: true, message: '许可证激活成功！' };
      } else {
        return { success: false, message: '无效的许可证密钥' };
      }
    } catch (error) {
      return { success: false, message: '激活失败，请检查网络连接' };
    }
  }

  /**
   * 开始试用
   */
  public startTrial(): { success: boolean; message: string } {
    if (this.licenseInfo.licenseType === 'trial') {
      return { success: false, message: '试用期已开始' };
    }

    if (this.licenseInfo.isActivated) {
      return { success: false, message: '已激活的用户无需试用' };
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.TRIAL_DAYS);

    this.licenseInfo = {
      isActivated: false,
      licenseType: 'trial',
      activationDate: new Date(),
      expiryDate: expiryDate,
      trialDaysRemaining: this.TRIAL_DAYS
    };

    this.saveLicenseInfo();
    return { success: true, message: `试用期已开始，有效期 ${this.TRIAL_DAYS} 天` };
  }

  /**
   * 获取试用剩余天数
   */
  public getTrialDaysRemaining(): number {
    if (this.licenseInfo.licenseType !== 'trial' || !this.licenseInfo.expiryDate) {
      return 0;
    }

    const now = new Date();
    const expiry = new Date(this.licenseInfo.expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  /**
   * 检查试用是否有效
   */
  private isTrialValid(): boolean {
    if (this.licenseInfo.licenseType !== 'trial') {
      return false;
    }

    return this.getTrialDaysRemaining() > 0;
  }

  /**
   * 验证许可证密钥（模拟）
   */
  private async validateLicenseKey(licenseKey: string): Promise<boolean> {
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 简单的验证逻辑（实际应用中应该调用服务器API）
    const validKeys = [
      'WINCLEANER-PREMIUM-2024',
      'WC-PRO-LIFETIME-KEY',
      'DEMO-LICENSE-KEY-123'
    ];
    
    return validKeys.includes(licenseKey.toUpperCase());
  }

  /**
   * 加载许可证信息
   */
  private loadLicenseInfo(): LicenseInfo {
    try {
      const stored = localStorage.getItem('wincleaner_license');
      if (stored) {
        const parsed = JSON.parse(stored);
        // 转换日期字符串为Date对象
        if (parsed.expiryDate) {
          parsed.expiryDate = new Date(parsed.expiryDate);
        }
        if (parsed.activationDate) {
          parsed.activationDate = new Date(parsed.activationDate);
        }
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load license info:', error);
    }

    // 默认免费版本
    return {
      isActivated: false,
      licenseType: 'free'
    };
  }

  /**
   * 保存许可证信息
   */
  private saveLicenseInfo(): void {
    try {
      localStorage.setItem('wincleaner_license', JSON.stringify(this.licenseInfo));
    } catch (error) {
      console.warn('Failed to save license info:', error);
    }
  }

  /**
   * 重置许可证（用于测试）
   */
  public resetLicense(): void {
    this.licenseInfo = {
      isActivated: false,
      licenseType: 'free'
    };
    this.saveLicenseInfo();
  }

  /**
   * 获取功能限制提示信息
   */
  public getFeatureLimitMessage(feature: keyof FeatureAccess): string {
    if (this.canAccessFeature(feature)) {
      return '';
    }

    const trialDays = this.getTrialDaysRemaining();
    if (trialDays > 0) {
      return `试用期剩余 ${trialDays} 天`;
    }

    return '此功能需要升级到高级版本';
  }
}

export default LicenseManager;
