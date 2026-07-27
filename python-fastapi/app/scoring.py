"""Rule-based decision evaluation shared by the FastAPI pages and API.

This module is a Python port of ``src/lib/decision/evaluateDecision.ts`` and
the underlying 60/20/10/10 scoring functions. It deliberately remains
deterministic and contains no model/API calls.
"""

from __future__ import annotations

import math
from collections.abc import Mapping
from typing import Any

from .data_loader import DataRepository

ATTRIBUTE_LABELS = {
    "finishing": "골 결정력",
    "chanceCreation": "찬스 창출",
    "dribbling": "드리블",
    "passing": "패스",
    "pressing": "압박",
    "defending": "수비 기여",
    "aerial": "제공권",
    "impact": "임팩트",
}

ROLE_GAUGE_MODIFIERS: dict[str, dict[str, float]] = {
    "inside-forward": {
        "attackThreat": 5,
        "possessionStability": -1,
        "defensiveStability": -2,
        "pressingIntensity": 1,
    },
    "winger": {
        "attackThreat": 3,
        "possessionStability": 1,
        "defensiveStability": -1,
        "pressingIntensity": 2,
    },
    "target-striker": {
        "attackThreat": 6,
        "possessionStability": -1,
        "defensiveStability": 0,
        "pressingIntensity": -2,
    },
    "advanced-forward": {
        "attackThreat": 7,
        "possessionStability": -2,
        "defensiveStability": -2,
        "pressingIntensity": 2,
    },
    "playmaker": {
        "attackThreat": 3,
        "possessionStability": 5,
        "defensiveStability": -1,
        "pressingIntensity": -1,
    },
    "box-to-box": {
        "attackThreat": 2,
        "possessionStability": 2,
        "defensiveStability": 2,
        "pressingIntensity": 5,
    },
    "holding-midfielder": {
        "attackThreat": -3,
        "possessionStability": 4,
        "defensiveStability": 7,
        "pressingIntensity": 2,
    },
    "attacking-fullback": {
        "attackThreat": 4,
        "possessionStability": 1,
        "defensiveStability": -4,
        "pressingIntensity": 2,
    },
    "defensive-fullback": {
        "attackThreat": -3,
        "possessionStability": 2,
        "defensiveStability": 6,
        "pressingIntensity": 1,
    },
    "centre-back": {
        "attackThreat": -4,
        "possessionStability": 1,
        "defensiveStability": 7,
        "pressingIntensity": 0,
    },
    "ball-playing-centre-back": {
        "attackThreat": -2,
        "possessionStability": 5,
        "defensiveStability": 4,
        "pressingIntensity": 0,
    },
}

IMPACT_DEFINITIONS: dict[str, dict[str, Any]] = {
    "attackThreat": {
        "label": "공격 위협",
        "weights": {
            "finishing": 0.25,
            "chanceCreation": 0.2,
            "dribbling": 0.2,
            "speed": 0.15,
            "impact": 0.2,
        },
    },
    "possessionStability": {
        "label": "점유 안정",
        "weights": {
            "passing": 0.35,
            "chanceCreation": 0.15,
            "dribbling": 0.1,
            "composure": 0.2,
            "ballRetention": 0.2,
        },
    },
    "defensiveStability": {
        "label": "수비 안정",
        "weights": {
            "defending": 0.4,
            "pressing": 0.15,
            "aerial": 0.2,
            "composure": 0.1,
            "stamina": 0.15,
        },
    },
    "pressingIntensity": {
        "label": "압박 강도",
        "weights": {
            "pressing": 0.4,
            "stamina": 0.25,
            "speed": 0.15,
            "defending": 0.1,
            "impact": 0.1,
        },
    },
}

