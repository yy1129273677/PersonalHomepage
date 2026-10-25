# 部署手册 —— 个人主页（纯静态站点）

> 本项目构建产物是 `dist/`，**没有任何后端依赖**：一个 Nginx（或任意静态服务器）指过去就能跑。
> 下面的命令都在项目根目录 `PersonalHomepage/` 下执行。

---

## 0. 当前线上实例（已部署）

| 项       | 值                                                                           |
| -------- | ---------------------------------------------------------------------------- |
| 访问地址 | **http://8.147.114.201:3000**                                                |
| 服务器   | 阿里云 8.147.114.201（2 核 2G / 3M）                                         |
| 部署目录 | `/root/homepage`                                                             |
| 容器     | `homepage-web`（`nginx:1.27-alpine`，`3000:80`，`restart: unless-stopped`）  |
| 端口     | 宿主机 **3000** → 容器 80                                                    |
| 构建位置 | **本机**（服务器不装 Node，避免 2G 内存 + 3M 带宽下 `npm install` 过慢/OOM） |

**日常发布**（改完代码在本机执行）：

```powershell
.\deploy.cmd                     # 构建 → 打包 → 上传 → 服务器重建容器 → 自检
.\deploy-dist.ps1 -SkipBuild     # 只上传现有 dist（改了文案、不想等构建时用）
```

脚本做的事：`npm run build` → `tar` 打包 `dist` → `scp` 上传 → 服务器 `docker compose up -d --force-recreate`
→ 从公网 `curl` 自检首页 / 背景图 / JS 资源。

**服务器上更新**（不用本机脚本时）：

```bash
cd /root/homepage && bash update.sh
```

**新建容器前请确认云安全组放行了 3000**（这一步在服务器内部改不了）。

---

## 0.05 GitHub Pages（备用托管，免费 HTTPS）

仓库是公开的，所以额外配了一份 GitHub Pages 作为**备用访问地址**：

```
https://yy1129273677.github.io/PersonalHomepage/
```

- 触发方式：push 到 `main` 自动构建部署（`.github/workflows/deploy-pages.yml`），也可在 Actions 页手动 Run
- 首次需要在仓库 **Settings → Pages → Source** 选 **GitHub Actions**（本项目已通过 API 开启）
- 因为是**纯静态站点**，这种托管方式零成本；`base: "./"` 已适配 `/PersonalHomepage/` 子路径
- ⚠️ 国内访问 `github.io` 不稳定（时快时慢、偶尔打不开），所以**只作备用**，主站仍用云服务器 `:3000`

---

## 0.1 部署形态二选一（如果你换服务器）

| 形态                              | 适用                        | 访问地址形态                      |
| --------------------------------- | --------------------------- | --------------------------------- |
| **A. 根目录部署**（推荐给个人站） | 有独立域名或独立端口        | `https://your-domain.com/`        |
| **B. 子目录部署**                 | 和别的项目共用一个域名/端口 | `https://your-domain.com/resume/` |

`vite.config.ts` 里 `base` 已经是 `"./"`，所以 **A、B 两种都能直接用同一份构建产物**，不用改配置重新构建。

---

## 1. 构建

```bash
npm ci                 # 严格按 lock 安装（首次部署用；本地开发可用 npm install）
npm run typecheck      # 类型检查，必须 0 错误
npm run build          # 产物在 dist/
```

构建成功后 `dist/` 结构：

```
dist/
├── index.html
├── assets/
│   ├── index-<hash>.js     # 页面逻辑
│   ├── index-<hash>.css    # 站点样式
│   ├── element-<hash>.js   # Element Plus（大库单独 chunk，长期缓存）
│   ├── three-<hash>.js     # Three.js
│   └── motion-<hash>.js    # GSAP
└── images/                 # 4 张背景图（从 public 原样复制）
```

---

## 2. 上传到服务器

```bash
# 方式一：直接传目录（最简单）
scp -r dist/* root@<服务器IP>:/var/www/personal-homepage/

# 方式二：先打包再传（文件多时更快）
tar -czf homepage.tar.gz -C dist .
scp homepage.tar.gz root@<服务器IP>:/tmp/
ssh root@<服务器IP> "mkdir -p /var/www/personal-homepage && tar -xzf /tmp/homepage.tar.gz -C /var/www/personal-homepage"
```

> 目录建议固定为 `/var/www/personal-homepage`，后面 Nginx 配置会用到这个路径。

---

## 3. Nginx 配置

### 形态 A：根目录 / 独立端口

