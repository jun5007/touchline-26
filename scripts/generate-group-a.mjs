import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataRoot = path.join(projectRoot, "src", "data");
const playersPath = path.join(dataRoot, "players", "group-a-players.json");

if (!fs.existsSync(playersPath)) {
  throw new Error(
    "group-a-players.json is required. Generate the verified final-squad catalog first.",
  );
}

const rawPlayers = JSON.parse(fs.readFileSync(playersPath, "utf8"));
const goalkeeperAttributeKeys = [
  "shotStopping",
  "distribution",
  "aerialCommand",
  "sweeping",
  "penaltySaving",
  "stability",
  "buildUp",
  "impact",
];
const positionGroupCandidatesByOfficialPosition = {
  GK: ["GK"],
  DF: ["CB", "FB_WB"],
  MF: ["DM", "CM_AM", "WINGER"],
  FW: ["WINGER", "STRIKER"],
};
const players = rawPlayers.map((player) => ({
  ...player,
  positionGroup:
    player.positionGroup ??
    (player.officialPosition === "GK" ? "GK" : null),
  positionGroupCandidates:
    player.positionGroupCandidates ??
    positionGroupCandidatesByOfficialPosition[player.officialPosition],
  positionGroupStatus:
    player.positionGroupStatus ??
    (player.officialPosition === "GK"
      ? "verified"
      : "broad_only"),
  baseProfile: {
    ...player.baseProfile,
    attributes: {
      ...player.baseProfile.attributes,
      goalkeeper: Object.fromEntries(
        goalkeeperAttributeKeys.map((attribute) => [
          attribute,
          player.baseProfile.attributes.goalkeeper?.[attribute] ?? null,
        ]),
      ),
    },
    missingAttributes:
      player.baseProfile.activeAttributeModel === "goalkeeper"
        ? goalkeeperAttributeKeys
        : player.baseProfile.missingAttributes,
  },
}));
const playerByTeamAndNumber = new Map(
  players.map((player) => [
    `${player.teamId}:${player.shirtNumber ?? player.number}`,
    player,
  ]),
);

function pid(teamId, shirtNumber) {
  const player = playerByTeamAndNumber.get(`${teamId}:${shirtNumber}`);
  if (!player) {
    throw new Error(`Unknown official-squad player ${teamId} #${shirtNumber}`);
  }
  return player.id;
}

function ids(teamId, shirtNumbers) {
  return shirtNumbers.map((shirtNumber) => pid(teamId, shirtNumber));
}

function minute(regulation, added = 0) {
  return added > 0 ? { regulation, added } : { regulation };
}

function eventMinuteValue(value) {
  return value.regulation + (value.added ?? 0);
}

const sourceMeta = {
  "mex-rsa-2026": {
    matchNumber: 1,
    fifaMatchId: "400021443",
    resourceId: "r12452",
    pmsr: "PMSR-M01%20MEX%20V%20RSA.pdf",
    article:
      "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/mexico-south-africa-highlights-match-report",
  },
  "kor-cze-2026": {
    matchNumber: 2,
    fifaMatchId: "400021441",
    resourceId: "r12450",
    pmsr: "PMSR-M02%20KOR%20V%20CZE%20.pdf",
    article:
      "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/korea-republic-czechia-highlights-match-report",
  },
  "cze-rsa-2026": {
    matchNumber: 25,
    fifaMatchId: "400021440",
    resourceId: "r12449",
    pmsr: "PMSR-M25-CZE-V-RSA.pdf",
    article:
      "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/czechia-south-africa-highlights-match-report",
  },
  "mex-kor-2026": {
    matchNumber: 28,
    fifaMatchId: "400021442",
    resourceId: "r12451",
    pmsr: "PMSR-M28-MEX-V-KOR.pdf",
    article:
      "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/mexico-korea-republic-highlights-match-report",
  },
  "cze-mex-2026": {
    matchNumber: 53,
    fifaMatchId: "400021444",
    resourceId: "r12453",
    pmsr: "PMSR-M53-CZE-V-MEX.pdf",
    article:
      "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/czechia-mexico-match-report-highlights",
  },
  "rsa-kor-2026": {
    matchNumber: 54,
    fifaMatchId: "400021445",
    resourceId: "r12454",
    pmsr: "PMSR-M54-RSA-V-KOR.pdf",
    article:
      "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/south-africa-korea-republic-match-report-highlights",
  },
};

function sourceIds(matchId) {
  const number = String(sourceMeta[matchId].matchNumber).padStart(2, "0");
  return [
    `fifa-ftr-m${number}`,
    `fifa-tactical-m${number}`,
    `fifa-pmsr-m${number}`,
    `fifa-api-m${number}`,
    `fifa-article-m${number}`,
  ];
}

function sub(teamId, at, off, on, note) {
  return {
    minute: typeof at === "number" ? minute(at) : at,
    outPlayerId: pid(teamId, off),
    inPlayerId: pid(teamId, on),
    note: note ?? null,
    verificationStatus: "verified_official",
  };
}

function goal(teamId, at, scorer, assist = null, detail = null) {
  return {
    minute: typeof at === "number" ? minute(at) : at,
    type: "goal",
    teamId,
    playerId: pid(teamId, scorer),
    assistPlayerId: assist ? pid(teamId, assist) : null,
    card: null,
    detail,
    verificationStatus: "verified_official",
  };
}

function card(teamId, at, player, cardType) {
  return {
    minute: typeof at === "number" ? minute(at) : at,
    type: "card",
    teamId,
    playerId: pid(teamId, player),
    assistPlayerId: null,
    card: cardType,
    detail: null,
    verificationStatus: "verified_official",
  };
}

function substitutionEvents(teamId, substitutions) {
  return substitutions.map((item) => ({
    minute: item.minute,
    type: "substitution",
    teamId,
    playerId: item.inPlayerId,
    relatedPlayerId: item.outPlayerId,
    assistPlayerId: null,
    card: null,
    detail: item.note,
    verificationStatus: item.verificationStatus,
  }));
}

