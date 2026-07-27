import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StepIndicator } from "@/components/layout/StepIndicator";
import { TacticsWorkspace } from "@/components/tactics/TacticsWorkspace";
import {
  getInstructions,
  getMatch,
  getPlayersByIds,
  getRoles,
  getScenario,
} from "@/data/repository";

export const metadata: Metadata = { title: "전술 보드" };

export default async function TacticsPage({
  params,
}: {
  params: Promise<{ matchId: string; scenarioId: string }>;
}) {
  const { matchId, scenarioId } = await params;
  const match = getMatch(matchId);
  const scenario = getScenario(matchId, scenarioId);
  if (!match || !scenario) notFound();

  const lineupPlayers = getPlayersByIds(
    scenario.currentLineup.map((spot) => spot.playerId),
  );
  const benchPlayers = getPlayersByIds(scenario.benchOptions);

  return (
    <div className="page-wrap py-8 sm:py-10">
      <StepIndicator current="tactics" matchId={matchId} scenarioId={scenarioId} />
      <div className="mt-7">
        <TacticsWorkspace
          match={match}
          scenario={scenario}
          lineupPlayers={lineupPlayers}
          benchPlayers={benchPlayers}
          roles={getRoles()}
          instructions={getInstructions()}
        />
      </div>
    </div>
  );
}

