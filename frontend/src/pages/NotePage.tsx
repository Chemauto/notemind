import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DualPane } from "@/components/DualPane";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { ExportMindmapButton } from "@/components/ExportMindmapButton";
import { MindmapView } from "@/components/MindmapView";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { findHeaderLine, parseHeaders } from "@/lib/outline_parser";
import { useNoteStore } from "@/stores/noteStore";

export function NotePage() {
  const navigate = useNavigate();
  const { markdown, setMarkdown, reset } = useNoteStore();
  const [editing, setEditing] = useState(true);
  const [scrollToLine, setScrollToLine] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mindmapSvgRef = useRef<SVGSVGElement>(null);

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
    navigate("/");
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">笔记</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setEditing(!editing)}>
            {editing ? "预览" : "编辑"}
          </Button>
          <Button variant="outline" onClick={handle_download_md}>
            下载 .md
          </Button>
          <ExportMindmapButton svgRef={mindmapSvgRef} />
          <Button onClick={handle_new}>新建</Button>
        </div>
      </div>
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