const matchSeeds = [
  {
    id: "mex-rsa-2026",
    file: "group-a-match-01.json",
    date: "2026-06-11",
    localKickoff: "13:00",
    kickoffUtc: "2026-06-11T19:00:00Z",
    venue: "Mexico City Stadium",
    city: "Mexico City",
    country: "Mexico",
    attendance: 80824,
    homeTeamId: "mex",
    awayTeamId: "rsa",
    finalScore: { home: 2, away: 0 },
    halfTimeScore: { home: 1, away: 0 },
    formationsByTeam: { mex: "4-1-2-3", rsa: "5-3-2" },
    lineups: {
      mex: [1, 3, 5, 6, 8, 9, 15, 16, 23, 25, 26],
      rsa: [1, 4, 6, 9, 13, 14, 15, 19, 20, 21, 23],
    },
    benches: {
      mex: [12, 13, 2, 4, 7, 10, 11, 14, 17, 18, 19, 20, 21, 22, 24],
      rsa: [16, 22, 2, 3, 5, 7, 8, 10, 11, 12, 17, 18, 24, 25, 26],
    },
    unavailable: { mex: [], rsa: [] },
    substitutions: {
      mex: [
        sub("mex", 66, 26, 24),
        sub("mex", 66, 8, 19),
        sub("mex", 76, 6, 4),
        sub("mex", 76, 9, 14),
        sub("mex", 79, 16, 10),
      ],
      rsa: [
        sub("rsa", 56, 9, 5),
        sub("rsa", 61, 23, 11),
        sub("rsa", 76, 15, 17),
        sub("rsa", 76, 6, 7),
      ],
    },
    events: [
      goal("mex", 9, 16, 6),
      card("rsa", 17, 4, "yellow"),
      card("mex", 23, 26, "yellow"),
      card("rsa", 49, 13, "red"),
      goal("mex", 67, 9, 25),
      card("rsa", 74, 19, "yellow"),
      card("rsa", 84, 11, "red"),
      card("mex", minute(90, 2), 3, "red"),
    ],
  },
  {
    id: "kor-cze-2026",
    file: "group-a-match-02.json",
    date: "2026-06-11",
    localKickoff: "20:00",
    kickoffUtc: "2026-06-12T02:00:00Z",
    venue: "Guadalajara Stadium",
    city: "Guadalajara",
    country: "Mexico",
    attendance: 44985,
    homeTeamId: "kor",
    awayTeamId: "cze",
    finalScore: { home: 2, away: 1 },
    halfTimeScore: { home: 0, away: 0 },
    formationsByTeam: { kor: "3-4-3", cze: "5-2-3" },
    lineups: {
      kor: [1, 2, 3, 4, 6, 7, 8, 10, 13, 19, 22],
      cze: [1, 4, 5, 6, 7, 10, 15, 17, 20, 22, 24],
    },
    benches: {
      kor: [12, 21, 5, 9, 11, 14, 15, 16, 17, 18, 20, 23, 24, 25, 26],
      cze: [16, 23, 2, 3, 8, 9, 11, 12, 13, 14, 18, 19, 21, 25, 26],
    },
    unavailable: { kor: [], cze: [] },
    substitutions: {
      kor: [
        sub("kor", 62, 10, 11),
        sub("kor", 69, 7, 18),
        sub("kor", 69, 13, 25),
        sub("kor", 84, 6, 24),
        sub("kor", 84, 8, 16),
      ],
      cze: [
        sub("cze", 63, 15, 9),
        sub("cze", 63, 10, 19),
        sub("cze", 63, 17, 18),
        sub("cze", 84, 24, 13),
      ],
    },
    events: [
      goal("cze", 59, 7, 5),
      goal("kor", 67, 6, 19),
      goal("kor", 80, 18, 6),
      card("kor", minute(90, 6), 3, "yellow"),
    ],
    discrepancyNotes: [
      "체코의 3인 교체는 FTR 63분을 사용했다. PMSR에는 64분으로 표기된다.",
    ],
  },
  {
    id: "cze-rsa-2026",
    file: "group-a-match-25.json",
    date: "2026-06-18",
    localKickoff: "12:00",
    kickoffUtc: "2026-06-18T16:00:00Z",
    venue: "Atlanta Stadium",
    city: "Atlanta",
    country: "United States",
    attendance: 67442,
    homeTeamId: "cze",
    awayTeamId: "rsa",
    finalScore: { home: 1, away: 1 },
    halfTimeScore: { home: 1, away: 0 },
    formationsByTeam: { cze: "3-5-2", rsa: "4-3-3" },
    lineups: {
      cze: [1, 3, 4, 5, 7, 8, 9, 10, 12, 18, 24],
      rsa: [1, 4, 5, 6, 7, 12, 14, 15, 20, 21, 23],
    },
    benches: {
      cze: [16, 23, 2, 6, 11, 13, 15, 17, 19, 20, 21, 22, 25, 26],
      rsa: [16, 22, 2, 3, 8, 9, 10, 17, 18, 19, 24, 25, 26],
    },
    unavailable: {
      cze: [
        {
          shirtNumber: 14,
          status: "matchday_unavailable",
          reason: null,
          note: "공식 경기 명단 미등재. 사유는 공식 자료에서 확인되지 않음.",
        },
      ],
      rsa: [
        {
          shirtNumber: 13,
          status: "matchday_unavailable",
          reason: null,
          note: "개막전 퇴장과 이 경기 공식 명단 미등재는 확인. 징계 기간은 별도 단정하지 않음.",
        },
        {
          shirtNumber: 11,
          status: "matchday_unavailable",
          reason: null,
          note: "개막전 퇴장과 이 경기 공식 명단 미등재는 확인. 징계 기간은 별도 단정하지 않음.",
        },
      ],
    },
    substitutions: {
      cze: [
        sub("cze", 55, 8, 15),
        sub("cze", 55, 24, 20),
        sub("cze", 67, 9, 17),
        sub("cze", 67, 18, 22),
        sub("cze", 78, 12, 2),
      ],
      rsa: [
        sub("rsa", 46, 23, 10, "half-time"),
        sub("rsa", 66, 15, 17),
        sub("rsa", 84, 12, 25),
      ],
    },
    events: [
      goal("cze", 6, 18, 24),
      card("rsa", 33, 4, "yellow"),
      card("rsa", 40, 5, "yellow"),
      card("cze", 75, 7, "yellow"),
      goal("rsa", 83, 4, null, "penalty"),
    ],
  },
  {
    id: "mex-kor-2026",
    file: "group-a-match-28.json",
    date: "2026-06-18",
    localKickoff: "19:00",
    kickoffUtc: "2026-06-19T01:00:00Z",
    venue: "Guadalajara Stadium",
    city: "Guadalajara",
    country: "Mexico",
    attendance: 45522,
    homeTeamId: "mex",
    awayTeamId: "kor",
    finalScore: { home: 1, away: 0 },
    halfTimeScore: { home: 0, away: 0 },
    formationsByTeam: { mex: "4-1-2-3", kor: "3-4-3" },
    lineups: {
      mex: [1, 2, 4, 5, 6, 7, 9, 16, 23, 25, 26],
      kor: [1, 2, 3, 4, 6, 7, 8, 10, 15, 19, 22],
    },
    benches: {
      mex: [12, 13, 8, 10, 11, 14, 15, 17, 18, 19, 20, 21, 22, 24],
      kor: [12, 21, 5, 9, 11, 13, 14, 16, 17, 18, 20, 23, 24, 25, 26],
    },
    unavailable: {
      mex: [
        {
          shirtNumber: 3,
          status: "matchday_unavailable",
          reason: null,
          note: "개막전 퇴장과 이 경기 공식 명단 미등재는 확인. 징계 기간은 별도 단정하지 않음.",
        },
      ],
      kor: [],
    },
    substitutions: {
      mex: [
        sub("mex", 71, 7, 18),
        sub("mex", 71, 26, 17),
        sub("mex", 80, 9, 11),
        sub("mex", 80, 25, 15),
        sub("mex", 84, 16, 21),
      ],
      kor: [
        sub("kor", 57, 10, 11),
        sub("kor", 57, 7, 18),
        sub("kor", 71, 15, 25),
        sub("kor", 71, 22, 20),
        sub("kor", 77, 8, 9),
      ],
    },
    events: [
      card("kor", 4, 19, "yellow"),
      goal("mex", 50, 7),
      card("kor", 58, 8, "yellow"),
    ],
  },
  {
    id: "cze-mex-2026",
    file: "group-a-match-53.json",
    date: "2026-06-24",
    localKickoff: "19:00",
    kickoffUtc: "2026-06-25T01:00:00Z",
    venue: "Mexico City Stadium",
    city: "Mexico City",
    country: "Mexico",
    attendance: 80824,
    homeTeamId: "cze",
    awayTeamId: "mex",
    finalScore: { home: 0, away: 3 },
    halfTimeScore: { home: 0, away: 0 },
    formationsByTeam: { cze: "5-2-3", mex: "4-1-2-3" },
    lineups: {
      cze: [1, 3, 4, 5, 7, 9, 12, 15, 18, 21, 26],
      mex: [1, 2, 3, 4, 7, 15, 16, 19, 20, 22, 25],
    },
    benches: {
      cze: [16, 23, 2, 6, 8, 10, 11, 13, 17, 19, 20, 22, 24, 25],
      mex: [12, 13, 5, 6, 8, 9, 10, 11, 14, 17, 18, 21, 23, 24, 26],
    },
    unavailable: {
      cze: [
        {
          shirtNumber: 14,
          status: "matchday_unavailable",
          reason: null,
          note: "공식 경기 명단 미등재. 사유는 공식 자료에서 확인되지 않음.",
        },
      ],
      mex: [],
    },
    substitutions: {
      cze: [
        sub("cze", 56, 26, 17),
        sub("cze", 64, 3, 22),
        sub("cze", 64, 9, 10),
        sub("cze", 87, 12, 19),
        sub("cze", 87, 22, 24),
      ],
      mex: [
        sub("mex", 63, 22, 11),
        sub("mex", 63, 7, 18),
        sub("mex", 72, 19, 8),
        sub("mex", 78, 1, 13),
        sub("mex", 78, 20, 23),
      ],
    },
    events: [
      goal("mex", 55, 20, 7),
      goal("mex", 61, 16, 2),
      card("mex", 64, 4, "yellow"),
      goal("mex", minute(90, 4), 8, 25),
    ],
    discrepancyNotes: [
      "에드손 알바레스 경고는 FTR·PMSR의 64분을 사용했다. FIFA live API에는 63분으로 표기된다.",
    ],
  },
  {
    id: "rsa-kor-2026",
    file: "group-a-match-54.json",
    date: "2026-06-24",
    localKickoff: "19:00",
    kickoffUtc: "2026-06-25T01:00:00Z",
    venue: "Monterrey Stadium",
    city: "Monterrey",
    country: "Mexico",
    attendance: 51243,
    homeTeamId: "rsa",
    awayTeamId: "kor",
    finalScore: { home: 1, away: 0 },
    halfTimeScore: { home: 0, away: 0 },
    formationsByTeam: { rsa: "4-2-3-1", kor: "3-4-3" },
    lineups: {
      rsa: [1, 5, 6, 7, 10, 12, 13, 14, 17, 20, 21],
      kor: [1, 2, 3, 4, 6, 8, 11, 13, 18, 19, 22],
    },
    benches: {
      rsa: [16, 22, 2, 3, 8, 9, 15, 18, 19, 23, 24, 25, 26],
      kor: [12, 21, 5, 7, 9, 10, 14, 15, 16, 17, 20, 23, 24, 25, 26],
    },
    unavailable: {
      rsa: [
        {
          shirtNumber: 4,
          status: "suspended",
          reason: "yellow-card-accumulation",
          note: "FIFA 공식 기사가 경고 누적 결장을 명시한다.",
        },
        {
          shirtNumber: 11,
          status: "matchday_unavailable",
          reason: null,
          note: "공식 경기 명단 미등재. 추가 징계 사유는 공식 자료에서 확인되지 않음.",
        },
      ],
      kor: [],
    },
    substitutions: {
      rsa: [
        sub("rsa", 62, 7, 8),
        sub("rsa", 75, 12, 15),
        sub("rsa", 80, 10, 23),
      ],
      kor: [
        sub("kor", 46, 11, 7, "half-time"),
        sub("kor", 46, 8, 24, "half-time"),
        sub("kor", 46, 13, 23, "half-time"),
        sub("kor", 65, 4, 16),
        sub("kor", 74, 18, 9),
      ],
    },
    events: [
      goal("rsa", 63, 12, 8),
      card("rsa", 72, 6, "yellow"),
      card("kor", 78, 9, "yellow"),
    ],
  },
];

