import { ApplicationManager } from '../services/applicationManager';

describe('ApplicationManager', () => {
  beforeEach(() => {
    // 重置应用管理器状态
    ApplicationManager.clearData();
  });

  describe('formatSize', () => {
    it('should format bytes correctly', () => {
      expect(ApplicationManager.formatSize(0)).toBe('0 B');
      expect(ApplicationManager.formatSize(1024)).toBe('1 KB');
      expect(ApplicationManager.formatSize(1024 * 1024)).toBe('1 MB');
      expect(ApplicationManager.formatSize(250 * 1024 * 1024)).toBe('250 MB');
      expect(ApplicationManager.formatSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('getApplicationStats', () => {
    it('should calculate correct statistics', () => {
      // 设置模拟应用数据
      ApplicationManager.setTestData([
        {
          name: 'Test App 1',
          version: '1.0.0',
          publisher: 'Test Publisher',
          installPath: 'C:\\Program Files\\TestApp1',
          installDate: new Date('2023-01-01'),
          size: 100 * 1024 * 1024, // 100MB
          isSystemApp: false,
          category: 'Utility',
          aiAnalysis: {
            safeToUninstall: true,
            importance: 'low',
            systemImpact: 'low',
            usageFrequency: 'rarely',
            recommendations: ['可安全卸载'],
            dependencies: [],
            alternativeApps: [],
            confidence: 0.9
          }
        },
        {
          name: 'System App',
          version: '2.0.0',
          publisher: 'Microsoft',
          installPath: 'C:\\Windows\\System32\\SystemApp',
          installDate: new Date('2023-01-01'),
          size: 50 * 1024 * 1024, // 50MB
          isSystemApp: true,
          category: 'System',
          aiAnalysis: {
            safeToUninstall: false,
            importance: 'critical',
            systemImpact: 'critical',
            usageFrequency: 'daily',
            recommendations: ['不建议卸载'],
            dependencies: [],
            alternativeApps: [],
            confidence: 0.95
          }
        }
      ]);

      const stats = ApplicationManager.getApplicationStats();
      
      expect(stats.total).toBe(2);
      expect(stats.systemApps).toBe(1);
      expect(stats.userApps).toBe(1);
      expect(stats.totalSize).toBe(150 * 1024 * 1024); // 150MB
      expect(stats.categories['Utility']).toBe(1);
      expect(stats.categories['System']).toBe(1);
    });
  });

  describe('getRecommendedForUninstall', () => {
    it('should return only safe-to-uninstall applications', () => {
      ApplicationManager.setTestData([
        {
          name: 'Safe App',
          version: '1.0.0',
          publisher: 'Test Publisher',
          installPath: 'C:\\Program Files\\SafeApp',
          installDate: new Date('2023-01-01'),
          size: 100 * 1024 * 1024,
          isSystemApp: false,
          category: 'Gaming',
          aiAnalysis: {
            safeToUninstall: true,
            importance: 'low',
            systemImpact: 'low',
            usageFrequency: 'rarely',
            recommendations: ['可安全卸载'],
            dependencies: [],
            alternativeApps: [],
            confidence: 0.9
          }
        },
        {
          name: 'Critical App',
          version: '1.0.0',
          publisher: 'Test Publisher',
          installPath: 'C:\\Program Files\\CriticalApp',
          installDate: new Date('2023-01-01'),
          size: 100 * 1024 * 1024,
          isSystemApp: false,
          category: 'System',
          aiAnalysis: {
            safeToUninstall: false,
            importance: 'critical',
            systemImpact: 'critical',
            usageFrequency: 'daily',
            recommendations: ['不建议卸载'],
            dependencies: [],
            alternativeApps: [],
            confidence: 0.95
          }
        }
      ]);

      const recommended = ApplicationManager.getRecommendedForUninstall();
      expect(recommended).toHaveLength(1);
      expect(recommended[0].name).toBe('Safe App');
    });
  });

  describe('filterApplications', () => {
    beforeEach(() => {
      ApplicationManager.setTestData([
        {
          name: 'Gaming App',
          version: '1.0.0',
          publisher: 'Game Publisher',
          installPath: 'C:\\Program Files\\GamingApp',
          installDate: new Date('2023-01-01'),
          size: 200 * 1024 * 1024, // 200MB
          isSystemApp: false,
          category: 'Gaming'
        },
        {
          name: 'Small Utility',
          version: '1.0.0',
          publisher: 'Utility Publisher',
          installPath: 'C:\\Program Files\\SmallUtility',
          installDate: new Date('2023-01-01'),
          size: 10 * 1024 * 1024, // 10MB
          isSystemApp: false,
          category: 'Utility'
        }
      ]);
    });

    it('should filter by category', () => {
      const gamingApps = ApplicationManager.filterApplications({ category: 'Gaming' });
      expect(gamingApps).toHaveLength(1);
      expect(gamingApps[0].name).toBe('Gaming App');
    });

    it('should filter by minimum size', () => {
      const largeApps = ApplicationManager.filterApplications({ minSize: 100 * 1024 * 1024 });
      expect(largeApps).toHaveLength(1);
      expect(largeApps[0].name).toBe('Gaming App');
    });

    it('should filter by system app status', () => {
      const userApps = ApplicationManager.filterApplications({ systemApp: false });
      expect(userApps).toHaveLength(2);
    });
  });
});
