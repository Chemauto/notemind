import { Textarea } from "@/components/ui/textarea";
import { DEPTH_OPTIONS, STYLE_OPTIONS } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface InputPanelProps {
  text: string;
  style: string;
  depth: string;
  onTextChange: (text: string) => void;
  onStyleChange: (style: "academic" | "exam" | "casual" | "meeting") => void;
  onDepthChange: (depth: "minimal" | "standard" | "detailed") => void;
}

export function InputPanel({
  text, style, depth, onTextChange, onStyleChange, onDepthChange,
}: InputPanelProps) {
  return (
    <div className="w-full max-w-2xl space-y-4">
      <Textarea
        placeholder="把要做成笔记的文字贴在这里..."
        className="min-h-[200px]"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>风格预设</Label>
          <Select value={style} onValueChange={(v) => onStyleChange(v as InputPanelProps["style"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STYLE_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label} - {s.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>详细度</Label>
          <Select value={depth} onValueChange={(v) => onDepthChange(v as InputPanelProps["depth"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DEPTH_OPTIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
