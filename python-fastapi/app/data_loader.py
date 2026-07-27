"""Load and query the canonical TOUCHLINE 26 JSON datasets."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from .config import settings

DATA_FILES: dict[str, Path] = {
    "matches": Path("matches/matches.json"),
    "players": Path("players/players.json"),
    "scenarios": Path("scenarios/scenarios.json"),
    "roles": Path("roles/roles.json"),
    "instructions": Path("instructions/instructions.json"),
    "result_templates": Path("copy/resultTemplates.json"),
}


def _is_complete_data_root(path: Path) -> bool:
    return path.is_dir() and all((path / relative).is_file() for relative in DATA_FILES.values())


@lru_cache(maxsize=1)
def resolve_data_root() -> Path:
    """Return the first complete configured data root.

    A partial snapshot is intentionally rejected instead of mixing datasets
    from different roots.
    """

    for candidate in settings.data_candidates:
        if _is_complete_data_root(candidate):
            return candidate
    expected = ", ".join(str(candidate) for candidate in settings.data_candidates)
    raise RuntimeError(
        "TOUCHLINE 26 데이터셋을 찾을 수 없습니다. 다음 위치 중 하나에 완전한 "
        f"JSON 스냅샷이 필요합니다: {expected}"
    )


def _read_json(root: Path, relative: Path) -> Any:
    path = root / relative
    try:
        with path.open("r", encoding="utf-8") as stream:
            return json.load(stream)
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"데이터 파일을 읽을 수 없습니다: {path}") from exc


class DataRepository:
    """In-memory, read-only view over one internally consistent data snapshot."""

    def __init__(self, data_root: Path | None = None) -> None:
        root = (data_root or resolve_data_root()).resolve()
        if not _is_complete_data_root(root):
            raise RuntimeError(f"완전하지 않은 데이터 루트입니다: {root}")
        self.data_root = root
        self.matches: list[dict[str, Any]] = _read_json(root, DATA_FILES["matches"])
        self.players: list[dict[str, Any]] = _read_json(root, DATA_FILES["players"])
        self.scenarios: list[dict[str, Any]] = _read_json(root, DATA_FILES["scenarios"])
        self.roles: list[dict[str, Any]] = _read_json(root, DATA_FILES["roles"])
        self.instructions: list[dict[str, Any]] = _read_json(root, DATA_FILES["instructions"])
        self.result_templates: dict[str, Any] = _read_json(root, DATA_FILES["result_templates"])

        self._matches = {item["id"]: item for item in self.matches}
        self._players = {item["id"]: item for item in self.players}
        self._scenarios = {(item["matchId"], item["id"]): item for item in self.scenarios}
        self._roles = {item["roleId"]: item for item in self.roles}

    def get_match(self, match_id: str) -> dict[str, Any] | None:
        return self._matches.get(match_id)

    def get_player(self, player_id: str) -> dict[str, Any] | None:
        return self._players.get(player_id)

    def get_scenario(self, match_id: str, scenario_id: str) -> dict[str, Any] | None:
        return self._scenarios.get((match_id, scenario_id))

    def get_role(self, role_id: str) -> dict[str, Any] | None:
        return self._roles.get(role_id)

    def scenarios_for_match(self, match_id: str) -> list[dict[str, Any]]:
        return sorted(
            (item for item in self.scenarios if item["matchId"] == match_id),
            key=lambda item: item["order"],
        )

    def players_by_ids(self, player_ids: list[str]) -> list[dict[str, Any]]:
        return [
            player for player_id in player_ids if (player := self.get_player(player_id)) is not None
        ]

    def lineup_players(self, scenario: dict[str, Any]) -> list[dict[str, Any]]:
        """Merge each player's canonical record with its tactical coordinates."""

        merged: list[dict[str, Any]] = []
        for spot in scenario["currentLineup"]:
            player = self.get_player(spot["playerId"])
            if player is not None:
                merged.append({**player, **spot})
        return merged

    def bench_players(self, scenario: dict[str, Any]) -> list[dict[str, Any]]:
        return self.players_by_ids(scenario["benchOptions"])

    def roles_for_player(self, player: dict[str, Any]) -> list[dict[str, Any]]:
        position_group = player["positionGroup"]
        return [role for role in self.roles if position_group in role["allowedPositionGroups"]]


@lru_cache(maxsize=1)
def get_repository() -> DataRepository:
    return DataRepository()
