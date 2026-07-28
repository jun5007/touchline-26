# TOUCHLINE 26 대회 요구사항 검토

- 검토일: 2026-07-27 KST
- 공식 안내: [월간 해커톤: 내가 축구 감독이라면 - 월드컵 전술 웹서비스 챌린지](https://daker.ai/public/hackathons/world-cup-manager-tactics-web-challenge)
- 정본 런타임: 저장소 루트 Next.js 앱
- 판정 원칙: 코드·로컬 데이터·실행 결과로 확인하지 않은 항목은 완료로 표시하지 않음

## 공식 안내 핵심

- 실제 월드컵 데이터를 활용한 동적 전술 웹서비스
- 사용자가 클릭·드래그·배치·전술 설정을 직접 조작
- 별도 설치·로그인·결제·개인 API 키 없이 브라우저에서 사용
- 최종 제출에 공개 배포 URL, 공개 GitHub, YouTube 영상 필요
- 주요 브라우저 지원
- 저작권·라이선스 준수
- 공식 페이지 표시 최종 마감 2026-08-03 10:00(시간대는 최신 공지에서 재확인)
- 마감 이후 commit/push 금지

## 요구사항 대응표

| 요구사항 | 현재 상태 | 근거 | 남은 작업 |
| --- | --- | --- | --- |
| 실제 월드컵 데이터 | 구현·로컬 검증 | A조 4팀, 6경기, 104명 공식 명단; validator PASS | 공개 배포 확인 |
| 동적 전술 경험 | 구현·로컬 검증 | 국가/경기/관점/미션, 클릭 OUT/IN, 역할, 팀 지시, 결과; 인앱 Chromium PASS | 유효 대상 drag와 주요 브라우저 교차 확인 |
| 모든 경기 양측 관점 | 구현·검증 | 경기당 양 팀 미션, 총 13개; build 9/9, 대표 유효 경로 11개 HTTP 200 | 공개 배포 확인 |
| 공식 사실과 모델 구분 | 구현·검증 | BASE/Form/Condition/결과 사실 분리, 결과 전용 경계 확인 | 공개 배포 문구 재확인 |
| 최근 365일 데이터 정직성 | 구현·검증 | 104명 D/incomplete, 분석 분·속성 null, coverage PASS | 공식 보완 데이터 확보 시에만 갱신 |
| GK 별도 모델 | 구현·자동 검증 | GK 전용 8키·비교 UI 회귀 테스트 | 실제 브라우저 GK↔GK 별도 시연 |
| 누락값 처리 | 구현·검증 | 누락 제외와 재가중, 게이지 unavailable, 테스트 PASS | 없음 |
| Tournament Form 시각 안전 | 구현·검증 | 이전 출전 사실만, 조정 0, leakage PASS | 없음 |
| Current Condition 설명 | 구현·검증 | 공식 분·카드와 자체 에너지 식, UI 라벨 확인 | 없음 |
| TLSI 과장 방지 | 구현·검증 | 26개 맥락, 1.00/low/incomplete/applied false/영향 0 | 공식 비교 근거 확보 시에만 활성화 |
| 미래 정보 누출 방지 | 구현·검증 | DTO·client roots 10·modules 55·forbidden 0·전술 청크 4개·결과 표식 13개 PASS | 없음 |
| 출처 무결성 | 구현 데이터 | FIFA squad/FTR/Tactical/PMSR/API/article/ranking, COSAFA | 링크 재확인 |
| 모바일 클릭 | 구현·검증 | 클릭 흐름; 인앱 Chromium 요청 390×844 responsive QA PASS | 물리 터치 기기 확인 |
| 설치·로그인·API 키 불필요 | 구조상 충족 | 정적 JSON과 로컬 계산 | 공개 배포에서 확인 |
| 저작권 고지 | 문서화 | `THIRD_PARTY_NOTICES.md`, 원본 자산 미복제 | 공개 저장소 최종 점검 |
| Python판 구분 | 완료 | 이전판 동결 참고 구현으로 명시 | 제출·영상에서 제외 |
| Chromium | 완료 | 최신 production에서 데스크톱·요청 390×844 responsive 재검증 | 없음 |
| Google Chrome | 미완료 | Chrome plugin 연결 없음; Windows 제어는 현재 URL 안전 판별 실패로 중단 | 실제 핵심 흐름 확인 |
| Microsoft Edge | 미완료 | 실행·창 감지 뒤 현재 URL 안전 판별 실패로 자동화 중단 | 핵심 흐름 확인 |
| Firefox | 미완료 | 실행 기록 없음 | 핵심 흐름 확인 |
| Safari/iOS Safari | 미완료 | 실행 기록 없음 | 핵심 흐름 확인 |
| 공개 배포 URL | 미완료 | URL 없음 | production 배포·로그아웃 확인 |
| 공개 GitHub | 미완료 | 공개 URL/SHA 없음 | 공개 push·재현 확인 |
| YouTube | 미완료 | 영상 URL 없음 | 녹화·업로드·로그아웃 확인 |

## 데이터 범위 판정

### 충족한 구조

- KOR, CZE, MEX, RSA만 지원
- 6경기와 최종 순위
- 팀당 26명, 총 104명
- 13개 미션
- 팀당 세 경기 여정
- 각 경기 양측 관점
- 공식 경기 보고서와 source registry

### 의도적으로 미완성인 값

- 104명 BASE PROFILE 능력치
- 최근 365일 분석 출전시간
- 선수별 Tournament Form 지표
- 검증된 리그 강도 보정
- 공식 체력·부상·일정 부담

위 값은 제출 직전에 임의로 채우지 않습니다. `null`, D/incomplete, adjustment 0, applied false 상태가 현재의 정직한 결과입니다.

## 검증 스냅샷 원칙

새 Group A판 최종 상태에서 다음 명령을 실행했습니다.

```bash
npm ci
npm run data:generate
npm run data:validate
npm run data:coverage
npm run data:future-leakage
npm run lint
npm run test
npm run build
npm run start
```

결과는 data validate/coverage/future-leakage와 lint 모두 PASS이고,
future-leakage 상세는 client roots 10·modules 55·forbidden 0·전술 청크
4개·결과 표식 13개입니다. Vitest는 22 files / 137 tests, build는 9/9,
레거시 속성 재현은 18명 × 8개 PASS입니다.

최신 production 인앱 Chromium QA는 데스크톱과 요청 390×844 responsive에서
통과했습니다. 네 국가 대표 미션과 대한민국 모바일 미션을 실제 클릭했고,
13미션의 briefing·tactics·result 39개 경로도 모두 HTTP 200이었습니다.
대표 유효 경로 11개는 모두 200, 잘못된 조합 4개는 모두 404였고
console warning/error와 hydration 로그는 0건이었습니다. 실제 Chrome은
연결하지 못했고 Edge·Firefox·Safari/iOS Safari는 아직 실행하지 않았습니다.
responsive 확인은 물리 모바일·터치 시험이 아닙니다.

## 현재 제출 차단 항목

1. Google Chrome 실제 핵심 흐름
2. Microsoft Edge 실제 핵심 흐름
3. Firefox
4. Safari 또는 iOS Safari와 물리 모바일
5. 공개 production URL
6. 공개 GitHub URL과 commit SHA
7. YouTube URL
8. 외부 네트워크·로그아웃 접근 확인
9. 최신 공지와 제출 완료 화면

## 최종 제출 순서

1. 데이터 생성 결과와 diff를 검토합니다.
2. validator, lint, test, build, production 실행을 완료합니다.
3. Chrome·Edge·Firefox·Safari/iOS Safari에서 핵심 흐름을 확인합니다.
4. 공개 GitHub에 마지막 commit을 push하고 SHA·시각을 기록합니다.
5. production 배포 후 시크릿 창과 외부 네트워크에서 확인합니다.
6. 영상을 녹화해 YouTube에 올리고 로그아웃 상태로 엽니다.
7. 세 URL을 공식 페이지 표시 2026-08-03 10:00 전에 제출하고 시간대는 최신
   공지에서 재확인합니다.
8. 제출 완료 후 commit/push를 중단합니다.
