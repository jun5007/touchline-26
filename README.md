# 월드컵 감독의 선택: TOUCHLINE 26

> 2026 월드컵 A조의 실제 여섯 경기를 네 나라 감독의 시선으로 다시 판단하는 회고형 전술 의사결정 웹서비스

TOUCHLINE 26은 대한민국(KOR), 체코(CZE), 멕시코(MEX), 남아프리카공화국(RSA)의 조별리그를 따라가는 감독 시뮬레이션입니다. 사용자는 특정 경기 시점에 교체 선수, 역할, 팀 지시를 선택하고 장점·위험·보완책을 확인한 뒤 실제 경기의 선택과 비교합니다.

**해커톤 심사·공개 배포의 정본은 저장소 루트의 Next.js 애플리케이션입니다.**
`python-fastapi/`는 최종 공개 main tip에서 제외합니다. 초기 단일 경기
아이디어를 검증한 동결 참고판은 Git이 무시하는 로컬 복사본과 이전 Git
이력에만 남으며, 최종 제품·심사·배포 대상이 아닙니다.

이 서비스의 **전술 선택 적합도(TACTICAL DECISION FIT)** 는 선택이 해당 미션의 전술 조건과 얼마나 일관되는지를 설명하는 프로젝트 자체 규칙값입니다. 승리 확률, 경기 결과 예측, 선수의 절대 능력치나 공식 평점이 아닙니다.

## 구현 범위

| 항목 | 현재 구현 |
| --- | --- |
| 지원 국가 | KOR, CZE, MEX, RSA 정확히 4개국 |
| 조별리그 | A조 공식 6경기, 국가별 3경기 |
| 감독 관점 | 6경기 모두 양 팀 관점 제공 |
| 미션 | 총 13개: KOR 4개, CZE 3개, MEX 3개, RSA 3개 |
| 선수 | 공식 최종 명단 기준 팀당 26명, 총 104명 |
| 국가별 리포트 | `/teams/[teamId]/report` |
| 제출 런타임 | 저장소 루트 Next.js 애플리케이션 |

한 경기에 미션이 여러 개인 경우 리포트는 미션 점수를 먼저 경기 안에서 평균합니다. 조별리그 전체 점수는 완성된 세 경기의 경기 점수를 각각 같은 비중으로 평균합니다. 일부 미션만 끝낸 경기는 진행 상태와 임시 경기 점수를 보여주되 전체 평균에는 넣지 않습니다.

## 사용자 흐름

1. `/teams`에서 감독할 국가를 선택합니다.
2. 국가 페이지에서 세 경기 여정과 미션 진행률을 확인합니다.
3. 경기와 감독 관점을 선택하고 미션 브리핑에 들어갑니다.
4. 미션 시점까지 확인 가능한 점수, 사건, 라인업과 후보를 확인합니다.
5. 필드의 OUT 선수와 벤치의 IN 선수를 클릭하고 역할과 팀 지시를 정합니다.
6. 선택에 따라 변하는 전술 선택 적합도, 점수 구성, 예상 장점과 위험을 확인합니다.
7. 결정을 확정한 뒤 결과 화면에서만 실제 경기 결과와 실제 감독 선택을 비교합니다.
8. 세 경기를 진행한 뒤 국가별 감독 리포트에서 경기별 점수, 결정 하이라이트와 감독 성향을 확인합니다.
9. 같은 국가를 다시 플레이하거나 다른 국가를 선택합니다.

드래그앤드롭은 데스크톱의 실험적 보조 인터랙션입니다. 클릭 선택이 기본
조작이며 키보드와 모바일에서도 동일한 핵심 흐름을 수행할 수 있도록
구성했습니다. 실제 공개 브라우저에서 검증하기 전에는 drag 지원 완료로
표시하거나 시연 영상에 사용하지 않습니다.

## 데이터 상태를 읽는 법

화면과 문서는 다음 세 층을 구분합니다.

- **공식 확인 사실**: 명단, 등록 포지션, 선발·교체, 득점, 카드, 경기 결과와 같은 출처 기반 사실
- **프로젝트 자체 분석**: 전술 선택 적합도, 위험, 설명, 출전 시간 기반 컨디션 추정, 감독 성향
- **결과 화면 전용 사실**: 미션 뒤에 발생한 사건, 최종 결과, 실제 감독 선택

### BASE PROFILE

