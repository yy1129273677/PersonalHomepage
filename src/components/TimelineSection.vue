<template>
  <section id="journey" class="section journey">
    <div class="container">
      <div class="section-head" data-reveal>
        <span class="section-head__eyebrow">Journey / 历程</span>
        <h2 class="section-head__title">一路把系统从能跑，推到敢上线</h2>
        <p class="section-head__desc">时间线里只放「解决了什么具体问题」，不放空泛的技术名词。越靠上越新。</p>
      </div>

      <div class="journey__layout">
        <el-timeline class="journey__timeline" data-reveal>
          <el-timeline-item
            v-for="item in timeline"
            :key="item.title"
            :timestamp="item.date"
            :color="item.current ? '#4ee1ff' : '#9b7bff'"
            placement="top"
            :hollow="!item.current"
          >
            <div class="journey__card glass-card">
              <header class="journey__head">
                <h3>{{ item.title }}</h3>
                <span v-if="item.current" class="journey__now">进行中</span>
              </header>
              <p class="journey__desc">{{ item.desc }}</p>
              <div class="journey__tags">
                <el-tag v-for="tag in item.tags" :key="tag" class="journey__tag" effect="plain" round size="small">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>

        <!-- 右侧「能力地图」：给时间线做一个对照，阅读时不会只有一条线 -->
        <aside class="journey__aside" data-reveal>
          <div class="journey__panel glass-card">
            <h4>这套系统教会我的</h4>
            <ul>
              <li>文档先行：术语、状态机、权限码先定，再写代码</li>
              <li>一致优先：同类项目复用同一套选型与发布流程</li>
              <li>验证导向：每处改动都有可复现的命令和输出</li>
              <li>承认边界：已知限制写进文档，不假装完美</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * 历程：Element Plus 的 ElTimeline 展示关键节点，右侧补一块「收获清单」。
 */
import { timeline } from "../data/timeline";
</script>

<style scoped lang="less">
@import "../styles/variables.less";

.journey {
  background: transparent;
}

.journey__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 40px;
  align-items: start;
}

.journey__timeline {
  padding-left: 4px;

  // 时间轴竖线与节点改成半透明青，和整体配色一致
  :deep(.el-timeline-item__tail) {
    border-left-color: rgba(110, 190, 255, 0.18);
  }
  :deep(.el-timeline-item__node) {
    box-shadow: 0 0 12px rgba(78, 225, 255, 0.4);
  }
  :deep(.el-timeline-item__timestamp) {
    font-family: @font-mono;
    font-size: 11.5px;
    letter-spacing: 0.12em;
    color: @cyan;
    margin-bottom: 8px;
  }
}

.journey__card {
  margin-bottom: 6px;
  padding: 18px 20px;
  transition:
    border-color 0.3s ease,
    transform 0.3s ease;

  &:hover {
    border-color: @line-strong;
    transform: translateX(3px);
  }
}

.journey__head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  h3 {
    font-family: @font-display;
    font-size: 16.5px;
    font-weight: 600;
  }
}

.journey__now {
  font-family: @font-mono;
  font-size: 10.5px;
  color: #04121a;
  background: linear-gradient(135deg, @cyan, @cyan-soft);
  padding: 2px 8px;
  border-radius: 999px;
  letter-spacing: 0.08em;
}

.journey__desc {
  margin-top: 8px;
  font-size: 13.5px;
  line-height: 1.78;
  color: @text-sub;
}

.journey__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}

.journey__tag {
  --el-tag-bg-color: rgba(155, 123, 255, 0.08);
  --el-tag-border-color: rgba(155, 123, 255, 0.24);
  --el-tag-text-color: #cfc2ff;
  font-family: @font-mono;
  font-size: 11px;
}

/* ---- 右侧 ---- */
.journey__aside {
  position: sticky;
  top: 92px;
}

.journey__panel {
  padding: 24px 22px;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: @cyan-soft;
    letter-spacing: 0.04em;
  }

  ul {
    list-style: none;
    margin: 16px 0 0;
    padding: 0;
    display: grid;
    gap: 12px;
  }

  li {
    position: relative;
    padding-left: 16px;
    font-size: 13.5px;
    line-height: 1.7;
    color: @text-sub;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 8px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: @violet;
      box-shadow: 0 0 8px @violet;
    }
  }
}

@media (max-width: 960px) {
  .journey__layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
  }
  .journey__aside {
    position: static;
  }
}
</style>
