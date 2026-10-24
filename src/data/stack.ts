/**
 * 技术栈数据
 *
 * 分成 5 组展示，每条包含名称 + 一句「我拿它做什么」，
 * 这样读者能看出是「用过」而不是「听说过」。
 */

export interface StackGroup {
  key: string;
  title: string;
  /** 英文小标题，做视觉层次用 */
  subtitle: string;
  /** 该组的主色（青 / 紫 / 琥珀），用于卡片左侧的高亮条 */
  accent: "cyan" | "violet" | "amber";
  items: Array<{ name: string; note: string }>;
}

export const stackGroups: StackGroup[] = [
  {
    key: "frontend",
    title: "前端",
    subtitle: "FRONTEND",
    accent: "cyan",
    items: [
      { name: "Vue 3", note: "Composition API + 自研组件，不依赖重型 UI 库也能落地" },
      { name: "TypeScript", note: "全项目严格模式，接口与数据结构都有类型" },
      { name: "Vite", note: "开发热更新与多阶段构建，产物按块拆分长期缓存" },
      { name: "Element Plus", note: "后台类项目的表格 / 表单 / 权限树界面" },
      { name: "Pinia", note: "跨页面的登录态与业务状态管理" },
      { name: "uni-app", note: "一套代码出 H5，移动端优先的项目用它" },
      { name: "Less", note: "变量集中管理配色与圆角，组件不写死颜色" },
      { name: "ECharts", note: "仪表盘趋势图与统计卡片" },
    ],
  },
  {
    key: "backend",
    title: "后端",
    subtitle: "BACKEND",
    accent: "violet",
    items: [
      { name: "Node.js", note: "服务端运行时，前后端同一种语言减少切换成本" },
      { name: "NestJS", note: "模块化分层 + 全局守卫，接口默认受保护" },
      { name: "Express", note: "轻量服务与脚本，快速起一个可用的 API" },
      { name: "Prisma", note: "schema 即模型，迁移文件进 git 可审查" },
      { name: "JWT / Cookie", note: "身份令牌与 HttpOnly 签名 Cookie 两套鉴权实践" },
      { name: "Throttler", note: "按 IP 限流，登录与重开销接口单独收紧" },
    ],
  },
  {
    key: "data",
    title: "数据",
    subtitle: "DATA",
    accent: "cyan",
    items: [
      { name: "PostgreSQL", note: "关系建模、事务、条件更新防并发重复下单" },
      { name: "pgvector", note: "知识库向量检索，支撑 RAG 问答" },
      { name: "迁移与 seed", note: "离线生成 SQL 人工审查，seed 只初始化不覆盖" },
      { name: "pg_dump", note: "定时备份 + 恢复演练，数据丢了能救回来" },
    ],
  },
  {
    key: "devops",
    title: "工程化与部署",
    subtitle: "DEVOPS",
    accent: "violet",
    items: [
      { name: "Docker / Compose", note: "三容器一键起停，小内存机器也能稳定跑" },
      { name: "Nginx", note: "静态托管、反代、gzip、限流、SSE 不缓冲" },
      { name: "Linux", note: "云服务器初始化、安全组、日志与资源排查" },
      { name: "Git", note: "分支管理、Deploy Key 免密拉取、发布脚本" },
      { name: "自建发布脚本", note: "本机构建 → 上传镜像 → 服务器导入，一条命令更新" },
    ],
  },
  {
    key: "ai",
    title: "AI 应用",
    subtitle: "AI",
    accent: "amber",
    items: [
      { name: "LangChain", note: "提示词编排、检索链、工具调用" },
      { name: "LangGraph", note: "多 Agent 意图路由，按意图分发到不同节点" },
      { name: "RAG", note: "文档切分 → 向量入库 → 检索 → 带来源回答" },
      { name: "SSE 流式", note: "逐字输出，首字节亚秒级，代理层不缓冲" },
    ],
  },
];
