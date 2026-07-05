#!/bin/bash
# ANSI 색상 코드로 상태 표시줄 구분하기

# stdin에서 JSON 데이터 읽기
input=$(cat)

# ANSI 색상 코드 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # 색상 없음(No Color)

# 필요한 정보 추출
MODEL_DISPLAY=$(echo "$input" | jq -r '.model.display_name')
CURRENT_DIR=$(echo "$input" | jq -r '.workspace.current_dir')
LINES_ADDED=$(echo "$input" | jq -r '.cost.total_lines_added')
LINES_REMOVED=$(echo "$input" | jq -r '.cost.total_lines_removed')

# 깃 브랜치 정보 확인
GIT_BRANCH=""
if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null)
    if [ -n "$BRANCH" ]; then
        GIT_BRANCH=" ${CYAN}$BRANCH${NC}"
    fi
fi

# 색상이 적용된 상태 표시줄 출력 ( -e : ANSI 이스케이프 해석 )
echo -e "${YELLOW}[$MODEL_DISPLAY]${NC} ${BLUE}${CURRENT_DIR##*/}${NC}$GIT_BRANCH ${GREEN}+$LINES_ADDED${NC} ${RED}-$LINES_REMOVED${NC}"
