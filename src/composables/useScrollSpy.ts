/**
 * 顶部导航的「当前所在章节」高亮
 *
 * 干什么：
 *   监听各个 section 在视口里的可见情况，把当前最靠中间的那一节 id 暴露出去，
 *   顶栏据此给对应导航项加高亮。
 *
 * 为什么用 IntersectionObserver 而不是监听 scroll：
 *   scroll 事件每帧都可能触发，里面再读布局会强制同步回流；
 *   IntersectionObserver 由浏览器调度，几乎零开销。
 */
import { onBeforeUnmount, onMounted, ref } from "vue";

export function useScrollSpy(ids: string[]) {
  // 初始为空：还没滚到任何章节时，导航不应该默认高亮第一项
  const activeId = ref("");
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      // 过滤掉页面上不存在的 id，避免 null 报错
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    observer = new IntersectionObserver(
      (entries) => {
        // 同时有多节可见时，取可见比例最高的那一节
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (mostVisible) activeId.value = mostVisible.target.id;
      },
      {
        // 上下各收缩视口：顶部让出固定顶栏，底部留出半个屏幕，
        // 这样「章节居中」时才会被判为当前章节
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.2, 0.5],
      },
    );

    sections.forEach((section) => observer?.observe(section));
  });

  onBeforeUnmount(() => observer?.disconnect());

  return { activeId };
}
