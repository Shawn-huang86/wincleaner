const { app, BrowserWindow, Menu, shell, ipcMain, dialog, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let tray;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    // icon: path.join(__dirname, 'assets', 'icon.png'), // 应用图标 - 暂时注释掉
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false, // 先不显示，等加载完成后再显示
  });

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // 开发模式下打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 如果是开发模式，聚焦窗口
    if (isDev) {
      mainWindow.focus();
    }
  });

  // 当窗口关闭时
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 创建系统托盘
function createTray() {
  // 暂时跳过托盘功能，避免图标问题
  return;
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  tray = new Tray(nativeImage.createFromPath(iconPath));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示 WinCleaner',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      }
    },
    {
      label: '快速扫描',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('quick-scan');
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('WinCleaner - 智能垃圾清理工具');
  tray.setContextMenu(contextMenu);
  
  // 双击托盘图标显示窗口
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建扫描',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-scan');
          }
        },
        {
          label: '导出报告',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('export-report');
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '工具',
      submenu: [
        {
          label: '基础清理',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('quick-scan');
          }
        },
        {
          label: '全面清理',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow.webContents.send('deep-scan');
          }
        },
        { type: 'separator' },
        {
          label: '设置',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于 WinCleaner',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于 WinCleaner',
              message: 'WinCleaner Pro',
              detail: '智能垃圾清理工具\n版本: 1.0.0\n\n安全、高效、智能的系统清理解决方案',
              buttons: ['确定']
            });
          }
        },
        {
          label: '检查更新',
          click: () => {
            shell.openExternal('https://github.com/your-username/wincleaner');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 应用准备就绪
app.whenReady().then(() => {
  createWindow();
  createMenu();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 通信处理
ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '保存清理报告',
    defaultPath: `清理报告_${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.txt`,
    filters: [
      { name: '文本文件', extensions: ['txt'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择要分析的文件',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: '所有文件', extensions: ['*'] }
    ]
  });
  return result;
});

// 显示通知
ipcMain.handle('show-notification', async (event, title, body) => {
  const { Notification } = require('electron');
  
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      icon: path.join(__dirname, 'assets', 'icon.png')
    });
    
    notification.show();
  }
});

// 应用信息
ipcMain.handle('get-app-info', async () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch
  };
});

// 文件操作相关的IPC处理器
// 扫描垃圾文件
ipcMain.handle('scan-junk-files', async (event, options) => {
  try {
    const result = await scanJunkFiles(options.paths, options.extensions, options.maxDepth);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error.message || '扫描失败'
    };
  }
});

// 删除文件到回收站
ipcMain.handle('delete-files', async (event, filePaths) => {
  try {
    const result = await deleteFilesToTrash(filePaths);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error.message || '删除失败'
    };
  }
});

// 获取系统临时目录
ipcMain.handle('get-temp-dirs', async () => {
  try {
    const tempDirs = getTempDirectories();
    return { success: true, data: tempDirs };
  } catch (error) {
    return {
      success: false,
      error: error.message || '获取临时目录失败'
    };
  }
});

// 检查文件是否存在
ipcMain.handle('file-exists', async (event, filePath) => {
  try {
    return { success: true, data: fs.existsSync(filePath) };
  } catch (error) {
    return { success: false, error: '检查文件失败' };
  }
});

// 获取文件信息
ipcMain.handle('get-file-info', async (event, filePath) => {
  try {
    const info = await getFileInfo(filePath);
    return { success: true, data: info };
  } catch (error) {
    return {
      success: false,
      error: error.message || '获取文件信息失败'
    };
  }
});

// 文件操作实现函数
/**
 * 扫描垃圾文件
 */
async function scanJunkFiles(scanPaths, extensions, maxDepth = 3) {
  const allFiles = [];
  let totalSize = 0;

  for (const scanPath of scanPaths) {
    if (fs.existsSync(scanPath)) {
      const files = await scanDirectory(scanPath, extensions, maxDepth, 0);
      allFiles.push(...files);
    }
  }

  totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);

  return {
    files: allFiles,
    totalSize
  };
}

/**
 * 递归扫描目录
 */
async function scanDirectory(dirPath, extensions, maxDepth, currentDepth) {
  const files = [];

  if (currentDepth >= maxDepth) {
    return files;
  }

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      try {
        if (entry.isDirectory()) {
          // 跳过系统关键目录
          if (isSystemCriticalDirectory(fullPath)) {
            continue;
          }

          // 递归扫描子目录
          const subFiles = await scanDirectory(fullPath, extensions, maxDepth, currentDepth + 1);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();

          // 检查文件扩展名或特殊文件名
          if (extensions.includes(ext) || isJunkFile(entry.name, fullPath)) {
            const stats = fs.statSync(fullPath);
            files.push({
              path: fullPath,
              name: entry.name,
              size: stats.size,
              type: 'file',
              lastModified: stats.mtime
            });
          }
        }
      } catch (error) {
        // 忽略权限错误等，继续处理其他文件
        console.warn(`无法访问文件: ${fullPath}`, error);
      }
    }
  } catch (error) {
    console.warn(`无法扫描目录: ${dirPath}`, error);
  }

  return files;
}

