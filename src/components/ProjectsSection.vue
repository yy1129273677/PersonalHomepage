<template>
  <section id="projects" class="section projects">
    <div class="bg-layer">
      <img :src="assetUrl('images/projects-bg.jpg')" alt="" loading="lazy" decoding="async" />
    </div>

    <div class="container">
      <div class="section-head" data-reveal>
        <span class="section-head__eyebrow">Projects / 项目</span>
        <h2 class="section-head__title">三个真实上线、还在跑的系统</h2>
        <p class="section-head__desc">
          不是课程作业：三个系统同时部署在云服务器上，有鉴权、有数据库、有部署脚本和验收清单。点「查看详情」可以看到架构层面的取舍。
        </p>
      </div>

      <div class="projects__list">
        <article v-for="project in projects" :key="project.name" class="project glass-card" data-reveal>
          <div class="project__top">
            <span class="project__index">{{ project.index }}</span>
            <div class="project__heading">
              <h3>{{ project.name }}</h3>
              <p>{{ project.subtitle }}</p>
            </div>
          </div>

          <!-- 指标条：三列等宽（1fr），保证三张卡片的数值/标签在竖直方向完全对齐 -->
          <div class="project__metrics">
            <div v-for="metric in project.metrics" :key="metric.label" class="project__metric">
              <span class="project__metric-label">{{ metric.label }}</span>
              <div class="project__metric-value">
                <strong>{{ metric.value }}</strong>
                <span v-if="metric.trend" class="project__trend" :class="`project__trend--${metric.tone ?? 'up'}`">
                  <el-icon>
                    <CaretTop v-if="metric.tone !== 'flat'" />
                    <Minus v-else />
                  </el-icon>
                  {{ metric.trend }}
                </span>
              </div>
            </div>
          </div>

          <div class="project__main">
            <p class="project__desc">{{ project.description }}</p>
            <ul class="project__highlights">
              <li v-for="item in project.highlights" :key="item">
                <el-icon class="project__check"><Select /></el-icon>
                <span>{{ item }}</span>
              </li>
            </ul>
            <div class="project__stack">
              <el-tag v-for="tech in project.stack" :key="tech" class="project__tag" effect="plain" round size="small">
                {{ tech }}
              </el-tag>
            </div>
          </div>

          <!-- 操作区：不再挤在右侧 210px 的窄栏里，改成和数据条同宽、居中排列 -->
          <div class="project__footer">
            <div class="project__actions">
              <el-button type="primary" round @click="openDetail(project)">
                查看详情
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
              <!-- 线上演示地址：地址写在 src/data/projects.ts 的 link 字段里 -->
              <el-button v-if="project.link" round class="project__ghost" @click="openLink(project.link)">
                <el-icon class="el-icon--left"><TopRight /></el-icon>
                访问线上
              </el-button>
              <el-button v-if="project.repo" round class="project__ghost" @click="openLink(project.repo)">
                <el-icon class="el-icon--left"><Link /></el-icon>
                代码仓库
              </el-button>
            </div>
            <p class="project__hint">架构与取舍说明在详情里</p>
          </div>
        </article>
      </div>
    </div>

    <!-- 项目详情：用 Element Plus 弹窗，避免页面变长 -->
    <el-dialog
      v-model="detailVisible"
      :title="current?.name"
      width="min(760px, 92vw)"
      align-center
      class="project-dialog"
    >
      <template v-if="current">
        <p class="dialog__subtitle">{{ current.subtitle }}</p>
        <p class="dialog__desc">{{ current.description }}</p>

        <h4 class="dialog__heading">架构与取舍</h4>
        <ul class="dialog__list">
          <li v-for="line in current.architecture" :key="line">{{ line }}</li>
        </ul>

        <h4 class="dialog__heading">关键实现</h4>
        <ul class="dialog__list">
          <li v-for="line in current.highlights" :key="line">{{ line }}</li>
        </ul>

        <div class="dialog__tags">
          <el-tag v-for="tech in current.stack" :key="tech" effect="plain" round size="small">{{ tech }}</el-tag>
        </div>

        <!-- 线上地址：方便面试官复制，不依赖弹窗外层 -->
        <div v-if="current.link" class="dialog__link-row">
          <span class="dialog__link-label">线上演示</span>
          <a class="dialog__link" :href="current.link" target="_blank" rel="noopener noreferrer">{{ current.link }}</a>
        </div>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
