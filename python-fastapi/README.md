# TOUCHLINE 26 — Python FastAPI 버전

기존 Next.js 서비스의 실제 경기 데이터와 전술 평가 규칙을 Python으로 제공하는 별도 구현입니다. FastAPI가 API와 Jinja2 화면을 함께 서비스하므로 Node.js 없이도 시작 화면부터 경기 선택, 브리핑, 전술 결정, 결과 분석까지 실행할 수 있습니다.

이 폴더는 독립적인 Python 배포 단위지만, 데이터의 원본(source of truth)은 상위 저장소의 `src/data`입니다. Python 버전은 로컬 개발에서 그 원본을 직접 읽을 수 있고, 폴더 단위 배포에서는 `data` 스냅샷을 읽습니다.

## 요구 환경

- Python 3.12 이상
- Windows PowerShell 7 또는 호환 셸
- 선택 사항: Docker, Vercel CLI 48.1.8 이상

별도 데이터베이스, API 키, 회원가입은 필요하지 않습니다.

## Windows PowerShell에서 실행

아래 명령은 모든 가상환경과 패키지 캐시를 `python-fastapi` 폴더 안에 둡니다.

```powershell
Set-Location -LiteralPath 'C:\Users\jjang\Desktop\데이콘\해커톤 내가 축구 감독이라면\python-fastapi'

$env:PIP_CACHE_DIR = Join-Path (Get-Location) '.cache\pip'
$env:PYTHONPYCACHEPREFIX = Join-Path (Get-Location) '.cache\pycache'

py -3.12 -m venv .venv
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install --requirement requirements-dev.txt
& .\.venv\Scripts\python.exe scripts\sync_data.py
& .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

브라우저에서 `http://127.0.0.1:8000`을 엽니다. FastAPI의 OpenAPI 문서는 `http://127.0.0.1:8000/docs`에서 확인할 수 있습니다.

PowerShell 실행 정책을 바꿀 필요가 없도록 가상환경의 Python 실행 파일을 직접 호출합니다. 이미 Python 3.12가 기본 `python`이라면 `py -3.12` 대신 `python`을 사용해도 됩니다.

## 데이터 구조와 동기화

원본 데이터:

```text
../src/data/
  copy/resultTemplates.json
  instructions/instructions.json
  matches/matches.json
  players/players.json
  roles/roles.json
  scenarios/scenarios.json
```

배포용 스냅샷:

```text
./data/
```

`scripts/sync_data.py`는 원본 JSON을 스냅샷으로 단방향 복사합니다. 원본 파일은 변경하지 않으며, 대상 폴더의 무관한 파일을 삭제하지도 않습니다.

```powershell
# 원본을 배포 스냅샷에 반영
& .\.venv\Scripts\python.exe scripts\sync_data.py

# 파일을 변경하지 않고 스냅샷이 최신인지 검사
& .\.venv\Scripts\python.exe scripts\sync_data.py --check
```

애플리케이션은 배포 스냅샷을 우선 사용하고, 로컬 저장소에서는 상위 `src/data`로 폴백합니다. 테스트에서는 `TOUCHLINE_DATA_ROOT`를 원본 폴더로 지정합니다. 다른 데이터 세트를 시험할 때도 이 환경 변수에 동일한 하위 구조를 가진 폴더를 지정할 수 있습니다.

데이터를 수정하는 정상 절차는 다음과 같습니다.

1. 상위 저장소의 `src/data`만 수정합니다.
2. Next.js 쪽 데이터·능력치 검증을 실행합니다.
3. `python scripts/sync_data.py`를 실행합니다.
4. `python scripts/sync_data.py --check`가 통과하는지 확인합니다.
5. 원본 변경과 `python-fastapi/data` 스냅샷 변경을 함께 커밋합니다.

## 검증

가상환경을 만든 뒤 다음 명령을 순서대로 실행합니다.

