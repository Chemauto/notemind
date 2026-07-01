export async function exportSvgAsPng(svg: SVGSVGElement, filename: string): Promise<void> {
  const xml = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("SVG 加载失败"));
    img.src = url;
  });

  const bbox = svg.getBoundingClientRect();
  const width = Math.max(800, Math.ceil(bbox.width));
  const height = Math.max(600, Math.ceil(bbox.height));

  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context 不可用");
  ctx.scale(2, 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  URL.revokeObjectURL(url);

  canvas.toBlob((pngBlob) => {
    if (!pngBlob) return;
    const pngUrl = URL.createObjectURL(pngBlob);
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(pngUrl);
  }, "image/png");
}
