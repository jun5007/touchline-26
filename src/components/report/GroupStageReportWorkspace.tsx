"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/common/Badge";
import { Button, ButtonLink } from "@/components/common/Button";
import { recalculateStoredDecision } from "@/components/result/ResultWorkspace";
import type {
  DecisionScenarioContext,
  Match,
  Player,
  Role,
  TacticalInstructions,
} from "@/data/types";
import {
  clearDecision,
  DECISION_STORAGE_EVENT,
  loadDecisionResult,
} from "@/lib/decision/storage";
import {
  aggregateGroupStageScores,
  calculateManagerTendency,
  summarizeReportHighlights,
  type RecalculatedReportDecision,
} from "@/lib/report";

export interface ReportScenarioModel {
  scenario: DecisionScenarioContext & { title: string };
  players: Player[];
}

export interface ReportMatchModel {
  match: Pick<Match, "id" | "matchNumber" | "date">;
  opponentName: string;
  opponentCode: string;
  scoreFor: number;
  scoreAgainst: number;
  scenarios: ReportScenarioModel[];
}

interface ResolvedReportDecision extends RecalculatedReportDecision {
  outName: string;
  inName: string;
  roleName: string;
  scenarioTitle: string;
}

interface ReportState {
  decisions: ResolvedReportDecision[];
  invalidCount: number;
}

const axisLabels = {
  aggression: "공격성",
  stability: "안정성",
  pressing: "압박 성향",
  control: "점유·통제",
  width: "측면 활용",
  central: "중앙 집중",
  riskTaking: "위험 감수",
} as const;

const instructionLabels: {
  [Key in keyof TacticalInstructions]: Record<TacticalInstructions[Key], string>;
} = {
  attackDirection: {
    left: "왼쪽",
    centre: "중앙",
    right: "오른쪽",
    balanced: "균형",
  },
  pressing: {
    low: "낮은 압박",
    medium: "보통 압박",
    high: "높은 압박",
  },
  defensiveLine: {
    low: "낮은 라인",
    medium: "보통 라인",
    high: "높은 라인",
  },
  mentality: {
    safe: "안정",
    balanced: "균형",
    attacking: "공격",
  },
};

const statusLabels = {
  "not-started": "시작 전",
  "in-progress": "일부 완료",
  complete: "경기 완료",
} as const;

function instructionLabel<Key extends keyof TacticalInstructions>(
  key: Key,
  value: TacticalInstructions[Key],
) {
  return (instructionLabels[key] as Record<string, string>)[value];
}

function decisionKey(matchId: string, scenarioId: string) {
  return `${matchId}:${scenarioId}`;
}

