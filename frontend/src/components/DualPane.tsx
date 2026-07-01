import { Group, Panel, Separator } from "react-resizable-panels";
import type { ReactNode } from "react";

interface DualPaneProps {
  left: ReactNode;
  right: ReactNode;
  leftMin?: number;
  rightMin?: number;
}

export function DualPane({ left, right, leftMin = 30, rightMin = 30 }: DualPaneProps) {
  return (
    <div className="h-[calc(100vh-12rem)] w-full">
      <Group orientation="horizontal" className="hidden md:flex h-full">
        <Panel defaultSize={50} minSize={leftMin}>
          <div className="h-full overflow-auto border-r border-zinc-200 dark:border-zinc-800 pr-2">
            {left}
          </div>
        </Panel>
        <Separator className="w-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-brand-500 transition-colors" />
        <Panel defaultSize={50} minSize={rightMin}>
          <div className="h-full overflow-auto pl-2">{right}</div>
        </Panel>
      </Group>
      <div className="md:hidden space-y-4">
        <div className="border border-zinc-200 dark:border-zinc-800 p-2 max-h-[50vh] overflow-auto">
          {left}
        </div>
        <div className="border border-zinc-200 dark:border-zinc-800 p-2 max-h-[50vh] overflow-auto">
          {right}
        </div>
      </div>
    </div>
  );
}
