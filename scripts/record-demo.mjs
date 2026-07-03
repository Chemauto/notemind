/**
 * NoteMind demo recorder
 *
 * 启动 Chromium → 输入示例文字 → 生成大纲 → 生成笔记 → 思维导图渲染
 * 然后用 ffmpeg 转 GIF（双通道 palette 算法，体积小、画质好）。
 *
 * 前置条件：
 *   1. backend 已启动 (uvicorn app.main:app --reload)
 *   2. frontend 已启动 (npm run dev)
 *   3. backend/.env 已配好 ZHIPU_API_KEY
 *
 * 用法：
 *   cd scripts
 *   npm install
 *   npm run record
 */

import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";
const OUTPUT_DIR = join(__dirname, "output");
const TEMP_VIDEO = join(OUTPUT_DIR, "demo.webm");
const PALETTE_PNG = join(OUTPUT_DIR, "palette.png");
const FINAL_GIF = join(ROOT, "frontend", "public", "demo.gif");

const SAMPLE_INPUT = `今天讲光合作用。

光合作用是植物利用光能将二氧化碳和水转化为有机物（葡萄糖）并释放氧气的过程。

总反应式：6CO2 + 6H2O + 光能 → C6H12O6 + 6O2

分为两个阶段：
1. 光反应（在类囊体膜进行）
   - 水的光解：H2O → 2H+ + 1/2O2 + 电子
   - ATP 和 NADPH 的生成
2. 暗反应（在叶绿体基质进行）
   - CO2 固定（卡尔文循环）
   - C3 化合物还原
   - RuBP 再生

影响光合作用速率的因素：
- 光照强度（在一定范围内正相关）
- CO2 浓度
- 温度（最适 25-35℃）
- 水分供应
- 矿质元素（氮、镁、铁等）`;

async function waitForFrontend(url, timeoutMs = 30000) {
  const start = Date.now();
  process.stdout.write(`▶ 等待前端 ${url} ...`);
  while (Date.now() - start < timeoutMs) {
    try {
      const resp = await fetch(url);
      if (resp.ok) {
        console.log(" ✓");
        return;
      }
    } catch {
      // ignore
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.log(" ✗");
  throw new Error(
    `前端不可达：${url}\n请先启动：\n  1. cd backend && uvicorn app.main:app --reload\n  2. cd frontend && npm run dev`,
  );
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  await waitForFrontend(FRONTEND_URL);

  console.log("▶ 启动 Chromium（headful，可观察）");
  const browser = await chromium.launch({ head: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1280, height: 800 },
    },
    viewport: { width: 1280, height: 800 },
    locale: "zh-CN",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(120000); // LLM 调用可能慢，2 分钟超时

  // vite preview 不读 dev server.proxy 配置，手动把 /api/* 转发到后端
  await page.route("http://localhost:5173/api/**", (route) => {
    const url = route.request().url();
    const newPath = url.replace("http://localhost:5173", "http://localhost:8000");
    console.log(`  [proxy] ${url} → ${newPath}`);
    route.continue({ url: newPath });
  });

  try {
    console.log("▶ 打开输入页");
    await page.goto(FRONTEND_URL, { waitUntil: "load" });
    await page.waitForTimeout(1500); // 让 React mount

    console.log("▶ 填入示例文字（光合作用）");
    await page.waitForSelector("textarea", { state: "visible", timeout: 30000 });
    await page.fill("textarea", SAMPLE_INPUT);
    await page.waitForTimeout(800);

    console.log("▶ 点击「开始生成」");
    const outlineBtn = page.locator('button:has-text("开始生成")').first();
    await outlineBtn.click();

    console.log("▶ 等待进入大纲页...");
    await page.waitForURL("**/outline", { timeout: 120000 });
    await page.waitForTimeout(2000); // 让大纲渲染稳定

    console.log("▶ 点击「生成笔记」");
    const noteBtn = page.locator('button:has-text("生成笔记")').first();
    await noteBtn.click();

    console.log("▶ 等待进入笔记页...");
    await page.waitForURL("**/note", { timeout: 120000 });
    console.log("▶ 等待思维导图渲染");
    await page.waitForTimeout(6000);

    console.log("▶ 录制完成，关闭浏览器");
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();

    if (video) {
      const rawPath = await video.path();
      copyFileSync(rawPath, TEMP_VIDEO);
      console.log(`▶ 视频已保存：${TEMP_VIDEO}`);
    }
  }

  console.log("▶ 生成 GIF（4x 加速 + 双通道 palette，目标 < 3MB）");
  // 通道 1：生成 palette（加速 4 倍）
  execFileSync(
    ffmpegPath,
    [
      "-y",
      "-i",
      TEMP_VIDEO,
      "-vf",
      "setpts=0.25*PTS,fps=10,scale=720:-1:flags=lanczos,palettegen=stats_mode=diff",
      "-frames:v", "1",
      "-update", "1",
      PALETTE_PNG,
    ],
    { stdio: "inherit" },
  );
  // 通道 2：应用 palette（同步加速）
  execFileSync(
    ffmpegPath,
    [
      "-y",
      "-i",
      TEMP_VIDEO,
      "-i",
      PALETTE_PNG,
      "-filter_complex",
      "setpts=0.25*PTS,fps=10,scale=720:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5",
      FINAL_GIF,
    ],
    { stdio: "inherit" },
  );

  console.log(`\n✅ GIF 生成成功：${FINAL_GIF}`);
  console.log(`   可在 README 中引用：![demo](frontend/public/demo.gif)`);
}

main().catch((err) => {
  console.error("\n❌ 录制失败:", err.message);
  process.exit(1);
});
