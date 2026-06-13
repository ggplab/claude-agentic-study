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

| 도구 | 언제 | 트리거 | 내 시스템 실측 |
|------|------|--------|----------------|
| 스킬 | 반복 절차를 모델이 따라 하게 할 때 | 슬래시 호출 또는 description 자동 매칭 | 30여 개 (`commit`, `healthcheck`, `publish-gdocs`...) + 이 리포의 `order-session` |
| 서브에이전트 | 컨텍스트 격리, 병렬 처리, 역할 분담 | 모델이 위임 판단 또는 명시 호출 | 5개 (`content-writer`, `notion-editor`, `web-crawling-specialist` 등) |
| MCP 서버 | 외부 시스템을 도구로 연결 | 등록 후 모델이 도구로 사용 | Notion, Playwright, Discord 브리지(hermes) |
| 훅 | 모델 판단과 무관하게 반드시 실행돼야 할 때 | 이벤트에 결정론적으로 발화 | UserPromptSubmit(넛지), PreToolUse(인증 점검), PostToolUse(tsc), Stop(Obsidian 저장 + 캘린더 동기화) |
| 플러그인 | 스킬+에이전트+훅 묶음을 배포·공유 | 설치 시 일괄 등록 | `codex`, `supabase`, `code-review`, `hookify`, `feature-dev` |

**선택 기준 한 줄 요약**: 모델이 판단해서 하면 좋은 것은 스킬, 무조건 일어나야 하는 것은 훅, 외부 시스템 연결은 MCP, 컨텍스트 격리·병렬은 서브에이전트, 묶어서 배포는 플러그인.

## 5. IAM (권한 관리)

**개념정리**
- 에이전트에게 무엇을 허용(allow)하고 무엇을 거부(deny)할지 선언하는 권한 체계. permissions의 allow/deny/ask 리스트와 permission mode로 구성된다.

**내 시스템 적용예시**
- deny 21건: `rm -rf`, `sudo`, `git push --force`, `git reset --hard`, `DROP TABLE`, 토큰 export 류를 전부 차단. 에이전트 자율성을 올리기 전의 안전판.
- allow에는 읽기성·일상 명령(git, npm, grep, ls...)을 폭넓게 등록해 권한 프롬프트를 줄였다. `/fewer-permission-prompts` 스킬로 트랜스크립트를 분석해 allowlist를 데이터 기반으로 갱신.
- 인사이트: 자율 에이전트 운영의 순서는 "권한 설계 먼저, 자율성은 그다음". deny가 단단할수록 allow를 과감하게 넓힐 수 있다.

---

**이번 주 발표용 핵심 개념 1개 (선택)**: 5번 IAM. 다들 도구 다섯 가지나 TDD를 고를 가능성이 높고, 권한 설계는 내 deny/allow 실측 사례가 가장 진하게 쌓여 있는 영역이라서.
