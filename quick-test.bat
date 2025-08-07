@echo off
echo ========================================
echo    快速环境测试
echo ========================================
echo.

echo 测试 1: Node.js
node --version
echo 错误级别: %errorlevel%
echo.

echo 测试 2: npm
npm --version  
echo 错误级别: %errorlevel%
echo.

echo 测试 3: 项目文件
if exist package.json (
    echo ✅ 找到 package.json
) else (
    echo ❌ 未找到 package.json
)
echo.

echo 测试 4: 简单 npm 命令
npm --help >nul
echo npm help 错误级别: %errorlevel%
echo.

echo 测试 5: 当前目录
echo 当前目录: %CD%
echo.

echo 测试 6: 权限测试
echo test > test_file.txt
if exist test_file.txt (
    echo ✅ 有写入权限
    del test_file.txt
) else (
    echo ❌ 没有写入权限
)
echo.

echo 测试完成！
pause
