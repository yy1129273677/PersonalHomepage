/**
 * 个人信息（整个站点唯一的内容源之一）
 *
 * 已经填好你的真实信息（喻洋 / 西安 / QQ 邮箱 / GitHub），
 * 以后要改只动这个对象即可，页面所有位置会自动同步（导航、Hero、联系区、页脚都读这里）。
 */

export interface ProfileStat {
  /** 数字下方的说明文字 */
  label: string;
  /** 要跳动的目标数字 */
  value: number;
  /** 数字后缀，例如「个」「项」 */
  suffix?: string;
}

export interface NavItem {
  /** 锚点 id，必须和页面上 section 的 id 对应 */
  id: string;
  label: string;
}

export const navItems: NavItem[] = [
  { id: "about", label: "关于" },
  { id: "stack", label: "技术栈" },
  { id: "projects", label: "项目" },
  { id: "journey", label: "历程" },
  { id: "contact", label: "联系" },
];

export const profile = {
  name: "喻洋",
  initials: "YY",
  role: "全栈开发工程师",
  tagline: "把想法写成系统，把系统真正部署上线",
  summary:
    "我一个人负责一个产品从数据库建模、接口设计、前端交互，到云服务器部署与线上排障的全过程。偏好 TypeScript 全家桶 + 容器化部署：先把约定和文档写清楚，再动手写代码；指标不是「跑起来了」，而是「线上能访问、接口有鉴权、故障能定位」。",
  location: "中国 · 西安",
  email: "1129273677@qq.com",
  github: "https://github.com/yy1129273677",
  githubLabel: "github.com/yy1129273677",
  /** Hero 顶部的小标签 */
  badge: "可远程 · 全日制",
  /** 首屏的数字看板需要滚动到位置才开始跳动 */
  stats: [
    { label: "已上线项目", value: 3, suffix: "个" },
    { label: "运行中容器", value: 9, suffix: "个" },
    { label: "后端单元测试", value: 130, suffix: "项" },
    { label: "端到端冒烟", value: 41, suffix: "项" },
  ] satisfies ProfileStat[],
};

/** 我对自己的四条工作原则：About 区右侧卡片用 */
export const principles = [
  {
    title: "先读后写",
    desc: "改任何代码前，先读它、以及它依赖和被依赖的关键部分，沿用项目里已有的命名与分层习惯。",
  },
  {
    title: "先约定后实现",
    desc: "需求有歧义先拆解确认，写进文档再动手；术语、状态机、权限码都在文档里定死，代码只负责实现。",
  },
  {
    title: "线上才算完成",
    desc: "本地跑通只是起点。容器化、反向代理、鉴权、限流、备份与排障脚本都补齐，才叫交付。",
  },
  {
    title: "出错要能自证",
    desc: "每一处改动都给出可复现的验证命令和真实输出，不写「应该能跑」，也不掩盖已知限制。",
  },
];

/** 能力条形图（About 区）。百分比只是相对自我评估，方便读者快速建立印象 */
export const capabilities = [
  { label: "前端工程（Vue 3 / TS / 构建）", value: 88 },
  { label: "后端接口（NestJS / 鉴权 / 校验）", value: 85 },
  { label: "数据建模（PostgreSQL / Prisma）", value: 82 },
  { label: "部署运维（Docker / Nginx / Linux）", value: 78 },
];
