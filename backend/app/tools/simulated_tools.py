from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Any

from app.services import seed_loader


@dataclass
class ToolRecorder:
    calls: list[dict[str, Any]] = field(default_factory=list)
    retrieved_contexts: list[dict[str, Any]] = field(default_factory=list)
    _sequence: int = 0

    def record(self, tool_name: str, payload: dict[str, Any], output: dict[str, Any], success: bool = True) -> dict[str, Any]:
        self._sequence += 1
        self.calls.append(
            {
                "tool_name": tool_name,
                "input": payload,
                "output": output,
                "success": success,
                "sequence_order": self._sequence,
                "latency_ms": 18 + (self._sequence * 7),
            }
        )
        return output


class SimulatedTools:
    def __init__(self, recorder: ToolRecorder):
        self.recorder = recorder

    def log_guest_message(self, session_id: str, message: str) -> dict[str, Any]:
        return self.recorder.record(
            "log_guest_message",
            {"session_id": session_id, "message": message},
            {"logged": True, "message_id": f"msg_{uuid.uuid4().hex[:8]}"},
        )

    def get_reservation(self, booking_id: str | None) -> dict[str, Any]:
        if not booking_id:
            return self.recorder.record(
                "get_reservation",
                {"booking_id": booking_id},
                {"found": False, "booking_id": booking_id, "reason": "No booking ID provided."},
                success=False,
            )

        reservation = seed_loader.get_reservation(booking_id)
        if reservation is None:
            return self.recorder.record(
                "get_reservation",
                {"booking_id": booking_id},
                {"found": False, "booking_id": booking_id, "reason": "Reservation not found."},
                success=False,
            )

        return self.recorder.record(
            "get_reservation",
            {"booking_id": booking_id},
            {"found": True, **reservation.model_dump()},
        )

    def search_property_kb(self, property_id: str, query: str) -> dict[str, Any]:
        words = {word.strip(".,?!").lower() for word in query.split() if len(word.strip(".,?!")) > 2}
        scored: list[tuple[float, dict[str, Any]]] = []
        for chunk in seed_loader.get_kb_chunks():
            if chunk["property_id"] != property_id:
                continue
            haystack = f"{chunk['title']} {chunk['category']} {chunk['content']}".lower()
            matches = sum(1 for word in words if word in haystack)
            category_bonus = 2 if any(tag in haystack for tag in ["refund", "checkout", "access", "safety", "maintenance"]) else 0
            score = matches + category_bonus
            if score > 0:
                scored.append((float(score), chunk))

        scored.sort(key=lambda item: item[0], reverse=True)
        selected = scored[:3] or [(1.0, chunk) for chunk in seed_loader.get_kb_chunks() if chunk["property_id"] == property_id][:2]
        results = [
            {
                "chunk_id": chunk["id"],
                "title": chunk["title"],
                "category": chunk["category"],
                "text": chunk["content"],
                "relevance_score": min(score / 8, 1.0),
            }
            for score, chunk in selected
        ]
        for result in results:
            self.recorder.retrieved_contexts.append(
                {
                    "kb_chunk_id": result["chunk_id"],
                    "relevance_score": result["relevance_score"],
                    "content_snapshot": result["text"],
                }
            )
        return self.recorder.record(
            "search_property_kb",
            {"property_id": property_id, "query": query},
            {"property_id": property_id, "query": query, "results": results},
        )

    def create_case(self, priority: str, category: str, summary: str) -> dict[str, Any]:
        sla_minutes = 5 if priority == "critical" else 10 if priority == "urgent" else 60
        assigned_team = "Safety Desk" if priority == "critical" else "L2 Operations" if priority == "urgent" else "Guest Operations"
        return self.recorder.record(
            "create_case",
            {"priority": priority, "category": category, "summary": summary},
            {
                "case_id": f"CASE-{uuid.uuid4().hex[:6].upper()}",
                "priority": priority,
                "category": category,
                "assigned_team": assigned_team,
                "sla_minutes": sla_minutes,
                "status": "open",
            },
        )

    def handoff_to_human(self, level: str, reason: str) -> dict[str, Any]:
        return self.recorder.record(
            "handoff_to_human",
            {"level": level, "reason": reason},
            {"handoff": True, "level": level, "reason": reason},
        )

