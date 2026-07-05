#!/usr/bin/env node
// Node.js로 작성한 상태 표시줄 스크립트

const fs = require('fs');
const path = require('path');

// stdin에서 JSON 데이터 수신 (비동기 이벤트 기반)
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    // JSON 파싱
    const data = JSON.parse(input);

    // 필요한 정보 추출
    const model = data.model.display_name;
    const currentDir = path.basename(data.workspace.current_dir);

    // 깃 브랜치 정보 확인
    let gitBranch = '';
    try {
        const headContent = fs.readFileSync('.git/HEAD', 'utf8').trim();
        if (headContent.startsWith('ref: refs/heads/')) {
            gitBranch = ` | ${headContent.replace('ref: refs/heads/', '')}`;
        }
    } catch (e) {
        // 깃 저장소가 아니거나 HEAD 파일을 읽을 수 없음
    }

    // 상태 표시줄 출력
    console.log(`[${model}] ${currentDir}${gitBranch}`);
});
