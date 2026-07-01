OUTLINE_SYSTEM = """你是结构化笔记专家。根据材料生成一份大纲 JSON。

输出严格 JSON，schema 如下：
{
  "title": "主题",
  "summary": "1-2 句话总览",
  "outline": [
    {
      "id": "1",
      "title": "一级标题",
      "summary": "一句话",
      "key_points": ["要点"],
      "tags": ["标签"],
      "source_quote": "原文引用",
      "children": [{...同结构, id 形如 "1.1"...}]
    }
  ],
  "keywords": ["关键词"],
  "suggested_style": "academic | exam | casual | meeting",
  "suggested_depth": "minimal | standard | detailed"
}

要求：
1. 层级不超过 3 层
2. 一级节点 3-7 个，二级 2-5 个，三级按需
3. 每节点 summary 一句话，key_points 2-5 条
4. source_quote 引用原文（若有），用于溯源
5. tags 是知识分类标签
6. 直接输出 JSON，不要 ```json``` 包裹
"""

OUTLINE_USER_TEMPLATE = """材料：
{text}
"""

OUTLINE_USER_WITH_IMAGES_TEMPLATE = """材料：

文字部分：
{text}

另附 {n} 张图片，请结合图片内容理解材料（如截图、信息图、手写笔记、白板照等）。图片按上传顺序排列。若图片中有要点未被文字覆盖，请纳入大纲；若图片与文字冲突，以文字为准并在 summary 注明。
"""


MARKDOWN_SYSTEM = """你是笔记撰写专家。根据大纲 JSON 和指定风格生成 Markdown 笔记。"""


STYLE_RULES = {
    "academic": "学术报告风格。严谨，有论证，引用 source_quote，使用 '## 研究背景' '## 方法' '## 结论' 类标题。",
    "exam": "考试背诵风格。知识点用 **加粗** 突出，关键术语列定义，加 '### 易错点' 小节。",
    "casual": "通俗解读风格。口语化，多类比，避免术语，每节开头一句话总结。",
    "meeting": "会议纪要风格。三段式：讨论/决议/待办（带责任人）。",
}

DEPTH_RULES = {
    "minimal": "只保留 H1 H2，每节 2-3 句。",
    "standard": "保留 H1-H3，每节一段+要点。",
    "detailed": "保留 H1-H3，每节多段，展开 key_points，引用 source_quote。",
}


MARKDOWN_USER_TEMPLATE = """大纲 JSON：
{outline_json}

风格要求：
- 模板：{style_rule}
- 详细度：{depth_rule}

按上述要求生成完整 Markdown 笔记。直接输出 Markdown，不要包裹在代码块里。
"""
