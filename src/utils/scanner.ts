import { ScanItem, ScanProgress, ChatFileSettings } from '../types';
import { formatFileSize } from './helpers';


const SCAN_ITEMS = [
  {
    name: 'Windows 临时文件',
    path: 'C:\\Windows\\Temp',
    type: '系统临时',
    category: 'system' as const,
    sizeBytes: 1200000000,
    riskLevel: 'safe' as const,
    suggestion: '✅ 可安全清理',
    isDeepScan: false
  },
  {
    name: 'Chrome 缓存',
    path: 'C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache',
    type: '浏览器缓存',
    category: 'browser' as const,
    sizeBytes: 800000000,
    riskLevel: 'safe' as const,
    suggestion: '✅ 可安全清理',
    isDeepScan: false
  },
  {
    name: '用户临时文件',
    path: 'C:\\Users\\User\\AppData\\Local\\Temp',
    type: '用户临时',
    category: 'user' as const,
    sizeBytes: 500000000,
    riskLevel: 'safe' as const,
    suggestion: '✅ 可安全清理',
    isDeepScan: false
  },
  {
    name: 'Edge 缓存',
    path: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache',
    type: '浏览器缓存',
    category: 'browser' as const,
    sizeBytes: 300000000,
    riskLevel: 'safe' as const,
    suggestion: '✅ 可安全清理',
    isDeepScan: false
  },
  {
    name: '下载文件夹 (多个 .exe)',
    path: 'C:\\Users\\User\\Downloads',
    type: '用户文件',
    category: 'downloads' as const,
    sizeBytes: 2000000000,
    riskLevel: 'caution' as const,
    suggestion: '⚠️ 建议检查后清理',
    isDeepScan: false
  },
  {
    name: '注册表残留: Adobe Reader',
    path: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Adobe\\Acrobat Reader',
    type: '注册表',
    category: 'registry' as const,
    sizeBytes: 0,
    riskLevel: 'caution' as const,
    suggestion: '⚠️ 可清理注册表项',
    isDeepScan: false
  },
  {
    name: '系统缓存文件',
    path: 'C:\\Windows\\SoftwareDistribution\\Download',
    type: '系统缓存',
    category: 'system' as const,
    sizeBytes: 700000000,
    riskLevel: 'caution' as const,
    suggestion: '⚠️ 建议清理',
    isDeepScan: false
  },
  {
    name: '休眠文件 (hiberfil.sys)',
    path: 'C:\\hiberfil.sys',
    type: '系统文件',
    category: 'system' as const,
    sizeBytes: 4000000000,
    riskLevel: 'high' as const,
    suggestion: '❌ 高风险，谨慎操作',
    isDeepScan: true
  },
  {
    name: '页面文件 (pagefile.sys)',
    path: 'C:\\pagefile.sys',
    type: '系统文件',
    category: 'system' as const,
    sizeBytes: 8000000000,
    riskLevel: 'high' as const,
    suggestion: '❌ 高风险，不建议删除',
    isDeepScan: true
  },
  {
    name: 'Windows.old 升级备份',
    path: 'C:\\Windows.old',
    type: '系统备份',
    category: 'backup' as const,
    sizeBytes: 15000000000,
    riskLevel: 'caution' as const,
    suggestion: '⚠️ 升级备份，可清理',
    isDeepScan: true
  },
  // 微信清理项目
  {
    name: '微信聊天记录缓存',
    path: 'C:\\Users\\User\\Documents\\WeChat Files\\wxid_xxx\\FileStorage\\Cache',
    type: '聊天缓存',
    category: 'wechat' as const,
    sizeBytes: 1500000000,
    riskLevel: 'safe' as const,
    suggestion: '✅ 可安全清理',
    isDeepScan: true  // 改为 true，只在深度扫描或微信专项清理中出现
  },
  {
    name: '微信图片缓存',
    path: 'C:\\Users\\User\\Documents\\WeChat Files\\wxid_xxx\\FileStorage\\Image',
    type: '图片缓存',
    category: 'wechat' as const,
    sizeBytes: 2800000000,
    riskLevel: 'caution' as const,
    suggestion: '⚠️ 包含聊天图片，建议备份后清理',
    isDeepScan: true  // 改为 true
  },
  {
    name: '微信视频缓存',
    path: 'C:\\Users\\User\\Documents\\WeChat Files\\wxid_xxx\\FileStorage\\Video',
    type: '视频缓存',
    category: 'wechat' as const,
    sizeBytes: 4200000000,
    riskLevel: 'caution' as const,
    suggestion: '⚠️ 包含聊天视频，建议备份后清理',
    isDeepScan: true  // 改为 true
  },
  {
    name: '微信临时文件',
    path: 'C:\\Users\\User\\AppData\\Roaming\\Tencent\\WeChat\\Temp',
    type: '临时文件',
    category: 'wechat' as const,
    sizeBytes: 800000000,
    riskLevel: 'safe' as const,
    suggestion: '✅ 可安全清理',
    isDeepScan: true  // 改为 true，确保基础清理不包含
  },
  {
    name: '微信日志文件',
    path: 'C:\\Users\\User\\Documents\\WeChat Files\\wxid_xxx\\Logs',
    type: '日志文件',
    category: 'wechat' as const,
    sizeBytes: 300000000,
    riskLevel: 'safe' as const,
    suggestion: '✅ 可安全清理',
    isDeepScan: true  // 改为 true
  },
  {
    name: '微信小程序缓存',
    path: 'C:\\Users\\User\\Documents\\WeChat Files\\Applet',
    type: '小程序缓存',
    category: 'wechat' as const,
    sizeBytes: 600000000,
    riskLevel: 'safe' as const,
    suggestion: '✅ 可安全清理',
    isDeepScan: true  // 改为 true
  },
  // QQ清理项目
  {
    name: 'QQ聊天记录缓存',
    path: 'C:\\Users\\User\\Documents\\Tencent Files\\QQ号码\\FileRecv',
    type: '聊天缓存',
    category: 'qq' as const,
    sizeBytes: 1200000000,
    riskLevel: 'caution' as const,
    suggestion: '⚠️ 包含接收文件，建议检查后清理',
    isDeepScan: true  // 改为 true，只在深度扫描或QQ专项清理中出现
  },
  {
    name: 'QQ图片缓存',
    path: 'C:\\Users\\User\\Documents\\Tencent Files\\QQ号码\\Image',
    type: '图片缓存',
    category: 'qq' as const,
    sizeBytes: 2100000000,
    riskLevel: 'caution' as const,
    suggestion: '⚠️ 包含聊天图片，建议备份后清理',
    isDeepScan: true  // 改为 true
  },
  {
    name: 'QQ临时文件',
    path: 'C:\\Users\\User\\AppData\\Roaming\\Tencent\\QQ\\Temp',
    type: '临时文件',
    category: 'qq' as const,
    sizeBytes: 500000000,
    riskLevel: 'safe' as const,
    suggestion: '✅ 可安全清理',
    isDeepScan: true  // 改为 true，确保基础清理不包含
  },
  {
    name: 'QQ表情包缓存',
    path: 'C:\\Users\\User\\Documents\\Tencent Files\\QQ号码\\CustomFace',
    type: '表情缓存',
    category: 'qq' as const,
    sizeBytes: 800000000,
    riskLevel: 'safe' as const,
    suggestion: '✅ 可安全清理',
    isDeepScan: true  // 改为 true
  },
  {
    name: 'QQ语音缓存',
    path: 'C:\\Users\\User\\Documents\\Tencent Files\\QQ号码\\Audio',
    type: '语音缓存',
    category: 'qq' as const,
    sizeBytes: 400000000,
    riskLevel: 'caution' as const,
    suggestion: '⚠️ 包含语音消息，建议备份后清理',
    isDeepScan: true  // 改为 true
  },
  {
    name: 'QQ游戏缓存',
    path: 'C:\\Users\\User\\AppData\\Roaming\\Tencent\\QQGame',
    type: '游戏缓存',
    category: 'qq' as const,
    sizeBytes: 1500000000,
    riskLevel: 'safe' as const,
    suggestion: '✅ 可安全清理',
    isDeepScan: true  // 改为 true
  },
  {
    name: 'QQ浏览器缓存',
    path: 'C:\\Users\\User\\AppData\\Roaming\\Tencent\\QQBrowser\\User Data\\Default\\Cache',
    type: '浏览器缓存',
    category: 'qq' as const,
    sizeBytes: 900000000,
    riskLevel: 'safe' as const,
    suggestion: '✅ 可安全清理',
    isDeepScan: true  // 改为 true
  }
];

