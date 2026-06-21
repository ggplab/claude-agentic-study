#!/usr/bin/env bash
# skill-create-bundle :: 프론트매터 검수 게이트 (PostToolUse, matcher Write|Edit)
#
# 생성/수정된 SKILL.md 의 프론트매터에 model: / allowed-tools: 키가 있는지 결정론적으로 검사한다.
# 누락 시 additionalContext 로 경고를 주입해 모델이 사용자에게 확인하도록 유도한다(fallback ask).
# (PostToolUse 는 도구 실행 후이므로 차단이 아니라 경고 주입이 올바른 패턴이다.)
set -uo pipefail

INPUT="$(cat || true)"

# python3 없으면 검사를 안전하게 생략(차단이 아니라 통과).
command -v python3 >/dev/null 2>&1 || exit 0

# tool_input.file_path 추출.
FILE_PATH="$(printf '%s' "$INPUT" | python3 -c 'import json,sys
try:
    d = json.load(sys.stdin)
    print(d.get("tool_input", {}).get("file_path", ""))
except Exception:
    print("")' 2>/dev/null)"

# SKILL.md 가 아니면 무시.
case "$FILE_PATH" in
  *SKILL.md) : ;;
  *) exit 0 ;;
esac

# 파일이 실제로 없으면 무시.
[ -f "$FILE_PATH" ] || exit 0

# 이 파이프라인 자신의 SKILL.md 는 검사 대상에서 제외(생성 대상만 검사).
case "$FILE_PATH" in
  */skill-create-bundle/SKILL.md) exit 0 ;;
esac

# 프론트매터 영역만 추출(첫 --- 부터 두 번째 --- 직전까지).
FRONT="$(awk 'NR==1 && $0=="---"{f=1;next} f && $0=="---"{exit} f{print}' "$FILE_PATH")"

missing=""
printf '%s\n' "$FRONT" | grep -Eq '^[[:space:]]*model:'         || missing="${missing}model "
printf '%s\n' "$FRONT" | grep -Eq '^[[:space:]]*allowed-tools:' || missing="${missing}allowed-tools "

if [ -n "$missing" ]; then
  msg="[skill-create-bundle 검수] ${FILE_PATH} 프론트매터에 다음 키가 없습니다: ${missing}. references/FRONTMATTER.md 기준으로 (a) model 을 의도적으로 선택했는지, (b) allowed-tools 로 최소권한을 제어했는지 사용자에게 확인한 뒤 보완하라. 의도적 누락이면 이유를 기록하라."
  printf '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"%s"}}\n' "$msg"
fi
exit 0
