import { describe, expect, it } from "vitest";

import type { HeaderNode } from "@/lib/outline_parser";
import { parseHeaders, findHeaderLine } from "@/lib/outline_parser";

describe("parseHeaders", () => {
  it("returns empty array for empty input", () => {
    expect(parseHeaders("")).toEqual([]);
  });

  it("parses single h1", () => {
    const md = "# Title\n\nbody";
    const result = parseHeaders(md);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual<HeaderNode>({
      level: 1,
      title: "Title",
      line: 0,
    });
  });

  it("parses mixed levels", () => {
    const md = ["# A", "## B", "### C", "# D"].join("\n");
    const result = parseHeaders(md);
    expect(result.map((h) => [h.level, h.title, h.line])).toEqual([
      [1, "A", 0],
      [2, "B", 1],
      [3, "C", 2],
      [1, "D", 3],
    ]);
  });

  it("ignores atx-style headers with leading text", () => {
    const md = "some text # Not a header\n# Real header";
    const result = parseHeaders(md);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Real header");
  });

  it("ignores code-fenced lines that start with #", () => {
    const md = ["# Real", "", "```", "# comment in code", "```", "## After"].join("\n");
    const result = parseHeaders(md);
    expect(result.map((h) => h.title)).toEqual(["Real", "After"]);
  });

  it("strips trailing # from closed atx headers", () => {
    const md = "# Title #";
    const result = parseHeaders(md);
    expect(result[0].title).toBe("Title");
  });

  it("handles setext-style headers (===)", () => {
    const md = "Title\n===\n\nbody";
    const result = parseHeaders(md);
    expect(result).toHaveLength(1);
    expect(result[0].level).toBe(1);
    expect(result[0].title).toBe("Title");
  });
});

describe("findHeaderLine", () => {
  it("returns -1 when no match", () => {
    const nodes: HeaderNode[] = [{ level: 1, title: "A", line: 0 }];
    expect(findHeaderLine(nodes, "Z")).toBe(-1);
  });

  it("returns line number for exact title match", () => {
    const nodes: HeaderNode[] = [
      { level: 1, title: "A", line: 0 },
      { level: 2, title: "B", line: 5 },
    ];
    expect(findHeaderLine(nodes, "B")).toBe(5);
  });

  it("returns first match for duplicate titles", () => {
    const nodes: HeaderNode[] = [
      { level: 1, title: "X", line: 0 },
      { level: 1, title: "X", line: 10 },
    ];
    expect(findHeaderLine(nodes, "X")).toBe(0);
  });
});
