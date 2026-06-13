# 임정 — 2장 정리 (2026-06-13)

> 흐름: 읽기 → 개념정리 → 내 클로드 시스템에서 적용예시 파악 → 인사이트 포스팅

## 1. 일반적인 작업 패턴: 탐색 → 계획 → 구현 → 커밋

**개념정리**
- 탐색 단계의 주요 도구: Grep(내용 검색), Glob(파일 패턴 매칭). 탐색 중에는 읽기만 수행하고 수정하지 않는다.
- 계획을 먼저 합의한 뒤 구현에 들어가고, 논리적 단위마다 커밋으로 마무리한다.

**내 시스템 적용예시**
- `~/CLAUDE.md` General Rules에 "Always create a plan before jumping into implementation"을 명시해 계획 단계를 강제하고 있다. `/plan` 스킬이 계획서 작성과 승인 대기를 담당.
- 커밋 단계는 `/commit`(conventional commit), 세션 종료 시 `/session-wrap`(미커밋 변경 그룹핑 커밋 + 핸드오프 정리)으로 패턴화했다.
- `~/.claude/rules/behavior.md`의 "단계별 verify" 규칙이 구현과 커밋 사이에 검증 단계를 끼워 넣는다. 책의 4단계가 내 환경에서는 사실상 5단계(탐색 → 계획 → 구현 → **검증** → 커밋)로 운영된다.

## 2. TDD (테스트 주도 개발)

**개념정리**
- 레드: 구현할 기능의 예상 동작을 실패하는 테스트로 먼저 정의
- 그린: 테스트를 통과하기 위한 최소한의 코드 작성
- 리팩터: 통과 상태(기능)를 유지하면서 구조 개선, 중복 제거

**읽으며 생긴 질문과 내 결론**
- "Playwright로 확인하는 것도 레드 단계와 동일한가?" → 원리는 동일하다. 핵심은 "구현 전에 기대 동작을 실행 가능한 형태로 고정"하는 것이고, 단위 테스트든 Playwright E2E든 그 역할을 한다. 다만 E2E는 느리고 환경 의존이 커서, 책 기준의 빠른 레드-그린 루프에는 단위 테스트가 맞고 E2E는 마지막 동작 확인 층에 가깝다.

**내 시스템 적용예시**
- PostToolUse 훅: `.ts`/`.tsx` 파일을 수정할 때마다 `tsc --noEmit` 자동 실행. 모델이 잊어도 타입 회귀를 즉시 잡는 항상 켜진 그린 검증 장치.
- `/verify` 스킬 + Playwright MCP: 변경이 실제 앱에서 동작하는지 브라우저로 직접 확인하는 마지막 층.

## 3. 설정 관리: settings.json 우선순위

**개념정리** (높은 우선순위부터)
1. 관리자/엔터프라이즈 설정
2. 프로젝트 로컬 설정 `.claude/settings.local.json` (gitignore 대상, 개인 전용)
3. 프로젝트 설정 `.claude/settings.json` (팀 공유, 커밋 대상)
4. 사용자 설정 `~/.claude/settings.json` (모든 프로젝트 공통)

**내 시스템 적용예시**
- 사용자 레벨 `~/.claude/settings.json` 하나에 권한 allow/deny, 훅 4종, 플러그인, statusline을 모아 모든 프로젝트의 기본값으로 쓴다.
- 같은 레이어링이 instructions에도 있다: `~/CLAUDE.md`(전역) → `@import AGENT_GUIDE.md`(환경 SSOT) → 프로젝트 `CLAUDE.md`(override). 실전 포인트는 settings(권한·훅)와 instructions(CLAUDE.md)가 별개의 레이어 체계라는 것.

## 4. 도구 다섯 가지: 언제 쓰는가 / 어떻게 트리거되는가 / 장단점

> 요약 표 아래에 도구별로 내 시스템(`~/.claude/`)의 원본 스크립트·정의 파일을 직접 열어 확인한 실측 내용을 정리했다.

| 도구 | 언제 | 트리거 | 내 시스템 실측 |
|------|------|--------|----------------|
| 스킬 | 반복 절차를 모델이 따라 하게 할 때 | 슬래시 호출 또는 description 자동 매칭 | 글로벌 30여 개 + 프로젝트 스킬 2개 |
| 서브에이전트 | 컨텍스트 격리, 병렬 처리, 역할 분담 | description 매칭으로 모델이 위임 판단 | 5개, 전부 `model: sonnet` 지정 |
| MCP 서버 | 외부 시스템을 도구로 연결 | 등록 후 모델이 도구로 사용 | `notion` · `playwright` · `hermes-discord` |
| 훅 | 모델 판단과 무관하게 반드시 실행돼야 할 때 | 이벤트에 결정론적으로 발화 | 6개 이벤트에 8개 훅 |
| 플러그인 | 스킬+에이전트+훅 묶음을 배포·공유 | 설치·활성화 시 일괄 등록 | 활성 5개, 비활성 1개 |

