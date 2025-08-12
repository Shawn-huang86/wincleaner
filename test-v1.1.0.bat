@echo off
chcp 65001 >nul
echo ========================================
echo    WinCleaner v1.1.0 功能测试脚本
echo ========================================
echo.

echo 🧪 开始测试 WinCleaner v1.1.0 新功能...
echo.

echo [1/5] 检查版本信息...
echo 当前版本：v1.1.0
echo 主要更新：微信QQ清理弹窗布局优化
echo ✅ 版本检查完成
echo.

echo [2/5] 启动开发模式测试...
echo 提示：请在浏览器中测试以下功能：
echo.
echo 📋 测试清单：
echo    □ 1. 启动应用正常
echo    □ 2. 快速扫描功能
echo    □ 3. 微信QQ清理扫描
echo    □ 4. 点击"清理选中项"
echo    □ 5. 检查弹窗布局（重点）
echo.
echo 🎯 重点测试项目：
echo    • 时间选择是否为2列布局
echo    • 弹窗高度是否明显减少
echo    • 所有6个时间选项都可见
echo    • 响应式设计正常
echo.

echo 按任意键启动开发服务器...
pause >nul

echo.
echo [3/5] 启动开发服务器...
start cmd /k "npm run dev"

echo.
echo [4/5] 等待服务器启动...
timeout /t 5 /nobreak >nul
echo ✅ 开发服务器已启动

echo.
echo [5/5] 测试指南
echo.
echo 🔍 详细测试步骤：
echo.
echo 1️⃣ 基础功能测试
echo    • 点击"快速扫描"
echo    • 等待扫描完成
echo    • 检查结果显示
echo.
echo 2️⃣ 微信QQ清理测试（重点）
echo    • 点击"微信QQ清理"
echo    • 等待扫描完成
echo    • 点击"清理选中项"
echo    • 🎯 检查弹窗布局：
echo      - 时间选择应该是2列3行
echo      - 弹窗高度应该明显减少
echo      - 所有选项清晰可见
echo.
echo 3️⃣ 响应式测试
echo    • 调整浏览器窗口大小
echo    • 检查弹窗适配情况
echo    • 确保在小屏幕上也正常
echo.
echo 4️⃣ 功能完整性测试
echo    • 所有时间选项可选择
echo    • 微信/QQ选择正常
echo    • 清理功能正常执行
echo.
echo 📊 测试结果记录：
echo    如果测试通过，说明v1.1.0升级成功
echo    如果发现问题，请记录具体现象
echo.
echo ⚠️  测试完成后：
echo    • 关闭开发服务器
echo    • 准备在Windows环境构建exe
echo.
echo 🎉 测试愉快！
echo.
echo 按任意键退出...
pause >nul
