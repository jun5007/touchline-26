import type { Metadata } from "next";
import { MatchCard } from "@/components/match/MatchCard";
import { StepIndicator } from "@/components/layout/StepIndicator";
import { getMatches } from "@/data/repository";

export const metadata: Metadata = {
  title: "경기 선택",
  description: "실제 2026 월드컵 경기에서 감독 미션을 선택하세요.",
};

export default function MatchesPage() {
  const matches = getMatches();

  return (
    <div className="page-wrap py-10 sm:py-14">
      <StepIndicator current="match" />
      <header className="mt-12 max-w-3xl">
        <p className="eyebrow">Choose the match</p>
        <h1 className="text-balance mt-4 text-4xl font-black tracking-[-.05em] text-white sm:text-6xl">
          당신의 터치라인은
          <br />
          어느 경기입니까?
        </h1>
        <p className="mt-5 text-base leading-7 text-[#aeb6c2]">
          경기 수보다 한 번의 완전한 판단을 우선했습니다. 공식 명단·교체·선수 지표가
          모두 확인된 대한민국–체코전부터 시작하세요.
        </p>
      </header>
      <div className="mt-10 grid max-w-4xl gap-5">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
      <aside className="mt-6 max-w-4xl rounded-xl border border-dashed border-white/10 p-5 text-sm leading-6 text-[#8f99a8]">
        <strong className="text-[#cbd1da]">왜 한 경기만 있나요?</strong>{" "}
        미완성 경기를 늘리는 대신, 실제 교체부터 결과 리포트까지 두 개의 미션을 완전히
        작동하도록 구성했습니다.
      </aside>
    </div>
  );
}

