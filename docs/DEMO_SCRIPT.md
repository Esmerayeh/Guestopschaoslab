# 2-Minute Demo Script

Hi, I'm Dimple. I built GuestOps Chaos Lab as a proof-of-work for Maneuver's Applied AI Intern role.

I didn't want to build another chatbot demo. I wanted to build the reliability layer behind a hospitality AI concierge.

This is the Refund Trap scenario: the guest is angry, asks for a refund, and threatens a one-star review.

The baseline agent sounds helpful, but creates risk. It implies compensation and skips required operational workflow steps.

The guarded agent handles it differently. It checks reservation context, searches property policy, creates a case, escalates to L2 Ops, and avoids promising a refund.

The eval layer scores the difference: baseline is critical risk, guarded is low risk, with a +60 reliability lift.

The key part is the trace. You can inspect which tools were called, why the agent passed or failed, and export a reliability report.

That is the kind of applied AI work I want to do: agents that survive real workflows, not just demos that sound good.
