# TOUCHLINE 26 최종 릴리스 체크리스트

> 공식 페이지 표시 마감: **2026-08-03 10:00**
>
> 시간대 약어가 보이지 않으므로 최신 공지와 제출 화면에서 재확인합니다.
>
> 공식 안내: <https://daker.ai/public/hackathons/world-cup-manager-tactics-web-challenge>

## 0. 제출 증빙 값

확인되지 않은 URL이나 시각은 추정해서 채우지 않습니다.

```text
Production URL:
Public GitHub URL:
YouTube URL:
Final commit SHA:
Commit 시각 및 시간대:
DAKER 제출 시각 및 시간대:
DAKER 제출 완료 캡처 경로:
```

DAKER 최종 제출 필드는 다음 URL 3개뿐입니다.

- [ ] 배포 URL
- [ ] GitHub URL
- [ ] YouTube URL

ZIP, PDF, README, 테스트 결과, 감사 문서는 DAKER 제출 필드에 넣지 않습니다.

## 1. 범위와 데이터 정본

- [x] 4개국·6경기·13미션·104선수·국가별 26명
- [x] P0 미션 직접 범위 81명
- [x] BASE complete 0/104
- [x] 활성 능력치 0/832
- [x] 최근 365일 실제 성과 레코드 0건
- [x] Form/TLSI 점수 반영 미적용
- [x] FM 데이터, 시장가치, 이름 기반 추정, 임의 10/11 미사용
- [x] 기능·국가·경기·미션·선수 범위 동결

## 2. 최종 자동 검증

- [x] `npm ci` — 465 packages
- [x] Node v24.14.0 / npm 11.18.0
- [x] `npm run lint` — 오류 0 / 경고 0
- [x] `npm run test` — 22 files / 137 tests
- [x] `npm run attributes:verify` — 레거시 fixture 18명 × 8속성
- [x] `npm run base-profile:verify` — P0 incomplete 81 / 0/104 / records 0 / 0/832
- [x] `npm run data:validate` — 4 / 6 / 13 / 104 / 국가별 26
- [x] 출처 검사 — registry 51 / referenced unique 34 / unresolved 0
- [x] `npm run data:coverage` — 무결성 PASS / 0/104 / 0/832
- [x] `npm run data:future-leakage` — 10 / 55 / 0 / 4 / 13
- [x] `npm run license:check` — 561 packages / SPDX 15종 / 프로젝트 라이선스 미선택 공개
- [x] `npm run score-distribution:verify` — 13 / 440,208
- [x] `npm run bundle:test` — 8/8
- [x] `npm run build` — Next.js 16.2.12 / 9/9
- [x] build 후 미래 정보 차단 재검사

새 RC/audit ZIP은 만들지 않습니다. 과거 ZIP은 로컬 기록이며 stage와
제출에서 제외합니다.

## 3. 개발·production 서버

- [x] 개발 서버 실제 실행
- [x] 개발 서버 valid 11/11 HTTP 200
- [x] 개발 서버 invalid 4/4 HTTP 404
- [x] production 서버 실제 실행
- [x] production 서버 valid 11/11 HTTP 200
- [x] production 서버 invalid 4/4 HTTP 404
- [x] 13미션 briefing/tactics/result 직접 경로 39/39
- [ ] 서버 종료 후 포트와 임시 launcher 정리

## 4. 브라우저와 상호작용

- [x] production in-app browser KOR·CZE·MEX·RSA 대표 클릭 흐름
- [x] production in-app browser KOR 모바일 두 번째 미션
- [x] 클릭 기본 교체 흐름
- [x] production console 오류 0 / 경고 0
- [x] hydration 오류 0
- [x] 390×844 result/report overflow 0
- [x] 주요 모바일 버튼 높이 48~50px
- [x] 자동화된 접근성 테스트
- [ ] 실제 키보드-only 브라우저 이벤트
- [ ] 데스크톱 유효 pointer drop
- [ ] 실제 Google Chrome plugin 상호작용 — 도구 unavailable
- [ ] Computer Use 브라우저 상호작용 — 현재 URL 안전 판별 실패로 중단
- [ ] Microsoft Edge 실제 상호작용
- [ ] Firefox 핵심 흐름
- [ ] 물리 Android·터치 Chrome
- [ ] Safari 또는 iOS Safari
- [ ] 공개 배포 URL의 데스크톱·390px 모바일

