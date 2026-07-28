# 선수 프로필·전술 선택 적합도 파이프라인

## 현재 모델의 원칙

현재 A조판은 과거 대한민국–체코 단일 경기판의 “18명 × 8개 사후 퍼포먼스 값”을 정본으로 사용하지 않습니다. 그 값은 경기 종료 후 자료를 의사결정 전 능력처럼 보이게 할 위험이 있어 새 4팀 범위에서는 폐기된 이전 모델입니다.

현재 정본은 `src/data/players/group-a-players.json`의 104명 BASE PROFILE입니다.

- 기간: 2025-06-11~2026-06-10
- 선수: KOR/CZE/MEX/RSA 각 26명
- 최근 365일 공통 지표 확보 상태: 미확보
- 결과: 104명 모두 `dataGrade: D`, `status: incomplete`
- `analysisMinutes`, 필드 속성, 골키퍼 속성: 모두 `null`

누락값을 0, 10.5, 평균, FIFA 명단의 A매치 수로 대체하지 않습니다.

## 스키마

### 필드 선수 8키

| 키 | 의미 |
| --- | --- |
| `finishing` | 슈팅 마무리 |
| `chanceCreation` | 기회 창출 |
| `dribbling` | 운반·돌파 |
| `passing` | 패스 전개 |
| `pressing` | 압박 기여 |
| `defending` | 수비 행동 |
| `aerial` | 제공권 |
| `impact` | 종합 영향 |

### 골키퍼 전용 8키

| 키 | 의미 |
| --- | --- |
| `shotStopping` | 슈팅 저지 |
| `distribution` | 배급 |
| `aerialCommand` | 공중볼 장악 |
| `sweeping` | 뒷공간 처리 |
| `penaltySaving` | 페널티 대응 |
| `stability` | 안정성 |
| `buildUp` | 빌드업 참여 |
| `impact` | 종합 영향 |

GK는 필드 선수 가중치에 억지로 넣지 않습니다. `activeAttributeModel`이 `field` 또는 `goalkeeper`를 명시합니다.

## BASE PROFILE

BASE PROFILE은 본선 개막 전에 확보할 수 있었던 선수의 기본 프로필을 뜻합니다.

```text
start = 2025-06-11
end   = 2026-06-10
```

FIFA 최종 명단은 신원·등번호·포지션·클럽을 확인하는 출처입니다. 동일 기간의 선수별 출전시간과 이벤트 분모를 제공하지 않으므로 능력치를 계산하는 출처로 사용하지 않습니다. 본선 PMSR도 기간 이후의 사후 자료이므로 BASE PROFILE에 혼합하지 않습니다.

현재 선수 레코드의 공통 상태:

```json
{
  "analysisMinutes": null,
  "dataGrade": "D",
  "confidence": 0,
  "status": "incomplete"
}
```

## 누락값 재가중

점수 계산은 사용할 수 있는 항목만 남기고 가중치를 다시 정규화합니다.

```text
availableWeight = Σ(weight_i where attribute_i is not null)

if availableWeight > 0:
  component = Σ(attribute_i × weight_i) / availableWeight
else:
  component = unavailable
```

- `null`은 0점이 아닙니다.
- 사용 가능한 능력치가 하나도 없으면 선수 능력 구성요소를 제외합니다.
- 구성요소 하나가 제외되면 역할·현재 상태·상대 매치업 등 남은 구성요소의 가중치를 다시 정규화합니다.
- 공통으로 비교할 수 있는 속성이 없으면 영향 게이지도 `available: false`로 표시합니다.
- UI는 누락값을 `—` 또는 “데이터 없음”으로 보여야 합니다.

역할 적합도는 포지션 호환성 같은 명시적 전술 규칙에서 계산할 수 있지만, 이것을 선수 능력치처럼 표시하지 않습니다.

## Tournament Form

Tournament Form은 각 미션 전에 끝난 A조 경기만 사용합니다.

