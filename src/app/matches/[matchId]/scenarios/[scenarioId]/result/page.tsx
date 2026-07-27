import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StepIndicator } from "@/components/layout/StepIndicator";
import { ResultWorkspace } from "@/components/result/ResultWorkspace";
import {
  getMatch,
  getNextScenario,
  getPlayers,
  getRoles,
  getScenario,
} from "@/data/repository";

export const metadata: Metadata = { title: "결정 분석" };

export default async function ResultPage({
  params,
}: {
  params: Promise<{ matchId: string; scenarioId: string }>;
}) {
  const { matchId, scenarioId } = await params;
  const match = getMatch(matchId);
  const scenario = getScenario(matchId, scenarioId);
  if (!match || !scenario) notFound();
  const nextScenario = getNextScenario(scenario);

  return (
    <div className="page-wrap py-10 sm:py-14">
      <StepIndicator current="result" matchId={matchId} scenarioId={scenarioId} />
      <header className="mt-10 mb-7">
        <p className="eyebrow">Decision report</p>
        <h1 className="text-balance mt-4 text-3xl font-black tracking-[-.045em] text-white sm:text-5xl">
          당신의 선택에는
          <br />
          어떤 축구가 있었습니까?
        </h1>
      </header>
      <ResultWorkspace
        match={match}
        scenario={scenario}
        players={getPlayers()}
        roles={getRoles()}
        nextScenarioId={nextScenario?.id}
      />
    </div>
  );
}

