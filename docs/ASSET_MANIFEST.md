# TOUCHLINE 26 자산 제작·출처 기록

검토일: 2026-07-28 (Asia/Seoul)

이 문서는 최종 심사 정본인 저장소 루트 Next.js 애플리케이션에 포함되거나
제출 증빙으로 사용하는 시각 자산을 기록합니다. 저장소 조사로 확인할 수 없는
제작자·원본·권리 정보는 추정하지 않고 **사용자 확인 필요**로 표시했습니다.

## 사용 원칙

- 프로젝트는 공식 대회·협회·구단 로고, 선수 사진, 방송 화면, 원문 보고서
  화면, 스톡 사진과 유료 아이콘을 제품 자산으로 포함하지 않습니다.
- 국명, 선수명, 스코어와 경기 정보는 출처가 연결된 사실 식별 정보로만
  사용합니다.
- 외부 웹 폰트를 내려받지 않으며 시스템 글꼴 fallback을 사용합니다.
- 프로젝트 수준의 오픈소스 라이선스는 선택되지 않았습니다. 해커톤 심사를
  위해 저장소가 공개되더라도 별도 서면 허락 없이 프로젝트 코드·디자인·자체
  그래픽을 복제, 수정, 배포하거나 다른 제품에 재사용하는 것을 허용하지
  않습니다.
- 서드파티 패키지와 사실 자료의 권리는 각 권리자에게 있으며 자세한 고지는
  `THIRD_PARTY_NOTICES.md`를 따릅니다.

## 제품 자산

