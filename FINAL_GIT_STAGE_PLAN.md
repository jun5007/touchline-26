# TOUCHLINE 26 최종 Git stage 계획

기준일: 2026-07-28 (Asia/Seoul)

이 계획은 기능·디자인·데이터 범위를 동결한 Release Candidate를 공개 `main` tip으로 만들기 위한 명시적 allowlist입니다. `git add .` 또는 저장소 전체를 대상으로 하는 포괄 stage 명령은 사용하지 않습니다.

## 공개 tip 포함 범위

- Next.js 제품 코드와 테스트: `src/**`
- 공개 문서와 제출 캡처: 아래 명시 목록
- 재현·검증 스크립트: 아래 명시 목록
- 프로젝트 설정과 lockfile
- `SUBMISSION_*.md`, `RELEASE_CANDIDATE_*.md`
- `FINAL_RELEASE_FILE_LIST.md`, `FINAL_GIT_STAGE_PLAN.md`

## 공개 tip 제외 범위

- `python-fastapi/**`: 로컬 ignored 복사본과 이전 Git 이력에만 보존
- PDF, ZIP, 원문 다운로드, 중첩 번들
- `.env*`, 키·인증서·자격 증명
- `.next`, `node_modules`, `tmp`, cache, 로그
- 과거 `BASE_PROFILE_*`, `FINAL_AUDIT_*`, `FINAL_REVIEW_*`, `REVIEW_*` 감사 산출물
- `FINAL_RELEASE_HANDOFF.md`, `FINAL_DAKER_SUBMISSION_VALUES.md`: 최종 SHA 확정 뒤 만드는 ignored 로컬 인계 메타데이터

DAKER 최종 제출물은 파일 업로드가 아니라 배포 URL, GitHub URL, YouTube URL 3개입니다. 따라서 새 audit ZIP은 생성하지 않습니다.

## 명시적 stage 명령

```powershell
git add -- .gitignore .npmrc AGENTS.md README.md THIRD_PARTY_NOTICES.md eslint.config.mjs next-env.d.ts next.config.ts package.json package-lock.json postcss.config.mjs tsconfig.json vercel.json vitest.config.ts
git add -- src
git add -- docs/ATTRIBUTE_PIPELINE.md docs/COMPETITION_REQUIREMENTS.md docs/DATA_RESEARCH.md docs/DEMO_SCRIPT.md docs/FINAL_SUBMISSION_CHECKLIST.md docs/IMPLEMENTATION_PLAN.md docs/STATUS.md
git add -- docs/ASSET_MANIFEST.md docs/ATTRIBUTE_SOURCE_MAP.md docs/BASE_PROFILE_PROGRESS.md docs/FUTURE_LEAKAGE_AUDIT.md docs/GITHUB_RELEASE_CHECKLIST.md docs/GROUP_A_DATA_COVERAGE.md docs/P0_PLAYER_SCOPE.md docs/REVIEW_COMPETITION_CHECKLIST.md docs/VERCEL_DEPLOYMENT_GUIDE.md
git add -- docs/submission-screenshots
git add -- scripts/attributes.ts scripts/register-typescript.cjs scripts/base-profile-common.mjs scripts/check-licenses.mjs scripts/create-submission-bundle.mjs scripts/generate-base-profile-docs.mjs scripts/generate-base-profiles.cjs scripts/generate-coverage-report.mjs scripts/generate-group-a.mjs scripts/generate-p0-scope.mjs scripts/score-distributions.ts scripts/submission-bundle-common.mjs scripts/submission-bundle.node-test.mjs scripts/update-base-source-registry.mjs scripts/validate-data.mjs scripts/validate-future-leakage.mjs scripts/validate-sources.mjs scripts/verify-base-profile.mjs scripts/verify-submission-bundle.mjs
git add -- SUBMISSION_FINAL_SUMMARY.md SUBMISSION_TEST_RESULTS.md SUBMISSION_KNOWN_ISSUES.md SUBMISSION_RELEASE_CHECKLIST.md
git add -- RELEASE_CANDIDATE_SUMMARY.md RELEASE_CANDIDATE_TEST_RESULTS.md RELEASE_CANDIDATE_KNOWN_ISSUES.md RELEASE_CANDIDATE_CHANGED_FILES.md
git add -- FINAL_RELEASE_FILE_LIST.md FINAL_GIT_STAGE_PLAN.md
git add -u -- docs/images/touchline26-home.png public/og.png
git rm -r --cached -- python-fastapi
```

`git rm --cached`는 로컬 파일을 삭제하지 않고 최종 공개 tip의 추적 대상에서만 Python 참고판을 제거합니다. 과거 commit 이력은 rewrite하지 않습니다.

## commit 전 검증

```powershell
git diff --cached --name-status
git diff --cached --check
git diff --cached --stat

$staged = @(git diff --cached --name-only)
$forbiddenPaths = $staged | Where-Object {
  $_ -match '(^|/)(\.next|node_modules|tmp|docs/sources)(/|$)' -or
  $_ -match '\.(pdf|zip)$' -or
  $_ -match '(^|/)\.env' -or
  $_ -match '(credentials|service-account)' -or
  $_ -match '\.(pem|key|p12|pfx|crt|der)$'
}
if ($forbiddenPaths) {
  $forbiddenPaths
  throw '금지 파일이 stage되었습니다.'
}

$pythonChanges = @(git diff --cached --name-status -- python-fastapi)
if ($pythonChanges.Count -ne 37 -or
    ($pythonChanges | Where-Object { $_ -notmatch "^D`t" })) {
  $pythonChanges
  throw 'python-fastapi 제거 범위가 예상과 다릅니다.'
}

git grep --cached -n -I -E '[A-Za-z]:[\\/]+Us[e]rs[\\/]+|\.co[d]ex|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{16,}'
```

민감정보 검색은 출력이 없어야 합니다. Python 변경은 삭제 37개만 있어야 하며 물리 파일은 그대로 남아야 합니다.

## commit과 사후 확인

```powershell
git commit -m "feat: finalize touchline 26 hackathon release"
git ls-files -- python-fastapi
Test-Path -LiteralPath 'python-fastapi/app/main.py'
git check-ignore -v --no-index -- python-fastapi/app/main.py
git status --short
git log -1 --format=fuller
```

`git ls-files`는 출력 없음, `Test-Path`는 `True`, `git status --short`는 출력 없음이 기대값입니다. remote가 없으므로 공개 GitHub URL이 확정되기 전에는 push하지 않습니다.
