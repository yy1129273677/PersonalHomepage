/**
 * 用本机 Edge 给页面截图（只用于开发期验证，不参与构建）
 * 用法：node scripts/screenshot.mjs
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const URL = "http://127.0.0.1:4179/";
const OUT = "E:/study/project/PersonalHomepage/shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: EDGE });
const errors = [];

// ---------- 桌面端 ----------
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
desktop.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
desktop.on("console", (m) => {
  if (m.type() === "error") errors.push(`[console] ${m.text()}`);
});
await desktop.goto(URL, { waitUntil: "networkidle" });
await desktop.waitForTimeout(1800);
await desktop.screenshot({ path: `${OUT}/desktop-hero.png` });

// 逐个区块截图（滚动到位后等动画播完）
for (const id of ["about", "stack", "projects", "journey", "contact"]) {
  await desktop.evaluate((sectionId) => document.getElementById(sectionId)?.scrollIntoView(), id);
  await desktop.waitForTimeout(1300);
  await desktop.screenshot({ path: `${OUT}/desktop-${id}.png` });
}

// 项目详情弹窗
await desktop.evaluate(() => document.getElementById("projects")?.scrollIntoView());
await desktop.waitForTimeout(500);
const dialogBtn = desktop.locator(".project__actions button").first();
await dialogBtn.click();
await desktop.waitForTimeout(900);
await desktop.screenshot({ path: `${OUT}/desktop-dialog.png` });

// ---------- 手机端 ----------
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
});
mobile.on("pageerror", (e) => errors.push(`[mobile pageerror] ${e.message}`));
await mobile.goto(URL, { waitUntil: "networkidle" });
await mobile.waitForTimeout(1600);
await mobile.screenshot({ path: `${OUT}/mobile-hero.png` });

for (const id of ["about", "projects", "contact"]) {
  await mobile.evaluate((sectionId) => document.getElementById(sectionId)?.scrollIntoView(), id);
  await mobile.waitForTimeout(1200);
  await mobile.screenshot({ path: `${OUT}/mobile-${id}.png` });
}

// 手机端抽屉导航
await mobile.evaluate(() => window.scrollTo(0, 0));
await mobile.waitForTimeout(400);
await mobile.locator(".header__menu").click();
await mobile.waitForTimeout(700);
await mobile.screenshot({ path: `${OUT}/mobile-drawer.png` });

await browser.close();

console.log("截图完成：", OUT);
console.log("运行时错误数量：", errors.length);
errors.forEach((e) => console.log("  ", e));
