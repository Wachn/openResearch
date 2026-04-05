from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class HostAdapterSpec:
    name: str
    supports_skills: bool = True
    supports_agents: bool = True
    supports_context_injection: bool = True
    supports_mcp: bool = True
    notes: list[str] = field(default_factory=list)
