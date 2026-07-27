import Link from "next/link";

const steps = [
  { key: "match", label: "경기 선택", short: "01" },
  { key: "briefing", label: "미션 브리핑", short: "02" },
  { key: "tactics", label: "전술 결정", short: "03" },
  { key: "result", label: "결과 분석", short: "04" },
] as const;

export function StepIndicator({
  current,
  matchId,
  scenarioId,
}: {
  current: (typeof steps)[number]["key"];
  matchId?: string;
  scenarioId?: string;
}) {
  const currentIndex = steps.findIndex((step) => step.key === current);
  const hrefs: Record<string, string | undefined> = {
    match: "/matches",
    briefing:
      matchId && scenarioId
        ? `/matches/${matchId}/scenarios/${scenarioId}/briefing`
        : undefined,
    tactics:
      matchId && scenarioId
        ? `/matches/${matchId}/scenarios/${scenarioId}/tactics`
        : undefined,
    result: undefined,
  };

  return (
    <nav
      aria-label="미션 진행 단계"
      className="hide-scrollbar overflow-x-auto pb-1"
    >
      <ol className="flex min-w-[520px] items-center">
        {steps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isComplete = index < currentIndex;
          const content = (
            <>
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] font-black ${
                  isCurrent
                    ? "border-[#f4b860] bg-[#f4b860] text-[#0a1422]"
                    : isComplete
                      ? "border-[#65d89a]/40 bg-[#65d89a]/12 text-[#82e6ac]"
                      : "border-white/12 bg-white/[.035] text-[#748091]"
                }`}
              >
                {isComplete ? "✓" : step.short}
              </span>
              <span className={isCurrent ? "text-white" : "text-[#7f8998]"}>
                {step.label}
              </span>
            </>
          );
          return (
            <li key={step.key} className="flex flex-1 items-center">
              {hrefs[step.key] && index <= currentIndex ? (
                <Link
                  href={hrefs[step.key]!}
                  aria-current={isCurrent ? "step" : undefined}
                  className="flex items-center gap-2 rounded-lg p-1 text-xs font-bold hover:bg-white/[.04]"
                >
                  {content}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  className="flex items-center gap-2 p-1 text-xs font-bold"
                >
                  {content}
                </span>
              )}
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mx-3 h-px flex-1 ${index < currentIndex ? "bg-[#65d89a]/30" : "bg-white/10"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
