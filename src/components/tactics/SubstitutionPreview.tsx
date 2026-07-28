import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import type { Player, Role } from "@/data/types";
import type { DecisionEvaluation } from "@/lib/decision/evaluateDecision";

export function SubstitutionPreview({
  outgoing,
  incoming,
  role,
  evaluation,
  onCancel,
}: {
  outgoing: Player | null;
  incoming: Player | null;
  role: Role | null;
  evaluation: DecisionEvaluation | null;
  onCancel: () => void;
}) {
  if (!outgoing && !incoming) return null;

  return (
    <section className="rounded-xl border border-[#f4b860]/18 bg-[#f4b860]/7 p-4" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[.13em] text-[#f4b860]">SUBSTITUTION PREVIEW</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-black">
            <span className="text-[#ff9e90]">{outgoing?.name ?? "OUT 미선택"}</span>
            <span className="text-white/35">→</span>
            <span className="text-[#82e6ac]">{incoming?.name ?? "IN 미선택"}</span>
          </div>
        </div>
        <Button type="button" variant="ghost" className="min-h-9 px-2.5 py-1.5 text-xs" onClick={onCancel}>
          취소
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {role && <Badge tone="gold">{role.name}</Badge>}
        {evaluation?.positionMismatch && <Badge tone="danger">포지션 재배치 필요</Badge>}
        {incoming && (
          <Badge>
            출전 시간 기반 컨디션 추정{" "}
            {incoming.fitness === null ? "—" : incoming.fitness}
          </Badge>
        )}
      </div>
    </section>
  );
}
