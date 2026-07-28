"use client";

import { useDraggable } from "@dnd-kit/core";
import rolesData from "@/data/roles/roles.json";
import type { Player, Role } from "@/data/types";
import { Badge } from "@/components/common/Badge";

const roleCatalog = rolesData as Role[];

const officialPositionLabels: Record<Player["officialPosition"], string> = {
  GK: "골키퍼",
  DF: "수비수",
  MF: "미드필더",
  FW: "공격수",
};

const positionGroupLabels: Record<
  Player["positionGroupCandidates"][number],
  string
> = {
  GK: "골키퍼",
  CB: "센터백",
  FB_WB: "풀백·윙백",
  DM: "수비형 미드필더",
  CM_AM: "중앙·공격형 미드필더",
  WINGER: "윙어",
  STRIKER: "스트라이커",
};

function formatPositionCandidates(player: Player): string {
  const candidates =
    player.positionGroupCandidates.length > 0
      ? player.positionGroupCandidates
      : player.positionGroup
        ? [player.positionGroup]
        : [];

  return candidates.length > 0
    ? candidates.map((candidate) => positionGroupLabels[candidate]).join(" · ")
    : "세부 위치 미확인";
}

function formatRoleCandidates(player: Player): string {
  const positionGroups =
    player.positionGroupCandidates.length > 0
      ? player.positionGroupCandidates
      : player.positionGroup
        ? [player.positionGroup]
        : [];
  const candidates = roleCatalog.filter((role) =>
    role.allowedPositionGroups.some((group) => positionGroups.includes(group)),
  );

  return candidates.length > 0
    ? candidates.map((candidate) => candidate.shortName).join(" · ")
    : "역할 후보 미확인";
}

function formatSourceStatus(player: Player): string {
  switch (player.sourceStatus) {
    case "verified":
      return "공식 기록 확인";
    case "derived":
      return "공식 기록 기반 파생";
    case "neutral-baseline":
      return "중립 기준값";
    case "incomplete":
      return "공식 명단 확인 · 성과 지표 미확보";
  }
}

export function BenchPlayerCard({
  player,
  selected,
  fitScore,
  onSelect,
}: {
  player: Player;
  selected: boolean;
  fitScore?: number;
  onSelect: (playerId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `bench-${player.id}`,
    data: { playerId: player.id, type: "bench-player" },
  });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  const activeAttributes =
    player.activeAttributeModel === "goalkeeper"
      ? player.goalkeeperAttributes
      : player.attributes;
  const measuredAttributeCount = Object.values(activeAttributes).filter(
    (value) => typeof value === "number" && Number.isFinite(value),
  ).length;
  const condition = player.currentCondition;

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      onClick={() => onSelect(player.id)}
      {...listeners}
      {...attributes}
      aria-pressed={selected}
      aria-label={`${player.name}, ${player.position}. 투입 선수로 클릭 선택${
        typeof fitScore === "number"
          ? `. 전술 선택 적합도 ${fitScore}; 승률 또는 선수 절대 능력치가 아님`
          : ""
      }`}
      className={`relative z-10 min-w-0 w-full rounded-xl border p-3 text-left transition ${
        selected
          ? "border-[#65d89a]/65 bg-[#65d89a]/10 shadow-[0_8px_24px_rgba(20,110,72,.18)]"
          : "border-white/[.08] bg-white/[.035] hover:border-white/20 hover:bg-white/[.06]"
      } ${isDragging ? "opacity-55" : ""}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-black ${
            selected
              ? "border-[#65d89a] bg-[#0a3c2c] text-[#8cebb4]"
              : "border-white/25 bg-[#0a1422] text-white"
          }`}
        >
          {player.shirtNumber}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center justify-between gap-2">
            <span className="truncate text-sm font-black text-white">{player.name}</span>
            {typeof fitScore === "number" && (
              <span
                className="shrink-0 text-right"
                aria-label={`앱 파생 전술 선택 적합도 ${fitScore}. 승률 또는 선수 절대 능력치가 아님`}
              >
                <span className="number-tabular block text-sm font-black text-[#f4b860]">
                  전술 선택 적합도 {fitScore}
                </span>
                <span className="mt-0.5 block text-[11px] font-bold text-[#8f9baa]">
                  승률·절대 능력치 아님
                </span>
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-xs font-medium text-[#a8b1bf]">
            공식 등록 {player.officialPosition} ·{" "}
            {officialPositionLabels[player.officialPosition]}
          </span>
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge tone="blue">벤치 · IN 후보</Badge>
        <Badge>
          현재{" "}
          {condition ? `${condition.minutesInMatch}분` : "출전시간 미확인"}
        </Badge>
        <Badge tone={condition?.cardStatus === "yellow" ? "danger" : "neutral"}>
          {condition
            ? condition.cardStatus === "yellow"
              ? "경고 보유"
              : "경고 없음"
            : "경고 미확인"}
        </Badge>
        <Badge
          tone={
            condition?.eligible === false
              ? "danger"
              : condition?.eligible
                ? "green"
                : "neutral"
          }
        >
          {condition
            ? condition.eligible
              ? "교체 가능"
              : "교체 불가"
            : "교체 가능 여부 미확인"}
        </Badge>
      </div>
      <dl className="mt-2.5 grid gap-1.5 rounded-lg border border-white/[.06] bg-black/10 px-2.5 py-2 text-[11px] leading-4">
        <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-2">
          <dt className="font-bold text-[#7f8b9b]">세부 위치 후보</dt>
          <dd className="font-bold text-[#c7ced9]">{formatPositionCandidates(player)}</dd>
        </div>
        <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-2">
          <dt className="font-bold text-[#7f8b9b]">역할 후보군</dt>
          <dd className="font-bold text-[#c7ced9]">
            공식 분류 기반 · {formatRoleCandidates(player)}
          </dd>
        </div>
      </dl>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge tone="gold">
          출전 시간 기반 컨디션 추정 ·{" "}
          {player.fitness === null ? "미산정" : player.fitness}
        </Badge>
        {measuredAttributeCount > 0 && (
          <Badge tone="green">최근 1년 세부 지표 {measuredAttributeCount}개 확인</Badge>
        )}
      </div>
      {player.sourceStatus !== "incomplete" && (
        <p className="mt-2 text-xs font-medium leading-5 text-[#8793a3]">
          데이터 상태 · {formatSourceStatus(player)}
        </p>
      )}
      <span
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 text-[11px] text-white/20 lg:block"
        aria-hidden="true"
        title="실험적 드래그 보조"
      >
        ⠿
      </span>
    </button>
  );
}
