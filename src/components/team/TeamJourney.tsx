"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { Badge } from "@/components/common/Badge";
import { ButtonLink } from "@/components/common/Button";
import {
  DECISION_STORAGE_EVENT,
  loadDecision,
} from "@/lib/decision/storage";
import type { StoredDecision } from "@/data/types";

export interface TeamJourneyDecisionModel {
  substitutionsRemaining: number;
  lineupPlayerIds: string[];
  benchPlayerIds: string[];
  roleIdsByIncomingPlayerId: Record<string, string[]>;
}

export interface TeamJourneyMission {
  id: string;
  title: string;
  minute: number;
  currentScore: string;
  difficulty: string;
  href: string;
  decisionModel: TeamJourneyDecisionModel;
}

export interface TeamJourneyMatch {
  id: string;
  matchNumber: number;
  date: string;
  venue: string;
  opponentName: string;
  opponentCode: string;
  scoreFor: number;
  scoreAgainst: number;
  missions: TeamJourneyMission[];
}

function resultLabel(scoreFor: number, scoreAgainst: number) {
  if (scoreFor > scoreAgainst) return "승";
  if (scoreFor < scoreAgainst) return "패";
  return "무";
}

function resultTone(
  scoreFor: number,
  scoreAgainst: number,
): "green" | "danger" | "neutral" {
  if (scoreFor > scoreAgainst) return "green";
  if (scoreFor < scoreAgainst) return "danger";
  return "neutral";
}

export function isJourneyDecisionValid(
  decision: StoredDecision,
  teamId: string,
  matchId: string,
  mission: TeamJourneyMission,
) {
  const { decisionModel } = mission;
  const lineupIds = decisionModel.lineupPlayerIds;
  const benchIds = decisionModel.benchPlayerIds;
  const hasDuplicateRoster =
    new Set(lineupIds).size !== lineupIds.length ||
    new Set(benchIds).size !== benchIds.length ||
    lineupIds.some((playerId) => benchIds.includes(playerId));

  return (
    decision.selectedTeamId === teamId &&
    decision.matchId === matchId &&
    decision.scenarioId === mission.id &&
    Number.isInteger(decisionModel.substitutionsRemaining) &&
    decisionModel.substitutionsRemaining > 0 &&
    !hasDuplicateRoster &&
    decision.outPlayerId !== decision.inPlayerId &&
    lineupIds.includes(decision.outPlayerId) &&
    benchIds.includes(decision.inPlayerId) &&
    (decisionModel.roleIdsByIncomingPlayerId[decision.inPlayerId] ?? [])
      .includes(decision.roleId)
  );
}

