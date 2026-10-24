<template>
  <a class="skip-link" href="#main">跳到主内容</a>

  <!-- 全站连续环境背景：固定在视口上，滚动时不动，保证各章节之间没有接缝 -->
  <div class="ambient" aria-hidden="true"></div>

  <!-- 全站星域背景：固定在最底层，不接收鼠标事件 -->
  <StarField />

  <SiteHeader />

  <main id="main" class="main">
    <HeroSection />
    <AboutSection />
    <StackSection />
    <ProjectsSection />
    <TimelineSection />
    <ContactSection />
  </main>

  <SiteFooter />

  <!-- 回到顶部：Element Plus 自带组件，滚动 600px 后出现 -->
  <el-backtop :right="22" :bottom="22" :visibility-height="600" />
</template>

<script setup lang="ts">
/**
 * 单页应用根组件
 *
 * 层次关系（z-index）：
 *   0  星域背景（StarField，position: fixed）
 *   1  页面内容（main / footer）
 *   100 顶部导航
 * 这些层级写在各自组件的样式里，避免互相覆盖。
 */
import AboutSection from "./components/AboutSection.vue";
import ContactSection from "./components/ContactSection.vue";
import HeroSection from "./components/HeroSection.vue";
import ProjectsSection from "./components/ProjectsSection.vue";
import SiteFooter from "./components/SiteFooter.vue";
import SiteHeader from "./components/SiteHeader.vue";
import StackSection from "./components/StackSection.vue";
import StarField from "./components/StarField.vue";
import TimelineSection from "./components/TimelineSection.vue";
import { useRevealOnScroll } from "./composables/useRevealOnScroll";

// 全站只注册一次：给所有 [data-reveal] 元素挂滚动进场动画
useRevealOnScroll();
</script>

<style scoped lang="less">
@import "./styles/variables.less";

#app {
  position: relative;
  min-height: 100vh;
  // 建立独立的层叠上下文，让下面的 .ambient（z-index: -1）既能压在内容之下、
  // 又不会被 #app 自己的背景色盖住
  isolation: isolate;
  background: @bg-deep;
}

/* 全站连续环境背景
   —— position: fixed 让它"钉"在视口上，页面滚动时这层不动，
      所以从第一屏滚到最后一屏，背后始终是同一张连续的光晕，
      不再出现"某个章节背景是一块、另一个章节又是另一块"的割裂感。 */
.ambient {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-color: @bg-deep;
  background-image:
    // 左上：青色星云光
    radial-gradient(1100px 780px at 16% 6%, rgba(78, 225, 255, 0.13), transparent 62%),
    // 右侧中部：紫色光带
    radial-gradient(1000px 900px at 86% 38%, rgba(155, 123, 255, 0.14), transparent 64%),
    // 左下：青色补光，避免长时间滚动后画面发闷
    radial-gradient(900px 700px at 22% 86%, rgba(78, 225, 255, 0.08), transparent 62%),
    // 基础底色渐变
    linear-gradient(180deg, #05070f 0%, #070c18 42%, #05070f 100%);
}

.main {
  position: relative;
  z-index: 1;
}
</style>
