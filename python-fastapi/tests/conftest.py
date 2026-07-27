"""Shared pytest fixtures for the FastAPI edition."""

import os
import sys
from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parents[1]
REPOSITORY_ROOT = PROJECT_ROOT.parent
CANONICAL_DATA_ROOT = REPOSITORY_ROOT / "src" / "data"

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

os.environ.setdefault("TOUCHLINE_DATA_ROOT", str(CANONICAL_DATA_ROOT))


@pytest.fixture
def client() -> Iterator[TestClient]:
    """Yield a lifespan-aware client backed by the production ASGI app."""

    from app.main import app

    with TestClient(app) as test_client:
        yield test_client
