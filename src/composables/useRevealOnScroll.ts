/**
 * 滚动进场动画（全站通用）
 *
 * 干什么：
 *   页面上任何带 data-reveal 属性的元素，第一次滚动进入视口时，
 *   会从「下方 34px + 透明」过渡到「原位 + 不透明」。
 *
 * 为什么不用 CSS animation：
 *   需要「进入视口才触发」，CSS 只能靠 IntersectionObserver 手写监听；
 *   GSAP 的 ScrollTrigger 把这件事封装好了，而且能统一销毁，避免内存泄漏。
 *
 * 注意：
 *   - 用户系统开启「减少动态效果」时直接跳过动画（无障碍要求）；
 *   - 组件卸载时会 kill 掉所有 trigger，防止 SPA 切换页面后残留。
 */
import { nextTick, onBeforeUnmount, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useRevealOnScroll() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  onMounted(async () => {
    if (prefersReducedMotion) return;

    // 等 DOM 渲染完成再测量，否则元素高度可能是 0
    await nextTick();

    const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    targets.forEach((target) => {
      gsap.fromTo(
        target,
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: target,
            // 元素顶部到达视口 90% 位置时开始播放
            start: "top 90%",
            // once: true 表示只播一次，回滚不重播（避免来回抖）
            once: true,
          },
        },
      );
    });
  });

  onBeforeUnmount(() => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  });
}
