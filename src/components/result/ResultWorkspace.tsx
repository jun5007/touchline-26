"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/common/Badge";
import { Button, ButtonLink } from "@/components/common/Button";
import { ActualDecisionComparison } from "@/components/result/ActualDecisionComparison";
import { AlternativePlayer } from "@/components/result/AlternativePlayer";
import { BenefitList } from "@/components/result/BenefitList";
import { DecisionScore } from "@/components/result/DecisionScore";
import { DecisionSummary } from "@/components/result/DecisionSummary";
import { ImpactReport } from "@/components/result/ImpactReport";
import { RiskList } from "@/components/result/RiskList";
import type {
  DecisionScenarioContext,
  Match,
  Player,
  Role,
  Scenario,
  StoredDecision,
} from "@/data/types";
import {
  getDecisionScoreRelativeContext,
  type DecisionScoreDistribution,
} from "@/lib/decision/decisionScoreRelativeContext";
import {
  evaluateBestRole,
  evaluateDecision,
} from "@/lib/decision/evaluateDecision";
import { roleSupportsPlayer } from "@/lib/decision/positionCompatibility";
import { clearDecision, loadDecision } from "@/lib/decision/storage";

type RecoveryReason =
  | "missing"
  | "route-mismatch"
  | "team-mismatch"
  | "substitution-limit"
  | "duplicate-roster"
  | "invalid-selection"
  | "missing-player"
  | "invalid-role"
  | "evaluation-failed";

export interface RecalculatedDecision extends StoredDecision {
  score: number;
  riskPenalty: number;
  instructionFit: number;
  matchupFit: number;
  matchupReasons: string[];
  impactsBefore: Record<string, number | null>;
  impactsAfter: Record<string, number | null>;
  explanation: {
    benefits: string[];
    risks: string[];
    remedies: string[];
    summary: string;
  };
  breakdown: {
    preRiskScore: number;
    weights: {
      baseProfile: number;
      currentCondition: number;
      role: number;
      matchup: number;
    };
    baseProfile: {
      available: boolean;
      component: number;
      contribution: number;
      dataGrade: string;
      status: string;
      confidence: number;
    };
    tournamentForm: {
      available: boolean;
      adjustment: number;
      status: string;
      reliability: number;
      metricCoverage: number;
    };
    currentCondition: {
      available: boolean;
      component: number;
      contribution: number;
      energyEstimate: number | null;
    };
    role: {
      available: boolean;
      component: number;
      contribution: number;
    };
    teamInstruction: {
      adjustment: number;
    };
    matchup: {
      available: boolean;
      component: number;
      contribution: number;
    };
  };
}

export type DecisionResolution =
  | {
      status: "ready";
      decision: RecalculatedDecision;
      outgoing: Player;
      incoming: Player;
      role: Role;
    }
  | { status: "recovery"; reason: RecoveryReason };

function hasDuplicates(values: string[]) {
  return new Set(values).size !== values.length;
}

