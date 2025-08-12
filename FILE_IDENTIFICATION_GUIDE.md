# WinCleaner 垃圾文件识别机制详解

## 🔍 核心识别原理

WinCleaner 使用多层次的文件识别系统来判断哪些文件可以安全清理，哪些文件需要保护。

## 📂 文件分类系统

### 1. 按位置分类

#### ✅ 可清理的目录
```
C:\Windows\Temp                    # 系统临时文件
C:\Users\[用户]\AppData\Local\Temp  # 用户临时文件
C:\Windows\SoftwareDistribution\Download  # 系统更新缓存
浏览器缓存目录                      # Chrome、Edge、Firefox缓存
微信/QQ缓存目录                    # 聊天软件缓存
```

#### ❌ 受保护的目录
```
C:\Windows\System32                # 系统核心文件
C:\Windows\SysWOW64               # 32位系统文件
C:\Program Files                   # 程序安装目录
C:\Program Files (x86)            # 32位程序目录
C:\Boot                           # 启动文件
C:\Recovery                       # 系统恢复文件
```

### 2. 按文件扩展名分类

#### ✅ 垃圾文件扩展名
```javascript
const junkExtensions = [
  '.tmp',     // 临时文件
  '.temp',    // 临时文件
  '.log',     // 日志文件
  '.bak',     // 备份文件
  '.old',     // 旧文件
  '.cache',   // 缓存文件
  '.dmp',     // 内存转储文件
  '.chk',     // 磁盘检查文件
  '.gid'      // 帮助索引文件
];
```

#### ❌ 受保护的扩展名
```javascript
const protectedExtensions = [
  '.exe',     // 可执行文件
  '.dll',     // 动态链接库
  '.sys',     // 系统文件
  '.ini',     // 配置文件（部分）
  '.reg',     // 注册表文件
  '.bat',     // 批处理文件
  '.cmd'      // 命令文件
];
```

## 🛡️ 安全等级评估

### 风险等级定义

#### 🟢 Safe（安全）
- **定义**：可以安全删除，不会影响系统运行
- **示例**：
  ```
  临时文件：*.tmp, *.temp
  缓存文件：浏览器缓存、应用缓存
  日志文件：*.log（非系统关键日志）
  ```

#### 🟡 Caution（谨慎）
- **定义**：可能包含用户数据，建议检查后删除
- **示例**：
  ```
  下载文件夹中的文件
  微信/QQ聊天图片、视频
  用户文档目录中的备份文件
  ```

#### 🔴 High（高风险）
- **定义**：删除可能导致系统问题，不建议删除
- **示例**：
  ```
  系统文件：hiberfil.sys, pagefile.sys
  系统关键目录中的文件
  正在使用的程序文件
  ```

## 🔍 具体识别规则

### 1. 路径匹配规则

```javascript
// 系统关键目录检查
const isSystemCriticalDirectory = (path) => {
  const criticalDirs = [
    'c:\\windows\\system32',
    'c:\\windows\\syswow64',
    'c:\\program files',
    'c:\\program files (x86)',
    'c:\\boot',
    'c:\\recovery'
  ];
  return criticalDirs.some(dir => path.toLowerCase().startsWith(dir));
};
```

### 2. 文件名模式匹配

```javascript
// 垃圾文件模式
const junkPatterns = [
  /^~.*\.tmp$/,        // 以~开头的临时文件
  /^.*\.temp$/,        // .temp结尾的文件
  /^.*\.bak$/,         // 备份文件
  /^.*\.old$/,         // 旧文件
  /^thumbs\.db$/,      // Windows缩略图缓存
  /^desktop\.ini$/,    // 桌面配置文件
  /^\.ds_store$/,      // macOS系统文件
  /^.*\.log$/          // 日志文件
];
```

### 3. 聊天软件文件识别

