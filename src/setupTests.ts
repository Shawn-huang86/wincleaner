// Jest setup file
import '@testing-library/jest-dom';

// Mock global fetch
Object.defineProperty(global, 'fetch', {
  value: jest.fn(),
  writable: true,
});

// Setup global test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset fetch mock
  if (global.fetch) {
    (global.fetch as jest.Mock).mockClear();
  }
});

afterEach(() => {
  // Cleanup after each test
  jest.clearAllTimers();
});

// Mock console methods to reduce noise during tests
const originalConsole = { ...console };
beforeEach(() => {
  global.console.log = jest.fn();
  global.console.error = jest.fn();
  global.console.warn = jest.fn();
  global.console.info = jest.fn();
  global.console.debug = jest.fn();
});

afterEach(() => {
  global.console = originalConsole;
});

// Mock process.env for testing
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});