- 분석 대상 기간은 2025-06-11부터 2026-06-10까지입니다.
- 최근 1년 동안 104명을 같은 기준으로 비교할 수 있고 공개 서비스 재사용 조건까지 충족하는 선수별 성과 원자료를 확보하지 못했습니다.
- 따라서 현재 완성 프로필은 **0/104명**, 활성 1–20 속성은 **0/832개**입니다.
- 104명 모두 `analysisMinutes: null`, `dataGrade: "D"`, `status: "incomplete"`이며 속성은 `null`입니다.
- 누락값을 0점, 평균값, 중립 능력치나 다른 게임의 평점으로 채우지 않습니다.
- 필드 선수 8개 키와 골키퍼 8개 키는 향후 검증된 원자료가 들어올 수 있는 스키마이며, 현재 화면에서는 비어 있는 1–20 표를 반복 노출하지 않습니다.

13개 미션에서 실제 선택 후보가 되는 P0 고유 선수는 81명입니다. P0 역시 complete 0명, partial 0명, incomplete 81명이며 활성 속성은 0/648개입니다.

### Tournament Form과 TLSI

Tournament Form은 미션보다 앞선 A조 경기의 출전 사실만 참조합니다. 비교 가능한 성과 지표가 없어 현재 조정치는 모두 0이고 실제 적합도 계산에는 적용되지 않습니다.

TOUCHLINE League Strength Index(TLSI)는 최종 명단의 클럽 협회 맥락 26개를 식별했지만, 리그를 같은 척도로 비교할 검증 근거가 없어 모든 보정이 `applied: false`이고 영향은 0입니다. `strengthFactor: 1.00`은 검증된 리그 동등성을 뜻하지 않습니다.

### Current Condition

현재 경기의 공식 출전 시간과 카드 상태를 사용합니다. 에너지는 공식 생체·체력 자료가 아니라 다음 공개식으로 만든 제한적인 프로젝트 추정입니다.

```text
energyEstimate = max(60, round(100 - 0.42 × minutesInMatch))
```

화면에는 “출전 시간 기반 컨디션 추정”으로 표시합니다. 확인하지 못한 부상, 불참 사유, 최근 일정 부담은 임의로 만들지 않고 `null`로 둡니다.

## 전술 선택 적합도 계산

전술 선택 적합도는 0–100 범위의 프로젝트 자체 설명값입니다. 현재 선택에서
사용 가능한 역할·팀 지시, 출전 시간 기반 컨디션 추정, 상대 전술 매치업을
조합하고 확인된 위험 규칙의 패널티를 뺍니다. 사용할 수 있는 구성 요소만
동적으로 재가중하므로 화면의 “점수 구성 보기” 비중도 선택에 따라 달라집니다.

현재 Group A에서는 BASE 속성이 모두 `null`이어서 선수 성과 구성 요소를
제외하며, Tournament Form과 TLSI도 적용하지 않습니다. 실제 최종 스코어,
미션 뒤 사건, 실제 감독 선택은 이 계산에 들어가지 않습니다. 따라서 이 값은
승률, 결과 예측, 선수 평점 또는 절대 능력 평가가 아닙니다.

미션 안의 최소·최대, 백분위와 상위 비율은 OUT × IN × 호환 역할 × 유효한
팀 지시의 모든 합법 조합을 같은 `evaluateDecision`으로 평가한 분포입니다.
13개 미션 440,208개 조합의 분포는
`src/data/generated/decision-score-distributions.json`에 미리 생성합니다.
각 항목은 입력 전체의 SHA-256과 함께 저장되며, `npm run build` 전에
`score-distribution:verify`가 현재 데이터·평가기 결과와 완전히 같은지
검사합니다. 입력이 바뀐 개발 상태에서는 정적 값을 사용하지 않고 안전하게
재계산한 뒤 프로세스 내 LRU에 보관합니다.

## 미래 정보 누출 방지

- BASE PROFILE 기간은 본선 개막 전날인 2026-06-10에 끝납니다.
- Tournament Form은 각 `scenarioTimestamp`보다 앞선 경기만 참조합니다.
- 전술 화면의 클라이언트 DTO에는 `finalScore`, 미션 이후 사건, `actualDecision`이 없습니다.
- 실제 경기 결과와 실제 감독 선택은 결정을 확정한 결과 화면에서만 불러옵니다.
- `npm run data:future-leakage`가 소스 import 경계와 빌드된 전술 청크의 결과 정보 비노출을 검사합니다.

