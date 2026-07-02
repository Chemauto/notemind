import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OutlineTree, outline_helpers } from "@/components/OutlineTree";
import { StyleDepthSelector } from "@/components/StyleDepthSelector";
import { generate_markdown } from "@/lib/api";
import { useNoteStore } from "@/stores/noteStore";
import type { Outline, OutlineNode } from "@/lib/types";

export function OutlinePage() {
  const navigate = useNavigate();
  const { outline, style, depth, setOutline, setMarkdown } = useNoteStore();

  const mutation = useMutation({
    mutationFn: () => {
      if (!outline) throw new Error("no outline");
      return generate_markdown({ outline, style, depth });
    },
    onSuccess: (res) => {
      setMarkdown(res.markdown);
      navigate("/note");
    },
  });

  useEffect(() => {
    if (!outline) navigate("/");
  }, [outline, navigate]);

  if (!outline) {
    return null;
  }

  const update_root = (patch: Partial<Outline>) => {
    setOutline({ ...outline, ...patch });
  };

  const update_node = (id: string, patch: Partial<OutlineNode>) => {
    setOutline({
      ...outline,
      outline: outline_helpers.find_and_update(outline.outline, id, patch),
    });
  };

  const add_child = (parentId: string | null) => {
    const node: OutlineNode = {
      id: outline_helpers.new_id(),
      title: "新节点",
      summary: "",
      key_points: [],
      tags: [],
      source_quote: "",
      children: [],
    };
    if (parentId === null) {
      setOutline({ ...outline, outline: [...outline.outline, node] });
    } else {
      setOutline({
        ...outline,
        outline: outline_helpers.add_child(outline.outline, parentId, node),
      });
    }
  };

  const delete_node = (id: string) => {
    setOutline({
      ...outline,
      outline: outline_helpers.find_and_delete(outline.outline, id),
    });
  };

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">大纲预览（可编辑）</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <StyleDepthSelector size="sm" />
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "生成笔记中..." : "生成笔记 →"}
          </Button>
        </div>
      </div>
      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <Label>主题</Label>
          <Input value={outline.title} onChange={(e) => update_root({ title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>概览</Label>
          <Textarea
            value={outline.summary}
            onChange={(e) => update_root({ summary: e.target.value })}
            className="min-h-[60px]"
          />
        </div>
      </div>
      <OutlineTree
        nodes={outline.outline}
        onUpdate={update_node}
        onAddChild={add_child}
        onDelete={delete_node}
      />
      <div className="mt-6">
        <Button variant="outline" onClick={() => add_child(null)}>
          + 添加一级节点
        </Button>
      </div>
      {mutation.isError && (
        <p className="text-red-500 mt-4 text-sm">
          出错了：{(mutation.error as Error).message}
        </p>
      )}
    </div>
  );
}
