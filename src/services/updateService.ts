/**
 * 应用更新服务
 * 负责检查应用更新、版本比较、下载更新等功能
 */

import { UPDATE_CONFIG, getBestUpdateSource, getRecommendedDownloadPage } from '../config/updateConfig';

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  downloadUrl: string;
  releaseNotes: string[];
  isRequired: boolean;
  fileSize: number;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  updateInfo?: UpdateInfo;
  error?: string;
}

export class UpdateService {
  
  /**
   * 检查应用更新
   */
  static async checkForUpdates(): Promise<UpdateCheckResult> {
    try {
      console.log('🔍 检查应用更新...');
      
      // 获取当前版本
      const currentVersion = await this.getCurrentVersion();
      
      // 获取最新版本信息
      const latestRelease = await this.fetchLatestRelease();
      
      if (!latestRelease) {
        return {
          hasUpdate: false,
          currentVersion,
          error: '无法获取最新版本信息'
        };
      }
      
      const latestVersion = this.extractVersion(latestRelease);
      const hasUpdate = this.compareVersions(currentVersion, latestVersion) < 0;
      
      console.log(`📋 版本检查结果: 当前=${currentVersion}, 最新=${latestVersion}, 有更新=${hasUpdate}`);
      
      if (hasUpdate) {
        const updateInfo: UpdateInfo = {
          version: latestVersion,
          releaseDate: latestRelease.releaseDate || latestRelease.published_at || new Date().toISOString(),
          downloadUrl: this.getDownloadUrl(latestRelease),
          releaseNotes: this.parseReleaseNotes(latestRelease),
          isRequired: latestRelease.isRequired || this.isRequiredUpdate(currentVersion, latestVersion),
          fileSize: latestRelease.fileSize || this.getAssetSize(latestRelease)
        };
        
        return {
          hasUpdate: true,
          currentVersion,
          latestVersion,
          updateInfo
        };
      }
      
      return {
        hasUpdate: false,
        currentVersion,
        latestVersion
      };
      
    } catch (error) {
      console.error('检查更新失败:', error);
      return {
        hasUpdate: false,
        currentVersion: UPDATE_CONFIG.CURRENT_VERSION,
        error: error instanceof Error ? error.message : '检查更新失败'
      };
    }
  }
  
  /**
   * 获取当前应用版本
   */
  private static async getCurrentVersion(): Promise<string> {
    try {
      // 在Electron环境中获取版本
      if (typeof window !== 'undefined' && window.electronAPI) {
        const appInfo = await window.electronAPI.getAppInfo();
        return appInfo.version;
      }
      
      // 浏览器环境返回默认版本
      return UPDATE_CONFIG.CURRENT_VERSION;
    } catch (error) {
      console.warn('获取当前版本失败，使用默认版本:', error);
      return UPDATE_CONFIG.CURRENT_VERSION;
    }
  }
  
  /**
   * 获取最新发布信息
   */
  private static async fetchLatestRelease(): Promise<any> {
    const sources = UPDATE_CONFIG.UPDATE_SOURCES.sort((a, b) => a.priority - b.priority);

    for (const source of sources) {
      console.log(`🔄 尝试更新源: ${source.name} - ${source.description}`);
      const release = await this.tryFetchFromUrl(source.url, source.headers);
      if (release) {
        console.log(`✅ 成功获取更新信息: ${source.name}`);
        return release;
      }
    }

    console.warn('⚠️ 所有更新源都无法访问');
    return null;
  }

