import { Badge } from "@/components/common/Badge";
import rolesData from "@/data/roles/roles.json";
import type {
  AttributeKey,
  GoalkeeperAttributeKey,
  Player,
  Role,
} from "@/data/types";
import { calculateEffectiveAttribute } from "@/lib/attributes/baseProfile";
import {
  ATTRIBUTE_LABELS,
  type DecisionEvaluation,
} from "@/lib/decision/evaluateDecision";

const roleCatalog = rolesData as Role[];

const fieldAttributeKeys: readonly AttributeKey[] = [
  "finishing",
  "chanceCreation",
  "dribbling",
  "passing",
  "pressing",
  "defending",
  "aerial",
  "impact",
];

const goalkeeperAttributeKeys: readonly GoalkeeperAttributeKey[] = [
  "shotStopping",
  "distribution",
  "aerialCommand",
  "sweeping",
  "penaltySaving",
  "stability",
  "buildUp",
  "impact",
];

const goalkeeperAttributeLabels: Record<GoalkeeperAttributeKey, string> = {
  shotStopping: "선방",
  distribution: "배급",
  aerialCommand: "공중볼 장악",
  sweeping: "스위핑",
  penaltySaving: "페널티 대응",
  stability: "안정성",
  buildUp: "빌드업",
  impact: "임팩트",
};

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

type ComparisonModel = "field" | "goalkeeper";
type ComparisonKey = AttributeKey | GoalkeeperAttributeKey;

function getAttributeKeys(model: ComparisonModel): readonly ComparisonKey[] {
  return model === "goalkeeper"
    ? goalkeeperAttributeKeys
    : fieldAttributeKeys;
}

function getAttributeLabel(
  model: ComparisonModel,
  key: ComparisonKey,
): string {
  return model === "goalkeeper"
    ? goalkeeperAttributeLabels[key as GoalkeeperAttributeKey]
    : ATTRIBUTE_LABELS[key as AttributeKey];
}

function getAttributeValue(
  player: Player,
  model: ComparisonModel,
  key: ComparisonKey,
): number | null {
  if (player.activeAttributeModel !== model) return null;
  return model === "goalkeeper"
    ? player.goalkeeperAttributes[key as GoalkeeperAttributeKey]
    : player.attributes[key as AttributeKey];
}

function isMeasured(value: number | null): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function getAttributeSnapshot(
  player: Player,
  model: ComparisonModel,
  key: ComparisonKey,
) {
  const base = getAttributeValue(player, model, key);
  const form = player.tournamentForm?.adjustment ?? 0;
  return {
    base,
    form,
    effective: calculateEffectiveAttribute(base, form),
  };
}

