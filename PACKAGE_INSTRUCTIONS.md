# 📦 WinCleaner 完整打包说明

## 🎯 目标
将 WinCleaner React 应用打包成 Windows EXE 可执行文件

## 📋 准备工作

### 1. 环境要求
- ✅ Windows 10/11 操作系统
- ✅ Node.js 16+ (推荐 18.x LTS)
- ✅ 至少 2GB 可用磁盘空间
- ✅ 稳定的网络连接

### 2. 安装 Node.js
1. 访问 https://nodejs.org/
2. 下载 LTS 版本（左侧绿色按钮）
3. 运行安装程序，保持默认设置
4. 重启电脑

### 3. 验证安装
打开命令提示符（cmd）或 PowerShell，输入：
```bash
node --version
npm --version
```
应该显示版本号，如：
```
v18.17.0
9.6.7
```

## 🚀 打包步骤

### 方法一：一键打包（推荐）

#### Windows 批处理
1. 双击运行 `build-exe.bat`
2. 等待自动完成所有步骤
3. 查看输出文件

#### PowerShell 脚本
1. 右键点击 `build-exe.ps1`
2. 选择"使用 PowerShell 运行"
3. 如果提示执行策略，输入：`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
4. 重新运行脚本

### 方法二：手动执行

#### 1. 打开命令行
- 按 `Win + R`，输入 `cmd`，回车
- 或者按 `Win + X`，选择"Windows PowerShell"

#### 2. 进入项目目录
```bash
cd C:\path\to\wincleaner
```

#### 3. 执行打包命令
```bash
# 安装依赖
npm install

# 构建应用
npm run build

# 打包 EXE
npm run dist-win
```

## 📁 输出文件

打包成功后，在 `dist-electron` 目录下会生成：

```
dist-electron/
├── 📦 WinCleaner Setup 1.0.0.exe    # 安装程序（推荐使用）
├── 📁 win-unpacked/
│   ├── 🎯 WinCleaner.exe             # 可执行文件
│   ├── 📁 resources/
│   ├── 📁 locales/
│   └── 📄 其他运行时文件...
├── 📄 latest.yml                     # 更新配置
└── 📄 builder-debug.yml              # 构建日志
```

## 🎯 文件说明

### 🎯 WinCleaner Setup 1.0.0.exe
- **大小**: ~100MB
- **用途**: 完整安装程序
- **优点**: 
  - 自动安装到系统
  - 创建桌面快捷方式
  - 添加到开始菜单
  - 支持卸载
- **推荐**: ⭐⭐⭐⭐⭐

### 🎯 WinCleaner.exe
- **大小**: ~200MB（包含整个文件夹）
- **用途**: 绿色版可执行文件
- **优点**: 
  - 无需安装
  - 便携式
- **注意**: 需要保持整个 `win-unpacked` 文件夹完整

## 🧪 测试应用

### 1. 测试安装程序
1. 双击 `WinCleaner Setup 1.0.0.exe`
2. 按照安装向导完成安装
3. 从桌面或开始菜单启动应用

### 2. 测试绿色版
1. 进入 `win-unpacked` 文件夹
2. 双击 `WinCleaner.exe`
3. 应用应该直接启动

## 🔧 常见问题解决

### ❌ "node 不是内部或外部命令"
**原因**: Node.js 未安装或未添加到 PATH
**解决**: 
1. 重新安装 Node.js
2. 重启命令行
3. 重启电脑

### ❌ "npm install 失败"
**原因**: 网络问题或权限问题
**解决**:
```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 清除缓存
npm cache clean --force

# 重新安装
npm install
```

### ❌ "权限被拒绝"
**原因**: 管理员权限不足
**解决**: 
1. 右键点击命令提示符
2. 选择"以管理员身份运行"
3. 重新执行命令

### ❌ "磁盘空间不足"
**原因**: 可用空间不够
**解决**: 
1. 清理磁盘空间（至少保留 2GB）
2. 删除 `node_modules` 文件夹
3. 重新执行 `npm install`

### ❌ "杀毒软件阻止"
**原因**: 杀毒软件误报
**解决**: 
1. 暂时关闭实时保护
2. 将项目文件夹添加到白名单
3. 重新打包

## 📊 打包时间预估

- **首次打包**: 10-20 分钟（需要下载依赖）
- **后续打包**: 3-5 分钟
- **网络影响**: 较大（需要下载 Electron 运行时）

## 🎉 成功标志

看到以下信息表示打包成功：
```
✅ 依赖安装完成
✅ React 应用构建完成
✅ EXE 打包完成
🎉 打包完成！
```

## 📤 分发应用

### 给其他用户
- 分享 `WinCleaner Setup 1.0.0.exe`
- 文件大小约 100MB
- 用户双击即可安装

### 便携版本
- 压缩整个 `win-unpacked` 文件夹
- 解压后运行 `WinCleaner.exe`
- 适合不想安装的用户

## 🔄 更新应用

如果修改了代码，重新打包：
```bash
npm run build
npm run dist-win
```

## 📞 获取帮助

如果遇到问题：
1. 检查 Node.js 版本是否正确
2. 确保网络连接正常
3. 查看错误信息并搜索解决方案
4. 尝试删除 `node_modules` 重新安装

---

🎯 **目标**: 生成可在 Windows 上运行的 WinCleaner.exe 文件
✅ **结果**: 获得专业的桌面清理应用程序
