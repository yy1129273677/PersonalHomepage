<template>
  <header class="header" :class="{ 'header--solid': scrolled }">
    <!-- 顶部阅读进度条：科幻界面的「扫描线」感 -->
    <div class="header__progress" :style="{ transform: `scaleX(${progress})` }"></div>

    <div class="header__inner container">
      <a class="brand" href="#top" aria-label="回到顶部">
        <span class="brand__mark">{{ profile.initials }}</span>
        <span class="brand__text">
          <strong>{{ profile.name }}</strong>
          <small>{{ profile.role }}</small>
        </span>
      </a>

      <!-- 桌面端导航 -->
      <nav class="nav" aria-label="主导航">
        <a
          v-for="item in navItems"
          :key="item.id"
          class="nav__link"
          :class="{ 'nav__link--active': activeId === item.id }"
          :href="`#${item.id}`"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="header__actions">
        <el-button class="header__cta" type="primary" round @click="scrollTo('contact')">联系我</el-button>
        <button
          class="header__menu"
          type="button"
          aria-label="打开导航菜单"
          :aria-expanded="drawerVisible"
          @click="drawerVisible = true"
        >
          <el-icon><Menu /></el-icon>
        </button>
      </div>
    </div>
  </header>

  <!--
    移动端抽屉导航。
    注意它必须放在 <header> 外面（也不能被 header 包裹）：
    header 滚动后会带上 backdrop-filter，而 backdrop-filter 会让元素成为
    position: fixed 子元素的「包含块」——抽屉就会被压到 header 那 60px 里，
    滚动后打开菜单只能看到一条窄缝、下面露出页面内容。
    另外再加上 append-to-body，直接把抽屉挂到 body 上，彻底不受任何祖先影响。
  -->
  <el-drawer v-model="drawerVisible" direction="rtl" size="78%" :with-header="false" append-to-body class="nav-drawer">
    <div class="drawer">
      <!-- 顶部一条操作栏：放一个明确的关闭按钮。
           之前把抽屉头部整个关掉了，手机上只能点遮罩关闭，很多人找不到怎么退出去。 -->
      <div class="drawer__bar">
        <span class="drawer__bar-title">导航</span>
        <button class="drawer__close" type="button" aria-label="关闭导航菜单" @click="drawerVisible = false">
          <el-icon><Close /></el-icon>
        </button>
      </div>

      <div class="drawer__head">
        <span class="brand__mark">{{ profile.initials }}</span>
        <div>
          <strong>{{ profile.name }}</strong>
          <p>{{ profile.role }}</p>
        </div>
      </div>
      <a
        v-for="item in navItems"
        :key="item.id"
        class="drawer__link"
        :class="{ 'drawer__link--active': activeId === item.id }"
        :href="`#${item.id}`"
        @click="drawerVisible = false"
      >
        {{ item.label }}
      </a>
      <el-button type="primary" round class="drawer__cta" @click="handleDrawerContact">联系我</el-button>
      <p class="drawer__hint">{{ profile.location }} · {{ profile.badge }}</p>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
/**
 * 顶部固定导航
 *
 * 功能：
 *   1）滚动到一定距离后加毛玻璃底（未滚动时完全透明，让首屏更干净）；
 *   2）根据当前所在章节高亮导航项（IntersectionObserver，见 useScrollSpy）；
 *   3）顶部一条阅读进度条；
 *   4）移动端收起为抽屉，用 Element Plus 的 ElDrawer。
 */
import { onBeforeUnmount, onMounted, ref } from "vue";
import { Close, Menu } from "@element-plus/icons-vue";
import { navItems, profile } from "../data/profile";
import { useScrollSpy } from "../composables/useScrollSpy";

const { activeId } = useScrollSpy(navItems.map((item) => item.id));

const scrolled = ref(false);
const drawerVisible = ref(false);
const progress = ref(0);

/** 页面滚动了多少（0 ~ 1），用于顶部进度条 */
function updateScrollState() {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.value = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;
  scrolled.value = scrollTop > 24;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleDrawerContact() {
  drawerVisible.value = false;
  // 等抽屉关闭动画走完再滚动，否则视觉上会「跳一下」
  window.setTimeout(() => scrollTo("contact"), 240);
}

onMounted(() => {
  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", updateScrollState);
  updateScrollState();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateScrollState);
  window.removeEventListener("resize", updateScrollState);
});
</script>

<style scoped lang="less">
@import "../styles/variables.less";

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    backdrop-filter 0.3s ease;
  border-bottom: 1px solid transparent;

  &--solid {
    background: rgba(5, 7, 15, 0.86);
    // 老 Safari 认 -webkit- 前缀；标准属性放在下面单独的 @supports 里，
    // 否则构建压缩时会被去重掉，Firefox 上就没有毛玻璃了
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    border-bottom-color: @line;
  }
}

