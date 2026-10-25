# 个人主页 · YY

科幻风格的**单页个人主页 / 在线简历**，用来展示技术栈与三个已上线项目。

- 技术栈：**Vue 3 + Vite + TypeScript + Element Plus + Three.js + GSAP**
- 视觉：真实星域 / 机房摄影背景 + 玻璃拟态卡片 + 青色霓虹主色
- 兼容：桌面、平板、手机三档响应式；移动端自动降级（减少粒子、关闭视差）
- 无障碍：支持系统「减少动态效果」、键盘可聚焦、跳过导航链接、语义化标签

> 这是一个**纯静态站点**：构建产物是 `dist/` 目录，丢到任何静态服务器（Nginx / OSS / GitHub Pages）即可，没有后端依赖。

---

## 1. 快速开始

```bash
cd PersonalHomepage
npm install        # 首次
npm run dev        # 本地开发 http://127.0.0.1:5179
npm run typecheck  # 类型检查（vue-tsc --noEmit）
npm run build      # 类型检查 + 生产构建，产物在 dist/
npm run preview    # 本地预览构建产物 http://127.0.0.1:4179
npm run format     # Prettier 格式化
```

要求 Node ≥ 20（当前开发环境为 Node 24）。

---

## 2. 目录结构

```
PersonalHomepage/
├── index.html                  # HTML 入口：SEO / OG 分享卡片 / 首屏图预加载
├── vite.config.ts              # 构建配置（base "./"、大库拆 chunk）
├── tsconfig.json               # TS 严格模式
├── package.json
├── public/images/              # 4 张背景图（已压到 1920 宽、100~220KB）
├── src/
│   ├── main.ts                 # 挂载 + Element Plus 暗色主题
│   ├── App.vue                 # 单页组装（各 section 顺序在这里）
│   ├── components/
│   │   ├── StarField.vue       # Three.js 星域背景（fixed 层）
│   │   ├── SiteHeader.vue      # 固定导航 + 阅读进度条 + 移动端抽屉
│   │   ├── HeroSection.vue     # 首屏：姓名 / 定位 / CTA / 数字看板 / 轨道装饰
│   │   ├── StatNumber.vue      # 滚动到可见时数字递增
│   │   ├── AboutSection.vue    # 关于我 + 能力条 + 工作原则
│   │   ├── StackSection.vue    # 技术栈 5 组卡片
│   │   ├── ProjectsSection.vue # 项目大卡片 + 详情弹窗（ElDialog）
│   │   ├── TimelineSection.vue # 历程（ElTimeline）
│   │   ├── ContactSection.vue  # 联系方式（点击复制邮箱）
│   │   └── SiteFooter.vue      # 页脚 + 备案号占位
│   ├── composables/
│   │   ├── useRevealOnScroll.ts# 全站滚动进场动画（GSAP ScrollTrigger）
│   │   └── useScrollSpy.ts     # 导航「当前章节」高亮
│   ├── data/                   # ★ 所有文案与项目数据都在这
│   │   ├── profile.ts          #   个人信息 / 数字看板 / 原则 / 能力
│   │   ├── projects.ts         #   三个项目的内容与指标
│   │   ├── stack.ts            #   技术栈分组
│   │   └── timeline.ts         #   历程
│   ├── styles/
│   │   ├── variables.less      # ★ 配色 / 圆角 / 阴影 / 字体变量
│   │   └── index.less          # 全局样式、章节标题、背景层、Element 暗色微调
│   └── utils/assetUrl.ts       # public 资源路径拼接（兼容部署到子目录）
└── DEPLOY.md                   # 部署手册（Nginx 配置 / 验收清单 / 更新流程）
```

---

## 3. 想改成你自己的内容

**只改 `src/data/` 里的四个文件即可，组件不用动。**

| 要改什么                                        | 改哪里                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| 姓名、岗位、一句话定位、简介、所在地            | `src/data/profile.ts` 的 `profile`                                   |
| 邮箱（当前已填 `1129273677@qq.com`）            | `src/data/profile.ts` → `profile.email`                              |
| 首屏那排数字（已上线项目 / 容器 / 单测 / 冒烟） | `src/data/profile.ts` → `profile.stats`                              |
| 能力条百分比                                    | `src/data/profile.ts` → `capabilities`                               |
| 工作原则四条                                    | `src/data/profile.ts` → `principles`                                 |
| 项目内容、指标、架构说明                        | `src/data/projects.ts`                                               |
| **项目的线上地址**（卡片上的「访问线上」按钮）  | `src/data/projects.ts` 里每个项目的 `link` 字段                      |
| 技术栈分组与说明                                | `src/data/stack.ts`                                                  |
| 历程时间线                                      | `src/data/timeline.ts`                                               |
| 导航项                                          | `src/data/profile.ts` → `navItems`（id 必须和 section 的 `id` 对应） |
| 配色 / 圆角 / 阴影                              | `src/styles/variables.less`                                          |
| 背景图                                          | 替换 `public/images/*.jpg`，保持同名即可                             |
| ICP 备案号                                      | `src/components/SiteFooter.vue` 里的 `.footer__icp`                  |
| 页面标题 / 分享卡片文案                         | `index.html` 的 `<title>`、`og:*`                                    |

> 个人信息（喻洋 / 中国·西安 / 1129273677@qq.com）和三个项目的线上地址都已经填好；
> `profile.initials` 是 `YY`（头像方块和页脚用的首字母），要换风格改这一处即可。

---

## 4. 设计与工程说明

### 视觉层次

