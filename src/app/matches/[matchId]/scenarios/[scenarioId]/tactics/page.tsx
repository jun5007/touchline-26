import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StepIndicator } from "@/components/layout/StepIndicator";
import { TacticsWorkspace } from "@/components/tactics/TacticsWorkspace";
import {
  getDecisionMatchView,
  getDecisionScenarioContext,
  getInstructions,
  getMatch,
  getPlayersByIds,
  getRoles,
  getScenario,
} from "@/data/repository";
import { calculateLegalDecisionScoreDistribution } from "@/lib/decision/decisionScoreDistribution";

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
    scenario,
  );
  const benchPlayers = getPlayersByIds(scenario.benchOptions, scenario);
  const decisionScenario = getDecisionScenarioContext(scenario);
  const roles = getRoles();
  const instructions = getInstructions();
  const scoreDistribution = calculateLegalDecisionScoreDistribution({
    scenario: decisionScenario,
    lineupPlayers,
    benchPlayers,
    roles,
    instructionCategories: instructions,
  });

  return (
    <div className="page-wrap py-8 sm:py-10">
      <StepIndicator current="tactics" matchId={matchId} scenarioId={scenarioId} />
      <div className="mt-7">
        <TacticsWorkspace
          match={getDecisionMatchView(match)}
          scenario={decisionScenario}
          lineupPlayers={lineupPlayers}
          benchPlayers={benchPlayers}
          roles={roles}
          instructions={instructions}
          scoreDistribution={scoreDistribution}
        />
      </div>
    </div>
  );
}
