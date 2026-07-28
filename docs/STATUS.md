# TOUCHLINE 26 현재 상태

## 기준 시각

- 문서 갱신: 2026-07-28 KST
- 공식 페이지 표시 최종 제출 마감: 2026-08-03 10:00
- 시간대는 공식 페이지에 명시되지 않아 제출 직전 최신 공지에서 재확인
- 마감 이후 commit/push 금지
- 제출 정본: 저장소 루트 Next.js 앱
- DAKER 최종 제출물: 배포 URL, GitHub URL, YouTube URL 3개(파일 업로드 아님)

## 구현 범위

| 영역 | 상태 | 현재 내용 |
| --- | --- | --- |
| 팀 범위 | 구현 | KOR, CZE, MEX, RSA 정확히 4팀 |
| 조별리그 | 구현 | A조 공식 6경기와 최종 순위 |
| 국가별 여정 | 구현 | 각 팀 3경기 |
| 감독 관점 | 구현 | 모든 경기의 양 팀 관점 |
| 미션 | 구현 | 13개: KOR 4, CZE 3, MEX 3, RSA 3 |
| 최종 명단 | 구현 | FIFA 공식 명단 팀당 26명, 총 104명 |
| BASE PROFILE | 목표 미달 | P0 81명: complete 0·partial 0·incomplete 81, P0 0/648·전체 0/832 |
| Tournament Form | 제한적 | 이전 출전 사실만, 지표 부족으로 조정 0 |
| Current Condition | 제한적 | 공식 현재 분·카드 + 공개식 에너지 추정 |
| TLSI | 미적용 | 26개 협회 맥락, low/incomplete/applied false, 영향 0 |
| 출처 레지스트리 | 검증 | 고유 URL 51개: 기존 앱 사실 34개 + BASE 권리 감사 17개 |
| 미래 누출 방지 | 검증 | DTO, client graph, 전술 청크와 결과 표식 검사 |
| UI | 구현 | 국가→조→경기→관점→미션→전술→결과 흐름 |
| 진행률 | 구현 | 최소 선택 저장 후 현재 명단·역할 재검증, 경기·미션 상태 표시 |
| 국가 리포트 | 구현 | `/teams/[teamId]/report`, 경기 안 미션 평균 후 3경기 동일 비중 |
| 감독 성향 | 구현 | 역할·팀 지시·위험 패턴에서 결정적으로 계산 |

## 데이터 정책

- BASE 기간은 2025-06-11~2026-06-10입니다.
- 기간·자동 수집·JSON 저장·공개 서비스 재사용 권리를 모두 충족하는 동일 기준
  최근 365일 선수별 데이터가 없어 속성을 임의 생성하지 않았습니다.
- 필드 8키와 GK 전용 8키는 `1~20 정수 | null` 도메인입니다.
- 현재 104명의 활성 속성 832개는 모두 `null`이며 계산에서 제외됩니다.
- GK는 `shotStopping`, `distribution`, `aerialCommand`, `sweeping`,
  `penaltySaving`, `stability`, `buildUp`, `impact` 전용 모델을 사용합니다.
- FIFA의 넓은 `DF`·`MF`·`FW` 등록 포지션은 세부 전술 그룹으로 임의 변환하지
  않고, 필드 선수 후보군·세부 포지션 미확인으로 표시합니다.
- Tournament Form은 미션 전 경기만 참조하며 `no_minutes` 또는
  `insufficient_metrics`, 조정 0입니다.
- Current Condition 에너지는
  `max(60, round(100 - 0.42 × minutesInMatch))` 파생값입니다.
- TLSI 1.00은 검증된 리그 동등성이 아니라 보정 미적용 표시입니다.

## 미래 정보 경계

- 전술 화면 DTO에는 `finalScore`, 미션 이후 이벤트, `actualDecision`, 결과 사실이
  없습니다.
- `evaluateDecision`은 전체 데이터 `repository`를 import하지 않고 결과 비밀이
  없는 전용 지시 카탈로그만 사용합니다.
