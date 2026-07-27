import { Badge } from "@/components/common/Badge";
import { ButtonLink } from "@/components/common/Button";
import { getMatch, getScenario } from "@/data/repository";

export default function Home() {
  const match = getMatch("kor-cze-2026");
  const scenario = getScenario("kor-cze-2026", "level-69-find-nine");

  return (
    <>
      <section className="grid-glow relative overflow-hidden border-b border-white/[.07]">
        <div className="page-wrap grid min-h-[calc(100vh-68px)] items-center gap-12 py-16 lg:grid-cols-[.9fr_1.1fr] lg:py-20">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="green">
                <span className="data-dot" />
                실제 2026 월드컵 데이터
              </Badge>
              <Badge tone="gold">감독 시뮬레이션</Badge>
            </div>
            <p className="eyebrow mt-8">The manager&apos;s moment</p>
            <h1 className="display-title text-balance mt-5 text-[clamp(3.15rem,7vw,6.7rem)] font-black text-white">
              선택은
              <br />
              <span className="text-[#f4b860]">69분</span>에
              <br />
              증명된다.
            </h1>
            <p className="text-balance mt-7 max-w-xl text-lg font-semibold leading-8 text-[#c1c7d0]">
              가장 능력치가 높은 선수가 아니라,
              <br className="hidden sm:block" /> 지금 이 경기에서 가장 필요한 선수를 고른다.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/matches" className="sm:min-w-48">
                감독 미션 시작 <span aria-hidden="true">→</span>
              </ButtonLink>
              <ButtonLink href="/about-data" variant="secondary" className="sm:min-w-48">
                데이터 산출 방식
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-white/[.08] pt-5">
              <div>
                <dt className="text-[10px] font-bold tracking-[.1em] text-[#738092]">PLAY TIME</dt>
                <dd className="mt-1 text-sm font-black text-white">3–5분</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold tracking-[.1em] text-[#738092]">DATA</dt>
                <dd className="mt-1 text-sm font-black text-white">FIFA 공식</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold tracking-[.1em] text-[#738092]">MISSION</dt>
                <dd className="mt-1 text-sm font-black text-white">2개</dd>
              </div>
            </dl>
          </div>

          <div className="hero-pitch lg:rotate-[1.2deg]" aria-label="대한민국 대 체코 경기 미션 미리보기">
            <div className="noise-overlay" />
            <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-[#071018]/75 px-3 py-2 text-[10px] font-black tracking-[.1em] text-white backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff806d]" />
              DECISION WINDOW
            </div>
            <div className="absolute right-5 top-5 z-10 text-right text-xs font-bold text-white/75">
              <span className="block text-[10px] tracking-[.12em] text-white/45">GROUP A · MATCH 2</span>
              GUADALAJARA
            </div>
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
              <div className="score-ring">
                <div className="text-center">
                  <span className="number-tabular block text-[11px] font-black tracking-[.16em] text-[#f4b860]">
                    69:00
                  </span>
                  <span className="number-tabular mt-1 block text-4xl font-black text-white">1–1</span>
                  <span className="mt-1 block text-[9px] font-bold text-[#93a09b]">KOR · CZE</span>
                </div>
              </div>
              <div className="mt-8 max-w-[76%] text-center">
                <p className="text-balance text-xl font-black leading-7 text-white drop-shadow-lg">
                  캡틴을 남길 것인가,
                  <br />
                  박스 안 9번을 세울 것인가
                </p>
                <div className="mt-5 flex justify-center gap-6">
                  <div className="text-center">
                    <span className="mini-token mx-auto border-[#f4b860] text-[#f4b860]">7</span>
                    <span className="mt-2 block text-[10px] font-black text-white">손흥민</span>
                    <span className="block text-[9px] text-white/55">현재 필드</span>
                  </div>
                  <span className="mt-3 text-2xl font-light text-white/50">→</span>
                  <div className="text-center">
                    <span className="mini-token mx-auto border-[#65d89a] text-[#65d89a]">18</span>
                    <span className="mt-2 block text-[10px] font-black text-white">오현규</span>
                    <span className="block text-[9px] text-white/55">벤치 옵션</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-5 left-5 right-5 z-10 grid grid-cols-3 gap-2 rounded-2xl border border-white/12 bg-[#06140f]/75 p-3 backdrop-blur">
              {[
                ["상황 적합도", "82"],
                ["공격 위협", "+11"],
                ["수비 안정", "−4"],
              ].map(([label, value]) => (
                <div key={label} className="text-center">
                  <span className="block text-[9px] font-bold text-white/50">{label}</span>
                  <span className="number-tabular mt-0.5 block text-base font-black text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
          <div>
            <p className="eyebrow">One decision, four layers</p>
            <h2 className="text-balance mt-4 text-3xl font-black tracking-[-.04em] text-white sm:text-5xl">
              교체 한 장에
              <br />
              전술의 이유를 담는다.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-[#aeb6c2]">
            경기 상태를 읽고, 필드와 벤치를 비교하고, 역할과 팀 지시를 정하세요.
            선택의 장점뿐 아니라 반드시 따라오는 위험과 보완책까지 데이터로 설명합니다.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            ["01", "상황을 읽다", "분·스코어·상대 형태와 직전 흐름을 한 화면에서 확인합니다."],
            ["02", "선수를 바꾸다", "드래그 또는 클릭으로 OUT/IN을 정하고 1–20 스탯을 비교합니다."],
            ["03", "의도를 더하다", "역할과 팀 지시가 적합도와 네 개 영향 게이지를 바꿉니다."],
            ["04", "결정을 해석하다", "점수, 장점, 위험, 실제 감독 선택을 정답 없이 비교합니다."],
          ].map(([number, title, copy]) => (
            <article key={number} className="panel-soft min-h-52 p-5">
              <span className="text-xs font-black text-[#f4b860]">{number}</span>
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
              <Badge tone="green">검증 완료</Badge>
              <Badge>2026.06.11</Badge>
              <Badge>{match?.stage ?? "조별리그"}</Badge>
            </div>
            <h2 className="text-balance mt-5 text-3xl font-black tracking-[-.04em] text-white sm:text-5xl">
              대한민국 2–1 체코,
              <br />
              실제 69분으로 돌아갑니다.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#aeb6c2]">
              FIFA 공식 경기 리포트와 전술 라인업, 52쪽 퍼포먼스 리포트를 확인했습니다.
              {scenario ? ` 첫 미션은 ${scenario.minute}분 ${scenario.currentScore}에서 시작합니다.` : ""}
            </p>
          </div>
          <ButtonLink href="/matches/kor-cze-2026" className="lg:min-w-48">
            경기실 입장 <span aria-hidden="true">→</span>
          </ButtonLink>
        </div>
      </section>
    </>
  );
}

