# TOUCHLINE 26 최종 제출 체크리스트

이 문서는 저장소 내부 구현과 사용자가 외부에서 완료해야 할 제출 작업을 분리합니다.

- `[x]`는 저장소에서 확인 가능한 현재 구현 또는 문서화 상태입니다.
- `[ ]`는 최종 소스 재검증이나 외부 서비스에서 사용자가 완료해야 하는 작업입니다.
- 자동 검증의 실제 숫자와 종료 코드는 `SUBMISSION_TEST_RESULTS.md`를 정본으로 사용합니다.

DAKER 최종 제출물은 파일 업로드가 아니라 배포 URL, GitHub URL, YouTube URL
3개입니다. ZIP·PDF·README·테스트 결과는 DAKER에 업로드하지 않습니다.

## 1. 공식 일정 확인

- [ ] 공식 페이지의 최종 마감 **2026-08-03 10:00** 재확인
- [ ] 시간대가 명확하지 않으면 공식 공지와 제출 화면에서 표기 기준 재확인
- [ ] DAKER의 배포·GitHub·YouTube URL 3개 입력란 확인 — 사용자 작업 필요
- [ ] 운영진 게시판의 최신 추가 공지 확인
- [ ] 필수 항목, 공개 범위, 제출 폼 변경 여부 확인
- [ ] 마감보다 충분히 앞선 내부 동결 시각 결정

“KST”는 공식 페이지에서 명시적으로 확인하기 전 임의로 붙이지 않습니다.

## 2. 제품 정본과 범위

- [x] 제출 런타임은 저장소 루트 Next.js 앱
- [x] `python-fastapi/`는 최종 공개 main tip에서 제외하고, Git이 무시하는
      로컬 복사본과 이전 Git 이력만 보존
- [x] KOR/CZE/MEX/RSA 정확히 4개국
- [x] A조 공식 6경기
- [x] 국가별 조별리그 3경기
- [x] 모든 경기에서 양 팀 감독 관점 제공
- [x] 총 13미션: KOR 4, CZE 3, MEX 3, RSA 3
- [x] 팀당 26명, 총 104명
- [x] 회고형 전술 의사결정 시뮬레이션으로 정의
- [ ] 최종 production 화면에 범위 밖 팀·조가 노출되지 않는지 확인

## 3. 핵심 기능

- [x] 국가 선택 → 3경기 여정 → 경기 → 관점 → 미션 흐름
- [x] 미션 브리핑과 전술 선택 화면 분리
- [x] OUT/IN, 역할, 공격 방향·압박·수비 라인·성향 선택
- [x] 클릭이 주 조작이고 드래그앤드롭은 실험적 보조 방식
- [x] 전술 선택 적합도와 동적 점수 구성
- [x] 장점, 위험, 대응, 대안과 실제 선택 비교
- [x] 결정 확정 전 결과 전용 정보 차단
- [x] 국가 여정의 경기·미션 진행률
- [x] `/teams/[teamId]/report` 국가별 조별리그 리포트
- [x] 여러 미션이 있는 경기는 미션 평균을 먼저 계산
- [x] 조별리그 전체는 세 경기 점수를 같은 비중으로 평균
- [x] 미완료 경기 상태와 전체 평균 제외 규칙 표시
- [x] 사용자 역할·팀 지시 패턴 기반 감독 성향
- [x] 다시 플레이와 다른 국가 선택
- [ ] production에서 네 국가 전체 핵심 흐름 실사용 확인

## 4. 점수와 문구 정직성

- [x] 명칭을 “전술 선택 적합도 / TACTICAL DECISION FIT”로 통일
- [x] 승률·경기 결과 예측·선수 절대 능력치가 아니라고 명시
- [x] 적합도 구성 요소가 실제 가용 근거에 따라 동적으로 표시
- [x] 사용할 수 없는 영향 게이지를 빈 0 막대로 반복 표시하지 않음
- [x] 실제 감독 선택을 정답이나 채점 기준으로 표현하지 않음
- [x] 감독 성향을 선수 능력이나 심리 진단으로 표현하지 않음
- [ ] 홈·전술·결과·리포트·데이터 소개에서 금지 표현 최종 검색

