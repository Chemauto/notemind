import { del, get, keys, set } from "idb-keyval";

import type { SavedNote } from "@/lib/types";

export async function generate_id(): Promise<string> {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function save_note(note: SavedNote): Promise<void> {
  await set(note.id, note);
}

export async function get_note(id: string): Promise<SavedNote | undefined> {
  return await get<SavedNote>(id);
}

export async function delete_note(id: string): Promise<void> {
  await del(id);
}

export async function list_notes(): Promise<SavedNote[]> {
  const allKeys = await keys();
  const notes: SavedNote[] = [];
  for (const k of allKeys) {
    const note = await get<SavedNote>(k);
    if (note) notes.push(note);
  }
  return notes.sort((a, b) => b.updatedAt - a.updatedAt);
}
