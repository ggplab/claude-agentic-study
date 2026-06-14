# isaac-dev — Isaac Sim 로보틱스 개발용 클로드 플러그인 (사이드 프로젝트 기획서)

> **한 줄 요약**: NVIDIA Isaac Sim 로보틱스 개발에서 반복되는 작업은 자동으로 통과시키고, 되돌릴 수 없는 중대한 단계는 반드시 멈춰 확인하게 만드는 **권한 위임 게이트**를, ch2에서 배운 스킬·서브에이전트·MCP·훅으로 묶은 하나의 클로드 플러그인.
>
> ch2 핵심 개념([README.md](README.md))의 실전 적용 사이드 프로젝트. 이 문서는 기획서이며 구현은 별도.

---

## 1. 배경 & 목표

ch2에서 내가 고른 핵심은 "개발 프로세스 자동화를 위한 권한 위임 시스템(게이트) 설계"였다. 그 추상적 개념을 내 분야인 **로보틱스 시뮬레이터(Isaac Sim)** 개발에 직접 적용해 본다.

- **목표**: Isaac Sim 개발 흐름을 `isaac-dev`라는 클로드 플러그인 하나로 묶어, 반복 작업의 확인 피로를 줄이면서도 중대한 사고(시크릿 커밋, main 강제 푸시 등)는 게이트로 막는다.
- **학습 목표**: 스킬·서브에이전트·MCP·훅 네 가지를 한 프로젝트에서 모두 써 보며 "실행 주체와 컨텍스트"의 차이를 손으로 체득한다. (특히 아직 못 써본 MCP·훅의 첫 실전)
- **대상 범위**: Isaac Sim 중심, IsaacLab-Arena의 Docker·테스트·금지선 패턴을 차용.

---

## 2. 문제 정의 (레퍼런스 AGENTS.md에서 도출)

