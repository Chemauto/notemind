import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { delete_note, list_notes } from "@/lib/notes_db";
import { useNoteStore } from "@/stores/noteStore";
import type { SavedNote } from "@/lib/types";

export function NotesListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setOutline, setMarkdown, setInputText, setStyle, setDepth, setNoteId } =
    useNoteStore();

  const query = useQuery({
    queryKey: ["notes"],
    queryFn: list_notes,
  });

  const delete_mutation = useMutation({
    mutationFn: (id: string) => delete_note(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const handle_open = (note: SavedNote) => {
    setOutline(note.outline);
    setMarkdown(note.markdown);
    setInputText(note.inputText);
    setStyle(note.style);
    setDepth(note.depth);
    setNoteId(note.id);
    navigate("/note");
  };

  if (query.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        加载中...
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">我的笔记</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          新建笔记
        </Button>
      </div>

      {query.data && query.data.length === 0 ? (
        <p className="text-zinc-500 mt-8">
          还没有保存的笔记。生成一份笔记后在笔记页点「保存」。
        </p>
      ) : (
        <ul className="space-y-3">
          {query.data?.map((note) => (
            <li
              key={note.id}
              className="border border-zinc-200 rounded-md p-4 flex items-start justify-between gap-4 hover:border-zinc-300"
            >
              <button
                type="button"
                onClick={() => handle_open(note)}
                className="flex-1 text-left"
              >
                <div className="font-medium">{note.title}</div>
                <div className="text-xs text-zinc-500 mt-1">
                  {new Date(note.updatedAt).toLocaleString()} · {note.style}/
                  {note.depth}
                </div>
                <div className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {note.markdown
                    .split("\n")
                    .filter(Boolean)
                    .slice(0, 2)
                    .join(" · ")}
                </div>
              </button>
              <ConfirmDialog
                title="删除笔记？"
                description="删除后不可恢复。"
                confirmText="删除"
                onConfirm={() => delete_mutation.mutate(note.id)}
                trigger={
                  <Button variant="outline" size="sm">
                    删除
                  </Button>
                }
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← 返回
        </Button>
      </div>
    </div>
  );
}
