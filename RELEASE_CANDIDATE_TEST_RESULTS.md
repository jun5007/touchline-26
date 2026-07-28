# TOUCHLINE 26 Release Candidate 테스트 결과

기준일: 2026-07-28 (Asia/Seoul)

## 환경

| 항목 | 버전 |
| --- | --- |
| Node.js | v24.14.0 |
| npm | 11.18.0 |
| Next.js | 16.2.12 |
| 운영체제 | Windows |

`npm ci`는 PASS했고 465 packages를 설치했습니다.

## 최종 자동 검증

| 명령·검사 | 결과 | 실제 관측값 |
| --- | --- | --- |
| `npm run lint` | PASS | 오류 0 / 경고 0 |
| `npm run test` | PASS | 22 files / 137 tests |
| `npm run attributes:verify` | PASS · 범위 제한 | 레거시 fixture 18명 × 8속성 |
| `npm run base-profile:verify` | 구조 PASS / 커버리지 미달 | P0 incomplete 81, profiles 0/104, performance records 0, active 0/832 |
| `npm run data:validate` | PASS | 4팀 / 6경기 / 13미션 / 104명 / 국가별 26명 |
| 출처 검사 | PASS | registry 51 / referenced unique 34 / unresolved 0 |
| `npm run data:coverage` | 무결성 PASS / 커버리지 0 | profiles 0/104 / active 0/832 |
| `npm run data:future-leakage` | PASS | roots 10 / modules 55 / forbidden 0 / chunks 4 / markers 13 |
| `npm run license:check` | PASS | 561 packages / SPDX 표현 15종 / 프로젝트 라이선스 미선택 공개 |
| `npm run score-distribution:verify` | PASS | 13미션 / 합법 선택 440,208개 |
| `npm run bundle:test` | PASS | 8/8 |
| `npm run build` | PASS | Next.js 16.2.12 / 9/9 |

build 이후 미래 정보 차단도 다시 통과했습니다. 속성 fixture의 18×8을
현재 104명의 실제 BASE 커버리지로 표현하지 않습니다. 최근 365일 실제
성과 레코드는 0건이고 Form/TLSI는 점수에 적용되지 않았습니다.

## 서버·route QA

| 대상 | 정상 대표 경로 | 잘못된 경로 | 판정 |
| --- | ---: | ---: | --- |
| 개발 서버 | 11/11 HTTP 200 | 4/4 HTTP 404 | PASS |
| production 서버 | 11/11 HTTP 200 | 4/4 HTTP 404 | PASS |

13개 미션의 briefing, tactics, result 직접 경로는 39/39 확인했습니다.

## production 브라우저 QA

| 환경·항목 | 실제 결과 |
| --- | --- |
| in-app browser 국가별 대표 흐름 | KOR / CZE / MEX / RSA PASS |
| in-app browser 모바일 추가 흐름 | KOR 두 번째 미션 PASS |
| console | error 0 / warning 0 |
| hydration | 오류 0 |
| 390×844 result/report | overflow 0 |
| 모바일 주요 버튼 | 48~50px |
| 클릭 기본 교체 | PASS |
| 유효 drag/drop | 미검증, 실험적 보조 |
| 실제 키보드-only | 미검증, 자동 접근성 테스트만 PASS |

Chrome plugin은 사용할 수 없었습니다. Computer Use는 현재 URL을 안전하게
확정할 수 없어 조작을 중단했습니다. 실제 Chrome, Edge, Firefox,
Safari/iOS Safari, 물리 모바일은 미검증입니다.

## 재현 명령

```powershell
npm ci
npm run lint
npm run test
npm run attributes:verify
npm run base-profile:verify
npm run data:validate
npm run data:coverage
npm run data:future-leakage
npm run license:check
npm run score-distribution:verify
npm run bundle:test
npm run build
npm run data:future-leakage
```

`bundle:test`는 번들 생성 코드의 경로·비밀·원자료 방어 회귀 테스트입니다.
새 RC/audit ZIP은 생성·검증·제출하지 않습니다.

## 외부·clean clone 판정

공개 GitHub remote와 최종 release SHA가 없어 clean clone은 검증하지
못했습니다. 로컬 복사나 ZIP 해제는 clean clone PASS의 대체 증거가
아닙니다. Production URL, YouTube URL, DAKER 접수도 실제 공개 URL과
로그아웃 접근 증거가 생긴 뒤에만 PASS로 기록합니다.

## 최종 판정

로컬 자동검증, 개발·production 서버, in-app browser production 클릭
흐름은 PASS입니다. 외부 공개·clean clone·실제 주요 브라우저와 실기기
검증·DAKER 접수가 남아 있어 전체 제출은 **조건부 통과**입니다.
