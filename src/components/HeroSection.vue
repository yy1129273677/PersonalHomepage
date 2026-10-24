<template>
  <section id="top" class="hero">
    <!-- 真实星空照片打底；用 <img> 而不是 CSS 背景，方便设置优先加载与懒加载策略 -->
    <div class="hero__bg">
      <img :src="assetUrl('images/hero-bg.jpg')" alt="" fetchpriority="high" decoding="async" />
    </div>
    <!-- 压暗遮罩：保证左侧文字在照片上依然清晰 -->
    <div class="hero__veil"></div>
    <!-- 网格纹理：给「控制台」的技术感，纯 CSS 绘制，不占网络请求 -->
    <div class="hero__grid" aria-hidden="true"></div>

    <div class="container hero__inner">
      <p class="hero__coord" aria-hidden="true">30.27°N · 120.15°E · SYSTEM ONLINE</p>

      <div class="hero__badge" data-reveal>
        <span class="hero__dot"></span>
        {{ profile.badge }}
      </div>

      <h1 class="hero__title" data-reveal>
        <span class="hero__greet">你好，我是</span>
        <span class="hero__name">{{ profile.name }}</span>
      </h1>

      <p class="hero__role" data-reveal>
        {{ profile.role }}
        <span class="hero__role-en">/ Full-stack Engineer</span>
      </p>

      <p class="hero__tagline" data-reveal>{{ profile.tagline }}</p>
      <p class="hero__summary" data-reveal>{{ profile.summary }}</p>

      <div class="hero__actions" data-reveal>
        <el-button type="primary" size="large" round @click="goTo('projects')">
          查看项目
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
        <el-button size="large" round class="hero__ghost" @click="goTo('contact')">联系我</el-button>
        <a class="hero__link" :href="profile.github" target="_blank" rel="noopener noreferrer">
          <el-icon><Link /></el-icon>
          GitHub
        </a>
      </div>

      <div class="hero__stats" data-reveal>
        <StatNumber
          v-for="stat in profile.stats"
          :key="stat.label"
          :label="stat.label"
          :value="stat.value"
          :suffix="stat.suffix"
        />
      </div>
    </div>

    <!-- 右侧装饰：三层轨道环，纯装饰所以对读屏隐藏 -->
    <div class="hero__orbit" aria-hidden="true">
      <span class="hero__ring hero__ring--1"></span>
      <span class="hero__ring hero__ring--2"></span>
      <span class="hero__ring hero__ring--3"></span>
      <span class="hero__core"></span>
    </div>

    <button class="hero__scroll" type="button" aria-label="向下滚动到关于我" @click="goTo('about')">
      <span class="hero__scroll-track"><span class="hero__scroll-thumb"></span></span>
      向下探索
    </button>
  </section>
</template>

<script setup lang="ts">
/**
 * 首屏 Hero
 *
 * 组成：
 *   1）真实星空照片 + 压暗遮罩 + CSS 网格纹理；
 *   2）姓名 / 岗位 / 一句话定位 / 简介 / 行动按钮 / 数字看板；
 *   3）右侧轨道环装饰（纯 CSS 动画）；
 *   4）滚动时背景图做轻微视差（GSAP + ScrollTrigger）。
 */
import { onBeforeUnmount, onMounted } from "vue";
import { ArrowRight, Link } from "@element-plus/icons-vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "../data/profile";
import { assetUrl } from "../utils/assetUrl";
import StatNumber from "./StatNumber.vue";

gsap.registerPlugin(ScrollTrigger);

let parallaxTrigger: ScrollTrigger | null = null;

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

onMounted(() => {
  // 「减少动态效果」的用户不启用视差，避免头晕
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const image = document.querySelector<HTMLImageElement>(".hero__bg img");
  if (!image) return;

  // 背景图比容器高 8%，滚动时向上挪一点，形成视差层次
  parallaxTrigger = ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => {
      gsap.set(image, { yPercent: self.progress * 10 });
    },
  });
});

