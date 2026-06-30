export type Style = "academic" | "exam" | "casual" | "meeting";
export type Depth = "minimal" | "standard" | "detailed";

export interface OutlineNode {
  id: string;
  title: string;
  summary: string;
  key_points: string[];
  tags: string[];
  source_quote: string;
  children: OutlineNode[];
}

export interface Outline {
  title: string;
  summary: string;
  outline: OutlineNode[];
  keywords: string[];
  suggested_style: Style;
  suggested_depth: Depth;
}

export interface OutlineRequest {
  text: string;
}

export interface GenerateMarkdownRequest {
  outline: Outline;
  style: Style;
  depth: Depth;
}

export interface MarkdownResponse {
  markdown: string;
}

export const STYLE_OPTIONS: { value: Style; label: string; description: string }[] = [
  { value: "academic", label: "学术报告", description: "严谨，引用原文" },
  { value: "exam", label: "考试背诵", description: "加粗知识点，附易错点" },
  { value: "casual", label: "通俗解读", description: "口语化，多类比" },
  { value: "meeting", label: "会议纪要", description: "讨论/决议/待办三段式" },
];

export const DEPTH_OPTIONS: { value: Depth; label: string }[] = [
  { value: "minimal", label: "极简" },
  { value: "standard", label: "标准" },
  { value: "detailed", label: "详细" },
];