```javascript
// 微信文件识别
const isWeChatFile = (path) => {
  return path.toLowerCase().includes('wechat') ||
         path.includes('WeChat Files');
};

// QQ文件识别
const isQQFile = (path) => {
  return path.toLowerCase().includes('qq') ||
         path.toLowerCase().includes('tencent');
};
```

## ⏰ 时间筛选机制

### 聊天文件时间保护

```javascript
const shouldExcludeByTime = (file, settings) => {
  // 检查是否为聊天文件
  if (!isChatFile(file)) return false;
  
  // 临时文件和日志不受时间限制
  if (file.type === '临时文件' || file.type === '日志文件') {
    return false;
  }
  
  // 计算保留时间
  const monthsToKeep = file.category === 'wechat' ? 
    settings.wechatMonths : settings.qqMonths;
  
  if (monthsToKeep === 0) return false; // 清理全部
  
  // 检查文件时间
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);
  
  return file.lastModified > cutoffDate; // 新文件受保护
};
```

## 🚫 删除安全检查

### 删除前安全验证

```javascript
const isSafeToDelete = (filePath) => {
  const lowerPath = filePath.toLowerCase();
  
  // 系统关键路径检查
  const criticalPaths = [
    'c:\\windows\\system32',
    'c:\\windows\\syswow64',
    'c:\\program files',
    'c:\\program files (x86)',
    'c:\\boot',
    'c:\\recovery'
  ];
  
  // 如果文件在关键路径中，不允许删除
  return !criticalPaths.some(path => lowerPath.startsWith(path));
};
```

## 📊 文件大小评估

### 大文件特殊处理

```javascript
const evaluateFileSize = (sizeBytes) => {
  const GB = 1024 * 1024 * 1024;
  
  if (sizeBytes > 4 * GB) {
    return 'high';    // 超过4GB的文件需要特别注意
  } else if (sizeBytes > 1 * GB) {
    return 'caution'; // 1-4GB的文件建议检查
  } else {
    return 'safe';    // 小于1GB的文件相对安全
  }
};
```

## 🎯 实际应用示例

### 示例1：浏览器缓存文件
```
路径：C:\Users\User\AppData\Local\Google\Chrome\User Data\Default\Cache\f_000001
分类：browser
风险等级：safe
建议：✅ 可安全清理
原因：位于浏览器缓存目录，为临时文件
```

### 示例2：微信聊天图片
```
路径：C:\Users\User\Documents\WeChat Files\wxid_xxx\FileStorage\Image\2024-08\pic.jpg
分类：wechat
风险等级：caution
建议：⚠️ 包含聊天图片，建议备份后清理
原因：包含用户聊天数据，需要时间筛选保护
```

### 示例3：系统页面文件
```
路径：C:\pagefile.sys
分类：system
风险等级：high
建议：❌ 高风险，不建议删除
原因：系统虚拟内存文件，删除会影响系统运行
```

## 🔧 自定义规则扩展

### 添加新的垃圾文件类型

```javascript
// 在scanner.ts中添加新的扫描项
const newScanItem = {
  name: '新软件缓存',
  path: 'C:\\Users\\User\\AppData\\Local\\NewSoftware\\Cache',
  type: '应用缓存',
  category: 'user',
  riskLevel: 'safe',
  suggestion: '✅ 可安全清理'
};
```

## 📋 总结

WinCleaner的文件识别机制基于：

1. **多层安全检查**：路径、扩展名、文件名模式
2. **智能风险评估**：根据位置和类型评估风险
3. **时间保护机制**：保护最近的重要文件
4. **用户数据优先**：谨慎处理可能包含用户数据的文件
5. **系统安全第一**：绝不删除系统关键文件

这确保了清理过程既高效又安全，最大程度保护用户数据和系统稳定性。

## 🔄 实际扫描流程

### 扫描执行步骤

1. **初始化阶段**
   ```javascript
   // 获取扫描路径
   const scanPaths = await getScanPaths(scanType);
   const extensions = getDefaultExtensions();
   const maxDepth = deepScan ? 5 : 3;
   ```

