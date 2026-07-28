# TOUCHLINE 26 제출 시점 알려진 문제

> 기준일: 2026-07-28
>
> 최종 로컬 자동검증, 개발·production 서버, in-app browser 클릭 흐름은
> 통과했습니다. 아래는 자동 테스트로 숨길 수 없는 잔여 위험입니다.

## High

### K-H1. 실제 BASE PROFILE 데이터가 없습니다

- 상태: BASE complete 0/104명, P0 incomplete 81명, 활성 능력치 0/832개,
  최근 365일 실제 성과 레코드 0건, Form/TLSI 점수 반영 미적용입니다.
- 영향: 실제 선수 간 능력 차이를 전술 적합도에 반영하지 못합니다.
- 방어: 임의 값, 시장가치, 이름 기반 추정, FM 데이터를 쓰지 않고 누락으로
  표시합니다.

### K-H2. 외부 제출 URL과 접수 증빙이 없습니다

- 상태: 공개 GitHub URL, production URL, YouTube URL, 최종 release
  SHA·시각, DAKER 접수 증빙을 확인하지 못했습니다.
- 영향: 로컬 앱이 정상이어도 심사자가 접근할 수 없습니다.
- 해소 조건: 세 URL을 만들고 로그아웃·시크릿 창에서 확인한 뒤 DAKER
  제출 화면에 등록합니다.

DAKER 최종 제출물은 **배포 URL, GitHub URL, YouTube URL 3개뿐**입니다.
ZIP, PDF, README, 테스트 결과는 제출 필드가 아닙니다.

### K-H3. Python 참고판은 최종 공개 정본이 아닙니다

- `python-fastapi/**`는 최종 공개 `main` tip에서 제외해야 합니다.
- ignored 로컬 복사본과 이전 Git 이력에는 남을 수 있습니다.
- 명시적 stage 뒤 최종 tracked tree에서 Python 경로가 없는지 확인합니다.

## Medium

### K-M1. 실제 주요 브라우저와 물리 모바일은 미검증입니다

- in-app browser production에서 4개국 대표 흐름과 KOR 모바일 추가 흐름은
  통과했습니다.
- Chrome plugin은 사용할 수 없었고 Computer Use는 현재 URL을 안전하게
  판별할 수 없어 중단했습니다.
- 실제 Chrome, Edge, Firefox, Safari/iOS Safari, 물리 모바일은
  미검증입니다.
- 390×844 result/report overflow 0과 버튼 48~50px는 responsive
  viewport 결과이며 실제 터치 기기 시험이 아닙니다.

### K-M2. 실제 키보드-only와 유효 drag/drop은 미검증입니다

- 자동화된 접근성 테스트는 통과했지만 실제 브라우저 키보드 이벤트는
  확인하지 못했습니다.
- 클릭 OUT/IN 선택은 production in-app browser에서 PASS입니다.
- 유효 pointer drop과 터치 drag는 통과로 기록하지 않으며 실험적
  보조 기능으로 유지합니다.

### K-M3. GitHub clean clone은 공개 remote와 최종 commit이 필요합니다

- remote와 최종 release SHA가 없어 공개 GitHub clean clone을 검증할 수
  없습니다.
- 로컬 복사나 ZIP 해제는 clean clone의 대체 증거가 아닙니다.

### K-M4. 프로젝트 자체 공개 라이선스는 선택되지 않았습니다

- 의존성 561 packages와 SPDX 표현 15종 검사는 통과했습니다.
- 프로젝트 코드의 공개 재사용 허가는 별도이며 미선택 상태를 공개합니다.

## Low

### K-L1. 마감 시간대가 공식 페이지 표기에 보이지 않습니다

- 공식 페이지 표시 마감은 `2026-08-03 10:00`입니다.
- KST라고 추정하지 않고 최신 공지와 실제 제출 화면에서 확인합니다.

### K-L2. 과거 RC/audit ZIP은 로컬 기록입니다

- 과거 ZIP의 엔트리 수, 크기, 해시는 최종 제출 증거가 아닙니다.
- GitHub와 DAKER 제출 대상이 아니며 새 RC/audit ZIP을 만들지 않습니다.
- 파일이 로컬에 남아 있어도 명시적 stage에서 제외합니다.

## 확인된 로컬 결과

- 자동검증: lint 0/0, Vitest 22 files / 137 tests, score 13 /
  440,208, build 9/9
- 개발·production smoke: 각각 valid 11/11, invalid 4/4
- 전체 미션 직접 경로: 39/39
- production in-app browser: 4개국 대표 + KOR 모바일 추가 흐름 PASS
- console error/warning/hydration: 모두 0

## 릴리스 차단 기준

다음 중 하나라도 충족되지 않으면 “최종 제출 완료”로 표시하지 않습니다.

- 최종 tracked tree에서 Python, PDF, ZIP, 원자료, 비밀 제외
- 최종 release commit SHA와 시각 기록
- GitHub·배포·YouTube 세 URL의 로그아웃 공개 접근
- 공개 GitHub clean clone
- 공식 마감 시간대 재확인과 DAKER 접수 완료 증빙