function resolveUnavailable(teamId, items) {
  return items.map(({ shirtNumber, ...item }) => ({
    playerId: pid(teamId, shirtNumber),
    ...item,
    verificationStatus:
      item.reason === "yellow-card-accumulation"
        ? "verified_official"
        : "partial",
  }));
}

const matches = matchSeeds.map((seed) => {
  const meta = sourceMeta[seed.id];
  const substitutionsByTeam = Object.fromEntries(
    Object.entries(seed.substitutions),
  );
  return {
    id: seed.id,
    fifaMatchId: meta.fifaMatchId,
    fdpResourceId: meta.resourceId,
    groupId: "group-a",
    competition: "FIFA World Cup 2026",
    stage: "group",
    matchNumber: meta.matchNumber,
    date: seed.date,
    localKickoff: seed.localKickoff,
    kickoffUtc: seed.kickoffUtc,
    venue: seed.venue,
    city: seed.city,
    country: seed.country,
    attendance: seed.attendance,
    homeTeamId: seed.homeTeamId,
    awayTeamId: seed.awayTeamId,
    playableTeamIds: [seed.homeTeamId, seed.awayTeamId],
    finalScore: seed.finalScore,
    halfTimeScore: seed.halfTimeScore,
    formationsByTeam: seed.formationsByTeam,
    lineupsByTeam: Object.fromEntries(
      Object.entries(seed.lineups).map(([teamId, numbers]) => [
        teamId,
        ids(teamId, numbers),
      ]),
    ),
    benchesByTeam: Object.fromEntries(
      Object.entries(seed.benches).map(([teamId, numbers]) => [
        teamId,
        ids(teamId, numbers),
      ]),
    ),
    unavailableByTeam: Object.fromEntries(
      Object.entries(seed.unavailable).map(([teamId, items]) => [
        teamId,
        resolveUnavailable(teamId, items),
      ]),
    ),
    substitutionsByTeam,
    events: [
      ...seed.events,
      ...Object.entries(substitutionsByTeam).flatMap(([teamId, substitutions]) =>
        substitutionEvents(teamId, substitutions),
      ),
    ].sort(
      (left, right) =>
        eventMinuteValue(left.minute) - eventMinuteValue(right.minute),
    ),
    sourceIds: sourceIds(seed.id),
    discrepancyNotes: seed.discrepancyNotes ?? [],
    verificationStatus: "verified_official",
  };
});

const allNullWeights = {
  finishing: 0.12,
  chanceCreation: 0.14,
  dribbling: 0.1,
  passing: 0.14,
  pressing: 0.12,
  defending: 0.14,
  aerial: 0.1,
  impact: 0.14,
};

const modeConfig = {
  attack: {
    difficulty: "보통",
    weights: {
      ...allNullWeights,
      finishing: 0.2,
      chanceCreation: 0.18,
      dribbling: 0.14,
      defending: 0.06,
    },
    defaultInstructions: {
      attackDirection: "balanced",
      pressing: "medium",
      defensiveLine: "medium",
      mentality: "attacking",
    },
    instructionFit: {
      attackDirection: { left: 0, centre: 2, right: 0, balanced: 1 },
      pressing: { low: -2, medium: 2, high: 1 },
      defensiveLine: { low: -1, medium: 2, high: 0 },
      mentality: { safe: -3, balanced: 1, attacking: 3 },
      combinationModifiers: [
        {
          id: "attack-centre-commitment",
          label: "중앙 공략과 공격 성향의 박스 점유",
          when: { attackDirection: "centre", mentality: "attacking" },
          modifier: 1,
        },
        {
          id: "attack-exposed-line",
          label: "낮은 압박과 높은 라인의 간격",
          when: { pressing: "low", defensiveLine: "high" },
          modifier: -3,
        },
      ],
    },
    matchup: {
      base: 55,
      rules: [
        {
          id: "attack-striker",
          label: "박스 중앙 공격수",
          positionGroups: ["STRIKER"],
          modifier: 10,
        },
        {
          id: "attack-winger",
          label: "측면 돌파 옵션",
          positionGroups: ["WINGER"],
          modifier: 7,
        },
        {
          id: "attack-role",
          label: "득점 지향 역할",
          roleIds: ["target-striker", "advanced-forward", "inside-forward"],
          modifier: 7,
        },
      ],
    },
    matchupTags: ["득점 필요", "박스 점유", "전환 위험"],
    riskRules: [
      "high-line-low-press",
      "all-out-attack",
      "position-mismatch",
      "low-confidence",
    ],
  },
  control: {
    difficulty: "어려움",
    weights: {
      ...allNullWeights,
      passing: 0.2,
      pressing: 0.15,
      defending: 0.2,
      aerial: 0.13,
      finishing: 0.04,
    },
    defaultInstructions: {
      attackDirection: "balanced",
      pressing: "medium",
      defensiveLine: "medium",
      mentality: "safe",
    },
    instructionFit: {
      attackDirection: { left: 0, centre: -1, right: 0, balanced: 2 },
      pressing: { low: -1, medium: 2, high: 0 },
      defensiveLine: { low: 0, medium: 2, high: -2 },
      mentality: { safe: 3, balanced: 1, attacking: -3 },
      combinationModifiers: [
        {
          id: "control-mid-block",
          label: "중간 라인과 선택적 압박",
          when: {
            pressing: "medium",
            defensiveLine: "medium",
            mentality: "safe",
          },
          modifier: 1,
        },
        {
          id: "control-passive-block",
          label: "지나치게 수동적인 저블록",
          when: { pressing: "low", defensiveLine: "low" },
          modifier: -2,
        },
      ],
    },
    matchup: {
      base: 56,
      rules: [
        {
          id: "control-midfielder",
          label: "중원 통제",
          positionGroups: ["DM", "CM_AM"],
          modifier: 10,
        },
        {
          id: "control-defender",
          label: "후방 숫자 보강",
          positionGroups: ["CB", "FB_WB"],
          modifier: 8,
        },
        {
          id: "control-role",
          label: "리드 보호 역할",
          roleIds: [
            "holding-midfielder",
            "box-to-box",
            "defensive-fullback",
            "centre-back",
          ],
          modifier: 7,
        },
      ],
    },
    matchupTags: ["리드 보호", "세컨드볼", "전환 통제"],
    riskRules: [
      "high-line-low-press",
      "deep-passive-block",
      "position-mismatch",
      "low-confidence",
      "protect-lead-attacking",
    ],
  },
  balance: {
    difficulty: "보통",
    weights: allNullWeights,
    defaultInstructions: {
      attackDirection: "balanced",
      pressing: "medium",
      defensiveLine: "medium",
      mentality: "balanced",
    },
    instructionFit: {
      attackDirection: { left: 0, centre: 1, right: 0, balanced: 2 },
      pressing: { low: -1, medium: 2, high: 1 },
      defensiveLine: { low: -1, medium: 2, high: 0 },
      mentality: { safe: 0, balanced: 2, attacking: 1 },
      combinationModifiers: [
        {
          id: "balance-coordinated-press",
          label: "라인과 압박의 동시 전진",
          when: { pressing: "high", defensiveLine: "high" },
          modifier: 1,
        },
        {
          id: "balance-disconnected",
          label: "높은 라인과 낮은 압박의 간격",
          when: { pressing: "low", defensiveLine: "high" },
          modifier: -3,
        },
      ],
    },
    matchup: {
      base: 56,
      rules: [
        {
          id: "balance-midfielder",
          label: "중앙 균형",
          positionGroups: ["DM", "CM_AM"],
          modifier: 8,
        },
        {
          id: "balance-forward",
          label: "전환 출구",
          positionGroups: ["WINGER", "STRIKER"],
          modifier: 7,
        },
        {
          id: "balance-role",
          label: "양방향 역할",
          roleIds: ["box-to-box", "playmaker", "advanced-forward"],
          modifier: 6,
        },
      ],
    },
    matchupTags: ["공수 균형", "전환 출구", "중원 간격"],
    riskRules: [
      "high-line-low-press",
      "all-out-attack",
      "position-mismatch",
      "low-confidence",
    ],
  },
};

