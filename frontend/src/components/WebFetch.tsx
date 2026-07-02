import { useState } from "react";
import { Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { preprocess_web } from "@/lib/api";

interface WebFetchProps {
  onExtracted: (text: string, url: string) => void;
  onError: (message: string) => void;
}

export function WebFetch({ onExtracted, onError }: WebFetchProps) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const handle_click = async () => {
    if (!url.trim()) return;
    setBusy(true);
    try {
      const result = await preprocess_web({ url: url.trim() });
      onExtracted(result.text, url.trim());
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Globe size={14} className="text-zinc-400" />
      <Input
        type="url"
        placeholder="https://example.com/article"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="h-8 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void handle_click();
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy || !url.trim()}
        onClick={() => void handle_click()}
      >
        {busy ? "抓取中..." : "抓取"}
      </Button>
    </div>
  );
}