export function recalculateStoredDecision({
  stored,
  match,
  scenario,
  players,
  roles,
}: {
  stored: StoredDecision;
  match: Pick<Match, "id">;
  scenario: DecisionScenarioContext;
  players: Player[];
  roles: Role[];
}): DecisionResolution {
  if (
    stored.matchId !== match.id ||
    stored.scenarioId !== scenario.id ||
    scenario.matchId !== match.id
  ) {
    return { status: "recovery", reason: "route-mismatch" };
  }
  if (stored.selectedTeamId !== scenario.selectedTeamId) {
    return { status: "recovery", reason: "team-mismatch" };
  }

  if (
    !Number.isInteger(scenario.substitutionsRemaining) ||
    scenario.substitutionsRemaining <= 0
  ) {
    return { status: "recovery", reason: "substitution-limit" };
  }

  const lineupIds = scenario.currentLineup.map((spot) => spot.playerId);
  const benchIds = scenario.benchOptions;
  if (
    hasDuplicates(lineupIds) ||
    hasDuplicates(benchIds) ||
    lineupIds.some((playerId) => benchIds.includes(playerId))
  ) {
    return { status: "recovery", reason: "duplicate-roster" };
  }

  if (
    stored.outPlayerId === stored.inPlayerId ||
    !lineupIds.includes(stored.outPlayerId) ||
    !benchIds.includes(stored.inPlayerId)
  ) {
    return { status: "recovery", reason: "invalid-selection" };
  }

  const outgoingMatches = players.filter(
    (player) => player.id === stored.outPlayerId,
  );
  const incomingMatches = players.filter(
    (player) => player.id === stored.inPlayerId,
  );
  if (
    outgoingMatches.length !== 1 ||
    incomingMatches.length !== 1 ||
    outgoingMatches[0].teamId !== scenario.selectedTeamId ||
    incomingMatches[0].teamId !== scenario.selectedTeamId
  ) {
    return { status: "recovery", reason: "missing-player" };
  }

  const outgoing = outgoingMatches[0];
  const incoming = incomingMatches[0];
  const roleMatches = roles.filter((role) => role.roleId === stored.roleId);
  if (
    roleMatches.length !== 1 ||
    !roleSupportsPlayer(roleMatches[0], incoming)
  ) {
    return { status: "recovery", reason: "invalid-role" };
  }
  const role = roleMatches[0];

  try {
    const evaluation = evaluateDecision({
      outgoing,
      incoming,
      role,
      instructions: stored.instructions,
      scenario,
    });
    return {
      status: "ready",
      outgoing,
      incoming,
      role,
      decision: {
        ...stored,
        score: evaluation.fit.score,
        riskPenalty: evaluation.risk.totalPenalty,
        instructionFit: evaluation.instructionFit,
        matchupFit: evaluation.matchupFit,
        matchupReasons: [...evaluation.matchupReasons],
        impactsBefore: Object.fromEntries(
          Object.entries(evaluation.impacts).map(([key, value]) => [
            key,
            value.available ? value.before : null,
          ]),
        ),
        impactsAfter: Object.fromEntries(
          Object.entries(evaluation.impacts).map(([key, value]) => [
            key,
            value.available ? value.after : null,
          ]),
        ),
        explanation: {
          benefits: [...evaluation.explanation.benefits],
          risks: [...evaluation.explanation.risks],
          remedies: [...evaluation.explanation.mitigations],
          summary: evaluation.explanation.summary,
        },
        breakdown: {
          preRiskScore: evaluation.fit.preRiskScore,
          weights: {
            baseProfile: evaluation.fit.componentWeights.ability,
            currentCondition: evaluation.fit.componentWeights.fitness,
            role: evaluation.fit.componentWeights.role,
            matchup: evaluation.fit.componentWeights.matchup,
          },
          baseProfile: {
            available: evaluation.fit.componentAvailability.ability,
            component: evaluation.fit.components.ability,
            contribution: evaluation.fit.contributions.ability,
            dataGrade: incoming.baseProfile?.dataGrade ?? "—",
            status: incoming.baseProfile?.status ?? "상태 없음",
            confidence: incoming.confidence,
          },
          tournamentForm: {
            available:
              incoming.tournamentForm?.status === "complete" &&
              evaluation.fit.componentAvailability.ability,
            adjustment: evaluation.formAdjustments.incoming,
            status: incoming.tournamentForm?.status ?? "상태 없음",
            reliability: incoming.tournamentForm?.reliability ?? 0,
            metricCoverage: incoming.tournamentForm?.metricCoverage ?? 0,
          },
          currentCondition: {
            available: evaluation.fit.componentAvailability.fitness,
            component: evaluation.fit.components.fitness,
            contribution: evaluation.fit.contributions.fitness,
            energyEstimate: incoming.currentCondition?.energyEstimate ?? null,
          },
          role: {
            available: evaluation.fit.componentAvailability.role,
            component: evaluation.fit.components.role,
            contribution: evaluation.fit.contributions.role,
          },
          teamInstruction: {
            adjustment: evaluation.instructionFit,
          },
          matchup: {
            available: evaluation.fit.componentAvailability.matchup,
            component: evaluation.fit.components.matchup,
            contribution: evaluation.fit.contributions.matchup,
          },
        },
      },
    };
  } catch {
    return { status: "recovery", reason: "evaluation-failed" };
  }
}

