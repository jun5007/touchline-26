# P0 선수 자동 범위

> 생성 명령: `npm run base-profile:scope`
> 기준 데이터: 기존 4개국 · 6경기 · 13미션
> BASE 분석 기간: 2025-06-11 00:00 ~ 2026-06-10 23:59

## 산출 규칙

P0는 현재 13미션의 `currentLineup`, `benchOptions`, 결과 화면의 실제 감독 선택 OUT/IN을 합친 뒤 선수 ID로 중복 제거한 집합입니다. 현재 구현에는 별도 대체선수 배열이 없으며, 실제 선택 가능한 대체 후보는 `benchOptions` 전체이므로 모두 포함합니다.

이 문서는 소스 JSON에서 자동 생성됩니다. 수동으로 선수를 추가하거나 제외하지 않습니다.

## 요약

| 국가 | 고유 P0 | 선발 등장 합계 | 벤치 등장 합계 | 실제 선택 등장 선수 |
|---|---:|---:|---:|---:|
| KOR | 20 | 44 | 19 | 8 |
| CZE | 22 | 33 | 15 | 6 |
| MEX | 21 | 33 | 15 | 5 |
| RSA | 18 | 32 | 15 | 6 |
| **합계** | **81** | **142** | **64** | **25** |

## 선수별 범위

