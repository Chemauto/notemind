# NoteMind

把任意素材（文字、图片、视频、PDF、网页、音频）变成结构化笔记 + 思维导图。

> **当前版本：MVP**，仅支持文字输入 → 大纲 → Markdown 笔记。
> 思维导图、多媒体输入、持久化在后续 plan 中实现。

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

## 项目结构

详见 `../docs/superpowers/specs/2026-06-29-notemind-design.md`

## 技术栈

- 后端：FastAPI + zhipuai + pydantic
- 前端：React + Vite + TypeScript + Tailwind + shadcn/ui
- LLM：智谱 GLM-4.5V
