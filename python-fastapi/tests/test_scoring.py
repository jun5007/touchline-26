from __future__ import annotations

import pytest

from app.data_loader import DataRepository
from app.scoring import (
    DecisionValidationError,
    calculate_attribute_fit,
    calculate_situation_fit,
    evaluate_decision,
)


@pytest.fixture(scope="module")
def repository() -> DataRepository:
    return DataRepository()


def test_attribute_fit_normalizes_the_1_to_20_domain() -> None:
    assert (
        calculate_attribute_fit(
            {"finishing": 20, "passing": 1},
            {"finishing": 3, "passing": 1},
        )
        == 75
    )


def test_situation_fit_uses_60_20_10_10_and_subtracts_risk() -> None:
    result = calculate_situation_fit(
        attributes={"finishing": 20},
        attribute_weights={"finishing": 1},
        role_attribute_weights={"finishing": 1},
        role_modifier=-20,
        fitness=70,
        matchup_fit=60,
        risk={"totalPenalty": 5, "triggered": []},
    )

    assert result["preRiskScore"] == 89
    assert result["riskPenalty"] == 5
    assert result["score"] == 84
    assert result["contributions"] == {
        "ability": 60,
        "role": 16,
        "fitness": 7,
        "matchup": 6,
    }


def test_scenario_filters_risk_rules(repository: DataRepository) -> None:
    passive = {
        "attackDirection": "balanced",
        "pressing": "low",
        "defensiveLine": "low",
        "mentality": "safe",
    }
    level = evaluate_decision(
        repository,
        {
            "matchId": "kor-cze-2026",
            "scenarioId": "level-69-find-nine",
            "outgoingPlayerId": "son-heungmin",
            "incomingPlayerId": "oh-hyeongyu",
            "roleId": "target-striker",
            "instructions": passive,
        },
    )
    lead = evaluate_decision(
        repository,
        {
            "matchId": "kor-cze-2026",
            "scenarioId": "lead-84-close-game",
            "outgoingPlayerId": "hwang-inbeom",
            "incomingPlayerId": "kim-jingyu",
            "roleId": "box-to-box",
            "instructions": passive,
        },
    )

    assert "deep-passive-block" not in {finding["id"] for finding in level["riskFindings"]}
    assert "deep-passive-block" in {finding["id"] for finding in lead["riskFindings"]}


def test_evaluation_is_explainable_and_has_four_gauges(
    repository: DataRepository,
) -> None:
    response = evaluate_decision(
        repository,
        {
            "matchId": "kor-cze-2026",
            "scenarioId": "level-69-find-nine",
            "outgoingPlayerId": "son-heungmin",
            "incomingPlayerId": "oh-hyeongyu",
            "roleId": "target-striker",
            "instructions": {
                "attackDirection": "centre",
                "pressing": "medium",
                "defensiveLine": "medium",
                "mentality": "balanced",
            },
        },
    )

    assert 0 <= response["score"] <= 100
    assert response["situationFit"] == response["score"]
    assert set(response["components"]) == {"ability", "role", "fitness", "matchup"}
    assert set(response["impacts"]) == {
        "attackThreat",
        "possessionStability",
        "defensiveStability",
        "pressingIntensity",
    }
    assert response["selectedPlayer"]["id"] == "oh-hyeongyu"
    assert response["selectedRole"]["roleId"] == "target-striker"
    assert response["benefits"]
    assert response["risks"]
    assert response["remedies"]
    assert response["actualDecision"]["isSameSubstitution"] is True
    assert "전술적 추론" in response["actualComparison"]


def test_rejects_player_outside_scenario_bench(
    repository: DataRepository,
) -> None:
    with pytest.raises(DecisionValidationError):
        evaluate_decision(
            repository,
            {
                "matchId": "kor-cze-2026",
                "scenarioId": "level-69-find-nine",
                "outgoingPlayerId": "son-heungmin",
                "incomingPlayerId": "hwang-heechan",
                "roleId": "winger",
                "instructions": {
                    "attackDirection": "balanced",
                    "pressing": "medium",
                    "defensiveLine": "medium",
                    "mentality": "balanced",
                },
            },
        )
