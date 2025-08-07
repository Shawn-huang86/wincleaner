# 🔄 WinCleaner Git 同步指南

## 📋 完整流程概览

```
Mac电脑 (开发) → GitHub (云端) → Windows电脑 (打包)
```

## 第一步：Mac电脑上传代码 📤

### 1. 检查当前状态
```bash
cd /Users/shawn/github/wincleaner
git status
```

### 2. 添加所有文件
```bash
git add .
```

### 3. 提交代码
```bash
git commit -m "WinCleaner v1.0 - 完整功能版本

✨ 新功能:
- 智能文件扫描系统
- 微信QQ专项清理
- 时间范围筛选功能
- 安全回收站机制
- 现代化UI界面
- 完整的Electron打包配置

🔧 技术栈:
- React 18 + TypeScript
- Electron + electron-builder
- Tailwind CSS
- Vite构建工具

📦 打包脚本:
- build-exe.bat (一键打包)
- build-step-by-step.bat (分步执行)
- debug-env.bat (环境诊断)
- build-with-log.bat (详细日志)

🎯 准备在Windows电脑上进行EXE打包测试"
```

### 4. 推送到GitHub
如果是第一次推送：
```bash
# 创建GitHub仓库后，连接远程仓库
git remote add origin https://github.com/YOUR_USERNAME/wincleaner.git
git branch -M main
git push -u origin main
```

如果已经有远程仓库：
```bash
git push
```

## 第二步：在GitHub上确认 🌐

1. 访问您的GitHub仓库
2. 确认所有文件都已上传
3. 检查重要文件：
   - ✅ `package.json`
   - ✅ `src/` 目录
   - ✅ `electron/` 目录
   - ✅ `build-*.bat` 脚本
   - ✅ `README.md`

## 第三步：Windows电脑克隆代码 📥

### 1. 安装Git (如果没有)
- 下载：https://git-scm.com/download/win
- 安装时保持默认设置

### 2. 选择合适的目录
```bash
# 建议使用纯英文路径，避免中文
cd C:\
mkdir Projects
cd Projects
```

### 3. 克隆仓库
```bash
git clone https://github.com/YOUR_USERNAME/wincleaner.git
cd wincleaner
```

### 4. 验证文件完整性
```bash
# 检查重要文件
dir package.json
dir src
dir electron
dir build-exe.bat
```

## 第四步：Windows电脑环境准备 🔧

### 1. 安装Node.js
- 访问：https://nodejs.org/
- 下载LTS版本 (推荐18.x)
- 安装时确保勾选 "Add to PATH"
- **安装完成后重启电脑**

### 2. 验证环境
```bash
node --version
npm --version
```

### 3. 运行环境测试
```bash
# 快速测试
quick-test.bat

# 详细诊断
debug-env.bat
```

## 第五步：执行打包 🚀

### 选择合适的打包方式：

#### 方式1：一键自动打包
```bash
build-exe.bat
```

#### 方式2：分步执行 (推荐新手)
```bash
build-step-by-step.bat
```

#### 方式3：手动执行
```bash
npm install
npm run build
npm run dist-win
```

#### 方式4：详细日志版本
```bash
build-with-log.bat
```

## 🔄 后续开发流程

### 在Mac上修改代码后：
```bash
# 1. 提交更改
git add .
git commit -m "描述您的修改内容"
git push

# 2. 通知Windows电脑同步
```

### 在Windows上同步最新代码：
```bash
# 1. 拉取最新代码
git pull

# 2. 重新打包
npm run dist-win
```

## 🎯 预期结果

打包成功后，您将在 `dist-electron` 目录下获得：

```
dist-electron/
├── WinCleaner Setup 1.0.0.exe    # 🎯 安装程序 (~100MB)
└── win-unpacked/
    └── WinCleaner.exe             # 🎯 绿色版 (~200MB)
```

## 🚨 常见问题解决

### Git相关问题：

#### 问题1：git命令不存在
```bash
# 解决：安装Git for Windows
# 下载：https://git-scm.com/download/win
```

#### 问题2：权限被拒绝
```bash
# 解决：配置Git用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### 问题3：克隆失败
```bash
# 解决：检查网络连接，或使用SSH
git clone git@github.com:YOUR_USERNAME/wincleaner.git
```

### 打包相关问题：

#### 问题1：Node.js环境问题
- 重新安装Node.js
- 确保勾选"Add to PATH"
- 重启电脑

#### 问题2：网络下载问题
```bash
# 设置国内镜像
npm config set registry https://registry.npmmirror.com
```

#### 问题3：权限问题
- 以管理员身份运行命令提示符
- 或者将项目放在用户目录下

## 📝 Git命令速查

```bash
# 查看状态
git status

# 查看提交历史
git log --oneline

# 查看远程仓库
git remote -v

# 强制拉取最新代码 (慎用)
git fetch origin
git reset --hard origin/main

# 查看文件差异
git diff

# 撤销未提交的更改
git checkout -- filename
```

## 🎉 成功标志

当您看到以下信息时，说明整个流程成功：

1. ✅ GitHub上有完整的代码仓库
2. ✅ Windows电脑成功克隆代码
3. ✅ Node.js环境正常
4. ✅ 打包脚本执行成功
5. ✅ 生成了WinCleaner.exe文件
6. ✅ 应用可以正常运行

现在您就可以开始Git同步流程了！🚀
