# 문종운 — 2장 정리 (워크플로와 설정 · 2026-06-13)

> 흐름: 탐색→계획→구현→커밋 루프를 설정(settings.json)·권한(IAM)·모델 티어·git worktree로 **단단하게 무장**할수록, AI가 더 멀리 자율적으로 달릴 수 있다.

> 슬라이드로 보기: [slides.html](./slides.html)

---

## 1. 워크플로: 탐색–계획–구현–커밋

### 개념 정리

클로드 코드가 권장하는 기본 작업 사이클은 네 단계다.

1. **탐색(Explore)** — 코드베이스·맥락을 읽는다.
2. **계획(Plan)** — 무엇을 어떻게 바꿀지 계획을 세운다.
3. **구현(Implement)** — 실제로 코드를 수정한다.
4. **커밋(Commit)** — 검증 후 변경을 저장한다.

`Shift-Tab`으로 수행 모드를 순환할 수 있다:

| 모드 | 설명 | 언제 쓰면 좋은가 |
|------|------|-----------------|
| **기본(Default)** | 매 도구 사용마다 허가 요청 | 처음 써보는 코드베이스, 신중한 작업 |
| **Plan Mode** | 계획만 수립하고 실행하지 않음 | 구현 전 설계 확인, 위험 작업 사전 검토 |
| **Accept Edits** | 파일 편집 자동 승인 | 반복적 구현 작업, 신뢰된 환경 |
| **Auto Mode** | 모든 도구 자동 승인 | 완전히 신뢰된 격리 환경, 대량 자동화 |

### 내 시스템 적용 예시

내 `/team` 하네스는 이 네 단계를 **Phase**로 구조화했다:
`Plan → Design → Implement → Review → Complete`

`/team plan`만 호출하면 "계획" 단계만 실행하도록 분리해 둔 것도 같은 원리다. 복잡한 작업은 Plan 단계에서 수동으로 검토한 뒤 `/team build`로 넘어간다.

---

## 2. 점진적 탐색으로 컨텍스트 절약

### 개념 정리

탐색 범위가 넓을 때 "전체를 다 읽고 시작하자"는 접근은 컨텍스트를 낭비한다. 대신 **단계적으로 좁히는(progressive narrowing)** 방식을 쓴다:

1. 디렉토리 구조만 먼저 확인 (Glob/LS)
2. 관련 파일 목록 추려내기 (Grep)
3. 그 중 정말 필요한 파일의 관련 섹션만 읽기 (Read)

각 단계에서 "더 읽을 필요가 있는가?"를 판단하므로, **불필요한 파일 전체 읽기가 사라진다.** 이것이 컨텍스트 절약의 핵심 원리다.

> **읽으며 생긴 질문 / 내 결론**
> "탐색 범위를 쪼개면 컨텍스트가 왜 줄어드는가?"에 대한 내 이해:
> 탐색 흐름이 짧아지는 게 아니라, **읽어야 하는 파일 자체가 줄어드는** 것이다. 전체를 읽으면 관련 없는 파일의 내용이 모두 컨텍스트에 누적되지만, 단계적으로 필요한 부분만 열면 토큰 소모가 그만큼 줄어든다.

### 내 시스템 적용 예시

`/team` 하네스에서 `code-map.md`를 중간 허브로 활용한다. 에이전트는 파일 전체를 직접 읽는 대신, code-map에 이미 정리된 경로 목록을 먼저 보고 필요한 파일만 선택적으로 `Read`한다. architect 에이전트(`.claude/agents/architect.md`)가 대표적: `Read, Glob, Grep` 세 도구만 허용하고, code-map을 거쳐 탐색 범위를 좁힌다.

---

## 3. 피드백 루프와 검증 — 클로드 코드 vs Fable

### 개념 정리

| 항목 | 클로드 코드(Claude Code) | Fable |
|------|------------------------|-------|
| 검증 철학 | 피드백 루프로 **검증을 견고화** | **선택지를 열어두고** 제약 최소화 |
| 권장 방향 | 테스트·린트·빌드 자동화로 검증 강화 | 검증보다 유연성 우선 |
| 실험 가능성 | 현재 주요 CLI | Fable 5 확인 가능하나 정책 변동 이력 있음 |
| 적합한 상황 | 안정성이 중요한 프로덕션 워크플로 | 탐색적·실험적 워크플로 |

