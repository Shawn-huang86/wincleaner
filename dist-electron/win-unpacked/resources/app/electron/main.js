const { app, BrowserWindow, Menu, shell, ipcMain, dialog, Tray, nativeImage, autoUpdater } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');
const { exec } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';
const log = require('electron-log');

// 配置自动更新日志
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// 自动更新事件处理
autoUpdater.on('checking-for-update', () => {
  log.info('正在检查更新...');
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'checking' });
  }
});

autoUpdater.on('update-available', (info) => {
  log.info('发现新版本:', info);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'available', info });
  }
});

autoUpdater.on('update-not-available', (info) => {
  log.info('当前已是最新版本');
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'not-available', info });
  }
});

autoUpdater.on('error', (err) => {
  log.error('自动更新错误:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'error', error: err.message });
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "下载速度: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - 已下载 ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  log.info(log_message);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'downloading', progress: progressObj });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('更新下载完成');
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'downloaded', info });
  }
});

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
            // 使用electron-updater检查更新
            if (isDev) {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: '开发模式',
                message: '开发模式下不检查更新',
                buttons: ['确定']
              });
            } else {
              log.info('用户手动检查更新...');
              autoUpdater.checkForUpdatesAndNotify();
            }
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
  
  // 初始化自动更新（仅在生产环境中启用）
  if (!isDev) {
    // 延迟5秒后检查更新，确保应用完全启动
    setTimeout(() => {
      log.info('开始检查更新...');
      autoUpdater.checkForUpdatesAndNotify();
    }, 5000);
  }

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

// 打开外部链接
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message || '打开链接失败'
    };
  }
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

// 下载更新文件
ipcMain.handle('download-update', async (event, url) => {
  try {
    console.log('📥 开始下载更新:', url);
    
    // 创建下载目录
    const downloadsDir = path.join(os.homedir(), 'Downloads', 'WinCleaner-Updates');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }
    
    // 生成文件名
    const fileName = `WinCleaner-Setup-${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.exe`;
    const filePath = path.join(downloadsDir, fileName);
    
    // 下载文件（不传递回调函数）
    await downloadFile(url, filePath);
    
    console.log('✅ 下载完成:', filePath);
    return { success: true, data: filePath };
  } catch (error) {
    console.error('❌ 下载失败:', error);
    return {
      success: false,
      error: error.message || '下载失败'
    };
  }
});

// 手动检查更新
ipcMain.handle('check-for-updates', async () => {
  try {
    if (isDev) {
      return { success: false, error: '开发模式下不检查更新' };
    }
    
    log.info('渲染进程请求检查更新...');
    autoUpdater.checkForUpdatesAndNotify();
    return { success: true };
  } catch (error) {
    log.error('检查更新失败:', error);
    return {
      success: false,
      error: error.message || '检查更新失败'
    };
  }
});

// 安装下载的更新
ipcMain.handle('install-update', async () => {
  try {
    if (isDev) {
      return { success: false, error: '开发模式下不安装更新' };
    }
    
    log.info('用户确认安装更新...');
    
    // 显示确认对话框
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      title: '确认安装',
      message: 'WinCleaner 将关闭并安装新版本，是否继续？',
      detail: '安装过程中请勿关闭计算机，安装完成后应用将自动重启。',
      buttons: ['立即安装', '取消'],
      defaultId: 0,
      cancelId: 1
    });
    
    if (result.response !== 0) {
      return { success: false, error: '用户取消安装' };
    }
    
    // 安装更新并重启应用
    autoUpdater.quitAndInstall();
    
    return { success: true };
  } catch (error) {
    log.error('安装更新失败:', error);
    return {
      success: false,
      error: error.message || '安装更新失败'
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

/**
 * 下载文件
 */
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);

    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      response.pipe(fileStream);
    });

    request.on('error', (error) => {
      fs.unlink(filePath, () => {}); // 删除不完整的文件
      reject(error);
    });

    fileStream.on('finish', () => {
      fileStream.close();
      resolve(filePath);
    });

    fileStream.on('error', (error) => {
      fs.unlink(filePath, () => {}); // 删除不完整的文件
      reject(error);
    });

    // 设置超时
    request.setTimeout(300000, () => { // 5分钟超时
      request.destroy();
      fs.unlink(filePath, () => {}); // 删除不完整的文件
      reject(new Error('下载超时'));
    });
  });
}

/**
 * 安装更新文件
 */
function installUpdateFile(filePath) {
  return new Promise((resolve, reject) => {
    // Windows平台
    if (process.platform === 'win32') {
      // 静默安装，安装完成后不自动重启
      const command = `"${filePath}" /SILENT /NORESTART`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`安装失败: ${error.message}`));
          return;
        }
        
        // 安装成功，关闭当前应用
        setTimeout(() => {
          app.quit();
          resolve();
        }, 1000);
      });
    }
    // macOS平台
    else if (process.platform === 'darwin') {
      // macOS的dmg安装逻辑
      const command = `hdiutil attach "${filePath}" && cp -r /Volumes/WinCleaner/WinCleaner.app /Applications/ && hdiutil detach /Volumes/WinCleaner`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`安装失败: ${error.message}`));
          return;
        }
        
        // 安装成功，关闭当前应用
        setTimeout(() => {
          app.quit();
          resolve();
        }, 1000);
      });
    }
    // Linux平台
    else if (process.platform === 'linux') {
      // Linux的deb/rpm安装逻辑
      const command = `sudo dpkg -i "${filePath}" || sudo rpm -i "${filePath}"`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`安装失败: ${error.message}`));
          return;
        }
        
        // 安装成功，关闭当前应用
        setTimeout(() => {
          app.quit();
          resolve();
        }, 1000);
      });
    }
    else {
      reject(new Error('不支持的操作系统平台'));
    }
  });
}
