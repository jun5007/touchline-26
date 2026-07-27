import { resultTemplates } from "@/data/repository";

function getGrade(score: number) {
  return (
    resultTemplates.grades.find((grade) => score >= grade.min) ??
    resultTemplates.grades[resultTemplates.grades.length - 1]
  );
}

export function DecisionScore({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const grade = getGrade(safeScore);

  return (
    <section className="panel flex flex-col items-center justify-center p-7 text-center">
      <p className="text-[10px] font-black tracking-[.14em] text-[#7f8998]">SITUATION FIT</p>
      <div
        className="mt-5 grid h-40 w-40 place-items-center rounded-full p-3"
        style={{
          background: `conic-gradient(#f4b860 ${safeScore * 3.6}deg, rgba(255,255,255,.075) 0deg)`,
        }}
        aria-label={`상황 적합도 ${safeScore}점`}
      >
        <div className="grid h-full w-full place-items-center rounded-full bg-[#0a1422] shadow-[inset_0_0_25px_rgba(0,0,0,.3)]">
          <div>
            <span className="number-tabular block text-5xl font-black tracking-[-.07em] text-white">{safeScore}</span>
            <span className="mt-1 block text-[10px] font-bold text-[#7f8998]">/ 100</span>
          </div>
        </div>
      </div>
      <h2 className="mt-5 text-xl font-black text-[#f7c979]">{grade.label}</h2>
      <p className="mt-2 max-w-xs text-xs leading-5 text-[#9da7b4]">{grade.description}</p>
    </section>
  );
}

