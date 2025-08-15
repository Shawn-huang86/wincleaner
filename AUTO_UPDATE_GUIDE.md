# WinCleaner 自动更新功能配置指南

本文档详细说明了WinCleaner应用的自动更新功能配置和使用方法。

## 功能概述

WinCleaner现在支持通过GitHub Actions自动构建和Electron自动更新功能，实现以下特性：

1. **自动构建**: 代码推送到main分支或创建tag时自动构建Windows版本
2. **自动更新**: 应用启动时自动检查更新，用户可在应用内直接更新
3. **Windows平台**: 专注于Windows平台，生成exe安装文件
4. **无缝体验**: 更新过程自动下载、安装，用户只需确认即可

## 配置说明

### 1. GitHub Actions工作流

文件位置：`.github/workflows/build.yml`

**触发条件：**
- 推送到main分支
- 创建新的tag（格式：v*.*.*）
- 手动触发

**构建流程：**
1. 检出代码
2. 设置Windows环境
3. 安装依赖
4. 构建应用
5. 使用electron-builder打包生成exe文件
6. 上传到GitHub Releases

### 2. Electron自动更新配置

#### package.json配置

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "Shawn-huang86",
      "repo": "wincleaner"
    },
    "directories": {
      "output": "dist-electron"
    }
  }
}
```

#### 主进程配置 (electron/main.js)

- 导入`autoUpdater`和`electron-log`
- 配置自动更新事件监听器
- 应用启动时自动检查更新
- 提供手动检查更新功能

#### 预加载脚本配置 (electron/preload.js)

- 暴露更新相关API给渲染进程
- 提供更新状态监听功能

### 3. 前端更新界面

#### UpdateNotification组件

- 显示更新通知
- 处理更新下载和安装
- 显示更新进度
- 提供手动下载选项

#### useUpdateChecker Hook

- 自动检查更新
- 管理更新状态
- 提供更新控制方法

### 4. Windows特定配置

#### NSIS安装程序配置

```json
{
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "WinCleaner"
  }
}
```

#### Windows权限配置

```json
{
  "win": {
    "target": "nsis",
    "icon": "electron/assets/icon.ico",
    "requestedExecutionLevel": "requireAdministrator"
  }
}
```

## 使用方法

### 1. 自动更新流程

1. **应用启动**: 应用启动5秒后自动检查更新
2. **发现更新**: 显示更新通知，包含版本信息和更新内容
3. **用户确认**: 用户点击"立即更新"按钮
4. **下载更新**: 自动下载更新文件，显示下载进度
5. **安装更新**: 下载完成后提示用户安装
6. **应用重启**: 安装完成后应用自动重启

### 2. 手动检查更新

用户可以通过以下方式手动检查更新：

- 点击应用界面中的"检查更新"按钮
- 通过菜单栏的"帮助" > "检查更新"
- 使用UpdateNotification组件的检查功能

### 3. 更新状态说明

| 状态 | 说明 | 用户操作 |
|------|------|----------|
| checking | 正在检查更新 | 等待 |
| available | 发现新版本 | 选择立即更新或稍后提醒 |
| not-available | 当前已是最新版本 | 无需操作 |
| downloading | 正在下载更新 | 查看下载进度 |
| downloaded | 更新下载完成 | 点击安装 |
| error | 更新失败 | 查看错误信息或重试 |

## 开发和测试

### 1. 本地开发

在开发模式下，自动更新功能被禁用：

```javascript
// electron/main.js
if (!isDev) {
  // 仅在生产环境中启用自动更新
  autoUpdater.checkForUpdatesAndNotify();
}
```

### 2. 测试自动更新

使用提供的测试工作流：

```bash
# 手动触发测试
gh workflow run test-auto-update.yml -f test_type=build
```

测试内容包括：
- 构建配置验证
- 自动更新配置检查
- 依赖项验证
- Windows平台构建测试

### 3. 发布新版本

1. 更新package.json中的版本号
2. 创建新的tag：
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
3. GitHub Actions将自动构建并发布新版本
4. 用户应用将自动检测到更新

## 故障排除

### 1. 常见问题

**问题：应用无法检查更新**
- 检查网络连接
- 确认GitHub仓库配置正确
- 查看日志文件（位于用户数据目录）

**问题：更新下载失败**
- 检查磁盘空间
- 确认有写入权限
- 查看防火墙设置

**问题：更新安装失败**
- 确认应用有管理员权限
- 检查杀毒软件拦截
- 尝试手动下载安装

### 2. 日志查看

自动更新日志位于：

- Windows: `%APPDATA%/WinCleaner/logs/`

### 3. 手动更新

如果自动更新失败，用户可以：

1. 访问GitHub Releases页面：https://github.com/Shawn-huang86/wincleaner/releases
2. 下载Windows安装包（exe文件）
3. 手动安装新版本

## 安全考虑

1. **代码签名**: 建议为应用添加代码签名，提高安全性
2. **更新验证**: electron-updater会自动验证更新文件的完整性
3. **权限控制**: 更新过程需要适当的系统权限
4. **数据备份**: 更新前建议备份重要数据

## 未来改进

1. **增量更新**: 实现增量更新，减少下载时间
2. **更新策略**: 添加更多更新策略选项
3. **用户通知**: 优化更新通知的用户体验
4. **回滚机制**: 添加更新失败后的回滚功能

## 技术支持

如果遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查GitHub Issues
3. 提交新的Issue描述问题
4. 提供日志文件和错误信息

---

*最后更新: 2024年*