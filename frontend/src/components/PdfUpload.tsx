import { useRef, useState } from "react";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { preprocess_pdf } from "@/lib/api";

interface PdfUploadProps {
  onExtracted: (text: string, fileName: string) => void;
  onError: (message: string) => void;
}

export function PdfUpload({ onExtracted, onError }: PdfUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const handle_change = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      onError("PDF 超过 50MB 上限");
      return;
    }
    setBusy(true);
    try {
      const result = await preprocess_pdf(file);
      onExtracted(result.text, file.name);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <FileText size={14} className="mr-1" />
        {busy ? "解析中..." : "上传 PDF"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handle_change}
      />
    </>
  );
}
