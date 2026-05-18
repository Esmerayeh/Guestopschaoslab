# App Flow

## Navigation

- Home
- Reviewer Demo
- Scenario Gallery
- Run Lab
- Agent Comparison
- Failure Replay
- Eval Library

## Recommended Reviewer Flow

1. Open Reviewer Demo.
2. Run Refund Trap.
3. Compare baseline vs guarded.
4. Inspect guarded tool trace.
5. Open Failure Replay.
6. Export Reliability Report.

## Scenario Flow

1. User opens Scenario Gallery.
2. User selects a scenario or compares agents.
3. Backend loads synthetic scenario, reservation, and property context.
4. Agent produces a response and structured decision.
5. Simulated tools write trace entries.
6. Eval engine scores the run.
7. UI shows guest messages, response, tools, scorecard, and failure modes.

## Comparison Flow

1. User runs Refund Trap comparison.
2. Baseline agent produces a plausible but risky response.
3. Guarded agent uses tools, escalates, and avoids unauthorized promises.
4. UI highlights reliability lift and risk reduction.
5. User can open Failure Replay or export a report.

## Failure Replay Flow

1. User opens a failed baseline run.
2. System shows failed criterion and offending response text.
3. System explains business risk and expected behavior.
4. System shows how the guarded agent corrected the issue.
