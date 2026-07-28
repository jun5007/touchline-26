# TOUCHLINE 26 미래 데이터 누출 감사

- 감사일: 2026-07-28
- 감사 범위: 2026 월드컵 A조 4개국의 13개 시나리오
- 감사 기준: 결정 점수에는 `scenarioTimestamp`까지 확인 가능한 정보만 허용하고, 실제 감독 선택·최종 스코어·이후 사건은 결과 화면에서만 사용
- 기준 시각 해석: 각 시각은 공식 벽시계 이벤트 시각이 아니라 `kickoffUtc + 경기 분`으로 만든 논리 경기 시각이다. 모든 시나리오의 `timestampBasis`에 이 한계가 명시되어 있다.
- 출처 시각 해석: FTR 등 원문이 그 경기 분에 발행되었다는 뜻이 아니다. 사후 공식 문서에서 시나리오 분까지 발생한 사실만 시간 절단해 재구성한 시뮬레이션 입력이며, 원문의 이후 사건은 결정 입력에서 제외한다.

## 시나리오별 감사표

| 시나리오 | 기준 시각 | 사용 데이터 | 이후 데이터 사용 여부 | 상태 | 수정 필요 |
|---|---|---|---|---|---|
| KOR · `level-69-find-nine` · KOR–CZE 69분 | `2026-06-12T03:09:00.000Z` · 69분 · 1–1 | M02 FTR 69분까지의 스코어·출전·경고·교체 상태, M02 Tactical 0분, 최종 명단 `2026-06-10T23:59:59Z`; 이전 본선 경기 없음 | 결정 계산에는 없음. 80분 이후 득점·교체와 최종 2–1, 실제 69분 교체는 `result-only` | 통과 | 없음 |
| KOR · `lead-84-close-game` · KOR–CZE 84분 | `2026-06-12T03:24:00.000Z` · 84분 · 2–1 | M02 FTR 84분까지, M02 Tactical 0분, 최종 명단; 이전 본선 경기 없음 | 결정 계산에는 없음. 90분 이후 사건·최종 2–1·실제 84분 선택은 `result-only` | 통과 | 없음 |
| KOR · `kor-m28-second-nine-77` · MEX–KOR 77분 | `2026-06-19T02:17:00.000Z` · 77분 · 1–0 | M28 FTR 77분까지, M28 Tactical 0분, 최종 명단; Tournament Form은 이전 M02 FTR만 사용 | 결정 계산에는 없음. 80·84분 사건과 최종 1–0, 실제 77분 선택은 `result-only`; M54 미사용 | 통과 | 없음 |
| KOR · `kor-m54-reset-backline-65` · RSA–KOR 65분 | `2026-06-25T02:05:00.000Z` · 65분 · 1–0 | M54 FTR 65분까지, M54 Tactical 0분, 최종 명단; Tournament Form은 이전 M02·M28 FTR만 사용 | 결정 계산에는 없음. 72분 이후 사건·최종 1–0·실제 65분 선택은 `result-only` | 통과 | 없음 |
| CZE · `cze-m02-equaliser-84` · KOR–CZE 84분 | `2026-06-12T03:24:00.000Z` · 84분 · 2–1 | M02 FTR 84분까지, M02 Tactical 0분, 최종 명단; 이전 본선 경기 없음 | 결정 계산에는 없음. 90분 이후 사건·최종 2–1·실제 84분 선택은 `result-only` | 통과 | 없음 |
| CZE · `cze-m25-protect-78` · CZE–RSA 78분 | `2026-06-18T17:18:00.000Z` · 78분 · 1–0 | M25 FTR 78분까지, M25 Tactical 0분, 최종 명단; Tournament Form은 이전 M02 FTR만 사용 | 결정 계산에는 없음. 83·84분 사건과 최종 1–1, 실제 78분 선택은 `result-only`; M53 미사용 | 통과 | 없음 |
| CZE · `cze-m53-reconnect-56` · CZE–MEX 56분 | `2026-06-25T01:56:00.000Z` · 56분 · 0–1 | M53 FTR 56분까지, M53 Tactical 0분, 최종 명단; Tournament Form은 이전 M02·M25 FTR만 사용 | 결정 계산에는 없음. 61분 이후 득점·교체·경고와 최종 0–3, 실제 56분 선택은 `result-only` | 통과 | 없음 |
| MEX · `mex-m01-control-79` · MEX–RSA 79분 | `2026-06-11T20:19:00.000Z` · 79분 · 2–0 | M01 FTR 79분까지, M01 Tactical 0분, 최종 명단; 이전 본선 경기 없음 | 결정 계산에는 없음. 84·90분 사건·최종 2–0·실제 79분 선택은 `result-only` | 통과 | 없음 |
| MEX · `mex-m28-last-press-84` · MEX–KOR 84분 | `2026-06-19T02:24:00.000Z` · 84분 · 1–0 | M28 FTR 84분까지, M28 Tactical 0분, 최종 명단; Tournament Form은 이전 M01 FTR만 사용 | 결정 계산에는 없음. 이후 기록 사건은 없고 최종 1–0 및 실제 84분 선택만 `result-only`; M53 미사용 | 통과 | 없음 |
| MEX · `mex-m53-possession-72` · CZE–MEX 72분 | `2026-06-25T02:12:00.000Z` · 72분 · 0–2 | M53 FTR 72분까지, M53 Tactical 0분, 최종 명단; Tournament Form은 이전 M01·M28 FTR만 사용 | 결정 계산에는 없음. 78분 이후 사건·최종 0–3·실제 72분 선택은 `result-only` | 통과 | 없음 |
| RSA · `rsa-m01-ten-men-56` · MEX–RSA 56분 | `2026-06-11T19:56:00.000Z` · 56분 · 1–0 | M01 FTR 56분까지, M01 Tactical 0분, 최종 명단; 이전 본선 경기 없음 | 결정 계산에는 없음. 61분 이후 득점·교체·경고와 최종 2–0, 실제 56분 선택은 `result-only` | 통과 | 없음 |
| RSA · `rsa-m25-box-target-66` · CZE–RSA 66분 | `2026-06-18T17:06:00.000Z` · 66분 · 1–0 | M25 FTR 66분까지, M25 Tactical 0분, 최종 명단; Tournament Form은 이전 M01 FTR만 사용 | 결정 계산에는 없음. 67분 이후 득점·교체·경고와 최종 1–1, 실제 66분 선택은 `result-only`; M54 미사용 | 통과 | 없음 |
| RSA · `rsa-m54-break-balance-62` · RSA–KOR 62분 | `2026-06-25T02:02:00.000Z` · 62분 · 0–0 | M54 FTR 62분까지, M54 Tactical 0분, 최종 명단; Tournament Form은 이전 M01·M25 FTR만 사용 | 결정 계산에는 없음. 63분 이후 득점·교체·경고와 최종 1–0, 실제 62분 선택은 `result-only` | 통과 | 없음 |

