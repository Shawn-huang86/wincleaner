# WinCleaner EXE 打包脚本
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    WinCleaner EXE 打包工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "[1/4] 检查 Node.js 环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 环境正常 ($nodeVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未找到 Node.js" -ForegroundColor Red
    Write-Host "请先安装 Node.js: https://nodejs.org/" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "[2/4] 安装依赖包..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    Write-Host "✅ 依赖安装完成" -ForegroundColor Green
} catch {
    Write-Host "❌ 依赖安装失败" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "[3/4] 构建 React 应用..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "build failed" }
    Write-Host "✅ React 应用构建完成" -ForegroundColor Green
} catch {
    Write-Host "❌ React 构建失败" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "[4/4] 打包 Windows EXE..." -ForegroundColor Yellow
try {
    npm run dist-win
    if ($LASTEXITCODE -ne 0) { throw "dist failed" }
    Write-Host "✅ EXE 打包完成" -ForegroundColor Green
} catch {
    Write-Host "❌ EXE 打包失败" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 打包完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 输出文件位置:" -ForegroundColor Yellow
Write-Host "   - 安装程序: dist-electron\WinCleaner Setup 1.0.0.exe" -ForegroundColor White
Write-Host "   - 可执行文件: dist-electron\win-unpacked\WinCleaner.exe" -ForegroundColor White
Write-Host ""
Write-Host "💡 提示:" -ForegroundColor Yellow
Write-Host "   - 安装程序: 适合分发给其他用户" -ForegroundColor White
Write-Host "   - 可执行文件: 可直接运行，无需安装" -ForegroundColor White
Write-Host ""

Read-Host "按任意键退出"