| 국가 | 선수 ID | 선수명 | 공식 포지션 | 등장 미션 | 선발 등장 | 벤치 등장 | 실제 감독 선택 | 데이터 수집 상태 |
|---|---|---|---|---|---:|---:|---|---|
| KOR | `kim-seunggyu` | 김승규 / KIM Seunggyu | GK | kor-m28-second-nine-77<br>kor-m54-reset-backline-65<br>lead-84-close-game<br>level-69-find-nine | 4 | 0 | 아니오 | incomplete · 활성 0/8 |
| KOR | `lee-hanbeom` | 이한범 / LEE Hanbeom | DF | kor-m28-second-nine-77<br>kor-m54-reset-backline-65<br>lead-84-close-game<br>level-69-find-nine | 4 | 0 | 아니오 | incomplete · 활성 0/8 |
| KOR | `lee-gihyuk` | 이기혁 / LEE Gihyuk | MF | kor-m28-second-nine-77<br>kor-m54-reset-backline-65<br>lead-84-close-game<br>level-69-find-nine | 4 | 0 | 아니오 | incomplete · 활성 0/8 |
| KOR | `kim-minjae` | 김민재 / KIM Minjae | DF | kor-m28-second-nine-77<br>kor-m54-reset-backline-65<br>lead-84-close-game<br>level-69-find-nine | 4 | 0 | 예 | incomplete · 활성 0/8 |
| KOR | `hwang-inbeom` | 황인범 / HWANG Inbeom | MF | kor-m28-second-nine-77<br>kor-m54-reset-backline-65<br>lead-84-close-game<br>level-69-find-nine | 4 | 0 | 예 | incomplete · 활성 0/8 |
| KOR | `son-heungmin` | 손흥민 / SON Heungmin | FW | kor-m54-reset-backline-65<br>level-69-find-nine | 2 | 0 | 예 | incomplete · 활성 0/8 |
| KOR | `paik-seungho` | 백승호 / PAIK Seungho | MF | kor-m28-second-nine-77<br>lead-84-close-game<br>level-69-find-nine | 3 | 0 | 예 | incomplete · 활성 0/8 |
| KOR | `cho-guesung` | 조규성 / CHO Guesung | FW | kor-m28-second-nine-77<br>kor-m54-reset-backline-65<br>lead-84-close-game<br>level-69-find-nine | 0 | 4 | 예 | incomplete · 활성 0/8 |
| KOR | `lee-jaesung` | 이재성 / LEE Jaesung | MF | kor-m54-reset-backline-65 | 0 | 1 | 아니오 | incomplete · 활성 0/8 |
| KOR | `hwang-heechan` | 황희찬 / HWANG Heechan | MF | kor-m28-second-nine-77<br>lead-84-close-game<br>level-69-find-nine | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| KOR | `lee-taeseok` | 이태석 / LEE Taeseok | DF | kor-m28-second-nine-77<br>level-69-find-nine | 1 | 1 | 아니오 | incomplete · 활성 0/8 |
| KOR | `park-jinseob` | 박진섭 / PARK Jinseob | DF | kor-m28-second-nine-77<br>kor-m54-reset-backline-65<br>lead-84-close-game<br>level-69-find-nine | 0 | 4 | 예 | incomplete · 활성 0/8 |
| KOR | `bae-junho` | 배준호 / BAE Junho | MF | kor-m28-second-nine-77<br>kor-m54-reset-backline-65<br>lead-84-close-game | 0 | 3 | 아니오 | incomplete · 활성 0/8 |
| KOR | `oh-hyeongyu` | 오현규 / OH Hyeongyu | FW | kor-m28-second-nine-77<br>kor-m54-reset-backline-65<br>lead-84-close-game<br>level-69-find-nine | 3 | 1 | 예 | incomplete · 활성 0/8 |
| KOR | `lee-kangin` | 이강인 / LEE Kangin | MF | kor-m28-second-nine-77<br>kor-m54-reset-backline-65<br>lead-84-close-game<br>level-69-find-nine | 4 | 0 | 아니오 | incomplete · 활성 0/8 |
| KOR | `yang-hyunjun` | 양현준 / YANG Hyunjun | MF | kor-m28-second-nine-77<br>kor-m54-reset-backline-65<br>level-69-find-nine | 1 | 2 | 아니오 | incomplete · 활성 0/8 |
| KOR | `seol-youngwoo` | 설영우 / SEOL Youngwoo | DF | kor-m54-reset-backline-65<br>lead-84-close-game<br>level-69-find-nine | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| KOR | `castrop-jens` | 옌스 카스트로프 / CASTROP Jens | DF | kor-m54-reset-backline-65 | 1 | 0 | 아니오 | incomplete · 활성 0/8 |
| KOR | `kim-jingyu` | 김진규 / KIM Jingyu | MF | kor-m28-second-nine-77<br>kor-m54-reset-backline-65<br>lead-84-close-game | 1 | 2 | 예 | incomplete · 활성 0/8 |
| KOR | `eom-jisung` | 엄지성 / EOM Jisung | MF | kor-m28-second-nine-77<br>lead-84-close-game<br>level-69-find-nine | 2 | 1 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-matej-kovar` | 마테이 코바르 / Matěj Kovář | GK | cze-m02-equaliser-84<br>cze-m25-protect-78<br>cze-m53-reconnect-56 | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-david-zima` | 다비드 지마 / David Zima | DF | cze-m02-equaliser-84<br>cze-m25-protect-78 | 0 | 2 | 예 | incomplete · 활성 0/8 |
| CZE | `cze-tomas-holes` | 토마시 홀레시 / Tomáš Holeš | DF | cze-m25-protect-78<br>cze-m53-reconnect-56 | 2 | 0 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-robin-hranac` | 로빈 흐라나치 / Robin Hranáč | DF | cze-m02-equaliser-84<br>cze-m25-protect-78<br>cze-m53-reconnect-56 | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-vladimir-coufal` | 블라디미르 초우팔 / Vladimír Coufal | DF | cze-m02-equaliser-84<br>cze-m25-protect-78<br>cze-m53-reconnect-56 | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-stepan-chaloupek` | 슈테판 할루페크 / Štěpán Chaloupek | DF | cze-m02-equaliser-84 | 1 | 0 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-ladislav-krejci` | 라디슬라프 크레이치 / Ladislav Krejčí | DF | cze-m02-equaliser-84<br>cze-m25-protect-78<br>cze-m53-reconnect-56 | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-vladimir-darida` | 블라디미르 다리다 / Vladimír Darida | MF | cze-m02-equaliser-84 | 0 | 1 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-adam-hlozek` | 아담 흘로제크 / Adam Hložek | FW | cze-m02-equaliser-84<br>cze-m53-reconnect-56 | 2 | 0 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-patrik-schick` | 파트리크 시크 / Patrik Schick | FW | cze-m25-protect-78<br>cze-m53-reconnect-56 | 1 | 1 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-jan-kuchta` | 얀 쿠흐타 / Jan Kuchta | FW | cze-m02-equaliser-84<br>cze-m25-protect-78 | 0 | 2 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-lukas-cerv` | 루카시 체르프 / Lukáš Červ | MF | cze-m02-equaliser-84<br>cze-m25-protect-78<br>cze-m53-reconnect-56 | 2 | 1 | 예 | incomplete · 활성 0/8 |
| CZE | `cze-mojmir-chytil` | 모이미르 히틸 / Mojmír Chytil | FW | cze-m02-equaliser-84<br>cze-m25-protect-78 | 0 | 2 | 예 | incomplete · 활성 0/8 |
| CZE | `cze-pavel-sulc` | 파벨 슐츠 / Pavel Šulc | FW | cze-m25-protect-78<br>cze-m53-reconnect-56 | 2 | 0 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-lukas-provod` | 루카시 프로보드 / Lukáš Provod | MF | cze-m25-protect-78<br>cze-m53-reconnect-56 | 1 | 1 | 예 | incomplete · 활성 0/8 |
| CZE | `cze-michal-sadilek` | 미할 사딜레크 / Michal Sadílek | MF | cze-m02-equaliser-84<br>cze-m53-reconnect-56 | 2 | 0 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-tomas-chory` | 토마시 호리 / Tomáš Chorý | FW | cze-m02-equaliser-84<br>cze-m25-protect-78<br>cze-m53-reconnect-56 | 1 | 2 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-jaroslav-zeleny` | 야로슬라프 젤레니 / Jaroslav Zelený | DF | cze-m02-equaliser-84<br>cze-m25-protect-78 | 2 | 0 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-david-doudera` | 다비드 도우데라 / David Douděra | DF | cze-m53-reconnect-56 | 1 | 0 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-tomas-soucek` | 토마시 소우체크 / Tomáš Souček | MF | cze-m02-equaliser-84<br>cze-m25-protect-78<br>cze-m53-reconnect-56 | 2 | 1 | 아니오 | incomplete · 활성 0/8 |
| CZE | `cze-alexandr-sojka` | 알렉산드르 소이카 / Alexandr Sojka | MF | cze-m02-equaliser-84<br>cze-m53-reconnect-56 | 1 | 1 | 예 | incomplete · 활성 0/8 |
| CZE | `cze-denis-visinsky` | 데니스 비신스키 / Denis Višinský | FW | cze-m25-protect-78<br>cze-m53-reconnect-56 | 1 | 1 | 예 | incomplete · 활성 0/8 |
| MEX | `mex-raul-rangel` | 라울 랑헬 / Raúl Rangel | GK | mex-m01-control-79<br>mex-m28-last-press-84<br>mex-m53-possession-72 | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-jorge-sanchez` | 호르헤 산체스 / Jorge Sánchez | DF | mex-m28-last-press-84<br>mex-m53-possession-72 | 2 | 0 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-cesar-montes` | 세사르 몬테스 / César Montes | DF | mex-m01-control-79<br>mex-m53-possession-72 | 2 | 0 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-edson-alvarez` | 에드손 알바레스 / Edson Álvarez | DF | mex-m01-control-79<br>mex-m28-last-press-84<br>mex-m53-possession-72 | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-johan-vasquez` | 요한 바스케스 / Johan Vásquez | DF | mex-m01-control-79<br>mex-m28-last-press-84 | 2 | 0 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-erik-lira` | 에리크 리라 / Erik Lira | MF | mex-m28-last-press-84 | 1 | 0 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-alvaro-fidalgo` | 알바로 피달고 / Álvaro Fidalgo | MF | mex-m28-last-press-84<br>mex-m53-possession-72 | 0 | 2 | 예 | incomplete · 활성 0/8 |
| MEX | `mex-raul-jimenez` | 라울 히메네스 / Raúl Jiménez | FW | mex-m53-possession-72 | 0 | 1 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-alexis-vega` | 알렉시스 베가 / Alexis Vega | FW | mex-m01-control-79<br>mex-m28-last-press-84<br>mex-m53-possession-72 | 0 | 3 | 예 | incomplete · 활성 0/8 |
| MEX | `mex-santiago-gimenez` | 산티아고 히메네스 / Santiago Giménez | FW | mex-m01-control-79<br>mex-m28-last-press-84<br>mex-m53-possession-72 | 2 | 1 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-armando-gonzalez` | 아르만도 곤살레스 / Armando González | FW | mex-m01-control-79 | 1 | 0 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-israel-reyes` | 이스라엘 레예스 / Israel Reyes | DF | mex-m01-control-79<br>mex-m28-last-press-84<br>mex-m53-possession-72 | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-julian-quinones` | 훌리안 키뇨네스 / Julián Quiñones | FW | mex-m01-control-79<br>mex-m28-last-press-84<br>mex-m53-possession-72 | 3 | 0 | 예 | incomplete · 활성 0/8 |
| MEX | `mex-orbelin-pineda` | 오르벨린 피네다 / Orbelín Pineda | MF | mex-m28-last-press-84 | 1 | 0 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-obed-vargas` | 오베드 바르가스 / Obed Vargas | MF | mex-m01-control-79<br>mex-m28-last-press-84<br>mex-m53-possession-72 | 2 | 1 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-gilberto-mora` | 힐베르토 모라 / Gilberto Mora | MF | mex-m01-control-79<br>mex-m28-last-press-84<br>mex-m53-possession-72 | 2 | 1 | 예 | incomplete · 활성 0/8 |
| MEX | `mex-mateo-chavez` | 마테오 차베스 / Mateo Chávez | DF | mex-m01-control-79<br>mex-m28-last-press-84<br>mex-m53-possession-72 | 1 | 2 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-cesar-huerta` | 세사르 우에르타 / César Huerta | FW | mex-m01-control-79<br>mex-m28-last-press-84 | 0 | 2 | 예 | incomplete · 활성 0/8 |
| MEX | `mex-jesus-gallardo` | 헤수스 가야르도 / Jesús Gallardo | DF | mex-m01-control-79<br>mex-m28-last-press-84<br>mex-m53-possession-72 | 2 | 1 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-luis-chavez` | 루이스 차베스 / Luis Chávez | MF | mex-m01-control-79<br>mex-m53-possession-72 | 1 | 1 | 아니오 | incomplete · 활성 0/8 |
| MEX | `mex-roberto-alvarado` | 로베르토 알바라도 / Roberto Alvarado | FW | mex-m01-control-79<br>mex-m53-possession-72 | 2 | 0 | 아니오 | incomplete · 활성 0/8 |
| RSA | `rsa-ronwen-williams` | 론웬 윌리엄스 / Ronwen Williams | GK | rsa-m01-ten-men-56<br>rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| RSA | `rsa-teboho-mokoena` | 테보호 모코에나 / Teboho Mokoena | MF | rsa-m01-ten-men-56<br>rsa-m25-box-target-66 | 2 | 0 | 아니오 | incomplete · 활성 0/8 |
| RSA | `rsa-thalente-mbatha` | 탈렌테 음바타 / Thalente Mbatha | MF | rsa-m01-ten-men-56<br>rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 2 | 1 | 예 | incomplete · 활성 0/8 |
| RSA | `rsa-aubrey-modiba` | 오브리 모디바 / Aubrey Modiba | DF | rsa-m01-ten-men-56<br>rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| RSA | `rsa-oswin-appollis` | 오스윈 아폴리스 / Oswin Appollis | FW | rsa-m01-ten-men-56<br>rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 2 | 1 | 예 | incomplete · 활성 0/8 |
| RSA | `rsa-tshepang-moremi` | 체팡 모레미 / Tshepang Moremi | FW | rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 0 | 2 | 예 | incomplete · 활성 0/8 |
| RSA | `rsa-lyle-foster` | 라일 포스터 / Lyle Foster | FW | rsa-m01-ten-men-56<br>rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 1 | 2 | 예 | incomplete · 활성 0/8 |
| RSA | `rsa-relebohile-mofokeng` | 레보힐레 모포켕 / Relebohile Mofokeng | FW | rsa-m01-ten-men-56<br>rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 2 | 1 | 아니오 | incomplete · 활성 0/8 |
| RSA | `rsa-thapelo-maseko` | 타펠로 마세코 / Thapelo Maseko | FW | rsa-m01-ten-men-56<br>rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 2 | 1 | 아니오 | incomplete · 활성 0/8 |
| RSA | `rsa-sphephelo-sithole` | 스페펠렐로 시톨레 / Sphephelo Sithole | MF | rsa-m54-break-balance-62 | 1 | 0 | 아니오 | incomplete · 활성 0/8 |
| RSA | `rsa-mbekezeli-mbokazi` | 음베케젤리 음보카지 / Mbekezeli Mbokazi | DF | rsa-m01-ten-men-56<br>rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| RSA | `rsa-iqraam-rayners` | 이크람 레이너스 / Iqraam Rayners | FW | rsa-m01-ten-men-56<br>rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 2 | 1 | 예 | incomplete · 활성 0/8 |
| RSA | `rsa-evidence-makgopa` | 에비던스 마크고파 / Evidence Makgopa | FW | rsa-m01-ten-men-56<br>rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 1 | 2 | 예 | incomplete · 활성 0/8 |
| RSA | `rsa-nkosinathi-sibisi` | 은코시나티 시비시 / Nkosinathi Sibisi | DF | rsa-m01-ten-men-56<br>rsa-m25-box-target-66 | 1 | 1 | 아니오 | incomplete · 활성 0/8 |
| RSA | `rsa-khuliso-mudau` | 쿨리소 무다우 / Khuliso Mudau | DF | rsa-m01-ten-men-56<br>rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| RSA | `rsa-ime-okon` | 이메 오콘 / Ime Okon | DF | rsa-m01-ten-men-56<br>rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 3 | 0 | 아니오 | incomplete · 활성 0/8 |
| RSA | `rsa-jayden-adams` | 제이든 애덤스 / Jayden Adams | MF | rsa-m01-ten-men-56<br>rsa-m54-break-balance-62 | 1 | 1 | 아니오 | incomplete · 활성 0/8 |
| RSA | `rsa-kamogelo-sebelebele` | 카모겔로 세벨레벨레 / Kamogelo Sebelebele | FW | rsa-m25-box-target-66<br>rsa-m54-break-balance-62 | 0 | 2 | 아니오 | incomplete · 활성 0/8 |

## 현재 수집 판정

- P0 81명 모두 기간과 공개 재사용 권리를 함께 충족하는 선수 단위 성능 출처를 확보하지 못했습니다.
- 따라서 BASE 수치를 만들지 않았고 `null / incomplete`를 유지합니다.
- `src/data/club-performance/*.json`과 `src/data/national-performance/*.json`에는 P0/P1 우선순위, 기간, 빈 `records`, 명시적 누락 사유를 저장합니다.
- 원자료를 확보하면 이 자동 범위를 바꾸지 않고 `records`만 추가해 계산할 수 있습니다.
