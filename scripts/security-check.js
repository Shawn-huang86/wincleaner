#!/usr/bin/env node

/**
 * WinCleaner 敏感信息检查脚本
 * 用于定期检查代码中的敏感信息，防止密钥泄露
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 敏感信息模式
const SENSITIVE_PATTERNS = [
  // API密钥模式
  /api[_-]?key[\s]*[:=][\s]*['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
  /apikey[\s]*[:=][\s]*['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
  /API[_-]?KEY[\s]*[:=][\s]*['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
  
  // 密码模式
  /password[\s]*[:=][\s]*['"]([^'"]{4,})['"]/gi,
  /pwd[\s]*[:=][\s]*['"]([^'"]{4,})['"]/gi,
  /PASS[\s]*[:=][\s]*['"]([^'"]{4,})['"]/gi,
  
  // Token模式
  /token[\s]*[:=][\s]*['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
  /TOKEN[\s]*[:=][\s]*['"]([a-zA-Z0-9_\-]{20,})['"]/gi,
  /bearer[\s]+([a-zA-Z0-9_\-]{20,})/gi,
  
  // 私钥模式
  /private[_-]?key[\s]*[:=][\s]*['"]([a-zA-Z0-9_\-+/=]{50,})['"]/gi,
  /PRIVATE[_-]?KEY[\s]*[:=][\s]*['"]([a-zA-Z0-9_\-+/=]{50,})['"]/gi,
  
  // 数据库连接字符串
  /mongodb:\/\/([^:]+):([^@]+)@/gi,
  /postgres:\/\/([^:]+):([^@]+)@/gi,
  /mysql:\/\/([^:]+):([^@]+)@/gi,
  
  // AWS凭证
  /aws[_-]?access[_-]?key[_-]?id[\s]*[:=][\s]*['"]([A-Z0-9]{20})['"]/gi,
  /aws[_-]?secret[_-]?access[_-]?key[\s]*[:=][\s]*['"]([a-zA-Z0-9/+=]{40})['"]/gi,
  
  // 其他敏感信息
  /secret[\s]*[:=][\s]*['"]([^'"]{8,})['"]/gi,
  /SECRET[\s]*[:=][\s]*['"]([^'"]{8,})['"]/gi,
  /credential[\s]*[:=][\s]*['"]([^'"]{8,})['"]/gi,
];

// 需要检查的文件扩展名
const TARGET_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.yml', '.yaml'];

// 需要排除的目录
const EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  '.vscode',
  '.idea',
  'temp',
  'logs'
];

// 需要排除的文件
const EXCLUDE_FILES = [
  '.env.example',
  '.env.test',
  'package-lock.json',
  'yarn.lock'
];

class SecurityChecker {
  constructor() {
    this.issues = [];
    this.filesChecked = 0;
    this.baseDir = process.cwd();
  }

  // 检查单个文件
  checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.baseDir, filePath);
      
      let fileHasIssues = false;
      
      SENSITIVE_PATTERNS.forEach((pattern, patternIndex) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const line = this.getLineNumber(content, match.index);
          const sensitiveValue = match[1] || match[0];
          
          // 排除明显的测试或示例值
          if (!this.isTestOrExampleValue(sensitiveValue)) {
            this.issues.push({
              file: relativePath,
              line: line,
              pattern: pattern.toString(),
              value: this.maskSensitiveValue(sensitiveValue),
              severity: this.getSeverity(pattern)
            });
            fileHasIssues = true;
          }
        }
      });
      
      if (fileHasIssues) {
        console.log(`\x1b[33m⚠️  发现敏感信息: ${relativePath}\x1b[0m`);
      }
      
      this.filesChecked++;
    } catch (error) {
      console.log(`\x1b[31m❌ 无法读取文件: ${filePath}\x1b[0m`);
    }
  }

  // 获取行号
  getLineNumber(content, index) {
    const lines = content.substring(0, index).split('\n');
    return lines.length;
  }

  // 判断是否为测试或示例值
  isTestOrExampleValue(value) {
    const testValues = [
      'test-key',
      'test-api-key',
      'test-token',
      'test-password',
      'your-api-key-here',
      'your-password-here',
      'your-token-here',
      'example',
      'sample',
      'placeholder',
      'dummy',
      'mock',
      'fake'
    ];
    
    return testValues.some(testValue => 
      value.toLowerCase().includes(testValue.toLowerCase())
    );
  }

  // 掩码敏感值
  maskSensitiveValue(value) {
    if (value.length <= 8) {
      return '*'.repeat(value.length);
    }
    return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
  }

  // 获取严重程度
  getSeverity(pattern) {
    const patternStr = pattern.toString();
    
    if (patternStr.includes('api') || patternStr.includes('API') || patternStr.includes('key')) {
      return 'high';
    }
    if (patternStr.includes('password') || patternStr.includes('secret') || patternStr.includes('token')) {
      return 'high';
    }
    if (patternStr.includes('private') || patternStr.includes('PRIVATE')) {
      return 'critical';
    }
    return 'medium';
  }

  // 递归检查目录
  checkDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // 检查是否需要排除此目录
        if (!EXCLUDE_DIRS.includes(item)) {
          this.checkDirectory(itemPath);
        }
      } else if (stat.isFile()) {
        // 检查文件扩展名
        const ext = path.extname(item);
        if (TARGET_EXTENSIONS.includes(ext) && !EXCLUDE_FILES.includes(item)) {
          this.checkFile(itemPath);
        }
      }
    });
  }

  // 生成报告
  generateReport() {
    console.log('\n\x1b[1m=== WinCleaner 安全检查报告 ===\x1b[0m\n');
    
    console.log(`📊 检查统计:`);
    console.log(`   - 检查文件数: ${this.filesChecked}`);
    console.log(`   - 发现问题数: ${this.issues.length}`);
    
    if (this.issues.length === 0) {
      console.log('\n\x1b[32m✅ 未发现敏感信息泄露！\x1b[0m');
      return;
    }
    
    // 按严重程度分组
    const issuesBySeverity = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
    
    this.issues.forEach(issue => {
      issuesBySeverity[issue.severity].push(issue);
    });
    
    // 显示问题
    Object.keys(issuesBySeverity).forEach(severity => {
      const issues = issuesBySeverity[severity];
      if (issues.length > 0) {
        const color = this.getSeverityColor(severity);
        const icon = this.getSeverityIcon(severity);
        console.log(`\n${color}${icon} ${severity.toUpperCase()} 严重性问题 (${issues.length}个):\x1b[0m`);
        
        issues.forEach(issue => {
          console.log(`   📁 ${issue.file}:${issue.line}`);
          console.log(`   🔍 模式: ${issue.pattern}`);
          console.log(`   🔑 值: ${issue.value}`);
          console.log('');
        });
      }
    });
    
    // 建议修复方案
    console.log('\n\x1b[1m🔧 建议修复方案:\x1b[0m');
    console.log('1. 将硬编码的敏感信息移至环境变量');
    console.log('2. 使用 .env 文件管理环境变量');
    console.log('3. 确保 .env 文件已添加到 .gitignore');
    console.log('4. 使用环境变量库（如 dotenv）加载配置');
    console.log('5. 定期运行此脚本检查代码安全');
    
    // 退出码
    const hasCriticalIssues = issuesBySeverity.critical.length > 0;
    const hasHighIssues = issuesBySeverity.high.length > 0;
    
    if (hasCriticalIssues || hasHighIssues) {
      console.log('\n\x1b[31m❌ 发现严重安全问题，请立即修复！\x1b[0m');
      process.exit(1);
    } else {
      console.log('\n\x1b[33m⚠️  发现安全问题，建议修复\x1b[0m');
      process.exit(0);
    }
  }

  // 获取严重程度颜色
  getSeverityColor(severity) {
    switch (severity) {
      case 'critical': return '\x1b[31m';
      case 'high': return '\x1b[31m';
      case 'medium': return '\x1b[33m';
      case 'low': return '\x1b[36m';
      default: return '\x1b[0m';
    }
  }

  // 获取严重程度图标
  getSeverityIcon(severity) {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '❓';
    }
  }

  // 运行检查
  run() {
    console.log('\x1b[1m🔍 开始安全检查...\x1b[0m');
    
    try {
      this.checkDirectory(this.baseDir);
      this.generateReport();
    } catch (error) {
      console.error('\x1b[31m❌ 检查过程中发生错误:', error.message, '\x1b[0m');
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const checker = new SecurityChecker();
  checker.run();
}

module.exports = SecurityChecker;