const scenarioSeeds = [
  {
    id: "mex-m01-control-79",
    matchId: "mex-rsa-2026",
    teamId: "mex",
    minute: 79,
    score: { home: 2, away: 0 },
    remaining: 1,
    mode: "control",
    lineup: [1, 3, 5, 15, 23, 16, 25, 24, 19, 4, 14],
    bench: [10, 11, 21, 20, 18],
    actual: [16, 10],
    title: "두 골 리드, 마지막 출구를 고르다",
    shortMission: "79분 2–0, 마지막 교체로 압박과 전환 출구를 함께 남겨라",
    mission:
      "마지막 교체 슬롯으로 리드를 관리하되, 공을 되찾은 뒤 전진할 출구까지 지켜라.",
    opponentShape: "10명 · 수적 열세 속 직접 전개",
    observations: [
      "멕시코는 9분 훌리안 키노네스의 득점으로 앞섰다.",
      "남아공은 49분 퇴장으로 10명이 됐다.",
      "라울 히메네스가 67분 두 번째 골을 넣었다.",
      "76분 멕시코는 두 장을 먼저 사용했고 마지막 한 장이 남았다.",
    ],
    timeline: [
      ["49′", "남아공 퇴장", "positive"],
      ["67′", "멕시코 추가골", "positive"],
      ["76′", "멕시코 2명 교체", "neutral"],
      ["79′", "당신의 결정", "positive"],
    ],
    actualRole: "측면 압박 에너지와 전환 출구 유지",
  },
  {
    id: "rsa-m01-ten-men-56",
    matchId: "mex-rsa-2026",
    teamId: "rsa",
    minute: 56,
    score: { home: 1, away: 0 },
    remaining: 5,
    mode: "balance",
    lineup: [1, 6, 14, 19, 20, 21, 4, 23, 9, 15],
    bench: [5, 10, 17, 7, 12],
    actual: [9, 5],
    title: "열 명으로 버티며 동점을 설계하라",
    shortMission: "56분 0–1, 수적 열세에서 중앙 안정과 동점 가능성을 함께 지켜라",
    mission:
      "퇴장 뒤 비어진 중앙을 채우면서도 공격 출구를 완전히 포기하지 않는 교체를 선택하라.",
    opponentShape: "4-1-2-3 · 수적 우세와 높은 점유",
    observations: [
      "남아공은 9분 선제골을 허용했다.",
      "테보호 모코에나는 17분 경고를 받았다.",
      "스페펠로 시톨레가 49분 퇴장당해 현재 필드에는 10명만 남았다.",
      "첫 교체로 전방과 중원의 숫자 균형을 다시 잡아야 한다.",
    ],
    timeline: [
      ["9′", "멕시코 선제골", "danger"],
      ["17′", "모코에나 경고", "danger"],
      ["49′", "시톨레 퇴장", "danger"],
      ["56′", "당신의 결정", "neutral"],
    ],
    actualRole: "공격수 한 명을 줄이고 중앙 미드필더 보강",
  },
  {
    id: "level-69-find-nine",
    matchId: "kor-cze-2026",
    teamId: "kor",
    minute: 69,
    score: { home: 1, away: 1 },
    remaining: 4,
    mode: "attack",
    lineup: [1, 2, 4, 13, 22, 3, 6, 8, 19, 7, 11],
    bench: [18, 25, 9, 16, 20],
    actual: [7, 18],
    title: "캡틴을 남길 것인가, 9번을 세울 것인가",
    shortMission: "69분 1–1, 박스 안의 마지막 한 칸을 바꿔라",
    mission:
      "동점의 흐름을 살려 승점 3을 노려라. 박스 점유를 높이되 전환 위험까지 관리해야 한다.",
    opponentShape: "5-2-3 · 낮은 블록",
    observations: [
      "체코는 59분 라디슬라프 크레이치의 득점으로 앞섰다.",
      "대한민국은 62분 황희찬을 투입했다.",
      "황인범이 67분 동점을 만들었다.",
      "동점 직후 박스 중앙의 기준점을 바꿀 수 있는 순간이다.",
    ],
    timeline: [
      ["59′", "체코 선제골", "danger"],
      ["62′", "황희찬 투입", "neutral"],
      ["67′", "황인범 동점골", "positive"],
      ["69′", "당신의 결정", "positive"],
    ],
    actualRole: "박스 안 중앙 공격수 존재감 강화",
    parallelDecision: "같은 69분 이태석 대신 엄지성이 투입됐다.",
  },
  {
    id: "cze-m02-equaliser-84",
    matchId: "kor-cze-2026",
    teamId: "cze",
    minute: 84,
    score: { home: 2, away: 1 },
    remaining: 2,
    mode: "attack",
    lineup: [1, 4, 5, 6, 7, 20, 22, 24, 9, 19, 18],
    bench: [13, 11, 8, 12, 2],
    actual: [24, 13],
    title: "마지막 전방 카드, 구조를 얼마나 열 것인가",
    shortMission: "84분 1–2, 동점골을 노리되 역습 한 번까지 견뎌라",
    mission:
      "남은 시간 전방 숫자를 늘려 동점을 노리면서도 공을 잃은 뒤 중앙 통로를 닫아라.",
    opponentShape: "3-4-3 · 한 골 리드 보호",
    observations: [
      "체코는 59분 먼저 득점했다.",
      "대한민국이 67분 동점을 만들고 80분 역전했다.",
      "체코는 63분 공격진 세 명을 바꿨다.",
      "남은 두 장 중 한 장으로 마지막 공격 구조를 정해야 한다.",
    ],
    timeline: [
      ["59′", "체코 선제골", "positive"],
      ["67′", "대한민국 동점", "danger"],
      ["80′", "대한민국 역전", "danger"],
      ["84′", "당신의 결정", "neutral"],
    ],
    actualRole: "전방 교체로 박스 점유 확대",
  },
  {
    id: "lead-84-close-game",
    matchId: "kor-cze-2026",
    teamId: "kor",
    minute: 84,
    score: { home: 2, away: 1 },
    remaining: 2,
    mode: "control",
    lineup: [1, 3, 4, 2, 25, 6, 8, 22, 11, 18, 19],
    bench: [24, 16, 17, 9],
    actual: [6, 24],
    title: "마지막 10분, 흐름보다 통제를 택할 것인가",
    shortMission: "84분 2–1, 리드를 닫는 마지막 교체",
    mission:
      "한 골 차 리드를 지켜라. 중원 압박과 세컨드볼 대응을 보강하되 지나치게 내려앉지 마라.",
    opponentShape: "5-2-3 · 직접 전개 강화",
    observations: [
      "69분 대한민국은 오현규와 엄지성을 투입했다.",
      "오현규가 80분 역전골을 넣었다.",
      "체코는 전방 교체로 동점골을 노리고 있다.",
      "중원의 남은 활동량과 박스 앞 세컨드볼을 함께 관리해야 한다.",
    ],
    timeline: [
      ["69′", "대한민국 2명 교체", "neutral"],
      ["80′", "오현규 역전골", "positive"],
      ["84′", "당신의 결정", "positive"],
    ],
    actualRole: "중원 활동량과 볼 순환 보강",
    parallelDecision: "같은 84분 백승호 대신 박진섭이 투입됐다.",
  },
  {
    id: "cze-m25-protect-78",
    matchId: "cze-rsa-2026",
    teamId: "cze",
    minute: 78,
    score: { home: 1, away: 0 },
    remaining: 1,
    mode: "control",
    lineup: [1, 3, 4, 5, 7, 12, 10, 15, 20, 17, 22],
    bench: [2, 19, 13, 11, 26],
    actual: [12, 2],
    title: "리드를 잠글 다섯 번째 수비수를 세울까",
    shortMission: "78분 1–0, 수비 숫자와 전방 압박 중 무엇을 남길지 정하라",
    mission:
      "경고를 받은 수비 리더를 보호하면서 박스 수비 숫자와 전방 압박의 균형을 선택하라.",
    opponentShape: "4-3-3 · 동점골을 위한 전방 보강",
    observations: [
      "미할 사딜렉이 6분 선제골을 넣었다.",
      "체코는 55분과 67분에 네 장을 사용했다.",
      "라디슬라프 크레이치는 75분 경고를 받았다.",
      "마지막 한 장으로 리드 보호 구조를 결정해야 한다.",
    ],
    timeline: [
      ["6′", "체코 선제골", "positive"],
      ["67′", "체코 네 번째 교체", "neutral"],
      ["75′", "크레이치 경고", "danger"],
      ["78′", "당신의 결정", "positive"],
    ],
    actualRole: "미드필더를 빼고 수비 숫자 보강",
  },
  {
    id: "rsa-m25-box-target-66",
    matchId: "cze-rsa-2026",
    teamId: "rsa",
    minute: 66,
    score: { home: 1, away: 0 },
    remaining: 4,
    mode: "attack",
    lineup: [1, 6, 14, 20, 21, 4, 5, 7, 12, 15, 10],
    bench: [17, 8, 9, 25, 19],
    actual: [15, 17],
    title: "박스 안 기준점을 세울 때",
    shortMission: "66분 0–1, 공격수를 바꾸며 동점과 전환 수비를 함께 노려라",
    mission:
      "박스 존재감을 높이되 경고가 있는 중원의 뒷공간까지 보호할 수 있는 교체를 골라라.",
    opponentShape: "3-5-2 · 중앙 밀집과 한 골 리드",
    observations: [
      "남아공은 6분 선제골을 허용했다.",
      "모코에나와 음바타가 전반에 경고를 받았다.",
      "하프타임에 제이든 아담스 대신 렐레보힐레 모포켕이 들어왔다.",
      "이제 박스 안의 공격 기준점을 바꿀 수 있다.",
    ],
    timeline: [
      ["6′", "체코 선제골", "danger"],
      ["40′", "음바타 경고", "danger"],
      ["HT", "모포켕 투입", "neutral"],
      ["66′", "당신의 결정", "neutral"],
    ],
    actualRole: "박스 안 중앙 공격수 교체",
  },
  {
    id: "mex-m28-last-press-84",
    matchId: "mex-kor-2026",
    teamId: "mex",
    minute: 84,
    score: { home: 1, away: 0 },
    remaining: 1,
    mode: "control",
    lineup: [1, 2, 4, 5, 23, 6, 16, 18, 17, 11, 15],
    bench: [21, 8, 19, 10, 20],
    actual: [16, 21],
    title: "한 골 리드의 마지막 압박 카드",
    shortMission: "84분 1–0, 마지막 한 장으로 압박 에너지와 전환 출구를 지켜라",
    mission:
      "한국의 공격 숫자가 늘어난 상황에서 측면 압박과 역습 출구를 동시에 유지하라.",
    opponentShape: "공격수 추가 · 마지막 동점 공세",
    observations: [
      "루이스 로모가 50분 선제골을 넣었다.",
      "한국은 57분과 71분에 네 장을 먼저 사용했다.",
      "멕시코도 71분과 80분 네 선수를 바꿨다.",
      "마지막 한 장으로 측면 에너지와 리드 보호를 조율해야 한다.",
    ],
    timeline: [
      ["50′", "로모 선제골", "positive"],
      ["71′", "양 팀 2명 교체", "neutral"],
      ["80′", "멕시코 2명 교체", "neutral"],
      ["84′", "당신의 결정", "positive"],
    ],
    actualRole: "측면 압박과 전환 출구 보강",
  },
  {
    id: "kor-m28-second-nine-77",
    matchId: "mex-kor-2026",
    teamId: "kor",
    minute: 77,
    score: { home: 1, away: 0 },
    remaining: 1,
    mode: "attack",
    lineup: [1, 2, 4, 3, 6, 8, 19, 11, 18, 25, 20],
    bench: [9, 16, 24, 17, 13],
    actual: [8, 9],
    title: "중원을 덜고 두 번째 9번을 세울까",
    shortMission: "77분 0–1, 마지막 교체로 박스 숫자를 늘릴지 결정하라",
    mission:
      "경고가 있는 중앙 미드필더를 빼고 공격수를 더할 때 생기는 점유와 전환 위험을 계산하라.",
    opponentShape: "4-1-2-3 · 한 골 리드와 중앙 통제",
    observations: [
      "한국은 50분 루이스 로모에게 선제골을 허용했다.",
      "백승호는 58분 경고를 받았다.",
      "한국은 57분과 71분 네 선수를 교체했다.",
      "남은 한 장으로 박스 숫자와 중원 균형의 교환을 선택해야 한다.",
    ],
    timeline: [
      ["50′", "멕시코 선제골", "danger"],
      ["58′", "백승호 경고", "danger"],
      ["71′", "한국 네 번째 교체", "neutral"],
      ["77′", "당신의 결정", "neutral"],
    ],
    actualRole: "중앙 미드필더 대신 박스 공격수 추가",
  },
  {
    id: "cze-m53-reconnect-56",
    matchId: "cze-mex-2026",
    teamId: "cze",
    minute: 56,
    score: { home: 0, away: 1 },
    remaining: 5,
    mode: "attack",
    lineup: [1, 3, 4, 5, 7, 21, 12, 18, 9, 15, 26],
    bench: [17, 10, 22, 19, 24],
    actual: [26, 17],
    title: "실점 직후 연결 고리를 되찾아라",
    shortMission: "56분 0–1, 창의성과 중원 연결을 보강하며 추가 실점을 막아라",
    mission:
      "막 실점한 흐름에서 패스 연결을 살리되 전진하는 순간의 후방 균형까지 유지하라.",
    opponentShape: "4-1-2-3 · 선제골 직후 압박",
    observations: [
      "전반은 0–0으로 끝났다.",
      "멕시코의 마테오 차베스가 55분 선제골을 넣었다.",
      "체코는 아직 교체 카드를 사용하지 않았다.",
      "실점 직후 첫 카드로 전진 연결의 방향을 바꿀 수 있다.",
    ],
    timeline: [
      ["HT", "0–0", "neutral"],
      ["55′", "멕시코 선제골", "danger"],
      ["56′", "당신의 결정", "neutral"],
    ],
    actualRole: "측면 공격수 대신 연결형 미드필더 투입",
  },
  {
    id: "mex-m53-possession-72",
    matchId: "cze-mex-2026",
    teamId: "mex",
    minute: 72,
    score: { home: 0, away: 2 },
    remaining: 3,
    mode: "control",
    lineup: [1, 2, 3, 4, 15, 20, 19, 16, 25, 11, 18],
    bench: [8, 23, 9, 10, 24],
    actual: [19, 8],
    title: "두 골 리드, 점유의 다음 축",
    shortMission: "72분 2–0, 리드를 지키면서 전진 연결의 질을 유지하라",
    mission:
      "공격의 속도를 무리하게 높이지 않으면서 볼 순환과 전진 패스의 다음 축을 선택하라.",
    opponentShape: "공격수 보강 · 추격을 위한 직접 전개",
    observations: [
      "마테오 차베스가 55분 선제골을 넣었다.",
      "훌리안 키노네스가 61분 두 번째 골을 넣었다.",
      "멕시코는 63분 두 선수를 교체했다.",
      "에드손 알바레스는 64분 경고를 받았다.",
    ],
    timeline: [
      ["55′", "멕시코 선제골", "positive"],
      ["61′", "멕시코 추가골", "positive"],
      ["64′", "알바레스 경고", "danger"],
      ["72′", "당신의 결정", "positive"],
    ],
    actualRole: "중원 점유와 전진 연결 보강",
  },
  {
    id: "rsa-m54-break-balance-62",
    matchId: "rsa-kor-2026",
    teamId: "rsa",
    minute: 62,
    score: { home: 0, away: 0 },
    remaining: 5,
    mode: "balance",
    lineup: [1, 6, 14, 20, 21, 5, 13, 7, 10, 12, 17],
    bench: [8, 15, 23, 9, 25],
    actual: [7, 8],
    title: "0–0의 균형을 먼저 깨는 측면 카드",
    shortMission: "62분 0–0, 측면의 다른 움직임으로 경기 균형을 흔들어라",
    mission:
      "중앙 구조를 유지하면서 측면의 1대1과 크로스 선택을 바꿀 교체를 결정하라.",
    opponentShape: "3-4-3 · 하프타임 3명 교체",
    observations: [
      "전반은 득점 없이 끝났다.",
      "한국은 하프타임에 세 명을 동시에 교체했다.",
      "남아공은 아직 교체 카드를 사용하지 않았다.",
      "균형을 깨되 중앙의 수비 간격을 유지해야 한다.",
    ],
    timeline: [
      ["HT", "0–0", "neutral"],
      ["HT", "한국 3명 교체", "neutral"],
      ["62′", "당신의 결정", "positive"],
    ],
    actualRole: "측면 공격 방식과 크로스 각도 변화",
  },
  {
    id: "kor-m54-reset-backline-65",
    matchId: "rsa-kor-2026",
    teamId: "kor",
    minute: 65,
    score: { home: 1, away: 0 },
    remaining: 2,
    mode: "balance",
    lineup: [1, 2, 4, 22, 3, 6, 19, 18, 7, 24, 23],
    bench: [16, 9, 10, 17, 20],
    actual: [4, 16],
    title: "실점 직후 후방을 다시 묶어라",
    shortMission: "65분 0–1, 동점 공격의 기반을 잃지 않으며 후방 구조를 재정비하라",
    mission:
      "막 실점한 뒤 센터백 교체가 필요한 상황에서 전진 패스와 후방 간격을 함께 고려하라.",
    opponentShape: "4-2-3-1 · 선제골 직후 전환 수비",
    observations: [
      "한국은 하프타임에 세 명을 교체했다.",
      "남아공은 62분 첫 교체를 사용했다.",
      "타펠로 마세코가 63분 선제골을 넣었다.",
      "김민재의 교체 사유는 공식 경기 리포트에 명시되지 않았다.",
    ],
    timeline: [
      ["HT", "한국 3명 교체", "neutral"],
      ["62′", "남아공 첫 교체", "neutral"],
      ["63′", "남아공 선제골", "danger"],
      ["65′", "당신의 결정", "neutral"],
    ],
    actualRole: "후방 구조 재정비",
  },
];

