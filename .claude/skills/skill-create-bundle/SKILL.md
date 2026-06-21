---
name: skill-create-bundle
description: '새 스킬을 처음 만들 때 생성→검수→평가(eval dry-run)를 하나로 묶어 실행하는 파이프라인. 사용자가 "스킬 만들어줘", "새 스킬 제작", "create a skill", "SKILL.md 만들어줘", "스킬 초안 작성"이라고 할 때 사용한다. 기존 스킬 단순 수정·삭제에는 쓰지 않는다. Anthropic 공식 skill-creator 로 스킬을 생성하고, plugin-dev 의 skill-reviewer 에이전트로 품질을 검수하며(references/FRONTMATTER.md 기준으로 model·allowed-tools 포함), eval dry-run 으로 트리거 적합성을 평가한다. 사전 게이트 훅이 의존성(skill-creator·plugin-dev·skill-reviewer)을 결정론적으로 검증한다.'
argument-hint: [만들 스킬 설명]
model: inherit
allowed-tools: Read, Grep, Glob
hooks:
  PreToolUse:
    - matcher: "*"
      hooks:
        - type: command
          command: bash "${CLAUDE_PROJECT_DIR}/.claude/skills/skill-create-bundle/scripts/preflight-gate.sh"
  PostToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: bash "${CLAUDE_PROJECT_DIR}/.claude/skills/skill-create-bundle/scripts/frontmatter-gate.sh"
---

# skill-create-bundle — 스킬 생성·검수·평가 파이프라인

새 스킬을 만들 때 **생성(skill-creator) → 검수(skill-reviewer) → 평가(eval dry-run)** 를 하나로 묶어 실행한다.
사람은 "어떤 스킬을, 어떤 기준으로 만들지"를 정하고, 이 파이프라인이 생성·검증·평가를 수행한다.

## 입력
- 만들 스킬의 설명·요구사항: `$ARGUMENTS`. 비어 있으면 "어떤 스킬을 만들까요? 무엇을, 언제 하도록 할지 알려주세요"라고 묻고 대기한다.

## 자동 게이트 (훅이 결정론적으로 강제 — 모델이 건너뛸 수 없음)

이 스킬이 활성인 동안 두 훅이 자동으로 동작한다. 본문에서 따로 호출하지 않는다.

1. **사전 의존성 게이트** — `scripts/preflight-gate.sh` (PreToolUse). 도구 사용 직전에
   - (3-1) `skill-creator` 설치 여부
   - (3-2) `plugin-dev` 설치 + `agents/skill-reviewer.md` 존재
   를 검사한다. 누락 시 마켓플레이스에서 설치를 시도하고, 도구 사용을 막으며(deny) 사유로 `/reload-plugins` 를 요구한다.
   → **게이트가 reload 를 요구하면, 대화에서 `/reload-plugins` 를 실행한 뒤 작업을 다시 시도하라.** 이 단계만 모델이 수행한다(훅은 슬래시 명령을 직접 트리거할 수 없다).

2. **프론트매터 검수 게이트** — `scripts/frontmatter-gate.sh` (PostToolUse, Write·Edit). SKILL.md 가 쓰일 때마다 `model:` 과 `allowed-tools:` 키 존재를 검사한다. 누락 시 경고를 주입한다 → 경고를 받으면 **사용자에게 model 선택과 allowed-tools 최소권한을 확인한 뒤 보완**하라(fallback ask).

> **PreToolUse matcher 가 `*` 인 이유**: 게이트는 skill-creator(`Skill` 도구)·skill-reviewer(`Task` 도구) 호출 직전에 떠야 의미가 있다. 특정 도구로 좁히면 정작 의존성이 필요한 그 경로를 놓치므로, 모든 도구 직전에 멱등하게 검사한다(통과 시 `claude plugin list` 1회뿐).

## 권한 설계 (allowed-tools)

`allowed-tools` 는 읽기 전용(`Read, Grep, Glob`)만 승인 없이 허용한다. **Write·Edit·Bash·Skill·Task 는 의도적으로 제외** — 스킬 생성·파일 수정·`claude plugin install`·`/reload-plugins`·서브에이전트 검수 같은 변경/실행 작업은 항상 사용자 승인을 거치게 한다(최소권한). `model: inherit` 역시 의도적 선택이다(오케스트레이터라 세션 모델을 그대로 위임). 이 두 결정은 프론트매터 검수 게이트가 점검하는 항목과 동일한 기준을 자기 자신에도 적용한 것이다.

## 절차 — 순서대로 실행

### 1. 스킬 생성 (skill-creator)
`skill-creator` 스킬로 사용자의 요구대로 스킬 초안을 만든다. 요구사항(무엇을·언제·입출력·성공기준)을 좁히고, 초안 `SKILL.md` 와 필요한 `references/`·`scripts/` 를 작성한다.

### 2. 검수 (skill-reviewer + FRONTMATTER 기준)
생성된 스킬을 plugin-dev 의 **`skill-reviewer` 에이전트로 검수**한다. 에이전트에 다음을 전달한다.
- 검수 대상 `SKILL.md` 의 경로
- **추가 검수 기준**: 이 스킬의 `references/FRONTMATTER.md` 를 함께 읽어, 공식 프론트매터 필드 기준으로 특히 **(a) `model` 을 의도적으로 선택했는지, (b) `allowed-tools`/`disallowed-tools` 로 권한을 최소화했는지** 를 판정에 포함하도록 지시한다.
- 리포트는 **한국어**로 작성하도록 지시한다.

판정이 **Pass** 가 아니면(리포트의 `Overall Rating` 이 `Pass` 가 아니면) 권고사항을 반영해 수정하고 같은 스킬을 다시 검수한다. **검수→수정을 한 스킬당 최대 3회**까지만 반복한다(라운드 수를 세어 추적). 3회째에도 `Overall Rating: Pass` 가 아니면 멈추고, 남은 이슈 목록을 사용자에게 넘긴다(무한 루프 방지). 권고는 무조건 수용하지 말고 타당성을 따져 반영하며, 반려한 항목은 이유를 남긴다.

### 3. 평가 (eval dry-run)
스킬이 **적절한 케이스에서 실제로 호출되는지** 평가한다. skill-creator 의 eval 절차를 따른다.
- `evals/evals.json` 에 현실적인 **트리거 프롬프트 2-3개**와, 호출되면 **안 되는 네거티브 프롬프트**를 함께 작성한다.
- with-skill / baseline 런을 돌려, 의도한 케이스에서 트리거되고 무관한 케이스에서는 트리거되지 않는지 확인한다.
- 결과를 사용자에게 보여준다. 트리거가 부정확하면 `description` 을 다듬어 다시 평가한다.

### 4. 마무리
생성·검수·평가 결과를 요약한다: 스킬 경로, 검수 등급, eval 트리거 정확도, 남은 권고. **커밋·푸시는 사용자가 요청할 때만** 한다.
