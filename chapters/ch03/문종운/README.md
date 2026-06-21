# CHAPTER 03 — 에이전트 스킬 · 문종운 정리본

> 흐름: 스킬이 무엇이고 어디 사는지 → SKILL.md 구조와 프론트매터 → **3단계 점진적 로딩(토큰 절약의 핵심)** → description 설계 → 예시·환각방지 → CLAUDE.md/@import → context: fork.
> 적용예시는 전부 내 실제 클로드 설정(`~/.claude/**`, 이 프로젝트 `.claude/**`)을 읽어 확인한 사실만 적었다. 없는 건 "아직 없음"으로 표기.

---

## 1. 스킬의 유형과 위치

**개념정리**
스킬은 정의 위치에 따라 두 종류다.

| 유형 | 위치 | 적용 범위 |
|------|------|-----------|
| 개인(글로벌) 스킬 | `~/.claude/skills/` | 모든 프로젝트에서 공통 사용 |
| 프로젝트 스킬 | `<프로젝트>/.claude/skills/` | 해당 프로젝트에서만 |

> 정정: 메모의 `projects/.claude/skills`는 정확히는 **프로젝트 루트의 `.claude/skills/`**다(`projects/`라는 고정 폴더가 있는 게 아니라 각 프로젝트 디렉토리 기준).

**내 시스템 적용예시 (실측)**
- 글로벌(`~/.claude/skills/`): `cmux`, `cmux-browser`, `codebase-memory-exploring`, `grill-me` 등 — 어느 프로젝트에서든 뜬다.
- 이 프로젝트(`.claude/skills/`): `study-chapter`, `chapter-deck`, `order-session` 3개 — 이 스터디 저장소에서만 의미가 있는 스킬이라 프로젝트 쪽에 둔 게 맞다(예: `order-session`은 "단원 리더가 발표 순서 조정"이라 다른 프로젝트엔 무의미).

---

## 2. 스킬 디렉토리 구조 (1depth-flat 원칙)

**개념정리**
스킬은 폴더 하나에 SKILL.md(필수) + 헬퍼 파일들로 구성한다.

```
pdf-skill/
├── SKILL.md      (메인 지침, 필수)
├── FORMS.md      (양식 채우기 가이드)
├── REFERENCE.md  (상세 API 레퍼런스)
└── scripts/
    └── fill_form.py
```

두 가지 규칙:
- **헬퍼 파일은 1depth 정도까지만** 두는 게 원칙(깊게 중첩하지 않는다 → 토큰·탐색 효율).
- **`SKILL.md`는 대소문자가 정확해야** 인식된다(파일명 표기 주의).

**내 시스템 적용예시 (실측)**
- 내 프로젝트 스킬 3개는 모두 **`SKILL.md` 단일 파일**이다(헬퍼 파일 없음). 분량이 작아 아직 분리할 필요가 없었다.
- 참고로 글로벌 쪽 `team`/`shorts` 같은 큰 스킬은 `phases/`, `agents/`, `skills/` 하위로 쪼개 운영되는데, 이게 "한 폴더 안에서 역할별로 펼친" 형태다.
- 1depth-flat을 도입한다면: `study-chapter`의 LinkedIn 톤 규칙·커밋 절차를 `SKILL.md` 본문에서 빼서 `REFERENCE.md`로 분리할 수 있다(지금은 67줄이라 불필요).

---

## 3. SKILL.md 프론트매터 — name·description이 전부

**개념정리**
프론트매터에서 **필수에 가까운 건 `name`과 `description` 둘뿐**이고, 나머지는 전부 선택이다. 자주 쓰는 필드만 추리면:

| 필드 | 의미 |
|------|------|
| `name` | 스킬 목록에 보이는 이름(생략 시 폴더명). |
| `description` | **무엇을 + 언제 쓰는지.** 클로드가 호출 여부를 판단하는 근거. `when_to_use`와 합쳐 1,536자에서 잘림 → 핵심 use case를 앞에. |
| `when_to_use` | 트리거 문구·예시 요청. description에 덧붙여짐(같은 1,536자 한도). |
| `argument-hint` | 자동완성 때 보이는 인자 힌트. 예: `[issue-number]`. |
| `disable-model-invocation` | `true`면 자동 로딩 금지 → `/name`으로 수동 호출만. |
| `user-invocable` | `false`면 `/` 메뉴에서 숨김(배경지식용). |
| `allowed-tools` / `disallowed-tools` | 스킬 활성 동안 허용/제거할 도구. |
| `model` / `effort` | 스킬 활성 동안 모델·추론량 오버라이드(턴 한정). |
| `context: fork` / `agent` | 격리된 서브에이전트 컨텍스트로 실행(§9). |
| `paths` | glob에 맞는 파일 작업 시에만 자동 활성. |

**내 시스템 적용예시 (실측)**

| 필드 | 내 스킬에서의 실제 값 |
|------|----------------------|
| `name` + `description` | 3개 스킬 모두 보유 |
| `argument-hint` | `study-chapter`: `<챕터번호> [이름]` / `chapter-deck`: `<챕터번호> [이름]` / `order-session`: `<챕터번호 (예 3)>` |
| `disable-model-invocation: true` | `study-chapter`, `chapter-deck` (수동 `/` 호출 전용) |
| (필드 없음 = 기본값) | `order-session` — 자동 호출 허용 |
| `when_to_use`·`allowed-tools`·`model`·`effort`·`context` | **아직 안 씀** |

> 읽으며 생긴 질문 / 내 결론: "왜 `study-chapter`만 `disable-model-invocation`을 켰지?" → 주간 루틴은 내가 의도적으로 `/study-chapter 03 …`처럼 **시점을 잡아 부르는 워크플로**라서, 클로드가 아무 때나 끼어들면 안 되기 때문. 반대로 `order-session`은 자동 호출돼도 무해해서 안 켰다.

---

## 4. ★ 3단계 점진적 로딩 (토큰 절약의 핵심)

**개념정리**
클로드는 스킬을 한 번에 다 읽지 않는다. **필요한 만큼만, 단계적으로** 읽는다.

1. **메타데이터만 선제 로딩** — 모든 스킬의 `name` + `description`만 컨텍스트에 미리 올린다.
2. **매칭되면 SKILL.md 로딩** — 지금 일이 그 description과 맞아 보이면, 그때 Bash로 `SKILL.md` 본문을 컨텍스트에 추가한다.
3. **리소스는 필요 시 개별 로딩** — `REFERENCE.md`, `scripts/*` 같은 지원 파일은 실제로 필요한 순간에 하나씩 읽는다.

즉 **description은 "이 스킬을 열어볼지" 결정하는 광고문**이고, 본문·리소스는 열기로 한 뒤에야 비용이 든다. 이게 스킬 수십 개를 깔아도 컨텍스트가 안 터지는 이유다.

부차 포인트:
- `SKILL.md`는 **200줄 이내**로 유지. **하나의 스킬 = 하나의 행위** — 책임이 많아지면 호출 판단이 모호해진다.
- LLM은 문서 **상단·하단을 더 잘 읽고 중간은 흘린다**(논문). 컨텍스트가 커지며 완화됐지만, **확실히 보장해야 하는 게이트는 확률에 맡기지 말고 hook으로 결정론적으로** 거는 게 안전하다.

**내 시스템 적용예시 (실측)**
- **점진적 로딩의 산 증거 = 지금 이 세션**: 시스템 안내에 글로벌·플러그인 스킬(`cmux`, `team`, `shorts`, `codebase-memory-*` …) 수십 개가 **`description` 한 줄씩만** 떠 있다. 본문은 안 떠 있다. 내가 `study-chapter`를 부르자 그제서야 SKILL.md 67줄이 들어왔다 — 1→2단계가 눈앞에서 일어남.
- **200줄·단일책임**: 내 3개 스킬은 각각 67/72/59줄, 책임도 1개씩(정리 / 정리+슬라이드 / 순서조정)으로 쪼개져 있다.
- **결정론적 게이트 = hook (실측 핵심)**: `~/.claude/settings.json`에 `PreToolUse → ~/.claude/hooks/cbm-code-discovery-gate` 훅이 걸려 있다. 오늘 이 정리본을 만드는 중에도 `README.md`·`_TEMPLATE.md`를 Read하려다 **이 훅에 실제로 차단**됐다. "코드 탐색은 그래프 MCP부터" 같은 규칙을 description/지침에 적어두면 80% 확률로 지켜지지만, 훅으로 걸면 100%다 — 메모의 "결정론적 gate는 hook으로"가 정확히 이거였다.

