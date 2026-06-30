import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { Textarea } from "@/components/ui/textarea";
import { useNoteStore } from "@/stores/noteStore";

export function NotePage() {
  const navigate = useNavigate();
  const { markdown, setMarkdown, reset } = useNoteStore();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!markdown) navigate("/");
  }, [markdown, navigate]);

  if (!markdown) {
    return null;
  }

  const handle_download = () => {
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
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">笔记</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(!editing)}>
            {editing ? "预览" : "编辑"}
          </Button>
          <Button variant="outline" onClick={handle_download}>
            下载 .md
          </Button>
          <Button onClick={handle_new}>新建</Button>
        </div>
      </div>
      {editing ? (
        <Textarea
          className="min-h-[60vh] font-mono"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
      ) : (
        <MarkdownPreview markdown={markdown} />
      )}
    </div>
  );
}