const recoveryMessages: Record<RecoveryReason, string> = {
  missing:
    "결과 주소로 바로 들어왔거나 저장된 선택 기록이 없습니다. 전술 보드에서 결정을 다시 확정해 주세요.",
  "route-mismatch":
    "저장된 선택이 현재 경기 또는 미션과 일치하지 않습니다. 현재 미션 기준으로 다시 선택해 주세요.",
  "team-mismatch":
    "저장된 선택 국가가 현재 미션의 감독 관점과 일치하지 않습니다. 이 국가의 미션에서 다시 결정해 주세요.",
  "substitution-limit":
    "이 시점 기준 선택 가능한 교체 인원이 없어 저장된 결정을 복원할 수 없습니다. 미션 데이터를 확인해 주세요.",
  "duplicate-roster":
    "현재 명단에서 중복 선수가 발견되어 안전하게 계산할 수 없습니다. 전술 보드에서 명단을 다시 확인해 주세요.",
  "invalid-selection":
    "저장된 OUT·IN 선택이 현재 선발·벤치 명단과 일치하지 않습니다. 같은 선수를 중복 선택하지 않았는지 확인해 주세요.",
  "missing-player":
    "저장 후 선수 데이터가 변경되었거나 선수 ID가 유효하지 않습니다. 최신 데이터로 다시 선택해 주세요.",
  "invalid-role":
    "저장된 역할이 현재 투입 선수에게 허용되지 않습니다. 최신 역할 목록에서 다시 선택해 주세요.",
  "evaluation-failed":
    "현재 데이터로 결정을 안전하게 재계산하지 못했습니다. 전술 보드에서 선택을 다시 확인해 주세요.",
};

