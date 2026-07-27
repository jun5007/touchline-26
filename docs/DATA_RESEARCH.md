# 실제 경기 데이터 조사

## 조사 정보

- 확인일: 2026-07-27
- 대상 경기: 2026 FIFA 월드컵 A조 대한민국 2–1 체코
- 경기일: 2026-06-11 20:00 현지
- 장소: Guadalajara Stadium, Guadalajara, Mexico
- 공식 경기 번호: Match 2
- 전반: 0–0
- 관중: 44,985명

## 선정 이유

- 실제 교체 결정이 1–1 동점과 2–1 리드 상황에서 각각 분명한 전술 질문을 만든다.
- FIFA의 Full-Time Match Report와 Tactical Line-up이 선발·벤치·득점·교체를 제공한다.
- FIFA Training Centre의 52쪽 Post-Match Summary Report가 선수별 패스, 라인브레이크, 볼 전진, 테이크온, 슈팅, 압박, 수비 행동을 제공한다.
- AP, DFB Data Center, KFA 보도로 핵심 이벤트를 독립 교차 확인할 수 있다.
- 대한민국 경기라 국내 사용자가 감독 경험에 빠르게 몰입할 수 있다.

## 사용 출처

### 1. FIFA Full-Time Match Report

- URL: https://fdp.fifa.org/assetspublic/ce281/r12450/pdf/FullTimeMatchReport-English.pdf
- 용도: 경기 메타데이터, 선발·벤치, 득점·도움·교체·주장 변경, 최종 팀 통계
- 로컬 연구 파일: `docs/sources/fifa/KOR-CZE-full-time-match-report.pdf`
- 라이선스/재사용 판단: FIFA 이용약관 적용. 사실 수치를 비상업적 편집 목적으로 출처와 함께 사용하고 원본 표·로고·PDF 캡처를 재사용하지 않는다.

### 2. FIFA Tactical Line-up

- URL: https://fdp.fifa.org/assetspublic/ce281/r12450/pdf/TacticalLineup-English.pdf
- 용도: 대한민국 3-4-3, 체코 5-2-3, 시작 위치
- 로컬 연구 파일: `docs/sources/fifa/KOR-CZE-tactical-lineup.pdf`
- 라이선스/재사용 판단: 원본 그래픽은 사용하지 않고 전술 사실만 자체 UI로 재구성한다.

### 3. FIFA Post-Match Summary Report

- URL: https://www.fifatrainingcentre.com/media/native/tournaments/fifa-world-cup/2026/PMSR-M02%20KOR%20V%20CZE%20.pdf
- 용도: 팀/선수별 인포제션·아웃오브포제션·피지컬 지표
- 로컬 연구 파일: `docs/sources/fifa/KOR-CZE-performance-report.pdf`
- 확인 페이지: 2–3, 15, 42–43, 47, 50
- 라이선스/재사용 판단: 수치만 자체 데이터 구조로 옮기고 표·국기·그래픽을 사용하지 않는다.

### 4. AP Match Report

- URL: https://apnews.com/article/world-cup-south-korea-czech-republic-score-496e7772dde95ca0af90b5074fdb13d9
- 용도: 득점 흐름과 경기 맥락 독립 교차 검증
- 재사용 판단: 사실 확인과 링크만 사용하고 기사 문장·사진을 복제하지 않는다.

### 5. OpenFootball World Cup JSON

- URL: https://github.com/openfootball/worldcup.json
- 원자료: https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json
- 용도: 재사용 가능한 경기 메타데이터 교차 확인
- 라이선스: CC0 / Public Domain

### 보조 교차검증

- DFB Data Center: https://datencenter.dfb.de/en/data-center/fifa-world-cup/2026-in-usa%2Fmexico%2Fcanada/group-a/2413163
- KFA 경기 기사: https://www.kfa.or.kr/layer_popup/popup_live.php?act=news_tv_detail&div_code=news&idx=28065
- FIFA 한국어 경기 리포트: https://www.fifa.com/ko/tournaments/mens/worldcup/canadamexicousa2026/articles/korea-republic-come-from-behind-to-defeat-czechia-2-1-ko

## 확인한 실제 결과와 이벤트

- 59′ 체코 라디슬라프 크레이치 득점, 블라디미르 초우팔 도움
- 62′ 대한민국 황희찬 IN / 이재성 OUT
- 63′ 체코 공격진 3명 교체
- 67′ 대한민국 황인범 득점, 이강인 도움
- 69′ 대한민국 엄지성 IN / 이태석 OUT
- 69′ 대한민국 오현규 IN / 손흥민 OUT
- 70′ 주장 손흥민 → 김민재
- 80′ 대한민국 오현규 득점, 황인범 도움
- 84′ 대한민국 김진규 IN / 황인범 OUT
- 84′ 대한민국 박진섭 IN / 백승호 OUT
- 최종: 대한민국 2–1 체코

## 대한민국 선발 명단

| 번호 | 선수 | 공식 포지션 | 전술상 시작 위치 |
|---:|---|---|---|
| 1 | 김승규 | GK | GK |
| 2 | 이한범 | DF | RCB |
| 3 | 이기혁 | MF | LCB |
| 4 | 김민재 | DF | CB |
| 6 | 황인범 | MF | CM |
| 7 | 손흥민 (C) | FW | CF |
| 8 | 백승호 | MF | CM |
| 10 | 이재성 | MF | LW/AM |
| 13 | 이태석 | DF | LWB |
| 19 | 이강인 | MF | RW |
| 22 | 설영우 | DF | RWB |

