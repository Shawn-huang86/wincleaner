import React from 'react';
import { render, screen } from '@testing-library/react';
import { SystemDashboard } from '../components/SystemDashboard';
import { ScanItem } from '../types';

// Mock the formatFileSize function
jest.mock('../utils/helpers', () => ({
  formatFileSize: (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}));

describe('SystemDashboard', () => {
  const mockScanHistory = [
    { date: '2023-01-01', itemsFound: 10, spaceFreed: 1024 * 1024 * 100 }, // 100MB
    { date: '2023-01-02', itemsFound: 5, spaceFreed: 1024 * 1024 * 50 }    // 50MB
  ];

  const mockOnShowSettings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display correct total size when no items are selected', () => {
    const scanResults: ScanItem[] = [
      {
        id: 'app-1',
        name: 'Test App 1',
        path: 'C:\\Program Files\\TestApp1',
        size: '100 MB',
        sizeBytes: 100 * 1024 * 1024,
        type: 'application',
        category: 'user',
        riskLevel: 'safe',
        suggestion: '可安全卸载',
        canDelete: true
      },
      {
        id: 'app-2',
        name: 'Test App 2',
        path: 'C:\\Program Files\\TestApp2',
        size: '50 MB',
        sizeBytes: 50 * 1024 * 1024,
        type: 'application',
        category: 'user',
        riskLevel: 'safe',
        suggestion: '可安全卸载',
        canDelete: true
      }
    ];

    const selectedItems = new Set<string>();

    render(
      <SystemDashboard
        scanResults={scanResults}
        selectedItems={selectedItems}
        scanHistory={mockScanHistory}
        onShowSettings={mockOnShowSettings}
      />
    );

    // Should display total size of all scan results
    expect(screen.getByText('150 MB')).toBeTruthy();
    expect(screen.getByText('发现 2 项垃圾文件')).toBeTruthy();
  });

  it('should display correct selected size when items are selected', () => {
    const scanResults: ScanItem[] = [
      {
        id: 'app-1',
        name: 'Test App 1',
        path: 'C:\\Program Files\\TestApp1',
        size: '100 MB',
        sizeBytes: 100 * 1024 * 1024,
        type: 'application',
        category: 'user',
        riskLevel: 'safe',
        suggestion: '可安全卸载',
        canDelete: true
      },
      {
        id: 'app-2',
        name: 'Test App 2',
        path: 'C:\\Program Files\\TestApp2',
        size: '50 MB',
        sizeBytes: 50 * 1024 * 1024,
        type: 'application',
        category: 'user',
        riskLevel: 'safe',
        suggestion: '可安全卸载',
        canDelete: true
      }
    ];

    // Select only the first app (100MB)
    const selectedItems = new Set<string>(['app-1']);

    render(
      <SystemDashboard
        scanResults={scanResults}
        selectedItems={selectedItems}
        scanHistory={mockScanHistory}
        onShowSettings={mockOnShowSettings}
      />
    );

    // Should display selected size instead of total size
    expect(screen.getByText('100 MB')).toBeTruthy();
    expect(screen.getByText('已选择 1 项，共 100 MB')).toBeTruthy();
  });

  it('should display correct selected size when multiple items are selected', () => {
    const scanResults: ScanItem[] = [
      {
        id: 'app-1',
        name: 'Test App 1',
        path: 'C:\\Program Files\\TestApp1',
        size: '100 MB',
        sizeBytes: 100 * 1024 * 1024,
        type: 'application',
        category: 'user',
        riskLevel: 'safe',
        suggestion: '可安全卸载',
        canDelete: true
      },
      {
        id: 'app-2',
        name: 'Test App 2',
        path: 'C:\\Program Files\\TestApp2',
        size: '50 MB',
        sizeBytes: 50 * 1024 * 1024,
        type: 'application',
        category: 'user',
        riskLevel: 'safe',
        suggestion: '可安全卸载',
        canDelete: true
      },
      {
        id: 'app-3',
        name: 'Test App 3',
        path: 'C:\\Program Files\\TestApp3',
        size: '25 MB',
        sizeBytes: 25 * 1024 * 1024,
        type: 'application',
        category: 'user',
        riskLevel: 'caution',
        suggestion: '谨慎卸载',
        canDelete: true
      }
    ];

    // Select first and third apps (100MB + 25MB = 125MB)
    const selectedItems = new Set<string>(['app-1', 'app-3']);

    render(
      <SystemDashboard
        scanResults={scanResults}
        selectedItems={selectedItems}
        scanHistory={mockScanHistory}
        onShowSettings={mockOnShowSettings}
      />
    );

    // Should display combined selected size
    expect(screen.getByText('125 MB')).toBeTruthy();
    expect(screen.getByText('已选择 2 项，共 125 MB')).toBeTruthy();
  });

  it('should display waiting message when no scan results', () => {
    const scanResults: ScanItem[] = [];
    const selectedItems = new Set<string>();

    render(
      <SystemDashboard
        scanResults={scanResults}
        selectedItems={selectedItems}
        scanHistory={mockScanHistory}
        onShowSettings={mockOnShowSettings}
      />
    );

    expect(screen.getByText('待扫描')).toBeTruthy();
    expect(screen.getByText('点击左侧按钮开始扫描')).toBeTruthy();
  });
});
