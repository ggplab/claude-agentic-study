#!/bin/bash
# 성능 최적화: 깃 브랜치 정보를 캐싱

# stdin에서 JSON 데이터 읽기
input=$(cat)

# 캐시 파일 설정
CACHE_FILE="/tmp/claude-statusline-git-cache"
CACHE_TTL=5  # 5초 캐시 유효 시간

# 캐시 확인: 캐시가 존재하고 유효 시간 내에 있는지 체크
# ponytail: stat 옵션이 macOS(-f%m)/리눅스(-c%Y)로 달라 둘 다 시도
if [ -f "$CACHE_FILE" ]; then
    MTIME=$(stat -f%m "$CACHE_FILE" 2>/dev/null || stat -c%Y "$CACHE_FILE" 2>/dev/null)
    CACHE_AGE=$(( $(date +%s) - MTIME ))
    if [ "$CACHE_AGE" -lt "$CACHE_TTL" ]; then
        GIT_BRANCH=$(cat "$CACHE_FILE")
    fi
fi

# 캐시가 없거나 만료되었으면 새로 가져오기
if [ -z "$GIT_BRANCH" ]; then
    if git rev-parse --git-dir > /dev/null 2>&1; then
        GIT_BRANCH=$(git branch --show-current 2>/dev/null)
        echo "$GIT_BRANCH" > "$CACHE_FILE"
    fi
fi

# 기본 정보 추출
MODEL_DISPLAY=$(echo "$input" | jq -r '.model.display_name')
CURRENT_DIR=$(echo "$input" | jq -r '.workspace.current_dir')

# 상태 표시줄 출력(브랜치 정보가 있으면 포함)
if [ -n "$GIT_BRANCH" ]; then
    echo "[$MODEL_DISPLAY] ${CURRENT_DIR##*/} | $GIT_BRANCH"
else
    echo "[$MODEL_DISPLAY] ${CURRENT_DIR##*/}"
fi
