/**
 * 用户在前端填写的智谱 API key，存 localStorage。
 *
 * 部署模式下用户用自己的 key（通过 X-Zhipu-Api-Key header 传给后端）。
 * 本地开发模式如果后端 .env 已经配了 key，前端可以不填。
 */

const STORAGE_KEY = "notemind:api_key";

export function get_api_key(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function set_api_key(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } catch {
    // localStorage 不可用（隐私模式等），忽略
  }
}

export function clear_api_key(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function has_api_key(): boolean {
  return !!get_api_key();
}
