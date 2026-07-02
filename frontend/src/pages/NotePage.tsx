import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Save, FileJson } from "lucide-react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DualPane } from "@/components/DualPane";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { ExportMindmapButton } from "@/components/ExportMindmapButton";
import { MindmapView } from "@/components/MindmapView";
import { SaveNoteDialog } from "@/components/SaveNoteDialog";
import { StyleDepthSelector } from "@/components/StyleDepthSelector";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { generate_markdown } from "@/lib/api";
import { generate_id, save_note } from "@/lib/notes_db";
import { findHeaderLine, parseHeaders } from "@/lib/outline_parser";
import type { SavedNote } from "@/lib/types";
import { useNoteStore } from "@/stores/noteStore";

export function NotePage() {
  const navigate = useNavigate();
  const { markdown, outline, style, depth, inputText, setMarkdown, reset } = useNoteStore();
  const [editing, setEditing] = useState(true);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [scrollToLine, setScrollToLine] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mindmapSvgRef = useRef<SVGSVGElement>(null);

  const regenerate_mutation = useMutation({
    mutationFn: () => {
      if (!outline) throw new Error("大纲丢失，无法重新生成");
      return generate_markdown({ outline, style, depth });
    },
    onSuccess: (res) => {
      setMarkdown(res.markdown);
    },
  });

  const debouncedMarkdown = useDebouncedValue(markdown, 300);
  const headers = useMemo(() => parseHeaders(markdown), [markdown]);

  useEffect(() => {
    if (!markdown) navigate("/");
  }, [markdown, navigate]);

  useEffect(() => {
    if (scrollToLine === null || !textareaRef.current) return;
    const ta = textareaRef.current;
    const lines = ta.value.split(/\r?\n/).slice(0, scrollToLine);
    const offset = lines.reduce((acc, l) => acc + l.length + 1, 0);
    ta.focus();
    ta.setSelectionRange(offset, offset);
    ta.scrollTop = (scrollToLine / Math.max(1, ta.value.split(/\r?\n/).length)) * ta.scrollHeight;
    setScrollToLine(null);
  }, [scrollToLine]);

  if (!markdown) {
    return null;
  }

  const handle_node_click = (header: { title: string } | null) => {
    if (!header) return;
    const line = findHeaderLine(headers, header.title);
    if (line >= 0) {
      setEditing(true);
      setScrollToLine(line);
    }
  };

  const handle_download_md = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "note.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handle_new = () => {
    reset();
    setNoteId(null);
    navigate("/");
  };

  const handle_save = async (title: string) => {
    const now = Date.now();
    const id = noteId ?? (await generate_id());
    const record: SavedNote = {
      id,
      title,
      markdown,
      outline,
      style,
      depth,
      inputText,
      createdAt: now,
      updatedAt: now,
    };
    await save_note(record);
    setNoteId(id);
  };

  const handle_export_json = () => {
    const payload = {
      title: outline?.title ?? "note",
      markdown,
      outline,
      style,
      depth,
      inputText,
      exportedAt: new Date().toISOString(),
      appVersion: "0.1.0",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${payload.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">笔记</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <StyleDepthSelector size="sm" />
          <ConfirmDialog
            title="重新生成笔记？"
            description="将根据当前大纲和风格重新生成，会覆盖现有笔记（包括你的编辑）。"
            confirmText="重新生成"
            onConfirm={() => regenerate_mutation.mutate()}
            disabled={!outline || regenerate_mutation.isPending}
            trigger={
              <Button variant="outline" disabled={!outline || regenerate_mutation.isPending}>
                {regenerate_mutation.isPending ? "生成中..." : "重新生成"}
              </Button>
            }
          />
          <Button variant="outline" onClick={() => setEditing(!editing)}>
            {editing ? "预览" : "编辑"}
          </Button>
          <Button variant="outline" onClick={handle_download_md}>
            下载 .md
          </Button>
          <SaveNoteDialog
            trigger={
              <Button variant="outline">
                <Save size={14} className="mr-1" />
                保存
              </Button>
            }
            defaultTitle={outline?.title ?? "未命名笔记"}
            onSave={handle_save}
          />
          <Button variant="outline" onClick={handle_export_json}>
            <FileJson size={14} className="mr-1" />
            导出 .json
          </Button>
          <ExportMindmapButton svgRef={mindmapSvgRef} />
          <Button onClick={handle_new}>新建</Button>
          <Button variant="outline" onClick={() => navigate("/notes")}>
            我的笔记
          </Button>
        </div>
      </div>
      {regenerate_mutation.isError && (
        <p className="text-red-500 mb-4 text-sm">
          重新生成失败：{(regenerate_mutation.error as Error).message}
        </p>
      )}
      <DualPane
        left={
          editing ? (
            <MarkdownEditor
              ref={textareaRef}
              markdown={markdown}
              onChange={setMarkdown}
            />
          ) : (
            <MarkdownPreview markdown={markdown} />
          )
        }
        right={<MindmapView ref={mindmapSvgRef} markdown={debouncedMarkdown} onNodeClick={handle_node_click} />}
      />
      <p className="text-xs text-zinc-500 mt-2">
        编辑左侧 → 右侧导图自动更新（300ms 防抖）· 点击导图节点 → 左侧滚动到对应标题
      </p>
    </div>
  );
}
