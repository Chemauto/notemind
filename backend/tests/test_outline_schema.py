import pytest
from pydantic import ValidationError


def _valid_node(node_id: str = "1") -> dict:
    return {
        "id": node_id,
        "title": "测试节点",
        "summary": "一句话概括",
        "key_points": ["要点 1"],
        "tags": ["测试"],
        "source_quote": "原文",
        "children": [],
    }


def test_valid_outline_parses() -> None:
    from app.schemas.outline import Outline, OutlineNode

    data = {
        "title": "主题",
        "summary": "总览",
        "outline": [OutlineNode(**_valid_node())],
        "keywords": ["关键词"],
        "suggested_style": "academic",
        "suggested_depth": "standard",
    }
    outline = Outline(**data)
    assert outline.title == "主题"
    assert outline.outline[0].id == "1"


def test_invalid_style_rejected() -> None:
    from app.schemas.outline import Outline

    with pytest.raises(ValidationError):
        Outline(
            title="x",
            summary="x",
            outline=[],
            keywords=[],
            suggested_style="invalid",
            suggested_depth="standard",
        )


def test_node_id_required() -> None:
    from app.schemas.outline import OutlineNode

    node_data = _valid_node()
    del node_data["id"]
    with pytest.raises(ValidationError):
        OutlineNode(**node_data)


def test_nested_children_parse() -> None:
    from app.schemas.outline import Outline, OutlineNode

    parent = _valid_node("1")
    parent["children"] = [_valid_node("1.1"), _valid_node("1.2")]
    outline = Outline(
        title="x", summary="x", outline=[OutlineNode(**parent)],
        keywords=[], suggested_style="casual", suggested_depth="minimal",
    )
    assert len(outline.outline[0].children) == 2


def test_optional_fields_default_to_empty() -> None:
    from app.schemas.outline import OutlineNode

    node = OutlineNode(id="1", title="t")
    assert node.summary == ""
    assert node.key_points == []
    assert node.tags == []
    assert node.source_quote == ""
    assert node.children == []