| 상태 | 조건 | 조정 |
| --- | --- | ---: |
| `no_minutes` | 이전 본선 출전 사실 없음 | 0 |
| `insufficient_metrics` | 출전 사실은 있으나 시점 안전한 선수별 지표 없음 | 0 |

`matchesPlayedBeforeScenario`와 source id는 보존하지만, 선수별 분·지표가 검증되지 않으면 `minutesBeforeScenario: null`, `metricCoverage: 0`, `reliability: 0`입니다. 뒤 경기나 현재 미션 이후 사건은 참조할 수 없습니다.

## Current Condition

Current Condition은 현재 경기의 해당 시점까지 확인한 정보입니다.

- 공식 현재 출전시간
- 경고·퇴장 상태
- 경기 명단 포함과 교체 가능 여부
- 확인할 수 있는 경우에만 부상 상태

에너지 추정:

```text
energyEstimate = max(60, round(100 - 0.42 × minutesInMatch))
```

이 값은 공식 피지컬·웨어러블 데이터가 아니라 출전시간을 설명 가능한 단일 식으로 변환한 제품 파생값입니다. 정확한 피로도로 표현하면 안 됩니다.

## TOUCHLINE League Strength Index

FIFA 최종 명단의 클럽 협회 코드에서 26개 협회 맥락을 만들었습니다. 그러나 실제 리그, 시즌, 승강, 대륙 간 강도를 같은 척도로 연결하는 검증 근거가 없습니다.

모든 TLSI 행:

```json
{
  "strengthFactor": 1,
  "confidence": "low",
  "sourceStatus": "incomplete",
  "attributeImpactLimit": 0,
  "applied": false
}
```

1.00은 “리그가 같다”는 결론이 아니라 보정 미적용 표기입니다. 현재 점수 영향은 정확히 0입니다.

## 전술 선택 적합도

전술 선택 적합도는 공식 평점·승률·선수 절대 능력 평가가 아니라 한 미션에서 선택을 설명하기 위한 규칙 기반 값입니다.

```text
base components:
  available player attributes
  role fit
  current condition
  opponent matchup

result:
  reweighted available components
  + scenario instruction modifiers
  - declared risk penalties
```

가용하지 않은 능력 구성요소를 임의 중앙값으로 넣지 않으므로, 상황에 따라 역할·지시·현재 상태가 점수 차이를 설명합니다. 결과에는 사용할 수 있었던 근거와 빠진 근거를 함께 표시해야 합니다.

## 미래 정보 누출 방지

- BASE 종료일은 본선 개막 전날입니다.
- Tournament Form source id는 `scenarioTimestamp`보다 이른 경기만 허용합니다.
- Current Condition은 현재 경기의 미션 분까지만 허용합니다.
- `DecisionMatchView`는 `finalScore`와 사후 이벤트를 포함하지 않습니다.
- `DecisionScenarioContext`는 `actualDecision`과 결과 전용 사실을 포함하지 않습니다.
- 결과 화면만 실제 선택과 최종 결과를 읽습니다.

## 생성·검증

```bash
npm run data:generate
npm run data:validate
npm run data:coverage
npm run data:future-leakage
npm run test
```

`data:coverage`는 프로필을 억지로 완성하지 않고 104명 모두 D/incomplete라는 현재 커버리지를 문서화해야 합니다. 데이터가 추가될 경우 다음 조건을 모두 만족해야 속성을 채울 수 있습니다.

1. 2025-06-11~2026-06-10 기간이 명확할 것
2. 선수별 분석 출전시간 분모가 있을 것
3. 네 팀 104명을 공통 정의로 비교할 수 있을 것
4. 원본 source id와 변환식을 재현할 수 있을 것
5. GK와 필드 지표 정의가 분리될 것
6. 누락 커버리지와 등급이 자동 계산될 것

최종 통합 검증 전에는 과거의 `attributes:verify` 18명 결과나 과거 Vitest 개수를 새 A조판의 완료 증거로 인용하지 않습니다.
