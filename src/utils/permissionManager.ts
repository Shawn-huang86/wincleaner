/**
 * 权限管理器 - 管理文件访问权限和安全策略
 */
export class PermissionManager {
  // 绝对禁止访问的路径
  private static readonly FORBIDDEN_PATHS = [
    'c:\\windows\\system32',
    'c:\\windows\\syswow64',
    'c:\\windows\\boot',
    'c:\\windows\\recovery',
    'c:\\windows\\winsxs',
    'c:\\program files\\windows defender',
    'c:\\program files\\windows nt',
    'c:\\program files\\common files\\microsoft shared',
    'c:\\programdata\\microsoft\\windows defender',
    'c:\\boot',
    'c:\\recovery',
    'c:\\$recycle.bin\\s-1-5-18', // 系统回收站
  ];

  // 需要特殊权限的路径
  private static readonly RESTRICTED_PATHS = [
    'c:\\program files',
    'c:\\program files (x86)',
    'c:\\programdata',
    'c:\\windows',
    'c:\\users\\all users',
    'c:\\users\\default',
    'c:\\users\\public',
  ];

  // 安全的扫描路径
  private static readonly SAFE_SCAN_PATHS = [
    'c:\\windows\\temp',
    'c:\\windows\\logs',
    'c:\\windows\\softwaredistribution\\download',
    'c:\\windows\\prefetch',
    'c:\\temp',
    'c:\\tmp',
  ];

  // 用户相关的安全路径
  private static readonly USER_SAFE_PATHS = [
    '\\appdata\\local\\temp',
    '\\appdata\\local\\microsoft\\windows\\inetcache',
    '\\appdata\\local\\microsoft\\windows\\temporary internet files',
    '\\appdata\\roaming\\microsoft\\windows\\recent',
    '\\downloads',
    '\\desktop',
    '\\documents',
  ];

  /**
   * 检查路径是否可以安全访问
   */
  static canAccessPath(filePath: string): {
    canAccess: boolean;
    reason: string;
    riskLevel: 'safe' | 'caution' | 'dangerous' | 'forbidden';
  } {
    const lowerPath = filePath.toLowerCase();

    // 检查绝对禁止的路径
    for (const forbiddenPath of this.FORBIDDEN_PATHS) {
      if (lowerPath.startsWith(forbiddenPath)) {
        return {
          canAccess: false,
          reason: '系统关键路径，禁止访问',
          riskLevel: 'forbidden'
        };
      }
    }

    // 检查安全路径
    for (const safePath of this.SAFE_SCAN_PATHS) {
      if (lowerPath.startsWith(safePath)) {
        return {
          canAccess: true,
          reason: '安全的临时文件路径',
          riskLevel: 'safe'
        };
      }
    }

    // 检查用户路径
    const userProfile = this.getCurrentUserProfile().toLowerCase();
    for (const userPath of this.USER_SAFE_PATHS) {
      if (lowerPath.startsWith(userProfile + userPath)) {
        return {
          canAccess: true,
          reason: '用户安全路径',
          riskLevel: 'safe'
        };
      }
    }

    // 检查受限路径
    for (const restrictedPath of this.RESTRICTED_PATHS) {
      if (lowerPath.startsWith(restrictedPath)) {
        return {
          canAccess: true,
          reason: '需要谨慎处理的系统路径',
          riskLevel: 'dangerous'
        };
      }
    }

    // 其他路径
    return {
      canAccess: true,
      reason: '未知路径，建议谨慎处理',
      riskLevel: 'caution'
    };
  }

