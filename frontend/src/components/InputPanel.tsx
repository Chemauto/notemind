import { ImageDropzone, type StoredImage } from "@/components/ImageDropzone";
import { PdfUpload } from "@/components/PdfUpload";
import { WebFetch } from "@/components/WebFetch";
import { AudioUpload } from "@/components/AudioUpload";
import { Textarea } from "@/components/ui/textarea";
import { DEPTH_OPTIONS, STYLE_OPTIONS } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface InputPanelProps {
  text: string;
  images: StoredImage[];
  style: string;
  depth: string;
  onTextChange: (text: string) => void;
  onAddImages: (newImages: StoredImage[]) => void;
  onRemoveImage: (id: string) => void;
  onPdfExtracted: (text: string, fileName: string) => void;
  onWebExtracted: (text: string, url: string) => void;
  onAudioExtracted: (text: string, fileName: string) => void;
  onError: (message: string) => void;
  onStyleChange: (style: "academic" | "exam" | "casual" | "meeting") => void;
  onDepthChange: (depth: "minimal" | "standard" | "detailed") => void;
}

export function InputPanel({
  text,
  images,
  style,
  depth,
  onTextChange,
  onAddImages,
  onRemoveImage,
  onPdfExtracted,
  onWebExtracted,
  onAudioExtracted,
  onError,
  onStyleChange,
  onDepthChange,
}: InputPanelProps) {
  return (
    <div className="w-full max-w-2xl space-y-4">
      <Textarea
        placeholder="把要做成笔记的文字贴到这里，或上传 PDF / 网页 / 音频..."
        className="min-h-[200px]"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <PdfUpload onExtracted={onPdfExtracted} onError={onError} />
        <span className="text-xs text-zinc-400">或</span>
        <WebFetch onExtracted={onWebExtracted} onError={onError} />
        <span className="text-xs text-zinc-400">或</span>
        <AudioUpload onExtracted={onAudioExtracted} onError={onError} />
      </div>
      <ImageDropzone
        images={images}
        onAdd={onAddImages}
        onRemove={onRemoveImage}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>风格预设</Label>
          <Select value={style} onValueChange={(v) => onStyleChange(v as "academic" | "exam" | "casual" | "meeting")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STYLE_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label} - {s.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>详细度</Label>
          <Select value={depth} onValueChange={(v) => onDepthChange(v as "minimal" | "standard" | "detailed")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DEPTH_OPTIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
