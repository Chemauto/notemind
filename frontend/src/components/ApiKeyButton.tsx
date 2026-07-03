import { Button } from "@/components/ui/button";
import { get_api_key } from "@/lib/api-key";
import { useUiStore } from "@/stores/uiStore";

/** 浮在右上角的 API Key 设置按钮。已设置时显示绿点。 */
export function ApiKeyButton() {
  const open = useUiStore((s) => s.openApiKeyDialog);
  const hasKey = !!get_api_key();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="fixed top-3 right-3 z-40 h-8 gap-1.5 px-2 text-xs text-zinc-500"
      onClick={() => open()}
      title="设置 API Key"
    >
      <span className={`inline-block h-2 w-2 rounded-full ${hasKey ? "bg-green-500" : "bg-zinc-300"}`} />
      🔑 API Key
    </Button>
  );
}
