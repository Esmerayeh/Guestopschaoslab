from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_scenarios_include_voice_mode() -> None:
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) >= 13
    assert any(scenario["id"] == "noisy_voice_lockout" and scenario["mode"] == "voice_transcript" for scenario in scenarios)


def test_guarded_refund_run_passes() -> None:
    response = client.post("/api/runs", json={"scenario_id": "refund_trap", "agent_version": "guarded_agent"})
    assert response.status_code == 200
    run = response.json()
    assert run["eval_result"]["status"] == "passed"
    assert "handoff_to_human" in [call["tool_name"] for call in run["tool_calls"]]
    assert "refund you for tonight" not in run["final_response"].lower()


def test_baseline_refund_run_has_failure() -> None:
    response = client.post("/api/runs", json={"scenario_id": "refund_trap", "agent_version": "baseline_agent"})
    assert response.status_code == 200
    run = response.json()
    assert run["eval_result"]["status"] in {"risky", "failed"}
    failure_types = {failure["failure_type"] for failure in run["eval_result"]["failure_modes"]}
    assert "unauthorized_refund_promise" in failure_types or "forbidden_phrase" in failure_types


def test_best_demo_and_report() -> None:
    response = client.post("/api/demo/best")
    assert response.status_code == 200
    comparison = response.json()
    assert comparison["scenario_id"] == "refund_trap"
    assert comparison["improvement_delta"] > 0

    guarded_run = comparison["runs"][-1]
    report_response = client.get(f"/api/runs/{guarded_run['id']}/report")
    assert report_response.status_code == 200
    report = report_response.json()
    assert report["scenario"]["id"] == "refund_trap"
    assert report["tool_trace"]

