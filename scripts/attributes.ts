import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { Player } from "../src/data/types";
import {
  ATTRIBUTE_MODEL_VERSION,
  buildPositionGroupComparisonSamples,
  deriveAllPlayerAttributes,
  derivePlayerAttributeResults,
} from "../src/lib/attributes/reproducePlayerAttributes";

const projectRoot = path.resolve(__dirname, "..");
const playersPath = path.join(
  projectRoot,
  "src",
  "test",
  "fixtures",
  "legacy",
  "attribute-model-players.json",
);

const source = readFileSync(playersPath, "utf8");
const players = JSON.parse(source) as Player[];
const generated = deriveAllPlayerAttributes(players);
const writeMode = process.argv.includes("--write");
const explainArgument = process.argv.find((argument) =>
  argument.startsWith("--explain="),
);

const mismatches = players.flatMap((player) => {
  const expected = generated[player.id];
  return Object.entries(expected).flatMap(([attribute, value]) =>
    player.attributes[attribute as keyof typeof player.attributes] === value
      ? []
      : [
          {
            player: `${player.name} (${player.id})`,
            attribute,
            stored:
              player.attributes[attribute as keyof typeof player.attributes],
            generated: value,
          },
        ],
  );
});

if (writeMode) {
  const updatedPlayers = players.map((player) => ({
    ...player,
    attributes: generated[player.id],
  }));
  writeFileSync(
    playersPath,
    `${JSON.stringify(updatedPlayers, null, 2)}\n`,
    "utf8",
  );
  console.log(
    `[attributes] ${updatedPlayers.length}명 선수의 저장 능력치를 ${ATTRIBUTE_MODEL_VERSION} 모델로 갱신했습니다.`,
  );
} else if (mismatches.length > 0) {
  console.error(
    `[attributes] ${ATTRIBUTE_MODEL_VERSION}: 저장값과 파생값 ${mismatches.length}개가 다릅니다.`,
  );
  console.table(mismatches);
  console.error("수정하려면 `npm run attributes:generate`를 실행하세요.");
  process.exitCode = 1;
} else {
  console.log(
    `[attributes] ${ATTRIBUTE_MODEL_VERSION}: ${players.length}명 × 8개 능력치가 모두 재현됩니다.`,
  );
}

const sampleSummary = Object.fromEntries(
  [
    ...new Set(
      players.flatMap((player) =>
        player.positionGroup ? [player.positionGroup] : [],
      ),
    ),
  ].map(
    (positionGroup) => {
      const samples = buildPositionGroupComparisonSamples(
        players,
        positionGroup,
      );
      return [
        positionGroup,
        {
          observedPlayers: players.filter(
            (player) =>
              player.positionGroup === positionGroup &&
              player.rawMetrics !== null &&
              (player.minutesPlayed ?? 0) > 0,
          ).length,
          metrics: Object.keys(samples).length,
        },
      ];
    },
  ),
);
console.log("[attributes] 포지션 그룹 비교 표본:", sampleSummary);

if (explainArgument) {
  const playerId = explainArgument.slice("--explain=".length);
  const player = players.find((candidate) => candidate.id === playerId);

  if (!player) {
    console.error(`[attributes] '${playerId}' 선수를 찾을 수 없습니다.`);
    process.exitCode = 1;
  } else {
    console.dir(
      {
        player: {
          id: player.id,
          name: player.name,
          positionGroup: player.positionGroup,
          minutesPlayed: player.minutesPlayed,
          confidence: player.confidence,
        },
        results: derivePlayerAttributeResults(player, players),
      },
      { depth: null },
    );
  }
}
