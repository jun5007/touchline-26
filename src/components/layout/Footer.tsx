import Link from "next/link";
import { getGroupATeams } from "@/data/group-a/catalog";

export function SiteFooter() {
  const teams = getGroupATeams();

  return (
    <footer className="mt-auto border-t border-white/[.07] bg-[#060c15]">
      <div className="page-wrap grid gap-5 py-8 text-xs text-[#8e98a6] sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="font-black tracking-[.12em] text-[#e8e5dd]">TOUCHLINE 26</p>
          <p className="mt-2 max-w-2xl leading-5">
            FIFA와 무관한 비공식·비상업적 데이터 프로젝트입니다. 지원 범위는
            2026 월드컵 A조 {teams.length}개국이며, 결과는 실제 경기 예측이나
            선수의 절대 평가가 아닌 회고형 전술 적합도입니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 font-bold">
          <Link className="hover:text-white" href="/teams">
            국가 선택
          </Link>
          <Link className="hover:text-white" href="/group-a">
            A조 순위
          </Link>
          <Link className="hover:text-white" href="/matches">
            감독 미션
          </Link>
          <Link className="hover:text-white" href="/about-data">
            출처와 계산법
          </Link>
        </div>
      </div>
    </footer>
  );
}
