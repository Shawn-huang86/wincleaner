@echo off
chcp 65001 >nul
echo ========================================
echo    WinCleaner v1.1.0 升级构建脚本
echo ========================================
echo.

echo [1/6] 检查环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到 Node.js，请先安装 Node.js
    echo 下载地址：https://nodejs.org
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到 npm
    pause
    exit /b 1
)

echo ✅ Node.js 和 npm 已安装

echo.
echo [2/6] 清理旧构建文件...
if exist "dist" rmdir /s /q "dist"
if exist "dist-electron" rmdir /s /q "dist-electron"
echo ✅ 清理完成

echo.
echo [3/6] 安装/更新依赖...
call npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

echo.
echo [4/6] 构建 React 应用...
call npm run build
if errorlevel 1 (
    echo ❌ React 应用构建失败
    pause
    exit /b 1
)
echo ✅ React 应用构建完成

echo.
echo [5/6] 构建 Electron 安装包...
call npm run dist-win
if errorlevel 1 (
    echo ❌ Electron 安装包构建失败
    pause
    exit /b 1
)
echo ✅ Electron 安装包构建完成

echo.
echo [6/6] 构建完成！
echo.
echo 📦 生成的文件位置：
echo    dist-electron/
echo.
if exist "dist-electron" (
    echo 📁 构建输出目录内容：
    dir "dist-electron" /b
    echo.
    echo 🎉 WinCleaner v1.1.0 构建成功！
    echo.
    echo 📋 版本更新内容：
    echo    • 微信QQ清理弹窗布局优化
    echo    • 弹窗高度减少40%%，更紧凑
    echo    • 改进响应式设计和用户体验
    echo.
    echo 💡 提示：
    echo    • 安装包文件：WinCleaner Setup 1.1.0.exe
    echo    • 可以直接分发给用户使用
    echo    • 支持从v1.0.0自动升级
) else (
    echo ❌ 构建目录未找到，可能构建失败
)

echo.
echo 按任意键退出...
pause >nul
