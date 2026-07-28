# 2026 월드컵 A조 데이터 조사

## 조사 범위

- 확인일: 2026-07-27
- 지원 팀: 대한민국(KOR), 체코(CZE), 멕시코(MEX), 남아프리카공화국(RSA)
- 지원 경기: 2026 FIFA 월드컵 A조 공식 6경기
- 최종 명단: 4팀 × 26명 = 104명
- 미션: 13개, 모든 경기의 양 팀 감독 관점 포함
- 원칙: 확인하지 못한 값은 `null`, 불완전하면 `incomplete`, 공식 사실과 자체 파생값은 분리

## 공식 경기 정본

| Match | FIFA match id | 일시(현지) | 장소 | 경기 | HT | FT | 관중 |
| --- | --- | --- | --- | --- | ---: | ---: | ---: |
| M01 | 400021443 | 06-11 13:00 | Mexico City Stadium | MEX–RSA | 1–0 | 2–0 | 80,824 |
| M02 | 400021441 | 06-11 20:00 | Guadalajara Stadium | KOR–CZE | 0–0 | 2–1 | 44,985 |
| M25 | 400021440 | 06-18 12:00 | Atlanta Stadium | CZE–RSA | 1–0 | 1–1 | 67,442 |
| M28 | 400021442 | 06-18 19:00 | Guadalajara Stadium | MEX–KOR | 0–0 | 1–0 | 45,522 |
| M53 | 400021444 | 06-24 19:00 | Mexico City Stadium | CZE–MEX | 0–0 | 0–3 | 80,824 |
| M54 | 400021445 | 06-24 19:00 | Monterrey Stadium | RSA–KOR | 0–0 | 1–0 | 51,243 |

공식 최종 순위:

| 순위 | 팀 | 경기 | 승 | 무 | 패 | 득 | 실 | 득실 | 승점 |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | MEX | 3 | 3 | 0 | 0 | 6 | 0 | +6 | 9 |
| 2 | RSA | 3 | 1 | 1 | 1 | 2 | 3 | −1 | 4 |
| 3 | KOR | 3 | 1 | 0 | 2 | 2 | 3 | −1 | 3 |
| 4 | CZE | 3 | 0 | 1 | 2 | 2 | 6 | −4 | 1 |

## 경기별 공식 출처

각 경기에 다음 다섯 종류를 등록했습니다.

- Full-Time Match Report(FTR): 명단, 스코어, 득점, 카드, 교체, 관중
- Tactical Line-up: 공식 시작 포메이션과 위치
- Post-Match Summary Report(PMSR): 경기 종료 후 팀·선수 통계 확인
- FIFA Match API: 구조화된 경기 메타데이터와 이벤트 교차 확인
- FIFA 경기 기사: 공식 서술형 경기 흐름 교차 확인