## 5. 데이터 정직성

- [x] BASE PROFILE 기간 2025-06-11~2026-06-10
- [x] 최근 1년 BASE complete 0/104명
- [x] 활성 1–20 속성 0/832개
- [x] P0 81명: complete 0, partial 0, incomplete 81
- [x] P0 활성 속성 0/648개
- [x] `null`을 0·평균·중립 능력치로 채우지 않음
- [x] 다른 축구 게임의 평점이나 구조를 복제하지 않음
- [x] 비어 있는 1–20 비교표를 데이터가 있는 것처럼 노출하지 않음
- [x] Tournament Form은 이전 경기 출전 사실만 참조하고 현재 조정 0
- [x] TLSI는 low/incomplete/applied false이며 현재 영향 0
- [x] `strengthFactor: 1.00`을 검증된 리그 동등성으로 설명하지 않음
- [x] Current Condition은 공식 출전 시간·카드와 자체 추정을 구분
- [x] 에너지 식 `max(60, round(100 - 0.42 × minutesInMatch))` 공개
- [x] 부상·불참 사유·일정 부담 등 미확인 값은 임의 생성하지 않음
- [ ] production의 선수 비교 화면에서 반복되는 D/0/0% 노이즈가 없는지 확인

## 6. 사실과 분석 경계

- [x] 공식 확인 사실, 프로젝트 자체 분석, 결과 전용 사실 구분
- [x] `scenarioTimestamp` 이후 사건은 전술 화면에서 제외
- [x] 전술 DTO에 `finalScore`와 `actualDecision` 없음
- [x] 실제 최종 결과와 실제 감독 선택은 결과 화면에서만 사용
- [x] `npm run data:future-leakage` 검사 제공
- [ ] 최종 빌드의 13미션에서 결과 정보 조기 노출이 없는지 확인

## 7. localStorage와 재계산

- [x] 저장 형식 버전 포함
- [x] `matchId`, `scenarioId`, `selectedTeamId` 저장
- [x] OUT/IN 선수 ID, 역할 ID, 네 가지 팀 지시, 생성 시각만 저장
- [x] 점수, 위험, 설명, 실제 결과는 저장하지 않음
- [x] 현재 팀·명단·역할·시나리오를 다시 검증
- [x] 결과와 리포트 점수를 현재 코드·데이터로 재계산
- [x] 손상·구버전·불일치 값을 제외하고 사용자에게 알림
- [x] 같은 탭의 저장 변경도 진행률과 리포트에 반영
- [x] 계정 동기화가 아닌 현재 브라우저·현재 origin의 기기 로컬 진행률임을 문서화
- [ ] 손상 JSON, 구버전, 잘못된 팀·선수·역할 ID production 수동 확인

## 8. 자동 검증

최종 commit 후보에서 다음을 순서대로 실행합니다.

```bash
npm ci
git diff --check
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
npm run bundle:test
```

별도 터미널에서 production 서버를 기동하고 핵심 route와 404를 확인합니다.

```bash
npm run start
```

기존 Release Candidate 검토 ZIP은 과거 로컬 기록일 뿐이며 DAKER 또는 공개
GitHub 제출 대상이 아닙니다. 최종 출시 단계에서는 새 ZIP을 만들거나 업로드하지
않습니다.

- [x] 의존성 설치
- [x] whitespace·충돌 표식 검사
- [x] 데이터 범위와 출처 참조 무결성
- [x] 커버리지 보고
- [x] 미래 정보 누출 검사
- [x] ESLint
- [x] 전체 Vitest
- [x] 레거시 속성 재현 픽스처
- [x] BASE 구조·산식 검사와 커버리지 `NOT_MET` 확인
- [x] 라이선스·금지 자산 검사
- [x] Next.js production build
- [x] production 서버 기동과 핵심 route·직접 새로고침·404 smoke
- [x] 제출 묶음 생성기 단위 테스트(`bundle:test`)
- [x] 기존 검토 ZIP을 과거 로컬 기록으로만 보관하고 DAKER·공개 GitHub에서 제외
- [x] 실제 결과를 `SUBMISSION_TEST_RESULTS.md`에 기록

