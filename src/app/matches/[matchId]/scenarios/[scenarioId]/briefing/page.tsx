import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/common/Button";
import { StepIndicator } from "@/components/layout/StepIndicator";
import { MissionBriefing } from "@/components/match/MissionBriefing";
import { getMatch, getScenario } from "@/data/repository";

export const metadata: Metadata = { title: "미션 브리핑" };

export default async function BriefingPage({
  params,
}: {
  params: Promise<{ matchId: string; scenarioId: string }>;
}) {
  const { matchId, scenarioId } = await params;
  const match = getMatch(matchId);
  const scenario = getScenario(matchId, scenarioId);
  if (!match || !scenario) notFound();

  return (
    <div className="page-wrap py-10 sm:py-14">
      <StepIndicator current="briefing" matchId={matchId} scenarioId={scenarioId} />
      <div className="mt-10">
        <MissionBriefing match={match} scenario={scenario} />
      </div>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <ButtonLink href={`/matches/${matchId}`} variant="ghost">
          ← 다른 미션 보기
        </ButtonLink>
        <ButtonLink href={`/matches/${matchId}/scenarios/${scenarioId}/tactics`} className="sm:min-w-52">
          전술 보드 입장 <span aria-hidden="true">→</span>
        </ButtonLink>
      </div>
    </div>
  );
}

