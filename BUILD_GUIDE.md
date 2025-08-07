# 🚀 WinCleaner EXE 打包指南

## 📋 前提条件

### 1. 安装 Node.js
- 访问 [Node.js 官网](https://nodejs.org/)
- 下载并安装 LTS 版本（推荐 18.x 或更高）
- 安装完成后重启命令行

### 2. 验证安装
打开命令行，运行以下命令验证：
```bash
node --version
npm --version
```

## 🛠️ 打包方法

### 方法一：使用自动化脚本（推荐）

#### Windows 批处理脚本
```bash
# 双击运行或在命令行执行
build-exe.bat
```

#### PowerShell 脚本
```powershell
# 在 PowerShell 中执行
.\build-exe.ps1
```

### 方法二：手动执行命令

#### 1. 安装依赖
```bash
npm install
```

#### 2. 构建 React 应用
```bash
npm run build
```

#### 3. 打包 Windows EXE
```bash
npm run dist-win
```

## 📁 输出文件说明

打包完成后，在 `dist-electron` 目录下会生成：

```
dist-electron/
├── WinCleaner Setup 1.0.0.exe    # 🎯 安装程序（推荐）
├── win-unpacked/
│   ├── WinCleaner.exe             # 🎯 可执行文件
│   ├── resources/
│   └── ...其他文件
└── latest.yml                     # 更新配置文件
```

### 文件用途

#### 🎯 WinCleaner Setup 1.0.0.exe
- **用途**: 完整的安装程序
- **优点**: 
  - 自动创建桌面快捷方式
  - 添加到开始菜单
  - 支持卸载
  - 文件大小较小（约 100MB）
- **适合**: 分发给其他用户使用

#### 🎯 WinCleaner.exe
- **用途**: 绿色版可执行文件
- **优点**:
  - 无需安装，直接运行
  - 便携式，可放在U盘
- **缺点**: 
  - 需要整个 win-unpacked 文件夹
  - 文件夹较大（约 200MB）
- **适合**: 个人使用或测试

## 🎨 应用特性

### 界面特点
- 🎯 现代化 UI 设计
- 📱 响应式布局
- 🎨 美观的动画效果
- 🌙 深色/浅色主题

### 功能特点
- 🔍 智能文件扫描
- 💬 微信QQ专项清理
- ⏰ 时间范围选择
- 🛡️ 安全回收站机制
- 📊 实时进度显示

### 技术特点
- ⚡ 基于 Electron + React
- 🎨 Tailwind CSS 样式
- 📦 TypeScript 类型安全
- 🔧 Vite 快速构建

## 🐛 常见问题

### Q: 打包失败，提示 "node 不是内部或外部命令"
**A**: Node.js 未正确安装或未添加到 PATH
- 重新安装 Node.js
- 重启命令行
- 检查环境变量

### Q: 打包过程中出现网络错误
**A**: 网络连接问题
- 检查网络连接
- 尝试使用 VPN
- 使用国内镜像：`npm config set registry https://registry.npmmirror.com`

### Q: 生成的 EXE 文件很大
**A**: 这是正常的，因为包含了完整的 Electron 运行时
- 安装程序：约 100MB
- 解压后：约 200MB
- 可以考虑使用在线更新机制

### Q: 杀毒软件报毒
**A**: 这是误报，常见于新的 Electron 应用
- 添加到杀毒软件白名单
- 使用代码签名证书（生产环境推荐）

## 📝 开发说明

### 项目结构
```
wincleaner/
├── src/                    # React 源码
├── electron/              # Electron 主进程
├── dist/                  # React 构建输出
├── dist-electron/         # Electron 打包输出
└── package.json          # 项目配置
```

### 开发模式
```bash
# 启动开发服务器
npm run dev

# 启动 Electron 开发模式
npm run electron-dev
```

### 其他平台打包
```bash
# macOS
npm run dist-mac

# Linux
npm run dist-linux

# 所有平台
npm run dist
```

## 🎉 完成！

按照以上步骤，您就可以成功生成 WinCleaner 的 Windows EXE 文件了！

如有问题，请检查：
1. Node.js 是否正确安装
2. 网络连接是否正常
3. 磁盘空间是否充足（至少 1GB）