2. **目录遍历阶段**
   ```javascript
   // 递归扫描每个目录
   for (const scanPath of scanPaths) {
     if (fs.existsSync(scanPath)) {
       const files = await scanDirectory(scanPath, extensions, maxDepth, 0);
       allFiles.push(...files);
     }
   }
   ```

3. **文件过滤阶段**
   ```javascript
   // 应用安全检查和分类
   const filteredFiles = files.filter(file => {
     return !isSystemCriticalDirectory(file.path) &&
            (hasJunkExtension(file) || isJunkFile(file.name, file.path));
   });
   ```

4. **风险评估阶段**
   ```javascript
   // 为每个文件分配风险等级
   files.forEach(file => {
     file.riskLevel = getRiskLevel(file.path);
     file.suggestion = getSuggestion(file.path);
     file.canDelete = file.riskLevel !== 'high';
   });
   ```

## 🛠️ 核心算法详解

### 目录安全检查算法

```javascript
const isSystemCriticalDirectory = (dirPath) => {
  const normalizedPath = path.normalize(dirPath).toLowerCase();

  // 系统关键目录列表
  const criticalDirectories = [
    'c:\\windows\\system32',
    'c:\\windows\\syswow64',
    'c:\\program files',
    'c:\\program files (x86)',
    'c:\\boot',
    'c:\\recovery',
    'c:\\$recycle.bin',
    'c:\\system volume information'
  ];

  // 检查是否以关键目录开头
  return criticalDirectories.some(criticalDir =>
    normalizedPath.startsWith(criticalDir)
  );
};
```

### 智能文件类型识别

```javascript
const getFileCategory = (filePath) => {
  const lowerPath = filePath.toLowerCase();

  // 优先级顺序的分类规则
  const categoryRules = [
    { pattern: /wechat/i, category: 'wechat' },
    { pattern: /(qq|tencent)/i, category: 'qq' },
    { pattern: /(chrome|edge|firefox)/i, category: 'browser' },
    { pattern: /downloads/i, category: 'downloads' },
    { pattern: /(backup|\.bak)/i, category: 'backup' },
    { pattern: /(windows|system32)/i, category: 'system' }
  ];

  for (const rule of categoryRules) {
    if (rule.pattern.test(lowerPath)) {
      return rule.category;
    }
  }

  return 'user'; // 默认分类
};
```

## 📈 性能优化策略

### 1. 异步扫描
```javascript
// 使用异步操作避免阻塞UI
const scanDirectory = async (dirPath, extensions, maxDepth, currentDepth) => {
  // 批量处理文件，避免内存溢出
  const batchSize = 100;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    await processBatch(batch);

    // 让出控制权，保持UI响应
    await new Promise(resolve => setImmediate(resolve));
  }
};
```

### 2. 智能深度控制
```javascript
// 根据目录类型调整扫描深度
const getOptimalDepth = (dirPath) => {
  const lowerPath = dirPath.toLowerCase();

  if (lowerPath.includes('temp') || lowerPath.includes('cache')) {
    return 2; // 临时目录浅扫描
  } else if (lowerPath.includes('appdata')) {
    return 3; // 应用数据中等深度
  } else {
    return 1; // 其他目录浅扫描
  }
};
```

## 🔒 安全保护机制

### 多重安全检查

```javascript
const performSafetyChecks = (filePath) => {
  const checks = [
    () => !isSystemCriticalDirectory(filePath),
    () => !isCurrentlyInUse(filePath),
    () => !isSystemFile(filePath),
    () => hasUserPermission(filePath)
  ];

  return checks.every(check => check());
};
```

### 回收站保护

```javascript
// 所有删除操作都使用回收站
const deleteToTrash = async (filePath) => {
  try {
    await shell.trashItem(filePath);
    return { success: true, method: 'trash' };
  } catch (error) {
    // 如果回收站失败，不执行永久删除
    return { success: false, error: error.message };
  }
};
```

这个多层次的安全机制确保了WinCleaner在清理垃圾文件时既彻底又安全。
