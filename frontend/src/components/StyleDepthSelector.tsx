import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DEPTH_OPTIONS, STYLE_OPTIONS } from "@/lib/types";
import { useNoteStore } from "@/stores/noteStore";

interface StyleDepthSelectorProps {
  size?: "sm" | "md";
  className?: string;
}

export function StyleDepthSelector({
  size = "md",
  className,
}: StyleDepthSelectorProps) {
  const { style, depth, setStyle, setDepth } = useNoteStore();
  const triggerClass = size === "sm" ? "h-8 text-sm" : undefined;

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <div className="space-y-1">
        <Label className="text-xs text-zinc-500">风格</Label>
        <Select
          value={style}
          onValueChange={(v) => setStyle(v as typeof style)}
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STYLE_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-zinc-500">详细度</Label>
        <Select
          value={depth}
          onValueChange={(v) => setDepth(v as typeof depth)}
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEPTH_OPTIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