export function TeamJourney({
  teamId,
  teamName,
  matches,
}: {
  teamId: string;
  teamName: string;
  matches: TeamJourneyMatch[];
}) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener(DECISION_STORAGE_EVENT, onStoreChange);
    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener(DECISION_STORAGE_EVENT, onStoreChange);
    };
  }, []);
  const getSnapshot = useCallback(
    () =>
      JSON.stringify(
        matches.reduce(
          (snapshot, match) => {
            for (const mission of match.missions) {
              const decision = loadDecision(match.id, mission.id);
              if (!decision) continue;
              if (isJourneyDecisionValid(decision, teamId, match.id, mission)) {
                snapshot.completedMissionIds.push(mission.id);
              } else {
                snapshot.invalidMissionIds.push(mission.id);
              }
            }
            return snapshot;
          },
          {
            completedMissionIds: [] as string[],
            invalidMissionIds: [] as string[],
          },
        ),
      ),
    [matches, teamId],
  );
  const completedSnapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "__server__",
  );
  const hydrated = completedSnapshot !== "__server__";
  const progressSnapshot = useMemo(
    () =>
      hydrated
        ? (JSON.parse(completedSnapshot) as {
            completedMissionIds: string[];
            invalidMissionIds: string[];
          })
        : { completedMissionIds: [], invalidMissionIds: [] },
    [completedSnapshot, hydrated],
  );
  const completedMissionIds = useMemo(
    () => new Set(progressSnapshot.completedMissionIds),
    [progressSnapshot.completedMissionIds],
  );
  const invalidMissionCount = progressSnapshot.invalidMissionIds.length;

  const totalMissions = matches.reduce(
    (sum, match) => sum + match.missions.length,
    0,
  );
  const nextMission = useMemo(
    () =>
      matches
        .flatMap((match) => match.missions)
        .find((mission) => !completedMissionIds.has(mission.id)),
    [completedMissionIds, matches],
  );
  const completedMatches = matches.filter(
    (match) =>
      match.missions.length > 0 &&
      match.missions.every((mission) => completedMissionIds.has(mission.id)),
  ).length;
  const incompleteMissions = Math.max(
    0,
    totalMissions - completedMissionIds.size,
  );
  const groupComplete =
    hydrated && matches.length === 3 && completedMatches === matches.length;

  return (
    <>
      <div className="mt-6 grid gap-4">
        {matches.map((match, matchIndex) => {
          const completedCount = match.missions.filter((mission) =>
            completedMissionIds.has(mission.id),
          ).length;
          const matchComplete =
            hydrated &&
            match.missions.length > 0 &&
            completedCount === match.missions.length;

          return (
            <article
              key={match.id}
              className="panel overflow-hidden"
              aria-labelledby={`${match.id}-title`}
            >
              <div className="grid gap-5 border-b border-white/[.07] bg-gradient-to-r from-[#0c6547]/18 to-transparent p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
                <div className="flex items-center gap-3 sm:block">
                  <span className="text-xs font-black tracking-[.14em] text-[#8f99a8]">
                    GAME {String(matchIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="number-tabular text-xs font-bold text-[#f4b860] sm:mt-1 sm:block">
                    MATCH {match.matchNumber}
                  </span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id={`${match.id}-title`}
                      className="text-xl font-black text-white sm:text-2xl"
                    >
                      {teamName} vs {match.opponentName}
                    </h2>
                    <Badge
                      tone={resultTone(match.scoreFor, match.scoreAgainst)}
                    >
                      {resultLabel(match.scoreFor, match.scoreAgainst)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#9fa9b7]">
                    {match.date.replaceAll("-", ".")} · {match.venue} · 상대{" "}
                    {match.opponentCode}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                  <span className="number-tabular text-3xl font-black text-[#f4b860]">
                    {match.scoreFor}
                    <span className="mx-1.5 text-[#657183]">:</span>
                    {match.scoreAgainst}
                  </span>
                  <span className="block text-[11px] font-bold text-[#929dab] sm:mt-1">
                    공식 최종 결과
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-black tracking-[.12em] text-[#f4b860]">
                    {teamName} 감독 미션
                  </p>
                  <Badge tone={matchComplete ? "green" : "neutral"}>
                    {!hydrated
                      ? "기록 확인 중"
                      : matchComplete
                        ? "경기 완료"
                        : completedCount > 0
                          ? `일부 완료 · ${completedCount}/${match.missions.length}`
                          : "시작 전"}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3">
                  {match.missions.map((mission) => {
                    const isComplete =
                      hydrated && completedMissionIds.has(mission.id);

                    return (
                      <div
                        key={mission.id}
                        className="panel-soft flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="number-tabular text-sm font-black text-[#f4b860]">
                              {mission.minute}′ · {mission.currentScore}
                            </span>
                            <Badge tone={isComplete ? "green" : "blue"}>
                              {isComplete ? "결정 완료" : mission.difficulty}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm font-bold leading-6 text-white">
                            {mission.title}
                          </p>
                        </div>
                        <ButtonLink
                          href={mission.href}
                          variant={isComplete ? "secondary" : "primary"}
                          className="w-full shrink-0 sm:w-auto"
                        >
                          {isComplete ? "다시 보기" : "브리핑 열기"}{" "}
                          <span aria-hidden="true">→</span>
                        </ButtonLink>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="panel mt-6 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-black tracking-[.12em] text-[#82e6ac]">
            GROUP JOURNEY
          </p>
          <p className="mt-2 text-lg font-black text-white">
            {!hydrated
              ? "저장된 감독 기록을 확인하고 있습니다."
              : nextMission
                ? `다음 결정까지 ${completedMissionIds.size}/${totalMissions}`
                : `${teamName}의 모든 감독 미션을 완료했습니다.`}
          </p>
          <p className="mt-1 text-sm leading-6 text-[#9fa9b7]">
            실제 순위와 경기 결과는 사용자의 선택으로 변경되지 않습니다.
          </p>
          {hydrated && invalidMissionCount > 0 && (
            <p
              className="mt-3 rounded-lg border border-[#ff806d]/20 bg-[#ff806d]/7 px-3 py-2 text-xs font-bold leading-5 text-[#ffc0b6]"
              role="status"
            >
              저장된 결정 {invalidMissionCount}개가 현재 명단·역할 데이터와
              일치하지 않아 진행률에서 제외했습니다. 해당 미션을 다시
              선택해 주세요.
            </p>
          )}
          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["조별리그", `${matches.length}경기`],
              ["완료 경기", `${hydrated ? completedMatches : 0}경기`],
              ["완료 미션", `${hydrated ? completedMissionIds.size : 0}개`],
              ["미완료", `${hydrated ? incompleteMissions : totalMissions}개`],
            ].map(([label, value]) => (
              <div key={label} className="panel-soft px-3 py-2">
                <dt className="text-xs font-bold text-[#8691a0]">{label}</dt>
                <dd className="number-tabular mt-1 text-sm font-black text-white">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <ButtonLink
            href={`/teams/${teamId}/report`}
            variant={groupComplete ? "primary" : "secondary"}
          >
            조별리그 리포트 보기 <span aria-hidden="true">→</span>
          </ButtonLink>
          {hydrated && nextMission ? (
            <ButtonLink href={nextMission.href} variant="ghost">
              다음 미션
            </ButtonLink>
          ) : (
            <ButtonLink href="/group-a" variant="ghost">
              A조 최종 순위
            </ButtonLink>
          )}
        </div>
      </aside>
    </>
  );
}
