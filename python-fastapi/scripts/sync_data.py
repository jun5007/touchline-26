"""Copy the canonical JSON data into this deployable Python project.

The repository root's ``src/data`` directory is the source of truth. Vercel and
some Render configurations deploy only ``python-fastapi``, so those platforms
need a checked-in snapshot at ``python-fastapi/data``.
"""

from __future__ import annotations

import argparse
import hashlib
import shutil
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
REPOSITORY_ROOT = PROJECT_ROOT.parent
DEFAULT_SOURCE = REPOSITORY_ROOT / "src" / "data"
DEFAULT_DESTINATION = PROJECT_ROOT / "data"

REQUIRED_FILES = {
    Path("copy/resultTemplates.json"),
    Path("instructions/instructions.json"),
    Path("matches/matches.json"),
    Path("players/players.json"),
    Path("roles/roles.json"),
    Path("scenarios/scenarios.json"),
}


def digest(path: Path) -> str:
    """Return a stable SHA-256 digest for one file."""

    hasher = hashlib.sha256()
    with path.open("rb") as file_handle:
        for chunk in iter(lambda: file_handle.read(1024 * 1024), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def json_files(root: Path) -> dict[Path, Path]:
    """Return JSON files keyed by their path relative to ``root``."""

    return {path.relative_to(root): path for path in sorted(root.rglob("*.json"))}


def validate_source(source: Path, files: dict[Path, Path]) -> None:
    """Fail with an actionable message when canonical data is incomplete."""

    if not source.is_dir():
        raise FileNotFoundError(f"Canonical data directory does not exist: {source}")

    missing = sorted(REQUIRED_FILES - files.keys())
    if missing:
        formatted = ", ".join(path.as_posix() for path in missing)
        raise FileNotFoundError(f"Canonical data is missing required files: {formatted}")


def check_snapshot(source_files: dict[Path, Path], destination: Path) -> int:
    """Return zero only when every canonical JSON file has an identical snapshot."""

    mismatches: list[str] = []
    for relative_path, source_path in source_files.items():
        destination_path = destination / relative_path
        if not destination_path.is_file():
            mismatches.append(f"missing: {relative_path.as_posix()}")
        elif digest(source_path) != digest(destination_path):
            mismatches.append(f"changed: {relative_path.as_posix()}")

    if mismatches:
        print("Data snapshot is not synchronized:", file=sys.stderr)
        for mismatch in mismatches:
            print(f"  - {mismatch}", file=sys.stderr)
        print("Run: python scripts/sync_data.py", file=sys.stderr)
        return 1

    print(f"Data snapshot is synchronized ({len(source_files)} JSON files).")
    return 0


def sync_snapshot(source_files: dict[Path, Path], destination: Path) -> int:
    """Copy all canonical JSON files without deleting unrelated destination files."""

    for relative_path, source_path in source_files.items():
        destination_path = destination / relative_path
        destination_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_path, destination_path)

    print(f"Copied {len(source_files)} JSON files to {destination}.")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="verify the deploy snapshot without changing files",
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=DEFAULT_SOURCE,
        help=f"canonical data directory (default: {DEFAULT_SOURCE})",
    )
    parser.add_argument(
        "--destination",
        type=Path,
        default=DEFAULT_DESTINATION,
        help=f"snapshot directory (default: {DEFAULT_DESTINATION})",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source = args.source.resolve()
    destination = args.destination.resolve()

    if source == destination:
        print("Source and destination must be different.", file=sys.stderr)
        return 2

    try:
        source_files = json_files(source)
        validate_source(source, source_files)
    except FileNotFoundError as error:
        print(error, file=sys.stderr)
        return 2

    if args.check:
        return check_snapshot(source_files, destination)
    return sync_snapshot(source_files, destination)


if __name__ == "__main__":
    raise SystemExit(main())
