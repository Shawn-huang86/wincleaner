<?php
/**
 * WinCleaner 更新检查API
 * 简单的PHP实现，可以部署到任何支持PHP的服务器
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// 版本信息配置
$versionInfo = [
    'version' => '1.1.0',
    'releaseDate' => '2025-01-13T00:00:00Z',
    'downloadUrl' => 'https://your-domain.com/downloads/WinCleaner-Setup-1.1.0.exe',
    'releaseNotes' => [
        '微信QQ清理弹窗布局优化',
        '弹窗高度减少40%，更紧凑美观',
        '改进响应式设计，适配更多屏幕',
        '优化CSS网格布局系统',
        '增强用户体验和界面流畅度'
    ],
    'isRequired' => false,
    'fileSize' => 157286400, // 约150MB
    'changelog' => 'https://your-domain.com/changelog',
    'supportUrl' => 'https://your-domain.com/support'
];

// 处理请求
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // 记录访问日志（可选）
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'userAgent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
    
    // 可以将日志写入文件或数据库
    // file_put_contents('update_check.log', json_encode($logData) . "\n", FILE_APPEND);
    
    // 返回版本信息
    echo json_encode($versionInfo, JSON_PRETTY_PRINT);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
