import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#070e18]/88 backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-[#f4b860] focus:px-4 focus:py-2 focus:text-[#071018]"
      >
        본문으로 이동
      </a>
      <div className="page-wrap flex h-[68px] items-center justify-between">
        <Link href="/" className="group flex items-center gap-3" aria-label="TOUCHLINE 26 홈">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[#f4b860]/35 bg-[#f4b860]/10 text-[11px] font-black tracking-[-.08em] text-[#f4b860] transition group-hover:bg-[#f4b860] group-hover:text-[#101824]">
            TL
            <span className="-mt-1 text-[8px]">26</span>
          </span>
          <span>
            <span className="block text-[13px] font-black tracking-[.13em] text-white">
              TOUCHLINE 26
            </span>
            <span className="block text-[10px] font-medium text-[#8f99a8]">
              월드컵 감독의 선택
            </span>
          </span>
        </Link>
        <nav aria-label="주요 메뉴" className="flex items-center gap-1 text-sm font-bold text-[#aeb6c2]">
          <Link className="rounded-lg px-3 py-2 hover:bg-white/[.05] hover:text-white" href="/matches">
            미션
          </Link>
          <Link className="rounded-lg px-3 py-2 hover:bg-white/[.05] hover:text-white" href="/about-data">
            <span className="hidden sm:inline">데이터 노트</span>
            <span className="sm:hidden">데이터</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

