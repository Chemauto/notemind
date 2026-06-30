import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { OutlineNode } from "@/lib/types";

interface RowProps {
  node: OutlineNode;
  depth: number;
  onUpdate: (id: string, patch: Partial<OutlineNode>) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
}

export function OutlineNodeRow({ node, depth, onUpdate, onAddChild, onDelete }: RowProps) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-1">
      <div
        className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded px-2 py-1"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-zinc-400 hover:text-zinc-700"
        >
          {node.children.length > 0 ? (
            expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : (
            <span className="w-4" />
          )}
        </button>
        {editing ? (
          <Input
            autoFocus
            value={node.title}
            onChange={(e) => onUpdate(node.id, { title: e.target.value })}
            onBlur={() => setEditing(false)}
            className="h-7 flex-1"
          />
        ) : (
          <span
            className="flex-1 cursor-text text-sm"
            onClick={() => setEditing(true)}
          >
            {node.title}
          </span>
        )}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAddChild(node.id)}>
          <Plus size={14} />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDelete(node.id)}>
          <Trash2 size={14} />
        </Button>
      </div>
      {expanded && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <OutlineNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
