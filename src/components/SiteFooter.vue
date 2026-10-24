<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <span class="footer__mark">{{ profile.initials }}</span>
        <div>
          <strong>{{ profile.name }} · {{ profile.role }}</strong>
          <p>{{ profile.tagline }}</p>
        </div>
      </div>

      <div class="footer__meta">
        <span>© {{ year }} {{ profile.name }}</span>
        <!-- 备案号：上线后换成你真实的 ICP 备案号（没有则删除这一行） -->
        <span class="footer__icp">ICP 备案号：待填写</span>
        <span class="footer__build">Vue 3 · Vite · Element Plus · Three.js</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
/**
 * 页脚：品牌信息 + 版权 + 备案占位 + 技术栈署名。
 * 备案号是一个 span 占位，正式上线后替换成真实号码（或删掉那一行）。
 */
import { profile } from "../data/profile";

const year = new Date().getFullYear();
</script>

<style scoped lang="less">
@import "../styles/variables.less";

.footer {
  position: relative;
  z-index: 1;
  padding: 34px 0 40px;
  border-top: 1px solid @line;
  background: rgba(4, 6, 12, 0.9);
}

.footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.footer__brand {
  display: flex;
  align-items: center;
  gap: 12px;

  strong {
    font-size: 14px;
    font-weight: 600;
  }

  p {
    margin-top: 3px;
    font-size: 12px;
    color: @text-dim;
  }
}

.footer__mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-family: @font-mono;
  font-size: 12px;
  font-weight: 700;
  color: #04121a;
  background: linear-gradient(135deg, @cyan, @violet);
}

.footer__meta {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 12px;
  color: @text-dim;
  flex-wrap: wrap;
}

.footer__icp {
  padding: 2px 8px;
  border: 1px solid @line;
  border-radius: 999px;
}

.footer__build {
  font-family: @font-mono;
  font-size: 11px;
  letter-spacing: 0.04em;
}

@media (max-width: 640px) {
  .footer__inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
