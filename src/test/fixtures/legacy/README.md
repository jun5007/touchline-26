# Legacy test fixtures

이 디렉터리의 JSON은 현재 제품 데이터가 아니라 속성 재현 테스트와 과거 프로토타입 보존용 fixture입니다.

- 현재 공개 제품 범위: A조 4개국, 6경기, 13미션, 선수 104명
- 제품 데이터 정본: `src/data/group-a/` 및 `src/data/players/group-a-players.json`
- `attribute-model-players.json`: 과거 18명 표본의 1–20 속성 파이프라인 재현 테스트 전용
- `prototype-match.json`, `prototype-scenarios.json`: 런타임에서 import하지 않는 과거 프로토타입 기록

이 파일들의 선수 수·경기 수·미션 수를 현재 제품 범위로 해석해서는 안 됩니다.