### 4-1. 스킬 — 모델이 따라 하는 절차서

- **실측**: 글로벌 `~/.claude/skills/`에 30여 개(`commit`, `healthcheck`, `publish-gdocs`, `session-wrap`...) + 이 리포의 프로젝트 스킬 `order-session`, `study-chapter`.
- **트리거 2종**: 사용자가 `/이름`으로 명시 호출하거나, frontmatter의 `description`이 요청과 매칭되면 모델이 스스로 호출한다. 그래서 description은 기능 설명이 아니라 **"언제 불러야 하는가"를 적는 트리거 조건문**으로 쓴다.
- **안전장치**: push처럼 비가역 사이드이펙트가 있는 스킬은 `disable-model-invocation: true`로 자동 호출을 차단하고 슬래시 호출만 허용한다. `study-chapter`에도 적용했다.
- **장점**: 자연어 절차를 파일로 버전관리·리포 단위 공유 가능 (이 스터디 리포의 스킬은 멤버 모두가 쓸 수 있다). **단점**: 모델에게 "권고"일 뿐 강제력이 없다. 반드시 일어나야 하면 훅의 영역.

### 4-2. 서브에이전트 — 컨텍스트 격리와 역할 고정

- **실측**: `~/.claude/agents/`에 5개. `content-writer`(작업 사후 SNS 정리), `notion-editor`(Notion 일괄 편집), `infrastructure-setup`(배포·DNS·CI/CD), `web-crawling-specialist`(스크래핑), `security-incident-responder`(공급망 공격 대응).
- **모델 분리**: 5개 전부 frontmatter에 `model: sonnet`을 지정했다. 판단이 필요한 메인 루프는 상위 모델, 실행 위주 위임 작업은 Sonnet으로 나눠 토큰 비용을 관리하는 구조.
- **도구 제한이 곧 권한 설계**: `security-incident-responder`는 `tools: Read, Bash, WebFetch, WebSearch, Grep, Glob...`으로 도구를 제한하고, 정의문에 "출처불명 점검 명령은 절대 실행 안 함"을 명시했다. 5절 IAM이 에이전트 단위에서 반복되는 모양.
- **트리거**: description 매칭. `security-incident-responder`는 description에 "PROACTIVELY 호출"과 트리거 키워드("공급망 공격", "credential leak"...)를 직접 적어 모델이 선제 위임하게 했다.
- **장점**: 메인 컨텍스트 오염 방지, 병렬 실행. **단점**: 결과만 돌아오고 과정이 안 보인다. 실제로 "에이전트가 일했다고 보고했지만 파일 변경이 없는" 경우가 있어서, PostToolUse(Agent) 훅으로 `git status`를 찍어 검증한다(4-4 참고).

### 4-3. MCP 서버 — 외부 시스템을 도구로

- **실측 3개**: `notion`(페이지·DB CRUD), `playwright`(브라우저 조작, `/verify` 스킬의 실행 수단), `hermes-discord`(맥미니에서 도는 Hermes 에이전트를 ssh stdio로 연결한 Discord 메시징 브리지).
- `hermes-discord`가 보여주는 확장성: MCP 서버가 꼭 SaaS API일 필요가 없다. **원격 머신의 다른 AI 에이전트**도 stdio만 말하면 도구로 등록된다.
- **장점**: 표준 프로토콜이라 도구를 무한히 확장. **단점**: 등록된 도구 스키마가 컨텍스트를 상시 점유해 토큰 비용이 든다. 그래서 호출이 많은 Notion 작업은 `notion-editor` 서브에이전트로 감싸 MCP 호출을 메인 컨텍스트 밖으로 격리한다. 도구 둘을 조합해 서로의 단점을 메우는 패턴.

### 4-4. 훅 — 결정론적 강제 장치

실측: 6개 이벤트에 8개 훅. 원본 스크립트를 열어 확인한 동작:

| 이벤트 | 스크립트 | 하는 일 |
|--------|----------|---------|
| UserPromptSubmit | `business-mentor-nudge.sh` | 프롬프트에 사업 키워드(수주·견적·단가·계약...)가 보이면 additionalContext로 "yc-office-hours 스킬 호출을 검토하라"를 주입 |
| PreToolUse (Bash) | `precheck-auth.sh` | gws·Notion·Supabase·gh 명령 직전에 토큰 신선도 검사(10ms 미만). 경고만 출력하고 차단은 안 함(`exit 0`) |
| PostToolUse (Edit\|Write) | 인라인 | `.ts`/`.tsx` 수정 시 `npx tsc --noEmit` 자동 실행 |
| PostToolUse (Agent) | 인라인 | 서브에이전트 종료 직후 `git status --porcelain`으로 실제 파일 변경 여부를 검증, 변경 0건이면 "직접 Edit로 처리하라" 컨텍스트 주입 |
| Stop | 3개 async | Obsidian 세션 저장 + Google Calendar worklog 동기화 + 업무일지 생성 |
| Notification | 인라인 | macOS 알림(Glass 사운드) |

- **장점**: 모델이 잊든 판단을 다르게 하든 100% 실행된다. **단점**: 스크립트라서 미묘한 판단을 못 한다.
- 그 한계를 푸는 패턴이 `business-mentor-nudge.sh`에 있다: **키워드 grep은 1차 recall만 담당하고, "정말 사업 의사결정인가"의 최종 판단은 additionalContext를 받은 모델이 한다.** 훅(결정론)과 스킬(판단)의 분업.

### 4-5. 플러그인 — 묶음 배포 단위

- **실측**: 활성 5개 `supabase`, `code-review`, `hookify`, `feature-dev`(이상 claude-plugins-official), `codex`(openai-codex 마켓플레이스). `github` 플러그인은 설치 후 **비활성(false)** 상태.
- 플러그인 하나가 여러 도구를 함께 제공한다: `codex` 플러그인은 스킬(`codex:rescue`, `codex:setup`)과 서브에이전트(`codex:codex-rescue`)를 같이 등록한다. 도구 4종의 배포 컨테이너인 셈.
- **장점**: 남이 만든 스킬+에이전트+훅 세트를 한 번에 설치하고, 안 쓰면 플러그인 단위로 끄면 된다(github처럼). **단점**: 내부 구성을 내가 통제하지 못하므로 이름·트리거가 내 컨벤션과 어긋날 수 있다 (그래서 내 네이밍 규칙은 "공식 명칭은 변경하지 않는다, 자체 제작분만 적용"으로 예외를 둔다).

### 선택 기준과 조합

**한 줄 요약**: 모델이 판단해서 하면 좋은 것은 스킬, 무조건 일어나야 하는 것은 훅, 외부 시스템 연결은 MCP, 컨텍스트 격리·병렬은 서브에이전트, 묶어서 배포는 플러그인.

다만 실제 운영에서 다섯 도구는 택일이 아니라 **조합**이다. 내 시스템의 실례 세 가지:
1. 훅(`business-mentor-nudge`)이 스킬(`yc-office-hours`)을 트리거 — 결정론적 감지 + 모델 판단
2. 서브에이전트(`notion-editor`)가 MCP(`notion`)를 감쌈 — 토큰 비용 격리
3. 훅(PostToolUse Agent)이 서브에이전트의 결과를 검증 — 위임의 안전망

## 5. IAM (권한 관리)

**개념정리**
- 에이전트에게 무엇을 허용(allow)하고 무엇을 거부(deny)할지 선언하는 권한 체계. permissions의 allow/deny/ask 리스트와 permission mode로 구성된다.

**내 시스템 적용예시**
- deny 21건: `rm -rf`, `sudo`, `git push --force`, `git reset --hard`, `DROP TABLE`, 토큰 export 류를 전부 차단. 에이전트 자율성을 올리기 전의 안전판.
- allow에는 읽기성·일상 명령(git, npm, grep, ls...)을 폭넓게 등록해 권한 프롬프트를 줄였다. `/fewer-permission-prompts` 스킬로 트랜스크립트를 분석해 allowlist를 데이터 기반으로 갱신.
- 인사이트: 자율 에이전트 운영의 순서는 "권한 설계 먼저, 자율성은 그다음". deny가 단단할수록 allow를 과감하게 넓힐 수 있다.

---

**이번 주 발표용 핵심 개념 1개 (선택)**: 4번 도구 다섯 가지, '트리거 3종' 프레임. 5요소를 호출 방식으로 묶으면 ① 모델 자율 호출 ② 이벤트 결정론 ③ 컨테이너로 환원되고, 내 훅·에이전트·MCP 실측이 이 프레임에 그대로 대입돼 발표 사례가 가장 풍부하다. (처음 골랐던 IAM 발표안은 [archive-iam-발표안.md](archive-iam-발표안.md)로 보존)
