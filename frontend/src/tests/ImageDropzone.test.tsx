import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ImageDropzone } from "@/components/ImageDropzone";

describe("ImageDropzone", () => {
  it("renders dropzone with prompt", () => {
    render(<ImageDropzone images={[]} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText(/拖拽图片到此处|点击选择|把图片拖到这/i)).toBeTruthy();
  });

  it("renders thumbnails for existing images", () => {
    const images = [
      { id: "a", name: "a.png", dataUrl: "data:image/png;base64,AAA", size: 1024 },
      { id: "b", name: "b.jpg", dataUrl: "data:image/jpeg;base64,BBB", size: 2048 },
    ];
    render(<ImageDropzone images={images} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText("a.png")).toBeTruthy();
    expect(screen.getByText("b.jpg")).toBeTruthy();
  });

  it("calls onRemove when remove button clicked", () => {
    const onRemove = vi.fn();
    const images = [{ id: "a", name: "a.png", dataUrl: "data:image/png;base64,AAA", size: 1024 }];
    render(<ImageDropzone images={images} onAdd={vi.fn()} onRemove={onRemove} />);
    const btn = screen.getByLabelText(/删除|移除/i);
    fireEvent.click(btn);
    expect(onRemove).toHaveBeenCalledWith("a");
  });

  it("rejects more than MAX_IMAGES via onAdd error", async () => {
    const onAdd = vi.fn();
    const files = Array.from({ length: 5 }, (_, i) =>
      new File([new Uint8Array([0xff])], `f${i}.png`, { type: "image/png" }),
    );
    const existing = Array.from({ length: 18 }, (_, i) => ({
      id: `id${i}`,
      name: `x${i}.png`,
      dataUrl: "data:image/png;base64,AA",
      size: 1,
    }));
    render(<ImageDropzone images={existing} onAdd={onAdd} onRemove={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files } });
    await waitFor(() => {
      expect(onAdd).not.toHaveBeenCalled();
    });
  });

  it("calls onAdd with data URLs for accepted files", async () => {
    const onAdd = vi.fn();
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], "ok.jpg", {
      type: "image/jpeg",
    });
    render(<ImageDropzone images={[]} onAdd={onAdd} onRemove={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledTimes(1);
      const first = onAdd.mock.calls[0][0];
      expect(Array.isArray(first)).toBe(true);
      expect(first[0].dataUrl.startsWith("data:image/jpeg;base64,")).toBe(true);
      expect(first[0].name).toBe("ok.jpg");
    });
  });
});
