<#
.SYNOPSIS
    本机构建 → 打包 dist → 上传云服务器 → 重建 Nginx 容器 → 自检

.DESCRIPTION
    本项目的部署形态：
      - 构建在本地做（服务器 2G 内存 + 3M 带宽，不装 Node、不跑 npm install）
      - 服务器只放三样东西：dist/、nginx.conf、docker-compose.yml，用 nginx 容器托管
      - 对外端口 3000

.PARAMETER SkipBuild
    跳过 npm run build，直接上传现有 dist（改完文案只想快速发布时用）

.PARAMETER Server
    服务器公网 IP

.PARAMETER Key
    SSH 私钥路径

.PARAMETER RemoteDir
    服务器上的部署目录

.EXAMPLE
    .\deploy-dist.ps1
    只更新静态文件（不重新构建）
    .\deploy-dist.ps1 -SkipBuild
#>
[CmdletBinding()]
param(
    [string]$Server = "8.147.114.201",
    [string]$Key = "E:\study\project\.ssh-deploy\jisu_deploy",
    [string]$RemoteDir = "/root/homepage",
    [string]$SshPort = "22",
    [switch]$SkipBuild
)

# 注意：不用 Stop，因为 npm / tar / ssh 会往 stderr 写正常进度，Stop 会误判成错误
$ErrorActionPreference = "Continue"
$root = $PSScriptRoot
Set-Location $root

function Step($text) { Write-Host "`n===== $text =====" -ForegroundColor Cyan }
function Fail($text) { Write-Host "✗ $text" -ForegroundColor Red; exit 1 }

# ---------- 1. 构建 ----------
if (-not $SkipBuild) {
    Step "1/5 构建（npm run build）"
    npm run build
    if ($LASTEXITCODE -ne 0) { Fail "构建失败，请先修掉 typecheck / build 报错" }
} else {
    Step "1/5 跳过构建（-SkipBuild）"
}

if (-not (Test-Path "$root\dist\index.html")) { Fail "没找到 dist/index.html，构建可能没成功" }

# ---------- 2. 打包 ----------
Step "2/5 打包 dist"
$archive = Join-Path $env:TEMP "homepage-dist.tar.gz"
Remove-Item $archive -ErrorAction SilentlyContinue
# -C 指定目录、只存相对路径，避免 Windows 绝对路径进压缩包（之前踩过 docker load 的坑）
tar -czf $archive -C "$root\dist" .
if ($LASTEXITCODE -ne 0) { Fail "打包失败" }
$sizeMB = [math]::Round((Get-Item $archive).Length / 1MB, 2)
Write-Host "  产物：$archive（$sizeMB MB）"

# ---------- 3. 上传 ----------
Step "3/5 上传到服务器"
$target = "root@$Server"
$sshArgs = @("-i", $Key, "-o", "BatchMode=yes", "-o", "StrictHostKeyChecking=accept-new", "-p", $SshPort)
$scpArgs = @("-i", $Key, "-o", "BatchMode=yes", "-o", "StrictHostKeyChecking=accept-new", "-P", $SshPort)

& scp @scpArgs $archive "$target`:/tmp/homepage-dist.tar.gz"
if ($LASTEXITCODE -ne 0) { Fail "上传 dist 失败（检查网络 / 私钥路径）" }

foreach ($file in @("nginx.conf", "docker-compose.yml", "update.sh")) {
    & scp @scpArgs "$root\$file" "$target`:/tmp/$file"
    if ($LASTEXITCODE -ne 0) { Fail "上传 $file 失败" }
}
Write-Host "  dist + 3 个配置文件已上传"

# ---------- 4. 服务器端部署 ----------
Step "4/5 服务器端部署"
# 远端脚本用 base64 传过去执行，彻底避免 PowerShell 引号被吃掉的问题
$remote = @'
set -e
mkdir -p __REMOTE_DIR__
cd __REMOTE_DIR__
rm -rf dist && mkdir -p dist
tar -xzf /tmp/homepage-dist.tar.gz -C dist
cp -f /tmp/nginx.conf /tmp/docker-compose.yml /tmp/update.sh __REMOTE_DIR__/
chmod +x update.sh
docker compose up -d --force-recreate
rm -f /tmp/homepage-dist.tar.gz /tmp/nginx.conf /tmp/docker-compose.yml /tmp/update.sh
'@
$remote = $remote.Replace("__REMOTE_DIR__", $RemoteDir)
# 关键：转成 LF 再发给 bash，否则每行末尾的 \r 会被当成参数（之前踩过）
$remote = $remote -replace "`r`n", "`n" -replace "`r", "`n"
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($remote))

& ssh @sshArgs $target "echo $b64 | base64 -d | bash"
if ($LASTEXITCODE -ne 0) { Fail "服务器端部署失败，登上去看 docker compose logs" }

# ---------- 5. 自检 ----------
Step "5/5 自检（从公网访问）"
Start-Sleep -Seconds 2
$base = "http://$Server`:3000"
$checks = @(
    @{ Name = "首页"; Url = "$base/"; Expect = "200" },
    @{ Name = "背景图"; Url = "$base/images/hero-bg.jpg"; Expect = "200" },
    @{ Name = "JS 资源"; Url = (Get-ChildItem "$root\dist\assets\index-*.js" | Select-Object -First 1 | ForEach-Object { "$base/assets/$($_.Name)" }); Expect = "200" }
)
foreach ($c in $checks) {
    $code = & curl.exe -s --noproxy "*" -o NUL -w "%{http_code}" --max-time 15 $c.Url 2>$null
    $ok = if ($code -eq $c.Expect) { "✓" } else { "✗" }
    Write-Host "  $ok $($c.Name)：HTTP $code（期望 $($c.Expect)）"
}
# 容器状态
& ssh @sshArgs $target "docker ps --filter name=homepage-web --format '  {{.Names}}  {{.Status}}  {{.Ports}}'"
Write-Host "`n完成。访问：$base" -ForegroundColor Green
