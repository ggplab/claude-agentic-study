#!/usr/bin/env python3
# 파이썬으로 작성한 상태 표시줄 스크립트

import json
import sys
import os

# stdin에서 JSON 데이터 로드
data = json.load(sys.stdin)

# 필요한 정보 추출
model = data['model']['display_name']
current_dir = os.path.basename(data['workspace']['current_dir'])

# 깃 브랜치 정보 확인 (.git/HEAD 파일을 직접 읽어 git 명령보다 빠름)
git_branch = ""
if os.path.exists('.git'):
    try:
        with open('.git/HEAD', 'r') as f:
            ref = f.read().strip()
            if ref.startswith('ref: refs/heads/'):
                git_branch = f" | {ref.replace('ref: refs/heads/', '')}"
    except Exception:
        pass  # 깃 저장소가 아니거나 HEAD 파일을 읽을 수 없음

# 상태 표시줄 출력
print(f"[{model}] {current_dir}{git_branch}")
