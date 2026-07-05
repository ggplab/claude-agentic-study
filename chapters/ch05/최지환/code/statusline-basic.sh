#!/bin/bash
# 가장 간단한 상태 표시줄: 모델 이름 + 현재 디렉터리

# stdin에서 JSON 데이터 읽기
input=$(cat)

# 모델 표시 이름과 현재 디렉터리 추출
MODEL_DISPLAY=$(echo "$input" | jq -r '.model.display_name')
CURRENT_DIR=$(echo "$input" | jq -r '.workspace.current_dir')

# 포매팅된 상태 출력 ( ##*/ : 경로에서 마지막 디렉터리 이름만 추출 )
echo "[$MODEL_DISPLAY] ${CURRENT_DIR##*/}"
