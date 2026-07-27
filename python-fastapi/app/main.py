"""FastAPI entry point for the Python edition of TOUCHLINE 26."""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .config import settings
from .data_loader import DataRepository, get_repository
from .models import EvaluateRequest, EvaluateResponse
from .scoring import (
    DecisionNotFoundError,
    DecisionValidationError,
    evaluate_decision,
)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="실제 경기 데이터 기반 월드컵 전술 의사결정 시뮬레이터",
)
templates = Jinja2Templates(directory=str(settings.templates_dir))
if settings.static_dir.is_dir():
    app.mount("/static", StaticFiles(directory=str(settings.static_dir)), name="static")


@app.exception_handler(404)
async def not_found(request: Request, exception: HTTPException):
    detail = getattr(exception, "detail", "요청한 페이지를 찾을 수 없습니다.")
    if request.url.path.startswith("/api/"):
        return JSONResponse(status_code=404, content={"detail": detail})
    return templates.TemplateResponse(
        request=request,
        name="404.html",
        context={"request": request},
        status_code=404,
    )


def _repository() -> DataRepository:
    try:
        return get_repository()
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


def _render(request: Request, name: str, **context: Any):
    return templates.TemplateResponse(
        request=request,
        name=name,
        context={"request": request, **context},
    )


def _match_or_404(repository: DataRepository, match_id: str) -> dict[str, Any]:
    match = repository.get_match(match_id)
    if match is None:
        raise HTTPException(status_code=404, detail="경기를 찾을 수 없습니다.")
    return match


def _scenario_or_404(repository: DataRepository, match_id: str, scenario_id: str) -> dict[str, Any]:
    scenario = repository.get_scenario(match_id, scenario_id)
    if scenario is None:
        raise HTTPException(status_code=404, detail="시나리오를 찾을 수 없습니다.")
    return scenario


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def home(request: Request):
    repository = _repository()
    match = repository.matches[0] if repository.matches else None
    scenarios = repository.scenarios_for_match(match["id"]) if match else []
    return _render(request, "home.html", match=match, scenarios=scenarios)


@app.get("/matches", response_class=HTMLResponse, include_in_schema=False)
def matches_page(request: Request):
    repository = _repository()
    return _render(request, "matches.html", matches=repository.matches)


@app.get("/matches/{match_id}", response_class=HTMLResponse, include_in_schema=False)
def match_detail(request: Request, match_id: str):
    repository = _repository()
    match = _match_or_404(repository, match_id)
    return _render(
        request,
        "match_detail.html",
        match=match,
        scenarios=repository.scenarios_for_match(match_id),
    )


@app.get(
    "/matches/{match_id}/scenarios/{scenario_id}/briefing",
    response_class=HTMLResponse,
    include_in_schema=False,
)
def briefing(request: Request, match_id: str, scenario_id: str):
    repository = _repository()
    match = _match_or_404(repository, match_id)
    scenario = _scenario_or_404(repository, match_id, scenario_id)
    return _render(
        request,
        "briefing.html",
        match=match,
        scenario=scenario,
    )


@app.get(
    "/matches/{match_id}/scenarios/{scenario_id}/tactics",
    response_class=HTMLResponse,
    include_in_schema=False,
)
def tactics(request: Request, match_id: str, scenario_id: str):
    repository = _repository()
    match = _match_or_404(repository, match_id)
    scenario = _scenario_or_404(repository, match_id, scenario_id)
    return _render(
        request,
        "tactics.html",
        match=match,
        scenario=scenario,
        lineup_players=repository.lineup_players(scenario),
        bench_players=repository.bench_players(scenario),
        roles=repository.roles,
        instructions=repository.instructions,
    )


@app.get(
    "/matches/{match_id}/scenarios/{scenario_id}/result",
    response_class=HTMLResponse,
    include_in_schema=False,
)
def result(request: Request, match_id: str, scenario_id: str):
    repository = _repository()
    match = _match_or_404(repository, match_id)
    scenario = _scenario_or_404(repository, match_id, scenario_id)
    return _render(
        request,
        "result.html",
        match=match,
        scenario=scenario,
    )


@app.get("/about-data", response_class=HTMLResponse, include_in_schema=False)
def about_data(request: Request):
    repository = _repository()
    sources: list[dict[str, Any]] = []
    seen_urls: set[str] = set()
    for match in repository.matches:
        for source in match.get("dataSources", []):
            if source["sourceUrl"] not in seen_urls:
                seen_urls.add(source["sourceUrl"])
                sources.append(source)
    return _render(
        request,
        "about_data.html",
        matches=repository.matches,
        sources=sources,
        result_templates=repository.result_templates,
        data_root=repository.data_root,
    )


@app.get("/api/health", tags=["system"])
def api_health() -> dict[str, Any]:
    repository = _repository()
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "matches": len(repository.matches),
        "scenarios": len(repository.scenarios),
    }


@app.get("/api/catalog", tags=["catalog"])
def api_catalog() -> dict[str, Any]:
    repository = _repository()
    return {
        "matches": repository.matches,
        "scenarios": repository.scenarios,
        "players": repository.players,
        "roles": repository.roles,
        "instructions": repository.instructions,
        "resultTemplates": repository.result_templates,
    }


@app.get(
    "/api/matches/{match_id}/scenarios/{scenario_id}",
    tags=["catalog"],
)
def api_scenario(match_id: str, scenario_id: str) -> dict[str, Any]:
    repository = _repository()
    match = _match_or_404(repository, match_id)
    scenario = _scenario_or_404(repository, match_id, scenario_id)
    return {
        "match": match,
        "scenario": scenario,
        "lineupPlayers": repository.lineup_players(scenario),
        "benchPlayers": repository.bench_players(scenario),
        "roles": repository.roles,
        "instructions": repository.instructions,
    }


@app.post(
    "/api/evaluate",
    response_model=EvaluateResponse,
    tags=["evaluation"],
)
def api_evaluate(decision: EvaluateRequest) -> dict[str, Any]:
    repository = _repository()
    payload = decision.model_dump() if hasattr(decision, "model_dump") else decision.dict()
    try:
        return evaluate_decision(repository, payload)
    except DecisionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except DecisionValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
