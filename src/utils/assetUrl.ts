/**
 * 拼接 public 目录下静态资源的地址。
 *
 * 为什么要这个函数：
 *   vite.config.ts 里 base 设成了 "./"，意思是构建产物可以放在服务器任意子目录。
 *   如果组件里写死 "/images/hero-bg.jpg"，部署到 /resume/ 这种子目录时就会 404；
 *   模板里写相对路径 "./images/..." 又会被 Vite 当成模块去解析（报 Module not found）。
 *   import.meta.env.BASE_URL 就是构建时的 base，用拼接的方式两边都兼容。
 */
export function assetUrl(path: string): string {
  const normalized = path.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalized}`;
}
