import type {
  GenerateMarkdownRequest,
  MarkdownResponse,
  Outline,
  OutlineRequest,
  PreprocessResult,
  WebFetchRequest,
} from "./types";
import { get_api_key } from "./api-key";

/**
 * API 基址。
 * - 本地开发：相对路径 `/api`（vite proxy 转给后端）
 * - 生产部署：通过 `VITE_BACKEND_URL` 环境变量指向 Render/Railway 等后端
 */
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const API_BASE = `${BACKEND_URL}/api`;

/** 缺少 API key 或后端拒绝调用时抛出，前端据此弹出 key 录入对话框。 */
export class MissingApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingApiKeyError";
  }
}

function auth_headers(): Record<string, string> {
  const key = get_api_key();
  return key ? { "X-Zhipu-Api-Key": key } : {};
}

async function handle_error(response: Response): Promise<never> {
  const detail = await response.json().catch(() => ({ detail: response.statusText }));
  const message = detail.detail ?? `HTTP ${response.status}`;
  // 后端 key 缺失或无效时，统一抛 MissingApiKeyError 触发录入对话框
  if (response.status === 401 || response.status === 403) {
    throw new MissingApiKeyError(message);
  }
  if (/api[-_ ]?key|missing.*key|缺少.*api/i.test(message)) {
    throw new MissingApiKeyError(message);
  }
  throw new Error(message);
}

export async function generate_outline(request: OutlineRequest): Promise<Outline> {
  const response = await fetch(`${API_BASE}/outline`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth_headers() },
    body: JSON.stringify(request),
  });
  if (!response.ok) await handle_error(response);
  return response.json() as Promise<Outline>;
}

export async function generate_markdown(request: GenerateMarkdownRequest): Promise<MarkdownResponse> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth_headers() },
    body: JSON.stringify(request),
  });
  if (!response.ok) await handle_error(response);
  return response.json() as Promise<MarkdownResponse>;
}

export async function preprocess_pdf(file: File): Promise<PreprocessResult> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_BASE}/preprocess/pdf`, {
    method: "POST",
    headers: auth_headers(),
    body: form,
  });
  if (!response.ok) await handle_error(response);
  return response.json() as Promise<PreprocessResult>;
}

export async function preprocess_web(request: WebFetchRequest): Promise<PreprocessResult> {
  const response = await fetch(`${API_BASE}/preprocess/web`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth_headers() },
    body: JSON.stringify(request),
  });
  if (!response.ok) await handle_error(response);
  return response.json() as Promise<PreprocessResult>;
}

export async function preprocess_audio(file: File): Promise<PreprocessResult> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_BASE}/preprocess/audio`, {
    method: "POST",
    headers: auth_headers(),
    body: form,
  });
  if (!response.ok) await handle_error(response);
  return response.json() as Promise<PreprocessResult>;
}

export async function preprocess_video(file: File): Promise<PreprocessResult> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_BASE}/preprocess/video`, {
    method: "POST",
    headers: auth_headers(),
    body: form,
  });
  if (!response.ok) await handle_error(response);
  return response.json() as Promise<PreprocessResult>;
}