## 코드 경계 확인

| 경계 | 확인 결과 | 관련 파일 |
|---|---|---|
| BASE PROFILE | 종료 시각이 본선 개막 전인 `2026-06-10T23:59:59Z`이며 본선 경기 source ID를 참조하지 않는다. | `src/data/tournament/tournament.json`, `src/data/players/group-a-players.json` |
| 시나리오 입력 | `evidenceRefs`는 모두 `decision-input`이고, `observedThrough`와 `observedThroughMatchMinute`가 시나리오 경계를 넘지 않는다. | `src/data/scenarios/group-a/*.json` |
| Tournament Form | 선택 국가의 킥오프 이전 경기 FTR만 사용한다. 데이터가 불충분한 모든 항목은 coverage·reliability·adjustment가 0이다. | `src/data/scenarios/group-a/*.json`, `scripts/validate-future-leakage.mjs` |
| Current Condition | 현재 경기에서 시나리오 분까지의 실제 출전시간과 경고만 사용한다. 에너지는 `max(60, round(100 - minutes × 0.42))`로 재계산한다. | `src/data/scenarios/group-a/*.json`, `scripts/validate-future-leakage.mjs` |
| 결정 DTO | `DecisionScenarioContext`에는 `actualDecision`, `resultFacts`, `finalScore`, `eventsAfterScenario`가 없고, `DecisionMatchView`에는 최종 점수와 사건이 없다. | `src/data/types.ts`, `src/data/repository.ts` |
| 전술 페이지 | 원본 `match`·`scenario` 대신 위의 제한 DTO만 클라이언트 컴포넌트에 전달한다. 선수 DTO도 해당 시나리오의 Form·Condition만 받는다. | `src/app/matches/[matchId]/scenarios/[scenarioId]/tactics/page.tsx`, `src/data/repository.ts` |
| 점수 계산 | 클라이언트 계산기는 서버 원본 repository나 Group A 경기·시나리오 JSON을 import하지 않는다. | `src/lib/decision/evaluateDecision.ts`, `src/data/instructionCatalog.ts` |
| 결과 화면 | 전체 시나리오의 실제 선택과 이후 사실은 결과 라우트에서만 전달한다. 저장된 선택의 점수는 신뢰하지 않고 현재 데이터로 다시 계산한다. | `src/app/matches/[matchId]/scenarios/[scenarioId]/result/page.tsx`, `src/components/result/ResultWorkspace.tsx` |
| 정적·빌드 검사 | 클라이언트 import graph가 서버 원본을 참조하지 않고, 전술 라우트의 실제 빌드 청크에도 결과 전용 키·13개 고유 결과 문자열이 없다. | `scripts/validate-future-leakage.mjs` |