> **미확인**: Fable의 "지원 중단" 여부는 스터디 메모에서 언급됐지만, Fable 5 기준 현재 사용 가능하다. 지원 정책 변동 이력이 있으므로 실험 시 최신 상태 확인 필요.

"검증을 견고하게 한다"는 것의 실질적 의미: 테스트 실패→수정→재실행 루프를 에이전트가 자동으로 돌도록 만드는 것이다. 이 루프가 촘촘할수록 에이전트에게 더 많은 작업을 맡길 수 있다.

### 내 시스템 적용 예시

글로벌 `CLAUDE.md`에 명시된 품질 게이트:
```
Test(gradlew/npm test) · Type/Lint(ktlint/typecheck+lint) · Build · EARS 인수기준 충족 · 추적성(Issue/SPEC-ID)
```
이것이 피드백 루프의 검증 기준이다. developer 에이전트(`~/.claude/agents/developer.md`)는 구현 직후 빌드·테스트·린트를 **반드시 자체 실행**하도록 정의돼 있고, 실패하면 일괄 수정 후 재실행한다. 사람이 개입하기 전에 루프가 한 번 더 돈다.

---

## 4. TDD와 에이전틱

### 개념 정리

TDD(Test-Driven Development)는 **실패하는 테스트 작성 → 테스트 통과 → 리팩토링** 순서로 개발하는 방법론이다.

에이전틱 환경에서 TDD가 특히 효과적인 이유:
- 테스트 케이스가 **에이전트에게 검증 케이스를 명시적으로 전달하는 수단**이 된다.
- "통과해야 할 조건"이 코드로 구체화되므로, 에이전트가 애매한 자연어 요구사항 대신 **기계적으로 검증 가능한 목표**를 가진다.
- RED(실패) 상태가 "아직 구현이 부족하다"는 신호를 자동으로 준다.

### 내 시스템 적용 예시

developer 에이전트의 Implementation Workflow(`.claude/agents/developer.md`):
```
1. 테스트 먼저 작성 (인수 조건 기반 TDD)
2. 코드 구현
3. 빌드 + 테스트 + 린트 실행
4. 결과 분석, 실패 시 일괄 수정
5. 다음 단계로 진행
```
PRD의 인수 조건(AC)이 그대로 테스트 케이스로 내려온다. `/team` 파이프라인이 TDD를 구조적으로 강제하는 구조다.

---

## 5. git worktree 병렬 작업

### 개념 정리

**미사용 vs 사용 비교**:

| 항목 | worktree 미사용 | worktree 사용 |
|------|----------------|--------------|
| 작업 디렉토리 | 1개(공유) | 작업마다 독립 디렉토리 |
| 파일 충돌 | 에이전트가 동일 파일 동시 수정 → 즉시 충돌 | 디렉토리 격리로 동시 수정 가능 |
| Git remote | 동일 | 동일(같은 remote를 바라봄) |
| 병렬 처리 | 사실상 불가 | 가능 |
| 최종 merge | 단순 | conflict 발생 가능성 있음 |
| 적합 상황 | 단일 순차 작업 | 독립적인 기능 단위 병렬 개발 |

> **읽으며 생긴 질문 / 내 결론**
> "worktree를 쓴다고 충돌이 없어지는가?" — 아니다. 디렉토리를 격리해서 **개발 중에는** 충돌이 없지만, PR로 합칠 때 conflict는 여전히 발생할 수 있다.
> 그래서 핵심은 **atomic 단위 분할**: 인간 개발자가 PR 범위를 줄여 충돌을 줄이듯, 에이전틱 병렬 작업도 각 worktree의 작업 범위를 최대한 겹치지 않게 설계해야 한다.

### 내 시스템 적용 예시

`/team sprint`, `/team work #N`이 바로 이 아이디어를 구현한 명령이다. architect 에이전트가 설계를 독립 작업 단위(Issue)로 분할하고(`arch.md`의 Sprint 모드 참조), 각 작업이 별도 worktree에서 병렬로 실행될 수 있도록 설계됐다. `maker-worktree` 스킬이 생성·정리를 담당한다.

---

## 6. settings.json — 권한·훅·스코프

### 개념 정리

`settings.json`은 CLAUDE.md와 동일한 스코프 계층을 가진다:

```
글로벌(~/.claude/settings.json) < 프로젝트(.claude/settings.json) < 로컬(settings.local.json)
```

