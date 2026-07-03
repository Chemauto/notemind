import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { InputPanel } from "@/components/InputPanel";
import { generate_outline } from "@/lib/api";
import { useNoteStore } from "@/stores/noteStore";

export function InputPage() {
  const navigate = useNavigate();
  const {
    inputText,
    images,
    style,
    depth,
    setInputText,
    addImages,
    removeImage,
    setStyle,
    setDepth,
    setOutline,
  } = useNoteStore();
  const [preprocessError, setPreprocessError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      generate_outline({
        text: inputText,
        images: images.map((img) => img.dataUrl),
      }),
    onSuccess: (outline) => {
      setOutline(outline);
      setStyle(outline.suggested_style);
      setDepth(outline.suggested_depth);
      navigate("/outline");
    },
  });

  const hasInput = inputText.trim().length > 0 || images.length > 0;

  const handle_pdf = (text: string, fileName: string) => {
    const prefix = inputText.trim() ? `${inputText.trim()}\n\n` : "";
    setInputText(`${prefix}# 来源：${fileName}\n\n${text}`);
    setPreprocessError(null);
  };

  const handle_web = (text: string, url: string) => {
    const prefix = inputText.trim() ? `${inputText.trim()}\n\n` : "";
    setInputText(`${prefix}# 来源：${url}\n\n${text}`);
    setPreprocessError(null);
  };

  const handle_audio = (text: string, fileName: string) => {
    const prefix = inputText.trim() ? `${inputText.trim()}\n\n` : "";
    setInputText(`${prefix}# 来源：${fileName}\n\n${text}`);
    setPreprocessError(null);
  };

  const handle_video = (text: string, fileName: string) => {
    const prefix = inputText.trim() ? `${inputText.trim()}\n\n` : "";
    setInputText(`${prefix}# 来源：${fileName}\n\n${text}`);
    setPreprocessError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <h1 className="text-4xl font-semibold text-brand-600 mb-2">NoteMind</h1>
      <p className="text-zinc-500 mb-8">把任意素材，变成结构化笔记</p>
      <InputPanel
        text={inputText}
        images={images}
        style={style}
        depth={depth}
        onTextChange={setInputText}
        onAddImages={addImages}
        onRemoveImage={removeImage}
        onPdfExtracted={handle_pdf}
        onWebExtracted={handle_web}
        onAudioExtracted={handle_audio}
        onVideoExtracted={handle_video}
        onError={setPreprocessError}
        onStyleChange={setStyle}
        onDepthChange={setDepth}
      />
      <Button
        className="mt-6"
        size="lg"
        disabled={!hasInput || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? "生成中..." : "开始生成"}
      </Button>
      {preprocessError && (
        <p className="text-red-500 mt-2 text-sm">预处理失败：{preprocessError}</p>
      )}
      {mutation.isError && (
        <p className="text-red-500 mt-2 text-sm">
          生成出错了：{(mutation.error as Error).message}
        </p>
      )}
    </div>
  );
}
