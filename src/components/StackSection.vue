<template>
  <section id="stack" class="section stack">
    <!-- 顶部一层柔光，打破连续的纯色背景 -->
    <div class="stack__glow" aria-hidden="true"></div>

    <div class="container">
      <div class="section-head" data-reveal>
        <span class="section-head__eyebrow">Stack / 技术栈</span>
        <h2 class="section-head__title">按「解决什么问题」分类，而不是堆名词</h2>
        <p class="section-head__desc">
          每一项后面都写了我在项目里拿它做什么。用得熟的是前端工程、接口与数据建模；用得顺手的是容器化部署与 AI
          应用接入。
        </p>
      </div>

      <div class="stack__grid">
        <article
          v-for="group in stackGroups"
          :key="group.key"
          class="stack__card glass-card"
          :class="`stack__card--${group.accent}`"
          data-reveal
        >
          <header class="stack__head">
            <div>
              <span class="stack__subtitle">{{ group.subtitle }}</span>
              <h3 class="stack__title">{{ group.title }}</h3>
            </div>
            <span class="stack__count">{{ group.items.length }}</span>
          </header>

          <ul class="stack__list">
            <li v-for="item in group.items" :key="item.name">
              <el-tag class="stack__tag" effect="plain" round size="small">{{ item.name }}</el-tag>
              <p>{{ item.note }}</p>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 技术栈：5 张分组卡片，每组一个主色（青 / 紫 / 琥珀）。
 * 用 Element Plus 的 ElTag 做技术名标签，说明文字跟在后面。
 */
import { stackGroups } from "../data/stack";
</script>

<style scoped lang="less">
@import "../styles/variables.less";

.stack {
  // 全站连续环境层负责底色，这里透明，避免和其他章节拼出硬边
  background: transparent;
}

.stack__glow {
  position: absolute;
  top: -10%;
  left: 50%;
  width: min(900px, 90vw);
  height: 520px;
  transform: translateX(-50%);
  background: radial-gradient(circle at 50% 50%, rgba(78, 225, 255, 0.1), transparent 68%);
  pointer-events: none;
}

.stack__grid {
  display: grid;
  // 自适应列数：宽屏 3 列，中等 2 列，手机 1 列
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 22px;
}

.stack__card {
  padding: 24px 22px 20px;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  // 左侧一条 2px 的主色高亮条
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 22px;
    bottom: 22px;
    width: 2px;
    border-radius: 2px;
    background: @cyan;
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: @line-strong;
    box-shadow: @shadow-glow;
  }
}

.stack__card--violet::before {
  background: @violet;
}
.stack__card--amber::before {
  background: @amber;
}

.stack__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid @line;
}

.stack__subtitle {
  font-family: @font-mono;
  font-size: 10.5px;
  letter-spacing: 0.2em;
  color: @text-dim;
}

.stack__title {
  margin-top: 6px;
  font-family: @font-display;
  font-size: 20px;
  letter-spacing: 0.01em;
}

.stack__count {
  font-family: @font-mono;
  font-size: 12px;
  color: @text-dim;
  padding: 2px 8px;
  border: 1px solid @line;
  border-radius: 999px;
}

.stack__list {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: grid;
  gap: 12px;

  li {
    display: grid;
    gap: 6px;
  }

  p {
    font-size: 13px;
    line-height: 1.65;
    color: @text-sub;
  }
}

.stack__tag {
  justify-self: start;
  // 覆盖 Element Plus 标签默认的浅底，改成半透明青底
  --el-tag-bg-color: rgba(78, 225, 255, 0.08);
  --el-tag-border-color: rgba(78, 225, 255, 0.26);
  --el-tag-text-color: #a9f0ff;
  font-family: @font-mono;
  letter-spacing: 0.02em;
}

@media (max-width: 640px) {
  .stack__card {
    padding: 20px 18px 16px;
  }
}
</style>