function scoreState(seed, match) {
  const selectedIsHome = seed.teamId === match.homeTeamId;
  const own = selectedIsHome ? seed.score.home : seed.score.away;
  const opponent = selectedIsHome ? seed.score.away : seed.score.home;
  return own > opponent ? "leading" : own < opponent ? "trailing" : "level";
}

function logicalTimestamp(kickoffUtc, scenarioMinute) {
  return new Date(
    new Date(kickoffUtc).getTime() + scenarioMinute * 60_000,
  ).toISOString();
}

function minutesAtScenario(match, teamId, playerId, scenarioMinute) {
  const starters = match.lineupsByTeam[teamId];
  if (starters.includes(playerId)) return scenarioMinute;
  const entering = match.substitutionsByTeam[teamId].find(
    (item) =>
      item.inPlayerId === playerId &&
      eventMinuteValue(item.minute) <= scenarioMinute,
  );
  return entering
    ? Math.max(0, scenarioMinute - eventMinuteValue(entering.minute))
    : 0;
}

function currentCondition(match, seed, playerId, eligible) {
  const minutesInMatch = minutesAtScenario(
    match,
    seed.teamId,
    playerId,
    seed.minute,
  );
  const booking = match.events.find(
    (event) =>
      event.type === "card" &&
      event.playerId === playerId &&
      event.card === "yellow" &&
      eventMinuteValue(event.minute) <= seed.minute,
  );
  return {
    minutesInMatch,
    energyEstimate: Math.max(60, Math.round(100 - minutesInMatch * 0.42)),
    energyEstimateStatus: "derived_from_verified_minutes",
    cardStatus: booking ? "yellow" : "clear",
    injuryStatus: null,
    currentPosition: null,
    recentScheduleBurden: null,
    eligible,
    sourceIds: [sourceIds(match.id)[0]],
    verificationStatus: "partial",
  };
}