```powershell
& .\.venv\Scripts\python.exe scripts\sync_data.py --check
& .\.venv\Scripts\python.exe -m ruff check app tests scripts
& .\.venv\Scripts\python.exe -m ruff format --check app tests scripts
& .\.venv\Scripts\python.exe -m pytest
& .\.venv\Scripts\python.exe -m pytest --cov=app --cov-report=term-missing
& .\.venv\Scripts\python.exe -m compileall -q app scripts
```

프로덕션 실행도 확인합니다.

```powershell
& .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## Vercel 배포

Vercel은 FastAPI를 별도 rewrite 없이 자동 감지합니다. 이 프로젝트는 `pyproject.toml`의
`[tool.vercel] entrypoint = "app.main:app"`으로 ASGI 진입점을 명시했으며, `public/static`
아래의 CSS·JavaScript는 Vercel CDN과 로컬 FastAPI에서 동일한 `/static/...` URL로 제공됩니다.
현재 지원 방식은 [Vercel FastAPI 공식 문서](https://vercel.com/docs/frameworks/backend/fastapi)를
기준으로 구성했습니다.

Vercel 프로젝트 설정:

- Root Directory: `python-fastapi`
- Framework Preset: 자동 감지
- 환경 변수: 없음
- Vercel CLI: 48.1.8 이상

Vercel은 설정된 Root Directory의 바깥 파일을 배포 번들에 넣지 않습니다. 따라서 배포 전에 원본 JSON을 `python-fastapi/data`에 복사하고 그 스냅샷을 커밋해야 합니다.

```powershell
& .\.venv\Scripts\python.exe scripts\sync_data.py
& .\.venv\Scripts\python.exe scripts\sync_data.py --check
npx vercel@latest
npx vercel@latest --prod
```

배포 후 최소 확인 항목:

- `/`가 200을 반환하는지
- `/docs`가 열리는지
- 경기·미션 목록 API가 실제 데이터를 반환하는지
- 브리핑 → 전술 선택 → 결과 화면 흐름이 동작하는지
- 정적 CSS·JavaScript 요청에 404가 없는지

## Docker

먼저 배포 스냅샷을 동기화한 뒤, **이 폴더를 Docker build context로** 사용합니다.

```powershell
& .\.venv\Scripts\python.exe scripts\sync_data.py
docker build --tag touchline26-fastapi .
docker run --rm --publish 8000:8000 --env PORT=8000 touchline26-fastapi
```

컨테이너는 비루트 사용자로 실행되며 `PORT` 환경 변수를 따릅니다.

## Render

### Native Python 서비스

1. GitHub 저장소를 Render에 연결합니다.
2. Root Directory를 `python-fastapi`로 지정합니다.
3. Runtime을 Python 3으로 선택하고 Python 3.12 이상을 사용합니다.
4. Build Command를 `pip install -r requirements.txt`로 지정합니다.
5. Start Command를 `uvicorn app.main:app --host 0.0.0.0 --port $PORT`로 지정합니다.
6. 배포 전 `scripts/sync_data.py`로 생성한 `data` 스냅샷이 커밋됐는지 확인합니다.

### Docker 서비스

Render의 Docker 런타임을 선택하고 Dockerfile 경로와 Root Directory를 모두 `python-fastapi` 기준으로 설정합니다. Docker 이미지 역시 커밋된 `data` 스냅샷을 포함합니다.

## 디렉터리 개요

```text
python-fastapi/
  app/                    # FastAPI 앱, 도메인 로직, Jinja2 화면
  public/static/          # 로컬·Vercel 공용 CSS와 JavaScript
  data/                   # src/data에서 생성한 배포용 JSON 스냅샷
  scripts/sync_data.py    # 원본 → 스냅샷 동기화 및 검사
  tests/                  # API·점수 계산·화면 흐름 테스트
  pyproject.toml          # Python 패키지와 Vercel 엔트리포인트
  Dockerfile
```

Next.js 원본과 Python 버전이 서로 다른 데이터 정의를 갖지 않도록, `python-fastapi/data`를 직접 편집하지 않는 것이 핵심입니다.
