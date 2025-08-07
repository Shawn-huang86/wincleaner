@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: 创建日志文件
set LOG_FILE=build-log-%DATE:~0,4%%DATE:~5,2%%DATE:~8,2%-%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%.txt
set LOG_FILE=%LOG_FILE: =0%

echo ========================================
echo    WinCleaner EXE 打包工具 (详细日志版)
echo ========================================
echo.
echo 日志文件: %LOG_FILE%
echo 开始时间: %DATE% %TIME%
echo.

:: 开始记录日志
echo [%DATE% %TIME%] 开始打包过程 > %LOG_FILE%
echo [%DATE% %TIME%] 当前目录: %CD% >> %LOG_FILE%
echo [%DATE% %TIME%] 用户: %USERNAME% >> %LOG_FILE%
echo [%DATE% %TIME%] 计算机: %COMPUTERNAME% >> %LOG_FILE%
echo. >> %LOG_FILE%

echo [1/5] 检查环境...
echo [%DATE% %TIME%] === 环境检查 === >> %LOG_FILE%

:: 检查Node.js
echo 检查 Node.js...
node --version >temp_node.txt 2>&1
if errorlevel 1 (
    echo ❌ Node.js 检查失败 >> %LOG_FILE%
    type temp_node.txt >> %LOG_FILE%
    echo.
    echo ❌ 错误: 未找到 Node.js
    echo 详细错误信息已保存到: %LOG_FILE%
    echo.
    echo 请按以下步骤解决:
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载并安装 LTS 版本
    echo 3. 安装时确保勾选 "Add to PATH"
    echo 4. 安装完成后重启电脑
    echo 5. 重新运行此脚本
    echo.
    del temp_node.txt >nul 2>&1
    pause
    exit /b 1
) else (
    type temp_node.txt >> %LOG_FILE%
    for /f "tokens=*" %%i in (temp_node.txt) do set NODE_VER=%%i
    echo ✅ Node.js: !NODE_VER!
    echo [%DATE% %TIME%] Node.js 版本: !NODE_VER! >> %LOG_FILE%
)
del temp_node.txt >nul 2>&1

:: 检查npm
echo 检查 npm...
npm --version >temp_npm.txt 2>&1
if errorlevel 1 (
    echo ❌ npm 检查失败 >> %LOG_FILE%
    type temp_npm.txt >> %LOG_FILE%
    echo ❌ npm 不可用
    del temp_npm.txt >nul 2>&1
    pause
    exit /b 1
) else (
    type temp_npm.txt >> %LOG_FILE%
    for /f "tokens=*" %%i in (temp_npm.txt) do set NPM_VER=%%i
    echo ✅ npm: !NPM_VER!
    echo [%DATE% %TIME%] npm 版本: !NPM_VER! >> %LOG_FILE%
)
del temp_npm.txt >nul 2>&1

:: 检查项目文件
echo 检查项目文件...
echo [%DATE% %TIME%] === 项目文件检查 === >> %LOG_FILE%
if not exist "package.json" (
    echo ❌ 未找到 package.json >> %LOG_FILE%
    echo ❌ 错误: 未找到 package.json
    echo 请确保在正确的项目目录中运行此脚本
    pause
    exit /b 1
) else (
    echo ✅ package.json 存在 >> %LOG_FILE%
    echo ✅ 找到 package.json
)

echo.
echo [2/5] 清理旧文件...
echo [%DATE% %TIME%] === 清理阶段 === >> %LOG_FILE%
if exist "dist" (
    echo 删除旧的 dist 目录...
    rmdir /s /q "dist" 2>>%LOG_FILE%
    echo [%DATE% %TIME%] 删除 dist 目录 >> %LOG_FILE%
)
if exist "dist-electron" (
    echo 删除旧的 dist-electron 目录...
    rmdir /s /q "dist-electron" 2>>%LOG_FILE%
    echo [%DATE% %TIME%] 删除 dist-electron 目录 >> %LOG_FILE%
)

echo.
echo [3/5] 安装依赖...
echo [%DATE% %TIME%] === 依赖安装 === >> %LOG_FILE%
echo 正在执行: npm install
echo 这可能需要几分钟，请耐心等待...
echo [%DATE% %TIME%] 开始 npm install >> %LOG_FILE%

