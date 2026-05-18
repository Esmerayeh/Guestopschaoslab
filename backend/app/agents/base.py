from dataclasses import dataclass, field
from typing import Any, Protocol

from app.schemas.api import Scenario


@dataclass
class AgentResult:
    final_response: str
    structured_decision: dict[str, Any]
    tool_calls: list[dict[str, Any]] = field(default_factory=list)
    retrieved_contexts: list[dict[str, Any]] = field(default_factory=list)
    total_tokens: int = 0
    latency_ms: int = 0


class ConciergeAgent(Protocol):
    agent_version_id: str

    def run(self, scenario: Scenario) -> AgentResult:
        ...


def latest_guest_text(scenario: Scenario) -> str:
    return "\n".join(message.message_text for message in scenario.messages if message.sender == "guest")


def guest_emotion(scenario: Scenario) -> str:
    return scenario.messages[-1].emotion if scenario.messages else "neutral"