onBeforeUnmount(() => {
  parallaxTrigger?.kill();
  parallaxTrigger = null;
});
</script>

<style scoped lang="less">
@import "../styles/variables.less";

.hero {
  position: relative;
  min-height: 100vh;
  // svh 在移动端浏览器里比 vh 更准确（不会算进地址栏高度）
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding: 120px 0 96px;
  overflow: hidden;
}

/* ---- 背景：照片 + 遮罩 + 网格 ---- */
.hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 112%;
    object-fit: cover;
    object-position: center 30%;
    // 压暗并提高对比，文字才压得住
    filter: brightness(0.5) saturate(1.1) contrast(1.06);
    will-change: transform;
  }
}

.hero__veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(90deg, rgba(5, 7, 15, 0.94) 0%, rgba(5, 7, 15, 0.72) 42%, rgba(5, 7, 15, 0.28) 100%),
    linear-gradient(180deg, rgba(5, 7, 15, 0.72) 0%, rgba(5, 7, 15, 0) 30%, rgba(5, 7, 15, 0.9) 100%);
}

.hero__grid {
  position: absolute;
  inset: 0;
  z-index: 2;
  opacity: 0.5;
  background-image:
    linear-gradient(rgba(110, 190, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(110, 190, 255, 0.06) 1px, transparent 1px);
  background-size: 64px 64px;
  // 让网格从中间往四周淡出，避免看起来像表格
  mask-image: radial-gradient(circle at 40% 45%, rgba(0, 0, 0, 0.9), transparent 72%);
  -webkit-mask-image: radial-gradient(circle at 40% 45%, rgba(0, 0, 0, 0.9), transparent 72%);
}

.hero__inner {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 1180px;
}

/* ---- 文案 ---- */
.hero__coord {
  font-family: @font-mono;
  font-size: 11px;
  letter-spacing: 0.28em;
  color: rgba(126, 232, 255, 0.5);
  margin-bottom: 22px;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 7px 15px;
  border-radius: 999px;
  border: 1px solid rgba(78, 225, 255, 0.28);
  background: rgba(78, 225, 255, 0.08);
  font-size: 13px;
  color: @cyan-soft;
  letter-spacing: 0.06em;
}

.hero__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38f2a0;
  box-shadow: 0 0 10px #38f2a0;
  animation: pulse 2.4s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.82);
  }
}

.hero__title {
  margin-top: 22px;
  font-family: @font-display;
  font-size: clamp(44px, 8vw, 92px);
  line-height: 1.02;
  letter-spacing: -0.03em;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero__greet {
  font-size: clamp(15px, 1.6vw, 18px);
  font-weight: 400;
  letter-spacing: 0.32em;
  color: @text-sub;
  text-transform: uppercase;
}

.hero__name {
  // 名字用青→紫渐变 + 微弱发光，是整页的视觉中心
  // 注意：父级是 flex column，span 默认会被拉满宽度，渐变就会摊开到整个屏幕宽，
  // 文字只剩最左边那一小段颜色。所以这里必须让它宽度贴合文字。
  align-self: flex-start;
  width: fit-content;
  background: linear-gradient(100deg, #ffffff 6%, @cyan 44%, @violet 96%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 60px rgba(78, 225, 255, 0.24);
}

.hero__role {
  margin-top: 20px;
  font-size: clamp(17px, 2vw, 22px);
  font-weight: 600;
  color: @text;
}

.hero__role-en {
  font-family: @font-mono;
  font-size: 0.72em;
  font-weight: 400;
  color: @text-dim;
  letter-spacing: 0.08em;
}

.hero__tagline {
  margin-top: 12px;
  font-size: clamp(17px, 2.2vw, 24px);
  color: @cyan-soft;
  letter-spacing: 0.01em;
}

.hero__summary {
  margin-top: 18px;
  max-width: 620px;
  color: @text-sub;
  font-size: 15.5px;
  line-height: 1.85;
}

/* ---- 按钮 ---- */
.hero__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.hero__ghost {
  background: rgba(10, 18, 32, 0.55);
  border-color: @line-strong;
  color: @text;

  &:hover {
    border-color: @cyan;
    color: @cyan;
    background: rgba(78, 225, 255, 0.08);
  }
}

.hero__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 4px;
  font-size: 14px;
  color: @text-sub;
  border-bottom: 1px solid transparent;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    color: @cyan;
    border-bottom-color: @cyan;
  }
}