RISK_RULES: list[dict[str, Any]] = [
    {
        "id": "high-line-low-press",
        "label": "라인과 압박의 간격",
        "conditions": [
            ("instructions.defensiveLine", "eq", "high"),
            ("instructions.pressing", "eq", "low"),
        ],
        "penalty": 12,
        "severity": "high",
        "message": "높은 수비 라인과 낮은 압박의 조합은 상대 전진 패스 시간을 늘릴 수 있습니다.",
        "mitigation": "수비 라인을 보통으로 내리거나 압박 강도를 보통 이상으로 맞추세요.",
    },
    {
        "id": "all-out-attack",
        "label": "전환 수비 노출",
        "conditions": [
            ("instructions.mentality", "eq", "attacking"),
            ("instructions.defensiveLine", "eq", "high"),
        ],
        "penalty": 8,
        "severity": "medium",
        "message": "공격 성향과 높은 라인을 동시에 선택해 볼을 잃은 뒤 뒷공간이 커질 수 있습니다.",
        "mitigation": "한쪽 윙백의 전진을 제한하거나 수비 라인을 보통으로 유지하세요.",
    },
    {
        "id": "deep-passive-block",
        "label": "수동적 저블록",
        "conditions": [
            ("instructions.defensiveLine", "eq", "low"),
            ("instructions.pressing", "eq", "low"),
        ],
        "penalty": 7,
        "severity": "medium",
        "message": "라인과 압박을 모두 낮추면 박스 앞 세컨드볼과 반복 크로스를 허용할 수 있습니다.",
        "mitigation": "압박을 보통으로 올려 상대의 편안한 크로스 준비를 방해하세요.",
    },
    {
        "id": "position-mismatch",
        "label": "포지션 재배치",
        "conditions": [("positionMismatch", "truthy", None)],
        "penalty": 10,
        "severity": "high",
        "message": "직접 호환되지 않는 포지션 교체라 주변 선수의 재배치가 필요합니다.",
        "mitigation": (
            "역할 설명을 확인하고 인접 포지션 선수의 위치까지 함께 조정했다고 가정하세요."
        ),
    },
    {
        "id": "low-confidence",
        "label": "낮은 데이터 신뢰도",
        "conditions": [("incomingConfidence", "lt", 0.35)],
        "penalty": 5,
        "severity": "low",
        "message": "투입 선수의 이 경기 표본이 짧아 퍼포먼스 스탯의 불확실성이 큽니다.",
        "mitigation": "점수 차이를 절대값보다 선택 의도와 위험 범위로 해석하세요.",
    },
    {
        "id": "protect-lead-attacking",
        "label": "미션과 공격 성향 충돌",
        "conditions": [
            ("scoreState", "eq", "leading"),
            ("instructions.mentality", "eq", "attacking"),
        ],
        "penalty": 6,
        "severity": "medium",
        "message": "리드 보호 미션에서 공격 성향을 높여 경기 통제보다 추가 득점 위험을 택했습니다.",
        "mitigation": "공격 방향은 유지하되 성향을 균형으로 내려 후방 숫자를 확보하세요.",
    },
]

GRADE_KEYS = {
    90: "excellent",
    75: "good",
    60: "mixed",
    40: "risky",
    0: "weak",
}

COMPATIBLE_POSITION_PAIRS = {
    "WINGER:STRIKER",
    "STRIKER:WINGER",
    "CM_AM:DM",
    "DM:CM_AM",
    "FB_WB:WINGER",
    "WINGER:FB_WB",
    "CB:DM",
    "DM:CB",
}


class DecisionNotFoundError(LookupError):
    """A referenced match, scenario, player, or role does not exist."""


class DecisionValidationError(ValueError):
    """The payload references a real item that is invalid in this scenario."""