분석한 두 공식 가이드:
- [isaac-sim/IsaacSim/AGENTS.md](https://github.com/isaac-sim/IsaacSim/blob/main/AGENTS.md)
- [isaac-sim/IsaacLab-Arena/AGENTS.md](https://github.com/isaac-sim/IsaacLab-Arena/blob/main/AGENTS.md)

여기서 보이는 실제 개발 고충:

| # | 고충 | 근거 |
|---|------|------|
| P1 | **모든 명령을 Docker로 감싸야** 한다 (`docker exec "$ARENA_CONTAINER" su ... -c "..."`), 컨테이너명은 동적이라 하드코딩 불가 | Arena |
| P2 | **헤드리스 sim 원격 구동·검증의 반복** (TCP 8226 원격제어, diff-gif 회귀 확인, Tracy 프로파일링) | IsaacSim |
| P3 | **엄격한 금지선을 사람이 매번 지켜야** 한다 (main force-push 금지, AI-attribution 금지, 모델/데이터셋/시크릿 커밋 금지, `docker/`·`workflows`·`submodules` 무단 수정 금지, DCO 서명) | Arena |
| P4 | **정형 절차의 반복** (URDF→USD 변환, SimulationApp inner/outer 테스트 작성, `ArenaEnvBuilder.make_registered()`/`unwrapped` 관례) | 양쪽 |

핵심: P1·P2·P4는 "반복이라 자동화하고 싶은" 영역이고, P3은 "자동화하면 안 되는, 반드시 멈춰야 하는" 영역이다. 이 둘을 가르는 것이 곧 게이트 설계다.

---

## 3. 솔루션 개요 — "플러그인 = 컨테이너"

ch2에서 배운 대로 **플러그인은 여러 확장 수단을 재사용 가능한 패키지로 묶는 메타 확장(컨테이너)**이다. `isaac-dev` 플러그인 하나에 스킬·서브에이전트·MCP·훅을 담아 마켓플레이스로 배포하면, 팀원 누구나 설치 한 번으로 동일한 Isaac Sim 개발 게이트를 갖게 된다.

```
isaac-dev/  (플러그인 = 컨테이너)
├── skills/        지식 확장      → 정형 절차를 굳힘            (P1, P4)
├── agents/        능력 확장      → 격리 컨텍스트로 무거운 작업  (P2)
├── mcp/           외부 연결      → sim 인스턴스·컨테이너에 연결 (P1, P2)
└── hooks/         결정론적 게이트 → 금지선을 기계적으로 강제     (P3)
```

---

## 4. 컴포넌트별 설계 (ch2 4도구 매핑)

### 4-1. 스킬 — "무엇을 알고 있는가" (지식 확장)

모델이 설명을 읽고 자율 호출. 정형 절차를 박제한다.

| 스킬 | 역할 | 대응 고충 |
|------|------|-----------|
| `dev-container` | `docker exec "$ARENA_CONTAINER" su $(id -un) -c "cd /workspaces/... && <cmd>"` 래핑 규약 + 동적 컨테이너명 자동 해석 절차 | P1 |
| `urdf-to-usd` | URDF→USD 변환 단계와 검증 포인트 | P4 |
| `arena-env-build` | `ArenaEnvBuilder.make_registered()` 후 `env.unwrapped.cfg/device` 접근 관례 | P4 |
| `sim-test-pattern` | SimulationApp inner/outer 함수 + deferred import 테스트 작성 가이드 | P4 |

각 스킬은 `SKILL.md` 한 개로 "언제 발동 / 무엇을 한다"를 명시. (IsaacSim 레포의 `skills/SKILLS.md` 온디맨드 인덱스 방식 차용)

### 4-2. 서브에이전트 — "무엇을 할 수 있는가" (능력 확장 = 격리 컨텍스트)

별도 컨텍스트를 따로 지정해, 메인 대화를 오염시키지 않고 무거운 작업을 위임.

| 서브에이전트 | 역할 | 대응 고충 |
|--------------|------|-----------|
| `sim-runner` | 헤드리스 Isaac Sim을 TCP 8226으로 구동해 시나리오 실행·캡처 | P2 |
| `validation-triage` | diff-gif를 읽고 회귀 발생 지점·원인 1차 분류 | P2 |
| `profiler` | Tracy 프로파일링 결과를 비교해 프레임 병목 보고 | P2 |

→ 각각 고유 컨텍스트로 분리하는 이유: sim 로그·캡처·프로파일 데이터는 양이 많아 메인 컨텍스트에 두면 금방 넘친다. "능력 확장 = 별도 컨텍스트"라는 ch2 정의의 실증.

### 4-3. MCP — 외부 도구·데이터로의 통로

| MCP 서버 | 노출 도구 | 대응 고충 |
|----------|-----------|-----------|
| `isaac-remote-mcp` | TCP 8226 소켓을 도구로: 씬 로드 / 스텝 실행 / 프레임 캡처 | P2 |
| `arena-container-mcp` | 동적 컨테이너명 해석 후 임의 명령 실행을 안전 도구로 노출 | P1 |

→ 솔직히 나는 아직 MCP를 제대로 써본 적이 없다. 이 프로젝트를 MCP **첫 실전**으로 삼는다. (책 뒤편 MCP 예제를 본 뒤 이 절을 보강)

### 4-4. 훅 — 결정론적 게이트 (이 기획의 핵심)

이벤트에 무조건 발화하는 결정론. **자동화하면 안 되는 중대 단계를 사람 대신 기계가 막는다.** ch2 핵심("반복은 열고 중대한 건 닫는다")이 가장 직접적으로 구현되는 곳.

| 훅 (PreToolUse / pre-commit) | 막는 것 | 근거 |
|------|---------|------|
| `block-force-push-main` | `main`/`release/*` 강제 푸시 차단 | Arena NEVER |
| `block-ai-attribution` | 커밋 메시지의 AI-attribution 라인 차단 (DCO `-s`만 허용) | Arena NEVER |
| `block-secret-commit` | 모델·데이터셋·시크릿 파일 스테이징 차단 | Arena NEVER |
| `warn-protected-paths` | `docker/`·`.github/workflows/`·`.pre-commit-config.yaml`·`submodules/` 수정 시 경고·확인 | Arena NEVER |
| `enforce-container-exec` | Isaac Sim/Arena 명령을 컨테이너 밖에서 직접 실행하려 하면 차단 | Arena P1 |

---

## 5. ch2 개념 연결

- **실행 주체와 컨텍스트**: 스킬·서브에이전트는 모델이 판단해 호출(자율), 훅은 이벤트에 무조건 발화(결정론), MCP는 그 둘이 닿을 외부 통로. 이 한 프로젝트에 셋이 다 들어간다.
- **권한 위임 게이트**: 반복·안전한 작업(스킬·서브에이전트로 자동 통과 = allow)과 되돌릴 수 없는 중대한 작업(훅으로 멈춤 = deny/ask)을 명시적으로 가른다. 이게 ch2에서 내가 강조하고 싶었던 "다 자동화하지도, 매번 멈추지도 않는" 설계의 실물.

---

## 6. MVP 단계 로드맵

1. **1단계 (효용 최대)**: `dev-container` 스킬 + 금지선 훅 4종. 컨테이너 래핑 자동화 + 사고 방지 게이트만으로도 일상 흐름이 크게 편해진다.
2. **2단계**: `sim-runner` 서브에이전트 + `isaac-remote-mcp`. 헤드리스 sim 구동·캡처를 위임.
3. **3단계**: `validation-triage`·`profiler` + diff-gif/Tracy 자동화. 회귀·성능 검증까지.

---

## 7. 성공 기준 / 검증

- **편의**: 일상 작업에서 사람이 누르는 "확인" 횟수가 줄어든다 (반복 게이트가 열림).
- **안전**: 시크릿/모델 커밋, main 강제 푸시 같은 중대 사고 0건 (중대 게이트가 닫힘).
- 이 두 지표를 **동시에** 만족하면 게이트 설계가 성공한 것 — 한쪽만 달성하면 과자동화 또는 과확인.

---

## 8. 리스크 & 오픈 퀘스천

- Isaac Sim 6.0 / IsaacLab-Arena(alpha, `v0.2.x`)는 API가 불안정 → 스킬 절차가 버전 따라 깨질 수 있음.
- MCP 미경험 → 8226 원격 프로토콜·컨테이너 권한 모델을 더 학습해야 함.
- 사내 적용 시 훅 게이트의 권한 범위(어디까지 차단할지)는 팀 합의 필요.
- diff-gif·Tracy 산출물 경로 등 레포 구조 세부는 실제 클론 후 재확인 필요.