npm install >>%LOG_FILE% 2>&1
if errorlevel 1 (
    echo [%DATE% %TIME%] npm install 失败，错误代码: %errorlevel% >> %LOG_FILE%
    echo.
    echo ❌ 依赖安装失败
    echo 详细错误信息已保存到: %LOG_FILE%
    echo.
    echo 可能的解决方案:
    echo 1. 检查网络连接
    echo 2. 使用国内镜像: npm config set registry https://registry.npmmirror.com
    echo 3. 清除缓存: npm cache clean --force
    echo 4. 删除 node_modules 文件夹后重试
    echo.
    pause
    exit /b 1
) else (
    echo [%DATE% %TIME%] npm install 成功完成 >> %LOG_FILE%
    echo ✅ 依赖安装完成
)

echo.
echo [4/5] 构建应用...
echo [%DATE% %TIME%] === React 构建 === >> %LOG_FILE%
echo 正在执行: npm run build
echo [%DATE% %TIME%] 开始 npm run build >> %LOG_FILE%

npm run build >>%LOG_FILE% 2>&1
if errorlevel 1 (
    echo [%DATE% %TIME%] npm run build 失败，错误代码: %errorlevel% >> %LOG_FILE%
    echo.
    echo ❌ React 构建失败
    echo 详细错误信息已保存到: %LOG_FILE%
    echo.
    pause
    exit /b 1
) else (
    echo [%DATE% %TIME%] npm run build 成功完成 >> %LOG_FILE%
    echo ✅ React 应用构建完成
)

echo.
echo [5/5] 打包 EXE...
echo [%DATE% %TIME%] === Electron 打包 === >> %LOG_FILE%
echo 正在执行: npm run dist-win
echo 首次打包需要下载 Electron 运行时，请耐心等待...
echo [%DATE% %TIME%] 开始 npm run dist-win >> %LOG_FILE%

npm run dist-win >>%LOG_FILE% 2>&1
if errorlevel 1 (
    echo [%DATE% %TIME%] npm run dist-win 失败，错误代码: %errorlevel% >> %LOG_FILE%
    echo.
    echo ❌ EXE 打包失败
    echo 详细错误信息已保存到: %LOG_FILE%
    echo.
    echo 可能的解决方案:
    echo 1. 检查磁盘空间是否充足 (需要至少 2GB)
    echo 2. 暂时关闭杀毒软件
    echo 3. 检查网络连接
    echo 4. 查看日志文件了解详细错误
    echo.
    pause
    exit /b 1
) else (
    echo [%DATE% %TIME%] npm run dist-win 成功完成 >> %LOG_FILE%
    echo ✅ EXE 打包完成
)

echo.
echo ========================================
echo 🎉 打包成功完成！
echo ========================================
echo [%DATE% %TIME%] === 打包完成 === >> %LOG_FILE%
echo.

:: 检查输出文件
echo 📁 输出文件检查:
if exist "dist-electron\WinCleaner Setup 1.0.0.exe" (
    for %%A in ("dist-electron\WinCleaner Setup 1.0.0.exe") do (
        echo ✅ 安装程序: dist-electron\WinCleaner Setup 1.0.0.exe (%%~zA 字节)
        echo [%DATE% %TIME%] 安装程序大小: %%~zA 字节 >> %LOG_FILE%
    )
) else (
    echo ❌ 未找到安装程序文件
    echo [%DATE% %TIME%] 警告: 未找到安装程序文件 >> %LOG_FILE%
)

if exist "dist-electron\win-unpacked\WinCleaner.exe" (
    for %%A in ("dist-electron\win-unpacked\WinCleaner.exe") do (
        echo ✅ 可执行文件: dist-electron\win-unpacked\WinCleaner.exe (%%~zA 字节)
        echo [%DATE% %TIME%] 可执行文件大小: %%~zA 字节 >> %LOG_FILE%
    )
) else (
    echo ❌ 未找到可执行文件
    echo [%DATE% %TIME%] 警告: 未找到可执行文件 >> %LOG_FILE%
)

echo.
echo 📝 完整日志已保存到: %LOG_FILE%
echo 🕒 完成时间: %DATE% %TIME%
echo [%DATE% %TIME%] 打包过程完成 >> %LOG_FILE%

echo.
pause
