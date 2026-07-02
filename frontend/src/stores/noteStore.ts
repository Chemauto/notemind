import { create } from "zustand";
import type { Depth, Outline, Style } from "@/lib/types";
import type { StoredImage } from "@/components/ImageDropzone";

interface NoteState {
  inputText: string;
  images: StoredImage[];
  outline: Outline | null;
  markdown: string;
  style: Style;
  depth: Depth;
  setInputText: (text: string) => void;
  addImages: (newImages: StoredImage[]) => void;
  removeImage: (id: string) => void;
  setOutline: (outline: Outline | null) => void;
  setMarkdown: (markdown: string) => void;
  setStyle: (style: Style) => void;
  setDepth: (depth: Depth) => void;
  reset: () => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  inputText: "",
  images: [],
  outline: null,
  markdown: "",
  style: "academic",
  depth: "standard",
  setInputText: (inputText) => set({ inputText }),
  addImages: (newImages) =>
    set((state) => ({ images: [...state.images, ...newImages] })),
  removeImage: (id) =>
    set((state) => ({ images: state.images.filter((i) => i.id !== id) })),
  setOutline: (outline) => set({ outline }),
  setMarkdown: (markdown) => set({ markdown }),
  setStyle: (style) => set({ style }),
  setDepth: (depth) => set({ depth }),
  reset: () => set({ inputText: "", images: [], outline: null, markdown: "" }),
}));
