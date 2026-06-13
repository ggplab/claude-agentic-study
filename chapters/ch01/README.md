# CHAPTER 01 — 소개

> 에이전틱 코딩의 개념과 클로드 코드의 작동 원리(에이전틱 루프), 컨텍스트 관리·스킬·계층 구조 입문.

**리드**: 문종운

> 🖥️ 슬라이드로 보기: [slides.html](./slides.html)

## 📖 리드 핵심 요약 (문종운)

### 1. 에이전틱 코딩이란

- 클로드 코드는 AI가 **파일 시스템 탐색 · 코드 수정 · 테스트 실행까지 자율로 수행**하도록 하는 접근 방식을 만들어냈다. 이를 **에이전틱 코딩**이라 한다.
- 공식 문서는 크게 **탐색 → 계획 → 구현 → 커밋** 워크플로로 정의한다.
- 에이전틱 AI는 이전의 "사용자 질문에 답변하는 수준"을 벗어나, **스스로 문제를 분석하고 도구를 자율적으로 활용**한다는 점에서 크게 다르다.

### 2. 에이전틱 루프

- 클로드 코드는 **에이전틱 루프**라는 순환 구조로 작동한다.
- 컨텍스트를 지속적으로 수집 → 작업 수행 → 결과 확인 → 문제가 있으면 다시 처음으로 → 반복.

### 3. 작업 도구 (Tools)

- 도구: `Read`, `Write`, `Edit`, `MultiEdit`, `Glob`, `Grep`, `Bash`, `WebFetch`, `WebSearch` + 다수의 보조 도구.
- 성격별로 묶으면 다음과 같다:
  - **읽기**: Read
  - **편집**: Write, Edit, MultiEdit
  - **탐색/검색**: Glob(파일 패턴 매칭), Grep(내용 검색)
  - **실행**: Bash
  - **웹**: WebFetch, WebSearch

> **정정**: 원문에는 "크게 네 가지로 나뉜다"고 적었으나, 위 9종 도구를 성격별로 묶으면 5개 범주가 된다(읽기·편집·탐색/검색·실행·웹). 개수보다 "성격별 분류"가 핵심.

### 4. 컨텍스트 윈도우

- 클로드가 한 번의 추론에서 참조할 수 있는 **토큰 총량**.
- 기본 **20만(200K)** 토큰 처리, 모델·요금제에 따라 **1M 토큰**까지 가능.
- 많이 가진다고 품질이 비례하지는 않는다 — 연구상 **80% 이상 사용하면 답변 품질이 떨어지는 이슈**(컨텍스트 로트)가 있다.
- 최근 **Fable 모델**이 이 부분을 어느 정도 해소했다고 한다.

> **미확인**: 스터디 중 "Fable 모델이 미국 정부 요청에 따라 잠시 fade out 되었다"는 이야기가 나왔으나, 확인되지 않은 정보다(작성 환경 기준 Fable 5는 현재 사용 가능). 아카이브에는 "미확인"으로 남긴다.

### 5. 컨텍스트 관리 5대 전략

**컴팩션 · 클리어 · 점진적 공개 · 서브에이전트 활용 · 구조화된 메모 작성**

#### 5-1. 컴팩션(Compaction)
- 대화 내용을 **요약**한다.
- 단, 요약이므로 모든 컨텍스트를 보존하지 못한다 → **유실 가능성**을 기억할 것.

#### 5-2. 클리어(Clear)
- 지금까지의 대화 내용을 버리고 **새 컨텍스트에서 다시 시작**한다.
- 지금까지 한 내용이 잘못됐다고 판단되면, 컨텍스트를 비우고 새로 시작하는 편이 더 높은 품질을 가져온다.
- 같은 맥락으로 **`Memory.md`도 관리**해야 한다. 과거의 잘못된 지식이 남아 있으면 클로드는 계속 잘못된 지식으로 수행한다. 적절히 정리하자.

#### 5-3. 점진적 공개(Progressive Disclosure) — **가장 중요**
- 모든 내용을 다 읽으면 토큰을 지나치게 많이 쓴다.
- 클로드는 파일에 **frontmatter(가벼운 요약)** 를 작성해 둔다. 요약을 보고, **읽어야 하는 순간에만 해당 파일 본문을 읽는다.** 읽을 필요가 없으면 본문을 전부 읽지 않는다.

#### 5-4. 서브에이전트 활용
- 에이전트와 **독립된 컨텍스트**를 활용한다. **병렬**로 여러 작업 수행 가능.
- 단, 개별 컨텍스트라 **서브에이전트끼리 컨텍스트를 공유할 수 없다.**
- 그래서 병렬 설계 시 **모두가 공통으로 읽을 메모 파일**을 활용해 컨텍스트를 관리하는 것이 한 방법이다.
- 동시에 같은 파일을 읽고/쓰면 **동시성(같이 쓰기) 이슈**가 발생할 수 있다 → 한 파일을 누군가 쓰기 위해 점유 중이면 **쓰지 않고 기다리도록** 조치하는 것이 중요.
- 이를 위해 **메모 쓰기 스킬에 lock 지원을 보완**하는 것이 중요하다.

