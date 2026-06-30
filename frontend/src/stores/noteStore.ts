import { create } from "zustand";
import type { Depth, Outline, Style } from "@/lib/types";

interface NoteState {
  inputText: string;
  outline: Outline | null;
  markdown: string;
  style: Style;
  depth: Depth;
  setInputText: (text: string) => void;
  setOutline: (outline: Outline | null) => void;
  setMarkdown: (markdown: string) => void;
  setStyle: (style: Style) => void;
  setDepth: (depth: Depth) => void;
  reset: () => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  inputText: "",
  outline: null,
  markdown: "",
  style: "academic",
  depth: "standard",
  setInputText: (inputText) => set({ inputText }),
  setOutline: (outline) => set({ outline }),
  setMarkdown: (markdown) => set({ markdown }),
  setStyle: (style) => set({ style }),
  setDepth: (depth) => set({ depth }),
  reset: () => set({ inputText: "", outline: null, markdown: "" }),
}));
