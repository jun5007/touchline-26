import { resultTemplates } from "@/data/resultTemplateCatalog";
import { Badge } from "@/components/common/Badge";
import { DecisionScoreContext } from "@/components/common/DecisionScoreContext";
import type { DecisionScoreRelativeContext } from "@/lib/decision/decisionScoreRelativeContext";

function getGrade(score: number) {
  return (
    resultTemplates.grades.find((grade) => score >= grade.min) ??
    resultTemplates.grades[resultTemplates.grades.length - 1]
  );
}

export function DecisionScore({
  score,
  scoreContext,
}: {
  score: number;
  scoreContext?: DecisionScoreRelativeContext | null;
}) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const grade = getGrade(safeScore);

  return (
    <section className="panel flex flex-col items-center justify-center p-7 text-center">
      <p className="text-xs font-black tracking-[.14em] text-[#9aa5b4]">
        TACTICAL DECISION FIT
      </p>
      <Badge tone="gold" className="mt-3">앱 파생 평가</Badge>
      <div
        className="mt-5 grid h-40 w-40 place-items-center rounded-full p-3"
        style={{
          background: `conic-gradient(#f4b860 ${safeScore * 3.6}deg, rgba(255,255,255,.075) 0deg)`,
        }}
        aria-label={`전술 선택 적합도 ${safeScore}점`}
      >
        <div className="grid h-full w-full place-items-center rounded-full bg-[#0a1422] shadow-[inset_0_0_25px_rgba(0,0,0,.3)]">
          <div>
            <span className="number-tabular block text-5xl font-black tracking-[-.07em] text-white">{safeScore}</span>
            <span className="mt-1 block text-xs font-bold text-[#9aa5b4]">/ 100</span>
          </div>
        </div>
      </div>
      <h2 className="mt-5 text-xl font-black text-[#f7c979]">{grade.label}</h2>
      <p className="mt-2 max-w-xs text-xs leading-5 text-[#9da7b4]">{grade.description}</p>
      <p className="mt-3 max-w-xs text-xs font-bold leading-5 text-[#c8b084]">
        승률이나 선수 절대 능력 평가가 아닙니다.
      </p>
      {scoreContext && (
        <div className="mt-4 w-full max-w-sm">
          <DecisionScoreContext context={scoreContext} />
        </div>
      )}
    </section>
  );
}
