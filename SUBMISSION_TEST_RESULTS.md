# TOUCHLINE 26 최종 테스트 결과

> 기준일: 2026-07-28
>
> 판정 원칙: 로컬 자동검증, 서버·브라우저 QA, 외부 제출 상태를 분리합니다.

## 1. 환경

| 항목 | 실제 값 |
| --- | --- |
| Node.js | v24.14.0 |
| npm | 11.18.0 |
| Next.js | 16.2.12 |
| 운영체제 | Windows |

## 2. 최종 자동 검증

최종 수정 상태에서 `npm ci`부터 전체 검증을 실행했습니다.

| 명령·검사 | 결과 | 실제 관측값 |
| --- | --- | --- |
| `npm ci` | PASS | 465 packages |
| `npm run lint` | PASS | 오류 0, 경고 0 |
| `npm run test` | PASS | 22 files / 137 tests |
| `npm run attributes:verify` | PASS · 범위 제한 | 레거시 fixture 18명 × 8속성 |
| `npm run base-profile:verify` | 구조 PASS / 커버리지 미달 | P0 incomplete 81명, profiles 0/104, performance records 0, active 0/832 |
| `npm run data:validate` | PASS | 4팀, 6경기, 13미션, 104명, 국가별 26명 |
| 출처 검사 | PASS | registry 51, referenced unique 34, unresolved 0 |
| `npm run data:coverage` | 무결성 PASS / 커버리지 0 | profiles 0/104, active 0/832 |
| `npm run data:future-leakage` | PASS | roots 10, modules 55, forbidden 0, chunks 4, markers 13 |
| `npm run license:check` | PASS | 561 packages, SPDX 표현 15종, 프로젝트 라이선스 미선택 공개 |
| `npm run score-distribution:verify` | PASS | 13미션, 합법 선택 440,208개 |
| `npm run bundle:test` | PASS | 8/8, 번들 방어 코드 회귀 테스트 |
| `npm run build` | PASS | 9/9 |

속성 fixture 18×8은 재현성 검사이며 현재 104명의 BASE 커버리지 증거가
아닙니다. 최근 365일 실제 성과 레코드는 0건이고 Form/TLSI도 점수에
적용되지 않았습니다.

## 3. 서버·route 검증

| 대상 | 정상 대표 경로 | 잘못된 경로 | 결과 |
| --- | ---: | ---: | --- |
| 개발 서버 | 11/11 HTTP 200 | 4/4 HTTP 404 | PASS |
| production 서버 | 11/11 HTTP 200 | 4/4 HTTP 404 | PASS |

13개 모든 미션의 briefing, tactics, result 직접 경로도 39/39
확인했습니다. 대표 smoke와 39개 직접 경로 검사를 모든 UI 조합의
브라우저 전수 상호작용으로 확대 해석하지 않습니다.

## 4. production 브라우저 QA

| 항목 | 실제 결과 |
| --- | --- |
| in-app browser 국가별 대표 흐름 | KOR / CZE / MEX / RSA 클릭 흐름 PASS |
| in-app browser 모바일 추가 흐름 | KOR 두 번째 미션 PASS |
| 콘솔 | 오류 0 / 경고 0 |
| hydration | 오류 0 |
| 390×844 result/report | overflow 0 |
| 주요 모바일 버튼 | 높이 48~50px |
| 클릭 기본 교체 | PASS |
| 유효 drag/drop | 미검증, 실험적 보조 |
| 실제 키보드-only 이벤트 | 미검증, 자동 접근성 테스트만 PASS |

Chrome plugin은 사용할 수 없었습니다. Computer Use는 현재 URL을 안전하게
판별할 수 없어 조작을 중단했습니다. 실제 Chrome, Edge, Firefox,
Safari/iOS Safari, 물리 모바일은 미검증입니다. in-app browser 결과를
이 환경들의 PASS로 바꾸어 표현하지 않습니다.

## 5. 재현 명령

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

`bundle:test`는 경로 순회, 절대경로, 비밀·원자료 포함 방어의 코드
회귀 테스트입니다. 새 RC/audit ZIP 생성은 최종 제출 절차가 아닙니다.

## 6. 외부 검증

공개 GitHub URL, production URL, YouTube URL이 없어 다음 항목은
검증하지 못했습니다.

- 공개 GitHub clean clone
- 로그아웃 production 접근과 실제 배포 브라우저 QA
- YouTube 로그아웃 재생
- DAKER 접수 완료

DAKER에는 배포 URL, GitHub URL, YouTube URL만 제출합니다. 과거 로컬
RC/audit ZIP은 테스트 결과나 제출물이 아닙니다.

## 7. 판정

로컬 자동검증, 개발·production 서버와 in-app browser 클릭 흐름은
PASS입니다. 외부 공개·clean clone·실제 Chrome 계열 추가 확인과 DAKER
접수가 남아 있으므로 전체 제출 판정은 **조건부 통과**입니다.
