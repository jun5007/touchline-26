# TOUCHLINE 26 Vercel 배포 가이드

> 상태: **사용자 작업 필요**
> 이 문서는 배포 절차를 설명할 뿐, 현재 공개 production URL이나 배포 완료를 뜻하지 않습니다.
> 확인된 production URL은 GitHub URL·YouTube URL과 함께 DAKER에 입력하는 세
> URL 중 하나이며, 배포 파일 자체를 DAKER에 업로드하지 않습니다.

## 배포 전제

- 배포 대상은 저장소 루트의 Next.js 애플리케이션입니다.
- `python-fastapi/`는 최종 공개 main tip에서 제외합니다. 동결 참고 구현은
  Git이 무시하는 로컬 복사본과 이전 Git 이력에만 남으며 별도 배포하지 않습니다.
- Node.js 버전은 `package.json`의 `24.x`를 따릅니다.
- 외부 API 키, 데이터베이스, 로그인, 결제용 환경변수는 필요하지 않습니다.
- `vercel.json`은 Next.js 프레임워크를 지정합니다.
- 프로젝트에 Vercel Authentication이나 비밀번호 보호를 켜면 심사자가 접근하지 못할 수 있습니다.

## 1. 최종 소스 검증

배포할 정확한 commit에서 실행합니다.

```bash
npm ci
npm run data:validate
npm run data:coverage
npm run data:future-leakage
npm run lint
npm run test
npm run attributes:verify
npm run base-profile:verify
npm run license:check
npm run build
```

별도 터미널에서 실제 production 서버를 기동한 뒤 핵심 route를 smoke
테스트합니다.

```bash
npm run start
```

기존 Release Candidate 검토 ZIP은 과거 로컬 기록일 뿐이며 DAKER 또는 공개
GitHub 제출 대상이 아닙니다. 배포 단계에서 새 ZIP을 생성하거나 업로드하지
않습니다.

`base-profile:verify`에서 구조·산식이 통과하더라도 `coverageTarget=NOT_MET`은 현재 데이터 한계를 정직하게 알리는 정상 상태입니다. 실제 BASE PROFILE은 0/104명, 활성 속성은 0/832개이며 Form과 TLSI도 적용하지 않습니다.

실행 결과는 `SUBMISSION_TEST_RESULTS.md`에 기록합니다. 실패한 검사를 무시한 채 배포 완료로 표시하지 않습니다.

## 2. GitHub 연결 배포

Vercel 대시보드에서 다음 순서로 진행합니다.

1. 공개 제출용 GitHub 저장소를 Import합니다.
2. Framework Preset이 `Next.js`인지 확인합니다.
3. Root Directory는 저장소 루트로 둡니다.
4. Build Command와 Install Command는 기본값을 사용합니다.
5. 환경변수는 추가하지 않습니다.
6. Vercel Authentication, Deployment Protection, 비밀번호 보호가 모두 꺼져
   있는지 확인합니다.
7. 첫 배포를 실행합니다.
8. 생성된 production URL을 기록하되, 실제 외부 접근을 확인하기 전에는 제출 완료로 표시하지 않습니다.

로컬 작업 공간에 Git이 무시하는 `python-fastapi/` 참고 복사본이 보이더라도
Root Directory로 선택하면 안 됩니다. 최종 공개 main tip에는 이 경로가 없습니다.

## 3. CLI 배포 대안

대시보드 대신 Vercel CLI를 사용하려면 저장소 루트에서 실행합니다.

```bash
npx vercel
npx vercel --prod
```

CLI 질문에서는 현재 디렉터리를 프로젝트 루트로 선택하고 Next.js 자동 감지를 유지합니다. 배포 도메인, 팀 계정, 프로젝트 연결 정보는 사용자가 직접 확인합니다. `.vercel/`은 로컬 연결 메타데이터이므로 Git에 올리지 않습니다.

## 4. production 검증

production URL을 로그아웃 시크릿 창과 외부 네트워크에서 엽니다.

### 필수 라우트