/**
 * 项目展示：每个项目一张大卡片（序号 / 标题 / 指标 / 说明 / 亮点 / 技术标签），
 * 「查看详情」用 ElDialog 弹出架构说明，避免首屏过长。
 */
import { ref } from "vue";
import { ArrowRight, CaretTop, Link, Minus, Select, TopRight } from "@element-plus/icons-vue";
import { projects, type Project } from "../data/projects";
import { assetUrl } from "../utils/assetUrl";

const detailVisible = ref(false);
const current = ref<Project | null>(null);

function openDetail(project: Project) {
  current.value = project;
  detailVisible.value = true;
}

function openLink(url?: string) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}
</script>

<style scoped lang="less">
@import "../styles/variables.less";

.projects {
  // 照片由 .bg-layer 提供，其余交给全站连续环境层
  background: transparent;
}

.projects__list {
  display: grid;
  gap: 26px;
}

.project {
  padding: 26px 26px 22px;
  overflow: hidden;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    border-color: @line-strong;
    box-shadow: @shadow-glow;
  }
}

/* ---- 卡片头部：序号 + 标题 ---- */
.project__top {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  // 下边距交给指标条自己的上边框来分隔，避免出现两条线
  padding-bottom: 16px;
}

.project__index {
  font-family: @font-mono;
  font-size: 13px;
  font-weight: 700;
  color: @cyan;
  padding: 4px 9px;
  border: 1px solid rgba(78, 225, 255, 0.3);
  border-radius: 8px;
  background: rgba(78, 225, 255, 0.07);
  flex: 0 0 auto;
}

.project__heading {
  flex: 1 1 auto;
  min-width: 0;

  h3 {
    font-family: @font-display;
    font-size: clamp(19px, 2.2vw, 24px);
    letter-spacing: 0.01em;
  }

  p {
    margin-top: 5px;
    font-size: 13px;
    color: @text-dim;
    letter-spacing: 0.04em;
  }
}

/* ---- 指标条：三列等宽 ----
   之前用的是 flex + 内容自适应宽度，三张卡片的数字长短不同（41 / 41 vs 130 项），
   导致每一列的起点和间距都不一样，纵向看过去就是"歪"的。
   改成 repeat(3, 1fr)：三列永远等宽，卡片之间严格对齐，也更像仪表盘。 */
.project__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 14px 0 16px;
  border-top: 1px solid @line;
}

.project__metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 18px;
  // 列之间用细竖线分隔，强化"对齐"的视觉
  border-left: 1px solid @line;
  line-height: 1.2;

  &:first-child {
    padding-left: 0;
    border-left: 0;
  }
}

/* 刻度在上、数值在下，更像仪表盘的读数 */
.project__metric-label {
  font-family: @font-mono;
  font-size: 10.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: @text-dim;
}

/* 读数 + 趋势标签一律竖向排：
   之前用 flex 横排 + wrap，数值短的那列标签在同一行、数值长的列标签被挤到下一行，
   三列结构就不一致了（截图里 130 项/31+29/按路由 三个标签高度不同）。
   改成固定竖排后，不管数值多长，三列都是「刻度 / 读数 / 标签」三层，高度完全对齐。 */
