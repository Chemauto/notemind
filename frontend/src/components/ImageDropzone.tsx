import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import {
  ACCEPTED_IMAGE_MIMES,
  fileToDataUrl,
  isAcceptedImage,
  MAX_IMAGES,
} from "@/lib/image_utils";

export interface StoredImage {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
}

interface ImageDropzoneProps {
  images: StoredImage[];
  onAdd: (newImages: StoredImage[]) => void;
  onRemove: (id: string) => void;
}

export function ImageDropzone({ images, onAdd, onRemove }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const all = Array.from(files);
    const accepted = all.filter((f) => isAcceptedImage(f.type));
    if (accepted.length === 0) {
      setError("没有可接受的图片类型（仅支持 PNG/JPEG/WebP）");
      return;
    }
    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setError(`最多 ${MAX_IMAGES} 张图片`);
      return;
    }
    const toRead = accepted.slice(0, remainingSlots);
    if (accepted.length > remainingSlots) {
      setError(`已达到 ${MAX_IMAGES} 张上限，仅添加前 ${remainingSlots} 张`);
    } else {
      setError(null);
    }
    try {
      const stored = await Promise.all(
        toRead.map(async (file, idx) => ({
          id: `${Date.now()}-${idx}-${file.name}`,
          name: file.name,
          dataUrl: await fileToDataUrl(file),
          size: file.size,
        })),
      );
      onAdd(stored);
    } catch {
      setError("读取文件失败");
    }
  };

  const handle_drop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFiles(event.dataTransfer.files);
  };

  const handle_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    void handleFiles(event.target.files);
    event.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handle_drop}
        className={
          "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors " +
          (dragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
            : "border-zinc-300 dark:border-zinc-700 hover:border-brand-400")
        }
      >
        <ImagePlus className="mx-auto mb-2 text-zinc-400" size={28} />
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          拖拽图片到此处，或点击选择（最多 {MAX_IMAGES} 张）
        </p>
        <p className="text-xs text-zinc-400 mt-1">支持 PNG / JPEG / WebP</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_MIMES.join(",")}
          multiple
          className="hidden"
          onChange={handle_change}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group aspect-square rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700"
            >
              <img
                src={img.dataUrl}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                aria-label="删除图片"
                onClick={() => onRemove(img.id)}
                className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
              <span className="absolute bottom-0 left-0 right-0 text-[10px] text-white bg-black/60 truncate px-1">
                {img.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
