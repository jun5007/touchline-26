# TOUCHLINE 26 Release Candidate 알려진 문제

기준일: 2026-07-28 (Asia/Seoul)

## Critical

최종 로컬 자동검증, 개발·production 서버와 in-app browser production
클릭 흐름에서 확인된 Critical 결함은 없습니다. 외부 제출 게이트는 별도로
남아 있습니다.

## High

### RC-H1. 공개 제출 URL과 최종 commit이 없습니다

- Public GitHub, production, YouTube URL과 DAKER 접수 증빙이 없습니다.
- 최종 release SHA와 commit 시각도 아직 확정되지 않았습니다.
- 세 URL의 로그아웃 접근과 최종 SHA 없이는 전체 제출을 완료로 표시할 수
  없습니다.
- DAKER에는 배포 URL, GitHub URL, YouTube URL 3개만 입력합니다.

### RC-H2. 최근 365일 BASE PROFILE은 0/104입니다

- P0 81명은 incomplete이고 활성 능력치는 0/832, 실제 성과 레코드는
  0건입니다.
- Form/TLSI도 점수에 적용되지 않았습니다.
- 임의 값, 시장가치, 이름 기반 추정, FM 데이터로 채우지 않습니다.

### RC-H3. Python 참고판은 공개 release에서 제외해야 합니다

- `python-fastapi/**`는 최종 공개 `main` tip에 포함하지 않습니다.
- ignored 로컬 복사본과 이전 Git 이력에는 남을 수 있습니다.
- 명시적 stage 후 tracked tree에서 Python 경로가 없는지 확인합니다.

## Medium

### RC-M1. 실제 주요 브라우저와 물리 모바일은 미검증입니다

- production in-app browser에서 4개국 대표 흐름과 KOR 모바일 추가
  흐름은 통과했습니다.
- Chrome plugin은 unavailable이었고 Computer Use는 현재 URL을 안전하게
  판별할 수 없어 중단했습니다.
- 실제 Chrome, Edge, Firefox, Safari/iOS Safari, 물리 모바일은
  미검증입니다.

### RC-M2. 실제 키보드-only와 유효 drag/drop은 미검증입니다

- 자동화된 접근성 테스트는 통과했지만 실제 브라우저 키보드 이벤트는
  확인하지 못했습니다.
- 클릭 기본 교체는 PASS입니다.
- 유효 pointer drop과 터치 drag는 통과로 기록하지 않고 실험적 보조로
  유지합니다.

### RC-M3. GitHub clean clone은 아직 검증할 수 없습니다

- 공개 remote와 최종 release SHA가 없습니다.
- 로컬 복사나 ZIP 해제는 Git 이력·tracked tree 검증을 대신하지 않습니다.

### RC-M4. 프로젝트 자체 공개 라이선스는 선택되지 않았습니다

- 의존성 561 packages와 SPDX 표현 15종 검사는 PASS입니다.
- 프로젝트 코드의 공개 재사용 범위는 별도이며 미선택 상태를 공개합니다.

## Low

### RC-L1. 마감 시간대가 공식 페이지 표기에 보이지 않습니다

- 공식 페이지 표시 마감은 `2026-08-03 10:00`입니다.
- KST라고 추정하지 않고 최신 공지와 제출 화면에서 확인합니다.

### RC-L2. 과거 RC/audit ZIP은 제출물이 아닙니다

- 과거 로컬 ZIP의 엔트리 수, 크기, 해시는 final release 증거가 아닙니다.
- GitHub 또는 DAKER에 제출하지 않고 새 ZIP도 만들지 않습니다.
- 최종 명시적 stage에서 모든 ZIP을 제외합니다.

## 확인된 로컬 PASS

- npm ci 465 packages, lint 0/0, Vitest 22 files / 137 tests
- 데이터 4/6/13/104, P0 81 incomplete, BASE 0/104, 능력치 0/832
- score 13/440,208, bundle:test 8/8, build 9/9
- 개발·production smoke 각각 valid 11/11, invalid 4/4
- 모든 미션 briefing/tactics/result 39/39
- production in-app browser 4개국 대표 + KOR 모바일 추가 흐름
- console error/warning/hydration 0

## 제출 영향

로컬 RC는 PASS입니다. 대회 제출 완료는 최종 tracked tree 감사, release
commit, 세 공개 URL의 로그아웃 접근, clean clone, DAKER 접수 증빙이
모두 확인된 뒤에만 선언합니다.