## 9. production QA

### 화면 크기

- [x] Desktop 제출 캡처 983×709
- [x] Mobile 요청 viewport 390×844, 저장 PNG 375×811
- [ ] Mobile 360px
- [x] 핵심 버튼 가림 없음
- [x] 의도하지 않은 가로 스크롤 없음

### 브라우저

- [x] Chromium 인앱 브라우저
- [ ] Google Chrome 실제 데스크톱·responsive 클릭 흐름
- [ ] Microsoft Edge
- [ ] Firefox
- [ ] Safari 또는 iOS Safari
- [x] console error 0
- [x] hydration warning 0

### 전체 흐름

- [x] 네 국가 대표 미션 실제 클릭
- [x] 6경기의 양 팀 관점에 해당하는 13미션 경로 검증
- [x] 13미션 briefing·tactics·result 39/39 진입
- [x] 클릭만으로 교체·역할·팀 지시 완료
- [x] 데스크톱 drag 시작·무효 drop·취소 안전 복구
- [ ] 데스크톱 유효 필드 대상 drop 교체
- [x] 확정 전 결과 정보 비노출
- [x] 결과 새로고침
- [x] 직접 결과 URL의 안전한 복구
- [x] 잘못된 팀·경기·미션 URL의 404 또는 복구
- [x] 팀 여정 진행률
- [ ] 리포트의 시작 전·일부 완료·완료 상태
- [x] 경기 동일 비중 전체 점수
- [ ] 리포트 다시 플레이

실제로 실행하지 않은 브라우저나 기기는 완료 표시하지 않습니다. 키보드
접근성 자동 테스트는 통과했지만 인앱 브라우저 키 입력 전달을 확인하지
못했으므로 실제 키보드-only 항목은 완료 표시하지 않습니다.

## 10. 접근성

- [x] 본문 바로가기와 논리적인 헤딩 구조
- [ ] 실제 브라우저 키보드-only OUT·IN·확정
- [x] 클릭만으로 드래그 없이 핵심 흐름 완료
- [x] 포커스 표시
- [x] `aria-label`, `aria-pressed`, `aria-live`
- [x] 색상 외 텍스트로 선택·위험·누락·진행 상태 구분
- [x] reduced motion

## 11. 저작권·라이선스·비제휴

- [x] 독립적인 비공식 프로젝트임을 고지
- [x] FIFA, 협회, COSAFA, 대회 운영사, 구단, 감독, 선수와 비제휴
- [x] 공식 로고·문장·선수 사진·방송 영상·보고서 화면 미사용
- [x] 출처 URL, 접근일, 용도와 권리 판정을 레지스트리에 기록
- [x] 원문 PDF를 Git과 공개 제출물에서 제외
- [x] 오픈소스 런타임 고지
- [x] 프로젝트 수준 오픈소스 라이선스 미선택 상태 명시
- [x] 공개 후보와 production 자산의 최종 `license:check`
- [ ] 제출 시점 원문 출처 링크의 접근 가능 여부 확인

## 12. 문서와 최종 제출 자료

- [x] `README.md`
- [x] `docs/VERCEL_DEPLOYMENT_GUIDE.md`
- [x] `docs/GITHUB_RELEASE_CHECKLIST.md`
- [x] `docs/DEMO_SCRIPT.md`
- [x] `docs/FINAL_SUBMISSION_CHECKLIST.md`
- [x] `SUBMISSION_FINAL_SUMMARY.md` 최종 상태 반영
- [x] `SUBMISSION_TEST_RESULTS.md` 최종 명령·브라우저 결과 반영
- [x] `SUBMISSION_KNOWN_ISSUES.md` 실제 미완료만 반영
- [x] `SUBMISSION_RELEASE_CHECKLIST.md` 외부 URL 상태 반영
- [x] `docs/submission-screenshots` 실제 production 캡처 15장 확인
- [x] 기존 `TOUCHLINE26_RELEASE_CANDIDATE_AUDIT.zip`은 과거 로컬 검토 기록이며
      DAKER·공개 GitHub 제출 대상이 아님
