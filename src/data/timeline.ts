/**
 * 时间线数据：按时间倒序，越新的越靠前
 * 每条 = 一个能说明「我在解决什么问题」的节点，而不是罗列技术名词。
 */

export interface TimelineItem {
  /** 展示用时间 */
  date: string;
  title: string;
  desc: string;
  tags: string[];
  /** 标记为「进行中」的节点会用高亮色 */
  current?: boolean;
}

export const timeline: TimelineItem[] = [
  {
    date: "2026 Q4",
    title: "三个项目在线上并行运行",
    desc: "同一台 2 核 2G 云服务器上跑三个系统（9 个容器），统一用「本机构建镜像 → 上传 → 服务器导入」的发布流程，避免小机器构建被 OOM 打断。",
    tags: ["Docker", "Nginx", "部署脚本"],
    current: true,
  },
  {
    date: "2026 Q4",
    title: "AI 客服上线：RAG + 多 Agent",
    desc: "接入 LangChain / LangGraph，做出知识库问答与意图路由两条链路；上线时踩到代理缓冲导致流式输出变成「憋几秒一次性吐」，最终在 Nginx 层解决。",
    tags: ["LangChain", "pgvector", "SSE"],
  },
  {
    date: "2026 Q3",
    title: "后台管理框架重构：权限模型收敛",
    desc: "把「菜单 / 按钮 / 表格」的权限从三套逻辑收敛成一套：读权限随菜单、写权限走按钮码、按钮码带路由作用域，并补了约定扫描测试防止接口文档缺失。",
    tags: ["Vue 3", "NestJS", "RBAC"],
  },
  {
    date: "2026 Q2",
    title: "陪易玩：从需求拆解到全量交付",
    desc: "先写需求拆解与 17 个待定问题再动手，最后交付 71 项后端单测、41 项端到端冒烟；把并发下单、状态机这类最容易出事的点用「事务 + 条件更新」锁死。",
    tags: ["uni-app", "Prisma", "状态机"],
  },
  {
    date: "2026 Q1",
    title: "建立自己的工程约定与模板",
    desc: "把三个项目反复踩到的问题沉淀成一套模板：AGENTS 约定、提示词模板、开发流程闸门、部署手册，新项目直接复用，减少每次从零做决定。",
    tags: ["文档工程", "流程"],
  },
];
