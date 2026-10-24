#!/bin/bash
# 服务器端更新脚本：重新加载静态文件 + 重建容器 + 自检
#
# 什么时候用：
#   本机跑完 `deploy-dist.ps1`（构建并上传 dist）之后，在服务器上执行本脚本。
#   如果只是替换了 dist 里的文件，其实 nginx 会直接读到新文件（只读挂载），
#   本脚本主要是「重建容器 + 跑一遍自检」，保证状态确定。
#
# 用法：
#   bash ~/homepage/update.sh

set -e
cd "$(dirname "$0")"

echo "===== 1/3 检查 dist ====="
if [ ! -f dist/index.html ]; then
  echo "✗ 没找到 dist/index.html，请先在本地执行 deploy-dist.ps1 上传"
  exit 1
fi
echo "  dist/index.html 存在（$(du -sh dist | cut -f1)）"

echo
echo "===== 2/3 重建容器 ====="
docker compose up -d --force-recreate
echo

echo "===== 3/3 自检 ====="
sleep 2
code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/)
echo "  首页(期望 200)          : $code"
cache=$(curl -sI http://127.0.0.1:3000/ | grep -i "^cache-control" | tr -d '\r')
echo "  入口缓存(期望 no-cache) : ${cache:-未设置}"
img=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/images/hero-bg.jpg)
echo "  背景图(期望 200)        : $img"
gz=$(curl -sI -H "Accept-Encoding: gzip" http://127.0.0.1:3000/ | grep -i "content-encoding" | tr -d '\r')
echo "  gzip(期望 gzip)         : ${gz:-未启用}"
echo
echo "更新完成。访问：http://8.147.114.201:3000"
