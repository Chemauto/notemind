# NoteMind

把任意素材（文字、图片、视频、PDF、网页、音频）变成结构化笔记 + 思维导图。

> **当前版本：Plan 4c (视频输入)**，支持文字 + 图片 + PDF + 网页 + 音频 + 视频 → 大纲 → 双视图笔记。
> 视频通过 ffmpeg 提取音轨，复用 faster-whisper ASR。

## 快速开始

### 一键 Docker（推荐）

```bash
# 1. 配置后端环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env，填入 ZHIPU_API_KEY

# 2. 启动
docker compose up --build
```

打开 http://localhost:5173 即可使用。

### 本地开发

后端：

```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate     # Windows bash
pip install -e ".[dev]"
cp .env.example .env         # 填入 ZHIPU_API_KEY
uvicorn app.main:app --reload
```

前端：

```bash
cd frontend
npm install
npm run dev
```

打开 http://localhost:5173

## 测试

```bash
cd backend
. .venv/Scripts/activate
pytest -v
```

## 功能

- 文字 + 图片 + PDF + 网页 + 音频 → GLM-4.5V 生成结构化大纲 JSON
  - 图片：1-20 张 PNG/JPEG/WebP，多模态直接理解
  - PDF：pdfplumber 提取文字（≤50MB）
  - 网页：trafilatura 抓取正文（输入 URL）
  - 音频：faster-whisper small 模型转写（≤25MB，mp3/wav/m4a/webm/flac）
    - 首次使用会下载 ~488MB 模型，之后缓存复用
- 视频输入：上传 mp4/webm/mov（≤100MB），自动抽音轨 + 转写
- 大纲可编辑（增删改节点）
- 4 种风格 × 3 档详细度可调
- 双视图笔记：左 Markdown 编辑器，右思维导图（markmap）
  - 编辑 Markdown → 思维导图自动重渲染（300ms 防抖）
  - 点击思维导图节点 → Markdown 滚动到对应标题
- 风格/详细度切换：大纲预览和笔记页都能改 style/depth；笔记页加「重新生成」按钮（带确认）
- 本地持久化：笔记页「保存」按钮写入 IndexedDB；「我的笔记」页（/notes）可列表/打开/删除
- 导出：Markdown (.md) · 思维导图 (.png) · 完整状态 (.json)

## 项目结构

详见 `../docs/superpowers/specs/2026-06-29-notemind-design.md`

## 技术栈

- 后端：FastAPI + zhipuai + pydantic
- 前端：React + Vite + TypeScript + Tailwind + shadcn/ui
- LLM：智谱 GLM-4.5V
