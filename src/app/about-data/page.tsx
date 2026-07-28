import type { Metadata } from "next";
import { Badge } from "@/components/common/Badge";
import { ButtonLink } from "@/components/common/Button";
import {
  getGroupAMatches,
  getGroupAPlayers,
  getGroupAScenarios,
  getGroupATeams,
} from "@/data/group-a/catalog";
import type { GroupASourceRecord } from "@/data/group-a/types";
import sourceRegistryData from "@/data/sources/sourceRegistry.json";

export const metadata: Metadata = {
  title: "데이터 원칙",
  description:
    "TOUCHLINE 26의 현재 데이터 범위, 전술 선택 적합도의 의미와 향후 확장 계획",
};

const sourceRegistry =
  sourceRegistryData as unknown as GroupASourceRecord[];

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

const userFacingUsagePermission: Record<
  GroupASourceRecord["usagePermission"],
  string
> = {
  allowed_factual_use: "공개 사실 확인·인용",
  allowed_with_attribution: "출처 표시 조건 적용",
  open_license: "공개 라이선스 조건 적용",
  restricted: "사실 확인 출처 · 원문 이용조건 적용",
  unknown: "사실 확인 출처 · 권리 조건 확인 필요",
};

export function formatUserFacingUsagePermission(
  permission: GroupASourceRecord["usagePermission"],
): string {
  return userFacingUsagePermission[permission];
}