function tournamentForm(teamId, match, playerId) {
  const earlier = matches.filter(
    (candidate) =>
      candidate.matchNumber < match.matchNumber &&
      [candidate.homeTeamId, candidate.awayTeamId].includes(teamId),
  );
  const appearances = earlier.filter(
    (candidate) =>
      candidate.lineupsByTeam[teamId].includes(playerId) ||
      candidate.substitutionsByTeam[teamId].some(
        (item) => item.inPlayerId === playerId,
      ),
  );
  const minutesBeforeScenario = appearances.reduce((total, candidate) => {
    const substitutions = candidate.substitutionsByTeam[teamId] ?? [];
    const started = candidate.lineupsByTeam[teamId].includes(playerId);
    const entered = substitutions.find(
      (item) => item.inPlayerId === playerId,
    );
    if (!started && !entered) return total;
    const enteredAt = started ? 0 : eventMinuteValue(entered.minute);
    const exited = substitutions.find(
      (item) => item.outPlayerId === playerId,
    );
    const exitedAt = exited ? eventMinuteValue(exited.minute) : 90;
    return total + Math.max(0, Math.min(90, exitedAt) - enteredAt);
  }, 0);
  return {
    matchesPlayedBeforeScenario: appearances.length,
    minutesBeforeScenario:
      appearances.length === 0 ? null : minutesBeforeScenario,
    metricCoverage: 0,
    reliability: 0,
    adjustment: 0,
    status:
      appearances.length === 0 ? "no_minutes" : "insufficient_metrics",
    sourceIds: earlier.flatMap((candidate) => [sourceIds(candidate.id)[0]]),
    note:
      appearances.length === 0
        ? "이 시점 이전 월드컵 출전 없음. BASE PROFILE을 감점하지 않음."
        : "이전 경기 출전 사실은 확인했으나 시점 안전한 선수별 지표 커버리지가 없어 조정 제외.",
  };
}