@supports (backdrop-filter: blur(1px)) {
  .header--solid {
    backdrop-filter: blur(16px) saturate(140%);
  }
}

.header__progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  transform-origin: left center;
  background: linear-gradient(90deg, @cyan, @violet);
  box-shadow: 0 0 12px rgba(78, 225, 255, 0.6);
  transition: transform 0.12s linear;
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: 68px;
}

/* ---- 品牌 ---- */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.brand__mark {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  font-family: @font-mono;
  font-size: 14px;
  font-weight: 700;
  color: #04121a;
  background: linear-gradient(135deg, @cyan, @violet);
  box-shadow: 0 6px 18px rgba(78, 225, 255, 0.28);
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;

  strong {
    font-family: @font-display;
    font-size: 15px;
    letter-spacing: 0.02em;
  }
  small {
    font-size: 11px;
    color: @text-dim;
    letter-spacing: 0.08em;
  }
}

/* ---- 桌面导航 ---- */
.nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav__link {
  position: relative;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 14px;
  color: @text-sub;
  transition:
    color 0.2s ease,
    background 0.2s ease;

  &:hover {
    color: @text;
    background: rgba(110, 190, 255, 0.08);
  }

  &--active {
    color: @cyan;
    background: rgba(78, 225, 255, 0.1);

    &::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: 2px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: @cyan;
      box-shadow: 0 0 8px @cyan;
      transform: translateX(-50%);
    }
  }
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header__cta {
  // 顶栏按钮做得更紧凑一点
  height: 36px;
  padding: 0 18px;
}

.header__menu {
  display: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 11px;
  border: 1px solid @line;
  background: rgba(10, 18, 32, 0.6);
  color: @text;
  cursor: pointer;
  font-size: 18px;
}

/* ---- 抽屉 ---- */
.drawer {
  display: flex;
  flex-direction: column;
  gap: 6px;
  // 顶部留出安全距离：没有 header 的抽屉如果贴顶，头像块会被裁掉。
  // env(safe-area-inset-*) 处理刘海屏 / 底部小黑条，避免内容被系统栏盖住。
  padding: calc(14px + env(safe-area-inset-top)) calc(14px + env(safe-area-inset-right))
    calc(18px + env(safe-area-inset-bottom)) calc(14px + env(safe-area-inset-left));
  // 内容超长时由抽屉 body 负责滚动（见文件末尾的全局样式），这里不再自己滚
}

/* 抽屉顶部操作栏：明确的关闭按钮 */
.drawer__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 2px 4px 10px;
}

.drawer__bar-title {
  font-family: @font-mono;
  font-size: 10.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: @text-dim;
}

.drawer__close {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 10px;
  border: 1px solid @line;
  background: rgba(10, 18, 32, 0.6);
  color: @text-sub;
  font-size: 16px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    color: @cyan;
    border-color: rgba(78, 225, 255, 0.4);
    background: rgba(78, 225, 255, 0.08);
  }
}

.drawer__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px 20px;

  strong {
    font-family: @font-display;
    font-size: 16px;
  }
  p {
    margin: 2px 0 0;
    font-size: 12px;
    color: @text-dim;
  }
}

.drawer__link {
  padding: 14px 12px;
  border-radius: 12px;
  font-size: 16px;
  color: @text-sub;
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &:hover,
  &--active {
    color: @cyan;
    background: rgba(78, 225, 255, 0.08);
    border-color: rgba(78, 225, 255, 0.22);
  }
}

.drawer__cta {
  margin-top: 18px;
}

.drawer__hint {
  margin-top: 14px;
  padding: 0 12px;
  font-size: 12px;
  color: @text-dim;
}

/* ---- 响应式 ---- */
@media (max-width: 900px) {
  .nav {
    display: none;
  }
  .header__cta {
    display: none;
  }
  .header__menu {
    display: inline-flex;
  }
  .header__inner {
    height: 60px;
  }
  .brand__text small {
    display: none;
  }
}
</style>

<style lang="less">
/* 抽屉是渲染到 body 上的，scoped 样式够不到它的外层容器，所以单独写一层全局样式。
   这里负责三件事：
   1) 限制最大宽度：平板上不会占掉 78% 那么宽；
   2) 换掉 Element Plus 默认的浅色底，改成和站点一致的深色面板；
   3) 让 body 可以滚动（横屏或小屏手机高度不够时，内容不被裁掉）。 */
.nav-drawer.el-drawer {
  max-width: 380px;
  background: rgba(9, 16, 28, 0.98);
  border-left: 1px solid rgba(110, 190, 255, 0.16);
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.55);

  .el-drawer__body {
    padding: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
}
</style>
