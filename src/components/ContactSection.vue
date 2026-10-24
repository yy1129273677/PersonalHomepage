<template>
  <section id="contact" class="section contact">
    <div class="bg-layer bg-layer--bright">
      <img :src="assetUrl('images/contact-bg.jpg')" alt="" loading="lazy" decoding="async" />
    </div>

    <div class="container">
      <div class="contact__inner" data-reveal>
        <span class="section-head__eyebrow">Contact / 联系</span>
        <h2 class="contact__title">
          你的团队需要一个
          <br />
          <span>能把系统真正跑上线</span>
          的人
        </h2>
        <p class="contact__desc">
          简历、项目细节、线上演示环境都可以进一步沟通。新需求我也愿意先花时间做需求拆解和方案对比，再决定要不要动手。
        </p>

        <div class="contact__grid">
          <button class="contact__card glass-card" type="button" @click="copyEmail">
            <el-icon class="contact__icon"><Message /></el-icon>
            <span class="contact__label">邮箱 · 点击复制</span>
            <span class="contact__value">{{ profile.email }}</span>
            <span class="contact__action">
              <el-icon><CopyDocument /></el-icon>
              复制
            </span>
          </button>

          <a class="contact__card glass-card" :href="profile.github" target="_blank" rel="noopener noreferrer">
            <el-icon class="contact__icon"><Link /></el-icon>
            <span class="contact__label">GitHub</span>
            <span class="contact__value">{{ profile.githubLabel }}</span>
            <span class="contact__action">
              <el-icon><TopRight /></el-icon>
              打开
            </span>
          </a>

          <div class="contact__card glass-card contact__card--static">
            <el-icon class="contact__icon"><Location /></el-icon>
            <span class="contact__label">所在地 / 求职状态</span>
            <span class="contact__value">{{ profile.location }}</span>
            <span class="contact__action">{{ profile.badge }}</span>
          </div>
        </div>

        <div class="contact__cta">
          <el-button type="primary" size="large" round @click="copyEmail">复制邮箱，随时联系</el-button>
          <el-button size="large" round class="contact__ghost" @click="goTop">回到顶部</el-button>
        </div>

        <p class="contact__note">
          本页由
          <span>Vue 3 + TypeScript + Element Plus + Three.js</span>
          构建；背景为真实星域/机房摄影素材，已做压缩处理。
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 联系区
 *
 * 邮箱：点击复制到剪贴板（HTTP 环境下 Clipboard API 不可用时，退回 textarea + execCommand）。
 * GitHub：直接跳转。
 * 位置/状态：纯展示。
 */
import { ElMessage } from "element-plus";
import { CopyDocument, Link, Location, Message, TopRight } from "@element-plus/icons-vue";
import { profile } from "../data/profile";
import { assetUrl } from "../utils/assetUrl";

async function copyEmail() {
  const email = profile.email;

  try {
    // 现代浏览器（HTTPS / localhost 才有）优先走异步剪贴板
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(email);
      ElMessage.success("邮箱已复制到剪贴板");
      return;
    }
    throw new Error("clipboard-unavailable");
  } catch {
    // 兜底：HTTP 环境下用隐藏 textarea + execCommand 复制
    const textarea = document.createElement("textarea");
    textarea.value = email;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      ElMessage.success("邮箱已复制到剪贴板");
    } catch {
      ElMessage.warning(`复制失败，请手动复制：${email}`);
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

function goTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<style scoped lang="less">
@import "../styles/variables.less";

.contact {
  background: transparent;
  padding-bottom: 40px;
}

.contact__inner {
  max-width: 900px;
}

.contact__title {
  margin-top: 16px;
  font-family: @font-display;
  font-size: clamp(26px, 4.4vw, 46px);
  line-height: 1.32;
  letter-spacing: -0.02em;

  span {
    // 高亮短语整体不换行，避免渐变文字被拆成两行（桌面和手机都放得下）
    white-space: nowrap;
    // 关键词用渐变强调，和首屏名字呼应
    background: linear-gradient(100deg, @cyan 10%, @violet 92%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}

.contact__desc {
  margin-top: 16px;
  max-width: 640px;
  color: @text-sub;
  font-size: 15px;
  line-height: 1.85;
}

.contact__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 36px;
}

.contact__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 18px;
  text-align: left;
  border-radius: @radius;
  cursor: pointer;
  transition:
    transform 0.28s ease,
    border-color 0.28s ease,
    box-shadow 0.28s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(78, 225, 255, 0.36);
    box-shadow: @shadow-glow;
  }

  &--static {
    cursor: default;

    &:hover {
      transform: none;
      border-color: var(--el-border-color);
      box-shadow: @shadow-lg;
    }
  }
}

.contact__icon {
  font-size: 20px;
  color: @cyan;
  margin-bottom: 4px;
}

.contact__label {
  font-size: 11.5px;
  letter-spacing: 0.14em;
  color: @text-dim;
  text-transform: uppercase;
}

.contact__value {
  font-family: @font-mono;
  font-size: 14px;
  color: @text;
  word-break: break-all;
}

.contact__action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  font-size: 12px;
  color: @cyan;
}

.contact__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.contact__ghost {
  background: rgba(10, 18, 32, 0.55);
  border-color: @line-strong;
  color: @text;

  &:hover {
    border-color: @cyan;
    color: @cyan;
    background: rgba(78, 225, 255, 0.08);
  }
}

.contact__note {
  margin-top: 46px;
  font-size: 12px;
  color: @text-dim;

  span {
    color: @text-sub;
  }
}

@media (max-width: 640px) {
  .contact__grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .contact__cta {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
