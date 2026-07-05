#!/bin/bash
# 비용과 코드 변경량을 표시하는 상태 표시줄

# stdin에서 JSON 데이터 읽기
input=$(cat)

# 필요한 정보 추출
MODEL_DISPLAY=$(echo "$input" | jq -r '.model.display_name')
CURRENT_DIR=$(echo "$input" | jq -r '.workspace.current_dir')
COST=$(echo "$input" | jq -r '.cost.total_cost_usd')
LINES_ADDED=$(echo "$input" | jq -r '.cost.total_lines_added')
LINES_REMOVED=$(echo "$input" | jq -r '.cost.total_lines_removed')

# 비용을 소수점 4자리까지 표시
COST_FORMATTED=$(printf "%.4f" "$COST")

# 상태 표시줄 출력(비용 및 코드 변경량 포함)
echo "[$MODEL_DISPLAY] ${CURRENT_DIR##*/} | \$$COST_FORMATTED | +$LINES_ADDED -$LINES_REMOVED"