## 저장과 국가별 리포트

서비스는 계정이나 서버 데이터베이스를 사용하지 않습니다. 확정한 결정은 현재 브라우저·현재 origin의 `localStorage`에만 저장되므로 다른 기기, 브라우저, 배포 도메인으로 자동 동기화되지 않으며 브라우저 데이터를 지우면 사라집니다.

저장하는 최소 항목은 다음뿐입니다.

- 저장 형식 버전
- `matchId`, `scenarioId`, `selectedTeamId`
- `outPlayerId`, `inPlayerId`, `roleId`
- 네 가지 팀 지시
- 생성 시각

점수, 위험, 설명, 실제 결과는 저장하지 않습니다. 결과 화면과 국가별 리포트는 저장값의 형식, 팀, 선수, 역할을 다시 검증하고 현재 코드와 데이터로 점수와 위험을 재계산합니다. 손상되었거나 구버전이거나 현재 데이터와 맞지 않는 값은 삭제·제외하고 사용자에게 알립니다.

감독 성향은 사용자가 고른 역할과 팀 지시, 재계산된 위험 패턴에서 결정적으로 산출한 자체 분석입니다. 선수 능력 평가나 심리 진단이 아닙니다.

## 기술 스택

- Next.js 16 App Router, React 19, TypeScript strict mode
- Tailwind CSS 4, dnd-kit
- Vitest, Testing Library, jsdom
- 정적 JSON 데이터와 브라우저 로컬 계산
- 최소 선택만 저장하는 `localStorage`

환경변수, 외부 API 키, 데이터베이스, 회원가입, 결제는 필요하지 않습니다.

## 로컬 실행

Node.js 24.x와 npm 11 기준입니다. 제출 재현 검증은 잠금 파일을 그대로
사용하는 `npm ci`를 권장합니다.

```bash
npm ci
npm run data:validate
npm run data:coverage
npm run data:future-leakage
npm run lint
npm run test
npm run attributes:verify
npm run base-profile:verify
npm run license:check
npm run score-distribution:verify
npm run build
npm run start
```

개발 중에는 `npm run dev`를 실행하고 브라우저에서
`http://localhost:3000`을 엽니다. `data:generate`는 정본 입력을 변경했을
때만 실행하고 생성 diff를 검토합니다. 평가기나 분포 입력이 바뀌면
`npm run score-distribution:generate`로 정적 분포를 다시 만들고
`npm run score-distribution:verify`로 stale 여부와 13개 미션 전체 결과를
검증합니다. `base-profile:verify`의 구조·산식 테스트 통과와
`coverageTarget=NOT_MET`은 동시에 나타날 수 있습니다. 이는 검증기는
정상이고 실제 BASE 커버리지는 목표 미달이라는 뜻입니다.

기존 `TOUCHLINE26_RELEASE_CANDIDATE_AUDIT.zip`은 과거 로컬 검토
기록일 뿐입니다. DAKER 또는 공개 GitHub 제출 대상이 아니며, 최종 출시
단계에서는 새 ZIP을 생성하거나 업로드하지 않습니다.

이번 Release Candidate의 실제 최종 결과는
`RELEASE_CANDIDATE_TEST_RESULTS.md`, 알려진 한계는
`RELEASE_CANDIDATE_KNOWN_ISSUES.md`, 공개 commit 범위는
`FINAL_RELEASE_FILE_LIST.md`를 정본으로 확인합니다.

## Vercel 배포

1. 공개 GitHub 저장소에 최종 소스를 push합니다.
2. Vercel에서 저장소를 Import하고 Root Directory를 저장소 루트로 둡니다.
3. Framework Preset `Next.js`, Node.js `24.x`, 환경변수 없음 상태를 확인합니다.
4. production으로 배포하고 Deployment Protection을 끕니다.
5. 로그아웃 시크릿 창과 외부 네트워크에서 직접 URL·새로고침·404·모바일을 확인합니다.
6. 확인된 실제 URL만 제출 문서에 기록합니다.

세부 절차와 route 체크는 [Vercel 배포 가이드](docs/VERCEL_DEPLOYMENT_GUIDE.md)를
따릅니다. 현재 공개 배포는 사용자 작업 필요 상태입니다.