/* ---- 数字看板 ---- */
.hero__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  margin-top: 54px;
  padding-top: 30px;
  border-top: 1px solid @line;
  max-width: 720px;
}

/* ---- 右侧轨道装饰 ---- */
.hero__orbit {
  position: absolute;
  right: -6vw;
  top: 50%;
  z-index: 2;
  width: min(46vw, 560px);
  aspect-ratio: 1;
  transform: translateY(-50%);
  pointer-events: none;
}

.hero__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(78, 225, 255, 0.2);

  &--1 {
    animation: spin 34s linear infinite;
    border-top-color: rgba(78, 225, 255, 0.7);
  }
  &--2 {
    inset: 12%;
    border-color: rgba(155, 123, 255, 0.18);
    border-left-color: rgba(155, 123, 255, 0.6);
    animation: spin 24s linear infinite reverse;
  }
  &--3 {
    inset: 26%;
    border-style: dashed;
    border-color: rgba(110, 190, 255, 0.16);
    animation: spin 46s linear infinite;
  }
}

.hero__core {
  position: absolute;
  inset: 38%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 30%,
    rgba(78, 225, 255, 0.5),
    rgba(155, 123, 255, 0.16) 55%,
    transparent 72%
  );
  box-shadow: 0 0 90px rgba(78, 225, 255, 0.24);
  animation: breathe 5s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.85;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.06);
  }
}

/* ---- 向下滚动提示 ---- */
.hero__scroll {
  position: absolute;
  left: 50%;
  bottom: 26px;
  z-index: 4;
  transform: translateX(-50%);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 0;
  background: transparent;
  color: @text-dim;
  font-size: 11px;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: @cyan;
  }
}

.hero__scroll-track {
  display: block;
  width: 22px;
  height: 34px;
  border: 1px solid rgba(110, 190, 255, 0.34);
  border-radius: 999px;
  position: relative;
}

.hero__scroll-thumb {
  position: absolute;
  left: 50%;
  top: 7px;
  width: 3px;
  height: 7px;
  margin-left: -1.5px;
  border-radius: 2px;
  background: @cyan;
  animation: scrollHint 1.9s ease-in-out infinite;
}

@keyframes scrollHint {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(14px);
  }
}

/* ---- 响应式 ---- */
@media (max-width: 1024px) {
  .hero__orbit {
    right: -18vw;
    opacity: 0.6;
  }
}

@media (max-width: 900px) {
  .hero {
    padding: 100px 0 90px;
    min-height: auto;
  }
  .hero__veil {
    background:
      linear-gradient(180deg, rgba(5, 7, 15, 0.82) 0%, rgba(5, 7, 15, 0.74) 45%, rgba(5, 7, 15, 0.96) 100%),
      linear-gradient(90deg, rgba(5, 7, 15, 0.8), rgba(5, 7, 15, 0.42));
  }
  .hero__orbit {
    right: -34vw;
    top: 22%;
    width: 78vw;
    opacity: 0.4;
  }
  .hero__summary {
    font-size: 15px;
  }
  .hero__stats {
    gap: 26px;
    margin-top: 40px;
  }
  .hero__scroll {
    display: none;
  }
  .hero__coord {
    letter-spacing: 0.18em;
  }
}

@media (max-width: 640px) {
  // 手机上统计数字改成 2×2 网格，避免最后一项单独占一行显得空
  .hero__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px 16px;
  }
}
</style>
