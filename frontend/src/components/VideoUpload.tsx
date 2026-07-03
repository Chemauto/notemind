import { useRef, useState } from "react";
import { Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { preprocess_video } from "@/lib/api";

interface VideoUploadProps {
  onExtracted: (text: string, fileName: string) => void;
  onError: (message: string) => void;
}

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
];

export function VideoUpload({ onExtracted, onError }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const handle_change = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) {
      onError("视频超过 100MB 上限");
      return;
    }
    setBusy(true);
    try {
      const result = await preprocess_video(file);
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
        <Video size={14} className="mr-1" />
        {busy ? "视频处理中..." : "上传视频"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_VIDEO_TYPES.join(",") + ",.mp4,.webm,.mov,.avi,.mkv,video/*"}
        className="hidden"
        onChange={handle_change}
      />
    </>
  );
}
