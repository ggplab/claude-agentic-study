# 남서아 · 4장 정리: 서브에이전트 (2026-06-28)

> 발표 핵심: **서브에이전트 vs 에이전트 팀 — 언제 무엇을 쓸 것인가**

---

## 1. 두 개념의 본질적 차이

> "Subagents only report results back to the main agent and never talk to each other. In agent teams, teammates share a task list, claim work, and communicate directly with each other." — agent-teams 공식 문서

| 기준 | 서브에이전트 | 에이전트 팀 |
|------|------------|------------|
| 컨텍스트 | 독립 윈도우, 결과는 호출자에게 반환 | 독립 윈도우, 완전 독립 |
| 통신 | 메인에게 보고만 (서로 대화 X) | 팀원끼리 직접 메시지 |
| 조율 | 메인이 전부 관리 (오케스트레이터-워커) | 공유 태스크 리스트로 자가 조율 (피어) |
| 토큰 비용 | 낮음 (결과만 요약 반환) | 높음 (각 팀원 = 별도 인스턴스) |
| 적합 작업 | 결과만 중요한 집중·순차 작업 | 토론·도전이 필요한 복잡·병렬 탐색 |
| 성숙도 | 정식 기능 | 실험 기능(기본 비활성) |

## 2. 선택 기준 (공식 문서의 한 줄 규칙)

> "Use subagents when you need quick, focused workers that report back. Use agent teams when teammates need to share findings, challenge each other, and coordinate on their own. For sequential tasks, same-file edits, or work with many dependencies, a single session or subagents are more effective." — sub-agents / agent-teams 문서

**서브에이전트를 써라** → 작업이 선형이거나, 워커끼리 대화할 필요 없고 결과만 받으면 될 때. 비용·재현성·무인 실행이 중요할 때.

**에이전트 팀을 써라** → 정답이 불확실해 여러 가설을 병렬로 부딪쳐 봐야 할 때(코드 리뷰 다관점, 경쟁 가설 디버깅, 레이어 분담 기능 개발). 토론 자체가 가치일 때.

### 실행 방법: `--agent` 플래그의 중요성

서브에이전트는 `.claude/agents/*.md`로 정의하고 `--agent` 플래그로 호출하는 것이 정석이다.
이 구조는 지시 출처를 `.md` 하나로 단일화하고, 프론트매터의 `tools`·`model` 경계가 실제로 강제된다.

내 플러그인은 `claude -p` 헤드리스로 이 효과를 흉내냈는데, 그 결과:
- 에이전트 정의서(.md)와 인라인 프롬프트(-p)가 두 개의 지시 출처로 공존 → 드리프트 위험
- `tools: [Read, Bash]`로 정의했지만 실제 `--allowedTools`가 Read,Write,Edit,Bash를 부여 → tools 경계가 장식
- `model: claude-sonnet-4-6`이 적용 안 되고 세션 기본 모델로 실행

`--agent insight-synthesizer` 한 플래그로 바꾸면 이 세 가지가 구조적으로 해결된다.
이게 "좋은 결과 ≠ 좋은 구조"의 구체적 사례다 — 기능은 동작하지만, 경계 조건이 코드가 아니라 프롬프트에 의존한다.

## 3. 내 프로젝트(PR Monitor): 왜 서브에이전트였나, 어떻게 썼나

내 도구는 뉴스를 모아 인사이트 뉴스레터 + PR 클리핑을 자동 생성한다.

```
수집 → 본문추출 → 분류 → 집계 → (LLM)인사이트 합성 → HTML 렌더 → 품질 게이트 → 발송
```

**왜 서브에이전트였나 — 4가지 근거:**
1. **선형 파이프라인:** 각 단계는 단일 입출력 계약. 문서의 "sequential tasks → subagents"에 정확히 해당
2. **오케스트레이터가 LLM일 필요 없음:** 팀장은 run-*.sh (bash + set -euo pipefail + 품질 게이트). 무인 예약 실행(Routines)엔 결정론 조율이 안정적
3. **비용·재현성:** 서브에이전트는 결과만 반환해 회당 ~$0.25. 팀은 팀원마다 비용 선형 증가
4. **에이전트 팀은 아직 실험 기능:** 무인 프로덕션 운영엔 시기상조

**어떻게 썼나 — "결정론 코드가 뼈대, 판단 지점에만 격리된 서브에이전트":**
- `insight-synthesizer` (Sonnet, tools: Read, Bash): synthesis-context-{date}.json 하나만 읽고 브리핑 JSON 하나만 씀
- `self-context-updater` (Haiku): 월 1회/요청 시만. 일일 축적은 결정론 스크립트가 전담

**"만약 팀이었다면?" — 반례로 보는 부적합:**
같은 일을 에이전트 팀으로 짰다면: 팀원들이 공유 태스크를 claim하고 서로 메시지하며 조율 → 매일 아침 무인 실행에서 토큰 폭증 + 비결정성 + 부분 실패 복구 난이도↑. 얻는 건 없다(토론할 문제가 없으니).

## 4. 팀이 정당화되는 조건 — 결정론이 탐색 못 하는 영역

팀이 서브에이전트로 불가능한 걸 딱 하나 준다: **워커끼리 직접 대화하고, 공유 태스크를 스스로 claim하며, 서로의 결론에 도전(challenge)하는 것.**

팀이 이기는 유일한 경우 = 워커 간 상호작용 자체가 결과 품질을 올리는 작업.

| 상황 | 설명 |
|------|------|
| 다관점 코드 리뷰 | 보안·성능·테스트 담당이 동시에 보고 교차 검증 |
| 경쟁 가설 디버깅 | 여러 명이 각자 다른 원인 추론, 서로 반박 |
| 신규 모듈 병렬 개발 | 팀원이 각자 다른 파일 owning, 충돌 없이 동시 진행 |

**왜 "서브에이전트 여러 개"로는 안 되나 — 앵커링:**
각자 독립적으로 한 가지 그럴듯한 답을 찾고 멈춘다(메인이 합쳐도 서로의 약점을 못 본다). 팀은 서로 반박하게 만들어 이 함정을 깬다.

> "With multiple independent investigators actively trying to disprove each other, the theory that survives is much more likely to be the actual root cause." — agent-teams 문서

**한 줄 결론:** 팀은 "병렬로 더 빨리"가 아니라 **"서로 부딪쳐 더 정확히"**를 살 때 쓴다. 빠르기만 원하면 서브에이전트가 더 싸고 안정적이다.

## 5. 배운 점

좋은 결과와 좋은 구조는 같지 않다. 테스트를 통과시키려 구조를 땜질하면 당장은 초록불이지만, 컨텍스트와 실패 경계는 흐려진다. "팀이냐 서브에이전트냐"도 멋의 문제가 아니라 — 워커끼리 대화가 필요한가라는 한 가지 질문으로 갈린다는 걸, 이번에 몸으로 배웠다.