def _finite(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def clamp(value: Any, minimum: float, maximum: float, fallback: float | None = None) -> float:
    fallback = minimum if fallback is None else fallback
    safe = float(value) if _finite(value) else float(fallback)
    return min(maximum, max(minimum, safe))


def round_to(value: Any, places: int = 0) -> float:
    """Mirror JavaScript Math.round for the non-negative scoring domain."""

    multiplier = 10 ** max(0, min(8, places))
    safe = float(value) if _finite(value) else 0.0
    return math.floor(safe * multiplier + 0.5) / multiplier


def js_round(value: Any) -> int:
    safe = float(value) if _finite(value) else 0.0
    return math.floor(safe + 0.5)


def attribute_to_percent(value: Any) -> float:
    score = clamp(value, 1, 20, 10.5)
    return ((score - 1) / 19) * 100


def calculate_attribute_fit(
    attributes: Mapping[str, Any],
    weights: Mapping[str, Any],
    fallback: float = 50,
) -> float:
    total = 0.0
    total_weight = 0.0
    for attribute, configured_weight in weights.items():
        weight = (
            float(configured_weight) if _finite(configured_weight) and configured_weight > 0 else 0
        )
        if weight == 0:
            continue
        value = attributes.get(attribute)
        normalized = attribute_to_percent(value) if _finite(value) else clamp(fallback, 0, 100, 50)
        total += normalized * weight
        total_weight += weight
    return clamp(total / total_weight if total_weight > 0 else fallback, 0, 100, fallback)


def _read_path(context: Mapping[str, Any], path: str) -> Any:
    if path in context:
        return context[path]
    current: Any = context
    for segment in path.split("."):
        if not isinstance(current, Mapping):
            return None
        current = current.get(segment)
    return current


def _condition_matches(context: Mapping[str, Any], condition: tuple[str, str, Any]) -> bool:
    path, operator, expected = condition
    actual = _read_path(context, path)
    if operator == "eq":
        return type(actual) is type(expected) and actual == expected
    if operator == "neq":
        return not (type(actual) is type(expected) and actual == expected)
    if operator == "lt":
        return _finite(actual) and _finite(expected) and actual < expected
    if operator == "lte":
        return _finite(actual) and _finite(expected) and actual <= expected
    if operator == "gt":
        return _finite(actual) and _finite(expected) and actual > expected
    if operator == "gte":
        return _finite(actual) and _finite(expected) and actual >= expected
    if operator == "truthy":
        return bool(actual)
    if operator == "falsy":
        return not actual
    if operator == "includes":
        return isinstance(actual, (str, list, tuple)) and expected in actual
    if operator == "notIncludes":
        return not (isinstance(actual, (str, list, tuple)) and expected in actual)
    if operator == "oneOf":
        return isinstance(expected, (list, tuple)) and actual in expected
    if operator == "between":
        return (
            _finite(actual)
            and isinstance(expected, (list, tuple))
            and len(expected) >= 2
            and _finite(expected[0])
            and _finite(expected[1])
            and min(expected[0], expected[1]) <= actual <= max(expected[0], expected[1])
        )
    return False


def calculate_risk(
    context: Mapping[str, Any],
    rules: list[dict[str, Any]],
    max_penalty: float = 100,
) -> dict[str, Any]:
    findings: list[dict[str, Any]] = []
    for rule in rules:
        matches = [_condition_matches(context, item) for item in rule["conditions"]]
        triggered = any(matches) if rule.get("match") == "any" else all(matches)
        if not triggered:
            continue
        findings.append(
            {
                "id": rule["id"],
                "label": rule["label"],
                "penalty": clamp(rule["penalty"], 0, max_penalty, 0),
                "severity": rule.get("severity", "medium"),
                "message": rule["message"],
                "mitigation": rule.get("mitigation"),
            }
        )
    total = clamp(sum(item["penalty"] for item in findings), 0, max_penalty, 0)
    return {"totalPenalty": total, "triggered": findings}


def _sum_instruction_modifiers(
    values: Mapping[str, str], categories: list[dict[str, Any]]
) -> dict[str, Any]:
    totals = {gauge: 0.0 for gauge in IMPACT_DEFINITIONS}
    fit_modifier = 0.0
    for category in categories:
        selected = values.get(category["id"])
        option = next(
            (item for item in category["options"] if item["id"] == selected),
            None,
        )
        if option is None:
            continue
        fit_modifier += option["fitModifier"]
        for gauge in totals:
            totals[gauge] += option["impactModifiers"][gauge]
    return {"totals": totals, "fitModifier": fit_modifier}


def _role_attribute_weights(role: Mapping[str, Any]) -> dict[str, float]:
    attributes = role["preferredAttributes"]
    return {
        attribute: max(1, len(attributes) - index) * role.get("fitModifiers", {}).get(attribute, 1)
        for index, attribute in enumerate(attributes)
    }


def _matchup_fit(
    player: Mapping[str, Any],
    scenario: Mapping[str, Any],
    role: Mapping[str, Any],
) -> float:
    fit = 58
    group = player["positionGroup"]
    role_id = role["roleId"]
    tags = player["tags"]
    if scenario["scoreState"] == "level":
        if group == "STRIKER":
            fit += 10
        if group == "WINGER":
            fit += 6
        if role_id in {"target-striker", "advanced-forward", "inside-forward"}:
            fit += 7
        if "박스 타깃" in tags:
            fit += 5
        if "낮은 블록 공략" in tags:
            fit += 4
    if scenario["scoreState"] == "leading":
        if group == "DM":
            fit += 13
        if group == "CM_AM":
            fit += 8
        if group == "CB":
            fit += 9
        if role_id in {"holding-midfielder", "box-to-box", "defensive-fullback"}:
            fit += 7
        if "수비 안정" in tags:
            fit += 5
        if group == "STRIKER":
            fit -= 7
    return clamp(fit, 0, 100)


def is_position_mismatch(outgoing: Mapping[str, Any], incoming: Mapping[str, Any]) -> bool:
    outgoing_group = outgoing["positionGroup"]
    incoming_group = incoming["positionGroup"]
    return (
        outgoing_group != incoming_group
        and f"{outgoing_group}:{incoming_group}" not in COMPATIBLE_POSITION_PAIRS
    )


def _calculate_gauge(
    gauge_id: str,
    attributes: Mapping[str, Any],
    modifiers: Mapping[str, Any],
) -> tuple[float, dict[str, float], float]:
    definition = IMPACT_DEFINITIONS[gauge_id]
    total = 0.0
    total_weight = 0.0
    normalized: dict[str, float] = {}
    for attribute, weight in definition["weights"].items():
        value = attributes.get(attribute)
        normalized_value = attribute_to_percent(value) if _finite(value) else 50
        normalized[attribute] = normalized_value
        total += normalized_value * weight
        total_weight += weight
    base = total / total_weight if total_weight > 0 else 50
    modifier = modifiers.get(gauge_id)
    score = clamp(base + (modifier if _finite(modifier) else 0), 0, 100, 50)
    return score, normalized, total_weight


def calculate_impacts(
    outgoing: Mapping[str, Any],
    incoming: Mapping[str, Any],
    before_modifiers: Mapping[str, Any],
    after_modifiers: Mapping[str, Any],
) -> dict[str, dict[str, Any]]:
    results: dict[str, dict[str, Any]] = {}
    for gauge_id, definition in IMPACT_DEFINITIONS.items():
        before_score, before_attributes, total_weight = _calculate_gauge(
            gauge_id, outgoing["attributes"], before_modifiers
        )
        after_score, after_attributes, _ = _calculate_gauge(
            gauge_id, incoming["attributes"], after_modifiers
        )
        before = js_round(before_score)
        after = js_round(after_score)
        delta = after - before
        drivers: list[dict[str, Any]] = []
        for attribute, weight in definition["weights"].items():
            driver_delta = (
                (after_attributes[attribute] - before_attributes[attribute]) * weight / total_weight
            )
            if abs(driver_delta) >= 0.05:
                drivers.append(
                    {
                        "key": attribute,
                        "label": ATTRIBUTE_LABELS.get(attribute, attribute),
                        "delta": round_to(driver_delta, 1),
                    }
                )
        modifier_delta = after_modifiers.get(gauge_id, 0) - before_modifiers.get(gauge_id, 0)
        if abs(modifier_delta) >= 0.05:
            drivers.append(
                {
                    "key": "tacticalModifier",
                    "label": "역할·팀 지시",
                    "delta": round_to(modifier_delta, 1),
                }
            )
        drivers.sort(key=lambda item: abs(item["delta"]), reverse=True)
        if delta == 0:
            reason = "뚜렷한 변화 없음"
        elif drivers:
            reason = f"{drivers[0]['label']} {'상승' if drivers[0]['delta'] >= 0 else '하락'} 영향"
        else:
            reason = "종합 지표 상승" if delta > 0 else "종합 지표 하락"
        results[gauge_id] = {
            "id": gauge_id,
            "label": definition["label"],
            "before": before,
            "after": after,
            "delta": delta,
            "direction": "increase" if delta > 0 else "decrease" if delta < 0 else "unchanged",
            "reason": reason,
            "drivers": drivers,
        }
    return results


def calculate_situation_fit(
    attributes: Mapping[str, Any],
    attribute_weights: Mapping[str, Any],
    role_attribute_weights: Mapping[str, Any],
    role_modifier: float,
    fitness: Any,
    matchup_fit: Any,
    risk: Mapping[str, Any],
) -> dict[str, Any]:
    ability = calculate_attribute_fit(attributes, attribute_weights)
    role = clamp(
        calculate_attribute_fit(attributes, role_attribute_weights) + role_modifier,
        0,
        100,
    )
    fitness_value = clamp(fitness, 0, 100, 50)
    matchup = clamp(matchup_fit, 0, 100, 50)
    components = {
        "ability": round_to(ability, 1),
        "role": round_to(role, 1),
        "fitness": round_to(fitness_value, 1),
        "matchup": round_to(matchup, 1),
    }
    raw_contributions = {
        "ability": ability * 0.6,
        "role": role * 0.2,
        "fitness": fitness_value * 0.1,
        "matchup": matchup * 0.1,
    }
    pre_risk = clamp(sum(raw_contributions.values()), 0, 100, 50)
    risk_penalty = clamp(risk.get("totalPenalty"), 0, 100, 0)
    return {
        "score": int(clamp(js_round(pre_risk - risk_penalty), 0, 100, 0)),
        "preRiskScore": round_to(pre_risk, 1),
        "riskPenalty": risk_penalty,
        "components": components,
        "contributions": {key: round_to(value, 1) for key, value in raw_contributions.items()},
    }


def _grade(score: int, templates: Mapping[str, Any]) -> dict[str, str]:
    grade = next(
        item
        for item in sorted(templates["grades"], key=lambda item: item["min"], reverse=True)
        if score >= item["min"]
    )
    return {
        "key": GRADE_KEYS[grade["min"]],
        "label": grade["label"],
        "description": grade["description"],
    }


def _explain(
    score: int,
    impacts: Mapping[str, Mapping[str, Any]],
    risk: Mapping[str, Any],
    role: Mapping[str, Any],
) -> dict[str, Any]:
    summaries = {
        "excellent": "현재 미션과 매우 높은 적합도를 보이는 선택입니다.",
        "good": "현재 미션에서 뚜렷한 장점이 있는 선택입니다.",
        "mixed": "전술적 의도는 분명하지만 보완이 필요한 선택입니다.",
        "risky": "가능한 의도는 있으나 위험 부담이 큰 선택입니다.",
        "weak": "현재 미션 해결과의 거리가 있지만 노린 효과는 검토할 수 있습니다.",
    }
    key = (
        "excellent"
        if score >= 90
        else "good"
        if score >= 75
        else "mixed"
        if score >= 60
        else "risky"
        if score >= 40
        else "weak"
    )
    increased = sorted(
        (item for item in impacts.values() if item["delta"] > 0),
        key=lambda item: item["delta"],
        reverse=True,
    )[:3]
    benefits = [
        f"{item['label']}: +{item['delta']}점 개선되어 현재 전술 의도를 뒷받침합니다."
        for item in increased
    ]
    if not benefits:
        benefits = [f"{role['name']} 역할을 통한 전술 변화 의도는 확인할 수 있습니다."]

    risk_messages = [item["message"] for item in risk["triggered"] if item["message"].strip()]
    decreased = sorted(
        (item for item in impacts.values() if item["delta"] < 0),
        key=lambda item: item["delta"],
    )
    impact_risks = [
        f"{item['label']}: -{abs(item['delta'])}점 낮아질 가능성을 함께 관리해야 합니다."
        for item in decreased
    ]
    risks = (risk_messages + impact_risks)[:3]
    if not risks:
        risks = ["수치상 장점과 별개로 실제 경기 흐름과 상대 대응에 따른 변동성이 남습니다."]

    remedies = [item["mitigation"] for item in risk["triggered"] if item.get("mitigation")][:3]
    if not remedies:
        remedies = ["경기 흐름을 관찰하며 역할과 팀 지시의 강도를 단계적으로 조정하세요."]

    return {
        "summary": summaries[key],
        "benefits": benefits,
        "risks": risks,
        "remedies": remedies,
    }


def _player_metadata(player: Mapping[str, Any]) -> dict[str, Any]:
    return {
        key: player[key]
        for key in (
            "id",
            "name",
            "nameEn",
            "shirtNumber",
            "position",
            "positionGroup",
            "fitness",
            "confidence",
            "confidenceLabel",
        )
    }


def _role_metadata(role: Mapping[str, Any]) -> dict[str, Any]:
    return {key: role[key] for key in ("roleId", "name", "shortName", "description")}


def _actual_comparison(
    scenario: Mapping[str, Any],
    outgoing: Mapping[str, Any],
    incoming: Mapping[str, Any],
    actual_outgoing: Mapping[str, Any],
    actual_incoming: Mapping[str, Any],
) -> tuple[str, bool]:
    actual = scenario["actualDecision"]
    same = outgoing["id"] == actual["outPlayerId"] and incoming["id"] == actual["inPlayerId"]
    factual = (
        f"공식 기록상 {actual['minute']}분 {actual_outgoing['name']} OUT · "
        f"{actual_incoming['name']} IN 교체가 이뤄졌습니다."
    )
    difference = (
        "당신도 같은 교체를 선택했지만 부여한 역할과 팀 지시에 따라 "
        "의도와 위험은 달라질 수 있습니다."
        if same
        else (
            f"당신은 {outgoing['name']} 대신 {incoming['name']}을 선택해 "
            "다른 장점과 위험을 택했습니다."
        )
    )
    interpretation = (
        f" 실제 선택을 '{actual['interpretedRole']}'로 해석한 부분은 경기 상태와 "
        "선수 특성에 근거한 전술적 추론이며, 실제 선택을 정답으로 보지는 않습니다."
    )
    return f"{factual} {difference}{interpretation}", same


def evaluate_decision(repository: DataRepository, payload: Mapping[str, Any]) -> dict[str, Any]:
    match_id = str(payload["matchId"])
    scenario_id = str(payload["scenarioId"])
    match = repository.get_match(match_id)
    if match is None:
        raise DecisionNotFoundError(f"경기를 찾을 수 없습니다: {match_id}")
    scenario = repository.get_scenario(match_id, scenario_id)
    if scenario is None:
        raise DecisionNotFoundError(f"시나리오를 찾을 수 없습니다: {scenario_id}")

    outgoing = repository.get_player(str(payload["outgoingPlayerId"]))
    incoming = repository.get_player(str(payload["incomingPlayerId"]))
    role = repository.get_role(str(payload["roleId"]))
    if outgoing is None:
        raise DecisionNotFoundError("교체 대상 선수를 찾을 수 없습니다.")
    if incoming is None:
        raise DecisionNotFoundError("투입 선수를 찾을 수 없습니다.")
    if role is None:
        raise DecisionNotFoundError("역할을 찾을 수 없습니다.")

    lineup_ids = {spot["playerId"] for spot in scenario["currentLineup"]}
    if outgoing["id"] not in lineup_ids:
        raise DecisionValidationError("교체 대상 선수는 현재 라인업에 있어야 합니다.")
    if incoming["id"] not in scenario["benchOptions"]:
        raise DecisionValidationError("투입 선수는 이 시나리오의 벤치 명단에 있어야 합니다.")
    if incoming["positionGroup"] not in role["allowedPositionGroups"]:
        raise DecisionValidationError("선택한 선수에게 허용되지 않은 역할입니다.")
    if outgoing["id"] == incoming["id"]:
        raise DecisionValidationError("같은 선수를 교체 대상과 투입 선수로 선택할 수 없습니다.")

    instructions = dict(payload["instructions"])
    position_mismatch = is_position_mismatch(outgoing, incoming)
    scenario_rules = [rule for rule in RISK_RULES if rule["id"] in scenario["riskRules"]]
    role_rules = [
        {
            "id": f"role-{role['roleId']}-{index}",
            "label": f"{role['name']} 역할 위험",
            "conditions": [("roleRiskActive", "truthy", None)],
            "penalty": 2,
            "severity": "low",
            "message": message,
            "mitigation": (
                f"{role['name']}의 단점을 상쇄하도록 팀 지시와 주변 선수 역할을 조정하세요."
            ),
        }
        for index, message in enumerate(role["riskModifiers"])
    ]
    risk = calculate_risk(
        {
            "instructions": instructions,
            "positionMismatch": position_mismatch,
            "incomingConfidence": incoming["confidence"],
            "scoreState": scenario["scoreState"],
            "roleRiskActive": bool(role_rules),
        },
        [*scenario_rules, *role_rules],
        max_penalty=35,
    )

    selected_modifiers = _sum_instruction_modifiers(instructions, repository.instructions)
    default_modifiers = _sum_instruction_modifiers(
        scenario["defaultInstructions"], repository.instructions
    )
    role_modifiers = ROLE_GAUGE_MODIFIERS.get(
        role["roleId"], {key: 0 for key in IMPACT_DEFINITIONS}
    )
    after_modifiers = {
        key: selected_modifiers["totals"][key] + role_modifiers[key] for key in IMPACT_DEFINITIONS
    }
    impacts = calculate_impacts(
        outgoing,
        incoming,
        default_modifiers["totals"],
        after_modifiers,
    )
    fit = calculate_situation_fit(
        incoming["attributes"],
        scenario["attributeWeights"],
        _role_attribute_weights(role),
        min(8, selected_modifiers["fitModifier"]),
        incoming["fitness"],
        _matchup_fit(incoming, scenario, role),
        risk,
    )
    explanation = _explain(fit["score"], impacts, risk, role)
    grade = _grade(fit["score"], repository.result_templates)

    actual = scenario["actualDecision"]
    actual_outgoing = repository.get_player(actual["outPlayerId"])
    actual_incoming = repository.get_player(actual["inPlayerId"])
    if actual_outgoing is None or actual_incoming is None:
        raise RuntimeError("실제 교체 데이터가 선수 데이터와 연결되지 않습니다.")
    actual_comparison, is_same = _actual_comparison(
        scenario, outgoing, incoming, actual_outgoing, actual_incoming
    )

    selected_player = _player_metadata(incoming)
    selected_role = _role_metadata(role)
    aliases = {
        "attack": "attackThreat",
        "control": "possessionStability",
        "defense": "defensiveStability",
        "energy": "pressingIntensity",
    }
    impacts_before = {alias: impacts[canonical]["before"] for alias, canonical in aliases.items()}
    impacts_after = {alias: impacts[canonical]["after"] for alias, canonical in aliases.items()}
    actual_metadata = {
        "minute": actual["minute"],
        "scoreAtDecision": actual["scoreAtDecision"],
        "outgoingPlayer": _player_metadata(actual_outgoing),
        "incomingPlayer": _player_metadata(actual_incoming),
        "interpretedRole": actual["interpretedRole"],
        "interpretationStatus": actual["interpretationStatus"],
        "note": actual["note"],
        "parallelDecision": actual.get("parallelDecision"),
        "isSameSubstitution": is_same,
    }
    return {
        "score": fit["score"],
        "situationFit": fit["score"],
        "preRiskScore": fit["preRiskScore"],
        "riskPenalty": fit["riskPenalty"],
        "grade": grade["label"],
        "gradeKey": grade["key"],
        "gradeDescription": grade["description"],
        "components": fit["components"],
        "contributions": fit["contributions"],
        **explanation,
        "impacts": impacts,
        "impactsBefore": impacts_before,
        "impactsAfter": impacts_after,
        "riskFindings": risk["triggered"],
        "selected": {
            "outgoingPlayer": _player_metadata(outgoing),
            "incomingPlayer": selected_player,
            "role": selected_role,
            "instructions": instructions,
        },
        "selectedPlayer": selected_player,
        "selectedRole": selected_role,
        "positionMismatch": position_mismatch,
        "actualComparison": actual_comparison,
        "actualDecisionComparison": actual_comparison,
        "actualDecision": actual_metadata,
        "disclaimer": repository.result_templates["disclaimer"],
        "dataStatus": {
            "verificationStatus": match["verificationStatus"],
            "isSample": bool(match["isSample"] or scenario["isSample"]),
            "method": "공개 경기 데이터의 경기 종료 후 규칙 기반 회고 평가",
        },
    }
