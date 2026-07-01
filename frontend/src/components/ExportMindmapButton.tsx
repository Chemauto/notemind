import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { exportSvgAsPng } from "@/lib/markmap_export";

interface ExportMindmapButtonProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  filename?: string;
}

export function ExportMindmapButton({ svgRef, filename = "mindmap.png" }: ExportMindmapButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle_click = async () => {
    const svg = svgRef.current;
    if (!svg) {
      setError("导图未加载");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await exportSvgAsPng(svg, filename);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={handle_click} disabled={busy}>
        <Download size={16} className="mr-1" />
        {busy ? "导出中..." : "导图 PNG"}
      </Button>
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
}