## 90초 시연 흐름

홈 범위 소개 → 국가 선택 → 3경기 여정 → 미션 브리핑 → 클릭 OUT/IN·역할·팀
지시 → 전술 선택 적합도와 점수 구성 → 결과의 공식 사실·자체 분석 비교 →
경기 동일 비중 국가 리포트 → 다른 국가와 실제 production URL 순서로
시연합니다. 드래그는 실제 브라우저 검증을 통과한 경우에만 보조로 넣습니다.
자세한 대본은 [시연 영상 스크립트](docs/DEMO_SCRIPT.md)에 있습니다.

## 최종 제출 체크리스트

DAKER 최종 제출물은 파일 업로드가 아니라 배포 URL, GitHub URL, YouTube URL
3개입니다. ZIP·PDF·README·테스트 결과는 DAKER에 업로드하지 않습니다.
최종 commit SHA, 최신 공지, 브라우저 교차 검증과 제출 완료 화면은
[최종 릴리스 체크리스트](SUBMISSION_RELEASE_CHECKLIST.md)에서 실제 확인한
항목만 체크합니다.

## 주요 경로

```text
src/app/
  teams/[teamId]/report/
  matches/[matchId]/scenarios/[scenarioId]/
  about-data/
src/data/
  teams/
  squads/
  players/
  matches/group-a/
  scenarios/group-a/
  tournament/
  club-performance/
  national-performance/
  leagues/
  sources/
src/lib/
  decision/
  report/
docs/
  ASSET_MANIFEST.md
  VERCEL_DEPLOYMENT_GUIDE.md
  GITHUB_RELEASE_CHECKLIST.md
  DEMO_SCRIPT.md
SUBMISSION_RELEASE_CHECKLIST.md
```

## 출처, 저작권과 비제휴 고지

경기·명단 사실의 출처 ID와 URL, 접근일, 용도는
`src/data/sources/sourceRegistry.json`에 기록합니다. 세부 조사와 이용 조건은
`docs/DATA_RESEARCH.md`와 `THIRD_PARTY_NOTICES.md`, 제품 자산의 제작·출처
기록은 `docs/ASSET_MANIFEST.md`에서 확인할 수 있습니다.

이 프로젝트는 독립적인 비공식 해커톤 작품이며 FIFA, 각국 축구협회, COSAFA, 대회 운영사, 구단, 감독 또는 선수의 승인·후원·제휴를 받지 않았습니다. 공식 로고, 협회 문장, 선수 사진, 방송 영상, 보고서 화면, 원문 PDF를 제품이나 공개 제출물에 복제하지 않습니다. 이름, 스코어와 명단은 출처가 연결된 사실 식별 정보로 제한해 사용합니다.

프로젝트 수준의 오픈소스 라이선스는 현재 선택되지 않았습니다. 해커톤 심사를
위해 저장소를 공개하더라도 별도 서면 허락 없이 프로젝트 코드·디자인·자체
그래픽을 복제, 수정, 배포하거나 다른 제품에 재사용하는 것을 허용하지
않습니다. 서드파티 패키지와 자료의 권리는 각 권리자에게 있습니다.

`python-fastapi/`는 최종 공개 main tip에서 제외하며, 동결 참고 구현은 Git이
무시하는 로컬 복사본과 이전 Git 이력에만 남습니다. 현재 4개국·6경기·13미션
제품의 정본, 제출 또는 배포 대상이 아닙니다.

## 제출 상태

대회 공식 페이지에는 최종 마감이 **2026-08-03 10:00**으로 표시되어 있습니다. 페이지 표기 기준이며, 시간대가 명확하지 않다면 제출 직전에 공식 공지와 제출 화면에서 다시 확인해야 합니다.

다음 항목은 저장소만으로 완료할 수 없으며 모두 **사용자 작업 필요** 상태입니다.

- Vercel 등 공개 production 배포와 공개 URL 확인
- 공개 GitHub 저장소 push, URL과 최종 commit SHA 기록
- YouTube 시연 영상 업로드와 로그아웃 재생 확인
- DAKER 제출 폼에 배포·GitHub·YouTube URL 3개 입력과 접수 완료 화면 보관
- Edge, Firefox 및 Safari 또는 iOS Safari 실기기·실브라우저 확인

실행 순서는 `SUBMISSION_RELEASE_CHECKLIST.md`를 따릅니다.
