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
  CURRENT_VERSION: '1.1.0',
  
  // 更新检查间隔（毫秒）
  CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24小时
  
  // 更新源配置（按优先级排序）
  UPDATE_SOURCES: [
    {
      name: '本地版本文件',
      url: '/version.json', // 本地静态文件，用于演示
      headers: {
        'Accept': 'application/json'
      },
      priority: 1,
      description: '本地版本信息，演示用'
    },
    {
      name: '官方更新API',
      url: 'https://your-domain.com/api/wincleaner/latest.json',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WinCleaner-UpdateChecker'
      },
      priority: 2,
      description: '官方更新API，需要部署后配置'
    },
    {
      name: 'GitHub Pages',
      url: 'https://Shawn-huang86.github.io/wincleaner-updates/latest.json', // 替换为你的实际用户名
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WinCleaner-UpdateChecker'
      },
      priority: 3,
      description: '静态托管，免费可靠'
    }
  ] as UpdateSource[],
  
  // 下载页面配置
  DOWNLOAD_PAGES: {
    official: 'https://wincleaner.com/download',
    backup: 'https://cdn.wincleaner.com/releases',
    direct: 'https://download.wincleaner.com/latest'
  },
  
  // 用户指南
  USER_GUIDE: {
    noAccount: {
      title: '无需GitHub账号',
      description: 'WinCleaner使用GitHub的公开API检查更新，任何用户都可以免费访问，无需注册GitHub账号。'
    },
    networkIssues: {
      title: '网络访问问题',
      solutions: [
        '尝试使用VPN或代理访问',
        '等待网络恢复后重试',
        '访问官方网站手动下载',
        '联系技术支持获取离线安装包'
      ]
    },
    downloadOptions: {
      title: '下载方式',
      options: [
        { name: 'GitHub Releases', url: 'github', description: '最新版本，全球CDN加速' },
        { name: 'Gitee 发布', url: 'gitee', description: '国内镜像，下载速度快' },
        { name: '官方网站', url: 'official', description: '官方下载，稳定可靠' }
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
