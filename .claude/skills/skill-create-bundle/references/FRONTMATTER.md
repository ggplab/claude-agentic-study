# SKILL.md 프론트매터 필드 — 검수 기준 (Claude 공식 문서)

이 문서는 `skill-reviewer`가 **생성된 SKILL.md의 프론트매터 품질을 추가 검증**할 때 참조한다.
출처: Claude Code 공식 문서의 "Skill frontmatter fields" 표.

## 필드 표

| Field | Required | Description |
|---|---|---|
| `name` | No | 스킬 목록에 표시되는 이름. 기본값은 디렉터리 이름. 호출 시 입력하는 이름과 다를 수 있다(How a skill gets its command name 참고). |
| `description` | Recommended | 스킬이 무엇을 하고 언제 쓰는지. Claude가 스킬 적용 시점을 결정하는 데 사용. 생략 시 마크다운 본문 첫 문단을 사용. **핵심 use case를 맨 앞에** 둘 것 — description과 when_to_use를 합친 텍스트는 스킬 목록에서 **1,536자에서 잘린다**(컨텍스트 절약). |
| `when_to_use` | No | Claude가 스킬을 호출해야 하는 추가 맥락(트리거 문구·예시 요청). 스킬 목록에서 description 뒤에 붙으며 **1,536자 상한에 포함**된다. |
| `argument-hint` | No | 자동완성 시 표시되는 인자 힌트. 예: `[issue-number]` 또는 `[filename] [format]`. |
| `arguments` | No | 스킬 내용 안에서 `$name` 치환에 쓰는 명명된 위치 인자. 공백 구분 문자열 또는 YAML 리스트. 이름이 순서대로 인자 위치에 매핑된다. |
| `disable-model-invocation` | No | `true`면 Claude가 이 스킬을 자동 로드하지 못하게 한다. `/name`으로 수동 트리거하려는 워크플로에 사용. 서브에이전트로의 사전 로드도 막는다. 기본값 `false`. |
| `user-invocable` | No | `false`면 `/` 메뉴에서 숨긴다. 사용자가 직접 호출하면 안 되는 배경 지식용. 기본값 `true`. |
| `allowed-tools` | No | 이 스킬이 활성일 때 Claude가 **승인 없이** 쓸 수 있는 도구. 공백/쉼표 구분 문자열 또는 YAML 리스트. |
| `disallowed-tools` | No | 이 스킬이 활성인 동안 Claude의 사용 가능 도구 풀에서 **제거**되는 도구. 특정 도구를 절대 호출하면 안 되는 자율 스킬에 사용(예: 백그라운드 루프에서 AskUserQuestion). 공백/쉼표 구분 문자열 또는 YAML 리스트. 다음 메시지를 보내면 제한이 해제된다. |
| `model` | No | 이 스킬이 활성일 때 사용할 모델. 오버라이드는 현재 턴 동안 적용되며 설정에 저장되지 않는다(다음 프롬프트에서 세션 모델로 복귀). `/model`과 같은 값 또는 `inherit`. |
| `effort` | No | 이 스킬이 활성일 때 effort 레벨. 세션 effort를 오버라이드. 기본값: 세션 상속. 옵션: `low`, `medium`, `high`, `xhigh`, `max`(모델에 따라 가용 레벨 상이). |
| `context` | No | `fork`로 설정하면 포크된 서브에이전트 컨텍스트에서 실행. |
| `agent` | No | `context: fork`일 때 사용할 서브에이전트 타입. |
| `hooks` | No | 이 스킬의 수명주기에 스코프된 훅. 구성 형식은 "Hooks in skills and agents" 참고. |
| `paths` | No | 스킬 활성화를 제한하는 glob 패턴. 쉼표 구분 문자열 또는 YAML 리스트. 설정 시 해당 패턴에 맞는 파일을 다룰 때만 자동 로드. path-specific rules와 같은 형식. |
| `shell` | No | 스킬 안의 `` !`command` `` 및 ` ```! ` 블록에 쓰는 셸. `bash`(기본) 또는 `powershell`. `powershell`은 Windows에서 PowerShell로 인라인 셸 실행. `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` 필요. |

## 검수 체크리스트 (skill-reviewer가 추가로 점검)

생성된 SKILL.md를 위 표 기준으로 검토할 때, 특히 다음 두 가지를 **명시적으로 판정**한다.

### 1. `model` 을 의도적으로 선택했는가
- 스킬의 작업 성격에 맞는 모델이 지정되었는지 확인한다(예: 판단·설계 비중이 크면 상위 모델, 단순 기계적 변환이면 경량 모델, 혹은 의도적으로 `inherit`).
- `model`이 아예 없으면 — 세션 모델을 그대로 쓰겠다는 **의도적 결정인지**, 단순 누락인지 구분한다. 누락으로 보이면 지적한다.

### 2. `allowed-tools` / `disallowed-tools` 로 권한을 적절히 제어했는가
- 스킬이 자동으로 쓸 도구가 작업에 **꼭 필요한 최소 집합**인지(과도한 권한 부여 금지).
- 파괴적·외부 영향 도구(Bash 광범위 권한, 외부 전송 도구 등)가 무분별하게 allow 되어 있지 않은지.
- 자율/백그라운드 성격이면 위험 도구가 `disallowed-tools`로 차단됐는지.
- 권한 제어가 전혀 없으면(둘 다 없음) — 의도적인지 누락인지 판정하고, 최소권한 관점에서 권고한다.

### 판정 출력
- 두 항목 각각 **충족 / 미흡 / 누락**으로 표기하고, 미흡·누락이면 구체적 수정안(예시 프론트매터)을 제시한다.
