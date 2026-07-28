# TOUCHLINE 26 Group A 구현 계획

## 목표

2026 월드컵 A조의 대한민국, 체코, 멕시코, 남아프리카공화국 네 팀만 지원하는 조별리그 감독 시뮬레이션을 완성합니다. 실제 여섯 경기 모두를 양 팀 관점으로 제공하고, 사용자가 특정 시점의 교체·역할·팀 지시를 선택한 뒤 설명 가능한 결과를 받게 합니다.

핵심 품질 기준은 “모르는 선수 값을 만들지 않는다”와 “결정 시점 이후 정보를 결정 화면에 넣지 않는다”입니다.

## P0 제출 범위

### 데이터

- 정확히 4팀: KOR, CZE, MEX, RSA
- 정확히 A조 6경기, 팀당 3경기
- 모든 경기의 양 팀 관점
- 13미션: KOR 4, CZE/MEX/RSA 각 3
- FIFA 공식 최종 명단 104명
- A조 최종 순위와 공식 경기 이벤트
- 경기별 FTR, Tactical, PMSR, API, FIFA 기사 source id
- 팀·선수·경기·미션·출처 런타임 검증

### 경험

- 홈
- 국가 선택
- 국가별 3경기 여정
- A조 순위·경기 결과
- 경기 선택과 양측 감독 관점
- 미션 브리핑
- OUT/IN 선택
- 역할 선택
- 네 팀 지시
- 전술 선택 적합도·영향·위험
- 결과, 실제 선택 비교, 다시 하기, 다음 경기
- 모바일 클릭 흐름
- 잘못된 URL·손상 저장값 복구

### 제출

- 공개 production URL
- 공개 GitHub 저장소
- YouTube 시연
- Chromium, Firefox, Safari/iOS Safari 핵심 흐름
- 마감 이전 동결

P0가 완성·검증되기 전에는 다른 조, 다른 팀, 계정, 공유, 실시간 API 같은 P1을 추가하지 않습니다.

## 명시적 제외 범위

- A조 이외 팀·조
- 실제 경기 결과 예측
- 90분 물리 경기 엔진
- 회원가입·결제·서버 데이터베이스
- 실시간 경기 API
- 생성형 AI API 키가 필요한 코치
- 선수 사진·대표팀 문장·FIFA 공식 그래픽
- 확인하지 못한 최근 365일 선수 능력치
- 실제 감독 선택을 정답으로 판정

## 정보 구조

| 경로 | 역할 |
| --- | --- |
| `/` | 제품 설명과 시작 |
| `/teams` | 네 국가 선택 |
| `/teams/[teamId]` | 선택 국가의 최종 명단 맥락과 3경기 여정 |
| `/group-a` | 최종 순위와 6경기 결과 |
| `/matches` | 6경기 목록과 팀 필터 |
| `/matches/[matchId]` | 경기 요약과 양 팀 관점·미션 |
| `.../[scenarioId]/briefing` | 미션 시점까지의 사실 |
| `.../[scenarioId]/tactics` | 교체·역할·팀 지시 |
| `.../[scenarioId]/result` | 설명·실제 사실 비교 |
| `/about-data` | 출처, 계산, 한계 |

## 데이터 아키텍처

```text
teams ─┬─ squads ── players ── BASE PROFILE
       ├─ matches ── official events/sources
       └─ scenarios ─┬─ Tournament Form
                     ├─ Current Condition
                     ├─ decision-only context
                     └─ result-only facts
```

주요 파일:

- `src/data/teams/teams.json`
- `src/data/squads/{kor,cze,mex,rsa}.json`
- `src/data/players/group-a-players.json`
- `src/data/matches/group-a/*.json`
- `src/data/scenarios/group-a/{kor,cze,mex,rsa}.json`
- `src/data/tournament/{tournament,group-a}.json`
- `src/data/leagues/{leagues,league-strength}.json`
- `src/data/sources/sourceRegistry.json`

`scripts/generate-group-a.mjs`가 반복 가능한 정규화 산출물을 만들고, 별도 validator가 정본 불변조건을 확인합니다.

