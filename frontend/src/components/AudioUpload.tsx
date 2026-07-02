import { useRef, useState } from "react";
import { Music } from "lucide-react";

import { Button } from "@/components/ui/button";
import { preprocess_audio } from "@/lib/api";

interface AudioUploadProps {
  onExtracted: (text: string, fileName: string) => void;
  onError: (message: string) => void;
}

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const ACCEPTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/m4a",
  "audio/x-m4a",
  "audio/webm",
  "audio/ogg",
  "audio/flac",
];

export function AudioUpload({ onExtracted, onError }: AudioUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const handle_change = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_AUDIO_BYTES) {
      onError("音频超过 25MB 上限");
      return;
    }
    setBusy(true);
    try {
      const result = await preprocess_audio(file);
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
        <Music size={14} className="mr-1" />
        {busy ? "转写中..." : "上传音频"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_AUDIO_TYPES.join(",")}
        className="hidden"
        onChange={handle_change}
      />
    </>
  );
}
