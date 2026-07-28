import { Badge } from "@/components/common/Badge";
import { ButtonLink } from "@/components/common/Button";
import {
  getGroupAMatches,
  getGroupAPlayers,
  getGroupAScenarios,
  getGroupATeams,
} from "@/data/group-a/catalog";

export default function Home() {
  const teams = getGroupATeams();
  const matches = getGroupAMatches();
  const scenarios = getGroupAScenarios();
  const players = getGroupAPlayers();
  const matchesPerTeam = teams[0]
    ? matches.filter((match) => match.playableTeamIds.includes(teams[0].id))
        .length
    : 0;

  return (
    <>
      <section className="grid-glow relative overflow-hidden border-b border-white/[.07]">
        <div className="page-wrap grid min-h-[calc(100vh-68px)] items-center gap-12 py-16 lg:grid-cols-[.92fr_1.08fr] lg:py-20">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="green">
                <span className="data-dot" />
                공식 경기 기록·최종 명단 확인
              </Badge>
              <Badge tone="gold">회고형 감독 시뮬레이션</Badge>
            </div>
            <p className="eyebrow mt-8">Group A manager simulator</p>
            <h1 className="display-title text-balance mt-5 text-[clamp(3rem,6.7vw,6.4rem)] font-black text-white">
              2026 월드컵
              <br />
              <span className="text-[#f4b860]">A조 감독의</span>
              <br />
              선택.
            </h1>
            <p className="text-balance mt-7 max-w-2xl text-lg font-semibold leading-8 text-[#c1c7d0]">
              실제 월드컵 경기의 특정 시점으로 돌아가 공식 명단·라인업·교체
              타임라인과 경기 상황을 확인하세요. 교체 선수, 역할, 팀 지시를
              선택하면 그 결정의 장점과 위험을 분석합니다.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8f99a8]">
              이 서비스는 경기 결과를 예측하거나 정답을 맞히는 게임이 아니라,
              이미 끝난 경기를 다른 관점에서 다시 읽는 전술 의사결정
              시뮬레이션입니다.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/teams" className="sm:min-w-48">
                지휘할 국가 선택 <span aria-hidden="true">→</span>
              </ButtonLink>
              <ButtonLink
                href="/group-a"
                variant="secondary"
                className="sm:min-w-48"
              >
                A조 최종 순위
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-white/[.08] pt-5">
              {[
                ["NATIONS", `${teams.length}개국`],
                ["MATCHES", `${matches.length}경기`],
                ["MISSIONS", `${scenarios.length}개`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-bold tracking-[.1em] text-[#9aa5b4]">
                    {label}
                  </dt>
                  <dd className="number-tabular mt-1 text-sm font-black text-white">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            className="hero-pitch lg:rotate-[1.2deg]"
            aria-label={`A조 ${teams.length}개국, 실제 ${matches.length}경기, 감독 미션 ${scenarios.length}개`}
          >
            <div className="noise-overlay" />
            <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-[#071018]/75 px-3 py-2 text-xs font-black tracking-[.1em] text-white backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#65d89a]" />
              GROUP A · COMPLETE
            </div>
            <div className="absolute right-5 top-5 z-10 hidden text-right text-xs font-bold text-white/75 sm:block">
              <span className="block text-xs tracking-[.12em] text-white/65">
                RECONSTRUCTED MATCH MOMENTS
              </span>
              공식 기록 기반
            </div>
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
              <div className="score-ring">
                <div className="text-center">
                  <span className="block text-[11px] font-black tracking-[.16em] text-[#f4b860]">
                    WORLD CUP 26
                  </span>
                  <span className="number-tabular mt-1 block text-4xl font-black text-white">
                    {teams.length} × {matchesPerTeam}
                  </span>
                  <span className="mt-1 block text-[11px] font-bold text-[#aeb8b2]">
                    국가별 조별리그 여정
                  </span>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-4 gap-3 sm:gap-5">
                {teams.map((team, index) => (
                  <div key={team.id} className="text-center">
                    <span
                      className={`mini-token mx-auto ${
                        index === 0
                          ? "border-[#f4b860] text-[#f4b860]"
                          : "border-white/65 text-white"
                      }`}
                    >
                      {team.code}
                    </span>
                    <span className="mt-2 block max-w-16 truncate text-[11px] font-black text-white">
                      {team.nameKo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-5 left-5 right-5 z-10 grid grid-cols-3 gap-2 rounded-2xl border border-white/12 bg-[#06140f]/75 p-3 backdrop-blur">
              {[
                ["공식 경기", matches.length],
                ["감독 미션", scenarios.length],
                ["실제 최종 명단", players.length],
              ].map(([label, value]) => (
                <div key={label} className="text-center">
                  <span className="block text-[11px] font-bold text-white/70">
                    {label}
                  </span>
                  <span className="number-tabular mt-0.5 block text-base font-black text-white">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <div>
            <p className="eyebrow">One match, two touchlines</p>
            <h2 className="text-balance mt-4 text-3xl font-black tracking-[-.04em] text-white sm:text-5xl">
              같은 경기에도
              <br />
              감독의 문제는 다릅니다.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-[#aeb6c2]">
            A조 네 팀 모두를 지휘할 수 있습니다. 각 미션은 실제 경기의
            특정 시점과 그때까지 확인 가능한 정보만 보여 줍니다. 클릭을
            중심으로 교체 선수, 역할, 팀 지시를 정하고 판단의 근거를
            비교해 보세요.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            [
              "01",
              "국가를 선택한다",
              `대한민국·체코·멕시코·남아공 중 한 국가를 골라 실제 조별리그 ${matchesPerTeam}경기를 따라갑니다.`,
            ],
            [
              "02",
              "경기 시점을 읽는다",
              "공식 명단, 선발 라인업, 교체 타임라인과 미션 시점까지의 경기 상황을 확인합니다.",
            ],
            [
              "03",
              "전술을 설계한다",
              "OUT·IN 선수, 투입 역할과 팀 지시를 한 번에 선택합니다.",
            ],
            [
              "04",
              "결정을 해석한다",
              "전술 선택 적합도의 구성, 예상 장점과 위험을 보고 실제 감독의 선택과 비교합니다.",
            ],
          ].map(([number, title, copy]) => (
            <article key={number} className="panel-soft min-h-52 p-5">
              <span className="text-xs font-black text-[#f4b860]">
                {number}
              </span>
              <h3 className="mt-8 text-lg font-black text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#99a3b1]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[.07] bg-[#09121f] py-20">
        <div className="page-wrap grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="green">실제 최종 명단 {players.length}명</Badge>
              <Badge tone="gold">실제 경기 시점 재구성</Badge>
              <Badge>미확인 선수 능력 미산정</Badge>
            </div>
            <h2 className="text-balance mt-5 text-3xl font-black tracking-[-.04em] text-white sm:text-5xl">
              확인한 사실과
              <br />
              모델의 해석을 구분합니다.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#aeb6c2]">
              현재 버전은 공식 경기 기록과 최종 명단을 중심으로 경기 시점을
              재구성합니다. 신뢰할 수 있는 최근 1년 선수 성과 자료가 확보되지
              않은 경우 1–20 능력치, Form, 리그 보정값을 만들어 채우지 않습니다.
              전술 선택 적합도는 승리 확률이나 선수의 절대 능력이 아닙니다.
            </p>
          </div>
          <ButtonLink href="/about-data" variant="secondary" className="lg:min-w-48">
            데이터 기준 보기 <span aria-hidden="true">→</span>
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
