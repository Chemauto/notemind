import { forwardRef, useEffect, useRef } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";

const transformer = new Transformer();

interface MindmapViewProps {
  markdown: string;
  onNodeClick?: (header: { title: string } | null) => void;
}

export const MindmapView = forwardRef<SVGSVGElement, MindmapViewProps>(
  function MindmapView({ markdown, onNodeClick }, parentRef) {
    const internalRef = useRef<SVGSVGElement | null>(null);
    const mmRef = useRef<InstanceType<typeof Markmap> | null>(null);

    useEffect(() => {
      if (!internalRef.current) return;
      mmRef.current = Markmap.create(internalRef.current, undefined);
      return () => {
        mmRef.current?.destroy();
        mmRef.current = null;
      };
    }, []);

    useEffect(() => {
      if (!mmRef.current) return;
      const { root } = transformer.transform(markdown);
      mmRef.current.setData(root);
      mmRef.current.fit();
    }, [markdown]);

    useEffect(() => {
      const svg = internalRef.current;
      if (!svg || !onNodeClick) return;
      const handler = (event: Event) => {
        const target = event.target as Element;
        const g = target.closest("g.markmap-node") as SVGGElement | null;
        if (!g) {
          onNodeClick(null);
          return;
        }
        const text = g.querySelector("text");
        const title = text?.textContent?.trim() || null;
        onNodeClick(title ? { title } : null);
      };
      svg.addEventListener("click", handler);
      return () => svg.removeEventListener("click", handler);
    }, [onNodeClick]);

    const set_ref = (el: SVGSVGElement | null) => {
      internalRef.current = el;
      if (typeof parentRef === "function") parentRef(el);
      else if (parentRef)
        (parentRef as React.MutableRefObject<SVGSVGElement | null>).current = el;
    };

    return <svg ref={set_ref} className="w-full h-full" style={{ minHeight: 400 }} />;
  }
);
