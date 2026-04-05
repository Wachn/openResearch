from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(slots=True)
class ArtifactRef:
    name: str
    description: str = ""


@dataclass(slots=True)
class CapabilityBinding:
    name: str
    provider: str | None = None
    mode: str | None = None
    description: str = ""


@dataclass(slots=True)
class ResearchPacket:
    research_question: str
    motivation_and_context: str
    problem_to_solve: str
    scope_and_assumptions: list[str]
    output_mode: str
    method_or_evidence_basis: list[str]
    key_findings: list[str]
    evidence_by_theme: list[dict[str, Any]] = field(default_factory=list)
    source_quality_assessment: list[dict[str, Any]] = field(default_factory=list)
    conflicting_views_and_uncertainty: list[str] = field(default_factory=list)
    implications_or_recommendations: list[str] = field(default_factory=list)
    gaps_and_next_questions: list[str] = field(default_factory=list)
    novelty_or_opportunity_signals: list[str] = field(default_factory=list)
    citations: list[dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class SkillManifest:
    name: str
    kind: str
    category: str
    description: str
    calls: list[str] = field(default_factory=list)
    reads_context: list[str] = field(default_factory=list)
    requires: list[str] = field(default_factory=list)
    consumes: list[str] = field(default_factory=list)
    produces: list[str] = field(default_factory=list)
    ui: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class GraphNode:
    id: str
    kind: str
    label: str
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class GraphEdge:
    source: str
    target: str
    kind: str
    meta: dict[str, Any] = field(default_factory=dict)