const scenarios = scenarioSeeds.map((seed, globalIndex) => {
  const match = matches.find((candidate) => candidate.id === seed.matchId);
  if (!match) throw new Error(`Unknown match ${seed.matchId}`);
  const opponentTeamId =
    match.homeTeamId === seed.teamId ? match.awayTeamId : match.homeTeamId;
  const config = modeConfig[seed.mode];
  const currentLineup = ids(seed.teamId, seed.lineup);
  const benchOptions = ids(seed.teamId, seed.bench);
  const rosterForSnapshot = [...new Set([...currentLineup, ...benchOptions])];
  const scenarioTimestamp = logicalTimestamp(match.kickoffUtc, seed.minute);
  const teamOrder = scenariosForTeamOrder(seed.teamId, match.matchNumber, seed.id);

  return {
    id: seed.id,
    matchId: seed.matchId,
    selectedTeamId: seed.teamId,
    opponentTeamId,
    order: teamOrder,
    globalOrder: globalIndex + 1,
    minute: seed.minute,
    scenarioTimestamp,
    timestampBasis:
      "derived logical match-clock boundary; not an official wall-clock event timestamp",
    currentScore: seed.score,
    scoreState: scoreState(seed, match),
    substitutionsRemaining: seed.remaining,
    title: seed.title,
    shortMission: seed.shortMission,
    mission: seed.mission,
    difficulty: config.difficulty,
    observations: seed.observations,
    contextTimeline: seed.timeline.map(([at, label, tone]) => ({
      minute: at,
      label,
      tone,
    })),
    opponentShape: seed.opponentShape,
    currentLineup,
    lineupStatus:
      currentLineup.length === 10 ? "verified_red_card_reduction" : "normal",
    benchOptions,
    unavailablePlayerIds: match.unavailableByTeam[seed.teamId].map(
      (item) => item.playerId,
    ),
    attributeWeights: config.weights,
    defaultInstructions: config.defaultInstructions,
    instructionFit: config.instructionFit,
    matchupModifiers: config.matchup,
    matchupTags: config.matchupTags,
    riskRules: config.riskRules,
    tournamentFormByPlayer: Object.fromEntries(
      rosterForSnapshot.map((playerId) => [
        playerId,
        tournamentForm(seed.teamId, match, playerId),
      ]),
    ),
    currentConditionByPlayer: Object.fromEntries(
      rosterForSnapshot.map((playerId) => [
        playerId,
        currentCondition(match, seed, playerId, true),
      ]),
    ),
    evidenceRefs: [
      {
        sourceId: sourceIds(seed.matchId)[0],
        usage: "decision-input",
        observedThroughMatchMinute: seed.minute,
        observedThrough: scenarioTimestamp,
      },
      {
        sourceId: sourceIds(seed.matchId)[1],
        usage: "decision-input",
        observedThroughMatchMinute: 0,
        observedThrough: match.kickoffUtc,
      },
      {
        sourceId: "fifa-squad-list-2026-v1",
        usage: "decision-input",
        observedThroughMatchMinute: 0,
        observedThrough: "2026-06-10T23:59:59Z",
        note: "최종 명단의 신원·등록·소속팀 정보만 사용",
      },
    ],
    actualDecision: {
      minute: seed.minute,
      outPlayerId: pid(seed.teamId, seed.actual[0]),
      inPlayerId: pid(seed.teamId, seed.actual[1]),
      scoreAtDecision: seed.score,
      interpretedRole: seed.actualRole,
      interpretationStatus: "inferred",
      note:
        "OUT/IN과 시점은 공식 기록이다. 구체적인 전술 목적은 경기 상태에 기반한 해석이다.",
      parallelDecision: seed.parallelDecision ?? null,
      sourceIds: [sourceIds(seed.matchId)[0]],
      usage: "result-only",
    },
    resultFacts: {
      finalScore: match.finalScore,
      eventsAfterScenario: match.events.filter(
        (event) => eventMinuteValue(event.minute) > seed.minute,
      ),
      sourceIds: sourceIds(seed.matchId),
      usage: "result-only",
    },
    sourceIds: sourceIds(seed.matchId),
    verificationStatus: "verified_official",
  };
});

function scenariosForTeamOrder(teamId, matchNumber, scenarioId) {
  const earlier = scenarioSeeds.filter((candidate) => {
    if (candidate.teamId !== teamId) return false;
    const candidateNumber = sourceMeta[candidate.matchId].matchNumber;
    return (
      candidateNumber < matchNumber ||
      (candidateNumber === matchNumber &&
        scenarioSeeds.indexOf(candidate) <
          scenarioSeeds.findIndex((item) => item.id === scenarioId))
    );
  });
  return earlier.length + 1;
}

const matchSourceEntries = Object.entries(sourceMeta).flatMap(
  ([, meta]) => {
    const number = String(meta.matchNumber).padStart(2, "0");
    const fdpBase = `https://fdp.fifa.org/assetspublic/ce281/${meta.resourceId}/pdf`;
    const common = {
      accessedAt: "2026-07-27",
      competition: "FIFA World Cup 2026",
      season: "2026",
      teamId: null,
      playerId: null,
      usagePermission: "restricted",
      usageLocation: "existing verified match facts",
      usageTerms:
        "기존 프로젝트에 이미 포함된 경기 사실의 검증 근거입니다. 이번 BASE 원자료 수집에는 사용하지 않습니다.",
      transformation: "BASE PROFILE 성능 원자료로 변환하지 않음",
      notes:
        "공개된 공식 사실 데이터만 편집 인용. FIFA 표·그래픽·사진은 복제하지 않음.",
    };
    return [
      {
        id: `fifa-ftr-m${number}`,
        sourceName: `FIFA Full-Time Match Report M${number}`,
        sourceType: "official_full_time_match_report",
        publisher: "FIFA",
        url: `${fdpBase}/FullTimeMatchReport-English.pdf`,
        metricCoverage: [
          "match",
          "startingXI",
          "bench",
          "substitutions",
          "goals",
          "cards",
        ],
        ...common,
      },
      {
        id: `fifa-tactical-m${number}`,
        sourceName: `FIFA Tactical Line-up M${number}`,
        sourceType: "official_tactical_lineup",
        publisher: "FIFA",
        url: `${fdpBase}/TacticalLineup-English.pdf`,
        metricCoverage: ["startingFormation", "startingPlayerPositions"],
        ...common,
      },
      {
        id: `fifa-pmsr-m${number}`,
        sourceName: `FIFA Post-Match Summary Report M${number}`,
        sourceType: "official_post_match_summary_report",
        publisher: "FIFA Training Centre",
        url: `https://www.fifatrainingcentre.com/media/native/tournaments/fifa-world-cup/2026/${meta.pmsr}`,
        metricCoverage: [
          "match",
          "playerMatchMetrics",
          "formations",
          "events",
        ],
        ...common,
        notes:
          "결과 화면 교차검증과 결과 사실에만 사용. 해당 경기의 결정 점수에는 사용하지 않음.",
      },
      {
        id: `fifa-api-m${number}`,
        sourceName: `FIFA official match data API M${number}`,
        sourceType: "official_match_data_api",
        publisher: "FIFA",
        url: `https://api.fifa.com/api/v3/live/football/17/285023/289273/${meta.fifaMatchId}?language=en`,
        metricCoverage: [
          "matchdayPlayers",
          "status",
          "substitutions",
          "bookings",
        ],
        ...common,
      },
      {
        id: `fifa-article-m${number}`,
        sourceName: `FIFA official match article M${number}`,
        sourceType: "official_match_article",
        publisher: "FIFA",
        url: meta.article,
        metricCoverage: ["score", "goals", "matchContext"],
        ...common,
      },
    ];
  },
);

const registryPath = path.join(dataRoot, "sources", "sourceRegistry.json");
const existingRegistry = fs.existsSync(registryPath)
  ? JSON.parse(fs.readFileSync(registryPath, "utf8"))
  : [];
const supersededRegistryIds = new Set(
  Object.values(sourceMeta).map(
    (meta) => `fifa-match-report-m${String(meta.matchNumber).padStart(2, "0")}`,
  ),
);
const normalizedExistingRegistry = existingRegistry
  .filter((entry) => !supersededRegistryIds.has(entry.id))
  .map((entry) => ({
    ...entry,
    sourceName: entry.sourceName ?? entry.title ?? entry.id,
    competition: entry.competition ?? "FIFA World Cup 2026",
    season: entry.season ?? "2026",
    teamId: entry.teamId ?? null,
    playerId: entry.playerId ?? null,
    metricCoverage: entry.metricCoverage ?? entry.covers ?? [],
    usagePermission: entry.usagePermission ?? "unknown",
    notes: entry.notes ?? entry.verificationNote ?? "",
  }));
