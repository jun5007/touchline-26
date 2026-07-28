# TOUCHLINE 26 GitHub 공개 체크리스트

> 상태: **사용자 작업 필요**
> 공개 저장소 생성, push, URL 확인과 최종 commit 동결은 사용자가 직접 수행합니다.

공개 심사 정본은 저장소 루트의 Next.js 애플리케이션입니다.
`python-fastapi/`는 최종 공개 main tip에서 제외합니다. 초기 단일 경기
참고판은 Git이 무시하는 로컬 복사본과 이전 Git 이력에만 남으며
최종 공개·심사·배포 대상이 아닙니다.

DAKER 최종 제출물은 파일 업로드가 아니라 배포 URL, GitHub URL, YouTube URL
3개입니다. 공개 GitHub 저장소는 이 중 GitHub URL을 제공하기 위한 정본이며,
ZIP·PDF·README·테스트 결과를 DAKER에 별도로 업로드하지 않습니다.

## 안전 원칙

- 현재 작업 트리의 변경은 모두 보존 대상입니다.
- `git reset --hard`, `git clean -fdx`, 강제 checkout처럼 변경을 지우는 명령을 사용하지 않습니다.
- 공개 이력을 `rebase`, `filter-branch`, `filter-repo`, `push --force`로 재작성하지 않습니다.
- 제출 commit을 만든 뒤에는 `commit --amend`하지 않습니다.
- 변경 파일을 확인하기 전 `git add -A`로 한꺼번에 올리지 않습니다.
- 실수로 포함된 비밀이나 권리 불명 자료를 발견하면 무작정 이력을 재작성하지 말고 먼저 별도 백업 후 공개를 중단합니다.

## 1. 작업 트리 감사

```bash
git status --short
git diff --check
git diff --stat
git diff
```

다음을 확인합니다.

- [ ] 의도한 소스·테스트·문서 변경만 있음
- [ ] `.env*`, API 키, 토큰, 쿠키, 계정 정보, 개인 정보 없음
- [ ] 로컬 사용자 절대경로 없음
- [ ] `.next`, `node_modules`, 캐시, 임시 파일 없음
- [ ] 기획서·원본 조사 PDF, PDF 렌더, 방송·선수 사진, 공식 로고 없음
- [ ] 다른 ZIP과 오래된 검토 번들이 공개 제출물에 섞이지 않음
- [ ] 공개용 화면 캡처에 개인 정보나 브라우저 계정 정보 없음

프로젝트 수준의 오픈소스 라이선스는 현재 선택되지 않았습니다. 공개 저장소라는
이유만으로 코드·디자인 재사용 권한이 자동 부여되지 않습니다. 별도 서면 허락
없이 프로젝트 코드·디자인·자체 그래픽을 복제, 수정, 배포하거나 다른 제품에
재사용하는 것을 허용하지 않습니다. `THIRD_PARTY_NOTICES.md`와
`docs/ASSET_MANIFEST.md`의 비제휴·서드파티·자산 고지를 유지합니다.

## 2. 최종 검증

```bash
npm ci
npm run data:validate
npm run data:coverage
npm run data:future-leakage
npm run lint
npm run test
npm run attributes:verify
npm run base-profile:verify
npm run license:check
npm run build
npm run bundle:test
```

- [ ] 각 명령의 실제 종료 코드와 결과를 `SUBMISSION_TEST_RESULTS.md`에 기록
- [ ] BASE 0/104명·0/832 활성 속성, Form/TLSI 미적용을 실패처럼 숨기지 않음
- [ ] `base-profile:verify`의 구조 통과와 커버리지 `NOT_MET`을 구분
- [ ] 제출 묶음 생성기의 단위 테스트(`bundle:test`) 통과
- [ ] 기존 Release Candidate 검토 ZIP은 과거 로컬 기록으로만 보관하고 공개
      GitHub와 DAKER 제출에서 제외

## 3. 명시적으로 stage

아래는 예시입니다. 실제 `git status --short`를 보고 필요한 파일만 추가합니다.

