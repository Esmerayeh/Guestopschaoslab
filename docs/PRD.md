# Product Requirements Document

## Product

GuestOps Chaos Lab

## Thesis

GuestOps Chaos Lab is a reliability simulator for hospitality AI concierge agents before they interact with real guests.

## Problem

Hospitality AI agents operate inside messy real workflows. Guests may be angry, reservation data may be missing, policies may conflict, and safety issues may require immediate escalation.

The risk is not only that the agent gives a bad answer. The risk is that it sounds helpful while skipping the operational action that protects the guest and the business.

## Target Users

- Applied AI engineer validating an agent before deployment.
- Founder or technical reviewer evaluating agent workflow maturity.
- Operations manager checking escalation and policy behavior.
- QA or customer success team testing edge cases before rollout.

## MVP Scope

- Scenario library for hospitality edge cases.
- Mock property knowledge base and reservation data.
- Baseline and guarded deterministic agents.
- Simulated tools and auditable tool traces.
- Eval engine with deterministic scoring.
- Failure Replay panel.
- Baseline-vs-guarded comparison.
- Voice Transcript Mode as a simulator.
- Exportable Reliability Report JSON.

## Out of Scope

Real WhatsApp, Airbnb, Booking.com, Twilio, PMS, auth, payment, and production multi-tenant integrations are intentionally excluded from the MVP.

## Success Criteria

A reviewer should understand that:

- the project is not just a chatbot
- agent workflow decisions are visible
- tools and traces are auditable
- evals score behavior against expected outcomes
- failure replay produces actionable fixes
- guarded behavior is measurably safer than baseline behavior

## Core User Stories

As an AI engineer, I want to run a scenario and inspect the agent's response, tool calls, and eval score.

As an operator, I want to see why the agent failed so I can decide whether it is safe enough for real guest workflows.

As a reviewer, I want to compare baseline and guarded agents so I can see iteration and applied AI judgment.

As an implementation team, I want reusable scenarios so I can test edge cases before deploying to a client.
