/**
 * WinCleaner 更新检查API - Node.js版本
 * 可以部署到Vercel、Netlify等平台
 */

const express = require('express');
const cors = require('cors');
const app = express();

// 启用CORS
app.use(cors());
app.use(express.json());

// 版本信息配置
const VERSION_INFO = {
  version: '1.1.0',
  releaseDate: '2025-01-13T00:00:00Z',
  downloadUrl: 'https://your-domain.com/downloads/WinCleaner-Setup-1.1.0.exe',
  releaseNotes: [
    '微信QQ清理弹窗布局优化',
    '弹窗高度减少40%，更紧凑美观',
    '改进响应式设计，适配更多屏幕',
    '优化CSS网格布局系统',
    '增强用户体验和界面流畅度'
  ],
  isRequired: false,
  fileSize: 157286400, // 约150MB
  changelog: 'https://your-domain.com/changelog',
  supportUrl: 'https://your-domain.com/support'
};

// 更新检查端点
app.get('/api/wincleaner/latest', (req, res) => {
  try {
    // 记录访问日志
    console.log(`[${new Date().toISOString()}] 更新检查请求:`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer')
    });

    // 返回版本信息
    res.json(VERSION_INFO);
  } catch (error) {
    console.error('更新检查失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 版本历史端点（可选）
app.get('/api/wincleaner/versions', (req, res) => {
  const versions = [
    {
      version: '1.1.0',
      releaseDate: '2025-01-13T00:00:00Z',
      changes: ['微信QQ清理弹窗优化', '响应式设计改进']
    },
    {
      version: '1.0.0',
      releaseDate: '2025-01-01T00:00:00Z',
      changes: ['初始版本发布', '基础清理功能', '微信QQ清理']
    }
  ];
  
  res.json(versions);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 WinCleaner更新API服务启动在端口 ${PORT}`);
  console.log(`📋 更新检查端点: http://localhost:${PORT}/api/wincleaner/latest`);
});

module.exports = app;
