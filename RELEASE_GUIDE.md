# 🚀 WinCleaner 发布指南

## 📋 发布流程概述

本指南详细说明如何发布新版本的 WinCleaner，确保用户能够通过自动更新获取最新版本。

## 🔄 完整发布流程

### 1️⃣ 准备发布

#### 更新版本号
```bash
# 1. 更新 package.json
"version": "1.4.0"

# 2. 更新 src/config/updateConfig.ts
CURRENT_VERSION: '1.4.0'

# 3. 提交版本更改
git add .
git commit -m "🔖 版本更新到 v1.4.0"
git push origin main
```

#### 构建应用
```bash
# 安装依赖
npm install

# 构建前端
npm run build

# 打包 Electron 应用
npm run dist
```

### 2️⃣ 创建 GitHub Release

#### 通过 GitHub 网页界面：

1. **访问仓库**：https://github.com/Shawn-huang86/wincleaner
2. **点击 Releases**：在右侧边栏找到 "Releases"
3. **创建新发布**：点击 "Create a new release"
4. **填写信息**：
   ```
   Tag version: v1.4.0
   Release title: WinCleaner v1.4.0 - 新功能发布
   
   描述模板：
   ## 🎉 WinCleaner v1.4.0 发布
   
   ### ✨ 新功能
   - 添加了真实文件清理功能
   - 支持文件安全删除到回收站
   - 新增清理模式切换开关
   
   ### 🔧 改进
   - 优化扫描性能
   - 改进用户界面
   - 增强安全机制
   
   ### 🐛 修复
   - 修复了扫描过程中的内存泄漏
   - 解决了某些情况下的崩溃问题
   
   ### 📥 下载
   - Windows 64位：WinCleaner Setup 1.4.0.exe
   - 绿色版：解压 win-unpacked.zip 直接运行
   
   ### 🛡️ 安全说明
   - 所有文件都经过数字签名
   - 开源代码，安全可靠
   - 支持从旧版本直接升级
   ```

5. **上传文件**：
   - `WinCleaner Setup 1.4.0.exe` (安装程序)
   - `win-unpacked.zip` (绿色版，可选)

6. **发布**：点击 "Publish release"

#### 通过命令行（可选）：

```bash
# 安装 GitHub CLI
# Windows: winget install GitHub.cli
# macOS: brew install gh

# 登录 GitHub
gh auth login

# 创建 release
gh release create v1.4.0 \
  --title "WinCleaner v1.4.0 - 新功能发布" \
  --notes-file RELEASE_NOTES.md \
  "dist-electron/WinCleaner Setup 1.4.0.exe"
```

### 3️⃣ 验证发布

#### 检查 API 响应
```bash
# 测试 GitHub API
curl -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Shawn-huang86/wincleaner/releases/latest
```

#### 测试自动更新
1. 运行旧版本应用
2. 触发更新检查
3. 确认能检测到新版本
4. 验证下载链接正确

## 📝 发布清单

### ✅ 发布前检查
- [ ] 代码已提交并推送到 main 分支
- [ ] 版本号已更新（package.json + updateConfig.ts）
- [ ] 应用构建成功，无错误
- [ ] 功能测试通过
- [ ] 安装包大小合理（< 200MB）
- [ ] 准备好发布说明

### ✅ 发布时检查
- [ ] GitHub Release 已创建
- [ ] 标签版本号正确（如 v1.4.0）
- [ ] 发布标题和描述清晰
- [ ] 安装包已上传
- [ ] 文件名格式正确
- [ ] 发布状态为 "Latest release"

### ✅ 发布后验证
- [ ] GitHub API 返回正确版本信息
- [ ] 应用能检测到新版本
- [ ] 下载链接可正常访问
- [ ] 安装包能正常下载和安装
- [ ] 用户反馈收集

## 🔧 版本号规范

### 语义化版本控制
```
主版本号.次版本号.修订号 (MAJOR.MINOR.PATCH)

例如：1.4.2
- 1: 主版本号（重大更改，可能不兼容）
- 4: 次版本号（新功能，向后兼容）
- 2: 修订号（bug修复，向后兼容）
```

### 版本号示例
- `1.0.0` - 首个正式版本
- `1.1.0` - 添加新功能
- `1.1.1` - 修复bug
- `2.0.0` - 重大更改，可能不兼容

## 📊 发布统计

### 跟踪指标
- 下载次数
- 用户反馈
- 问题报告
- 更新成功率

### GitHub Insights
- 访问 https://github.com/Shawn-huang86/wincleaner/releases
- 查看每个版本的下载统计
- 分析用户采用情况

## 🐛 问题处理

### 发布后发现问题
1. **紧急修复**：
   ```bash
   # 创建热修复版本
   git checkout -b hotfix/v1.4.1
   # 修复问题
   # 更新版本号到 1.4.1
   # 重新发布
   ```

2. **撤回发布**：
   - 在 GitHub 上将 Release 标记为 "Pre-release"
   - 或删除有问题的 Release
   - 发布修复版本

### 常见问题
- **文件上传失败**：检查文件大小和网络
- **API不返回新版本**：等待几分钟，GitHub需要时间同步
- **用户无法下载**：检查文件权限和链接

## 📞 发布支持

### 自动化建议
考虑使用 GitHub Actions 自动化发布流程：

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'
jobs:
  release:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run dist
      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist-electron/*.exe
```

### 最佳实践
1. **定期发布**：建议每2-4周发布一次
2. **测试充分**：发布前充分测试
3. **文档更新**：同步更新用户文档
4. **用户沟通**：重大更改提前通知用户

---

## 🎯 总结

遵循这个发布指南，可以确保：
- ✅ 用户能及时获取更新
- ✅ 更新过程安全可靠
- ✅ 版本管理规范有序
- ✅ 问题能快速响应

**记住：每次发布都是与用户的一次重要沟通！** 🚀
