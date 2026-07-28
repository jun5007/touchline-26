import { DndContext } from "@dnd-kit/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BenchPlayerCard } from "@/components/tactics/BenchPlayerCard";
import { BenchPanel } from "@/components/tactics/BenchPanel";
import { getPlayersForScenario, getScenario } from "@/data/repository";

describe("BenchPlayerCard", () => {
  it("shows match-state evidence without empty BASE noise", () => {
    const scenario = getScenario("kor-cze-2026", "level-69-find-nine");
    if (!scenario) throw new Error("Scenario fixture is missing");
    const player = getPlayersForScenario(scenario).find(
      (candidate) => candidate.id === "oh-hyeongyu",
    );
    if (!player) throw new Error("Bench player fixture is missing");

    render(
      <DndContext>
        <BenchPlayerCard
          player={player}
          selected={false}
          fitScore={63}
          onSelect={vi.fn()}
        />
      </DndContext>,
    );

    expect(screen.getByText("전술 선택 적합도 63")).toBeInTheDocument();
    expect(screen.getByText("승률·절대 능력치 아님")).toBeInTheDocument();
    expect(screen.getByText(/공식 등록 FW · 공격수/)).toBeInTheDocument();
    expect(screen.getByText("벤치 · IN 후보")).toBeInTheDocument();
    expect(screen.getByText("세부 위치 후보")).toBeInTheDocument();
    expect(screen.getByText("역할 후보군")).toBeInTheDocument();
    expect(screen.getByText(/출전 시간 기반 컨디션 추정/)).toBeInTheDocument();
    expect(
      screen.queryByText(/공식 명단 확인 · 성과 지표 미확보/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/BASE D/)).not.toBeInTheDocument();
    expect(screen.queryByText(/신뢰도 0%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/능력치 0\/8/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Form 0/)).not.toBeInTheDocument();
  });

  it("consolidates missing performance-data guidance once above the bench", () => {
    const scenario = getScenario("kor-cze-2026", "level-69-find-nine");
    if (!scenario) throw new Error("Scenario fixture is missing");
    const players = getPlayersForScenario(scenario)
      .filter((player) => scenario.benchOptions.includes(player.id))
      .slice(0, 2);

    render(
      <DndContext>
        <BenchPanel
          players={players}
          selectedId={null}
          fitScores={{}}
          onSelect={vi.fn()}
        />
      </DndContext>,
    );

    expect(
      screen.getByText(/비교 가능한 최근 1년 선수별 성과 지표는 미산정/),
    ).toHaveAttribute("role", "status");
    expect(
      screen.getAllByText(/최근 1년 선수별 성과 지표는 미산정/),
    ).toHaveLength(1);
  });
});
