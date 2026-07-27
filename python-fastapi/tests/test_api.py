from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

VALID_PAYLOAD = {
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
}


def test_required_page_routes_are_registered() -> None:
    paths = {route.path for route in app.routes}
    assert {
        "/",
        "/matches",
        "/matches/{match_id}",
        "/matches/{match_id}/scenarios/{scenario_id}/briefing",
        "/matches/{match_id}/scenarios/{scenario_id}/tactics",
        "/matches/{match_id}/scenarios/{scenario_id}/result",
        "/about-data",
    } <= paths


def test_all_pages_render_and_unknown_page_uses_html_404() -> None:
    paths = [
        "/",
        "/matches",
        "/matches/kor-cze-2026",
        "/matches/kor-cze-2026/scenarios/level-69-find-nine/briefing",
        "/matches/kor-cze-2026/scenarios/level-69-find-nine/tactics",
        "/matches/kor-cze-2026/scenarios/level-69-find-nine/result",
        "/about-data",
    ]
    for path in paths:
        response = client.get(path)
        assert response.status_code == 200
        assert "TOUCHLINE 26" in response.text

    missing = client.get("/matches/not-real")
    assert missing.status_code == 404
    assert "터치라인 밖으로" in missing.text


def test_health_and_catalog() -> None:
    health = client.get("/api/health")
    catalog = client.get("/api/catalog")

    assert health.status_code == 200
    assert health.json()["status"] == "ok"
    assert catalog.status_code == 200
    assert catalog.json()["matches"][0]["id"] == "kor-cze-2026"
    assert len(catalog.json()["scenarios"]) == 2


def test_scenario_api_merges_tactical_coordinates() -> None:
    response = client.get("/api/matches/kor-cze-2026/scenarios/level-69-find-nine")

    assert response.status_code == 200
    data = response.json()
    assert data["scenario"]["currentScore"] == "1–1"
    assert {"x", "y", "slot"} <= data["lineupPlayers"][0].keys()
    assert data["benchPlayers"][0]["id"] == "oh-hyeongyu"


def test_evaluate_api_contract() -> None:
    response = client.post("/api/evaluate", json=VALID_PAYLOAD)

    assert response.status_code == 200
    data = response.json()
    assert data["score"] == data["situationFit"]
    assert data["gradeKey"] in {"excellent", "good", "mixed", "risky", "weak"}
    assert set(data["impactsBefore"]) == {"attack", "control", "defense", "energy"}
    assert set(data["impactsAfter"]) == {"attack", "control", "defense", "energy"}
    assert data["selectedPlayer"]["id"] == "oh-hyeongyu"
    assert data["selectedRole"]["roleId"] == "target-striker"
    assert data["actualDecision"]["isSameSubstitution"] is True


def test_missing_scenario_returns_404() -> None:
    payload = {**VALID_PAYLOAD, "scenarioId": "not-real"}
    response = client.post("/api/evaluate", json=payload)
    assert response.status_code == 404


def test_invalid_enum_or_extra_input_returns_422() -> None:
    invalid = {
        **VALID_PAYLOAD,
        "instructions": {
            **VALID_PAYLOAD["instructions"],
            "pressing": "maximum",
        },
    }
    assert client.post("/api/evaluate", json=invalid).status_code == 422
    assert (
        client.post("/api/evaluate", json={**VALID_PAYLOAD, "unexpected": True}).status_code == 422
    )


def test_contextually_invalid_selection_returns_422() -> None:
    response = client.post(
        "/api/evaluate",
        json={**VALID_PAYLOAD, "incomingPlayerId": "hwang-heechan", "roleId": "winger"},
    )
    assert response.status_code == 422