  /**
   * 检查文件是否可以安全删除
   */
  static canDeleteFile(filePath: string, fileName: string): {
    canDelete: boolean;
    reason: string;
    requiresConfirmation: boolean;
  } {
    const accessCheck = this.canAccessPath(filePath);
    
    if (!accessCheck.canAccess) {
      return {
        canDelete: false,
        reason: accessCheck.reason,
        requiresConfirmation: false
      };
    }

    const lowerName = fileName.toLowerCase();
    const lowerPath = filePath.toLowerCase();

    // 检查关键系统文件
    const criticalFiles = [
      'ntldr', 'bootmgr', 'boot.ini', 'ntdetect.com',
      'pagefile.sys', 'hiberfil.sys', 'swapfile.sys',
      'system.dat', 'user.dat', 'ntuser.dat',
      'autoexec.bat', 'config.sys'
    ];

    if (criticalFiles.includes(lowerName)) {
      return {
        canDelete: false,
        reason: '系统关键文件，不能删除',
        requiresConfirmation: false
      };
    }

    // 检查正在运行的程序文件
    if (lowerName.endsWith('.exe') || lowerName.endsWith('.dll')) {
      if (lowerPath.includes('\\system32\\') || lowerPath.includes('\\syswow64\\')) {
        return {
          canDelete: false,
          reason: '系统程序文件，不能删除',
          requiresConfirmation: false
        };
      }
    }

    // 根据风险级别决定是否需要确认
    switch (accessCheck.riskLevel) {
      case 'safe':
        return {
          canDelete: true,
          reason: '安全删除',
          requiresConfirmation: false
        };
      case 'caution':
        return {
          canDelete: true,
          reason: '建议确认后删除',
          requiresConfirmation: true
        };
      case 'dangerous':
        return {
          canDelete: true,
          reason: '高风险文件，强烈建议确认',
          requiresConfirmation: true
        };
      default:
        return {
          canDelete: false,
          reason: '禁止删除',
          requiresConfirmation: false
        };
    }
  }

  /**
   * 获取当前用户配置文件路径
   */
  private static getCurrentUserProfile(): string {
    if (typeof process !== 'undefined' && process.env.USERPROFILE) {
      return process.env.USERPROFILE;
    }
    if (typeof process !== 'undefined' && process.env.USERNAME) {
      return `C:\\Users\\${process.env.USERNAME}`;
    }
    return 'C:\\Users\\User';
  }

  /**
   * 获取推荐的扫描路径
   */
  static getRecommendedScanPaths(): string[] {
    const userProfile = this.getCurrentUserProfile();
    const paths: string[] = [];

    // 添加系统安全路径
    paths.push(...this.SAFE_SCAN_PATHS);

    // 添加用户安全路径
    this.USER_SAFE_PATHS.forEach(userPath => {
      paths.push(userProfile + userPath);
    });

    // 添加浏览器缓存路径
    const browserPaths = [
      '\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache',
      '\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache',
      '\\AppData\\Local\\Mozilla\\Firefox\\Profiles',
      '\\AppData\\Roaming\\Opera Software\\Opera Stable\\Cache',
    ];

    browserPaths.forEach(browserPath => {
      paths.push(userProfile + browserPath);
    });

    return paths;
  }

  /**
   * 检查是否有足够的权限执行操作
   */
  static async checkPermissions(): Promise<{
    hasAdminRights: boolean;
    canAccessSystemFolders: boolean;
    canDeleteFiles: boolean;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    
    // 在实际的Electron环境中，这里会调用主进程的权限检查
    // 目前返回模拟结果
    const hasAdminRights = true; // 从package.json配置可知请求了管理员权限
    
    if (!hasAdminRights) {
      recommendations.push('建议以管理员身份运行以获得完整功能');
    }

    return {
      hasAdminRights,
      canAccessSystemFolders: hasAdminRights,
      canDeleteFiles: hasAdminRights,
      recommendations
    };
  }

  /**
   * 获取权限状态报告
   */
  static getPermissionReport(): {
    currentUser: string;
    isAdmin: boolean;
    accessiblePaths: string[];
    restrictedPaths: string[];
    safePaths: string[];
  } {
    return {
      currentUser: this.getCurrentUserProfile(),
      isAdmin: true, // 基于配置
      accessiblePaths: this.getRecommendedScanPaths(),
      restrictedPaths: this.RESTRICTED_PATHS,
      safePaths: this.SAFE_SCAN_PATHS
    };
  }

  /**
   * 验证文件操作的安全性
   */
  static validateFileOperation(
    operation: 'read' | 'delete' | 'move',
    filePath: string,
    fileName: string
  ): {
    allowed: boolean;
    reason: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const accessCheck = this.canAccessPath(filePath);
    
    if (!accessCheck.canAccess) {
      return {
        allowed: false,
        reason: accessCheck.reason,
        warnings
      };
    }

    if (operation === 'delete') {
      const deleteCheck = this.canDeleteFile(filePath, fileName);
      
      if (!deleteCheck.canDelete) {
        return {
          allowed: false,
          reason: deleteCheck.reason,
          warnings
        };
      }

      if (deleteCheck.requiresConfirmation) {
        warnings.push('此操作需要用户确认');
      }

      if (accessCheck.riskLevel === 'dangerous') {
        warnings.push('高风险操作，请谨慎处理');
      }
    }

    return {
      allowed: true,
      reason: '操作被允许',
      warnings
    };
  }
}
