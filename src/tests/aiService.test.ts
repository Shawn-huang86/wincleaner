import { AIService } from '../services/aiService';
import { AIConfig, AIAnalysisRequest } from '../types';

// Mock fetch for testing
global.fetch = jest.fn();

describe('AIService', () => {
  beforeEach(() => {
    // Reset the service before each test
    AIService.setConfig({
      provider: 'disabled',
      enabled: false,
      apiKey: undefined,
      maxTokens: 1000,
      temperature: 0.1
    });
    
    // Clear cache
    AIService.clearExpiredCache();
    
    // Reset fetch mock
    (fetch as jest.MockedFunction<typeof fetch>).mockReset();
  });

  describe('Configuration', () => {
    it('should set and get configuration correctly', () => {
      const config: AIConfig = {
        provider: 'openai',
        apiKey: process.env.TEST_API_KEY || 'test-key',
        model: 'gpt-4',
        enabled: true,
        maxTokens: 2000,
        temperature: 0.2
      };

      AIService.setConfig(config);
      const retrievedConfig = AIService.getConfig();

      expect(retrievedConfig).toEqual(config);
    });

    it('should check availability correctly', () => {
      // Initially disabled
      expect(AIService.isAvailable()).toBe(false);

      // Enable but no API key
      AIService.setConfig({ enabled: true, provider: 'openai' });
      expect(AIService.isAvailable()).toBe(false);

      // Enable with API key
      AIService.setConfig({ enabled: true, provider: 'openai', apiKey: 'test-key' });
      expect(AIService.isAvailable()).toBe(true);

      // Local provider doesn't need API key
      AIService.setConfig({ enabled: true, provider: 'local' });
      expect(AIService.isAvailable()).toBe(true);
    });
  });

  describe('File Analysis', () => {
    const mockRequest: AIAnalysisRequest = {
      filePath: 'C:\\temp\\test.tmp',
      fileName: 'test.tmp',
      fileSize: 1024,
      fileType: 'file',
      lastModified: new Date('2023-01-01'),
      extension: '.tmp'
    };

    it('should return null when AI is not available', async () => {
      const result = await AIService.analyzeFile(mockRequest);
      expect(result).toBeNull();
    });

    it('should analyze file successfully with OpenAI', async () => {
      // Configure AI service
      AIService.setConfig({
        provider: 'openai',
        apiKey: process.env.TEST_API_KEY || 'test-key',
        enabled: true
      });

      // Mock successful API response
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              confidence: 0.95,
              purpose: '临时文件',
              riskLevel: 'low',
              safetyScore: 90,
              dependencies: [],
              recommendations: ['可以安全删除'],
              analysisTime: new Date().toISOString()
            })
          }
        }]
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await AIService.analyzeFile(mockRequest);

      expect(result).not.toBeNull();
      expect(result?.confidence).toBe(0.95);
      expect(result?.purpose).toBe('临时文件');
      expect(result?.riskLevel).toBe('low');
      expect(result?.safetyScore).toBe(90);
      expect(result?.recommendations).toContain('可以安全删除');
    });

    it('should handle API errors gracefully', async () => {
      AIService.setConfig({
        provider: 'openai',
        apiKey: process.env.TEST_API_KEY || 'test-key',
        enabled: true
      });

      // Clear any existing cache entries for this request
      const cacheKey = `C:\\temp\\test.tmp_1024_${new Date('2023-01-01').getTime()}`;
      AIService.clearCacheByKey(cacheKey);

      // Mock API error
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({})
      } as Response);

      const result = await AIService.analyzeFile(mockRequest);
      expect(result).toBeNull();
    });

    it('should cache analysis results', async () => {
      AIService.setConfig({
        provider: 'openai',
        apiKey: process.env.TEST_API_KEY || 'test-key',
        enabled: true
      });

      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              confidence: 0.8,
              purpose: '测试文件',
              riskLevel: 'medium',
              safetyScore: 70,
              dependencies: [],
              recommendations: ['建议检查'],
              analysisTime: new Date().toISOString()
            })
          }
        }]
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      // Clear any existing cache entries for this request
      const cacheKey = `C:\\temp\\test.tmp_1024_${new Date('2023-01-01').getTime()}`;
      AIService.clearCacheByKey(cacheKey);

      // First call should make API request
      const result1 = await AIService.analyzeFile(mockRequest);
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await AIService.analyzeFile(mockRequest);
      expect(fetch).toHaveBeenCalledTimes(1); // Still 1, no additional call
      
      expect(result1).toEqual(result2);
    });
  });

  describe('Batch Analysis', () => {
    it('should process multiple files in batches', async () => {
      AIService.setConfig({
        provider: 'openai',
        apiKey: process.env.TEST_API_KEY || 'test-key',
        enabled: true
      });

      const requests: AIAnalysisRequest[] = [
        {
          filePath: 'C:\\temp\\file1.tmp',
          fileName: 'file1.tmp',
          fileSize: 1024,
          fileType: 'file',
          lastModified: new Date(),
          extension: '.tmp'
        },
        {
          filePath: 'C:\\temp\\file2.log',
          fileName: 'file2.log',
          fileSize: 2048,
          fileType: 'file',
          lastModified: new Date(),
          extension: '.log'
        }
      ];

      // Mock API responses
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              confidence: 0.9,
              purpose: '临时文件',
              riskLevel: 'low',
              safetyScore: 85,
              dependencies: [],
              recommendations: ['可以删除'],
              analysisTime: new Date().toISOString()
            })
          }
        }]
      };

      (fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValue({
          ok: true,
          json: async () => mockResponse
        } as Response);

      const results = await AIService.analyzeFiles(requests);

      expect(results.size).toBe(2);
      expect(results.has('C:\\temp\\file1.tmp')).toBe(true);
      expect(results.has('C:\\temp\\file2.log')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON responses', async () => {
      AIService.setConfig({
        provider: 'openai',
        apiKey: process.env.TEST_API_KEY || 'test-key',
        enabled: true
      });

      const mockRequest: AIAnalysisRequest = {
        filePath: 'C:\\test\\file.txt',
        fileName: 'file.txt',
        fileSize: 100,
        fileType: 'file',
        lastModified: new Date()
      };

      // Mock response with invalid JSON
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: 'invalid json response'
            }
          }]
        })
      } as Response);

      const result = await AIService.analyzeFile(mockRequest);

      expect(result).not.toBeNull();
      expect(result?.confidence).toBe(0.1); // Default fallback value
      expect(result?.purpose).toBe('解析失败');
    });
  });

  describe('Cache Management', () => {
    it('should clear expired cache entries', () => {
      // This test would require mocking Date.now() to simulate time passage
      // For now, we just test that the method exists and can be called
      expect(() => AIService.clearExpiredCache()).not.toThrow();
    });
  });
});

// Mock jest if not available
if (typeof jest === 'undefined') {
  console.log('Jest not available, skipping tests');
}
