import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  ACCEPTED_IMAGE_MIMES,
  fileToDataUrl,
  isAcceptedImage,
  MAX_IMAGES,
} from "@/lib/image_utils";

describe("isAcceptedImage", () => {
  it("accepts png, jpeg, webp", () => {
    expect(isAcceptedImage("image/png")).toBe(true);
    expect(isAcceptedImage("image/jpeg")).toBe(true);
    expect(isAcceptedImage("image/webp")).toBe(true);
  });

  it("rejects non-image types", () => {
    expect(isAcceptedImage("application/pdf")).toBe(false);
    expect(isAcceptedImage("text/plain")).toBe(false);
    expect(isAcceptedImage("")).toBe(false);
  });
});

describe("ACCEPTED_IMAGE_MIMES + MAX_IMAGES", () => {
  it("exports constants", () => {
    expect(ACCEPTED_IMAGE_MIMES).toContain("image/png");
    expect(MAX_IMAGES).toBe(20);
  });
});

describe("fileToDataUrl", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves with data URL string", async () => {
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], "a.jpg", {
      type: "image/jpeg",
    });
    const url = await fileToDataUrl(file);
    expect(url.startsWith("data:image/jpeg;base64,")).toBe(true);
  });

  it("rejects on read error", async () => {
    const file = new File([new Uint8Array([0xff])], "a.jpg", { type: "image/jpeg" });
    const original = FileReader.prototype.readAsDataURL;
    FileReader.prototype.readAsDataURL = function () {
      this.onerror && this.onerror(new ProgressEvent("error") as ProgressEvent<FileReader>);
    };
    try {
      await expect(fileToDataUrl(file)).rejects.toBeDefined();
    } finally {
      FileReader.prototype.readAsDataURL = original;
    }
  });
});
