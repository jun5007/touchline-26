# TOUCHLINE 26 최종 릴리스 파일 목록

기준일: 2026-07-28 (Asia/Seoul)

현재 작업 트리에는 여러 차례의 개발·감사 변경이 함께 존재합니다. 이 문서는 기능 범위를 동결한 Release Candidate에서 공개할 파일과 로컬에만 보존할 파일을 구분합니다. 포괄적인 `git add .`은 사용하지 않습니다.

## 릴리스 정본

- 제품: Next.js 단일 공개판
- 지원 범위: 2026 월드컵 A조 4개국, 6경기, 12개 팀 관점, 13미션, 104명
- P0 선수: 81명
- BASE PROFILE: 완료 0/104명
- 1–20 속성: 활성 0/832
- 최근 365일 성과 레코드: 0건
- Tournament Form/TLSI: 현재 점수에 미적용
- Python판: 최종 공개 `main` tip에서 제외

## 최종 commit 포함

### 제품 코드와 테스트

- `src/app/**`
- `src/components/**`
- `src/data/**`
- `src/lib/**`
- `src/test/**`
- 과거 18명 속성 표본과 프로토타입 JSON은 `src/test/fixtures/legacy/**`에만 두며 현재 제품 데이터가 아님을 README에 명시

### 설정과 의존성

- `.gitignore`, `.npmrc`
- `package.json`, `package-lock.json`
- `eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs`
- `tsconfig.json`, `vercel.json`, `vitest.config.ts`
- 기존에 추적 중인 `next-env.d.ts`

### 검증 스크립트

- `scripts/attributes.ts`
- `scripts/register-typescript.cjs`
- `scripts/base-profile-common.mjs`
- `scripts/check-licenses.mjs`
- `scripts/create-submission-bundle.mjs`
- `scripts/generate-base-profile-docs.mjs`
- `scripts/generate-base-profiles.cjs`
- `scripts/generate-coverage-report.mjs`
- `scripts/generate-group-a.mjs`
- `scripts/generate-p0-scope.mjs`
- `scripts/score-distributions.ts`
- `scripts/submission-bundle-common.mjs`
- `scripts/submission-bundle.node-test.mjs`
- `scripts/update-base-source-registry.mjs`
- `scripts/validate-data.mjs`
- `scripts/validate-future-leakage.mjs`
- `scripts/validate-sources.mjs`
- `scripts/verify-base-profile.mjs`
- `scripts/verify-submission-bundle.mjs`

번들 관련 스크립트는 기존 로컬 감사 산출물의 재현 규칙을 보존하기 위한 코드입니다. 이번 최종 작업에서는 새 audit ZIP을 만들지 않습니다.

### 공개 문서와 자산

- `README.md`, `AGENTS.md`, `THIRD_PARTY_NOTICES.md`
- 현재 범위와 일치하는 공개 문서 16개와 `docs/submission-screenshots/**`
- `SUBMISSION_FINAL_SUMMARY.md`
- `SUBMISSION_TEST_RESULTS.md`
- `SUBMISSION_KNOWN_ISSUES.md`
- `SUBMISSION_RELEASE_CHECKLIST.md`
- `RELEASE_CANDIDATE_SUMMARY.md`
- `RELEASE_CANDIDATE_TEST_RESULTS.md`
- `RELEASE_CANDIDATE_KNOWN_ISSUES.md`
- `RELEASE_CANDIDATE_CHANGED_FILES.md`
- `FINAL_RELEASE_FILE_LIST.md`
- `FINAL_GIT_STAGE_PLAN.md`

제출 캡처 정본은 `docs/submission-screenshots/01-home.png`부터 `15-mobile-report.png`까지 15개입니다.

### 추적 삭제

- `public/og.png`: 출처·제작 이력이 불명확한 정적 파일을 코드 생성 OG 이미지로 대체
- `docs/images/touchline26-home.png`: 과거 단일 경기판 캡처를 최종 15개 제출 캡처로 대체
- `src/app/favicon.ico`: 출처·제작 이력이 불명확한 파일을 `src/app/icon.svg`로 대체
- `src/data/players/players.json`, `src/data/matches/matches.json`, `src/data/scenarios/scenarios.json`: 현재 런타임 데이터처럼 보이지 않도록 `src/test/fixtures/legacy/**`로 이동
- `python-fastapi/**`: 물리 파일은 보존하고 Git index에서만 제거

## 최종 commit 제외

- `python-fastapi/**`: 로컬 ignored 복사본과 이전 commit 이력에만 보존
- `docs/sources/**` 및 다운로드한 원문 PDF
- 모든 `*.zip`, `*.pdf`, 중첩 번들
- `.next/**`, `node_modules/**`, `coverage/**`, `tmp/**`, cache, 로그
- `.env*`, 키·인증서·자격 증명 파일
- `scripts/build-base-profile-review-bundle.ps1`
- `docs/FINAL_COMPETITION_REVIEW.md`: 이전 중간 감사 수치가 남은 로컬 기록
- `FINAL_PROJECT_TREE.txt`, `PROJECT_TREE.txt`
- 루트 `BASE_PROFILE_*`, `FINAL_AUDIT_*`, `FINAL_DATA_*`, `FINAL_REVIEW_*`, `FINAL_SCORING_*`, `FINAL_TEST_*`, `REVIEW_*`
- `FINAL_RELEASE_HANDOFF.md`, `FINAL_DAKER_SUBMISSION_VALUES.md`: 최종 commit SHA 확정 후 로컬에만 생성

`python-fastapi/**`의 과거 이력까지 지우는 history rewrite는 수행하지 않습니다.

## DAKER 제출 형태

DAKER 최종 제출물은 파일 업로드가 아니라 배포 URL, GitHub URL, YouTube URL 3개입니다.

- ZIP, PDF, README, 테스트 보고서는 DAKER 입력 필드에 업로드하지 않음
- GitHub 공개 저장소에는 위 allowlist의 소스와 문서만 포함
- 배포 URL은 최종 commit과 동일한 소스여야 함
- YouTube URL은 공개 또는 링크 공개 상태여야 함

## stage 및 검증

정확한 명령과 금지 파일 검사는 `FINAL_GIT_STAGE_PLAN.md`를 정본으로 사용합니다. 핵심 원칙은 다음과 같습니다.

1. 명시된 경로만 stage합니다.
2. `git add .`을 사용하지 않습니다.
3. `git diff --cached --check`를 통과시킵니다.
4. stage 목록에 PDF, ZIP, 비밀정보, 로컬 절대경로, cache가 없는지 검사합니다.
5. `python-fastapi/**`는 삭제 37개만 stage되고 물리 파일은 남는지 확인합니다.
6. 외부 GitHub remote와 공개 URL이 없으면 push·배포 완료를 주장하지 않습니다.