프로젝트 `settings.json`은 팀원과 공유되므로, **팀 공통 권한 기준선**이 된다.

**permissions 3단계**:

| 레벨 | 동작 | 사용 예시 |
|------|------|----------|
| **deny** | 묻지 않고 차단 | `rm -rf *`, `git push --force` 등 파괴적 명령 |
| **ask** | 매번 허가 요청 | 새로운 패키지 설치, 외부 API 호출 등 |
| **allow** | 묻지 않고 허용 | 빌드·테스트·린트 등 반복적인 안전 명령 |

**includeCoAuthoredBy**: `false`로 설정하면 커밋 메시지 하단의 `Co-Authored-By: Claude` 행이 자동 생략된다. 커밋 이력 관리를 선호에 맞게 조정할 수 있다.

**hooks**: 특정 이벤트(PreToolUse, PostToolUse, Stop, SessionStart 등)에 셸 스크립트를 연결한다. 이것이 검증을 **자동화된 게이트**로 만드는 핵심 수단이다.

### 내 시스템 적용 예시

내 `~/.claude/settings.json`에서 확인된 실제 설정:

```json
// permissions
"allow": ["mcp__pencil"]  // pencil MCP는 묻지 않고 허용

// hooks (4종 등록)
"PreToolUse": Grep|Glob|Read|Search → cbm-code-discovery-gate (코드 탐색 게이트)
"Stop": notify-stop.sh (작업 완료 시 알림)
"SessionStart": tmux-auto-rename.sh (세션 시작 시 tmux 이름 자동 지정)
"Notification": notify-permission.sh (권한 요청 알림)
```

deny 규칙은 글로벌 settings.json에 별도로 등재되지 않은 대신(현재 확인 시점 기준), CLAUDE.md 레벨에서 "절대 건드리지 마라"는 지시로 대체돼 있다. 파괴적 명령의 deny 처리는 프로젝트별 settings.json으로 추가하는 것이 이상적인 방향이다.

---

## 7. IAM·권한 관리

### 개념 정리

IAM(Identity and Access Management): 에이전트가 **무엇을 할 수 있는가**를 명시적으로 정의하고 제한하는 개념이다.

클로드 코드 환경에서 권한을 제대로 설정하지 않으면, 에이전트는 접근 가능한 모든 시스템에 대해 모든 명령을 수행할 수 있는 상태가 된다. 실제 사례:
- DB MCP를 연결한 상태에서 권한 미설정 → 에이전트가 테이블 전체 삭제(all drop)

> **정정**: 메모에서 `--permissions-skip`이라고 통칭했지만, 정확한 플래그 이름은 `--dangerously-skip-permissions`다. 이름 그대로 위험하다. `claude -p`(비대화형 세션)에서 권한 확인 없이 실행하기 위해 쓸 수 있지만, 이 상태에서는 위의 DB 사례 같은 사고가 발생할 수 있다. **신뢰된 격리 환경에서만** 사용할 것.

※ 이번 챕터에서 임정이 IAM을 발표 핵심 개념으로 선택했으므로, 개념 정리는 여기서 마친다.

---

## 8. 모델 선택 (opus / sonnet / haiku)

### 개념 정리

| 모델 | 강점 | 적합 역할 | 비용·속도 |
|------|------|-----------|----------|
| **opus** | 복잡한 추론, 판단, 설계 | 의사결정·아키텍처 | 높은 비용, 느림 |
| **sonnet** | 범용 구현, 탐색 | 코드 작성·실행 | 중간 |
| **haiku** | 단순 반복 작업, 패턴 스캔 | 간단 탐색·스캔 | 낮은 비용, 빠름 |

> **정정**: 원본 메모에서 "sonnet은 탐색에 용이하고, haiku는 단순 구현에 용이"라고 했으나, 내 시스템(CLAUDE.md)의 실제 모델 전략은 다음과 같다:
> - **판단(opus)**: product-owner, architect, zero-trust-advisor, designer
> - **실행(sonnet)**: developer, qa-manager, devops
> - **탐색(haiku)**: ux-reviewer, claude-doctor
>
> 즉 "탐색 = haiku", "실행 = sonnet", "판단 = opus"가 정확한 구분이다. sonnet은 탐색보다 **실행**에 배치되며, haiku는 단순 구현보다 **빠른 패턴 스캔(탐색)**에 적합하다.