// 检查文件是否应该被时间筛选排除
const shouldExcludeByTime = (item: Pick<ScanItem, 'category' | 'type'>, chatSettings: ChatFileSettings): boolean => {
  const isChatFile = item.category === 'wechat' || item.category === 'qq';
  if (!isChatFile) return false;

  // 临时文件和日志文件不受时间限制影响
  if (item.type === '临时文件' || item.type === '日志文件') return false;

  const monthsToKeep = item.category === 'wechat' ? chatSettings.wechatMonths : chatSettings.qqMonths;
  if (monthsToKeep === 0) return false; // 不保留，清理全部

  // 模拟文件时间（实际应用中应该读取真实文件时间）
  const now = new Date();
  const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsToKeep, now.getDate());

  // 为演示目的，随机生成一些文件时间
  const randomDaysAgo = Math.floor(Math.random() * 365); // 0-365天前
  const fileDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);

  return fileDate > cutoffDate; // 如果文件比截止日期新，则排除（不清理）
};

export const simulateScanning = async (
  setProgress: (progress: ScanProgress) => void,
  setResults: (results: ScanItem[]) => void,
  deepScan: boolean,
  chatSettings: ChatFileSettings = { wechatMonths: 3, qqMonths: 3 },
  scanType: 'all' | 'chat-only' | 'exclude-chat' = 'exclude-chat'
): Promise<void> => {
  let itemsToScan = SCAN_ITEMS.filter(item => !item.isDeepScan || deepScan);

  // 根据扫描类型过滤项目
  if (scanType === 'chat-only') {
    // 只扫描微信QQ文件
    itemsToScan = itemsToScan.filter(item => item.category === 'wechat' || item.category === 'qq');
  } else if (scanType === 'exclude-chat') {
    // 排除微信QQ文件
    itemsToScan = itemsToScan.filter(item => item.category !== 'wechat' && item.category !== 'qq');
  }
  // scanType === 'all' 时不过滤

  const results: ScanItem[] = [];
  let itemIdCounter = 0; // 独立的ID计数器

  for (let i = 0; i < itemsToScan.length; i++) {
    const item = itemsToScan[i];

    setProgress({
      current: i + 1,
      total: itemsToScan.length,
      currentItem: item.name
    });

    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    // Add some randomness to make it more realistic
    if (Math.random() > 0.1) { // 90% chance to find the item
      const newId = `item-${itemIdCounter++}`;

      // 检查是否应该被时间筛选排除
      if (shouldExcludeByTime(item, chatSettings)) {
        // 被时间筛选排除的文件，更新建议信息
        const monthsToKeep = item.category === 'wechat' ? chatSettings.wechatMonths : chatSettings.qqMonths;
        results.push({
          id: newId, // 使用独立计数器
          name: item.name,
          path: item.path,
          size: formatFileSize(item.sizeBytes),
          sizeBytes: item.sizeBytes,
          type: item.type,
          category: item.category,
          riskLevel: 'safe',
          suggestion: `🛡️ 受时间保护（保留最近${monthsToKeep}个月）`,
          lastModified: new Date(Date.now() - Math.random() * monthsToKeep * 30 * 24 * 60 * 60 * 1000),
          isChatFile: true,
          canDelete: false // 受时间保护的文件不能删除
        });
      } else {
        // 生成随机的文件修改时间
        const randomDaysAgo = Math.floor(Math.random() * 365);
        const lastModified = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000);

        results.push({
          id: newId, // 使用独立计数器
          name: item.name,
          path: item.path,
          size: formatFileSize(item.sizeBytes),
          sizeBytes: item.sizeBytes,
          type: item.type,
          category: item.category,
          riskLevel: item.riskLevel,
          suggestion: item.suggestion,
          lastModified,
          isChatFile: item.category === 'wechat' || item.category === 'qq',
          canDelete: item.riskLevel !== 'high' // 高风险文件不能删除
        });
      }
    }

    setResults([...results]);
  }
};

// Deprecated: use utils/helpers.formatFileSize instead to keep formatting consistent across app
export { formatFileSize } from './helpers';