  /**
   * 尝试从指定URL获取发布信息
   */
  private static async tryFetchFromUrl(url: string, headers: Record<string, string> = {}): Promise<any> {
    try {
      console.log(`🌐 检查更新源: ${url}`);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WinCleaner-UpdateChecker',
          ...headers
        },
        timeout: 10000 // 10秒超时
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ 成功获取更新信息: ${url}`);
      return data;
    } catch (error) {
      console.warn(`❌ 更新源访问失败 ${url}:`, error);
      return null;
    }
  }
  
  /**
   * 比较版本号
   * @returns -1: current < latest, 0: equal, 1: current > latest
   */
  private static compareVersions(current: string, latest: string): number {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    
    const maxLength = Math.max(currentParts.length, latestParts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;
      
      if (currentPart < latestPart) return -1;
      if (currentPart > latestPart) return 1;
    }
    
    return 0;
  }
  
  /**
   * 提取版本号（支持多种API格式）
   */
  private static extractVersion(release: any): string {
    // 自定义API格式
    if (release.version) {
      return release.version.replace(/^v/, '');
    }

    // GitHub API格式
    if (release.tag_name) {
      return release.tag_name.replace(/^v/, '');
    }

    // 其他格式
    return release.name?.replace(/^v/, '') || '0.0.0';
  }

  /**
   * 获取下载链接
   */
  private static getDownloadUrl(release: any): string {
    // 自定义API格式
    if (release.downloadUrl) {
      return release.downloadUrl;
    }

    // GitHub API格式
    if (release.assets) {
      const windowsAsset = release.assets.find((asset: any) =>
        asset.name.includes('Setup') && asset.name.includes('.exe')
      );
      return windowsAsset?.browser_download_url || release.html_url;
    }

    // 默认返回HTML页面
    return release.html_url || getRecommendedDownloadPage();
  }
  
  /**
   * 解析更新说明（支持多种格式）
   */
  private static parseReleaseNotes(release: any): string[] {
    // 自定义API格式
    if (Array.isArray(release.releaseNotes)) {
      return release.releaseNotes.slice(0, 5);
    }

    // GitHub API格式
    if (typeof release.body === 'string') {
      const lines = release.body.split('\n')
        .filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'))
        .map(line => line.replace(/^[\s\-\*]+/, '').trim())
        .filter(line => line.length > 0);

      return lines.length > 0 ? lines.slice(0, 5) : ['查看完整更新说明'];
    }

    return ['查看完整更新说明'];
  }
  
  /**
   * 判断是否为必需更新
   */
  private static isRequiredUpdate(current: string, latest: string): boolean {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    
    // 如果主版本号不同，则为必需更新
    return currentParts[0] < latestParts[0];
  }
  
  /**
   * 获取安装包大小
   */
  private static getAssetSize(release: any): number {
    // 自定义API格式
    if (release.fileSize) {
      return release.fileSize;
    }

    // GitHub API格式
    if (release.assets) {
      const windowsAsset = release.assets.find((asset: any) =>
        asset.name.includes('Setup') && asset.name.includes('.exe')
      );
      return windowsAsset?.size || 0;
    }

    return 0;
  }
  
  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '未知大小';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
  }
  
  /**
   * 打开下载页面
   */
  static async openDownloadPage(downloadUrl: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        // 在Electron中打开外部链接
        await window.electronAPI.openExternal(downloadUrl);
      } else {
        // 在浏览器中打开
        window.open(downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('打开下载页面失败:', error);
      // 备用方案：复制链接到剪贴板
      this.copyToClipboard(downloadUrl);
    }
  }

  /**
   * 复制文本到剪贴板
   */
  private static async copyToClipboard(text: string): Promise<void> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        console.log('✅ 下载链接已复制到剪贴板');
        // 可以在这里显示一个提示
      }
    } catch (error) {
      console.warn('复制到剪贴板失败:', error);
    }
  }
  
  /**
   * 自动检查更新（应用启动时调用）
   */
  static async autoCheckForUpdates(): Promise<UpdateCheckResult | null> {
    try {
      // 检查上次检查时间，避免频繁检查
      const lastCheck = localStorage.getItem('lastUpdateCheck');
      const now = Date.now();
      
      if (lastCheck && (now - parseInt(lastCheck)) < UPDATE_CONFIG.CHECK_INTERVAL) {
        // 24小时内已检查过，跳过
        return null;
      }
      
      const result = await this.checkForUpdates();
      localStorage.setItem('lastUpdateCheck', now.toString());
      
      return result;
    } catch (error) {
      console.error('自动检查更新失败:', error);
      return null;
    }
  }
}