| 보장 방식 | 강제력 | 내 사례 |
|-----------|--------|---------|
| description·SKILL.md 지침 | 확률적(읽고 따름) | "적용예시는 실측, 추정 금지" |
| hook 게이트 | 결정론적(코드가 막음) | `cbm-code-discovery-gate` PreToolUse |

---

## 5. description 설계 — 발견 가능성 vs 과범용

**개념정리**
description은 **밀도 높고 발견 가능성(discoverability) 최대**여야 자주·정확히 호출된다. 단 **너무 범용적이면 불필요한 상황에도 튀어나온다**. 그래서 "언제 쓰는지"를 구체적으로 좁히는 자세한 지침이 중요하다. 직접 쓰기 어렵다면 Anthropic의 **`skill-creator`** 스킬을 쓰면 된다.

**내 시스템 적용예시 (실측)**
- 좁히기 성공 사례: `order-session` description = "단원 리더가 **일요일 오후에** 참여자들이 올린 글을 보고 발표 순서를 조정한다 … 인자로 챕터 번호를 받는다." → 행위·주체·시점·입력이 다 박혀 있어 "발표 순서" 맥락에서만 뜬다.
- 밀도 사례: `chapter-deck` description은 한 문장에 "정리본 README + 비교 시각화 HTML을 **두 병렬 서브에이전트**로 생성"까지 넣어, 무엇을/어떻게/산출물을 압축했다.
- 과범용의 위험을 직접 겪은 흔적: 메모리에 `skill-files-no-hook-bypass`가 있다 — 커밋되는 SKILL.md에 훅 우회 지침을 넣었다가 막힌 사례. description/지침은 "넓게 잡아 다 잡으려다" 오히려 사고를 키울 수 있다는 교훈과 같은 결.

---

## 6. 예시 전달 & EXAMPLES.md 격리

**개념정리**
클로드는 **예시를 주면 지침을 더 잘 따른다**. 다만 예시까지 다 넣어 SKILL.md가 비대해지면 §4의 "중간 흘려읽기"로 오히려 놓친다. 그래서 **자세한 예시는 `EXAMPLES.md`로 파일 격리**하고(1depth-flat), 필요 시 3단계에서 개별 로딩한다 → 토큰 효율.

**내 시스템 적용예시 (실측)**
- 내 스킬들은 예시를 **본문에 인라인**으로 둔다(예: `order-session`의 "발표 순서" 마크다운 블록, `study-chapter`의 커밋 메시지 예시 `docs(ch02): 임정 2장 정리 + 기본글`). 분량이 작아 아직 격리 불필요.
- 도입한다면: `chapter-deck`의 "비교는 CSS @keyframes로" 부분에 슬라이드 HTML 예시가 길어지면 `EXAMPLES.md`로 빼는 게 1순위.

---

## 7. 환각 방지 지침

**개념정리**
SKILL.md에는 환각을 줄이는 지침을 넣는 게 좋다. 대표 3종:
1. **불확실성 표현 허용** — 모르면 "모른다/불확실"이라고 말하게.
2. **지식 범위 제한** — 확인된 범위 밖은 추정 금지.
3. **출처 명시** — 근거가 된 파일·사실을 밝히게.

**내 시스템 적용예시 (실측)**
- `study-chapter`: "**적용예시는 실측, 추정 금지** — 사용자의 실제 설정 파일을 읽고 확인된 사실만 쓴다", "파일을 읽지 않고 기억으로 쓰는 것 금지. … 없으면 '아직 없음 + 도입한다면 어디에'로 솔직하게" → 3종이 한 번에 들어가 있다.
- `chapter-deck`도 동일하게 "추정 금지", `order-session`은 "날짜 추정 금지(`date` 실행)"로 출처(실제 명령 결과) 강제.
- 이 정리본 자체가 그 지침의 산출물 — "아직 안 씀", "실측" 표기가 곧 출처 명시.