export function ResultWorkspace({
  match,
  scenario,
  players,
  roles,
  scoreDistribution,
  nextScenarioId,
  nextMatchId,
}: {
  match: Match;
  scenario: Scenario;
  players: Player[];
  roles: Role[];
  scoreDistribution?: DecisionScoreDistribution | null;
  nextScenarioId?: string;
  nextMatchId?: string;
}) {
  const router = useRouter();
  const [resolution, setResolution] = useState<DecisionResolution | undefined>(
    undefined,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadDecision(match.id, scenario.id);
      if (!stored) {
        setResolution({ status: "recovery", reason: "missing" });
        return;
      }
      const nextResolution = recalculateStoredDecision({
        stored,
        match,
        scenario,
        players,
        roles,
      });
      if (nextResolution.status === "recovery") {
        clearDecision(match.id, scenario.id);
      }
      setResolution(nextResolution);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [match, players, roles, scenario]);

  const decision = resolution?.status === "ready" ? resolution.decision : null;
  const outgoing = resolution?.status === "ready" ? resolution.outgoing : null;
  const incoming = resolution?.status === "ready" ? resolution.incoming : null;
  const role = resolution?.status === "ready" ? resolution.role : null;
  const scoreContext = decision
    ? getDecisionScoreRelativeContext(
        scoreDistribution ?? null,
        decision.score,
      )
    : null;
  const actualOut = players.find(
    (player) => player.id === scenario.actualDecision.outPlayerId,
  );
  const actualIn = players.find(
    (player) => player.id === scenario.actualDecision.inPlayerId,
  );
  const actualDecisionModel = useMemo(() => {
    if (!actualOut || !actualIn) return null;
    return evaluateBestRole({
      outgoing: actualOut,
      incoming: actualIn,
      roles,
      instructions: scenario.defaultInstructions,
      scenario,
    });
  }, [actualIn, actualOut, roles, scenario]);

  const alternative = useMemo(() => {
    if (!decision || !outgoing || !incoming) return null;
    const candidates = players.filter(
      (player) =>
        scenario.benchOptions.includes(player.id) && player.id !== incoming.id,
    );
    const evaluated = candidates.flatMap((player) => {
      const best = evaluateBestRole({
        outgoing,
        incoming: player,
        roles,
        instructions: decision.instructions,
        scenario,
      });
      if (!best) return [];
      return [
        {
          player,
          role: best.role,
          score: best.evaluation.fit.score,
        },
      ];
    });
    return evaluated.sort((left, right) => right.score - left.score)[0] ?? null;
  }, [decision, incoming, outgoing, players, roles, scenario]);

  if (resolution === undefined) {
    return (
      <div className="panel grid min-h-80 place-items-center p-8 text-center">
        <div>
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#f4b860]" />
          <p className="mt-4 text-sm font-bold text-[#9ba5b2]">결정 기록을 불러오는 중입니다</p>
        </div>
      </div>
    );
  }

  if (resolution.status === "recovery") {
    return (
      <section
        className="panel mx-auto max-w-xl p-8 text-center sm:p-12"
        role="alert"
        aria-live="polite"
      >
        <span className="number-tabular text-4xl font-black text-[#f4b860]">VAR</span>
        <h1 className="mt-5 text-2xl font-black tracking-[-.03em] text-white">
          결정을 다시 확인해 주세요
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#9fa8b5]">
          {recoveryMessages[resolution.reason]}
        </p>
        <p className="mt-3 text-xs leading-5 text-[#a8b1bf]">
          점수와 영향 분석은 브라우저에 저장하지 않으며, 현재 공식·파생 데이터로 매번 다시
          계산합니다.
        </p>
        <ButtonLink
          href={`/matches/${match.id}/scenarios/${scenario.id}/tactics`}
          className="mt-7"
        >
          전술 보드로 돌아가기
        </ButtonLink>
      </section>
    );
  }

  if (!decision || !outgoing || !incoming || !role) return null;

  function replay() {
    clearDecision(match.id, scenario.id);
    router.push(`/matches/${match.id}/scenarios/${scenario.id}/tactics`);
  }

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <DecisionSummary
          decision={decision}
          outgoing={outgoing}
          incoming={incoming}
          role={role}
        />
        <DecisionScore
          score={decision.score}
          scoreContext={scoreContext}
        />
      </div>
      <section className="panel mt-5 p-5 sm:p-6" aria-labelledby="breakdown-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Tactical decision fit</p>
            <h2 id="breakdown-title" className="mt-2 text-xl font-black text-white">
              전술 선택 적합도 {Math.round(decision.score)}점
            </h2>
            <p className="mt-2 text-xs font-bold leading-5 text-[#d6bd91]">
              승률이나 선수 절대 능력 평가가 아닙니다.
            </p>
          </div>
          <Badge tone="blue">누락 구성요소 자동 재가중</Badge>
        </div>
        <details className="mt-5" open>
          <summary className="cursor-pointer text-sm font-black text-[#9acbff]">
            점수 구성 보기
          </summary>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[
              {
                label: "역할·팀 지시",
                value: `${Math.round(decision.breakdown.weights.role * 100)}% · 기여 ${decision.breakdown.role.contribution}`,
                note: `역할 구성값 ${decision.breakdown.role.component}/100 · 팀 지시 ${decision.breakdown.teamInstruction.adjustment > 0 ? "+" : ""}${decision.breakdown.teamInstruction.adjustment}`,
                available: decision.breakdown.role.available,
              },
              {
                label: "컨디션 추정",
                value: `${Math.round(decision.breakdown.weights.currentCondition * 100)}% · 기여 ${decision.breakdown.currentCondition.contribution}`,
                note:
                  decision.breakdown.currentCondition.energyEstimate === null
                    ? "출전 시간 기반 추정 없음"
                    : `출전 시간 기반 컨디션 추정 ${decision.breakdown.currentCondition.energyEstimate}`,
                available: decision.breakdown.currentCondition.available,
              },
              {
                label: "상대 전술 매치업",
                value: `${Math.round(decision.breakdown.weights.matchup * 100)}% · 기여 ${decision.breakdown.matchup.contribution}`,
                note: `구성값 ${decision.breakdown.matchup.component}/100${decision.matchupReasons.length > 0 ? ` · ${decision.matchupReasons.join(" · ")}` : ""}`,
                available: decision.breakdown.matchup.available,
              },
              {
                label: "선수 BASE 능력치",
                value: decision.breakdown.baseProfile.available
                  ? `${Math.round(decision.breakdown.weights.baseProfile * 100)}% · 기여 ${decision.breakdown.baseProfile.contribution}`
                  : "미산정 · 평가 제외",
                note: decision.breakdown.baseProfile.available
                  ? "검증 가능한 선수별 성과 지표 사용"
                  : "최근 1년 세부 성과 데이터 미산정",
                available: decision.breakdown.baseProfile.available,
              },
              {
                label: "Tournament Form",
                value: decision.breakdown.tournamentForm.available
                  ? `${decision.breakdown.tournamentForm.adjustment >= 0 ? "+" : ""}${decision.breakdown.tournamentForm.adjustment}`
                  : "현재 미적용",
                note: "선수별 성과 지표가 없어 수치 조정에 사용하지 않음",
                available: decision.breakdown.tournamentForm.available,
              },
              {
                label: "위험 패널티",
                value: `−${decision.riskPenalty}점`,
                note: `가용 구성요소 합계 ${decision.breakdown.preRiskScore}점에서 차감`,
                available: true,
              },
            ].map((item) => (
              <div key={item.label} className="panel-soft p-4">
                <dt className="text-[11px] font-black tracking-[.1em] text-[#929dab]">
                  {item.label}
                </dt>
                <dd
                  className={`number-tabular mt-2 text-lg font-black ${
                    item.available ? "text-white" : "text-[#f4b860]"
                  }`}
                >
                  {item.value}
                </dd>
                <p className="mt-1 text-xs leading-5 text-[#8994a3]">
                  {item.note}
                </p>
              </div>
            ))}
          </dl>
        </details>
      </section>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <BenefitList items={decision.explanation.benefits} />
        <RiskList
          risks={decision.explanation.risks}
          remedies={decision.explanation.remedies}
        />
        {alternative && (
          <AlternativePlayer
            player={alternative.player}
            role={alternative.role}
            score={alternative.score}
            selectedScore={decision.score}
          />
        )}
        <ImpactReport before={decision.impactsBefore} after={decision.impactsAfter} />
      </div>
      {actualOut && actualIn ? (
        <div className="mt-5">
          <ActualDecisionComparison
            scenario={scenario}
            userOut={outgoing}
            userIn={incoming}
            actualOut={actualOut}
            actualIn={actualIn}
            userRiskPenalty={decision.riskPenalty}
            userRisks={decision.explanation.risks}
            actualRiskPenalty={actualDecisionModel?.evaluation.risk.totalPenalty}
            actualRisks={actualDecisionModel?.evaluation.explanation.risks}
          />
        </div>
      ) : (
        <div
          className="mt-5 rounded-xl border border-[#f4b860]/20 bg-[#f4b860]/7 p-4 text-sm leading-6 text-[#d6bd91]"
          role="status"
        >
          실제 감독 선택 비교 데이터가 현재 선수 명단과 일치하지 않아 이 항목만 표시하지
          않습니다. 당신의 결정 점수는 현재 데이터로 정상 재계산했습니다.
        </div>
      )}
      <section className="panel mt-5 overflow-hidden" aria-labelledby="post-match-title">
        <div className="border-b border-white/[.07] bg-[#65d89a]/6 p-5 sm:p-6">
          <p className="text-xs font-black tracking-[.12em] text-[#82e6ac]">
            OFFICIAL FACTS · 결과 전용
          </p>
          <h2 id="post-match-title" className="mt-2 text-xl font-black text-white">
            경기 종료 후 확인된 사실
          </h2>
          <p className="mt-2 text-xs leading-5 text-[#9fa9b7]">
            다음 사실은 전술 선택 적합도 계산에 사용하지 않았습니다.
          </p>
        </div>
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[auto_1fr] lg:items-start">
          <p className="number-tabular text-2xl font-black text-white">
            {match.homeTeam.name}{" "}
            <span className="text-[#f4b860]">
              {match.finalScore.home}–{match.finalScore.away}
            </span>{" "}
            {match.awayTeam.name}
          </p>
          {scenario.resultFacts?.eventsAfterScenario.length ? (
            <ul className="grid gap-2 text-sm leading-6 text-[#b8c1cd]">
              {scenario.resultFacts.eventsAfterScenario.map((event, index) => (
                <li key={`${event.minute}-${event.label}-${index}`}>
                  <span className="number-tabular font-black text-[#82e6ac]">
                    {event.minute}′
                  </span>{" "}
                  {event.label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-6 text-[#9fa9b7]">
              이 미션 이후 별도로 표시할 검증 이벤트가 없습니다.
            </p>
          )}
        </div>
      </section>
      <div className="mt-6 flex flex-wrap gap-2" aria-label="결과 데이터 구분">
        <Badge tone="green">공식 경기 사실 · 명단·교체·스코어</Badge>
        <Badge tone="gold">출전 시간 기반 파생값 · 컨디션 추정</Badge>
        <Badge tone="blue">자체 전술 모델 · 적합도·위험</Badge>
        <Badge>선수 BASE 능력 · 현재 미산정</Badge>
      </div>
      <div className="mt-3 rounded-xl border border-[#75b9ff]/14 bg-[#75b9ff]/7 p-4 text-xs leading-5 text-[#a9bbcf]">
        <strong className="text-[#9acbff]">해석 한계</strong> · 이 점수는 실제 경기 결과를
        예측하지 않습니다. 검증할 수 없는 최근 365일 능력치는 null로 제외하며, 현재
        컨디션·역할 호환·매치업·팀 지시와 위험만 가용 근거에 맞춰 재가중합니다.
        점수·위험·설명은 저장된 값을 재사용하지 않고 현재 코드와 데이터로 다시
        계산합니다.
      </div>
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="secondary" onClick={replay}>
          ↺ 같은 미션 다시 하기
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/about-data" variant="ghost">
            계산 근거 보기
          </ButtonLink>
          {nextScenarioId ? (
            <ButtonLink
              href={`/matches/${nextMatchId ?? match.id}/scenarios/${nextScenarioId}/briefing`}
            >
              다음 미션 <span aria-hidden="true">→</span>
            </ButtonLink>
          ) : (
            <ButtonLink href={`/matches/${match.id}`}>
              미션 선택으로 <span aria-hidden="true">→</span>
            </ButtonLink>
          )}
        </div>
      </div>
    </div>
  );
}
