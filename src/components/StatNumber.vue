<template>
  <div ref="rootRef" class="stat" :class="{ 'stat--done': started }">
    <div class="stat__value">
      <!-- 数字用等宽字体，跳动时宽度不抖 -->
      <span class="stat__number">{{ display }}</span>
      <span v-if="suffix" class="stat__suffix">{{ suffix }}</span>
    </div>
    <div class="stat__label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
/**
 * 数字看板：滚动到可见区域时，从 0 递增到目标值。
 *
 * 干什么：
 *   首屏那排「已上线项目 3 个 / 运行容器 9 个」的统计数字，
 *   进入视口才开始跳动，给页面一点「仪表盘启动」的科技感。
 *
 * 注意：
 *   - 用户开启「减少动态效果」时直接显示终值；
 *   - 只播一次，滚回来不再重播；
 *   - 用 requestAnimationFrame 而不是 setInterval，跟屏幕刷新率同步、不掉帧。
 */
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    label: string;
    value: number;
    suffix?: string;
    /** 动画时长（毫秒） */
    duration?: number;
  }>(),
  { duration: 1400 },
);

const rootRef = ref<HTMLElement | null>(null);
const display = ref(0);
const started = ref(false);

let frameId = 0;
let observer: IntersectionObserver | null = null;

/** 缓动函数：先快后慢，数字停下来时更自然 */
const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);

function runCountUp() {
  if (started.value) return;
  started.value = true;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    display.value = props.value;
    return;
  }

  const startTime = performance.now();

  const step = (now: number) => {
    const progress = Math.min((now - startTime) / props.duration, 1);
    display.value = Math.round(easeOutCubic(progress) * props.value);
    if (progress < 1) {
      frameId = requestAnimationFrame(step);
    }
  };

  frameId = requestAnimationFrame(step);
}

onMounted(() => {
  if (!rootRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        runCountUp();
        observer?.disconnect();
      }
    },
    { threshold: 0.4 },
  );
  observer.observe(rootRef.value);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId);
  observer?.disconnect();
});
</script>

<style scoped lang="less">
@import "../styles/variables.less";

.stat {
  min-width: 96px;
}

.stat__value {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-family: @font-mono;
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 700;
  line-height: 1.1;
  // 数字用青→白渐变，停下来后有一点点发光
  background: linear-gradient(180deg, #ffffff 20%, @cyan 130%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.stat__suffix {
  font-size: 0.5em;
  color: @text-sub;
  // 后缀不参与文字渐变
  -webkit-text-fill-color: @text-sub;
}

.stat__label {
  margin-top: 6px;
  font-size: 13px;
  color: @text-dim;
  letter-spacing: 0.04em;
}
</style>
