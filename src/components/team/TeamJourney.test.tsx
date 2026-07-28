import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  TeamJourney,
  type TeamJourneyMatch,
} from "@/components/team/TeamJourney";
import { saveDecision } from "@/lib/decision/storage";

const matches: TeamJourneyMatch[] = [
  {
    id: "match-1",
    matchNumber: 1,
    date: "2026-06-11",
    venue: "Stadium",
    opponentName: "체코",
    opponentCode: "CZE",
    scoreFor: 1,
    scoreAgainst: 1,
    missions: [
      {
        id: "mission-1",
        title: "첫 결정",
        minute: 60,
        currentScore: "0–0",
        difficulty: "보통",
        href: "/mission-1",
        decisionModel: {
          substitutionsRemaining: 1,
          lineupPlayerIds: ["out"],
          benchPlayerIds: ["in"],
          roleIdsByIncomingPlayerId: { in: ["role"] },
        },
      },
      {
        id: "mission-2",
        title: "두 번째 결정",
        minute: 70,
        currentScore: "0–0",
        difficulty: "보통",
        href: "/mission-2",
        decisionModel: {
          substitutionsRemaining: 1,
          lineupPlayerIds: ["out"],
          benchPlayerIds: ["in"],
          roleIdsByIncomingPlayerId: { in: ["role"] },
        },
      },
    ],
  },
  {
    id: "match-2",
    matchNumber: 2,
    date: "2026-06-18",
    venue: "Stadium",
    opponentName: "멕시코",
    opponentCode: "MEX",
    scoreFor: 2,
    scoreAgainst: 1,
    missions: [
      {
        id: "mission-3",
        title: "세 번째 결정",
        minute: 65,
        currentScore: "1–1",
        difficulty: "보통",
        href: "/mission-3",
        decisionModel: {
          substitutionsRemaining: 1,
          lineupPlayerIds: ["out"],
          benchPlayerIds: ["in"],
          roleIdsByIncomingPlayerId: { in: ["role"] },
        },
      },
    ],
  },
  {
    id: "match-3",
    matchNumber: 3,
    date: "2026-06-24",
    venue: "Stadium",
    opponentName: "남아공",
    opponentCode: "RSA",
    scoreFor: 0,
    scoreAgainst: 0,
    missions: [
      {
        id: "mission-4",
        title: "네 번째 결정",
        minute: 75,
        currentScore: "0–0",
        difficulty: "보통",
        href: "/mission-4",
        decisionModel: {
          substitutionsRemaining: 1,
          lineupPlayerIds: ["out"],
          benchPlayerIds: ["in"],
          roleIdsByIncomingPlayerId: { in: ["role"] },
        },
      },
    ],
  },
];

function save(matchId: string, scenarioId: string) {
  return saveDecision({
    version: 3,
    matchId,
    scenarioId,
    selectedTeamId: "kor",
    outPlayerId: "out",
    inPlayerId: "in",
    roleId: "role",
    instructions: {
      attackDirection: "balanced",
      pressing: "medium",
      defensiveLine: "medium",
      mentality: "balanced",
    },
    createdAt: "2026-07-28T00:00:00.000Z",
  });
}

describe("TeamJourney progress", () => {
  beforeEach(() => window.localStorage.clear());

  it("shows match and mission progress plus a report link for partial play", async () => {
    expect(save("match-1", "mission-1")).toBe(true);
    expect(save("match-1", "mission-2")).toBe(true);

    render(<TeamJourney teamId="kor" teamName="대한민국" matches={matches} />);

    expect(await screen.findByText("완료 경기")).toBeInTheDocument();
    expect(screen.getByText("1경기")).toBeInTheDocument();
    expect(screen.getAllByText("2개")).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: /조별리그 리포트 보기/ }),
    ).toHaveAttribute("href", "/teams/kor/report");
    expect(screen.getByText("경기 완료")).toBeInTheDocument();
  });

  it("excludes a semantically stale decision and explains why", async () => {
    expect(
      saveDecision({
        version: 3,
        matchId: "match-1",
        scenarioId: "mission-1",
        selectedTeamId: "kor",
        outPlayerId: "missing-out",
        inPlayerId: "in",
        roleId: "role",
        instructions: {
          attackDirection: "balanced",
          pressing: "medium",
          defensiveLine: "medium",
          mentality: "balanced",
        },
        createdAt: "2026-07-28T00:00:00.000Z",
      }),
    ).toBe(true);

    render(<TeamJourney teamId="kor" teamName="대한민국" matches={matches} />);

    expect(
      await screen.findByText(/저장된 결정 1개가 현재 명단·역할 데이터와 일치하지 않아/),
    ).toBeInTheDocument();
    expect(screen.getByText("다음 결정까지 0/4")).toBeInTheDocument();
    expect(screen.queryByText("결정 완료")).not.toBeInTheDocument();
  });
});