| 파일 경로 | 자산명 | 제작자 | 제작 도구 | 제작일 | 외부 원본 사용 여부 | 사용 조건 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/app/opengraph-image.tsx` → `/opengraph-image` | 동적 Open Graph/Twitter 공유 이미지 | Codex 보조 작업; 최종 소유·승인은 사용자 확인 필요 | React TSX, Next.js `ImageResponse`, CSS 그라디언트·텍스트 | 2026-07-28 | 없음 — 코드로 1200×630 PNG 생성 | TOUCHLINE 26 심사·홍보용. 프로젝트 자산 재사용은 별도 서면 허락 필요 | 정적 `public/og.png`는 사용하지 않음. 4개국·6경기·13결정을 동적으로 표시 |
| `src/app/icon.svg` | `TL26` 브라우저 아이콘 | Codex 보조 작업; 최종 소유·승인은 사용자 확인 필요 | 직접 작성한 SVG 벡터 코드 | 2026-07-28 | 없음 — 프로젝트 디자인과 맞춘 코드 기반 자산 | TOUCHLINE 26 제품·심사·홍보용. 별도 서면 허락 없는 재사용 금지 | 출처가 불명확한 기존 ICO를 대신하는 자체 제작 아이콘 |
| `src/components/layout/Header.tsx` | `TL 26` 텍스트형 헤더 마크 | Codex 보조 작업; 최종 소유·승인은 사용자 확인 필요 | React, HTML 텍스트, Tailwind CSS | 2026-07-27~28 | 저장소 검사상 외부 이미지 원본 없음 | TOUCHLINE 26 제품 UI에 사용. 별도 서면 허락 없는 재사용 금지 | 공식 대회·협회 문장을 사용하지 않는 코드 기반 워드마크 |
| `src/app/page.tsx`, `src/app/globals.css` | 홈 히어로 경기장·스코어 링·국가 토큰 | Codex 보조 작업; 최종 소유·승인은 사용자 확인 필요 | React, CSS 도형·그라디언트·텍스트 | 2026-07-27~28 | 저장소 검사상 외부 이미지 원본 없음 | TOUCHLINE 26 제품 UI에 사용. 별도 서면 허락 없는 재사용 금지 | 이미지 파일이 아니라 브라우저에서 그리는 코드 기반 장식 |
| `src/components/tactics/FootballPitch.tsx`, `src/components/tactics/PitchPlayer.tsx` | 전술 보드·선수 토큰 | Codex 보조 작업; 최종 소유·승인은 사용자 확인 필요 | React, CSS 도형·텍스트, dnd-kit 상호작용 | 2026-07-27~28 | 저장소 검사상 외부 이미지 원본 없음 | TOUCHLINE 26 제품 UI에 사용. 별도 서면 허락 없는 재사용 금지 | 공식 전술 보고서 화면이나 경기장 이미지를 복제하지 않은 코드 기반 재구성 |
| `src/components/result/DecisionScore.tsx`, `src/components/tactics/ImpactGauges.tsx`, `src/components/report/GroupStageReportWorkspace.tsx` | 적합도·영향·조별리그 리포트 시각화 | Codex 보조 작업; 최종 소유·승인은 사용자 확인 필요 | React, HTML, Tailwind CSS | 2026-07-27~28 | 저장소 검사상 외부 이미지 원본 없음 | TOUCHLINE 26 제품 UI에 사용. 별도 서면 허락 없는 재사용 금지 | 전술 선택 적합도는 승률·공식 평점이 아닌 프로젝트 규칙값 |

## 최종 제출 스크린샷

아래 15개 PNG는 2026-07-28 (Asia/Seoul)에 브라우저 QA 세션에서
Chromium 계열 브라우저로 캡처했습니다. 01~05는 최종 빌드에서 렌더 변경이
없음을 확인한 인앱 Chromium 캡처이고, 06~15는 최종 production build를 실제
Google Chrome에서 다시 캡처했습니다. 외부 사진, 공식 로고, 방송 영상 또는
원문 보고서 화면을 합성하지 않았습니다. 제출 검토와 해커톤 증빙에만 사용하며,
화면 디자인의 별도 재사용 권한을 부여하지 않습니다.

| 파일 경로 | 자산명 | 제작자 | 제작 도구 | 제작일 | 외부 원본 사용 여부 | 사용 조건 | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `docs/submission-screenshots/01-home.png` | 홈 | Codex 브라우저 QA 세션 | Codex 인앱 Chromium viewport 캡처 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 데스크톱 |
| `docs/submission-screenshots/02-country-selection.png` | 국가 선택 | Codex 브라우저 QA 세션 | Codex 인앱 Chromium viewport 캡처 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 데스크톱 |
| `docs/submission-screenshots/03-group-a.png` | A조 최종 순위 | Codex 브라우저 QA 세션 | Codex 인앱 Chromium viewport 캡처 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 데스크톱 |
| `docs/submission-screenshots/04-team-journey.png` | 국가별 세 경기 여정 | Codex 브라우저 QA 세션 | Codex 인앱 Chromium viewport 캡처 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 데스크톱 |
| `docs/submission-screenshots/05-mission-briefing.png` | 미션 브리핑 | Codex 브라우저 QA 세션 | Codex 인앱 Chromium viewport 캡처 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 데스크톱 |
| `docs/submission-screenshots/06-tactics-before.png` | 전술 선택 시작 | Codex 브라우저 QA 세션 | 실제 Google Chrome viewport 캡처 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 클릭 우선·드래그 실험적 안내 반영 |
| `docs/submission-screenshots/07-player-comparison-no-base-data.png` | BASE 미산정 선수 비교 | Codex 브라우저 QA 세션 | 실제 Google Chrome viewport 캡처 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 데이터 한계를 숨기지 않음 |
| `docs/submission-screenshots/08-tactical-decision-fit.png` | 전술 선택 적합도 | Codex 브라우저 QA 세션 | 실제 Google Chrome viewport 캡처 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 승률이 아닌 프로젝트 규칙값 |
| `docs/submission-screenshots/09-result.png` | 결정 결과 | Codex 브라우저 QA 세션 | 실제 Google Chrome viewport 캡처 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 데스크톱 |
| `docs/submission-screenshots/10-actual-manager-comparison.png` | 실제 감독 선택 비교 | Codex 브라우저 QA 세션 | 실제 Google Chrome viewport 캡처 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 실제 선택을 정답으로 표현하지 않음 |
| `docs/submission-screenshots/11-progress.png` | 저장 진행률 | Codex 브라우저 QA 세션 | 실제 Google Chrome viewport 캡처 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 현재 origin의 브라우저 저장 상태 |
| `docs/submission-screenshots/12-group-stage-report.png` | 조별리그 감독 리포트 | Codex 브라우저 QA 세션 | 실제 Google Chrome viewport 캡처 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 데스크톱 |
| `docs/submission-screenshots/13-mobile-tactics.png` | 모바일 전술 선택 | Codex 브라우저 QA 세션 | 실제 Google Chrome, 요청 viewport 390×844 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 저장 PNG 375×811; 물리 터치 기기 아님 |
| `docs/submission-screenshots/14-mobile-result.png` | 모바일 결과 | Codex 브라우저 QA 세션 | 실제 Google Chrome, 요청 viewport 390×844 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 저장 PNG 375×811; 물리 터치 기기 아님 |
| `docs/submission-screenshots/15-mobile-report.png` | 모바일 감독 리포트 | Codex 브라우저 QA 세션 | 실제 Google Chrome, 요청 viewport 390×844 | 2026-07-28 | 없음 — 앱 렌더 캡처 | 심사·검토 증빙용 | 저장 PNG 375×811; 물리 터치 기기 아님 |

## 공개 전 사용자 확인 필요

- [ ] 프로젝트 소유자가 자체 코드·디자인·그래픽의 공개 범위와 재사용 금지
  문구 승인
- [ ] 최종 production 화면이 바뀌면 15개 스크린샷을 다시 캡처하고 제작일 갱신
- [ ] 공개 저장소와 제출 묶음에 원본 PDF, 공식 로고, 선수 사진, 방송 화면,
  스톡 이미지, 유료 아이콘이 포함되지 않았는지 재검사
