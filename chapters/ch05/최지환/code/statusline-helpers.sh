#!/bin/bash
# 헬퍼 함수를 활용한 모듈화

# stdin에서 JSON 데이터 읽기
input=$(cat)

# 헬퍼 함수 정의: 각 필드를 추출하는 함수
get_model_name()    { echo "$input" | jq -r '.model.display_name'; }
get_current_dir()   { echo "$input" | jq -r '.workspace.current_dir'; }
get_project_dir()   { echo "$input" | jq -r '.workspace.project_dir'; }
get_version()       { echo "$input" | jq -r '.version'; }
get_cost()          { echo "$input" | jq -r '.cost.total_cost_usd'; }
get_duration()      { echo "$input" | jq -r '.cost.total_duration_ms'; }
get_lines_added()   { echo "$input" | jq -r '.cost.total_lines_added'; }
get_lines_removed() { echo "$input" | jq -r '.cost.total_lines_removed'; }

# 상태 표시줄 구성: 필요한 정보 조합
MODEL=$(get_model_name)
DIR=$(get_current_dir)
COST=$(get_cost)

# 상태 표시줄 출력
echo "[$MODEL] ${DIR##*/} | \$$(printf '%.3f' "$COST")"
