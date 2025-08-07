export const formatFileSize = (bytes: number | string | undefined | null): string => {
  // 确保输入是有效的数字
  const numBytes = typeof bytes === 'number' ? bytes :
                   typeof bytes === 'string' ? parseFloat(bytes) : 0;

  if (!numBytes || numBytes === 0 || isNaN(numBytes)) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = numBytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(size < 10 && unitIndex > 0 ? 2 : 1)} ${units[unitIndex]}`;
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};