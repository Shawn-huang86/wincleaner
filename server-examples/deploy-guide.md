# WinCleaner 更新API部署指南

由于GitHub项目不是公开的，我们需要自建更新检查服务。以下是几种简单的部署方案：

## 🚀 方案1：静态文件托管（最简单）

### 1.1 使用GitHub Pages（推荐）
```bash
# 1. 创建一个公开的更新仓库
git init wincleaner-updates
cd wincleaner-updates

# 2. 创建版本文件
echo '{
  "version": "1.1.0",
  "releaseDate": "2025-01-13T00:00:00Z",
  "downloadUrl": "https://your-domain.com/downloads/WinCleaner-Setup-1.1.0.exe",
  "releaseNotes": [
    "微信QQ清理弹窗布局优化",
    "弹窗高度减少40%，更紧凑美观",
    "改进响应式设计，适配更多屏幕"
  ],
  "isRequired": false,
  "fileSize": 157286400
}' > latest.json

# 3. 推送到GitHub并启用Pages
git add .
git commit -m "Add version info"
git push origin main
```

**访问地址**: `https://your-username.github.io/wincleaner-updates/latest.json`

### 1.2 使用Vercel/Netlify
1. 上传 `latest.json` 到Vercel或Netlify
2. 获得类似 `https://your-app.vercel.app/latest.json` 的地址

### 1.3 使用自己的服务器
1. 将 `latest.json` 上传到你的网站
2. 确保支持CORS访问
3. 地址如：`https://your-domain.com/api/latest.json`

## 🔧 方案2：动态API服务

### 2.1 使用Vercel Functions
```javascript
// api/latest.js
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    version: '1.1.0',
    releaseDate: '2025-01-13T00:00:00Z',
    downloadUrl: 'https://your-domain.com/downloads/WinCleaner-Setup-1.1.0.exe',
    releaseNotes: [
      '微信QQ清理弹窗布局优化',
      '弹窗高度减少40%，更紧凑美观'
    ],
    isRequired: false,
    fileSize: 157286400
  });
}
```

### 2.2 使用Netlify Functions
```javascript
// netlify/functions/latest.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: '1.1.0',
      releaseDate: '2025-01-13T00:00:00Z',
      downloadUrl: 'https://your-domain.com/downloads/WinCleaner-Setup-1.1.0.exe',
      releaseNotes: [
        '微信QQ清理弹窗布局优化',
        '弹窗高度减少40%，更紧凑美观'
      ],
      isRequired: false,
      fileSize: 157286400
    })
  };
};
```

## 📋 配置更新

部署完成后，更新 `src/config/updateConfig.ts` 中的URL：

```typescript
UPDATE_SOURCES: [
  {
    name: '官方更新API',
    url: 'https://your-actual-domain.com/api/latest.json', // 替换为实际地址
    priority: 1,
    description: '官方更新API，最稳定可靠'
  }
]
```

## 🎯 推荐方案

**对于私有项目，推荐使用静态文件 + GitHub Pages**：

1. ✅ **完全免费**
2. ✅ **部署简单**
3. ✅ **全球CDN**
4. ✅ **高可用性**
5. ✅ **无需服务器维护**

## 🔄 更新流程

每次发布新版本时：
1. 更新 `latest.json` 文件
2. 推送到更新仓库
3. 用户自动获得更新提醒

## 🛡️ 安全考虑

- 使用HTTPS确保传输安全
- 验证下载文件的完整性
- 提供多个下载镜像
- 定期备份版本信息
