import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// 构建配置说明：
// - base 用 "./"，构建产物可以放在服务器任意子目录（比如 /resume/）而不需要改代码；
// - 图片等静态资源放 public/images，构建后原样复制到 dist/images。
export default defineConfig({
  base: "./",
  plugins: [vue()],
  server: {
    host: "127.0.0.1",
    port: 5179,
  },
  build: {
    target: "es2019",
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // 把体积大、很少变动的库拆成独立 chunk，浏览器可以长期缓存
        // 注意：Vite 8（rolldown）只接受函数形式，不能再传对象
        manualChunks(id: string) {
          if (id.includes("node_modules/three")) return "three";
          if (id.includes("node_modules/element-plus") || id.includes("node_modules/@element-plus")) return "element";
          if (id.includes("node_modules/gsap")) return "motion";
          return undefined;
        },
      },
    },
  },
});
