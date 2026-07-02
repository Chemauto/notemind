import type {
  GenerateMarkdownRequest,
  MarkdownResponse,
  Outline,
  OutlineRequest,
  PreprocessResult,
  WebFetchRequest,
} from "./types";

const API_BASE = "/api";

async function handle_error(response: Response): Promise<never> {
  const detail = await response.json().catch(() => ({ detail: response.statusText }));
  throw new Error(detail.detail ?? `HTTP ${response.status}`);
}

export async function generate_outline(request: OutlineRequest): Promise<Outline> {
  const response = await fetch(`${API_BASE}/outline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) await handle_error(response);
  return response.json() as Promise<Outline>;
}

export async function generate_markdown(request: GenerateMarkdownRequest): Promise<MarkdownResponse> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    body: form,
  });
  if (!response.ok) await handle_error(response);
  return response.json() as Promise<PreprocessResult>;
}

export async function preprocess_web(request: WebFetchRequest): Promise<PreprocessResult> {
  const response = await fetch(`${API_BASE}/preprocess/web`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) await handle_error(response);
  return response.json() as Promise<PreprocessResult>;
}
