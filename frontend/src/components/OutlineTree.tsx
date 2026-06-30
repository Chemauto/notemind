import { OutlineNodeRow } from "./OutlineNodeRow";
import type { OutlineNode } from "@/lib/types";

interface TreeProps {
  nodes: OutlineNode[];
  onUpdate: (id: string, patch: Partial<OutlineNode>) => void;
  onAddChild: (parentId: string | null) => void;
  onDelete: (id: string) => void;
}

function find_and_update(nodes: OutlineNode[], id: string, patch: Partial<OutlineNode>): OutlineNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, ...patch };
    if (n.children.length) return { ...n, children: find_and_update(n.children, id, patch) };
    return n;
  });
}

function find_and_delete(nodes: OutlineNode[], id: string): OutlineNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, children: find_and_delete(n.children, id) }));
}

function add_child(nodes: OutlineNode[], parentId: string, new_node: OutlineNode): OutlineNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) {
      return { ...n, children: [...n.children, new_node] };
    }
    if (n.children.length) {
      return { ...n, children: add_child(n.children, parentId, new_node) };
    }
    return n;
  });
}

let counter = 100;
function new_id() {
  counter += 1;
  return `n${counter}`;
}

export function OutlineTree({ nodes, onUpdate, onAddChild, onDelete }: TreeProps) {
  return (
    <div className="space-y-1">
      {nodes.map((n) => (
        <OutlineNodeRow
          key={n.id}
          node={n}
          depth={0}
          onUpdate={onUpdate}
          onAddChild={onAddChild}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export const outline_helpers = { find_and_update, find_and_delete, add_child, new_id };
