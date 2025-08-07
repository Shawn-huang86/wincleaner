@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo    WinCleaner 分步打包工具
echo ========================================
echo.
echo 此脚本将分步执行打包过程，每步都会暂停等待您确认。
echo 如果某一步失败，您可以看到具体的错误信息。
echo.
pause

:STEP1
echo.
echo ========================================
echo 步骤 1: 环境检查
echo ========================================
echo.

echo 检查 Node.js...
node --version
if errorlevel 1 (
    echo.
    echo ❌ Node.js 检查失败！
    echo.
    echo 解决方案:
    echo 1. 下载 Node.js: https://nodejs.org/
    echo 2. 安装 LTS 版本
    echo 3. 重启电脑
    echo 4. 重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo 检查 npm...
npm --version
if errorlevel 1 (
    echo.
    echo ❌ npm 检查失败！
    pause
    exit /b 1
)

echo 检查项目文件...
if not exist "package.json" (
    echo ❌ 未找到 package.json
    echo 请确保在正确的项目目录中运行此脚本
    pause
    exit /b 1
)
echo ✅ 找到 package.json

echo.
echo ✅ 环境检查完成！
echo.
echo 按任意键继续到步骤 2...
pause >nul

:STEP2
echo.
echo ========================================
echo 步骤 2: 清理旧文件
echo ========================================
echo.

if exist "dist" (
    echo 发现旧的 dist 目录，正在删除...
    rmdir /s /q "dist"
    echo ✅ 已删除 dist 目录
)

if exist "dist-electron" (
    echo 发现旧的 dist-electron 目录，正在删除...
    rmdir /s /q "dist-electron"
    echo ✅ 已删除 dist-electron 目录
)

if exist "node_modules" (
    echo 发现 node_modules 目录
    echo.
    echo 是否要删除 node_modules 目录重新安装？(推荐首次打包时执行)
    echo [Y] 是  [N] 否
    set /p CLEAN_MODULES=请选择: 
    if /i "!CLEAN_MODULES!"=="Y" (
        echo 正在删除 node_modules...
        rmdir /s /q "node_modules"
        echo ✅ 已删除 node_modules 目录
    )
)

echo.
echo ✅ 清理完成！
echo.
echo 按任意键继续到步骤 3...
pause >nul

:STEP3
echo.
echo ========================================
echo 步骤 3: 安装依赖
echo ========================================
echo.

echo 正在执行: npm install
echo.
echo 注意: 这可能需要几分钟时间，请耐心等待...
echo 如果下载速度很慢，可以按 Ctrl+C 中断，然后设置国内镜像:
echo npm config set registry https://registry.npmmirror.com
echo.

npm install
if errorlevel 1 (
    echo.
    echo ❌ npm install 失败！
    echo.
    echo 常见解决方案:
    echo 1. 检查网络连接
    echo 2. 设置国内镜像: npm config set registry https://registry.npmmirror.com
    echo 3. 清除缓存: npm cache clean --force
    echo 4. 重新运行此脚本并选择删除 node_modules
    echo.
    echo 是否要尝试设置国内镜像并重试？[Y/N]
    set /p RETRY=请选择: 
    if /i "!RETRY!"=="Y" (
        echo 设置国内镜像...
        npm config set registry https://registry.npmmirror.com
        echo 重新安装依赖...
        npm install
        if errorlevel 1 (
            echo ❌ 仍然失败，请检查网络连接
            pause
            exit /b 1
        )
    ) else (
        pause
        exit /b 1
    )
)

echo.
echo ✅ 依赖安装完成！
echo.
echo 按任意键继续到步骤 4...
pause >nul

:STEP4
echo.
echo ========================================
echo 步骤 4: 构建 React 应用
echo ========================================
echo.

echo 正在执行: npm run build
echo.

npm run build
if errorlevel 1 (
    echo.
    echo ❌ React 构建失败！
    echo.
    echo 可能的原因:
    echo 1. 代码中有语法错误
    echo 2. 缺少必要的依赖
    echo 3. TypeScript 类型错误
    echo.
    echo 请检查上面的错误信息，修复后重新运行。
    pause
    exit /b 1
)

echo.
echo ✅ React 应用构建完成！
echo.
echo 检查构建输出...
if exist "dist" (
    echo ✅ 找到 dist 目录
    dir dist
) else (
    echo ❌ 未找到 dist 目录
    pause
    exit /b 1
)

echo.
echo 按任意键继续到最后一步...
pause >nul

:STEP5
echo.
echo ========================================
echo 步骤 5: 打包 Windows EXE
echo ========================================
echo.

echo 正在执行: npm run dist-win
echo.
echo 注意: 
echo - 首次打包需要下载 Electron 运行时 (~100MB)
echo - 整个过程可能需要 10-20 分钟
echo - 请确保网络连接稳定
echo - 请确保有足够的磁盘空间 (至少 2GB)
echo.

npm run dist-win
if errorlevel 1 (
    echo.
    echo ❌ EXE 打包失败！
    echo.
    echo 常见解决方案:
    echo 1. 检查磁盘空间是否充足
    echo 2. 暂时关闭杀毒软件
    echo 3. 检查网络连接
    echo 4. 重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🎉 打包完成！
echo ========================================
echo.

echo 检查输出文件...
if exist "dist-electron" (
    echo ✅ 找到 dist-electron 目录
    echo.
    echo 📁 输出文件:
    
    if exist "dist-electron\WinCleaner Setup 1.0.0.exe" (
        for %%A in ("dist-electron\WinCleaner Setup 1.0.0.exe") do (
            echo ✅ 安装程序: WinCleaner Setup 1.0.0.exe (%%~zA 字节)
        )
    ) else (
        echo ❌ 未找到安装程序文件
    )
    
    if exist "dist-electron\win-unpacked\WinCleaner.exe" (
        for %%A in ("dist-electron\win-unpacked\WinCleaner.exe") do (
            echo ✅ 可执行文件: win-unpacked\WinCleaner.exe (%%~zA 字节)
        )
    ) else (
        echo ❌ 未找到可执行文件
    )
    
    echo.
    echo 📂 完整目录结构:
    dir "dist-electron" /b
    
) else (
    echo ❌ 未找到 dist-electron 目录
)

echo.
echo 🎯 下一步:
echo 1. 测试安装程序: 双击 "WinCleaner Setup 1.0.0.exe"
echo 2. 测试绿色版: 进入 win-unpacked 文件夹，双击 "WinCleaner.exe"
echo.

pause
