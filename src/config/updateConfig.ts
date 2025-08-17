/**
 * 应用更新配置
 * 管理更新源、版本信息等配置
 */

export interface UpdateSource {
  name: string;
  url: string;
  headers?: Record<string, string>;
  priority: number; // 优先级，数字越小优先级越高
  description: string;
}

export const UPDATE_CONFIG = {
  // 当前版本（应该从package.json自动读取）
  CURRENT_VERSION: '1.3.2', // 修复基础清理功能重叠问题
  
  // 更新检查间隔（毫秒）
  CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24小时
  
  // 更新源配置（按优先级排序）
  UPDATE_SOURCES: [
    {
      name: 'GitHub Releases API',
      url: 'https://api.github.com/repos/Shawn-huang86/wincleaner/releases/latest',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'WinCleaner-UpdateChecker'
      },
      priority: 1,
      description: 'GitHub官方API，实时获取最新版本'
    },
    {
      name: 'GitHub Releases (备用)',
      url: 'https://api.github.com/repos/Shawn-huang86/wincleaner/releases',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'WinCleaner-UpdateChecker'
      },
      priority: 2,
      description: 'GitHub API备用源，获取所有版本'
    },
    {
      name: '本地版本文件',
      url: '/version.json', // 本地静态文件，用于演示和备用
      headers: {
        'Accept': 'application/json'
      },
      priority: 3,
      description: '本地备用版本信息'
    }
  ] as UpdateSource[],
  
  // 下载页面配置
  DOWNLOAD_PAGES: {
    github: 'https://github.com/Shawn-huang86/wincleaner/releases', // GitHub Releases页面
    official: 'https://github.com/Shawn-huang86/wincleaner/releases/latest', // 最新版本页面
    backup: 'https://github.com/Shawn-huang86/wincleaner' // 主项目页面
  },
  
  // 用户指南
  USER_GUIDE: {
    noAccount: {
      title: '✅ 无需GitHub账号',
      description: 'WinCleaner使用GitHub Pages公开服务检查更新，任何用户都可以免费访问，无需注册GitHub账号。'
    },
    networkIssues: {
      title: '🌐 网络访问问题',
      solutions: [
        '应用会自动尝试多个更新源',
        '如果主源不可用，会自动切换到备用源',
        '支持全球CDN加速访问',
        '如仍有问题，请检查网络连接'
      ]
    },
    downloadOptions: {
      title: '📥 下载方式',
      options: [
        { name: 'GitHub Releases', url: 'github', description: '官方发布页面，最新版本' },
        { name: '官方页面', url: 'official', description: '项目主页，稳定可靠' },
        { name: 'CDN备用', url: 'backup', description: 'CDN加速，高速下载' }
      ]
    }
  }
};

/**
 * 获取适合当前网络环境的更新源
 */
export const getBestUpdateSource = async (): Promise<UpdateSource | null> => {
  const sources = UPDATE_CONFIG.UPDATE_SOURCES.sort((a, b) => a.priority - b.priority);
  
  for (const source of sources) {
    try {
      // 简单的连通性测试
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
      
      const response = await fetch(source.url, {
        method: 'HEAD',
        headers: source.headers || {},
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ 最佳更新源: ${source.name}`);
        return source;
      }
    } catch (error) {
      console.warn(`❌ 更新源不可用: ${source.name}`, error);
    }
  }
  
  console.warn('⚠️ 所有更新源都不可用');
  return null;
};

/**
 * 获取推荐的下载页面
 */
export const getRecommendedDownloadPage = (preferredSource?: string): string => {
  if (preferredSource && UPDATE_CONFIG.DOWNLOAD_PAGES[preferredSource as keyof typeof UPDATE_CONFIG.DOWNLOAD_PAGES]) {
    return UPDATE_CONFIG.DOWNLOAD_PAGES[preferredSource as keyof typeof UPDATE_CONFIG.DOWNLOAD_PAGES];
  }
  
  // 默认返回GitHub
  return UPDATE_CONFIG.DOWNLOAD_PAGES.github;
};