## 선수 모델

### BASE PROFILE

- 기간: 2025-06-11~2026-06-10
- 현재 커버리지: 104명 전원 D/incomplete
- `analysisMinutes: null`
- 필드/GK 속성: `null`
- 평균 대치 금지
- 누락 구성요소 제외 후 가중치 재정규화

### GK 분리

GK는 다음 전용 키를 씁니다.

`shotStopping`, `distribution`, `aerialCommand`, `sweeping`, `penaltySaving`, `stability`, `buildUp`, `impact`

### Tournament Form

미션 전에 완료된 A조 경기의 출전 사실만 사용합니다. 선수별 시점 안전 통계가 없으므로 `adjustment: 0`입니다.

### Current Condition

공식 현재 출전시간과 카드 상태를 사용하고, 에너지는 다음 파생식으로 제한합니다.

```text
max(60, round(100 - 0.42 × minutesInMatch))
```

### TLSI

26개 클럽 협회 맥락을 등록하되 공식 리그 비교 근거가 없어 `strengthFactor: 1.00`, low/incomplete, `applied: false`, 영향 0으로 둡니다.

## 점수와 설명

- `null` 능력치는 계산에서 제외
- 사용 가능한 속성 가중치만 재정규화
- 전체 능력 구성요소가 없으면 역할·현재 상태·매치업 등 가용 구성요소를 재가중
- 역할 적합도는 포지션 호환성 규칙이며 선수 능력치가 아님
- 팀 지시는 시나리오의 선언형 수정치 사용
- 위험은 선언형 규칙으로 감점하고 설명 근거를 함께 노출
- 실제 경기 결과나 실제 선택은 사용자 점수 계산의 정답 라벨로 사용하지 않음

## 미래 정보 누출 경계

1. BASE PROFILE은 2026-06-10에 종료합니다.
2. Tournament Form은 `scenarioTimestamp` 이전 경기만 읽습니다.
3. Current Condition은 미션 분까지의 현재 경기 사실만 읽습니다.
4. 전술 페이지에는 `DecisionMatchView`, `DecisionScenarioContext`를 전달합니다.
5. `finalScore`, 사후 이벤트, `actualDecision`, 결과 사실은 DTO에서 제거합니다.
6. 결과 페이지에서만 실제 결과와 선택을 읽습니다.

## 검증 계획

### 정적 데이터

```bash
npm run data:generate
npm run data:validate
npm run data:coverage
npm run data:future-leakage
```

확인할 불변조건:

- 4팀/6경기/3경기씩/양 팀 관점/13미션/104명
- 팀당 최종 명단 26명
- 선발 11명과 경기 명단 선수 id
- M01 RSA 퇴장 이후 10명 현재 라인업 예외의 근거
- 경기별 불참과 실제 교체 유효성
- source id 참조
- `null`과 범위
- TLSI 영향 0
- 시나리오 시간 경계

### 코드

```bash
npm run lint
npm run test
npm run build
npm run start
```

최종 통합 이후의 실제 결과만 기록합니다. 과거 단일 경기판의 테스트 개수는 재사용하지 않습니다.

### 브라우저

- Chromium 1280×720
- Chromium 390×844와 360px
- Firefox
- Safari 또는 iOS Safari
- 모든 팀, 6경기, 양 팀 관점
- 대표 미션의 브리핑→전술→결과
- 직접 URL·새로고침·404·손상 저장값
- console error, hydration warning, NaN

## 배포 계획

1. 전체 검증 통과
2. 공개 GitHub 저장소에 최종 commit push
3. Vercel 등 공개 HTTPS production 배포
4. 로그아웃·시크릿 창과 외부 네트워크 확인
5. 90초~2분 영상 녹화와 YouTube 업로드
6. 세 URL 제출
7. 공식 페이지 표시 2026-08-03 10:00 전에 제출하고, 시간대는 최신 공지에서
   재확인한 뒤 마감 이후 commit/push 금지

현재 공개 배포, 공개 GitHub, YouTube, Firefox, Safari/iOS Safari는 미완료입니다.
