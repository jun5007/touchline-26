"""Pydantic request and response contracts for the public API."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class TacticalInstructions(StrictModel):
    attackDirection: Literal["left", "centre", "right", "balanced"]
    pressing: Literal["low", "medium", "high"]
    defensiveLine: Literal["low", "medium", "high"]
    mentality: Literal["safe", "balanced", "attacking"]


class EvaluateRequest(StrictModel):
    matchId: str = Field(min_length=1, max_length=120)
    scenarioId: str = Field(min_length=1, max_length=120)
    outgoingPlayerId: str = Field(min_length=1, max_length=120)
    incomingPlayerId: str = Field(min_length=1, max_length=120)
    roleId: str = Field(min_length=1, max_length=120)
    instructions: TacticalInstructions


class SituationComponents(StrictModel):
    ability: float
    role: float
    fitness: float
    matchup: float


class SituationContributions(SituationComponents):
    pass


class RiskFinding(StrictModel):
    id: str
    label: str
    penalty: float
    severity: Literal["low", "medium", "high"]
    message: str
    mitigation: str | None = None


class ImpactDriver(StrictModel):
    key: str
    label: str
    delta: float


class ImpactGauge(StrictModel):
    id: str
    label: str
    before: int
    after: int
    delta: int
    direction: Literal["increase", "decrease", "unchanged"]
    reason: str
    drivers: list[ImpactDriver]


class PlayerMetadata(StrictModel):
    id: str
    name: str
    nameEn: str
    shirtNumber: int
    position: str
    positionGroup: str
    fitness: int
    confidence: float
    confidenceLabel: str


class RoleMetadata(StrictModel):
    roleId: str
    name: str
    shortName: str
    description: str


class SelectedDecision(StrictModel):
    outgoingPlayer: PlayerMetadata
    incomingPlayer: PlayerMetadata
    role: RoleMetadata
    instructions: TacticalInstructions


class ActualDecisionMetadata(StrictModel):
    minute: int
    scoreAtDecision: str
    outgoingPlayer: PlayerMetadata
    incomingPlayer: PlayerMetadata
    interpretedRole: str
    interpretationStatus: Literal["verified", "inferred"]
    note: str
    parallelDecision: str | None = None
    isSameSubstitution: bool


class EvaluateResponse(StrictModel):
    score: int
    situationFit: int
    preRiskScore: float
    riskPenalty: float
    grade: str
    gradeKey: Literal["excellent", "good", "mixed", "risky", "weak"]
    gradeDescription: str
    components: SituationComponents
    contributions: SituationContributions
    benefits: list[str]
    risks: list[str]
    remedies: list[str]
    summary: str
    impacts: dict[str, ImpactGauge]
    impactsBefore: dict[str, int]
    impactsAfter: dict[str, int]
    riskFindings: list[RiskFinding]
    selected: SelectedDecision
    selectedPlayer: PlayerMetadata
    selectedRole: RoleMetadata
    positionMismatch: bool
    actualComparison: str
    actualDecisionComparison: str
    actualDecision: ActualDecisionMetadata
    disclaimer: str
    dataStatus: dict[str, Any]