export function GroupStageReportWorkspace({
  team,
  matches,
  roles,
}: {
  team: {
    id: string;
    code: string;
    nameKo: string;
    standing: {
      position: number;
      points: number;
      goalDifference: number;
    };
  };
  matches: ReportMatchModel[];
  roles: Role[];
}) {
  const router = useRouter();
  const [state, setState] = useState<ReportState>();

  const rebuild = useCallback(() => {
    const decisions: ResolvedReportDecision[] = [];
    let invalidCount = 0;

    for (const reportMatch of matches) {
      for (const model of reportMatch.scenarios) {
        const loaded = loadDecisionResult(
          reportMatch.match.id,
          model.scenario.id,
        );
        if (loaded.status === "missing") continue;
        if (loaded.status === "invalid") {
          invalidCount += 1;
          continue;
        }
        if (loaded.decision.selectedTeamId !== team.id) {
          invalidCount += 1;
          clearDecision(reportMatch.match.id, model.scenario.id);
          continue;
        }

        const resolution = recalculateStoredDecision({
          stored: loaded.decision,
          match: reportMatch.match,
          scenario: model.scenario,
          players: model.players,
          roles,
        });
        if (resolution.status === "recovery") {
          invalidCount += 1;
          clearDecision(reportMatch.match.id, model.scenario.id);
          continue;
        }

        decisions.push({
          matchId: reportMatch.match.id,
          scenarioId: model.scenario.id,
          score: resolution.decision.score,
          riskPenalty: resolution.decision.riskPenalty,
          roleId: resolution.decision.roleId,
          instructions: resolution.decision.instructions,
          outName: resolution.outgoing.name,
          inName: resolution.incoming.name,
          roleName: resolution.role.name,
          scenarioTitle: model.scenario.title,
        });
      }
    }

    setState({ decisions, invalidCount });
  }, [matches, roles, team.id]);

  useEffect(() => {
    const timer = window.setTimeout(rebuild, 0);
    window.addEventListener("storage", rebuild);
    window.addEventListener(DECISION_STORAGE_EVENT, rebuild);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", rebuild);
      window.removeEventListener(DECISION_STORAGE_EVENT, rebuild);
    };
  }, [rebuild]);

  const report = useMemo(
    () =>
      aggregateGroupStageScores(
        matches.map((reportMatch) => ({
          matchId: reportMatch.match.id,
          scenarioIds: reportMatch.scenarios.map(
            ({ scenario }) => scenario.id,
          ),
        })),
        state?.decisions ?? [],
      ),
    [matches, state?.decisions],
  );
  const highlights = useMemo(
    () => summarizeReportHighlights(state?.decisions ?? []),
    [state?.decisions],
  );
  const tendency = useMemo(
    () => calculateManagerTendency(state?.decisions ?? []),
    [state?.decisions],
  );
  const decisionsByKey = useMemo(
    () =>
      new Map(
        (state?.decisions ?? []).map((decision) => [
          decisionKey(decision.matchId, decision.scenarioId),
          decision,
        ]),
      ),
    [state?.decisions],
  );
  const roleById = useMemo(
    () => new Map(roles.map((role) => [role.roleId, role.name])),
    [roles],
  );

  function replayAll() {
    if (
      !window.confirm(
        `${team.nameKo}의 저장된 감독 결정을 지우고 첫 미션부터 다시 시작할까요?`,
      )
    ) {
      return;
    }
    for (const reportMatch of matches) {
      for (const { scenario } of reportMatch.scenarios) {
        clearDecision(reportMatch.match.id, scenario.id);
      }
    }
    const first = matches[0]?.scenarios[0]?.scenario;
    if (first) {
      router.push(
        `/matches/${first.matchId}/scenarios/${first.id}/briefing`,
      );
    }
  }

  if (!state) {
    return (
      <div className="panel grid min-h-72 place-items-center p-8 text-center">
        <div>
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#f4b860]" />
          <p className="mt-4 text-sm font-bold text-[#9ba5b2]">
            저장된 결정을 현재 데이터로 다시 계산하고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  const highest = highlights.highestRatedDecision
    ? decisionsByKey.get(
        decisionKey(
          highlights.highestRatedDecision.matchId,
          highlights.highestRatedDecision.scenarioId,
        ),
      )
    : undefined;
  const highestRisk = highlights.highestRiskDecision
    ? decisionsByKey.get(
        decisionKey(
          highlights.highestRiskDecision.matchId,
          highlights.highestRiskDecision.scenarioId,
        ),
      )
    : undefined;

  return (
    <div>
      {state.invalidCount > 0 && (
        <div
          className="mb-5 rounded-xl border border-[#ff806d]/25 bg-[#ff806d]/8 p-4 text-sm leading-6 text-[#e8b2aa]"
          role="status"
        >
          손상되었거나 현재 팀·명단·역할과 맞지 않는 저장 결정{" "}
          {state.invalidCount}건을 제외했습니다. 점수는 저장값을 신뢰하지 않고 현재
          코드와 데이터로 다시 계산합니다.
        </div>
      )}

      <section className="panel overflow-hidden">
        <div className="grid gap-6 bg-gradient-to-br from-[#0c6547]/24 to-transparent p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">{team.code} · 선택 국가</Badge>
              <Badge tone={report.allMatchesComplete ? "green" : "gold"}>
                {report.allMatchesComplete ? "조별리그 완료" : "진행 중"}
              </Badge>
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-[-.04em] text-white sm:text-5xl">
              {team.nameKo} 조별리그 감독 리포트
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#aab4c1]">
              공식 경기 결과는 바뀌지 않습니다. 아래 감독 점수와 성향은 저장한
              교체·역할·팀 지시를 현재 평가 함수로 재계산한 자체 분석입니다.
            </p>
          </div>
          <div className="panel-soft min-w-52 p-5 text-center">
            <p className="text-xs font-black tracking-[.12em] text-[#f4b860]">
              GROUP-STAGE SCORE
            </p>
            <p className="number-tabular mt-2 text-5xl font-black text-white">
              {report.overallScore ?? "—"}
            </p>
            <p className="mt-2 text-xs leading-5 text-[#929dab]">
              {report.allMatchesComplete
                ? "세 경기 점수를 동일 비중 평균"
                : "3경기를 모두 완료하면 전체 평균 산정"}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-2 border-t border-white/[.07] sm:grid-cols-4">
          {[
            ["공식 A조 순위", `${team.standing.position}위`],
            ["실제 승점", `${team.standing.points}점`],
            [
              "실제 골득실",
              `${team.standing.goalDifference > 0 ? "+" : ""}${team.standing.goalDifference}`,
            ],
            [
              "진행",
              `${report.completedMissionCount}/${report.totalMissionCount} 미션`,
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border-r border-white/[.07] p-4 text-center last:border-r-0"
            >
              <dt className="text-[11px] font-bold text-[#8f99a8]">{label}</dt>
              <dd className="number-tabular mt-1 text-lg font-black text-white">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-8" aria-labelledby="match-report-title">
        <div>
          <p className="eyebrow">Equal match weighting</p>
          <h2
            id="match-report-title"
            className="mt-2 text-2xl font-black text-white"
          >
            경기별 감독 점수
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#9fa9b7]">
            한 경기에 미션이 여러 개면 먼저 그 경기 안에서 평균하고, 세 경기의
            완성된 matchScore를 각각 1/3 비중으로 평균합니다.
          </p>
        </div>
        <div className="mt-5 grid gap-4">
          {matches.map((reportMatch, index) => {
            const score = report.matches[index];
            return (
              <article key={reportMatch.match.id} className="panel p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={score.status === "complete" ? "green" : "neutral"}>
                        {statusLabels[score.status]}
                      </Badge>
                      <span className="text-xs font-bold text-[#8f99a8]">
                        MATCH {reportMatch.match.matchNumber}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-black text-white">
                      {team.nameKo} vs {reportMatch.opponentName}
                    </h3>
                    <p className="mt-1 text-xs text-[#8f99a8]">
                      {reportMatch.match.date.replaceAll("-", ".")} ·{" "}
                      {reportMatch.opponentCode}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center sm:min-w-64">
                    <div className="panel-soft p-3">
                      <p className="text-xs font-bold text-[#8f99a8]">
                        공식 결과
                      </p>
                      <p className="number-tabular mt-1 text-xl font-black text-white">
                        {reportMatch.scoreFor}:{reportMatch.scoreAgainst}
                      </p>
                    </div>
                    <div className="panel-soft p-3">
                      <p className="text-xs font-bold text-[#8f99a8]">
                        감독 점수
                      </p>
                      <p className="number-tabular mt-1 text-xl font-black text-[#f4b860]">
                        {score.matchScore ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  {reportMatch.scenarios.map(({ scenario }) => {
                    const decision = decisionsByKey.get(
                      decisionKey(reportMatch.match.id, scenario.id),
                    );
                    return (
                      <div
                        key={scenario.id}
                        className="panel-soft flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-white">
                            {scenario.minute}′ · {scenario.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#909baa]">
                            {decision
                              ? `${decision.outName} OUT → ${decision.inName} IN · ${decision.roleName}`
                              : "아직 결정 없음"}
                          </p>
                        </div>
                        {decision ? (
                          <Badge tone="gold">적합도 {decision.score}점</Badge>
                        ) : (
                          <ButtonLink
                            href={`/matches/${scenario.matchId}/scenarios/${scenario.id}/briefing`}
                            variant="ghost"
                            className="min-h-9 px-3 py-2"
                          >
                            미션 시작
                          </ButtonLink>
                        )}
                      </div>
                    );
                  })}
                </div>
                {score.status === "in-progress" && (
                  <p className="mt-3 text-xs leading-5 text-[#d5bd91]">
                    현재 경기 점수는 완료 미션 기준 임시 평균입니다. 모든 미션을
                    완료하기 전에는 조별리그 전체 평균에 포함하지 않습니다.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <article className="panel p-5 sm:p-6">
          <p className="eyebrow">Decision highlights</p>
          <h2 className="mt-2 text-xl font-black text-white">결정 하이라이트</h2>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="panel-soft p-4">
              <dt className="text-xs font-black text-[#82e6ac]">
                가장 높은 평가
              </dt>
              <dd className="mt-2 leading-6 text-[#d5dbe3]">
                {highest
                  ? `${highest.scenarioTitle} · ${highest.score}점`
                  : "완료한 결정 없음"}
              </dd>
            </div>
            <div className="panel-soft p-4">
              <dt className="text-xs font-black text-[#ff9e90]">
                가장 큰 위험 패널티
              </dt>
              <dd className="mt-2 leading-6 text-[#d5dbe3]">
                {highestRisk
                  ? `${highestRisk.scenarioTitle} · −${highestRisk.riskPenalty}점`
                  : "완료한 결정 없음"}
              </dd>
            </div>
            <div className="panel-soft p-4">
              <dt className="text-xs font-black text-[#9acbff]">
                가장 자주 선택한 역할
              </dt>
              <dd className="mt-2 leading-6 text-[#d5dbe3]">
                {highlights.mostFrequentRole
                  ? `${roleById.get(highlights.mostFrequentRole.value) ?? highlights.mostFrequentRole.value} · ${highlights.mostFrequentRole.count}회`
                  : "완료한 결정 없음"}
              </dd>
            </div>
            <div className="panel-soft p-4">
              <dt className="text-xs font-black text-[#f4b860]">
                가장 자주 선택한 팀 지시
              </dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {(
                  Object.keys(
                    highlights.mostFrequentInstructions,
                  ) as Array<keyof TacticalInstructions>
                ).map((key) => {
                  const stat = highlights.mostFrequentInstructions[key];
                  return stat ? (
                    <Badge key={key}>
                      {instructionLabel(key, stat.value)} · {stat.count}회
                    </Badge>
                  ) : null;
                })}
                {!highlights.mostFrequentInstructions.mentality && (
                  <span className="text-[#9fa9b7]">완료한 결정 없음</span>
                )}
              </dd>
            </div>
          </dl>
        </article>

        <article className="panel p-5 sm:p-6">
          <p className="eyebrow">Manager tendency</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-white">감독 성향</h2>
            <Badge tone="gold">{tendency.label}</Badge>
          </div>
          <div className="mt-5 grid gap-3">
            {(
              Object.keys(axisLabels) as Array<keyof typeof axisLabels>
            ).map((axis) => (
              <div key={axis}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#aab4c1]">
                    {axisLabels[axis]}
                  </span>
                  <span className="number-tabular font-black text-white">
                    {tendency.axes[axis]}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[.07]">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-[#0d6a49] to-[#65d89a]"
                    style={{ width: `${tendency.axes[axis]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-xl border border-[#75b9ff]/14 bg-[#75b9ff]/7 p-3 text-xs leading-5 text-[#a9bbcf]">
            {tendency.note}
          </p>
        </article>
      </section>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="danger" onClick={replayAll}>
          ↺ 이 국가 다시 플레이
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/teams/${team.id}`} variant="secondary">
            팀 여정으로
          </ButtonLink>
          <ButtonLink href="/teams">다른 국가 선택</ButtonLink>
        </div>
      </div>
    </div>
  );
}
