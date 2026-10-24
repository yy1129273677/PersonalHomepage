<template>
  <section id="about" class="section about">
    <div class="bg-layer">
      <img :src="assetUrl('images/about-bg.jpg')" alt="" loading="lazy" decoding="async" />
    </div>

    <div class="container">
      <div class="section-head" data-reveal>
        <span class="section-head__eyebrow">About / 关于</span>
        <h2 class="section-head__title">从「本地能跑」到「线上敢开」</h2>
        <p class="section-head__desc">
          我不满足于把页面做出来：真正决定交付质量的是数据库怎么建模、接口怎么鉴权、部署怎么回滚、故障怎么定位。
          下面这些是我做项目时固定的工作方式。
        </p>
      </div>

      <div class="about__grid">
        <!-- 左：介绍 + 能力条 -->
        <div class="about__main" data-reveal>
          <h3 class="about__lead">
            一个人负责一个产品的
            <em>全链路</em>
          </h3>
          <p class="about__text">
            需求拆解 → 数据建模 → 接口设计 → 前端交互 → 容器化部署 → 线上排障，这条链路我独立走完过三次。
            过程中最大的收获不是记住了多少 API，而是学会了
            <strong>先定约定、再写代码</strong>
            ： 术语统一、状态机画清楚、权限码写进文档，后面改需求才不会把系统改崩。
          </p>

          <ul class="about__facts">
            <li v-for="fact in facts" :key="fact.title">
              <span class="about__fact-icon">
                <el-icon><component :is="fact.icon" /></el-icon>
              </span>
              <div>
                <strong>{{ fact.title }}</strong>
                <p>{{ fact.desc }}</p>
              </div>
            </li>
          </ul>

          <div class="about__caps">
            <div v-for="cap in capabilities" :key="cap.label" class="about__cap">
              <div class="about__cap-head">
                <span>{{ cap.label }}</span>
                <span class="about__cap-value">{{ cap.value }}%</span>
              </div>
              <el-progress
                :percentage="cap.value"
                :stroke-width="6"
                :show-text="false"
                color="#4ee1ff"
                class="about__cap-bar"
              />
            </div>
          </div>
        </div>

        <!-- 右：工作原则卡片 -->
        <aside class="about__side glass-card" data-reveal>
          <header class="about__side-head">
            <el-icon class="about__side-icon"><Compass /></el-icon>
            <div>
              <h4>工作原则</h4>
              <p>写代码之前先想清楚的四件事</p>
            </div>
          </header>

          <ol class="principles">
            <li v-for="(item, index) in principles" :key="item.title">
              <span class="principles__index">{{ String(index + 1).padStart(2, "0") }}</span>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.desc }}</p>
              </div>
            </li>
          </ol>

          <div class="about__side-foot">
            <span class="about__side-label">当前状态</span>
            <span class="about__side-value">{{ profile.badge }} · {{ profile.location }}</span>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 关于我：左栏介绍 + 能力条，右栏工作原则卡片。
 * 背景使用真实机房照片（about-bg.jpg），由 .bg-layer 统一压暗。
 */
import { Compass, Download, Monitor, SetUp } from "@element-plus/icons-vue";
import { capabilities, principles, profile } from "../data/profile";
import { assetUrl } from "../utils/assetUrl";

/** 三条「事实型」介绍，比形容词有说服力 */
const facts = [
  {
    icon: SetUp,
    title: "三个系统同时在线上运行",
    desc: "同一台 2 核 2G 云服务器跑 9 个容器，前端 / 后端 / 数据库分层隔离，端口与安全组按需开放。",
  },
  {
    icon: Monitor,
    title: "桌面端与移动端都做过",
    desc: "中后台用 Vue 3 + Element Plus 做重交互；移动端用 uni-app 一套代码出 H5，按 rpx 适配。",
  },
  {
    icon: Download,
    title: "发布流程是脚本化的",
    desc: "本机构建镜像 → 压缩上传 → 服务器导入 → 健康自检，一条命令完成更新，不靠手工敲一串命令。",
  },
];
</script>

<style scoped lang="less">
@import "../styles/variables.less";

.about {
  // 背景交给全站连续环境层，这里保持透明，避免出现章节色块
  background: transparent;
}

.about__grid {
  display: grid;
  // 左宽右窄：左侧是正文，右侧是卡片，符合阅读习惯
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 40px;
  align-items: start;
}

/* ---- 左栏 ---- */
.about__lead {
  font-family: @font-display;
  font-size: clamp(22px, 2.6vw, 30px);
  line-height: 1.35;
  letter-spacing: -0.01em;

  em {
    font-style: normal;
    color: @cyan;
    // 用渐变下划线强调关键词，比加粗更轻
    background: linear-gradient(180deg, transparent 68%, rgba(78, 225, 255, 0.22) 68%);
  }
}

.about__text {
  margin-top: 18px;
  color: @text-sub;
  line-height: 1.9;

  strong {
    color: @text;
    font-weight: 600;
  }
}

.about__facts {
  list-style: none;
  margin: 32px 0 0;
  padding: 0;
  display: grid;
  gap: 18px;

  li {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }

  strong {
    font-size: 15px;
    font-weight: 600;
  }

  p {
    margin: 5px 0 0;
    font-size: 14px;
    line-height: 1.75;
    color: @text-sub;
  }
}

.about__fact-icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  border: 1px solid @line;
  background: rgba(78, 225, 255, 0.07);
  color: @cyan;
  font-size: 17px;
}

.about__caps {
  margin-top: 38px;
  display: grid;
  gap: 18px;
  max-width: 560px;
}

.about__cap-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 13.5px;
  color: @text-sub;
  margin-bottom: 8px;
}

.about__cap-value {
  font-family: @font-mono;
  font-size: 12px;
  color: @cyan;
}

.about__cap-bar {
  // 进度条轨道调暗，只有已完成的青色部分在发光
  :deep(.el-progress-bar__outer) {
    background: rgba(110, 190, 255, 0.12);
  }
  :deep(.el-progress-bar__inner) {
    box-shadow: 0 0 12px rgba(78, 225, 255, 0.45);
  }
}

/* ---- 右栏卡片 ---- */
.about__side {
  padding: 26px 24px;
  position: sticky;
  // 顶栏 68px + 一点留白
  top: 92px;
}

.about__side-head {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 18px;
  border-bottom: 1px solid @line;

  h4 {
    font-size: 15px;
    font-weight: 600;
  }

  p {
    margin-top: 3px;
    font-size: 12px;
    color: @text-dim;
  }
}

.about__side-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: @violet;
  background: rgba(155, 123, 255, 0.12);
  border: 1px solid rgba(155, 123, 255, 0.24);
}

.principles {
  list-style: none;
  margin: 20px 0 0;
  padding: 0;
  display: grid;
  gap: 18px;

  li {
    display: flex;
    gap: 12px;
  }

  strong {
    font-size: 14px;
    font-weight: 600;
    color: @text;
  }

  p {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.7;
    color: @text-sub;
  }
}

.principles__index {
  font-family: @font-mono;
  font-size: 12px;
  color: @cyan;
  padding-top: 2px;
  flex: 0 0 auto;
}

.about__side-foot {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px dashed @line;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.about__side-label {
  font-size: 11px;
  letter-spacing: 0.16em;
  color: @text-dim;
  text-transform: uppercase;
}

.about__side-value {
  font-size: 13.5px;
  color: @cyan-soft;
}

/* ---- 响应式 ---- */
@media (max-width: 960px) {
  .about__grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }
  .about__side {
    position: static;
  }
  .about__caps {
    max-width: none;
  }
}
</style>