- [x] DAKER에 ZIP·PDF·README·테스트 결과 파일을 업로드하지 않음

## 13. GitHub — 사용자 작업 필요

- [ ] `docs/GITHUB_RELEASE_CHECKLIST.md`에 따라 변경 감사
- [ ] 공개 GitHub 저장소 생성 또는 정확한 기존 저장소 확인
- [ ] 최종 commit push
- [ ] 최종 commit SHA와 push 시각·시간대 기록
- [ ] 로그아웃 시크릿 창에서 저장소 확인
- [ ] 공개 저장소에서 설치·빌드 재현
- [ ] 이후 이력 재작성·force push 금지

```text
Public GitHub URL:
Final commit SHA:
Push 시각 및 시간대:
```

## 14. Vercel — 사용자 작업 필요

- [ ] `docs/VERCEL_DEPLOYMENT_GUIDE.md`에 따라 최종 SHA 배포
- [ ] 접근 보호·로그인·결제·API 키 없이 열림
- [ ] 로그아웃 시크릿 창 확인
- [ ] 외부 네트워크 확인
- [ ] GitHub 최종 SHA와 배포 SHA 일치
- [ ] 심사 기간 동안 URL 유지

```text
Production URL:
Deployment ID:
배포 시각 및 시간대:
```

## 15. YouTube — 사용자 작업 필요

- [ ] `docs/DEMO_SCRIPT.md`의 90초 흐름 촬영
- [ ] 실제 production URL로 시연
- [ ] 공식 사실·자체 분석·결과 전용 사실 구분
- [ ] 전술 선택 적합도가 승률이 아님을 설명
- [ ] BASE·Form·TLSI·condition 한계를 정확히 설명
- [ ] 국가별 경기 동일 비중 리포트 시연
- [ ] 공개 또는 미등록 업로드
- [ ] 로그아웃 상태에서 재생
- [ ] 설명란에 실제 production·GitHub URL

```text
YouTube URL:
영상 길이:
업로드 시각 및 시간대:
```

## 16. DAKER 제출 — 사용자 작업 필요

DAKER 제출 필드는 아래 세 URL뿐입니다.

- [ ] 최신 제출 폼 필수 필드 재확인
- [ ] 실제 production URL 입력
- [ ] 실제 공개 GitHub URL 입력
- [ ] 실제 YouTube URL 입력
- [ ] URL 세 개를 제출 직전 다시 열어 확인
- [ ] 마감 전 제출
- [ ] 접수 완료 화면과 제출 시각·시간대 보관

```text
DAKER 제출 시각 및 시간대:
접수 확인 자료:
```

## 17. 최종 동결

- [ ] 세 공개 URL과 최종 SHA를 `SUBMISSION_RELEASE_CHECKLIST.md`에 기록
- [ ] 제출 완료 화면 보관
- [ ] 제출 뒤 commit·push·force push·배포 교체 금지
- [ ] 공개 저장소를 private으로 바꾸지 않음
- [ ] production과 영상의 접근 제한을 켜지 않음

## 제출 직전 실행 순서

1. 최종 소스에서 자동 검증과 production QA를 완료합니다.
2. Chromium 인앱 브라우저의 데스크톱·responsive 클릭 흐름은 통과했습니다.
   Chrome·Edge·Firefox·Safari/iOS Safari와 물리 mobile을 실제 확인합니다.
3. 공개 GitHub에 최종 commit을 push하고 SHA를 기록합니다.
4. 같은 SHA를 production에 배포하고 로그아웃·외부 네트워크에서 확인합니다.
5. 90초 영상을 production URL로 녹화해 YouTube 접근을 확인합니다.
6. 공식 페이지의 마감 표기와 시간대를 다시 확인합니다.
7. 세 URL을 DAKER에 제출하고 완료 화면을 보관합니다.
8. 제출 상태를 문서에 기록하고 소스와 배포를 동결합니다.