export default function AboutDataPage() {
  const teams = getGroupATeams();
  const matches = getGroupAMatches();
  const scenarios = getGroupAScenarios();
  const players = getGroupAPlayers();
  const officialSources = sourceRegistry.filter(
    (source) =>
      !source.id.startsWith("base-audit-") &&
      (source.publisher === "FIFA" ||
        source.publisher === "FIFA Training Centre" ||
        source.publisher === "COSAFA"),
  );

  return (
    <div className="page-wrap py-12 sm:py-16">
      <header className="grid gap-8 border-b border-white/[.08] pb-12 lg:grid-cols-[1fr_.72fr] lg:items-end">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="green">현재 구현 공개</Badge>
            <Badge tone="gold">확인 사실·모델 해석 분리</Badge>
          </div>
          <p className="eyebrow mt-7">Data, not destiny</p>
          <h1 className="text-balance mt-5 text-4xl font-black tracking-[-.055em] text-white sm:text-6xl">
            있는 데이터는 정확히,
            <br />
            <span className="text-[#f4b860]">없는 숫자는 만들지 않게.</span>
          </h1>
        </div>
        <p className="text-base leading-7 text-[#aeb6c2]">
          TOUCHLINE 26은 실제 월드컵 경기의 특정 시점으로 돌아가 공식
          명단·라인업·교체 타임라인과 경기 상황을 확인하고, 교체 선수·역할·팀
          지시를 선택한 뒤 장점과 위험을 분석하는 회고형 감독
          시뮬레이션입니다. 아래에서 지금 작동하는 범위와 향후 확장을
          분명히 나눠 설명합니다.
        </p>
      </header>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Available now</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-.04em] text-white sm:text-4xl">
              현재 구현된 데이터 범위
            </h2>
          </div>
          <Badge tone="green">CURRENT · 실제 서비스 반영</Badge>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["대상 국가", `${teams.length}개국`, "대한민국 · 체코 · 멕시코 · 남아공"],
            ["공식 경기", `${matches.length}경기`, "A조 조별리그 전체"],
            ["실제 최종 명단", `${players.length}명`, "국가별 26명"],
            ["감독 미션", `${scenarios.length}개`, "실제 경기 시점 재구성"],
          ].map(([label, value, note]) => (
            <article key={label} className="panel p-5">
              <p className="text-xs font-black tracking-[.12em] text-[#9aa5b4]">
                {label}
              </p>
              <p className="number-tabular mt-3 text-3xl font-black text-white">
                {value}
              </p>
              <p className="mt-2 text-xs leading-5 text-[#8f99a8]">{note}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="panel p-6">
            <Badge tone="green">공식 기록 기반</Badge>
            <h3 className="mt-4 text-xl font-black text-white">
              경기와 명단은 실제 기록을 재구성합니다.
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#aab3bf]">
              최종 명단, 선발 라인업, 득점·경고·교체 타임라인, 최종 결과를
              공식 출처와 대조했습니다. 미션 화면은 해당 결정 시점까지 확인할
              수 있었던 정보만 먼저 보여 줍니다.
            </p>
          </article>

          <article className="panel p-6">
            <Badge tone="gold">BASE PROFILE · 미산정</Badge>
            <h3 className="mt-4 text-xl font-black text-white">
              최근 1년 선수 능력 1–20은 표시하지 않습니다.
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#aab3bf]">
              현재 {players.length}명 모두에게 재배포와 자동 수집이 가능한
              동일 기준의 최근 1년 세부 성과 자료를 확보하지 못했습니다. 빈
              값을 0점이나 평균값으로 바꾸지 않으며, 1–20 능력치와 선수 능력
              비교는 미산정 상태로 둡니다.
            </p>
          </article>

          <article className="panel p-6">
            <Badge tone="gold">FORM · TLSI · 미적용</Badge>
            <h3 className="mt-4 text-xl font-black text-white">
              대회 Form과 리그 강도 보정은 점수에 넣지 않습니다.
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#aab3bf]">
              선수별 성과 지표의 공통 기준과 리그·시즌 매핑을 검증할 수 없는
              현재 버전에서는 Form 및 TLSI를 적용하지 않습니다. 미적용을
              0점이나 중립 성과로 해석하지 않습니다.
            </p>
          </article>

          <article className="panel p-6">
            <Badge tone="blue">CURRENT CONDITION · 추정</Badge>
            <h3 className="mt-4 text-xl font-black text-white">
              컨디션은 출전 시간을 이용한 상황 지표입니다.
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#aab3bf]">
              공식 체력 측정값이 없으므로 미션 시점까지의 출전 시간을 바탕으로
              피로 가능성을 추정합니다. 이는 선수의 실제 체력이나 의학적 상태를
              뜻하지 않으며 화면에서도 ‘출전 시간 기반 컨디션 추정’으로
              표시합니다.
            </p>
          </article>
        </div>
      </section>

      <section className="mt-16 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <article className="panel p-6 sm:p-8">
          <p className="eyebrow">Tactical decision fit</p>
          <h2 className="mt-4 text-2xl font-black text-white">
            전술 선택 적합도는 승률이 아닙니다.
          </h2>
          <p className="mt-5 text-sm leading-6 text-[#adb6c2]">
            이 점수는 선택한 교체, 역할, 팀 지시가 해당 미션의 전술 목표와
            얼마나 잘 맞는지 설명하기 위한 자체 비교 지표입니다. 경기 승리
            확률, 선수의 절대 능력, 미래 결과 예측을 뜻하지 않습니다.
          </p>
          <ul className="mt-6 grid gap-3 text-sm leading-6 text-[#adb6c2]">
            <li>· 실제 미션 시점의 스코어·인원·카드·출전 시간 상황</li>
            <li>· OUT·IN 선수의 공식 포지션과 전술 역할 적합성</li>
            <li>· 상대 전술과 매치업에 대한 미션별 분석 규칙</li>
            <li>· 선택한 역할과 팀 지시의 조합, 기대 장점과 위험</li>
          </ul>
          <p className="mt-6 rounded-xl border border-[#f4b860]/15 bg-[#f4b860]/7 p-4 text-xs leading-5 text-[#c7b995]">
            최근 1년 선수 능력 데이터가 없는 현재 버전에서는 그 항목을 점수
            계산에서 제외하고, 사용 가능한 전술·상황 요소만으로 다시
            계산합니다.
          </p>
        </article>

        <article className="panel p-6 sm:p-8">
          <p className="eyebrow">Fact boundaries</p>
          <h2 className="mt-4 text-2xl font-black text-white">
            사실, 해석, 이후 사실을 구분합니다.
          </h2>
          <dl className="mt-6 grid gap-4 text-sm leading-6">
            <div className="panel-soft p-4">
              <dt className="font-black text-[#82e6ac]">공식 확인 사실</dt>
              <dd className="mt-1 text-[#aab3bf]">
                명단, 라인업, 미션 시점까지의 득점·경고·교체 기록
              </dd>
            </div>
            <div className="panel-soft p-4">
              <dt className="font-black text-[#9acbff]">모델의 전술 해석</dt>
              <dd className="mt-1 text-[#aab3bf]">
                전술 선택 적합도, 기대 장점·위험, 대안 시나리오
              </dd>
            </div>
            <div className="panel-soft p-4">
              <dt className="font-black text-[#f7c979]">경기 종료 후 확인 사실</dt>
              <dd className="mt-1 text-[#aab3bf]">
                실제 감독의 교체와 그 이후 사건·최종 결과는 선택을 제출한 뒤
                결과 화면에서만 공개
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-xs leading-5 text-[#8f99a8]">
            실제 감독의 선택은 정답이나 채점 기준이 아니라 비교를 위한 회고
            기준입니다. 다른 선택이 자동으로 오답이 되지 않습니다.
          </p>
        </article>
      </section>

      <section className="mt-16 rounded-[24px] border border-dashed border-[#f4b860]/30 bg-[#f4b860]/[.04] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Future extension</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-.04em] text-white">
              향후 데이터 확장 계획
            </h2>
          </div>
          <Badge tone="gold">FUTURE · 현재 점수에 미반영</Badge>
        </div>
        <p className="mt-5 max-w-4xl text-sm leading-6 text-[#aab3bf]">
          아래 기능은 구현 완료나 데이터 확보를 뜻하지 않습니다. 적법한
          라이선스와 공통 기준을 갖춘 선수 단위 자료가 확보된 뒤에만 검증을
          거쳐 도입할 계획입니다.
        </p>
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "01 · 라이선스 데이터",
              "최근 1년 클럽·대표팀 선수 성과를 합법적으로 수집·재배포할 수 있는 출처 확보",
            ],
            [
              "02 · 1–20 능력 모델",
              "포지션별 표본과 결측 규칙을 공개한 뒤 동일 기준으로 선수 능력 산정",
            ],
            [
              "03 · Form·리그 보정",
              "대회 출전 성과와 리그·시즌 매핑을 검증해 제한된 범위에서 보정 적용",
            ],
            [
              "04 · 선수 능력 영향 게이지",
              "실측 능력 근거가 있을 때만 교체 전후 전술 영향과 불확실성을 함께 시각화",
            ],
          ].map(([title, copy]) => (
            <article key={title} className="panel-soft p-5">
              <h3 className="text-sm font-black text-[#f7c979]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#9fa8b5]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Official source registry</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-.04em] text-white">
              경기 사실 검증 출처
            </h2>
          </div>
          <Badge tone="green">
            {unique(officialSources.map((source) => source.id)).length}개 참조
          </Badge>
        </div>
        <p className="mt-4 max-w-4xl text-sm leading-6 text-[#9fa8b5]">
          아래 링크는 현재 명단·라인업·타임라인·경기 결과를 대조한
          사실 확인 출처입니다. 원문 PDF와 표·그래픽·사진을 재배포하지
          않고, 확인한 경기 사실만 서비스의 자체 데이터 구조로
          재구성했습니다. 각 원문에는 출처별 이용조건이 적용됩니다.
        </p>
        <p className="mt-3 max-w-4xl rounded-xl border border-white/[.08] bg-white/[.025] p-4 text-xs leading-5 text-[#aab3bf]">
          TOUCHLINE 26은 FIFA 또는 아래 출처 기관과 제휴하거나 승인을 받은
          공식 서비스가 아닙니다. 링크는 사실 검증 경로를 투명하게 공개하기
          위한 것이며, 원문 저작물의 재사용 허가를 뜻하지 않습니다.
        </p>
        <div className="mt-6 grid gap-3">
          {officialSources.map((source, index) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="panel group grid gap-3 p-4 transition hover:border-white/20 sm:grid-cols-[38px_1fr_auto] sm:items-center sm:p-5"
            >
              <span className="number-tabular text-xs font-black text-[#f4b860]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>
                <strong className="block text-sm text-white group-hover:text-[#f7c979]">
                  {source.sourceName ?? source.title}
                </strong>
                <span className="mt-1 block text-xs leading-5 text-[#8f99a8]">
                  {source.publisher} · {source.sourceType} · 확인{" "}
                  {source.accessedAt}
                </span>
              </span>
              <span className="text-xs font-black text-[#a8b1bf] group-hover:text-white">
                {formatUserFacingUsagePermission(source.usagePermission)} ·
                원문 링크 보기 →
              </span>
            </a>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-col gap-4 border-t border-white/[.08] pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-xs leading-5 text-[#7f8a98]">
          데이터 출처와 사용 조건은 저장소의 THIRD_PARTY_NOTICES.md에,
          현재 BASE PROFILE 수집 한계는 docs/BASE_PROFILE_PROGRESS.md에
          기록합니다. 이 페이지의 ‘향후 확장’ 항목은 현재 제품 기능으로
          오해해서는 안 됩니다.
        </p>
        <ButtonLink href="/teams">
          국가 선택 <span aria-hidden="true">→</span>
        </ButtonLink>
      </div>
    </div>
  );
}