- `/`
- `/teams`
- `/group-a`
- `/matches`
- `/about-data`
- `/teams/kor`
- `/teams/kor/report`
- 한 개 이상의 미션 브리핑·전술·결과 전체 흐름
- 대표 브리핑·전술·결과와 `/teams/kor/report` 직접 진입 후 새로고침
- 잘못된 `/teams/not-a-team`, match, scenario URL의 사용자용 404

### 핵심 기능

- [ ] KOR/CZE/MEX/RSA 4개국만 노출
- [ ] A조 6경기와 모든 경기의 양 팀 감독 관점
- [ ] 13개 미션 진입
- [ ] 클릭으로 OUT/IN, 역할, 네 가지 팀 지시 선택
- [ ] 전술 선택 적합도가 선택에 따라 갱신
- [ ] 적합도를 승률·선수 절대 능력치로 표현하지 않음
- [ ] 비어 있는 BASE 1–20 표와 0 게이지를 반복 노출하지 않음
- [ ] 결정 확정 전에는 최종 결과와 실제 감독 선택이 보이지 않음
- [ ] 결과 화면에서 공식 사실·자체 분석·결과 전용 사실이 구분됨
- [ ] 국가별 리포트에 경기별 진행 상태와 같은 경기 비중 평균 설명
- [ ] 저장값 손상 시 제외 안내와 안전한 복구
- [ ] 다시 플레이와 다른 국가 선택

### 화면과 브라우저

- [ ] Desktop 1280×720
- [ ] Mobile 390×844
- [ ] Mobile 360px 폭
- [ ] Google Chrome
- [ ] Microsoft Edge
- [ ] Firefox
- [ ] 모바일 Chrome
- [ ] Safari 또는 iOS Safari
- [ ] console error 0
- [ ] hydration warning 0
- [ ] 핵심 버튼 가림·의도하지 않은 가로 스크롤 없음
- [ ] 클릭 조작만으로 모바일 전체 흐름 완료

실제로 확인하지 않은 브라우저는 체크하지 않습니다.

### 공개 접근과 네트워크

- [ ] 로그아웃·시크릿 창에서 인증 화면 없이 바로 열림
- [ ] Vercel Authentication·Deployment Protection·비밀번호 보호 없음
- [ ] 외부 API 키 입력이나 별도 환경변수 없이 전체 흐름 동작
- [ ] 개발자 도구 Network에서 불필요한 제3자 API 요청 없음
- [ ] 다른 네트워크 또는 다른 기기에서 production URL 접근

## localStorage 주의

결정과 진행률은 서버가 아니라 현재 origin의 브라우저 `localStorage`에 저장됩니다.

- Preview URL에서 만든 진행률은 production URL로 자동 이전되지 않습니다.
- 도메인이 바뀌거나 브라우저 데이터를 지우면 결정이 사라집니다.
- 다른 기기나 브라우저와 동기화되지 않습니다.
- 시연 영상은 production URL 한 곳에서 새 세션으로 진행하는 것이 안전합니다.
- 서버에 점수·설명·실제 결과를 저장하지 않으며, 앱이 최소 선택값을 검증한 뒤 현재 코드와 데이터로 재계산합니다.

## 배포 후 기록

다음 값을 사용자가 직접 채웁니다.

```text
Production URL:
Vercel project:
Deployment ID:
Git commit SHA:
배포 시각 및 시간대:
로그아웃 확인 시각 및 시간대:
외부 네트워크 확인:
Deployment Protection 해제 확인:
외부 API 키·환경변수 없음 확인:
```

URL을 문서에 넣기 전에 실제로 열리는지 확인합니다. 추측하거나 예시 URL을 실제 URL처럼 기록하지 않습니다.

## 마감과 동결

대회 공식 페이지에는 최종 마감이 **2026-08-03 10:00**으로 표시되어 있습니다. 이는 공식 페이지 표기 기준이며, 시간대가 명확하지 않다면 최신 공지와 제출 화면에서 재확인합니다.

마감 전 여유 있게 production을 고정하고 GitHub commit SHA와 같은 소스인지 확인합니다. 제출 뒤 또는 마감 뒤에는 commit, force push, 배포 교체를 하지 않습니다. 긴급 수정이 필요하더라도 대회 규정을 먼저 확인합니다.
