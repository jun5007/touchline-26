# Group A 데이터 커버리지

> 이 문서는 `npm run data:coverage`가 현재 저장소 JSON에서 직접 산출합니다. 출처 스냅샷 기준일: 2026-07-28.

## 범위 요약

| 항목 | 현재 값 | 목표 | 상태 |
|---|---:|---:|---|
| 지원 팀 | 4 | 정확히 4 | 충족 |
| 조별리그 경기 | 6 | 정확히 6 | 충족 |
| 팀-경기 관점 | 12 | 12 | 충족 |
| 의사결정 시나리오 | 13 | 최소 12 | 충족 |
| 최종 명단 선수 | 104 | 104 | 충족 |
| BASE PROFILE 완료 선수 | 0 | 104 | **미완료 — 0.0%** |
| 활성 속성 값 | 0 | 832 | **미완료 — 0.0%** |

## 공식 Group A 순위

| 순위 | 팀 | 경기 | 승-무-패 | 득-실 | 득실 | 승점 |
|---:|---|---:|---:|---:|---:|---:|
| 1 | MEX | 3 | 3-0-0 | 6-0 | +6 | 9 |
| 2 | RSA | 3 | 1-1-1 | 2-3 | -1 | 4 |
| 3 | KOR | 3 | 1-0-2 | 2-3 | -1 | 3 |
| 4 | CZE | 3 | 0-1-2 | 2-6 | -4 | 1 |

## 팀별 선수 데이터

| 팀 | 최종 명단 | 완료 BASE | 등급 | 본선 출전 | 본선 미출전 | TLSI | 출처 누락 | 경기 | 미션 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| KOR | 26 | 0/26 | D 26 | 20 | 6 | 미적용 26 | 0 | 3 | 4 |
| CZE | 26 | 0/26 | D 26 | 21 | 5 | 미적용 26 | 0 | 3 | 3 |
| MEX | 26 | 0/26 | D 26 | 25 | 1 | 미적용 26 | 0 | 3 | 3 |
| RSA | 26 | 0/26 | D 26 | 19 | 7 | 미적용 26 | 0 | 3 | 3 |

- BASE 기간: `2025-06-11..2026-06-10`
- 프로필 상태: complete 0 / partial 0 / incomplete 104
- 데이터 등급: A 0 / B 0 / C 0 / D 104
- 분석 분 값 보유: 0/104
- 포지션별 모델: 필드 92명 / GK 별도 모델 12명
- 클럽 경기 성과 레코드: 0개, 대표팀 경기 성과 레코드: 0개. 최종 명단의 신원·등번호·소속팀 검증은 성과 프로필 완료로 계산하지 않았습니다.

현재 활성 속성 0/832개만 수치가 있으며, 나머지는 `null`입니다. `null`은 중립 점수로 대체하지 않고 계산에서 제외한 뒤 남은 가중치를 재정규화해야 합니다. 전 속성이 없는 선수는 D/`incomplete`입니다.

## 선수별 커버리지

