@echo off
echo ========================================
echo    WinCleaner EXE 打包工具
echo ========================================
echo.

echo [1/4] 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 环境正常

echo.
echo [2/4] 安装依赖包...
npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

echo.
echo [3/4] 构建 React 应用...
npm run build
if errorlevel 1 (
    echo ❌ React 构建失败
    pause
    exit /b 1
)
echo ✅ React 应用构建完成

echo.
echo [4/4] 打包 Windows EXE...
npm run dist-win
if errorlevel 1 (
    echo ❌ EXE 打包失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🎉 打包完成！
echo ========================================
echo.
echo 📁 输出文件位置:
echo    - 安装程序: dist-electron\WinCleaner Setup 1.0.0.exe
echo    - 可执行文件: dist-electron\win-unpacked\WinCleaner.exe
echo.
echo 💡 提示:
echo    - 安装程序: 适合分发给其他用户
echo    - 可执行文件: 可直接运行，无需安装
echo.

pause
