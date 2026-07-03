# 🧠 NoteMind

> 把任意素材（文字 / 图片 / PDF / 网页 / 音频 / 视频）变成结构化笔记 + 思维导图。

基于智谱 **GLM-4.5V** 多模态大模型，本地部署、数据不出本机。

---

## ✨ 功能

- 📝 **多模态输入** — 文字、图片（≤20 张）、PDF、网页 URL、音频、视频
- 🎬 **视频转写** — ffmpeg 抽音轨 + faster-whisper ASR（支持 mp4/webm/mov，≤100MB）
- 📑 **可编辑大纲** — LLM 生成结构化 JSON，可增删改节点
- 🎨 **4 风格 × 3 详细度** — academic / exam / casual / meeting × minimal / standard / detailed
- 🔄 **重新生成** — 切换风格/详细度后一键重写 Markdown（带确认）
- 📊 **双视图笔记** — 左 Markdown 编辑器，右思维导图（markmap），双向联动
- 💾 **本地持久化** — IndexedDB 存多条笔记，刷新不丢
- 📤 **多格式导出** — Markdown (.md) · 思维导图 (.png) · 完整状态 (.json)

---

## 🚀 快速开始

### 一键 Docker（推荐）

```bash
# 1. 配置 API Key
cp backend/.env.example backend/.env
# 编辑 backend/.env，填入 ZHIPU_API_KEY

# 2. 启动
docker compose up --build
```

打开 http://localhost:5173 即可使用。

### 本地开发

**后端**（FastAPI + 智谱 GLM-4.5V）：

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate        # Windows (bash)
pip install -e ".[dev]"
cp .env.example .env            # 填入 ZHIPU_API_KEY
uvicorn app.main:app --reload
```

**前端**（React + Vite）：

```bash
cd frontend
npm install
npm run dev
```

打开 http://localhost:5173

> 💡 `ZHIPU_API_KEY` 在 [智谱开放平台](https://open.bigmodel.cn/) 注册获取。

---

## 🏗️ 技术栈

| 层 | 技术 |
|---|---|
| LLM | 智谱 [GLM-4.5V](https://open.bigmodel.cn/) 多模态 |
| 后端 | [FastAPI](https://fastapi.tiangolo.com/) · pydantic v2 · httpx |
| 文档解析 | [pdfplumber](https://github.com/jsvine/pdfplumber) · [trafilatura](https://github.com/adbar/trafilatura) |
| ASR | [faster-whisper](https://github.com/SYSTRAN/faster-whisper) (CTranslate2) |
| 音轨提取 | [imageio-ffmpeg](https://github.com/imageio/imageio-ffmpeg) |
| 前端 | [React 19](https://react.dev/) · [Vite](https://vitejs.dev/) · TypeScript |
| UI | [shadcn/ui](https://ui.shadcn.com/) · [Tailwind CSS](https://tailwindcss.com/) · [Radix UI](https://www.radix-ui.com/) |
| 状态 | [Zustand](https://github.com/pmndrs/zustand) · [TanStack Query](https://tanstack.com/query) |
| 思维导图 | [markmap](https://github.com/markmap/markmap) |
| 存储 | [idb-keyval](https://github.com/nicedoc/idb-keyval) (IndexedDB) |

---

## 🧪 测试

```bash
# 后端
cd backend && . .venv/Scripts/activate && pytest -v     # 76 passed

# 前端
cd frontend && npm test -- --run                         # 30 passed
```

---

## 📸 使用流程

1. **输入** → 选择任意输入方式（文字 / 图片 / PDF / 网页 / 音频 / 视频）
2. **预处理** → 后端把素材转成纯文本（ASR / PDF 解析 / 网页抓取）
3. **生成大纲** → GLM-4.5V 输出结构化 JSON，可编辑
4. **生成笔记** → 大纲按所选风格展开为 Markdown
5. **双视图查看 + 编辑** → 思维导图与 Markdown 同步
6. **保存 / 导出** → IndexedDB 持久化，或导出 .md / .png / .json

---

## 🙏 致谢

本项目站在以下开源项目的肩膀上：

- **[GLM-4.5V](https://github.com/zhipuai)** — 智谱开源的多模态大模型
- **[faster-whisper](https://github.com/SYSTRAN/faster-whisper)** — 高速 Whisper ASR
- **[markmap](https://github.com/markmap/markmap)** — Markdown → 思维导图
- **[shadcn/ui](https://ui.shadcn.com/)** — 优雅的 React UI 组件
- **[FastAPI](https://fastapi.tiangolo.com/)** — 现代化 Python Web 框架

完整依赖列表见 [`backend/pyproject.toml`](backend/pyproject.toml) 与 [`frontend/package.json`](frontend/package.json)。

---

## 📄 License

[MIT](LICENSE) © 2026 Chemauto
