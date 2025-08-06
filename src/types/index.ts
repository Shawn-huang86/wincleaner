export interface ScanItem {
  id: string;
  name: string;
  path: string;
  size: string;
  sizeBytes: number;
  type: string;
  category: 'system' | 'browser' | 'user' | 'registry' | 'backup' | 'downloads';
  riskLevel: 'safe' | 'caution' | 'high' | 'unknown';
  suggestion: string;
}

export interface ScanProgress {
  current: number;
  total: number;
  currentItem: string;
}

export interface CleaningProgress {
  current: number;
  total: number;
}

export interface CategoryStats {
  category: string;
  displayName: string;
  count: number;
  totalSize: number;
  icon: string;
  color: string;
}