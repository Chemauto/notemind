import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { delete_note, generate_id, get_note, list_notes, save_note } from "@/lib/notes_db";
import type { SavedNote } from "@/lib/types";

async function _clear() {
  const { clear } = await import("idb-keyval");
  await clear();
}

function _make_note(overrides: Partial<SavedNote> = {}): SavedNote {
  const now = Date.now();
  return {
    id: "test-id-" + Math.random().toString(36).slice(2),
    title: "测试笔记",
    markdown: "# 测试\n\n内容",
    outline: null,
    style: "academic",
    depth: "standard",
    inputText: "原始输入",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

beforeEach(async () => {
  await _clear();
});

afterEach(async () => {
  await _clear();
});

describe("notes_db", () => {
  it("list_notes returns empty when nothing saved", async () => {
    const result = await list_notes();
    expect(result).toEqual([]);
  });

  it("save_note then get_note round-trips", async () => {
    const note = _make_note({ id: "abc-1", title: "我的笔记" });
    await save_note(note);
    const fetched = await get_note("abc-1");
    expect(fetched).toBeDefined();
    expect(fetched?.title).toBe("我的笔记");
    expect(fetched?.markdown).toBe("# 测试\n\n内容");
  });

  it("save_note overwrites existing with same id", async () => {
    const note = _make_note({ id: "abc-2", title: "v1" });
    await save_note(note);
    await save_note({ ...note, title: "v2" });
    const fetched = await get_note("abc-2");
    expect(fetched?.title).toBe("v2");
  });

  it("delete_note removes the record", async () => {
    const note = _make_note({ id: "abc-3" });
    await save_note(note);
    await delete_note("abc-3");
    const fetched = await get_note("abc-3");
    expect(fetched).toBeUndefined();
  });

  it("list_notes returns sorted by updatedAt desc", async () => {
    await save_note(_make_note({ id: "old", updatedAt: 1000 }));
    await save_note(_make_note({ id: "new", updatedAt: 2000 }));
    await save_note(_make_note({ id: "mid", updatedAt: 1500 }));
    const result = await list_notes();
    expect(result.map((n) => n.id)).toEqual(["new", "mid", "old"]);
  });

  it("generate_id returns unique strings", async () => {
    const a = await generate_id();
    const b = await generate_id();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(8);
  });
});
