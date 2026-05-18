from fastapi import HTTPException

from app.agents.baseline_agent import BaselineAgent
from app.agents.guarded_agent import GuardedAgent


def get_agent(agent_version_id: str):
    if agent_version_id == "baseline_agent":
        return BaselineAgent()
    if agent_version_id == "guarded_agent":
        return GuardedAgent()
    raise HTTPException(status_code=404, detail=f"Unknown agent version: {agent_version_id}")

