<template>
  <canvas ref="canvasRef" class="star-field" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
/**
 * 星域背景：用 Three.js 画一层缓慢旋转、随鼠标轻微视差的星点。
 *
 * 干什么：
 *   给整个站点垫一层「深空」氛围，压在所有内容之下，不接收鼠标事件。
 *
 * 为什么是粒子而不是完整 3D 场景：
 *   这个页面要的是「沉浸感」，不是可交互的 3D 展厅。
 *   粒子方案在低端手机上也只占几 MB 内存，掉帧风险低；
 *   真正的 3D 叙事需要美术资源和大量性能预算，性价比不合适。
 *
 * 注意：
 *   - 用户开启「减少动态效果」时不启动渲染，直接留空（页面底色仍然好看）；
 *   - 移动端降低粒子数与像素比，避免发热；
 *   - 组件卸载必须销毁 geometry / material / renderer，否则会留下 WebGL 上下文泄漏。
 */
import { onBeforeUnmount, onMounted, ref } from "vue";
import * as THREE from "three";

const canvasRef = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let geometry: THREE.BufferGeometry | null = null;
let material: THREE.PointsMaterial | null = null;
let starTexture: THREE.Texture | null = null;
let points: THREE.Points | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let frameId = 0;

// 鼠标位置归一化到 [-1, 1]，用于给相机做轻微视差
let pointerX = 0;
let pointerY = 0;
let cameraOffsetX = 0;
let cameraOffsetY = 0;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 屏幕越小粒子越少：手机 650 颗足够，桌面 1500 颗也只是氛围 */
function starCountForViewport() {
  const width = window.innerWidth;
  if (width < 768) return 650;
  if (width < 1280) return 1100;
  return 1500;
}

/**
 * 生成星点的位置、颜色和亮度。
 *
 * 关键约束：**整团星星必须以原点为中心**。
 *   相机在 z = +70 看向原点，星群整体挂在 z = -170（见 init 里的 points.position.z）。
 *   如果星群本身偏心（比如 z 全在 -60 ~ -300），再让它自转，就等于让它在绕世界原点「公转」：
 *   越转越偏，最后整团星星滑出画面——这就是之前「粒子越来越往左、直至消失」的原因。
 *   所以这里用「以原点为中心的椭球」分布，自转时才是原地转。
 */
function createStars(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // 三种星色：偏白、青、紫，随机取，模拟真实星空的色温差异
  const palette = [new THREE.Color("#ffffff"), new THREE.Color("#4ee1ff"), new THREE.Color("#9b7bff")];

  // 椭球半径：x 拉宽、y 压扁，视觉上更像一片横向铺开的星空
  const radius = 140;

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;

    // 球体内均匀随机：先取球面方向，再乘上三次方根随机半径（避免都堆在球心）
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random());

    positions[i3] = r * Math.sin(phi) * Math.cos(theta) * 1.9; // x
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.85; // y
    positions[i3 + 2] = r * Math.cos(phi) * 1.2; // z

    // 亮度随机（0.35 ~ 1）：真实的星空有明暗层次，不是一片同亮度的白点
    const brightness = 0.35 + Math.random() * 0.65;
    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[i3] = color.r * brightness;
    colors[i3 + 1] = color.g * brightness;
    colors[i3 + 2] = color.b * brightness;
  }

  const nextGeometry = new THREE.BufferGeometry();
  nextGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  nextGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return nextGeometry;
}

/**
 * 生成一张「柔光圆点」贴图。
 *
 * 为什么需要：
 *   WebGL 的 Points 在不给贴图时，画出来的是正方形色块——章节背景透明后
 *   星点全部露出来，会看到一堆方块。用 canvas 画一个径向渐变圆当贴图，
 *   星点就变成圆点，边缘还自带柔光，接近真实星光。
 */
function createStarTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.32, "rgba(255, 255, 255, 0.85)");
    gradient.addColorStop(0.72, "rgba(255, 255, 255, 0.22)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function handleResize() {
  if (!renderer || !camera) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function handlePointerMove(event: PointerEvent) {
  pointerX = (event.clientX / window.innerWidth) * 2 - 1;
  pointerY = (event.clientY / window.innerHeight) * 2 - 1;
}

function animate() {
  if (!renderer || !scene || !camera) return;

  // 相机跟随鼠标做极轻微的位移（每帧插值，避免生硬）
  cameraOffsetX += (pointerX * 4 - cameraOffsetX) * 0.02;
  cameraOffsetY += (-pointerY * 3 - cameraOffsetY) * 0.02;
  camera.position.x = cameraOffsetX;
  camera.position.y = cameraOffsetY;
  camera.lookAt(0, 0, 0);

  // 星群非常慢地自转，长时间看也不会觉得静止。
  // 注意：这里绕的是星群自身的中心（几何体以原点为中心，整团被平移到 z=-170），
  // 所以是「原地自转」，不会像绕世界原点那样越转越偏、最后滑出画面。
  if (points) {
    points.rotation.y += 0.00022;
    points.rotation.x += 0.00005;
  }

  renderer.render(scene, camera);
  frameId = requestAnimationFrame(animate);
}

function init() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: window.innerWidth >= 768 });
  } catch {
    // 极老的设备可能拿不到 WebGL 上下文：直接放弃背景，页面内容不受影响
    return;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(width, height, false);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 400);
  camera.position.z = 70;

  geometry = createStars(starCountForViewport());
  starTexture = createStarTexture();
  material = new THREE.PointsMaterial({
    // 有贴图之后 size 是世界单位下的直径；配合 z 拉远，屏幕上是 2~7px 的柔光点
    size: 1.5,
    map: starTexture,
    vertexColors: true,
    transparent: true,
    // 压到 0.55：星点只是氛围，不能抢正文的注意力
    opacity: 0.55,
    depthWrite: false,
    // 加法混合让星点叠加更亮，接近真实星光的观感
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  points = new THREE.Points(geometry, material);
  // 整团星云平移到镜头前方（几何体本身以原点为中心，自转才不会偏心）
  points.position.z = -170;
  scene.add(points);

  window.addEventListener("resize", handleResize);
  window.addEventListener("pointermove", handlePointerMove, { passive: true });

  animate();
}

onMounted(() => {
  if (prefersReducedMotion) return;
  init();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("pointermove", handlePointerMove);

  geometry?.dispose();
  material?.dispose();
  starTexture?.dispose();
  renderer?.dispose();
  renderer = null;
  scene = null;
  geometry = null;
  material = null;
  starTexture = null;
  points = null;
  camera = null;
});
</script>

<style scoped lang="less">
.star-field {
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  // 星点之外再加一点中心径向光，避免纯黑背景显得死板
  background:
    radial-gradient(1200px 700px at 78% 18%, rgba(78, 225, 255, 0.1), transparent 65%),
    radial-gradient(900px 600px at 18% 82%, rgba(155, 123, 255, 0.1), transparent 60%);
}
</style>