```bash
git add README.md
git add package.json package-lock.json vercel.json
git add src
git add scripts
git add docs/*.md
git add docs/submission-screenshots
git add THIRD_PARTY_NOTICES.md
git add SUBMISSION_FINAL_SUMMARY.md
git add SUBMISSION_TEST_RESULTS.md
git add SUBMISSION_KNOWN_ISSUES.md
git add SUBMISSION_RELEASE_CHECKLIST.md
git status --short
git diff --cached --check
git diff --cached --stat
git diff --cached
```

과거 검토 캡처 디렉터리(`docs/base-profile-screenshots`,
`docs/final-review-screenshots`, `docs/screenshots`, `docs/images`)은 최종
제출 정본에 stage하지 않습니다. `python-fastapi/`도 최종 공개 main tip에서
제외하며, Git이 무시하는 로컬 복사본과 이전 Git 이력만 보존합니다.

`docs/ASSET_MANIFEST.md`가 stage 대상에 들어갔는지 별도로 확인합니다. 과거
기획서 PDF와 원본 조사 PDF는 최종 DAKER 제출 대상이 아니며 공개 코드
저장소에도 포함하지 않습니다.

기존 검토 ZIP은 과거 로컬 기록이며 공개 GitHub나 DAKER 제출 대상이 아닙니다.
최종 출시 단계에서는 새 검토 ZIP을 생성·stage·업로드하지 않습니다.

## 4. 제출 commit 생성

```bash
git commit -m "Prepare TOUCHLINE 26 hackathon submission"
git status --short
git show --stat --oneline HEAD
git rev-parse HEAD
```

다음을 기록합니다.

```text
Final commit SHA:
Commit 시각 및 시간대:
작업 트리 상태:
```

의도한 변경이 누락됐다면 새 commit으로 보완합니다. 이미 공개한 commit을 amend하거나 강제 push하지 않습니다.

## 5. 공개 GitHub 저장소 연결

GitHub에서 빈 공개 저장소를 만든 뒤 현재 remote를 먼저 확인합니다.

```bash
git remote -v
```

`origin`이 없을 때만 사용자가 만든 실제 URL을 넣습니다.

```bash
git remote add origin <실제-GitHub-저장소-URL>
git push -u origin HEAD
```

이미 `origin`이 있으면 새로 추가하지 말고 대상 저장소가 맞는지 확인한 뒤 push합니다.

```bash
git push origin HEAD
```

다음 명령은 사용하지 않습니다.

```text
git push --force
git push --force-with-lease
git reset --hard
git clean -fdx
git rebase
git commit --amend
```

## 6. 로그아웃 공개 검증

- [ ] 저장소 URL이 로그아웃 시크릿 창에서 열림
- [ ] 기본 브랜치가 최종 commit을 가리킴
- [ ] README 첫 화면에서 제품 범위와 실행법을 이해할 수 있음
- [ ] 4개국·6경기·13미션, 국가별 3경기와 양 팀 관점이 정확함
- [ ] 회고형 시뮬레이션이며 미래 정보 차단 구조가 설명됨
- [ ] 전술 선택 적합도가 승률·절대 능력치가 아님을 명시
- [ ] BASE 0/104·0/832, Form/TLSI 미적용, condition 추정 한계를 명시
- [ ] 공식 사실·자체 분석·결과 전용 사실 구분
- [ ] 최소 선택만 localStorage에 저장하고 현재 코드로 재계산한다고 명시
- [ ] 국가별 리포트의 경기 동일 비중 계산을 설명
- [ ] 저작권·비제휴 고지 노출
- [ ] 설치 후 `npm run build`가 재현됨

## 7. 릴리스 기록

사용자가 실제 값을 채웁니다.

```text
Public GitHub URL:
Default branch:
Final commit SHA:
GitHub push 시각 및 시간대:
로그아웃 확인 시각 및 시간대:
Vercel deployment와 동일 SHA:
```

URL과 SHA를 추측해서 쓰지 않습니다.

## 마감 이후

대회 공식 페이지 표기는 **2026-08-03 10:00**입니다. 시간대가 명확하지 않다면 최신 공식 공지와 제출 화면에서 재확인합니다.

제출 후에는 다음을 하지 않습니다.

- commit 또는 push 추가
- 브랜치·tag 삭제
- 이력 재작성
- 저장소 private 전환
- 심사 중 URL 변경 또는 접근 제한

필요하면 제출 완료 화면과 최종 commit 페이지를 별도 캡처로 보관합니다.
