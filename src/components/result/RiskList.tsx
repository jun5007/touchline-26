export function RiskList({
  risks,
  remedies,
}: {
  risks: string[];
  remedies: string[];
}) {
  return (
    <section className="panel p-5 sm:p-6" aria-labelledby="risk-title">
      <p className="text-[10px] font-black tracking-[.13em] text-[#ff9e90]">RISK &amp; RESPONSE</p>
      <h2 id="risk-title" className="mt-2 text-lg font-black text-white">따라오는 위험</h2>
      <ul className="mt-4 grid gap-3">
        {risks.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-[#d9bdba]">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#ff806d]/10 text-[10px] font-black text-[#ff9e90]">!</span>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-5 rounded-xl border border-[#75b9ff]/15 bg-[#75b9ff]/7 p-4">
        <h3 className="text-xs font-black text-[#9acbff]">추천 보완책</h3>
        <ul className="mt-2 grid gap-1.5 text-xs leading-5 text-[#aabdd2]">
          {remedies.map((item, index) => (
            <li key={`${item}-${index}`}>• {item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

