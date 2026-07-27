"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/common/Button";
import { ActualDecisionComparison } from "@/components/result/ActualDecisionComparison";
import { AlternativePlayer } from "@/components/result/AlternativePlayer";
import { BenefitList } from "@/components/result/BenefitList";
import { DecisionScore } from "@/components/result/DecisionScore";
import { DecisionSummary } from "@/components/result/DecisionSummary";
import { ImpactReport } from "@/components/result/ImpactReport";
import { RiskList } from "@/components/result/RiskList";
import type { Match, Player, Role, Scenario, StoredDecision } from "@/data/types";
import { evaluateBestRole } from "@/lib/decision/evaluateDecision";
import { clearDecision, loadDecision } from "@/lib/decision/storage";

export function ResultWorkspace({
  match,
  scenario,
  players,
  roles,
  nextScenarioId,
}: {
  match: Match;
  scenario: Scenario;
  players: Player[];
  roles: Role[];
  nextScenarioId?: string;
}) {
  const router = useRouter();
  const [decision, setDecision] = useState<StoredDecision | null | undefined>(undefined);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDecision(loadDecision(match.id, scenario.id));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [match.id, scenario.id]);

  const outgoing = players.find((player) => player.id === decision?.outPlayerId);
  const incoming = players.find((player) => player.id === decision?.inPlayerId);
  const role = roles.find((candidate) => candidate.roleId === decision?.roleId);
  const actualOut = players.find(
    (player) => player.id === scenario.actualDecision.outPlayerId,
  );
  const actualIn = players.find(
    (player) => player.id === scenario.actualDecision.inPlayerId,
  );

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

  if (decision === undefined) {
    return (
      <div className="panel grid min-h-80 place-items-center p-8 text-center">
        <div>
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#f4b860]" />
          <p className="mt-4 text-sm font-bold text-[#9ba5b2]">결정 기록을 불러오는 중입니다</p>
        </div>
      </div>
    );
  }

  if (!decision || !outgoing || !incoming || !role || !actualOut || !actualIn) {
    return (
      <section className="panel mx-auto max-w-xl p-8 text-center sm:p-12">
        <span className="number-tabular text-4xl font-black text-[#f4b860]">VAR</span>
        <h1 className="mt-5 text-2xl font-black tracking-[-.03em] text-white">
          확정된 결정이 없습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#9fa8b5]">
          결과 주소로 바로 들어왔거나 저장된 기록이 손상되었습니다. 전술 보드에서 교체,
          역할, 팀 지시를 확정하면 분석 리포트를 볼 수 있습니다.
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

  function replay() {
    clearDecision(match.id, scenario.id);
    router.push(`/matches/${match.id}/scenarios/${scenario.id}/tactics`);
  }

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <DecisionScore score={decision.score} />
        <DecisionSummary
          decision={decision}
          outgoing={outgoing}
          incoming={incoming}
          role={role}
        />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <BenefitList items={decision.explanation.benefits} />
        <RiskList
          risks={decision.explanation.risks}
          remedies={decision.explanation.remedies}
        />
        <ImpactReport before={decision.impactsBefore} after={decision.impactsAfter} />
        {alternative && (
          <AlternativePlayer
            player={alternative.player}
            role={alternative.role}
            score={alternative.score}
            selectedScore={decision.score}
          />
        )}
      </div>
      <div className="mt-5">
        <ActualDecisionComparison
          scenario={scenario}
          userOut={outgoing}
          userIn={incoming}
          actualOut={actualOut}
          actualIn={actualIn}
        />
      </div>
      <div className="mt-6 rounded-xl border border-[#75b9ff]/14 bg-[#75b9ff]/7 p-4 text-xs leading-5 text-[#a9bbcf]">
        <strong className="text-[#9acbff]">해석 한계</strong> · 이 점수는 실제 경기 결과를
        예측하지 않습니다. 공개된 경기 종료 후 데이터를 1–20으로 변환한 회고형 비교이며,
        짧은 출전 표본은 10.5에 가깝게 보정했습니다.
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
              href={`/matches/${match.id}/scenarios/${nextScenarioId}/briefing`}
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