const registryById = new Map(
  [...normalizedExistingRegistry, ...matchSourceEntries].map((entry) => [
    entry.id,
    entry,
  ]),
);

const clubAssociationCodes = [
  ...new Set(
    players
      .map((player) => player.club?.associationCode)
      .filter((code) => typeof code === "string" && code.length > 0),
  ),
].sort((left, right) => left.localeCompare(right, "en"));
const leagues = clubAssociationCodes.map((associationCode) => ({
  id: `association-${associationCode.toLowerCase()}`,
  name: `${associationCode} club-association context`,
  associationCode,
  nameStatus: "league_unidentified",
  sourceIds: ["fifa-squad-list-2026-v1"],
  note:
    "FIFA 최종 명단은 클럽 협회 코드는 제공하지만 리그·시즌을 완전하게 식별하지 않는다. 이 행을 실제 리그 순위로 해석하지 않는다.",
}));
const leagueStrength = leagues.map((league) => ({
  leagueId: league.id,
  indexName: "TOUCHLINE League Strength Index",
  strengthFactor: 1,
  confidence: "low",
  sourceStatus: "incomplete",
  attributeImpactLimit: 0,
  applied: false,
  sourceIds: league.sourceIds,
  note:
    "리그를 같은 척도로 연결할 검증 근거를 확보하지 못해 보정을 적용하지 않음. 1.00은 중립 승수가 아니라 미적용 표기이며 속성 영향은 0이다.",
}));

for (const directory of [
  path.join(dataRoot, "matches", "group-a"),
  path.join(dataRoot, "scenarios", "group-a"),
  path.join(dataRoot, "leagues"),
  path.join(dataRoot, "club-performance"),
  path.join(dataRoot, "national-performance"),
  path.join(dataRoot, "tournament"),
]) {
  fs.mkdirSync(directory, { recursive: true });
}

fs.writeFileSync(playersPath, `${JSON.stringify(players, null, 2)}\n`);

for (const match of matches) {
  const file = matchSeeds.find((seed) => seed.id === match.id).file;
  fs.writeFileSync(
    path.join(dataRoot, "matches", "group-a", file),
    `${JSON.stringify(match, null, 2)}\n`,
  );
}

const commonBaseReviewSourceIds = [
  "base-audit-fifa-terms",
  "base-audit-uefa-terms",
  "base-audit-openfootball",
  "base-audit-openligadb",
  "base-audit-wikidata",
  "base-audit-skillcorner-open-data",
  "base-audit-wyscout-events",
  "base-audit-statsbomb-open-data",
  "base-audit-football-data-api",
  "base-audit-sportmonks-api",
  "base-audit-sports-reference-policy",
];
const domesticBaseReviewSourceId = {
  kor: "base-audit-kleague-portal",
  cze: "base-audit-chance-liga-copyright",
  mex: "base-audit-liga-mx-statistics",
  rsa: "base-audit-psl-terms",
};

function preservePerformanceRecords(filePath, templates) {
  const existingByPlayerId = new Map(
    (fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf8"))
      : []
    ).map((profile) => [profile.playerId, profile]),
  );
  return templates.map((template) => {
    const existing = existingByPlayerId.get(template.playerId);
    if (!existing) return template;
    return {
      ...template,
      ...existing,
      playerId: template.playerId,
      period: template.period,
      priority: template.priority,
      records: Array.isArray(existing.records) ? existing.records : [],
      sourceIds: Array.isArray(existing.sourceIds)
        ? existing.sourceIds
        : [],
      reviewedSourceIds: [
        ...new Set([
          ...template.reviewedSourceIds,
          ...(existing.reviewedSourceIds ?? []),
        ]),
      ],
    };
  });
}

for (const teamId of ["kor", "cze", "mex", "rsa"]) {
  const teamScenarios = scenarios.filter(
    (scenario) => scenario.selectedTeamId === teamId,
  );
  fs.writeFileSync(
    path.join(dataRoot, "scenarios", "group-a", `${teamId}.json`),
    `${JSON.stringify(teamScenarios, null, 2)}\n`,
  );
  const records = players
    .filter((player) => player.teamId === teamId)
    .map((player) => ({
      playerId: player.id,
      period: { start: "2025-06-11", end: "2026-06-10" },
      priority: scenarios.some(
        (scenario) =>
          scenario.currentLineup.includes(player.id) ||
          scenario.benchOptions.includes(player.id) ||
          scenario.actualDecision.outPlayerId === player.id ||
          scenario.actualDecision.inPlayerId === player.id,
      )
        ? "P0"
        : "P1",
      collectionStatus: "incomplete",
      records: [],
      sourceIds: [],
      reviewedSourceIds: [
        ...commonBaseReviewSourceIds,
        domesticBaseReviewSourceId[teamId],
      ],
      missingReason:
        "분석 기간과 공개 재사용 권리를 모두 충족하는 선수 단위 성능 출처를 확보하지 못했습니다.",
    }));
  for (const domain of ["club", "national"]) {
    const performancePath = path.join(
      dataRoot,
      `${domain}-performance`,
      `${teamId}.json`,
    );
    fs.writeFileSync(
      performancePath,
      `${JSON.stringify(
        preservePerformanceRecords(performancePath, records),
        null,
        2,
      )}\n`,
    );
  }
}

fs.writeFileSync(
  path.join(dataRoot, "leagues", "leagues.json"),
  `${JSON.stringify(leagues, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(dataRoot, "leagues", "league-strength.json"),
  `${JSON.stringify(leagueStrength, null, 2)}\n`,
);
fs.writeFileSync(
  registryPath,
  `${JSON.stringify([...registryById.values()], null, 2)}\n`,
);
fs.writeFileSync(
  path.join(dataRoot, "tournament", "tournament.json"),
  `${JSON.stringify(
    {
      id: "fifa-world-cup-2026",
      name: "FIFA World Cup 2026",
      supportedGroupId: "group-a",
      supportedTeamIds: ["kor", "cze", "mex", "rsa"],
      baseProfileWindow: {
        from: "2025-06-11T00:00:00Z",
        through: "2026-06-10T23:59:59Z",
      },
      officialOpeningDate: "2026-06-11",
      dataPolicy:
        "본선 데이터는 Tournament Form/Current Condition/결과 사실으로만 분리하고 BASE PROFILE에 포함하지 않는다.",
      sourceIds: ["fifa-squad-list-2026-v1"],
    },
    null,
    2,
  )}\n`,
);
fs.writeFileSync(
  path.join(dataRoot, "tournament", "group-a.json"),
  `${JSON.stringify(
    {
      id: "group-a",
      teamIds: ["mex", "rsa", "kor", "cze"],
      standings: [
        {
          position: 1,
          teamId: "mex",
          played: 3,
          won: 3,
          drawn: 0,
          lost: 0,
          goalsFor: 6,
          goalsAgainst: 0,
          goalDifference: 6,
          points: 9,
        },
        {
          position: 2,
          teamId: "rsa",
          played: 3,
          won: 1,
          drawn: 1,
          lost: 1,
          goalsFor: 2,
          goalsAgainst: 3,
          goalDifference: -1,
          points: 4,
        },
        {
          position: 3,
          teamId: "kor",
          played: 3,
          won: 1,
          drawn: 0,
          lost: 2,
          goalsFor: 2,
          goalsAgainst: 3,
          goalDifference: -1,
          points: 3,
        },
        {
          position: 4,
          teamId: "cze",
          played: 3,
          won: 0,
          drawn: 1,
          lost: 2,
          goalsFor: 2,
          goalsAgainst: 6,
          goalDifference: -4,
          points: 1,
        },
      ],
      matchIds: matches.map((match) => match.id),
      sourceIds: matches.flatMap((match) => [sourceIds(match.id)[0]]),
      verificationStatus: "verified_official",
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Generated ${matches.length} matches, ${scenarios.length} scenarios, ${players.length} player record links, ${leagueStrength.length} TLSI records.`,
);
