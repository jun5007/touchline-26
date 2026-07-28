export function BenefitList({ items }: { items: string[] }) {
  return (
    <section className="panel p-5 sm:p-6" aria-labelledby="benefit-title">
      <p className="text-xs font-black tracking-[.13em] text-[#82e6ac]">WHY IT WORKS</p>
      <h2 id="benefit-title" className="mt-2 text-lg font-black text-white">이 선택의 장점</h2>
      <ul className="mt-4 grid gap-3">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-[#cbd1da]">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#65d89a]/10 text-xs font-black text-[#82e6ac]">+</span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