모델은 에이전트 정의 파일의 frontmatter에 지정한다:

```
~/.claude/agents/<name>.md (에이전트)
frontmatter: model: opus | sonnet | haiku

스킬의 경우:
.claude/skills/<name>/SKILL.md
frontmatter: model: ...
```

> **정정**: 메모에서 "AGENTS.md"를 모델 정의 위치로 언급했지만, 이 시스템의 정본은 `~/.claude/agents/*.md` 개별 파일 frontmatter다. `AGENTS.md`는 일부 도구의 별도 관례이며 여기서는 사용하지 않는다.

### 내 시스템 적용 예시

실제 에이전트 파일 frontmatter에서 직접 확인한 모델 설정:

| 에이전트 파일 | model | tools |
|-------------|-------|-------|
| `developer.md` | sonnet | Read, Write, Edit, Glob, Grep, Bash |
| `qa-manager.md` | sonnet | Read, Glob, Grep, Bash |
| `devops.md` | (sonnet, 실행 tier) | — |
| `architect.md` | opus | Read, Glob, Grep |
| `product-owner.md` | opus | Read, Glob, Grep |
| `ux-reviewer.md` | haiku | Read, Glob, Grep |
| `claude-doctor.md` | haiku | Read, Glob, Grep |

CLAUDE.md의 "판단=opus / 실행=sonnet / 탐색=haiku" 전략이 에이전트 파일 frontmatter에 그대로 구현돼 있다.

---

## 9. 에이전트별 도구 제한

### 개념 정리

에이전트에게 **필요한 도구만** 허용하면, 불필요한 작업을 구조적으로 차단할 수 있다. 이것 역시 IAM의 연장선이다.

예시: 탐색 전용 에이전트(Explorer)를 만든다면 `Read, Glob, Grep`만 허용하면 충분하다. `Write`를 추가하지 않으면 에이전트는 **파일을 수정하고 싶어도 수정할 수 없다**.

도구 제한의 두 가지 효과:
1. **안전성**: 실수로 파일을 덮어쓰는 사고 방지
2. **명확성**: 에이전트의 역할과 책임이 tools 목록에서 바로 드러남

### 내 시스템 적용 예시

내 에이전트 계층의 도구 제한 실측:

| 에이전트 | 쓰기(Write/Edit) | Bash | 역할 |
|---------|----------------|------|------|
| developer | 허용 | 허용(빌드·테스트·린트만) | 유일한 쓰기 권한 보유자 |
| qa-manager | 금지 | 허용(테스트 실행만) | 읽고 검증만 |
| architect | 금지 | 금지 | 읽고 설계만 |
| product-owner | 금지 | 금지 | 읽고 판단만 |
| ux-reviewer | 금지 | 금지 | 읽고 스캔만 |
| claude-doctor | 금지 | 금지 | 읽고 진단만 |

developer 에이전트가 "유일하게 쓰기 권한을 보유"한다고 파일에 명시돼 있다. 또한 Bash도 "빌드, 테스트, 린트 실행만" 허용되며 "파일 삭제, 패키지 설치, 네트워크 요청, eval"은 명시적으로 금지된다. 도구 제한이 에이전트 정의 파일 안에서 텍스트로 구현돼 있는 구조다.

---

## 이번 주 발표용 핵심 개념 1개 선택

**선택: git worktree 병렬 작업 + atomic 단위 분할**

**선택 이유**: IAM(권한 관리)은 임정이 이미 고른 주제다. 그 다음으로 내가 2장을 읽으며 가장 "아, 이거였구나" 했던 개념이 worktree다.

인간 개발자도 PR 범위를 줄여 충돌을 줄이는데, 에이전틱 병렬 작업도 정확히 같은 원리로 작업 단위를 설계해야 한다는 점이 인상적이었다. "AI를 쓴다고 충돌 문제가 사라지는 게 아니라, 오히려 병렬 실행이 늘어나는 만큼 더 꼼꼼하게 단위를 쪼개야 한다"는 것이 메시지다.

내 `/team sprint` 하네스에서 architect가 설계를 독립 Issue로 분할하는 것이 바로 이 atomic 단위 분할의 구현이며, 여기에 worktree를 결합하면 병렬 개발의 충돌 위험을 최소화할 수 있다. 실제로 `/team work #N`으로 이를 실험 중이기도 하다.