in-app browser와 responsive viewport 결과를 실제 Chrome·다른 브라우저·
물리 모바일 PASS로 바꾸어 표현하지 않습니다. drag는 실험적 보조이며
클릭이 정본 경로입니다.

## 5. 공개 전 파일·권리 감사

- [ ] `git status --short`로 의도한 파일만 확인
- [ ] `git diff --check`
- [ ] `.env*`, API 키, 토큰, 쿠키, 계정·개인 정보 없음
- [ ] `.next`, `node_modules`, cache, logs, 임시 launcher 제외
- [ ] PDF, ZIP, 원본 조사 자료 제외
- [ ] `python-fastapi/**`가 최종 공개 `main` tip에서 제외됨
- [ ] Python 참고판은 ignored 로컬 복사본·이전 이력에만 남음
- [ ] `THIRD_PARTY_NOTICES.md`와 자산 권리 확인
- [x] 프로젝트 자체 라이선스 미선택 상태 공개
- [ ] 명시적 파일만 stage하고 `git add .` 사용하지 않음

## 6. GitHub 릴리스

- [ ] 최종 release commit 생성
- [ ] 최종 SHA와 commit 시각·시간대 기록
- [ ] 올바른 공개 GitHub remote에 push
- [ ] 기본 브랜치가 최종 SHA를 가리킴
- [ ] 로그아웃·시크릿 창에서 저장소 접근
- [ ] 새 디렉터리 clean clone
- [ ] clean clone에서 `npm ci`, lint, test, build
- [ ] 강제 push, rebase, amend, 이력 재작성 미사용

## 7. 배포

- [ ] 최종 GitHub SHA와 일치하는 production 배포
- [ ] 인증·보호·비밀번호 제한 해제
- [ ] 외부 API 키나 별도 유료 서비스 없이 build·실행
- [ ] 로그아웃 상태에서 시작 화면 접근
- [ ] 직접 URL, 새로고침, 404 확인
- [ ] 국가 → 미션 → 전술 → 결과 → 리포트 확인
- [ ] 데스크톱과 390px 모바일 확인
- [ ] Production URL 기록

## 8. YouTube 데모

- [ ] 최종 production UI로 영상 녹화
- [ ] 4개국·6경기·13미션 범위 설명
- [ ] 한 미션의 클릭 선택부터 결과까지 시연
- [ ] BASE 0/104·0/832와 데이터 없음 상태를 숨기지 않음
- [ ] 적합도가 승률이 아님을 설명
- [ ] 비밀·개인 정보·브라우저 계정 노출 없음
- [ ] 로그아웃 상태에서 영상 재생
- [ ] YouTube URL 기록

## 9. DAKER 제출과 동결

- [ ] 최신 공식 공지에서 마감 시간대 확인
- [ ] Production URL 로그아웃 접근
- [ ] Public GitHub URL 로그아웃 접근
- [ ] YouTube URL 로그아웃 재생
- [ ] 위 URL 3개만 제출 화면에 정확히 입력
- [ ] 충분한 여유를 두고 마감 전 제출
- [ ] 접수 완료 화면과 시각·시간대 캡처
- [ ] 제출한 세 URL과 최종 SHA를 별도 증빙에 보관
- [ ] 제출 이후 commit·push·URL 변경·접근 제한 중단

외부 서비스 작업은 사용자 권한이 필요합니다. 로컬 검증만으로 GitHub,
배포, YouTube 또는 DAKER 제출 완료를 선언하지 않습니다.