```nginx
server {
    listen 80;
    server_name your-domain.com;      # 没有域名就写服务器 IP，或者直接用非 80 端口
    root /var/www/personal-homepage;
    index index.html;

    # ---- 压缩：本站 CSS/JS 未压缩约 1.9MB，gzip 后约 520KB ----
    gzip on;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    # ---- 带 hash 的静态资源：内容变了文件名就变，可以永久缓存 ----
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # ---- 图片：文件名不随内容变，用 30 天缓存 + 协商缓存兜底 ----
    location /images/ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # ---- 入口 HTML：绝对不能强缓存，否则发新版用户看不到 ----
    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    # 单页站点没有路由，兜底到 index.html 即可
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 形态 B：子目录部署

把上面 `server` 块整体放进一个 `location /resume/` 即可（`alias` 指向 dist 目录）：

```nginx
location /resume/ {
    alias /var/www/personal-homepage/;
    index index.html;
    try_files $uri $uri/ /resume/index.html;

    location ~* ^/resume/assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

> 关键点：`alias` 结尾的斜杠不能省，`try_files` 的兜底路径要带上 `/resume/`。

### 应用配置并检查

```bash
nginx -t           # 语法检查，必须 ok
nginx -s reload    # 热加载，不中断现有服务
```

> 如果服务器开了 ufw：`ufw allow 80/tcp`（用 443 再加 443）。
> 云服务器还要在**安全组**放行对应端口（这一层 Nginx 改不了）。

---

## 4. HTTPS（有域名才需要）

```bash
# 域名解析生效后执行（A 记录指向服务器 IP）
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo certbot renew --dry-run      # 验证自动续期
```

没有域名时（用 IP 访问）：Let's Encrypt 现在虽然能给 IP 签证书，但只有 6 天有效期、要配自动续期，演示阶段用 HTTP 更省事；确实需要 `https://IP` 时用自签证书（浏览器会提示"继续前往"）。

---

## 5. 验收清单（部署后逐条 curl）

```bash
# 1) 首页 200
curl -s -o /dev/null -w "首页: %{http_code}\n" http://<IP或域名>/

# 2) 入口 HTML 是 no-cache（改了内容能立刻生效）
curl -sI http://<IP或域名>/ | grep -i cache-control      # 期望 no-cache

# 3) 静态资源长缓存 + gzip
curl -sI -H "Accept-Encoding: gzip" http://<IP或域名>/assets/ | head -5
# 期望看到 content-encoding: gzip / cache-control: ... immutable

# 4) 背景图能取到且是图片
curl -s -o /dev/null -w "背景图: %{http_code} %{content_type}\n" http://<IP或域名>/images/hero-bg.jpg

# 5) 手机上用 4G 打开一次（这一步才算真·公网可达）
```

浏览器里再确认这几点：

- [ ] 首屏背景图、星点、轨道环正常，没有白屏或布局错位
- [ ] 鼠标滚动时各章节淡入，数字从 0 跳到目标值
- [ ] 点「查看详情」能弹出项目弹窗
- [ ] 点联系方式能复制邮箱（HTTP 环境下走的是备用方案）
- [ ] 手机：菜单按钮弹出抽屉，导航可跳转，卡片是单列

---

## 6. 日常更新

```bash
# 本地改完 → 重新构建 → 覆盖上传
npm run build
scp -r dist/* root@<服务器IP>:/var/www/personal-homepage/

# 服务器上确认文件已更新
curl -sI http://<IP或域名>/ | grep -i last-modified
```

**建议**：先 `rm -rf` 旧目录再解压，避免上一版的旧 hash 文件越积越多；入口 HTML 是 `no-cache`，所以用户刷新就能拿到新版本。

---

## 7. 常见问题

| 现象                                    | 原因                                       | 处理                                                    |
| --------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| 页面白屏，控制台报 404 `/assets/xxx.js` | 部署在子目录，但 `base` 不是 `./`          | 本项目已是 `./`；若改过配置，改回 `base: "./"` 重新构建 |
| 背景图不显示                            | 只传了 `dist/index.html`，没传 `images/`   | 整个 `dist` 目录都要传                                  |
| 改了内容用户还看到旧版                  | 入口 `index.html` 被强缓存                 | 按第 3 节加 `Cache-Control: no-cache`                   |
| 手机打开很慢                            | 服务器带宽小（如 3M）+ 首次加载            | 确认已开 gzip；控制台看实际传输量，首次约 500~700KB     |
| 动画不动、直接显示                      | 系统开了「减少动态效果」或设备不支持 WebGL | 属预期行为，内容不受影响                                |
| 点邮箱复制失败                          | HTTP 环境下剪贴板 API 不可用               | 已内置 textarea 兜底；仍失败会提示手动复制              |

---

## 8. 踩坑记录（本项目真实遇到）

| 现象                                                         | 根因                                                                                                                                                                  | 修法                                                                                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 构建报 `Could not resolve './images/hero-bg.jpg'`            | 模板里写给相对路径，Vite 当成模块去解析                                                                                                                               | 改用 `assetUrl()` 拼接 `import.meta.env.BASE_URL`（见 `src/utils/assetUrl.ts`）                                                               |
| 构建报 `manualChunks is not a function`                      | Vite 8（rolldown）只接受函数形式的 `manualChunks`                                                                                                                     | 改成函数写法（见 `vite.config.ts`）                                                                                                           |
| 名字的渐变色几乎看不出来                                     | 父级是 flex column，`span` 被拉满宽度，渐变摊到了整屏宽                                                                                                               | 给元素加 `align-self: flex-start; width: fit-content`                                                                                         |
| 标题最后一个字单独掉一行                                     | 中英文混排断行控制不了                                                                                                                                                | 加 `text-wrap: balance`                                                                                                                       |
| 手机端统计区最后一项孤零零一行                               | flex 换行不可控                                                                                                                                                       | 640px 以下改成 2×2 网格                                                                                                                       |
| 超宽屏下章节背景像"贴了一块矩形"，两侧与中间有色差           | 每个 section 各自铺不透明背景（照片 / 纯色渐变），拼接处必有硬边                                                                                                      | 抽出 `.ambient` 固定层做全站连续背景；section 一律 `transparent`；照片用 `mask-image` 上下淡出                                                |
| 章节背景透明后，星点变成一堆大方块                           | WebGL `Points` 不给贴图时默认画正方形                                                                                                                                 | 用 canvas 画柔光圆点当 `map`，并把 z 拉到 -60~-300，避免星点贴近镜头被放大                                                                    |
| 星点太亮像散景泡泡、抢正文                                   | 粒子尺寸偏大且部分贴近相机会被透视放大                                                                                                                                | size 1.5 + 不透明度 0.55 + 每颗星随机亮度（0.35~1）                                                                                           |
| 星点越滚越往左、最后整片消失                                 | 星群整体挂在 z=-170（偏心），却让它**绕世界原点**旋转——等于让它在公转，越转越偏出画面                                                                                 | 几何体改成以原点为中心的椭球，整团用 `points.position.z` 平移，再绕自身中心自转；实测 30 秒质心偏移 0.1px                                     |
| 三张项目卡片的指标列纵向对不齐                               | 指标用 flex + 内容自适应宽度，数字长短不同（`41 / 41` vs `130 项`）→ 每张卡列宽不一样                                                                                 | 改成 `grid-template-columns: repeat(3, minmax(0, 1fr))` 等宽三列 + 列间细分隔线；实测三卡列坐标均为 181 / 540 / 900                           |
| 卡片操作按钮挤在右侧 210px 窄栏，视觉重心明显偏右            | 用 `.project__body` 两列网格 + 右侧竖栏放按钮                                                                                                                         | 去掉右栏：正文占满宽度，按钮移到卡片底部 `.project__footer` 居中；实测按钮中心 720 = 卡片中心 720                                             |
| 统计条像"一行文字"、缺少仪表盘感                             | 数值 17px、无刻度、无趋势信息                                                                                                                                         | 标签移到数值上方做刻度、数值放大到 20~27px 渐变、右侧加趋势芯片（↑ 青色 / — 灰色）                                                            |
| 手机端「回到顶部」按钮比上面那个窄、看着偏右                 | Element Plus 给 `.el-button + .el-button` 加了 `margin-left: 12px`；竖向 flex 排列时它不会变成上边距，而是把第二个按钮整体右移 12px                                   | 全局覆盖 `.el-button + .el-button { margin-left: 0 }`，间距一律交给父容器的 `gap`；实测两个按钮宽 354、左边界同为 18                          |
| 三列指标里趋势标签有的在数值右侧、有的掉到下一行             | 读数区用 `flex + flex-wrap` 横排，数值短的列标签同一行、数值长的列标签换行，三列结构不一致                                                                            | 读数区固定竖排（`flex-direction: column`）：刻度 / 读数 / 标签三层；实测三卡标签 top 全为 179（桌面）、150（手机），单元高度 75 / 57 完全一致 |
| 滚动到中间后打开手机菜单，抽屉只剩顶上一条、下面露出页面内容 | `.header--solid` 上有 `backdrop-filter`，而 `backdrop-filter` 会让元素成为 `position: fixed` 子元素的包含块；抽屉原本写在 `<header>` 里，于是被压成 header 那 60px 高 | 抽屉移出 `<header>` 并加 `append-to-body`（直接挂到 body）；实测抽屉高度 970 / 844 = 视口高度，父链为 `.el-overlay → body`                    |
| Firefox 上没有毛玻璃效果                                     | 同时写了 `-webkit-backdrop-filter` 和标准 `backdrop-filter`，构建压缩器去重后只保留 `-webkit-`（Firefox 不认前缀）                                                    | 标准属性改用 `@supports (backdrop-filter: blur(1px)) { ... }` 单独声明，压缩器不会跨规则去重；实测产物里两种写法都在                          |
| 服务器上出现两个同名 `homepage` 目录                         | 早期脚本用 CRLF 发送，`mkdir -p /root/homepage\r` 把回车符一起建进了目录名，`ls` 里看起来完全一样（`%q` 才看得出）                                                    | 脚本在发送前把远端脚本统一转成 LF；并在远端执行开头加 `rm -rf "$PWD"$'\r'` 清理历史遗留                                                       |
