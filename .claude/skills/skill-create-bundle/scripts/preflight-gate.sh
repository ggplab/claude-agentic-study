#!/usr/bin/env bash
# skill-create-bundle :: 사전 의존성 게이트 (PreToolUse)
#
# skill-create-bundle 스킬이 활성인 동안 도구 사용 직전마다 실행되어 다음을 결정론적으로 검증한다.
#   (3-1) Anthropic 공식 skill-creator 설치 여부
#   (3-2) Anthropic 공식 plugin-dev 설치 + agents/skill-reviewer.md 존재
# 누락 시 마켓플레이스에서 설치를 시도하고, 도구 사용을 막으며(deny) 사유로 /reload-plugins 실행을 요구한다.
# (훅은 슬래시 명령을 직접 트리거할 수 없으므로 reload 만 모델이 대화에서 수행한다.)
set -euo pipefail

# stdin(tool_input JSON) 소비 — 이 게이트는 환경 상태만 본다.
input="$(cat || true)"
: "${input:=}"

MARKET="claude-plugins-official"
SR_PATH="$HOME/.claude/plugins/marketplaces/${MARKET}/plugins/plugin-dev/agents/skill-reviewer.md"

# PreToolUse deny (exit 0 + JSON). reason 에는 큰따옴표/개행을 넣지 않는다.
deny() {
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$1"
  exit 0
}

# claude CLI 가드: 없으면 PLIST 가 비어 의존성 오탐·반복 설치가 발생하므로 먼저 막는다.
command -v claude >/dev/null 2>&1 || deny "claude CLI 를 PATH 에서 찾을 수 없어 의존성 게이트를 수행할 수 없습니다. PATH 를 확인한 뒤 다시 시도하세요."

# 플러그인 목록을 한 번만 캡처해 변수에서 검사(파이프 SIGPIPE 오탐 방지).
PLIST="$(claude plugin list 2>/dev/null || true)"
# 'name@' 가 토큰 경계에서 등장하는지로 정확 매칭(부분 문자열 오탐 방지: plugin-dev-extra@ 등).
installed() { printf '%s\n' "$PLIST" | grep -qE "(^|[^[:alnum:]_-])$1@"; }

need_reload=0
notes=""

# Gate 3-1: skill-creator
if ! installed "skill-creator"; then
  if claude plugin install "skill-creator@${MARKET}" >/dev/null 2>&1; then
    need_reload=1; notes="${notes}skill-creator 설치함. "
  else
    deny "필수 의존성 skill-creator 가 없고 자동 설치에 실패했습니다. 대화에서 claude plugin install skill-creator@${MARKET} 실행 후 /reload-plugins 하고 다시 시도하세요."
  fi
fi

# Gate 3-2: plugin-dev (+ agents/skill-reviewer.md)
if ! installed "plugin-dev" || [ ! -f "$SR_PATH" ]; then
  if claude plugin install "plugin-dev@${MARKET}" >/dev/null 2>&1; then
    need_reload=1; notes="${notes}plugin-dev 설치함. "
  else
    deny "필수 의존성 plugin-dev(agents/skill-reviewer.md) 가 없고 자동 설치에 실패했습니다. 대화에서 claude plugin install plugin-dev@${MARKET} 실행 후 /reload-plugins 하고 다시 시도하세요."
  fi
fi

# 설치 후에도 skill-reviewer.md 가 없으면 명시적으로 막는다.
if [ ! -f "$SR_PATH" ]; then
  deny "plugin-dev 는 설치되었으나 agents/skill-reviewer.md 를 찾지 못했습니다. claude plugin update plugin-dev@${MARKET} 후 /reload-plugins 하고 다시 시도하세요."
fi

# 무언가 설치했다면 세션 반영을 위해 reload 요구.
if [ "$need_reload" -eq 1 ]; then
  deny "${notes}변경을 현재 세션에 반영하려면 /reload-plugins 를 실행한 뒤 작업을 다시 시도하세요."
fi

# 모든 게이트 통과 → 허용 (출력 없음 = allow).
exit 0
