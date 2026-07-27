import type { Metadata } from "next";
import { Badge } from "@/components/common/Badge";
import { ButtonLink } from "@/components/common/Button";
import { getMatch, getPlayers } from "@/data/repository";

export const metadata: Metadata = {
  title: "데이터와 계산 방법",
  description: "TOUCHLINE 26의 실제 경기 출처, 1–20 스탯과 상황 적합도 계산 방법",
};

const featuredPlayerIds = [
  "son-heungmin",
  "lee-kangin",
  "hwang-inbeom",
  "oh-hyeongyu",
];

export default function AboutDataPage() {
  const match = getMatch("kor-cze-2026");
  const players = getPlayers().filter((player) =>
    featuredPlayerIds.includes(player.id),
  );

  return (
    <div className="page-wrap py-12 sm:py-16">
      <header className="grid gap-8 border-b border-white/[.08] pb-12 lg:grid-cols-[1fr_.7fr] lg:items-end">
        <div>
          <p className="eyebrow">Data, not destiny</p>
          <h1 className="text-balance mt-5 text-4xl font-black tracking-[-.055em] text-white sm:text-6xl">
            숫자는 정답이 아니라
            <br />
            <span className="text-[#f4b860]">판단의 근거</span>입니다.
          </h1>
        </div>
        <p className="text-base leading-7 text-[#aeb6c2]">
          TOUCHLINE 26은 FIFA의 공식 경기 사실을 사용하지만, FIFA 공식 평점이나 게임
          데이터베이스를 사용하지 않습니다. 1–20 스탯과 적합도는 출처가 있는 원자료를
          설명 가능한 규칙으로 변환한 앱의 파생 지표입니다.
        </p>
      </header>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {[
          {
            label: "확인된 사실",
            tone: "green" as const,
            title: "경기·명단·이벤트",
            copy: "날짜, 스코어, 선발과 벤치, 득점·도움·교체 시점은 FIFA 공식 리포트로 확인하고 독립 출처로 교차 검증했습니다.",
          },
          {
            label: "앱 파생값",
            tone: "gold" as const,
            title: "1–20과 상황 적합도",
            copy: "패스, 라인브레이크, 슈팅, 압박 등 공식 수치를 포지션과 표본 신뢰도로 보정한 앱 자체 지표입니다.",
          },
          {
            label: "전술적 추론",
            tone: "blue" as const,
            title: "역할과 감독 의도",
            copy: "공식 인터뷰로 확인되지 않은 교체 목적은 당시 스코어와 선수 특성에 기반한 해석으로 명확히 표시합니다.",
          },
        ].map((item) => (
          <article key={item.label} className="panel p-5 sm:p-6">
            <Badge tone={item.tone}>{item.label}</Badge>
            <h2 className="mt-5 text-xl font-black text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#9fa8b5]">{item.copy}</p>
          </article>
        ))}
      </section>

      <section className="mt-16">
        <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <p className="eyebrow">Performance scale</p>
            <h2 className="text-balance mt-4 text-3xl font-black tracking-[-.04em] text-white sm:text-4xl">
              1–20 스탯은
              <br />
              이렇게 만듭니다.
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#9fa8b5]">
              이 값은 선수의 커리어 절대 능력이 아닙니다. 대한민국–체코전의 경기 종료 후
              관측값을 이해하기 쉬운 회고 지표로 바꾼 값입니다.
            </p>
          </div>
          <div className="panel overflow-hidden">
            <ol className="grid sm:grid-cols-2">
              {[
                ["01", "원자료 정리", "횟수형 지표는 가능한 경우 출전 시간 기준으로 비교하고, 누락값을 사실처럼 채우지 않습니다."],
                ["02", "포지션 비교", "CB, FB/WB, DM, CM/AM, WINGER, STRIKER 안에서 의미가 다른 지표와 가중치를 사용합니다."],
                ["03", "백분위 변환", "동일 비교 그룹의 백분위를 round(1 + 19 × percentile)로 1–20 범위에 옮깁니다."],
                ["04", "신뢰도 수축", "출전 시간이 짧거나 지표가 적으면 confidence × raw + (1−confidence) × 10.5로 중앙값에 당깁니다."],
              ].map(([number, title, copy], index) => (
                <li
                  key={number}
                  className={`p-5 sm:p-6 ${index % 2 === 0 ? "sm:border-r sm:border-white/[.07]" : ""} ${index < 2 ? "border-b border-white/[.07]" : ""}`}
                >
                  <span className="text-xs font-black text-[#f4b860]">{number}</span>
                  <h3 className="mt-5 text-sm font-black text-white">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#929dab]">{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[18px] border border-white/[.08]">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full border-collapse text-left">
              <caption className="sr-only">주요 선수의 공식 원자료와 파생 지표 맥락</caption>
              <thead className="bg-white/[.04] text-[10px] font-black tracking-[.1em] text-[#7f8998]">
                <tr>
                  <th className="px-4 py-3">선수</th>
                  <th className="px-4 py-3">공식 출전</th>
                  <th className="px-4 py-3">확인된 핵심 원자료</th>
                  <th className="px-4 py-3">신뢰도</th>
                  <th className="px-4 py-3">해석 범위</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[.06] bg-[#0c1727]/65 text-xs">
                {players.map((player) => (
                  <tr key={player.id}>
                    <td className="px-4 py-4">
                      <strong className="block text-sm text-white">{player.name}</strong>
                      <span className="text-[#748091]">{player.position}</span>
                    </td>
                    <td className="number-tabular px-4 py-4 font-bold text-[#d4d9e0]">{player.minutesPlayed}분</td>
                    <td className="px-4 py-4 leading-5 text-[#a7b0bc]">
                      {player.rawMetrics
                        ? `패스 ${player.rawMetrics.passesCompleted ?? 0}/${player.rawMetrics.passesAttempted ?? 0}, 슈팅 ${player.rawMetrics.shots ?? 0}, 직접 압박 ${player.rawMetrics.directPressures ?? 0}`
                        : "이 경기 출전 표본 없음"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={player.confidenceLabel === "낮음" ? "danger" : "green"}>
                        {player.confidenceLabel}
                      </Badge>
                    </td>
                    <td className="max-w-sm px-4 py-4 leading-5 text-[#8f99a8]">{player.performanceContext}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_.9fr]">
        <article className="panel p-6 sm:p-8">
          <p className="eyebrow">Situation fit</p>
          <h2 className="mt-4 text-2xl font-black tracking-[-.03em] text-white">상황 적합도 0–100</h2>
          <div className="mt-6 grid gap-3">
            {[
              ["60%", "선수 능력치 적합도", "미션별 가중치로 1–20 지표를 조합"],
              ["20%", "역할 적합도", "선택한 역할이 선호하는 능력과 선수 특성"],
              ["10%", "체력·신선도", "시뮬레이션 시점의 보수적 체력 입력"],
              ["10%", "상대 매치업", "낮은 블록·리드 보호 등 미션 태그"],
            ].map(([value, title, copy]) => (
              <div key={value} className="grid grid-cols-[62px_1fr] gap-3 rounded-xl border border-white/[.07] bg-white/[.025] p-3">
                <span className="number-tabular text-xl font-black text-[#f4b860]">{value}</span>
                <div>
                  <strong className="text-sm text-white">{title}</strong>
                  <p className="mt-0.5 text-[10px] leading-4 text-[#8994a3]">{copy}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-xl border border-[#ff806d]/14 bg-[#ff806d]/6 p-4 text-xs leading-5 text-[#d2aaa5]">
            포지션 재배치, 높은 라인+낮은 압박, 수동적 저블록, 낮은 데이터 신뢰도와 같은
            위험은 점수에서 패널티로 차감하고 결과에 문장으로도 표시합니다.
          </p>
        </article>

        <article className="panel p-6 sm:p-8">
          <p className="eyebrow">Known limits</p>
          <h2 className="mt-4 text-2xl font-black tracking-[-.03em] text-white">읽을 때의 주의점</h2>
          <ul className="mt-6 grid gap-4 text-sm leading-6 text-[#aab2bd]">
            <li className="border-b border-white/[.07] pb-4">
              <strong className="block text-white">회고 정보의 한계</strong>
              경기 종료 후 데이터를 사용하므로 69분 당시 실시간으로 알 수 있었던 예측값이 아닙니다.
            </li>
            <li className="border-b border-white/[.07] pb-4">
              <strong className="block text-white">한 경기 표본</strong>
              비교 범위가 작고 교체 선수는 출전 시간이 짧습니다. 신뢰도와 표본 분을 반드시 함께 보세요.
            </li>
            <li className="border-b border-white/[.07] pb-4">
              <strong className="block text-white">인과관계 아님</strong>
              교체 뒤 득점이 나왔더라도 그 교체가 득점의 원인이라고 단정하지 않습니다.
            </li>
            <li>
              <strong className="block text-white">공식 서비스 아님</strong>
              FIFA·대표팀·선수와 제휴하지 않은 비공식 데이터 프로젝트입니다.
            </li>
          </ul>
        </article>
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Sources</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-.04em] text-white">사용한 출처</h2>
          </div>
          <Badge tone="green">2026-07-27 확인</Badge>
        </div>
        <div className="mt-6 grid gap-3">
          {match?.dataSources.map((source, index) => (
            <a
              key={source.sourceUrl}
              href={source.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="panel group grid gap-4 p-4 transition hover:border-white/20 sm:grid-cols-[34px_1fr_auto] sm:items-center sm:p-5"
            >
              <span className="number-tabular text-xs font-black text-[#f4b860]">{String(index + 1).padStart(2, "0")}</span>
              <span>
                <strong className="block text-sm text-white group-hover:text-[#f7c979]">{source.sourceName}</strong>
                <span className="mt-1 block text-xs leading-5 text-[#8f99a8]">{source.verificationNote}</span>
                <span className="mt-1 block text-[10px] leading-4 text-[#8f99a8]">{source.license}</span>
              </span>
              <span className="text-xs font-black text-[#7f8998] group-hover:text-white">원문 열기 ↗</span>
            </a>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-col gap-3 border-t border-white/[.08] pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-5 text-[#788494]">
          원본 PDF의 로고·레이아웃·이미지는 서비스 화면에 사용하지 않았고, 사실 수치만 자체 UI로 재구성했습니다.
        </p>
        <ButtonLink href="/matches">
          데이터로 판단해 보기 <span aria-hidden="true">→</span>
        </ButtonLink>
      </div>
    </div>
  );
}