이기혁처럼 공식 포지션과 해당 경기의 전술 위치가 다른 경우 두 값을 분리했다.

## 대한민국 벤치 명단

송범근, 조현우, 김태현, 조규성, 황희찬, 조위제, 김문환, 박진섭, 배준호, 오현규, 양현준, 옌스 카스트로프, 김진규, 엄지성, 이동경.

앱 전술 화면에는 미션과 포지션에 의미 있는 후보만 노출하지만 `matches.json`에 공식 전체 벤치 이름을 보존한다.

## 선수별 원자료 예시

FIFA PMSR 42쪽의 인포제션 분배와 47쪽 아웃오브포제션, Full-Time Report의 득점·도움을 사용했다.

| 선수 | 분 | 패스 | 라인브레이크 | 볼 전진 | 테이크온 | 슈팅(유효) | 골/도움 | 직접 압박 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 손흥민 | 71 | 20/22 | 3/5 | 3 | 2 | 6(1) | 0/0 | 16 |
| 황인범 | 86 | 70/79 | 11/15 | 1 | 1 | 3(2) | 1/1 | 15 |
| 이강인 | 99 | 38/38 | 11/11 | 8 | 8 | 1(1) | 0/1 | 25 |
| 이재성 | 64 | 25/32 | 2/4 | 0 | 0 | 2(1) | 0/0 | 14 |
| 황희찬 | 34 | 10/10 | 1/1 | 3 | 3 | 0(0) | 0/0 | 3 |
| 오현규 | 28 | 4/6 | 0/1 | 1 | 1 | 1(1) | 1/0 | 9 |
| 엄지성 | 30 | 3/3 | 2/2 | 1 | 1 | 0(0) | 0/0 | 2 |
| 김진규 | 13 | 3/4 | 1/1 | 0 | 0 | 1(0) | 0/0 | 4 |
| 박진섭 | 13 | 4/5 | 1/2 | 0 | 0 | 0(0) | 0/0 | 3 |

## 데이터 처리와 수동 보정

### 공식 사실

- 경기 정보, 스코어, 선발·벤치, 득점·도움, 교체 시점
- 공식 전술 라인업
- PMSR의 경기 종료 후 선수별 수치

### 파생 처리

- 위치형 지표를 포지션 그룹에 매핑
- 횟수형 지표의 per90 비교와 완료율 원 단위 유지
- `players.json`에서 동일 포지션 그룹 비교 표본을 매번 자동 구성
- 공개된 포지션별 지표 가중치로 백분위를 결합
- 1–20 변환과 `confidence × rawScore + (1-confidence) × 10.5` 수축
- 저장된 18명 × 8개 값과 재계산 결과의 자동 완전 일치 검증
- 상황 적합도와 네 개 영향 게이지

### 수동 보정/분류

- 이기혁의 공식 포지션 MF와 전술 위치 LCB를 분리
- 시작 전술 이후의 정확한 포메이션은 공식 이벤트에 없으므로 69분·84분 위치를 “분석적 재구성”으로 라벨
- `fitness`는 공식 생체 데이터가 아니라 미션 계산용 보수적 시뮬레이션 입력으로 라벨
- 출전하지 않은 조규성·배준호는 실제 경기 퍼포먼스가 없으므로 `rawMetrics: null`, 낮은 신뢰도, 중립값 사용
- 선수별 공중볼 지표가 공식 표에 없어 `aerial`은 추정하지 않고 중립값 사용

능력치의 전체 재현 절차, 포지션별 가중치와 실행 명령은 [`ATTRIBUTE_PIPELINE.md`](ATTRIBUTE_PIPELINE.md)에 기록했다.

## 누락·충돌 데이터

- 69분 당시의 실시간 선수별 전체 통계 타임슬라이스는 확보하지 못했다.
- 따라서 앱의 1–20 지표는 경기 종료 후 데이터를 사용한 “회고 플레이”로 표시한다.
- FIFA Full-Time Report의 점유율 62–38과 PMSR의 통제/경합/통제 55.8/10.1/34.2는 정의가 다르므로 하나의 필드로 섞지 않았다.
- FIFA 공식 리포트와 일부 외부 제공처의 체코 슈팅 수가 다르므로 앱의 기준은 FIFA 공식 원본으로 고정했다.
- 공식 인터뷰로 확인되지 않은 교체 목적은 `interpretationStatus: inferred`로 표시한다.

## 저작권과 재사용

- FIFA 로고, 월드컵 엠블럼, 대표팀 엠블럼, 선수 사진, PDF 캡처, 원본 표 디자인을 앱에 사용하지 않는다.
- 공식 PDF는 로컬 검증용이며 `.gitignore`로 공개 저장소에서 제외한다.
- 수치와 경기 사실은 출처·확인일·용도를 함께 기록한다.
- OpenFootball 경기 메타데이터는 CC0/Public Domain으로 기록한다.
- AP/KFA/FIFA 기사 문장을 복제하지 않고 사실 요약과 링크만 제공한다.

## 확인 결과

대표 경기와 두 미션은 `isSample: false`다. 확인되지 않은 실제 경기 정보는 만들지 않았고, 파생 지표·시뮬레이션 입력·전술적 추론은 화면과 문서에서 공식 사실과 구분했다.
