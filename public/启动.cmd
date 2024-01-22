@echo off
setlocal enabledelayedexpansion

:: 定义端口
set PORT=3000

:: 检查端口是否被占用
netstat -ano | findstr ":%PORT%"
if errorlevel 1 (
    echo 端口 %PORT% 可用。
) else (
    echo 端口 %PORT% 已被占用，尝试终止该端口的进程。

    :: 获取占用端口的进程ID
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%"') do (
        set PID=%%a
    )

    :: 终止进程
    taskkill /PID !PID! /F
    echo 已终止进程 !PID!。
)

:: 启动anywhere
echo 正在启动服务器...
anywhere -p %PORT%

:: 在默认浏览器中打开页面
::start http://localhost:%PORT%