/**
 * 项目数据（首页最重要的部分）
 *
 * 三个项目都是真实上线过的系统，内容取自各自的部署文档与验收记录。
 * 需要补充/替换时：
 *   - 增删数组元素即可，卡片会自动排版；
 *   - link 填线上地址就会显示「访问线上」按钮；留空则该按钮不渲染。
 */

export interface ProjectMetric {
  /** 刻度名（小字，显示在数值上方） */
  label: string;
  /** 读数（大字） */
  value: string;
  /** 趋势标签文案（可选），例如「全通过」「稳定」 */
  trend?: string;
  /**
   * 趋势方向：
   *   up   = 有增量/达标（青色 + 上箭头）
   *   flat = 保持稳定（灰色 + 短横线）
   */
  tone?: "up" | "flat";
}

export interface Project {
  /** 展示序号 01 / 02 / 03 */
  index: string;
  name: string;
  /** 一句话定位 */
  subtitle: string;
  /** 项目背景与解决的问题 */
  description: string;
  /** 我做的最关键的三四件事 */
  highlights: string[];
  /** 技术栈标签 */
  stack: string[];
  /** 量化结果 */
  metrics: ProjectMetric[];
  /** 线上地址（可选） */
  link?: string;
  /** 代码仓库（可选） */
  repo?: string;
  /** 详情弹窗里补充的架构说明 */
  architecture: string[];
}

export const projects: Project[] = [
  {
    index: "01",
    name: "陪易玩",
    subtitle: "陪玩接单平台 · 移动端优先",
    description:
      "陪玩用手机号注册、选游戏并提交图片+视频资质，管理员审核通过后才能出现在大厅；老板按偏好筛选、聊天下单、结单后陪玩自动恢复接单。核心难点是三方角色权限、两套状态机与并发下单的一致性。",
    highlights: [
      "三角色权限矩阵放在后端守卫里，前端隐藏按钮只是体验，越权调用直接 403",
      "订单状态机与陪玩接单状态机分离，结单在同一事务里释放陪玩并写通知，避免「卡在接单中」",
      "下单用事务 + 条件更新（UPDATE ... WHERE status = AVAILABLE），从根上避免同一陪玩被重复下单",
      "移动端一套 uni-app 代码出 H5，先跑通 H5 再考虑小程序（类目资质问题后置）",
    ],
    stack: ["uni-app", "Vue 3", "TypeScript", "NestJS", "Prisma", "PostgreSQL", "pgvector", "Docker Compose", "Nginx"],
    metrics: [
      { label: "端到端冒烟", value: "41 / 41", trend: "全通过", tone: "up" },
      { label: "后端单测", value: "71 项", trend: "持续补齐", tone: "up" },
      { label: "部署形态", value: "3 容器", trend: "稳定", tone: "flat" },
    ],
    // 线上演示地址（点「访问线上」直接打开）
    link: "http://8.147.114.201:8082/#/",
    architecture: [
      "前端：uni-app（Vue 3 + Vite + TS）+ Pinia，页面用 rpx 适配，消息与通知走轮询增量拉取。",
      "后端：NestJS 11 + Prisma 6，全局守卫链 JWT → 权限，DTO 声明式元数据进 Swagger。",
      "数据：PostgreSQL 16 + pgvector 扩展；单价在下单时快照进订单，改价不影响历史。",
      "部署：Docker Compose 三容器（db / server / web）+ Nginx 托管 H5 并反代接口。",
    ],
  },
  {
    index: "02",
    name: "多租户后台管理框架",
    subtitle: "配置驱动的中后台基座",
    description:
      "一套可以长出多个子系统的后台基座：超管创建子系统，路由可以是自定义页面或数据表；表的字段、可见性、搜索项都在界面里配置，保存后生成 TCID 落库，前端用统一表格组件渲染。难点是权限模型——菜单、按钮、按路由隔离的操作权限要自洽。",
    highlights: [
      "动态路由 + 动态表格：字段配置存数据库，新增业务不需要改代码重新发版",
      "权限树从「三个分组」重构为「菜单下挂按钮 + 取消父子联动」，取消一个按钮不再连带菜单",
      "按钮权限码带路由作用域（data:create:<TCID>:route:<id>），同一张表在不同页面可以独立授权",
      "JWT 只存身份，权限每次请求实时查库：改完角色刷新页面即生效，不需要重新登录",
    ],
    stack: ["Vue 3", "Element Plus", "Pinia", "vue-router", "ECharts", "NestJS", "Prisma", "PostgreSQL", "JWT"],
    metrics: [
      { label: "后端单测", value: "130 项", trend: "全通过", tone: "up" },
      { label: "冒烟用例", value: "31 + 29", trend: "全通过", tone: "up" },
      { label: "权限粒度", value: "按路由", trend: "已落地", tone: "up" },
    ],
    link: "http://8.147.114.201:8081/#/login",
    architecture: [
      "租户隔离：所有业务数据带 system_id，超管通过 X-System-Code 切换子系统视角。",
      "权限模型：菜单可见性 = 勾选的路由；数据读权限随菜单；写权限 = 按钮权限码。",
      "动态表格安全：表名/列名必须过标识符校验（PostgreSQL 唯一不能参数化的地方），值一律参数化。",
      "工程：前后端各自独立 npm 包，离线迁移 SQL + 约定扫描测试保证接口文档不缺失。",
    ],
  },
  {
    index: "03",
    name: "AI 智能客服",
    subtitle: "影城票务 · RAG + 多 Agent",
    description:
      "面向影院的智能客服：普通对话、票务查询（工具调用）、知识库问答（向量检索）、多 Agent 中枢（意图路由后分发）四条链路。上线时最大的坑不是模型，而是工程边界——流式输出必须不被代理缓冲，接口必须加鉴权，否则公网几小时就会被刷爆额度。",
    highlights: [
      "RAG 链路：文档切分 → 嵌入入库（pgvector）→ 检索 → 带「参考来源」的回答，可点开追溯",
      "多 Agent：意图路由先判断问题类型，再分发到票务 / 知识库 / 兜底节点，回答由汇总节点收敛",
      "SSE 流式输出：Nginx 关掉 proxy_buffering，实测首字节 0.5–0.9 秒，逐字出字",
      "鉴权与成本：HMAC 签名 HttpOnly Cookie + 同 IP 连续失败锁定 + Nginx 限流 + 内网隔离数据库",
    ],
    stack: ["Vue 3", "Element Plus", "Express", "LangChain", "LangGraph", "pgvector", "SSE", "Docker", "Nginx"],
    metrics: [
      { label: "首字节延迟", value: "0.5s", trend: "亚秒级", tone: "up" },
      { label: "流式数据块", value: "40+", trend: "逐字输出", tone: "up" },
      // 鉴权方式用 HMAC 缩写，避免三列等宽时数值过长换行
      { label: "鉴权", value: "HMAC", trend: "已接入", tone: "up" },
    ],
    link: "http://8.147.114.201:8080/login",
    architecture: [
      "前端：Vue 3 + Element Plus，四个页签对应四条链路，SSE 用 fetch + ReadableStream 逐字渲染。",
      "后端：Express + LangChain / LangGraph，四组路由全部挂在鉴权中间件之后（静态页公开、接口 401）。",
      "数据：PostgreSQL + pgvector，知识库文档首次部署时执行 ingest 入库。",
      "部署：三容器 + Nginx（8080 明文 / 8443 自签 HTTPS），限流与 Basic 层演进到应用层登录。",
    ],
  },
];
