# TOUCHLINE 26 Release Candidate 변경 파일

기준일: 2026-07-28 (Asia/Seoul)

이 문서는 기준 HEAD 이후 RC 후보에 포함할 변경을 기능 단위로 설명합니다.
작업 트리의 모든 변경을 자동으로 포함한다는 뜻이 아닙니다. 실제 stage는
`FINAL_RELEASE_FILE_LIST.md`와 `FINAL_GIT_STAGE_PLAN.md`의 명시적 목록을
검토해 수행하며 `git add .`을 사용하지 않습니다.

## 애플리케이션·UX

- `src/app/**`
  - 4개국·6경기·13미션의 국가, A조, 경기, 팀 여정, 결과, 리포트 route
  - 잘못된 팀·경기·미션 조합의 404 처리
- `src/components/tactics/**`
  - 클릭 우선 OUT/IN 선택, 취소·재선택, 역할·팀 지시
  - 데스크톱 drag를 실험적 보조로 안내
  - BASE 미산정과 데이터 경계 표시
- `src/components/result/**`, `src/components/report/**`
  - 현재 평가 함수로 결과 재계산
  - 장점·위험 병기와 실제 감독 결정을 유일한 정답으로 단정하지 않는 해석
  - 저장값 의미 검증과 경기 동일 비중 리포트
- `src/components/layout/**`, `src/components/common/**`
  - 반응형 navigation, skip link, focus-visible, ARIA live

## 데이터·평가·저장

- `src/data/**`
  - Group A 4팀, 6경기, 13미션, 국가별 26명 명단
  - 공식 사실, 결과 전용 사실, 자체 분석, 추정의 경계
  - 생성 점수 분포와 입력 해시
- `src/lib/decision/**`
  - 동일 규칙의 전술 적합도·위험·설명 계산
  - 정적 분포 검증과 fresh fallback
- `src/lib/decision/storage.ts`
  - 최소 선택 저장, 파생값 무시·재계산, route/team/roster/role 검증
- `src/lib/report/**`
  - 현재 데이터 기반 재계산과 경기 동일 비중 집계
- `src/lib/attributes/**`, `src/lib/scoring/**`
  - null 능력치 제외와 남은 가중치 재정규화

## 테스트·검증 스크립트

- `src/**/*.test.ts`, `src/**/*.test.tsx`
  - 최종 22 files / 137 tests PASS
  - localStorage 변조, 잘못된 route/team/선수/역할, 클릭 선택, BASE 누락,
    점수 분포와 리포트 집계
- `scripts/score-distributions.ts`
  - 13미션·440,208개 합법 선택 생성·검증 PASS
- `scripts/validate-data.mjs`, `scripts/validate-sources.mjs`
  - 4/6/13/104, 국가별 26명, registry 51 / referenced unique 34 /
    unresolved 0
- `scripts/validate-future-leakage.mjs`
  - roots 10 / modules 55 / forbidden 0 / chunks 4 / markers 13
- `scripts/generate-coverage-report.mjs`
  - P0 incomplete 81, BASE 0/104, active 0/832를 그대로 보고
- `scripts/check-licenses.mjs`
  - 561 packages / SPDX 표현 15종, 프로젝트 라이선스 미선택 공개
- 번들 관련 스크립트·테스트
  - 경로 순회, 절대경로, 비밀·원자료 포함 방어 테스트 8/8
  - 최종 제출에서 새 RC/audit ZIP을 생성하거나 전달하지 않음

## 최종 실행 검증

- `npm ci`: PASS, 465 packages
- lint: 오류 0 / 경고 0
- Vitest: 22 files / 137 tests
- build: Next.js 16.2.12, 9/9
- 개발·production smoke: 각각 valid 11/11 / invalid 4/4
- 13미션 briefing/tactics/result: 39/39
- production in-app browser: KOR·CZE·MEX·RSA 대표 흐름 PASS
- KOR 모바일 두 번째 미션 PASS
- console error/warning/hydration: 모두 0
- 390×844 result/report overflow 0, 버튼 48~50px

실제 Chrome·Edge·Firefox·Safari/iOS Safari, 물리 모바일, 실제 키보드-only,
유효 drag/drop은 검증하지 못했으며 PASS로 주장하지 않습니다.

## 문서·제출 자산

- `README.md`, `THIRD_PARTY_NOTICES.md`, `docs/**`
  - 범위, 실행, 데이터 한계, 권리, GitHub, 배포, 데모, 제출 절차
- `SUBMISSION_*.md`, `RELEASE_CANDIDATE_*.md`
  - 최종 실측, 잔여 제한, 외부 제출 상태
- `FINAL_RELEASE_FILE_LIST.md`, `FINAL_GIT_STAGE_PLAN.md`
  - 공개 release의 파일 경계와 명시적 stage 절차

## 최종 공개 tip에서 제외

- `python-fastapi/**`
  - 최종 공개 `main` tip에서는 제외
  - ignored 로컬 복사본과 이전 Git 이력에만 남을 수 있음
- PDF, 모든 기존 ZIP, 원본 조사 자료
- `.next`, `node_modules`, cache, logs, 임시 launcher
- 과거 생성 문서와 final release에 필요하지 않은 로컬 감사 산출물

과거 RC/audit ZIP은 로컬 작업 기록이며 GitHub 또는 DAKER 제출물이
아닙니다. 새 ZIP을 만들지 않습니다.

## Git·외부 상태

이 문서는 stage, commit, push, remote 생성, 배포, 영상 업로드, DAKER
접수를 수행했다는 증거가 아닙니다. 최종 SHA·시각과 외부 URL은 확인된
실제 값이 생긴 뒤에만 기록합니다.

DAKER 최종 제출물은 배포 URL, GitHub URL, YouTube URL 3개입니다.
