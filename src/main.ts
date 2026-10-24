import { createApp } from "vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "./styles/index.less";
import App from "./App.vue";

// 全站固定暗色（科幻风），在 <html> 上加 dark 类让 Element Plus 走暗色变量
document.documentElement.classList.add("dark");

const app = createApp(App);

// 中文语言包：Element Plus 的内置文案（分页、对话框按钮等）走中文
app.use(ElementPlus, { locale: zhCn });

app.mount("#app");
