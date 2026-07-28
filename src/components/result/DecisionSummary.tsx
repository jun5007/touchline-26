import { Badge } from "@/components/common/Badge";
import type {
  Player,
  Role,
  TacticalInstructions,
} from "@/data/types";

const instructionLabels: Record<
  keyof TacticalInstructions,
  Record<string, string>
> = {
  attackDirection: {
    left: "왼쪽",
    centre: "중앙",
    right: "오른쪽",
    balanced: "균형",
  },
  pressing: { low: "낮은 압박", medium: "보통 압박", high: "높은 압박" },
  defensiveLine: { low: "낮은 라인", medium: "보통 라인", high: "높은 라인" },
  mentality: { safe: "안정", balanced: "균형", attacking: "공격" },
};

export function DecisionSummary({
  decision,
  outgoing,
  incoming,
  role,
}: {
  decision: {
    instructions: TacticalInstructions;
    explanation: { summary: string };
    createdAt: string;
  };
  outgoing: Player;
  incoming: Player;
  role: Role;
}) {
  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-white/[.07] bg-gradient-to-r from-[#0d6a49]/22 to-transparent p-5 sm:p-6">
        <p className="text-xs font-black tracking-[.14em] text-[#82e6ac]">YOUR DECISION</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[#ff806d]/45 bg-[#ff806d]/9 text-sm font-black text-[#ff9e90]">
              {outgoing.shirtNumber}
            </span>
            <div>
              <span className="block text-xs font-black text-[#a8b1bf]">OUT</span>
              <strong className="text-sm text-white">{outgoing.name}</strong>
            </div>
          </div>
          <span className="text-xl font-light text-white/30">→</span>
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[#65d89a]/50 bg-[#65d89a]/10 text-sm font-black text-[#82e6ac]">
              {incoming.shirtNumber}
            </span>
            <div>
              <span className="block text-xs font-black text-[#a8b1bf]">IN</span>
              <strong className="text-sm text-white">{incoming.name}</strong>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <Badge tone="gold">모델 입력 역할 · {role.name}</Badge>
          {(Object.keys(decision.instructions) as Array<keyof TacticalInstructions>).map((key) => (
            <Badge key={key} tone="blue">
              모델 입력 · {instructionLabels[key][decision.instructions[key]]}
            </Badge>
          ))}
        </div>
        <p className="mt-5 text-base font-bold leading-7 text-[#e2e5ea]">{decision.explanation.summary}</p>
        <p className="mt-3 text-xs leading-5 text-[#a8b1bf]">
          {new Intl.DateTimeFormat("ko-KR", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(decision.createdAt))}{" "}
          선택 기록 · 파생 분석은 현재 데이터로 재계산
        </p>
      </div>
    </section>
  );
}
