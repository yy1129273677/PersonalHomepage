@echo off
REM 一键发布：本机构建 → 上传 dist → 服务器重建 Nginx 容器 → 自检
REM 用法：双击本文件，或在命令行执行 deploy.cmd
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-dist.ps1" %*
pause