#### 5-5. 구조화된 메모 작성
- 위 점진적 공개 + 서브에이전트 공통 메모와 연결되는 전략. 메모를 구조화해 두면 재참조·공유 비용이 줄어든다.

### 6. 스킬 프론트매터(frontmatter) 필드

> 프론트매터를 별도 파일로 정의하지 않으면 **존재하지 않는 argument를 잘못 사용**할 수 있다. 꼭 **global 파일로 저장**해 사용하는 것이 중요하다.

| Field | Required | Description |
|-------|----------|-------------|
| name | No | Display name shown in skill listings. Defaults to the directory name. |
| description | Recommended | What the skill does and when to use it. Claude uses this to decide when to apply the skill. If omitted, uses the first paragraph of markdown content. Put the key use case first: the combined description and when_to_use text is truncated at 1,536 characters in the skill listing to reduce context usage. |
| when_to_use | No | Additional context for when Claude should invoke the skill, such as trigger phrases or example requests. Appended to description in the skill listing and counts toward the 1,536-character cap. |
| argument-hint | No | Hint shown during autocomplete to indicate expected arguments. Example: `[issue-number]` or `[filename] [format]`. |
| arguments | No | Named positional arguments for `$name` substitution in the skill content. Accepts a space-separated string or a YAML list. |
| disable-model-invocation | No | Set to true to prevent Claude from automatically loading this skill. Also prevents the skill from being preloaded into subagents. Default: false. |
| user-invocable | No | Set to false to hide from the `/` menu. Use for background knowledge users shouldn't invoke directly. Default: true. |
| allowed-tools | No | Tools Claude can use without asking permission when this skill is active. |
| disallowed-tools | No | Tools removed from Claude's available pool while this skill is active. The restriction clears when you send your next message. |
| model | No | Model to use when this skill is active. The override applies for the rest of the current turn. Accepts the same values as `/model`, or `inherit` to keep the active model. |
| effort | No | Effort level when this skill is active. Overrides the session effort level. Options: low, medium, high, xhigh, max. |
| context | No | Set to `fork` to run in a forked subagent context. |
| agent | No | Which subagent type to use when `context: fork` is set. |
| hooks | No | Hooks scoped to this skill's lifecycle. |
| paths | No | Glob patterns that limit when this skill is activated. When set, Claude loads the skill automatically only when working with files matching the patterns. |
| shell | No | Shell to use for `!command` blocks in this skill. Accepts bash (default) or powershell. |

### 7. 클로드 코드 구성요소

- 구성: **commands, agents, skills, hooks, output-styles, settings.json**.
- **commands는 deprecated** — 클로드는 commands를 더 이상 쓰지 않고 **skills로 통합**한다고 선언했다.
- 특히 **skills 자체에서 agent와 hook을 별도로 지정 가능**하므로, 패키지 구조를 **스킬 내에서 별도 스킬을 지정할 때 재활용**할 수 있다.

### 8. 비대화형 세션

- `claude -p`, Claude SDK 등으로 **비대화형 세션**을 열 수 있다.
- 단, 비대화형 진행 중 **권한에 부딪히면 응답하지 않고 멈춘 상태로 계속 대기**한다(권한 관리의 한계).
- 그래서 `claude -p` 등을 쓴다면 권한 스킵용 **`--dangerously-skip-permissions`** 를 쓸 수 있다. (플래그 이름대로 위험 — 신뢰된 환경/격리 환경에서만.)

### 9. rewind (체크포인트)

- `rewind` 옵션으로 **체크포인트로 이동** 가능. 메시지를 잘못 입력했을 때 체크포인트로 되돌려 컨텍스트를 초기화하는 데 유용.
- 단, 체크포인트는 **해당 대화가 마무리될 때 갱신**된다.
- 체크포인트는 클로드의 **Edit, Write 작업만 기록**한다 → **Bash 셸, API 호출 등으로 인한 변경은 되돌릴 수 없다.**

### 10. 지시 계층 구조(CLAUDE.md)

- 클로드는 3계층 구조로 컨텍스트를 읽으며, **읽는 순서대로 뒤가 앞을 overwrite**한다:
  1. `${HOME}/.claude/**` — **글로벌**. 가장 먼저 읽는다.
  2. `<project>/.claude/**` — **프로젝트**.
  3. `CLAUDE.local.md` — **마지막**.
- 글로벌에서 "하지 마라"고 해도 `CLAUDE.local.md`에서 "하라!"고 하면 **수행**한다(뒤가 앞을 덮으므로).
- 따라서 **절대 하면 안 되는 것·변하지 않을 것은 GLOBAL에** 세팅하고, 나머지는 유연하게 세팅한다.

---

## 🎯 각자 고른 핵심 개념 1개

> 서로 다른 개념을 고릅니다. 회차 시작 때 교통정리.

### <이름> — <고른 개념>
- **내용 리마인드**: (그 개념이 뭔지 한두 줄)
- **나에게 어떤 의미였나**: (내 작업/프로젝트에 어떻게 쓸지 — 본인 경험)
- **LinkedIn**: (발행 후 링크)

### <이름> — <고른 개념>
- **내용 리마인드**:
- **나에게 어떤 의미였나**:
- **LinkedIn**:

## 🧱 시행착오 & 막힌 점 (공용)
-

## 💬 회고 한 줄
-