.project__metric-value {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.project__metric-value strong {
  font-family: @font-mono;
  // 数字明显放大：仪表盘的读数必须一眼看清
  font-size: clamp(20px, 2.2vw, 27px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.01em;
  // 白色到青色的渐变，和首屏数字看板同一套语言
  background: linear-gradient(180deg, #ffffff 12%, @cyan 135%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* 趋势小标签：上升 = 青色，持平 = 灰色 */
.project__trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 1.5;
  border: 1px solid rgba(78, 225, 255, 0.28);
  background: rgba(78, 225, 255, 0.08);
  color: @cyan-soft;
  // 竖向排列后不需要再手动上移对齐基线
  transform: none;

  &--flat {
    border-color: rgba(110, 190, 255, 0.2);
    background: rgba(110, 190, 255, 0.06);
    color: @text-sub;
  }

  .el-icon {
    font-size: 11px;
  }
}

/* ---- 卡片主体 ---- */
.project__main {
  padding-top: 20px;
}

.project__desc {
  color: @text-sub;
  font-size: 14.5px;
  line-height: 1.85;
}

.project__highlights {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: grid;
  gap: 10px;

  li {
    display: flex;
    gap: 9px;
    font-size: 13.5px;
    line-height: 1.7;
    color: @text-sub;
  }
}

.project__check {
  flex: 0 0 auto;
  margin-top: 4px;
  color: @cyan;
  font-size: 13px;
}

.project__stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.project__tag {
  --el-tag-bg-color: rgba(110, 190, 255, 0.07);
  --el-tag-border-color: rgba(110, 190, 255, 0.22);
  --el-tag-text-color: rgba(208, 224, 248, 0.86);
  font-family: @font-mono;
  font-size: 11.5px;
}

/* ---- 操作区：放在卡片底部，和数据条同宽、水平居中 ---- */
.project__footer {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px dashed @line;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.project__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.project__ghost {
  background: rgba(10, 18, 32, 0.55);
  border-color: @line-strong;
  color: @text;

  &:hover {
    border-color: @cyan;
    color: @cyan;
    background: rgba(78, 225, 255, 0.08);
  }
}

.project__hint {
  font-size: 11.5px;
  color: @text-dim;
  line-height: 1.6;
  text-align: center;
}

/* ---- 详情弹窗 ---- */
.dialog__subtitle {
  font-size: 13px;
  color: @text-dim;
  letter-spacing: 0.04em;
}

.dialog__desc {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.85;
  color: @text-sub;
}

.dialog__heading {
  margin-top: 22px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: @cyan;
  letter-spacing: 0.04em;
}

.dialog__list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;

  li {
    font-size: 13.5px;
    line-height: 1.75;
    color: @text-sub;
  }
}

.dialog__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.dialog__link-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed rgba(110, 190, 255, 0.18);
  flex-wrap: wrap;
}

.dialog__link-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(190, 208, 236, 0.44);
}

.dialog__link {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 13px;
  color: #4ee1ff;
  word-break: break-all;
  border-bottom: 1px solid rgba(78, 225, 255, 0.3);

  &:hover {
    border-bottom-color: #4ee1ff;
  }
}

/* ---- 响应式 ---- */
@media (max-width: 900px) {
  .project {
    padding: 22px 18px 20px;
  }
  .project__top {
    flex-wrap: wrap;
    gap: 12px;
  }
  .project__metrics {
    // 手机上仍保持三列等宽，只把内边距和字号收窄
    padding: 12px 0 14px;
  }
  .project__metric {
    padding-left: 12px;
    gap: 4px;
  }
  .project__metric-label {
    font-size: 9.5px;
    letter-spacing: 0.1em;
  }
  .project__metric-value {
    gap: 6px;
  }
  .project__metric-value strong {
    font-size: 17px;
  }
  .project__trend {
    padding: 1px 5px;
    font-size: 9.5px;
    transform: none;
  }
  .project__footer {
    align-items: stretch;
  }
  .project__actions {
    // 手机上按钮纵向铺满，更好点
    flex-direction: column;
    align-items: stretch;
  }
  .project__hint {
    text-align: center;
  }
}
</style>

<style lang="less">
/* 弹窗是渲染到 body 上的，scoped 样式管不到它的外框，所以单独写一层全局样式 */
.project-dialog.el-dialog {
  background: rgba(9, 16, 28, 0.96);
  border: 1px solid rgba(110, 190, 255, 0.2);
  border-radius: 18px;
  backdrop-filter: blur(18px);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.6);

  .el-dialog__title {
    font-family:
      "Segoe UI Semibold",
      -apple-system,
      "PingFang SC",
      "Microsoft YaHei",
      sans-serif;
    font-size: 18px;
    color: #e9f3ff;
  }
}

@media (max-width: 640px) {
  .project-dialog.el-dialog {
    --el-dialog-padding-primary: 18px;
    border-radius: 14px;
  }
}
</style>
