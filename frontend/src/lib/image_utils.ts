export const ACCEPTED_IMAGE_MIMES = ["image/png", "image/jpeg", "image/webp"] as const;
export const MAX_IMAGES = 20;

export function isAcceptedImage(mime: string): boolean {
  return (ACCEPTED_IMAGE_MIMES as readonly string[]).includes(mime);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("FileReader 未返回字符串"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("读取文件失败"));
    reader.readAsDataURL(file);
  });
}