## 실행 결과

2026-07-28에 현재 production build를 대상으로 다음 명령을 실행했다.

```text
npm run data:future-leakage

Future leakage validation PASSED
- scenarios=13, evidenceBoundaries=checked, tournamentForm=pre-timestamp-only
- actualDecision/resultFacts=result-only, tactics DTO excludes final/result fields
- clientGraph=roots:10, modules:55, forbiddenChains:0
- tacticsClientChunks=4, resultOnlyMarkers=13
```

통과 시나리오 13개, 실패 시나리오 0개다.

## 남아 있는 감사 한계

1. 원본 시나리오 JSON은 결정 입력과 `actualDecision`·`resultFacts`를 같은 레코드에 보관한다. 현재 서버 DTO와 빌드 검사가 차단하지만, 향후 전술 라우트가 원본 객체를 직접 넘기면 다시 위험해진다.
2. 빌드 청크 검사는 `.next`가 없으면 생략된다. 제출 전에는 반드시 `npm run build` 후 `npm run data:future-leakage` 순서로 실행해야 한다.
3. 고유 문자열 검사는 결과 텍스트의 번들 유입을 잘 잡지만 숫자만으로 이루어진 새로운 결과 필드까지 완전하게 증명하는 형식 검증은 아니다. 금지 키와 DTO 검사가 이를 보완한다.
4. `attributeWeights`, `instructionFit`, `matchupModifiers`는 자체 전술 모델이다. 코드 검사는 이후 경기 source ID와 결과 필드의 사용을 차단하지만, 작성자의 사후적 판단 편향 자체를 자동으로 판별할 수는 없다.
5. `scenarioTimestamp`는 논리 경기 시각이므로 실제 중단시간·추가시간을 반영한 공식 벽시계 시각으로 인용하면 안 된다.
6. FTR·PMSR 같은 근거 문서는 경기 후 확인한 자료다. 본 감사의 “통과”는 사건을 시나리오 분에서 구조적으로 절단했다는 뜻이며, 당시 실시간 시스템에서 그 문서를 실제로 열람할 수 있었다는 뜻은 아니다.