---

## 8. CLAUDE.md & @import

**개념정리**
잘 쓴 행동 지침의 예가 **카파시(Karpathy) 스타일 CLAUDE.md**다: ① Think Before Coding(가정 명시·혼란을 숨기지 말 것) ② Simplicity First(요청 이상 만들지 말 것) ③ Surgical Changes(요청과 직접 연결되는 줄만 수정) ④ Goal-Driven Execution(검증 가능한 성공 기준으로 루프). 여기에 **자기에게 꼭 필요한 지침**을 더한다. CLAUDE.md도 비대해지면 축약하고, **하단에 `@문서.md`로 import**해 분리 문서를 읽어들일 수 있다.

**내 시스템 적용예시 (실측)**
- 내 `~/.claude/CLAUDE.md`는 이미 같은 철학이다: "**사람은 방향, AI는 실행**", "When unsure about a change, **ask — don't guess**", "Never touch production config files without explicit permission" → 카파시의 Think-Before-Coding / Surgical-Changes와 1:1로 겹친다.
- **단, `@import`는 아직 안 쓴다**(`grep '^@' ~/.claude/CLAUDE.md` 결과 없음). 지금은 하네스 호출맵·Project Conventions를 한 파일에 다 둔다.
- 도입한다면: "Rules (update when Claude makes mistakes)" 블록이 길어지면 `@rules.md`로 빼서 CLAUDE.md 본문을 가볍게 유지.

---

## 9. context: fork — 메인 컨텍스트 격리

**개념정리**
스킬은 기본적으로 **메인 세션 컨텍스트 안**에서 돈다 → 메인 컨텍스트를 오염시킬 수 있다. `context: fork`를 주면 **격리된 서브에이전트 컨텍스트**에서 실행돼 메인을 더럽히지 않는다. **단점**: 대규모 파일을 다룰 때, 메인에서 이미 읽은 파일을 fork가 또 읽어 **토큰이 오히려 더 늘 수** 있다(중복 로딩).

**내 시스템 적용예시 (실측)**
- 내 스킬 어디에도 `context: fork`는 **아직 없다**(`grep context: ~/.claude/skills ./.claude/skills` 결과 없음).
- 대신 `chapter-deck`은 fork의 목적(격리)을 **다른 방식**으로 이미 달성한다: "README와 HTML은 독립 → **2개 서브에이전트로 병렬 디스패치, 메인 세션 맥락을 물려주지 않는다**." 즉 스킬 프론트매터의 fork 대신 **명시적 서브에이전트 분리**로 컨텍스트를 끊었다.
- 도입 판단: `study-chapter`처럼 내 설정 파일을 잔뜩 Read하는 스킬에 fork를 걸면, 메인이 이미 읽은 파일을 fork가 또 읽어 단점이 그대로 나온다 → 지금 구조(메인에서 실측)가 오히려 효율적. fork는 "메인과 공유할 필요 없는 대량 탐색"에 쓰는 게 맞겠다.

---

## 🎤 이번 주 발표용 핵심 개념 1개

### **3단계 점진적 로딩 — description은 본문이 아니라 "광고문"이다**

- **고른 이유**: 3장에서 가장 반직관적이고 실무 영향이 큰 개념. "스킬을 많이 깔면 무거워지지 않나?"라는 오해를 정확히 깨준다 — 평소엔 `name`+`description`만, 매칭돼야 SKILL.md, 필요해야 리소스. ch03 README에 아직 다른 참여자 글이 없어 중복 위험도 낮다.
- **발표 한 줄**: "스킬 비용은 **개수가 아니라 '열어본 횟수'**에 비례한다. 그래서 description은 정확히 트리거되도록 좁혀 쓰고, 확률로 부족한 보장은 **hook 게이트**로 결정론적으로 박는다."
- **라이브 데모 포인트**: 이 세션에서 (1) 수십 개 스킬이 description만 떠 있다가 `/study-chapter` 호출 시 본문이 들어온 것, (2) `cbm-code-discovery-gate` 훅이 내 Read를 실제로 막은 것 — 둘 다 화면으로 보여줄 수 있다.
