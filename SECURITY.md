# WinCleaner 安全检查指南

## 📋 概述

本文档描述了 WinCleaner 项目的安全检查系统，用于防止敏感信息泄露和确保代码安全。

## 🚀 功能特性

### 1. 自动化安全检查
- 检测硬编码的 API 密钥、密码、token 等敏感信息
- 支持多种文件格式（JS/TS/JSON/MD/YAML）
- 智能排除测试值和示例值
- 按严重程度分类问题

### 2. 环境变量管理
- 提供标准化的环境变量配置模板
- 支持开发和测试环境分离
- 自动加载和验证环境变量

### 3. 自动化集成
- GitHub Actions 定期检查
- Pre-commit 提交前检查
- CI/CD 流程集成
- 自动问题报告

## 📁 文件结构

```
WinCleaner/
├── .env.example              # 环境变量配置示例
├── .env.test                 # 测试环境配置
├── .gitignore                # 已更新包含敏感文件
├── .pre-commit-config.yaml   # Pre-commit 钩子配置
├── .github/workflows/
│   └── security-check.yml    # GitHub Actions 工作流
├── scripts/
│   └── security-check.js     # 安全检查脚本
└── SECURITY.md               # 本文档
```

## 🔧 使用方法

### 1. 本地安全检查

```bash
# 运行完整安全检查
npm run security-check

# CI 模式检查（适合自动化）
npm run security-check:ci

# Pre-commit 模式检查
npm run security-check:pre-commit
```

### 2. 环境变量配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env

# 加载测试环境
export $(cat .env.test | xargs)
```

### 3. Pre-commit 钩子设置

```bash
# 安装 pre-commit
npm install -g pre-commit

# 安装钩子
pre-commit install

# 手动运行所有钩子
pre-commit run --all-files
```

## 📊 检查模式

### 检测的敏感信息类型

| 类型 | 模式示例 | 严重程度 |
|------|----------|----------|
| API 密钥 | `apiKey: 'sk-...'` | 高 |
| 密码 | `password: '...'` | 高 |
| Token | `token: '...'` | 高 |
| 私钥 | `privateKey: '...'` | 严重 |
| 数据库连接 | `mongodb://user:pass@...` | 中 |
| AWS 凭证 | `aws_access_key_id: '...'` | 高 |
| 其他密钥 | `secret: '...'` | 中 |

### 排除规则

自动排除以下内容：
- 测试值（`test-key`, `example`, `placeholder` 等）
- 目录：`node_modules`, `dist`, `build`, `.git`
- 文件：`.env.example`, `.env.test`, `package-lock.json`

## 🔄 自动化流程

### GitHub Actions

- **触发时机**：
  - 推送到 main/develop 分支
  - 创建 Pull Request
  - 每天凌晨 2 点（UTC）
  - 手动触发

- **自动操作**：
  - 运行安全检查
  - 生成检查报告
  - 失败时创建 Issue
  - PR 中自动评论

### Pre-commit 钩子

- **触发时机**：每次 git commit 前
- **检查内容**：
  - 安全检查
  - ESLint 检查
  - Git Secrets 检查

## 🎯 最佳实践

### 1. 敏感信息处理

```javascript
// ❌ 错误：硬编码密钥
const apiKey = 'sk-1234567890abcdef';

// ✅ 正确：使用环境变量
const apiKey = process.env.OPENAI_API_KEY;

// ✅ 正确：使用配置文件
import { config } from './config';
const apiKey = config.get('apiKey');
```

### 2. 环境变量管理

```javascript
// 加载环境变量
require('dotenv').config();

// 验证必要的环境变量
const requiredEnvVars = ['OPENAI_API_KEY', 'CERTIFICATE_PASSWORD'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

### 3. 配置文件结构

```javascript
// config.js
module.exports = {
  development: {
    apiKey: process.env.OPENAI_API_KEY,
    apiUrl: process.env.API_URL || 'https://api.example.com',
    debug: process.env.DEBUG === 'true'
  },
  
  test: {
    apiKey: process.env.TEST_API_KEY,
    apiUrl: 'https://api.test.example.com',
    debug: true
  },
  
  production: {
    apiKey: process.env.OPENAI_API_KEY,
    apiUrl: process.env.API_URL || 'https://api.example.com',
    debug: false
  }
};
```

## 🚨 问题处理

### 常见问题

1. **误报测试值**
   - 确保测试值包含 `test-`, `example`, `placeholder` 等关键词
   - 在 `.env.test` 中定义测试专用变量

2. **环境变量未加载**
   - 检查 `.env` 文件是否存在
   - 确认 `dotenv` 包已安装
   - 验证文件格式正确

3. **Pre-commit 钩子失败**
   - 修复安全检查发现的问题
   - 使用 `git commit -n` 临时跳过钩子（不推荐）

### 紧急处理流程

1. **发现敏感信息泄露**：
   - 立即撤销包含敏感信息的 commit
   - 更新相关密钥/密码
   - 运行完整安全检查

2. **自动化检查失败**：
   - 查看 GitHub Actions 日志
   - 修复发现的问题
   - 重新运行检查

## 📈 维护计划

### 定期检查
- **每日**：GitHub Actions 自动检查
- **提交前**：Pre-commit 钩子检查
- **发布前**：手动完整检查

### 更新维护
- 每月检查敏感信息模式是否需要更新
- 根据新的安全威胁调整检查规则
- 定期审查环境变量配置

## 📞 支持

如果遇到问题或需要帮助，请：

1. 查看本文档的常见问题部分
2. 运行 `npm run security-check -- --help` 获取帮助
3. 创建 GitHub Issue 描述问题

---

**最后更新**：2024-01-15
**维护者**：WinCleaner 开发团队