function getPositionCandidates(player: Player): string {
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

function getRoleCandidates(player: Player): Role[] {
  const positionGroups =
    player.positionGroupCandidates.length > 0
      ? player.positionGroupCandidates
      : player.positionGroup
        ? [player.positionGroup]
        : [];

  return roleCatalog.filter((candidate) =>
    candidate.allowedPositionGroups.some((group) =>
      positionGroups.includes(group),
    ),
  );
}

function getSourceStatus(player: Player): string {
  switch (player.sourceStatus) {
    case "verified":
      return "공식 기록 확인";
    case "derived":
      return "공식 기록 기반 파생";
    case "neutral-baseline":
      return "중립 기준값";
    case "incomplete":
      return "공식 명단 확인 · 최근 1년 성과 원자료 미확보";
  }
}

function PlayerHeader({
  player,
  label,
  tone,
}: {
  player: Player;
  label: string;
  tone: "out" | "in";
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-sm font-black ${
          tone === "in"
            ? "border-[#65d89a]/55 bg-[#65d89a]/10 text-[#82e6ac]"
            : "border-[#ff806d]/45 bg-[#ff806d]/9 text-[#ff9e90]"
        }`}
      >
        {player.shirtNumber}
      </span>
      <div className="min-w-0">
        <span className="block text-xs font-black tracking-[.12em] text-[#9aa5b4]">
          {label}
        </span>
        <strong className="block truncate text-sm text-white">{player.name}</strong>
        <span className="block truncate text-xs text-[#a8b1bf]">
          공식 {player.officialPosition} ·{" "}
          {officialPositionLabels[player.officialPosition]}
        </span>
      </div>
    </div>
  );
}

function CurrentStateCard({
  player,
  stateLabel,
  tone,
}: {
  player: Player;
  stateLabel: string;
  tone: "out" | "in";
}) {
  const condition = player.currentCondition;
  const rows = [
    ["공식 등록 포지션", `${player.officialPosition} · ${officialPositionLabels[player.officialPosition]}`],
    ["미션 시점", stateLabel],
    ["현재 출전 시간", condition ? `${condition.minutesInMatch}분` : "미확인"],
    [
      "경고",
      condition
        ? condition.cardStatus === "yellow"
          ? "경고 보유"
          : "경고 없음"
        : "미확인",
    ],
    [
      "교체 자격",
      condition ? (condition.eligible ? "가능" : "불가") : "미확인",
    ],
    [
      "출전 시간 기반 컨디션 추정",
      condition ? `${condition.energyEstimate}` : "미산정",
    ],
    ["전술 태그", player.tags.length > 0 ? player.tags.join(" · ") : "확인 없음"],
    ["데이터 상태", getSourceStatus(player)],
  ];

  return (
    <div
      className={`rounded-xl border p-3 ${
        tone === "in"
          ? "border-[#65d89a]/16 bg-[#65d89a]/[.035]"
          : "border-[#ff806d]/14 bg-[#ff806d]/[.025]"
      }`}
    >
      <strong
        className={`text-xs font-black ${
          tone === "in" ? "text-[#82e6ac]" : "text-[#ff9e90]"
        }`}
      >
        {tone === "in" ? "IN" : "OUT"} · {player.name}
      </strong>
      <dl className="mt-2.5 grid gap-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[minmax(96px,.8fr)_minmax(0,1.2fr)] gap-2 text-[11px] leading-4"
          >
            <dt className="font-bold text-[#7f8b9b]">{label}</dt>
            <dd className="font-bold text-[#d5dbe3]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function AttributeSnapshot({
  base,
  form,
  effective,
}: {
  base: number | null;
  form: number;
  effective: number | null;
}) {
  return (
    <span className="inline-grid justify-items-end gap-0.5">
      <span className="font-black">BASE {base}</span>
      <span className="text-[11px] font-medium text-[#9aa5b4]">
        Form {form > 0 ? "+" : ""}
        {form.toFixed(1)}
      </span>
      <span className="text-[11px] font-black text-white">
        Effective {effective}
      </span>
    </span>
  );
}

function DeltaValue({ value }: { value: number }) {
  return (
    <span
      className={`number-tabular font-black ${
        value > 0
          ? "text-[#82e6ac]"
          : value < 0
            ? "text-[#ff9e90]"
            : "text-[#a8b1bf]"
      }`}
    >
      {value > 0 ? "+" : ""}
      {value}
    </span>
  );
}

export function PlayerComparison({
  outgoing,
  incoming,
  role,
  evaluation,
}: {
  outgoing: Player | null;
  incoming: Player | null;
  role: Role | null;
  evaluation?: DecisionEvaluation | null;
}) {
  if (!outgoing || !incoming) {
    return (
      <section className="panel-soft p-4" aria-label="선수 비교">
        <p className="text-xs font-black tracking-[.13em] text-[#9aa5b4]">
          PLAYER COMPARE
        </p>
        <div className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
          <span className="text-2xl text-white/25">↔</span>
          <p className="mt-2 text-sm font-bold leading-6 text-[#a8b1bf]">
            필드에서 OUT 선수를 고르고
            <br />
            벤치에서 IN 선수를 선택하세요.
          </p>
        </div>
      </section>
    );
  }

  const comparisonModel = incoming.activeAttributeModel;
  const comparableKeys =
    outgoing.activeAttributeModel === comparisonModel
      ? getAttributeKeys(comparisonModel).filter(
          (key) =>
            isMeasured(getAttributeValue(outgoing, comparisonModel, key)) &&
            isMeasured(getAttributeValue(incoming, comparisonModel, key)),
        )
      : [];
  const incomingRoleCandidates = getRoleCandidates(incoming);

  return (
    <section className="panel-soft p-4" aria-labelledby="compare-title">
      <p
        id="compare-title"
        className="text-xs font-black tracking-[.13em] text-[#9aa5b4]"
      >
        PLAYER COMPARE
      </p>
      <div className="mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <PlayerHeader player={outgoing} label="OUT" tone="out" />
        <span className="text-white/25">→</span>
        <PlayerHeader player={incoming} label="IN" tone="in" />
      </div>

      <section className="mt-5" aria-labelledby="current-state-title">
        <h3
          id="current-state-title"
          className="text-xs font-black text-[#dce3ec]"
        >
          A. 현재 경기 상태 비교
        </h3>
        <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
          <CurrentStateCard
            player={outgoing}
            stateLabel="현재 필드 · OUT 후보"
            tone="out"
          />
          <CurrentStateCard
            player={incoming}
            stateLabel="벤치 · IN 후보"
            tone="in"
          />
        </div>
        <div className="mt-2.5 rounded-lg border border-white/[.07] bg-black/10 px-3 py-2 text-xs leading-5 text-[#c7ced9]">
          <strong className="text-white">OUT→IN 변화</strong> · 필드{" "}
          {outgoing.currentCondition?.minutesInMatch ?? "미확인"}분의{" "}
          {outgoing.name} OUT → 벤치{" "}
          {incoming.currentCondition?.minutesInMatch ?? "미확인"}분의{" "}
          {incoming.name} IN
        </div>
      </section>

      <section
        className="mt-5 border-t border-white/[.07] pt-4"
        aria-labelledby="role-comparison-title"
      >
        <h3
          id="role-comparison-title"
          className="text-xs font-black text-[#dce3ec]"
        >
          B. 전술 역할 비교
        </h3>
        <div className="mt-2.5 grid gap-2 rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-xs leading-5">
          <div>
            <span className="font-black text-[#9aa5b4]">세부 위치 후보</span>
            <p className="mt-0.5 text-[#d5dbe3]">
              <strong className="text-[#ff9e90]">OUT</strong> ·{" "}
              {getPositionCandidates(outgoing)}
              <br />
              <strong className="text-[#82e6ac]">IN</strong> ·{" "}
              {getPositionCandidates(incoming)}
            </p>
          </div>
          <div>
            <span className="font-black text-[#9aa5b4]">
              IN 역할 후보 · 공식 등록 위치의 후보군 기준
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {incomingRoleCandidates.length > 0 ? (
                incomingRoleCandidates.map((candidate) => (
                  <Badge
                    key={candidate.roleId}
                    tone={role?.roleId === candidate.roleId ? "gold" : "neutral"}
                  >
                    {candidate.shortName}
                  </Badge>
                ))
              ) : (
                <Badge>역할 후보 미확인</Badge>
              )}
            </div>
          </div>
          {role ? (
            <>
              <div className="rounded-lg border border-[#f4b860]/18 bg-[#f4b860]/[.055] p-2.5">
                <strong className="text-[#f7c979]">선택 역할 · {role.name}</strong>
                <p className="mt-1 text-[#c7ced9]">{role.description}</p>
                <p className="mt-1 text-[11px] text-[#9aa5b4]">
                  역할 핵심 항목 ·{" "}
                  {role.preferredAttributes
                    .map((attribute) => ATTRIBUTE_LABELS[attribute])
                    .join(" · ")}
                  {" "}· 실제 성과 수치 주장 아님
                </p>
              </div>
              {evaluation && (
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-[#75b9ff]/15 bg-[#75b9ff]/[.04] p-2.5">
                    <strong className="text-[#b9dcff]">
                      상대 전술 적합 근거
                    </strong>
                    <p className="mt-1 text-[11px] text-[#aebaca]">
                      {evaluation.matchupReasons.length > 0
                        ? evaluation.matchupReasons.join(" · ")
                        : "현재 역할·태그가 직접 충족한 상대 매치업 가산 규칙 없음"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#65d89a]/15 bg-[#65d89a]/[.04] p-2.5">
                    <strong className="text-[#82e6ac]">예상 장점</strong>
                    <p className="mt-1 text-[11px] text-[#b7c9c0]">
                      {evaluation.explanation.benefits.slice(0, 2).join(" · ")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#ff806d]/15 bg-[#ff806d]/[.04] p-2.5">
                    <strong className="text-[#ffad9f]">예상 위험</strong>
                    <p className="mt-1 text-[11px] text-[#d6b2ac]">
                      {evaluation.explanation.risks.slice(0, 2).join(" · ")}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-[#a8b1bf]">
              역할을 선택하면 의도와 역할 핵심 항목을 여기서 확인할 수 있습니다.
            </p>
          )}
        </div>
      </section>

      <section
        className="mt-5 border-t border-white/[.07] pt-4"
        aria-labelledby="performance-data-title"
      >
        <h3
          id="performance-data-title"
          className="text-xs font-black text-[#dce3ec]"
        >
          C. 선수 성과 데이터
        </h3>
        {comparableKeys.length === 0 ? (
          <div
            className="mt-2.5 rounded-xl border border-[#75b9ff]/18 bg-[#75b9ff]/[.055] p-3"
            role="status"
          >
            <strong className="text-sm text-[#b9dcff]">
              비교 가능한 최근 1년 세부 지표가 없습니다.
            </strong>
            <p className="mt-1.5 text-xs leading-5 text-[#aebaca]">
              공개·재사용 조건을 확인한 OUT·IN 공통 선수 성과 데이터가 없어
              빈 1–20 비교표를 숨겼습니다. 데이터가 없다는 사실은 선수의 절대
              능력이 낮다는 뜻이 아닙니다.
            </p>
            <a
              href="/about-data#base-profile-sources"
              className="mt-2 inline-flex min-h-7 items-center rounded-full border border-[#6fb6ff]/25 bg-[#6fb6ff]/10 px-2.5 text-xs font-black text-[#9acbff] hover:border-[#6fb6ff]/50"
            >
              출처·계산 근거 보기
            </a>
          </div>
        ) : (
          <>
            <div className="mt-2.5 hidden overflow-hidden rounded-xl border border-white/[.08] sm:block">
              <table className="w-full border-collapse text-left text-xs">
                <caption className="sr-only">
                  OUT·IN 공통 최근 1년 세부 지표 비교
                </caption>
                <thead className="bg-white/[.045] text-[#a8b1bf]">
                  <tr>
                    <th className="px-3 py-2.5 font-black">지표</th>
                    <th className="px-2 py-2.5 text-right font-black">
                      OUT · {outgoing.name}
                    </th>
                    <th className="px-2 py-2.5 text-right font-black">
                      IN · {incoming.name}
                    </th>
                    <th className="px-3 py-2.5 text-right font-black">변화</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[.06]">
                  {comparableKeys.map((key) => {
                    const outgoingSnapshot = getAttributeSnapshot(
                      outgoing,
                      comparisonModel,
                      key,
                    );
                    const incomingSnapshot = getAttributeSnapshot(
                      incoming,
                      comparisonModel,
                      key,
                    );
                    const delta =
                      (incomingSnapshot.effective as number) -
                      (outgoingSnapshot.effective as number);
                    const isImportant =
                      comparisonModel === "field" &&
                      (role?.preferredAttributes.includes(key as AttributeKey) ??
                        false);

                    return (
                      <tr
                        key={key}
                        className={
                          isImportant ? "bg-[#f4b860]/[.055]" : undefined
                        }
                      >
                        <th className="px-3 py-2.5 font-bold text-[#d5dbe3]">
                          {getAttributeLabel(comparisonModel, key)}
                          {isImportant && (
                            <span className="ml-2 text-[11px] font-black text-[#f7c979]">
                              역할 핵심
                            </span>
                          )}
                        </th>
                        <td className="number-tabular px-2 py-2.5 text-right text-[#c7ced9]">
                          <AttributeSnapshot {...outgoingSnapshot} />
                        </td>
                        <td className="number-tabular px-2 py-2.5 text-right text-white">
                          <AttributeSnapshot {...incomingSnapshot} />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <DeltaValue value={delta} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul
              className="mt-2.5 grid grid-cols-2 gap-2 sm:hidden"
              aria-label="공통 선수 성과 지표 비교"
            >
              {comparableKeys.map((key) => {
                const outgoingSnapshot = getAttributeSnapshot(
                  outgoing,
                  comparisonModel,
                  key,
                );
                const incomingSnapshot = getAttributeSnapshot(
                  incoming,
                  comparisonModel,
                  key,
                );
                const delta =
                  (incomingSnapshot.effective as number) -
                  (outgoingSnapshot.effective as number);

                return (
                  <li
                    key={key}
                    className="rounded-xl border border-white/[.08] bg-white/[.025] p-3"
                  >
                    <span className="text-xs font-bold text-[#d5dbe3]">
                      {getAttributeLabel(comparisonModel, key)}
                    </span>
                    <div className="mt-2 grid gap-1 text-[11px]">
                      <span className="flex justify-between gap-2 text-[#a8b1bf]">
                        OUT <AttributeSnapshot {...outgoingSnapshot} />
                      </span>
                      <span className="flex justify-between gap-2 text-white">
                        IN <AttributeSnapshot {...incomingSnapshot} />
                      </span>
                      <span className="mt-1 text-right">
                        <DeltaValue value={delta} />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[11px] leading-5 text-[#8f9baa]">
              공개 근거가 양쪽 모두 확인된 공통 지표만 비교하며, 없는 지표의
              가중치는 다시 나눕니다. 1–20 값은 승률이나 선수의 절대 능력치가
              아닙니다.
            </p>
          </>
        )}
      </section>
    </section>
  );
}