/**
 * 删除文件到回收站
 */
async function deleteFilesToTrash(filePaths) {
  const deletedFiles = [];
  const failedFiles = [];
  let totalSize = 0;

  for (const filePath of filePaths) {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        failedFiles.push({ path: filePath, error: '文件不存在' });
        continue;
      }

      // 安全检查
      if (!isSafeToDelete(filePath)) {
        failedFiles.push({ path: filePath, error: '文件位于系统关键目录，不允许删除' });
        continue;
      }

      // 获取文件大小
      const stats = fs.statSync(filePath);
      const fileSize = stats.isDirectory() ? await getDirectorySize(filePath) : stats.size;

      // 移动到回收站
      await shell.trashItem(filePath);

      deletedFiles.push(filePath);
      totalSize += fileSize;
    } catch (error) {
      failedFiles.push({
        path: filePath,
        error: error.message || '删除失败'
      });
    }
  }

  return {
    success: deletedFiles.length > 0,
    deletedFiles,
    failedFiles,
    totalSize
  };
}

/**
 * 获取系统临时目录列表
 */
function getTempDirectories() {
  const tempDirs = [];

  // 系统临时目录
  tempDirs.push(os.tmpdir());

  // Windows 特定的临时目录
  if (process.platform === 'win32') {
    const userProfile = os.homedir();

    tempDirs.push(
      path.join(userProfile, 'AppData', 'Local', 'Temp'),
      'C:\\Windows\\Temp',
      'C:\\Windows\\SoftwareDistribution\\Download',
      path.join(userProfile, 'AppData', 'Local', 'Microsoft', 'Windows', 'INetCache'),
      path.join(userProfile, 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'Cache'),
      path.join(userProfile, 'AppData', 'Local', 'Microsoft', 'Edge', 'User Data', 'Default', 'Cache')
    );
  }

  return tempDirs.filter(dir => fs.existsSync(dir));
}

/**
 * 获取文件信息
 */
async function getFileInfo(filePath) {
  const stats = fs.statSync(filePath);

  return {
    path: filePath,
    name: path.basename(filePath),
    size: stats.isDirectory() ? await getDirectorySize(filePath) : stats.size,
    type: stats.isDirectory() ? 'directory' : 'file',
    lastModified: stats.mtime
  };
}

/**
 * 计算目录大小
 */
async function getDirectorySize(dirPath) {
  let totalSize = 0;

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      try {
        if (entry.isDirectory()) {
          totalSize += await getDirectorySize(fullPath);
        } else if (entry.isFile()) {
          const stats = fs.statSync(fullPath);
          totalSize += stats.size;
        }
      } catch (error) {
        // 忽略权限错误
      }
    }
  } catch (error) {
    // 忽略权限错误
  }

  return totalSize;
}

/**
 * 检查是否为系统关键目录
 */
function isSystemCriticalDirectory(dirPath) {
  const lowerPath = dirPath.toLowerCase();

  const criticalDirs = [
    'c:\\windows\\system32',
    'c:\\windows\\syswow64',
    'c:\\program files',
    'c:\\program files (x86)',
    'c:\\boot',
    'c:\\recovery',
    'c:\\$recycle.bin',
    'c:\\system volume information'
  ];

  return criticalDirs.some(criticalDir => lowerPath.startsWith(criticalDir));
}

/**
 * 检查文件是否可以安全删除
 */
function isSafeToDelete(filePath) {
  const lowerPath = filePath.toLowerCase();

  // 系统关键文件和目录
  const criticalPaths = [
    'c:\\windows\\system32',
    'c:\\windows\\syswow64',
    'c:\\program files',
    'c:\\program files (x86)',
    'c:\\boot',
    'c:\\recovery'
  ];

  return !criticalPaths.some(criticalPath => lowerPath.startsWith(criticalPath));
}

/**
 * 检查是否为垃圾文件
 */
function isJunkFile(fileName, filePath) {
  const lowerName = fileName.toLowerCase();
  const lowerPath = filePath.toLowerCase();

  // 临时文件模式
  const junkPatterns = [
    /^~.*\.tmp$/,
    /^.*\.temp$/,
    /^.*\.bak$/,
    /^.*\.old$/,
    /^thumbs\.db$/,
    /^desktop\.ini$/,
    /^\.ds_store$/,
    /^.*\.log$/
  ];

  // 检查文件名模式
  if (junkPatterns.some(pattern => pattern.test(lowerName))) {
    return true;
  }

  // 检查是否在临时目录中
  const tempKeywords = ['temp', 'tmp', 'cache', 'log'];
  return tempKeywords.some(keyword => lowerPath.includes(keyword));
}
