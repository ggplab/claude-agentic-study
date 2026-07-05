#!/bin/bash
# 깃 브랜치를 포함한 상태 표시줄

# stdin에서 JSON 데이터 읽기
input=$(cat)

# 모델 표시 이름과 현재 디렉터리 추출
MODEL_DISPLAY=$(echo "$input" | jq -r '.model.display_name')
CURRENT_DIR=$(echo "$input" | jq -r '.workspace.current_dir')

# 깃 브랜치 정보 확인
GIT_BRANCH=""
if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null)
    if [ -n "$BRANCH" ]; then
        GIT_BRANCH=" | $BRANCH"
    fi
fi

# 상태 표시줄 출력(브랜치 정보 포함)
echo "[$MODEL_DISPLAY] ${CURRENT_DIR##*/}$GIT_BRANCH"