- 실제 선택과 결과는 결정 확정 후 결과 경로에서만 조회합니다.
- 전용 검증기가 source client graph와 빌드 산출물을 함께 검사합니다.

## 최신 자동 검증

| 명령·검사 | 결과 |
| --- | --- |
| `npm run data:validate` | PASS — 4팀·6경기·13미션·104명, 팀당 26명 |
| `npm run data:coverage` | PASS — P0 0/648·전체 0/832, complete 0·D 104 |
| 출처 무결성 | PASS — 레지스트리 51개, BASE 채택 0개, 미해결 참조 0 |
| `npm run base-profile:verify` | 구조 PASS — P0 81, complete 0·partial 0·incomplete 81, `coverageTarget=NOT_MET` |
| `npm run data:future-leakage` | PASS — client roots 10·modules 55·forbidden 0·전술 청크 4개·결과 표식 13개 |
| `npm run lint` | PASS — error 0·warning 0 |
| `npm run test` | PASS — 22 files / 137 tests |
| `npm run attributes:verify` | PASS — 동결 레거시 fixture 18명 × 8개 |
| `npm run build` | PASS — Next.js 16.2.12, 정적 페이지 9/9 |

`attributes:verify`의 레거시 픽스처는 과거 산출 파이프라인의 재현 방어이며, 현재
Group A BASE PROFILE이 완성됐다는 뜻이 아닙니다. 현재 BASE 커버리지는 위 표의
complete 0명·활성 속성 0/832가 정본입니다.

최신 production 실제 QA는 연결 가능한 Chromium 인앱 브라우저의 데스크톱과
요청 390×844 responsive에서 전술 선택→결과→리포트를 통과했습니다. 네 국가
대표 미션과 대한민국 모바일 미션을 실제 클릭했고 결과 새로고침 복원도
확인했습니다. 13미션의 briefing·tactics·result 39개 경로는 모두 HTTP 200,
대표 정상 경로 11개는 200, 잘못된 조합 4개는 404였으며 production console
warning/error와 hydration 오류는 0건입니다. responsive 확인은 물리
Android·터치 기기 시험이 아니며 Chrome·Edge·Firefox·Safari 검증을 뜻하지
않습니다. 상세 결과와 최신 화면 캡처 목록은
`RELEASE_CANDIDATE_TEST_RESULTS.md`와 `docs/ASSET_MANIFEST.md`를 정본으로
사용합니다.

## 아직 완료되지 않은 항목

- Google Chrome 실제 흐름 검증(Chrome plugin 연결 없음; Windows 제어는 현재 URL
  안전 판별 실패로 자동화 중단)
- Microsoft Edge 실제 흐름 검증
- Firefox 검증
- Safari 또는 iOS Safari 검증
- 물리 Android·터치 Chrome 검증
- 권리·기간 조건을 충족하는 P0 선수 성과 원자료 확보
- P0 BASE complete/partial 및 실제 1~20 능력치 확보
- 실제 선수 능력에 따른 점수 차이와 영향 게이지 활성화
- 공개 production URL
- 공개 GitHub URL과 최종 commit SHA
- YouTube 시연 URL
- 외부 네트워크·로그아웃 상태의 공개 URL 확인
- 제출 폼 완료 화면과 최신 운영진 공지 확인
- 실제 브라우저에서 키보드-only, GK↔GK 비교와 유효 필드 대상 데스크톱 drop을
  별도로 확인(인앱 Chromium에서 drag 시작·무효 drop/cancel은 안전했고 클릭
  기본 경로는 통과)

## Python 참고판

`python-fastapi/`는 최종 공개 main tip에서 제외합니다. 이전 단일 경기·두 미션
흐름의 동결 참고 구현은 Git이 무시하는 로컬 복사본과 이전 Git 이력에만 남으며,
새 Group A 데이터 모델과 동기화되거나 기능이 동등하다고 주장하지 않습니다.
제출·배포·영상의 정본은 저장소 루트 Next.js 앱뿐입니다.
