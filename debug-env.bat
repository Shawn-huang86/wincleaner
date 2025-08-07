@echo off
chcp 65001 >nul
echo ========================================
echo    WinCleaner 环境诊断工具
echo ========================================
echo.

echo 🔍 系统信息:
echo    操作系统: %OS%
echo    计算机名: %COMPUTERNAME%
echo    用户名: %USERNAME%
echo    当前目录: %CD%
echo    当前时间: %DATE% %TIME%
echo.

echo 🔍 检查 Node.js 安装:
echo.
echo [测试1] 检查 node 命令...
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 node 命令
    echo    Node.js 可能未安装或未添加到 PATH
) else (
    echo ✅ 找到 node 命令
    for /f "tokens=*" %%i in ('where node') do echo    路径: %%i
)

echo.
echo [测试2] 检查 node 版本...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ node --version 失败
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js 版本: %%i
)

echo.
echo [测试3] 检查 npm 命令...
where npm >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到 npm 命令
) else (
    echo ✅ 找到 npm 命令
    for /f "tokens=*" %%i in ('where npm') do echo    路径: %%i
)

echo.
echo [测试4] 检查 npm 版本...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm --version 失败
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm 版本: %%i
)

echo.
echo 🔍 检查项目文件:
echo.
if exist "package.json" (
    echo ✅ 找到 package.json
) else (
    echo ❌ 未找到 package.json
    echo    请确保在正确的项目目录中运行此脚本
)

if exist "src" (
    echo ✅ 找到 src 目录
) else (
    echo ❌ 未找到 src 目录
)

if exist "electron" (
    echo ✅ 找到 electron 目录
) else (
    echo ❌ 未找到 electron 目录
)

echo.
echo 🔍 检查网络连接:
echo.
echo [测试] ping npm 注册表...
ping -n 1 registry.npmjs.org >nul 2>&1
if errorlevel 1 (
    echo ❌ 无法连接到 npm 注册表
    echo    建议使用国内镜像
) else (
    echo ✅ 网络连接正常
)

echo.
echo 🔍 PATH 环境变量:
echo %PATH%
echo.

echo 🔍 建议的解决方案:
echo.
if not exist "package.json" (
    echo 1. 确保在正确的项目目录中运行脚本
)

where node >nul 2>&1
if errorlevel 1 (
    echo 2. 重新安装 Node.js: https://nodejs.org/
    echo 3. 安装后重启电脑
    echo 4. 检查 Node.js 是否添加到 PATH 环境变量
)

echo 5. 如果网络有问题，设置国内镜像:
echo    npm config set registry https://registry.npmmirror.com
echo.

echo ========================================
echo 诊断完成！请根据上述信息解决问题。
echo ========================================
echo.
pause
