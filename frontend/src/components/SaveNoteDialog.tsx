import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SaveNoteDialogProps {
  trigger: React.ReactNode;
  defaultTitle: string;
  onSave: (title: string) => Promise<void> | void;
}

export function SaveNoteDialog({ trigger, defaultTitle, onSave }: SaveNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setTitle(defaultTitle);
  }, [open, defaultTitle]);

  const handle_save = async () => {
    setSaving(true);
    try {
      await onSave(title.trim() || defaultTitle);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>保存笔记</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="笔记标题"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handle_save();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            取消
          </Button>
          <Button onClick={() => void handle_save()} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
