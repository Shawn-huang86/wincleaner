# WinCleaner 桌面应用构建指南

## 🎉 当前状态
您的 React 应用已经成功转换为 Electron 桌面应用！

## 📱 当前可用的命令

### 开发模式
```bash
npm run electron-dev    # 同时启动 Vite 开发服务器和 Electron（热更新）
npm run build-electron  # 构建并启动 Electron 应用
```

### 生产构建
```bash
npm run dist           # 构建所有平台的安装包
npm run dist-win       # 仅构建 Windows 安装包 (.exe)
npm run dist-mac       # 仅构建 macOS 安装包 (.dmg)
npm run dist-linux     # 仅构建 Linux 安装包 (.AppImage)
```

## 🖥️ 生成 Windows .exe 文件

### 方法 1：在 Windows 系统上构建（推荐）

1. **将项目复制到 Windows 电脑**
2. **安装 Node.js**：从 https://nodejs.org 下载安装
3. **安装依赖**：
   ```cmd
   npm install
   ```
4. **构建 Windows 安装包**：
   ```cmd
   npm run dist-win
   ```
5. **生成的文件位置**：`dist-electron/` 文件夹

### 方法 2：使用 GitHub Actions（自动化）

创建 `.github/workflows/build.yml` 文件，自动在云端构建：

```yaml
name: Build and Release
on:
  push:
    tags: ['v*']
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run dist-win
      - uses: actions/upload-artifact@v3
        with:
          name: windows-installer
          path: dist-electron/*.exe
```

### 方法 3：使用虚拟机

1. **安装 VirtualBox 或 VMware**
2. **创建 Windows 虚拟机**
3. **在虚拟机中运行构建命令**

## 📦 生成的文件类型

运行 `npm run dist-win` 后，您将得到：

- **WinCleaner Setup 1.0.0.exe** - 安装程序
- **WinCleaner 1.0.0.exe** - 便携版（可选）
- **latest.yml** - 自动更新配置

## 🎯 应用特性

您的桌面应用包含：

### ✅ 桌面功能
- 原生窗口和菜单
- 快捷键支持（Ctrl+N, Ctrl+R 等）
- 系统托盘集成（可选）
- Windows 通知支持

### ✅ 安全特性
- 沙盒环境运行
- 安全的文件访问
- 代码签名支持（需要证书）

### ✅ 分发特性
- 自动更新支持
- 安装程序生成
- 便携版支持

## 🔧 自定义配置

### 修改应用信息
编辑 `package.json` 中的 `build` 配置：

```json
{
  "build": {
    "appId": "com.yourcompany.wincleaner",
    "productName": "WinCleaner Pro",
    "copyright": "Copyright © 2024 Your Company"
  }
}
```

### 添加应用图标
将图标文件放在 `electron/assets/` 目录：
- `icon.ico` - Windows 图标
- `icon.png` - 通用图标

### 代码签名（可选）
为了避免 Windows 安全警告，可以购买代码签名证书：

```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.p12",
      "certificatePassword": "${CERTIFICATE_PASSWORD}"
    }
  }
}
```

**注意**：证书密码应通过环境变量 `CERTIFICATE_PASSWORD` 设置，不要在代码中硬编码。

## 🚀 下一步

1. **测试当前应用**：确保所有功能正常工作
2. **准备 Windows 环境**：用于生成 .exe 文件
3. **添加应用图标**：提升专业度
4. **考虑代码签名**：避免安全警告

## 📞 需要帮助？

如果您需要帮助设置 Windows 构建环境或遇到任何问题，请告诉我！