| 팀 | # | 선수 | 대회 직전 소속팀 | 리그 | 최근 1년 분석 시간 | 월드컵 출전 시간 | 등급 | TLSI 상태 | 누락 속성 | 출처 상태 |
|---|---:|---|---|---|---:|---:|---:|---|---|---|
| KOR | 1 | 김승규 / KIM Seunggyu | FC Tokyo | 미확인 (협회 JPN) | — | — (분 미집계) | D | 미적용 · incomplete | shotStopping, distribution, aerialCommand, sweeping, penaltySaving, stability, buildUp, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 2 | 이한범 / LEE Hanbeom | FC Midtjylland | 미확인 (협회 DEN) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 3 | 이기혁 / LEE Gihyuk | Gangwon FC | 미확인 (협회 KOR) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 4 | 김민재 / KIM Minjae | FC Bayern München | 미확인 (협회 GER) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 5 | 김태현 / KIM Taehyeon | Kashima Antlers | 미확인 (협회 JPN) | — | 0 (출전 없음) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 6 | 황인범 / HWANG Inbeom | Feyenoord Rotterdam | 미확인 (협회 NED) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 7 | 손흥민 / SON Heungmin | LAFC | 미확인 (협회 USA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 8 | 백승호 / PAIK Seungho | Birmingham City FC | 미확인 (협회 ENG) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 9 | 조규성 / CHO Guesung | FC Midtjylland | 미확인 (협회 DEN) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 10 | 이재성 / LEE Jaesung | 1. FSV Mainz 05 | 미확인 (협회 GER) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 11 | 황희찬 / HWANG Heechan | Wolverhampton Wanderers FC | 미확인 (협회 ENG) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 12 | 송범근 / SONG Bumkeun | Jeonbuk Hyundai Motors FC | 미확인 (협회 KOR) | — | 0 (출전 없음) | D | 미적용 · incomplete | shotStopping, distribution, aerialCommand, sweeping, penaltySaving, stability, buildUp, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 13 | 이태석 / LEE Taeseok | FK Austria Wien | 미확인 (협회 AUT) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 14 | 조위제 / CHO Wije | Jeonbuk Hyundai Motors FC | 미확인 (협회 KOR) | — | 0 (출전 없음) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 15 | 김문환 / KIM Moonhwan | Daejeon Hana Citizen FC | 미확인 (협회 KOR) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 16 | 박진섭 / PARK Jinseob | Zhejiang FC | 미확인 (협회 CHN) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 17 | 배준호 / BAE Junho | Stoke City FC | 미확인 (협회 ENG) | — | 0 (출전 없음) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 18 | 오현규 / OH Hyeongyu | Beşiktaş JK | 미확인 (협회 TUR) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 19 | 이강인 / LEE Kangin | Paris Saint-Germain | 미확인 (협회 FRA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 20 | 양현준 / YANG Hyunjun | Celtic FC | 미확인 (협회 SCO) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 21 | 조현우 / JO Hyeonwoo | Ulsan HD | 미확인 (협회 KOR) | — | 0 (출전 없음) | D | 미적용 · incomplete | shotStopping, distribution, aerialCommand, sweeping, penaltySaving, stability, buildUp, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 22 | 설영우 / SEOL Youngwoo | FK Crvena Zvezda | 미확인 (협회 SRB) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 23 | 옌스 카스트로프 / CASTROP Jens | Borussia Mönchengladbach | 미확인 (협회 GER) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 24 | 김진규 / KIM Jingyu | Jeonbuk Hyundai Motors FC | 미확인 (협회 KOR) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 25 | 엄지성 / EOM Jisung | Swansea City AFC | 미확인 (협회 WAL) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| KOR | 26 | 이동경 / LEE Donggyeong | Ulsan HD | 미확인 (협회 KOR) | — | 0 (출전 없음) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 1 | 마테이 코바르 / Matěj Kovář | PSV Eindhoven | 미확인 (협회 NED) | — | — (분 미집계) | D | 미적용 · incomplete | shotStopping, distribution, aerialCommand, sweeping, penaltySaving, stability, buildUp, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 2 | 다비드 지마 / David Zima | SK Slavia Praha | 미확인 (협회 CZE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 3 | 토마시 홀레시 / Tomáš Holeš | SK Slavia Praha | 미확인 (협회 CZE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 4 | 로빈 흐라나치 / Robin Hranáč | TSG Hoffenheim | 미확인 (협회 GER) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 5 | 블라디미르 초우팔 / Vladimír Coufal | TSG Hoffenheim | 미확인 (협회 GER) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 6 | 슈테판 할루페크 / Štěpán Chaloupek | SK Slavia Praha | 미확인 (협회 CZE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 7 | 라디슬라프 크레이치 / Ladislav Krejčí | Wolverhampton Wanderers FC | 미확인 (협회 ENG) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 8 | 블라디미르 다리다 / Vladimír Darida | FC Hradec Králové | 미확인 (협회 CZE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 9 | 아담 흘로제크 / Adam Hložek | TSG Hoffenheim | 미확인 (협회 GER) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 10 | 파트리크 시크 / Patrik Schick | Bayer 04 Leverkusen | 미확인 (협회 GER) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 11 | 얀 쿠흐타 / Jan Kuchta | AC Sparta Praha | 미확인 (협회 CZE) | — | 0 (출전 없음) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 12 | 루카시 체르프 / Lukáš Červ | FC Viktoria Plzeň | 미확인 (협회 CZE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 13 | 모이미르 히틸 / Mojmír Chytil | SK Slavia Praha | 미확인 (협회 CZE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 14 | 다비드 유라세크 / David Jurásek | SK Slavia Praha | 미확인 (협회 CZE) | — | 0 (출전 없음) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 15 | 파벨 슐츠 / Pavel Šulc | Olympique Lyonnais | 미확인 (협회 FRA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 16 | 인드르지흐 스타네크 / Jindřich Staněk | SK Slavia Praha | 미확인 (협회 CZE) | — | 0 (출전 없음) | D | 미적용 · incomplete | shotStopping, distribution, aerialCommand, sweeping, penaltySaving, stability, buildUp, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 17 | 루카시 프로보드 / Lukáš Provod | SK Slavia Praha | 미확인 (협회 CZE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 18 | 미할 사딜레크 / Michal Sadílek | SK Slavia Praha | 미확인 (협회 CZE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 19 | 토마시 호리 / Tomáš Chorý | SK Slavia Praha | 미확인 (협회 CZE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 20 | 야로슬라프 젤레니 / Jaroslav Zelený | AC Sparta Praha | 미확인 (협회 CZE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 21 | 다비드 도우데라 / David Douděra | SK Slavia Praha | 미확인 (협회 CZE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 22 | 토마시 소우체크 / Tomáš Souček | West Ham United FC | 미확인 (협회 ENG) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 23 | 루카시 호르니체크 / Lukáš Horníček | SC Braga | 미확인 (협회 POR) | — | 0 (출전 없음) | D | 미적용 · incomplete | shotStopping, distribution, aerialCommand, sweeping, penaltySaving, stability, buildUp, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 24 | 알렉산드르 소이카 / Alexandr Sojka | FC Viktoria Plzeň | 미확인 (협회 CZE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 25 | 후고 소후레크 / Hugo Sochůrek | AC Sparta Praha | 미확인 (협회 CZE) | — | 0 (출전 없음) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| CZE | 26 | 데니스 비신스키 / Denis Višinský | FC Viktoria Plzeň | 미확인 (협회 CZE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 1 | 라울 랑헬 / Raúl Rangel | CD Guadalajara | 미확인 (협회 MEX) | — | — (분 미집계) | D | 미적용 · incomplete | shotStopping, distribution, aerialCommand, sweeping, penaltySaving, stability, buildUp, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 2 | 호르헤 산체스 / Jorge Sánchez | PAOK Saloniki | 미확인 (협회 GRE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 3 | 세사르 몬테스 / César Montes | FC Lokomotiv Moscow | 미확인 (협회 RUS) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 4 | 에드손 알바레스 / Edson Álvarez | Fenerbahçe SK | 미확인 (협회 TUR) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 5 | 요한 바스케스 / Johan Vásquez | Genoa CFC | 미확인 (협회 ITA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 6 | 에리크 리라 / Erik Lira | CF Cruz Azul | 미확인 (협회 MEX) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 7 | 루이스 로모 / Luis Romo | CD Guadalajara | 미확인 (협회 MEX) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 8 | 알바로 피달고 / Álvaro Fidalgo | Real Betis | 미확인 (협회 ESP) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 9 | 라울 히메네스 / Raúl Jiménez | Fulham FC | 미확인 (협회 ENG) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 10 | 알렉시스 베가 / Alexis Vega | Deportivo Toluca FC | 미확인 (협회 MEX) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 11 | 산티아고 히메네스 / Santiago Giménez | AC Milan | 미확인 (협회 ITA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 12 | 카를로스 아세베도 / Carlos Acevedo | Club Santos Laguna | 미확인 (협회 MEX) | — | 0 (출전 없음) | D | 미적용 · incomplete | shotStopping, distribution, aerialCommand, sweeping, penaltySaving, stability, buildUp, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 13 | 기예르모 오초아 / Guillermo Ochoa | AEL Limassol | 미확인 (협회 CYP) | — | — (분 미집계) | D | 미적용 · incomplete | shotStopping, distribution, aerialCommand, sweeping, penaltySaving, stability, buildUp, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 14 | 아르만도 곤살레스 / Armando González | CD Guadalajara | 미확인 (협회 MEX) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 15 | 이스라엘 레예스 / Israel Reyes | Club América | 미확인 (협회 MEX) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 16 | 훌리안 키뇨네스 / Julián Quiñones | Al Qadsiah FC | 미확인 (협회 KSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 17 | 오르벨린 피네다 / Orbelín Pineda | AEK Athens | 미확인 (협회 GRE) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 18 | 오베드 바르가스 / Obed Vargas | Atlético De Madrid | 미확인 (협회 ESP) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 19 | 힐베르토 모라 / Gilberto Mora | Club Tijuana | 미확인 (협회 MEX) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 20 | 마테오 차베스 / Mateo Chávez | AZ Alkmaar | 미확인 (협회 NED) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 21 | 세사르 우에르타 / César Huerta | RSC Anderlecht | 미확인 (협회 BEL) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 22 | 기예르모 마르티네스 / Guillermo Martínez | Pumas UNAM | 미확인 (협회 MEX) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 23 | 헤수스 가야르도 / Jesús Gallardo | Deportivo Toluca FC | 미확인 (협회 MEX) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 24 | 루이스 차베스 / Luis Chávez | FC Dynamo Moscow | 미확인 (협회 RUS) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 25 | 로베르토 알바라도 / Roberto Alvarado | CD Guadalajara | 미확인 (협회 MEX) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| MEX | 26 | 브라이언 구티에레스 / Brian Gutiérrez | CD Guadalajara | 미확인 (협회 MEX) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 1 | 론웬 윌리엄스 / Ronwen Williams | Mamelodi Sundowns FC | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | shotStopping, distribution, aerialCommand, sweeping, penaltySaving, stability, buildUp, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 2 | 타방 마툴루디 / Thabang Matuludi | Polokwane City FC | 미확인 (협회 RSA) | — | 0 (출전 없음) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 3 | 쿨루마니 은다마네 / Khulumani Ndamane | Mamelodi Sundowns FC | 미확인 (협회 RSA) | — | 0 (출전 없음) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 4 | 테보호 모코에나 / Teboho Mokoena | Mamelodi Sundowns FC | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 5 | 탈렌테 음바타 / Thalente Mbatha | Orlando Pirates FC | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 6 | 오브리 모디바 / Aubrey Modiba | Mamelodi Sundowns FC | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 7 | 오스윈 아폴리스 / Oswin Appollis | Orlando Pirates FC | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 8 | 체팡 모레미 / Tshepang Moremi | Orlando Pirates FC | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 9 | 라일 포스터 / Lyle Foster | Burnley FC | 미확인 (협회 ENG) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 10 | 레보힐레 모포켕 / Relebohile Mofokeng | Orlando Pirates FC | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 11 | 템바 즈와네 / Themba Zwane | Mamelodi Sundowns FC | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 12 | 타펠로 마세코 / Thapelo Maseko | AEL Limassol | 미확인 (협회 CYP) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 13 | 스페펠렐로 시톨레 / Sphephelo Sithole | CD Tondela | 미확인 (협회 POR) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 14 | 음베케젤리 음보카지 / Mbekezeli Mbokazi | Chicago Fire FC | 미확인 (협회 USA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 15 | 이크람 레이너스 / Iqraam Rayners | Mamelodi Sundowns FC | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 16 | 시포 체인 / Sipho Chaine | Orlando Pirates FC | 미확인 (협회 RSA) | — | 0 (출전 없음) | D | 미적용 · incomplete | shotStopping, distribution, aerialCommand, sweeping, penaltySaving, stability, buildUp, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 17 | 에비던스 마크고파 / Evidence Makgopa | Orlando Pirates FC | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 18 | 사무켈레 카비니 / Samukele Kabini | Molde FK | 미확인 (협회 NOR) | — | 0 (출전 없음) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 19 | 은코시나티 시비시 / Nkosinathi Sibisi | Orlando Pirates FC | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 20 | 쿨리소 무다우 / Khuliso Mudau | Mamelodi Sundowns FC | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 21 | 이메 오콘 / Ime Okon | Hannover 96 | 미확인 (협회 GER) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 22 | 리카르도 고스 / Ricardo Goss | Siwelele FC | 미확인 (협회 RSA) | — | 0 (출전 없음) | D | 미적용 · incomplete | shotStopping, distribution, aerialCommand, sweeping, penaltySaving, stability, buildUp, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 23 | 제이든 애덤스 / Jayden Adams | Mamelodi Sundowns | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 24 | 올웨투 마카냐 / Olwethu Makhanya | Philadelphia Union | 미확인 (협회 USA) | — | 0 (출전 없음) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 25 | 카모겔로 세벨레벨레 / Kamogelo Sebelebele | Orlando Pirates FC | 미확인 (협회 RSA) | — | — (분 미집계) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |
| RSA | 26 | 브래들리 크로스 / Bradley Cross | Kaizer Chiefs FC | 미확인 (협회 RSA) | — | 0 (출전 없음) | D | 미적용 · incomplete | finishing, chanceCreation, dribbling, passing, pressing, defending, aerial, impact | 명단 확인 / BASE 출처 없음 |

월드컵 출전 여부는 6개 공식 선발·교체 명단에서 계산했습니다. 선수별 정확한 본선 누적 분은 동일 기준으로 집계하지 않았으므로 출전 선수는 `— (분 미집계)`, 6경기 어느 선발·교체에도 없었던 선수만 `0 (출전 없음)`으로 표시합니다. 리그 이름도 공식 최종 명단의 클럽 협회 코드만으로 추정하지 않습니다.

## 경기·시나리오 관점

| 경기 | 대진 | 홈 팀 관점 | 원정 팀 관점 | 합계 |
|---|---|---:|---:|---:|
| M01 | MEX–RSA | 1 | 1 | 2 |
| M02 | KOR–CZE | 2 | 1 | 3 |
| M25 | CZE–RSA | 1 | 1 | 2 |
| M28 | MEX–KOR | 1 | 1 | 2 |
| M53 | CZE–MEX | 1 | 1 | 2 |
| M54 | RSA–KOR | 1 | 1 | 2 |

- M01 RSA 56분 시나리오 한 건만 공식 퇴장 이후 10명 `currentLineup` 예외입니다.
- 실제 교체 해석 상태: verified 0 / inferred 13. OUT/IN/시점과 전술 목적 해석의 검증 수준은 분리됩니다.

## Tournament Form과 Current Condition

| 항목 | 커버리지 |
|---|---:|
| Tournament Form 스냅샷 | 206 |
| Form 상태 | no_minutes 102 / insufficient_metrics 104 / complete 0 |
| 선수별 지표 커버리지 > 0 | 0/206 |
| 0이 아닌 Form 조정 | 0/206 |
| Current Condition 스냅샷 | 206 |
| 확인된 현재 경기 분 기반 에너지 추정 | 206/206 |
| 확인된 부상 상태 | 0/206 |
| 확인된 최근 일정 부담 | 0/206 |

Tournament Form은 각 시나리오 타임스탬프 이전의 Group A 경기만 참조합니다. 선수 단위 지표 커버리지가 없으면 `no_minutes` 또는 `insufficient_metrics`, 신뢰도 0, 조정 0으로 남습니다. Current Condition의 에너지는 공식 출전 분에서 파생한 추정치이며 의료 정보가 아닙니다.

## TLSI와 출처

- TLSI: 26개 — 미적용 표기(1.00) 26개, applied=false 26개, low confidence 26개, 영향 0 26개
- 출처 레지스트리: 51개
- 데이터에서 참조한 고유 출처: 34개
- 전체 출처 참조 사용: 907회
- 미해결 출처 ID: 0개

## 제출 시 명시해야 할 한계

1. 2025-06-11~2026-06-10 선수별 365일 이벤트·분 데이터가 확보되지 않아 BASE PROFILE 완료 선수는 0/104명입니다.
2. 공식 최종 명단 104명의 메타데이터 검증과 경기 공식 기록 검증은 완료된 성과 속성으로 과장하지 않습니다.
3. 필드/GK 활성 속성 832칸 중 확인된 값은 0칸이며, 누락 값은 `null`입니다.
4. Tournament Form 선수 지표 커버리지는 0/206이며 불충분한 스냅샷에는 조정을 적용하지 않습니다.
5. TLSI가 없거나 불완전할 때는 리그 차이를 임의 추정하지 않고 중립/미산정 상태를 유지합니다.
