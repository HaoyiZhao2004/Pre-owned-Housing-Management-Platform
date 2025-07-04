@echo off
chcp 65001 > nul
echo ===========================================
echo        二手房中介管理系统启动脚本
echo ===========================================
echo.

echo [1/3] 更新数据库房屋状态...
Get-Content update_house_status.sql | mysql -u root -p671603 -h localhost
if %errorlevel% neq 0 (
    echo 数据库更新失败，请检查MySQL连接
    pause
    exit /b 1
)

echo [2/3] 启动Flask应用...
start "Flask应用" python run.py

echo [3/3] 等待服务启动...
timeout /t 3 /nobreak > nul

echo.
echo ===========================================
echo 系统启动完成！
echo 请在浏览器中访问: http://localhost:5000
echo ===========================================
echo.
echo 按任意键打开浏览器...
pause > nul
start http://localhost:5000 