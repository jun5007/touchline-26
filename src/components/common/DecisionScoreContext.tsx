import { Badge } from "@/components/common/Badge";
import type { DecisionScoreRelativeContext } from "@/lib/decision/decisionScoreRelativeContext";

export function DecisionScoreContext({
  context,
}: {
  context: DecisionScoreRelativeContext;
}) {
  return (
    <section
      aria-label="미션 내부 점수 비교"
      className="rounded-xl border border-[#75b9ff]/18 bg-[#75b9ff]/[.055] p-3 text-left"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong className="text-xs text-[#b9dcff]">
          미션 내부 상대평가
        </strong>
        <Badge tone={context.topPercent <= 25 ? "green" : "blue"}>
          상위 {context.topPercent}% 이내
        </Badge>
      </div>
      <dl className="mt-2 grid gap-1 text-xs leading-5 text-[#aebaca]">
        <div className="flex flex-wrap justify-between gap-x-3">
          <dt>합법적 선택 점수 범위</dt>
          <dd className="number-tabular font-black text-white">
            {context.minScore}–{context.maxScore}점
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-3">
          <dt>현재 선택의 미션 내 위치</dt>
          <dd className="number-tabular font-black text-white">
            {context.percentile}백분위
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-xs leading-5 text-[#8f9baa]">
        같은 평가 함수로 계산한 합법 조합{" "}
        {context.combinationCount.toLocaleString("ko-KR")}개 기준이며, 상위
        비율에는 같은 점수의 선택을 모두 포함합니다.
      </p>
    </section>
  );
}