| 层       | z-index | 内容                                                              |
| -------- | ------- | ----------------------------------------------------------------- |
| 环境背景 | -1      | `.ambient` 固定层：青/紫径向光晕 + 底色渐变，**全站一张连续背景** |
| 星域背景 | 0       | Three.js 固定画布（桌面 1500 / 平板 1100 / 手机 650 颗柔光星点）  |
| 页面内容 | 1       | 各 section：有的叠真实照片（上下边缘淡出），有的直接透出环境背景  |
| 固定导航 | 100     | 毛玻璃顶栏 + 顶部阅读进度条                                       |

> **为什么要有 `.ambient` 这一层**：早期每个 section 各自铺不透明背景（有的是照片、有的是纯色渐变），
> 滚动时会出现"一块一块"的色差和硬边——尤其超宽屏下，中间那块像贴上去的矩形。
> 现在把底色统一收到 `.ambient`（`position: fixed`，滚动时不动），
> section 背景一律透明，照片用 `mask-image` 上下淡出，所以从第一屏滚到最后一屏背景是同一个连续画面。

### 动效清单

- **滚动进场**：所有 `[data-reveal]` 元素进入视口时淡入上移（GSAP ScrollTrigger，只播一次）。
- **数字看板**：进入视口后 0 → 目标值递增（`requestAnimationFrame` + easeOutCubic）。
- **首屏视差**：Hero 背景图随滚动下移最多 10%。
- **轨道装饰**：三层轨道环不同速度反向旋转 + 中心呼吸光。
- **星域自转**：星群极慢自转 + 鼠标视差（相机跟随）。
- **导航高亮**：IntersectionObserver 判断当前章节，无 scroll 监听开销。

> 所有动效都在 `prefers-reduced-motion: reduce` 下自动关闭（无障碍硬要求），此时内容仍然完整可见。

### 性能取舍

| 决策                                                    | 原因                                              |
| ------------------------------------------------------- | ------------------------------------------------- |
| 背景图放 `public/images`、压到 1920 宽 JPG（总 660KB）  | 真实照片是「沉浸感」的核心，但原图 12MB 不可接受  |
| 桌面 1500 / 平板 1100 / 手机 650 颗粒子，像素比上限 1.8 | 低端机不发热，视觉差异几乎看不出来                |
| 星点用 canvas 生成的柔光圆点贴图                        | Points 默认画的是方块；贴图后是圆点且边缘柔光     |
| `base: "./"`                                            | 构建产物可直接放服务器任意子目录（如 `/resume/`） |
| 大库拆 chunk（three / element / gsap）                  | 版本不变时可长期缓存，二次访问快                  |
| Hero 图 `fetchpriority="high"`，其余图 `loading="lazy"` | 首屏优先、下方延后，减少首屏流量                  |

**已知取舍（诚实说明）**：Element Plus 目前是**全量引入**（`element-plus/dist/index.css` + 完整组件注册），所以 CSS 约 368KB、JS 约 1MB（gzip 后约 375KB）。好处是不会漏样式、构建稳；如果想再瘦身，可以切到 `unplugin-vue-components` 按需引入，预计能省掉约 280KB gzip —— 需要改动 `main.ts` 与构建脚本，属于可选优化。

### 无障碍

- 首屏有「跳到主内容」链接（Tab 第一个焦点即可见）；
- 装饰性元素（星域画布、轨道环、网格）统一 `aria-hidden="true"`；
- 导航使用语义化 `<nav>` + 当前项高亮，移动端菜单按钮有 `aria-expanded`；
- 焦点样式统一 `:focus-visible` 描边，不用 `outline: none`。

---

## 5. 部署

**线上地址**（主）：<http://8.147.114.201:3000>（阿里云服务器，Nginx 容器托管 `dist`）

**备用地址（GitHub Pages，免费 HTTPS）**：<https://yy1129273677.github.io/PersonalHomepage/>
推送到 `main` 会自动构建并部署（`.github/workflows/deploy-pages.yml`）。

一键发布（本机构建 → 上传 → 服务器重建容器 → 自检）：

```powershell
.\deploy.cmd                   # 或 .\deploy-dist.ps1
.\deploy-dist.ps1 -SkipBuild   # 只上传现有 dist，不重新构建（改文案时最快）
```

服务器结构（`/root/homepage`）：

```
/root/homepage/
├── dist/                 # 构建产物（本地 build 后上传）
├── nginx.conf            # gzip / 缓存 / 安全头 / SPA 兜底
├── docker-compose.yml    # nginx:1.27-alpine，3000:80
└── update.sh             # 服务器端重建 + 自检
```

> 服务器上**不装 Node、不跑构建**：2G 内存 + 3M 带宽下 `npm install` 太慢且容易 OOM，
> 所以构建统一在本机做，只把 `dist` 传上去。

完整的 Nginx 配置说明、缓存策略、子目录部署、HTTPS、验收清单见 [`DEPLOY.md`](./DEPLOY.md)。

手动部署（不用脚本时）：

```bash
npm run build
scp -r dist/* root@<服务器IP>:/root/homepage/dist/
ssh root@<服务器IP> "cd /root/homepage && bash update.sh"
```

---

## 6. 开发期工具（可选）

`scripts/screenshot.mjs` 用本机 Edge 给页面截桌面/手机图，用来快速检查布局。它不是项目依赖，用之前先装：

```bash
npm i -D playwright-core
node scripts/screenshot.mjs   # 需要先 npm run preview
```

截图输出到 `shots/`（已在 `.gitignore` 里忽略）。
