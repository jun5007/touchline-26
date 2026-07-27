"""Filesystem and application configuration.

The deployed Python app is self-contained when ``python-fastapi/data`` exists.
During local development we keep a read-only fallback to the canonical
Next.js data directory so both implementations can share one source of truth.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
PROJECT_DIR = APP_DIR.parent
REPOSITORY_ROOT = PROJECT_DIR.parent


@dataclass(frozen=True)
class Settings:
    app_name: str = "TOUCHLINE 26"
    app_version: str = "1.0.0"
    templates_dir: Path = APP_DIR / "templates"
    static_dir: Path = PROJECT_DIR / "public" / "static"

    @property
    def data_candidates(self) -> tuple[Path, ...]:
        configured = os.getenv("TOUCHLINE_DATA_ROOT")
        candidates: list[Path] = []
        if configured:
            candidates.append(Path(configured).expanduser().resolve())
        candidates.extend(
            [
                (PROJECT_DIR / "data").resolve(),
                (REPOSITORY_ROOT / "src" / "data").resolve(),
            ]
        )
        return tuple(dict.fromkeys(candidates))


settings = Settings()
