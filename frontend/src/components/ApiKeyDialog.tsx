import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clear_api_key, get_api_key, set_api_key } from "@/lib/api-key";
import { useUiStore } from "@/stores/uiStore";

export function ApiKeyDialog() {
  const { apiKeyDialogOpen, apiKeyDialogReason, closeApiKeyDialog } = useUiStore();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (apiKeyDialogOpen) {
      setValue(get_api_key() ?? "");
    }
  }, [apiKeyDialogOpen]);

  const handle_save = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    set_api_key(trimmed);
    closeApiKeyDialog();
  };

  const handle_clear = () => {
    clear_api_key();
    setValue("");
    closeApiKeyDialog();
  };

  return (
    <Dialog
      open={apiKeyDialogOpen}
      onOpenChange={(open) => {
        if (!open) closeApiKeyDialog();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🔑 设置智谱 API Key</DialogTitle>
          <DialogDescription>
            {apiKeyDialogReason ??
              "本地未配置 API Key，请填入你自己的智谱开放平台 API Key。Key 只保存在浏览器 localStorage，不会上传。"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="api-key-input">API Key</Label>
          <Input
            id="api-key-input"
            type="password"
            placeholder="xxxxxxxx.xxxxxxxx"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim()) handle_save();
            }}
            autoFocus
          />
          <p className="text-xs text-zinc-500">
            没有账号？{" "}
            <a
              href="https://open.bigmodel.cn/usercenter/apikeys"
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 hover:underline"
            >
              注册智谱开放平台 →
            </a>{" "}
            新用户送免费额度。
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          {get_api_key() && (
            <Button variant="ghost" onClick={handle_clear}>
              清除保存的 Key
            </Button>
          )}
          <Button variant="outline" onClick={closeApiKeyDialog}>
            取消
          </Button>
          <Button onClick={handle_save} disabled={!value.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