| Match | FTR / Tactical resource | PMSR | FIFA API |
| --- | --- | --- | --- |
| M01 | `r12452` | [MEX–RSA](https://www.fifatrainingcentre.com/media/native/tournaments/fifa-world-cup/2026/PMSR-M01%20MEX%20V%20RSA.pdf) | [400021443](https://api.fifa.com/api/v3/live/football/17/285023/289273/400021443?language=en) |
| M02 | `r12450` | [KOR–CZE](https://www.fifatrainingcentre.com/media/native/tournaments/fifa-world-cup/2026/PMSR-M02%20KOR%20V%20CZE%20.pdf) | [400021441](https://api.fifa.com/api/v3/live/football/17/285023/289273/400021441?language=en) |
| M25 | `r12449` | [CZE–RSA](https://www.fifatrainingcentre.com/media/native/tournaments/fifa-world-cup/2026/PMSR-M25-CZE-V-RSA.pdf) | [400021440](https://api.fifa.com/api/v3/live/football/17/285023/289273/400021440?language=en) |
| M28 | `r12451` | [MEX–KOR](https://www.fifatrainingcentre.com/media/native/tournaments/fifa-world-cup/2026/PMSR-M28-MEX-V-KOR.pdf) | [400021442](https://api.fifa.com/api/v3/live/football/17/285023/289273/400021442?language=en) |
| M53 | `r12453` | [CZE–MEX](https://www.fifatrainingcentre.com/media/native/tournaments/fifa-world-cup/2026/PMSR-M53-CZE-V-MEX.pdf) | [400021444](https://api.fifa.com/api/v3/live/football/17/285023/289273/400021444?language=en) |
| M54 | `r12454` | [RSA–KOR](https://www.fifatrainingcentre.com/media/native/tournaments/fifa-world-cup/2026/PMSR-M54-RSA-V-KOR.pdf) | [400021445](https://api.fifa.com/api/v3/live/football/17/285023/289273/400021445?language=en) |

FTR URL 형식:

```text
https://fdp.fifa.org/assetspublic/ce281/{resource}/pdf/FullTimeMatchReport-English.pdf
```

Tactical Line-up URL 형식:

```text
https://fdp.fifa.org/assetspublic/ce281/{resource}/pdf/TacticalLineup-English.pdf
```

FIFA 기사와 모든 완전한 URL은 `src/data/sources/sourceRegistry.json`에 보관합니다.

## 최종 명단과 선수 식별

정본은 [FIFA World Cup 2026 Squad List, Version 1](https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-English.pdf?gsid=a2368148-7202-4e66-ae6c-8c595843c395)입니다.

- CZE: PDF 15쪽
- KOR: PDF 27쪽
- MEX: PDF 28쪽
- RSA: PDF 40쪽
- 팀당 등번호 1~26, 공식 포지션, 생년월일, 신장, A매치, 득점, 클럽을 구조화했습니다.
- FIFA PDF에서 Jayden Adams의 클럽이 비어 있어 [COSAFA 공식 기사](https://cosafa.com/south-africa-reveal-jersey-numbers-for-2026-world-cup/)로 Mamelodi Sundowns를 보완했습니다.
- COSAFA 값은 해당 한 필드에만 사용하고 별도 source id를 남겼습니다.

FIFA 최종 명단의 클럽 협회 코드는 리그·시즌 성적을 뜻하지 않습니다. 프로젝트는 26개 클럽 협회 맥락을 식별했지만 이를 실제 리그 순위로 확대 해석하지 않습니다.

## 랭킹 맥락

FIFA 공식 랭킹 기사에 게시된 본선 후 순위와 등락 폭을 역산해 개막일 참조 순위를 파생했습니다.

| 팀 | 2026-06-11 참조 순위 | 상태 |
| --- | ---: | --- |
| MEX | 14 | 공식 발표 등락 폭 역산 파생 |
| KOR | 25 | 공식 발표 등락 폭 역산 파생 |
| CZE | 40 | 공식 발표 등락 폭 역산 파생 |
| RSA | 60 | 공식 발표 등락 폭 역산 파생 |

이는 기사에 그 날짜의 표가 직접 실린 값이 아니므로 `derived`로 표시합니다. 출처는 [FIFA 2026년 7월 랭킹 기사](https://inside.fifa.com/fifa-world-ranking/men/news/argentina-reclaim-top-spot-mens-world-ranking-fifa-coca-cola)입니다.

## 선수 데이터 세 층

### 1. BASE PROFILE

- 고정 기간: 2025-06-11~2026-06-10
- 목표: 본선 시작 전에 알 수 있었던 동일 기준 최근 365일 선수 프로필
- 실제 확보 상태: 검증 가능한 공통 선수별 이벤트·분모 데이터셋 없음
- 결과: 104명 전원 `D/incomplete`, `analysisMinutes: null`, 속성 `null`

FIFA 명단의 A매치 수, 신장, 클럽은 신원·명단 메타데이터이지 최근 365일 퍼포먼스 프로필이 아닙니다. PMSR은 본선 경기 종료 후 자료이므로 BASE PROFILE에 넣지 않습니다.

### 2. Tournament Form

- 해당 미션 시각 이전 A조 경기의 출전 사실만 참조
- 이전 경기 출전이 없으면 `no_minutes`
- 출전 사실은 있으나 시점 안전한 선수별 지표가 없으면 `insufficient_metrics`
- 두 상태 모두 `adjustment: 0`
- 본선 이후 경기나 현재 경기의 미래 구간은 참조하지 않음

### 3. Current Condition

- 현재 시점까지 공식 라인업·교체·퇴장·카드로 확인되는 상태
- `minutesInMatch`는 미션 시각의 공식 경기 흐름에서 계산
- 에너지는 `max(60, round(100 - 0.42 × minutesInMatch))`
- 이는 공식 생체 수치가 아닌 자체 파생 휴리스틱
- 부상, 최근 일정 부담, 정확한 현재 위치처럼 확인할 수 없는 필드는 `null`

## 경기 명단과 불참 처리

FIFA FTR에 등록된 선발·벤치를 경기별 가용 명단의 정본으로 사용합니다. 최종 명단에 있으나 경기 명단에 없는 선수는 자동으로 부상·징계로 단정하지 않습니다.

- M28 MEX: César Montes가 경기 명단에 없음
- M25 RSA: Sphephelo Sithole, Themba Zwane가 경기 명단에 없음
- M54 RSA: Teboho Mokoena, Themba Zwane가 경기 명단에 없음
- M25/M53 CZE: David Jurásek가 경기 명단에 없음
- KOR: 세 경기 모두 최종 명단과 경기 명단 차이에 대해 별도 미확인 사유를 만들지 않음

Teboho Mokoena의 징계처럼 공식 근거가 확인된 경우만 사유를 기록합니다. 나머지는 사유 `null`을 유지합니다.

## 출처 충돌 처리

- M02 체코의 세 명 동시 교체: FTR은 63분, PMSR은 64분입니다. 이벤트 정본인 FTR의 63분을 사용하고 충돌을 기록합니다.
- M53 Edson Álvarez 경고: FTR과 PMSR은 64분, FIFA API는 63분입니다. FTR/PMSR의 64분을 사용합니다.
- 사후 전술 의도는 공식 인터뷰가 없으면 `inferred`로 표시하며 공식 사실처럼 쓰지 않습니다.

## 미션과 미래 정보 누출

13개 미션은 공식 이벤트 사이의 감독 선택 지점을 편집적으로 선정했습니다. `scenarioTimestamp`는 킥오프와 경기 분을 조합한 논리적 경계이며 공식 벽시계 이벤트 시각이 아닙니다.

의사결정 화면에는 다음을 보여주지 않습니다.

- 최종 스코어
- 미션 이후 득점·카드·교체
- 실제 감독의 해당 선택
- 다음 경기 정보에서 유추한 Tournament Form

결과 사실과 실제 선택은 확정 후 결과 화면에서만 공개합니다. DTO 테스트와 `scripts/validate-future-leakage.mjs`가 이 경계를 검사합니다.

## 품질 검증

```bash
npm run data:generate
npm run data:validate
npm run data:coverage
npm run data:future-leakage
```

검증 대상:

- 정확히 4팀, 6경기, 팀당 3경기
- 경기마다 양 팀 관점, 총 13미션
- 최종 명단 104명과 팀당 26명
- 선발 11명, 현재 라인업·벤치의 선수 id 유효성
- 공식 명단과 경기별 불참 처리
- 출처 id 참조 무결성
- BASE 기간과 `null` 속성 정책
- Tournament Form의 시각 경계
- 전술 DTO의 결과 정보 차단

명령은 최종 통합 후 다시 실행해야 하며, 과거 단일 경기판의 테스트 수치는 현재 A조판의 검증 결과가 아닙니다.

## 저작권과 재사용

- FIFA 로고, 월드컵 엠블럼, 대표팀 문장, 선수 사진, PDF 캡처, 원본 표 디자인을 앱에 사용하지 않습니다.
- 공식 PDF는 조사 중 로컬 확인에만 사용하고 공개 저장소에 포함하지 않습니다.
- 기사 문장이나 영상은 복제하지 않고 사실 확인 링크만 제공합니다.
- 구조화한 사실, 자체 미션, 자체 파생값의 구분을 데이터와 UI에 남깁니다.

전체 고지는 `THIRD_PARTY_NOTICES.md`를 참고하세요.
