# 5장 출력 인터페이스 — 실습 코드

책 5장에 나온 모든 코드를 바로 실행할 수 있게 개별 파일로 분리했다.

## 준비물

```bash
# jq (상태 표시줄 bash 스크립트가 JSON 파싱에 사용)
brew install jq          # macOS
# sudo apt-get install jq  # 우분투/데비안

# 실행 권한 부여 (한 번만)
chmod +x *.sh statusline.py statusline.js
```

## 상태 표시줄 스크립트 테스트

모든 스크립트는 stdin으로 JSON을 받아 한 줄을 출력한다.
`sample-input.json`을 파이프로 흘려보내 결과를 확인한다.

```bash
cat sample-input.json | ./statusline-basic.sh
# → [Opus 4.6] my-project

cat sample-input.json | ./statusline-cost.sh
# → [Opus 4.6] my-project | $0.0123 | +156 -23

cat sample-input.json | ./statusline-ansi.sh      # 색상 포함
cat sample-input.json | ./statusline-helpers.sh
cat sample-input.json | ./statusline-git.sh
cat sample-input.json | ./statusline-cached.sh    # /tmp에 5초 캐싱

cat sample-input.json | python3 statusline.py
cat sample-input.json | node statusline.js
```

> **깃 브랜치 표시** — `-git` / `-ansi` / `-cached` 스크립트와 py/js는 *현재 셸의 작업 디렉터리*가 깃 저장소일 때만 브랜치를 붙인다. 이 폴더가 깃 저장소가 아니면 브랜치 없이 나온다(정상). 저장소 안에서 돌려 보면 브랜치가 표시된다.

| 파일 | 표시 내용 |
|---|---|
| `statusline-basic.sh` | 모델 + 디렉터리 |
| `statusline-git.sh` | + 깃 브랜치 |
| `statusline-cost.sh` | + 비용 + 코드 변경량 |
| `statusline-helpers.sh` | 헬퍼 함수로 모듈화 |
| `statusline-ansi.sh` | ANSI 색상 적용 |
| `statusline-cached.sh` | 깃 브랜치 5초 캐싱(성능) |
| `statusline.py` | 파이썬 버전 |
| `statusline.js` | Node.js 버전 |

## 실제 클로드 코드에 적용

원하는 스크립트를 `~/.claude/statusline.sh`로 복사한 뒤 `settings.json`에 등록한다.

```bash
cp statusline-cost.sh ~/.claude/statusline.sh
chmod +x ~/.claude/statusline.sh
```

`~/.claude/settings.json` 또는 프로젝트 `.claude/settings.json`
(→ `settings.example.json` 참고):

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh",
    "padding": 0
  }
}
```

## 출력 스타일 테스트

`output-styles/`의 마크다운을 배치하면 `/config` → **Output style** 목록에 나타난다.

```bash
# 사용자 수준(모든 프로젝트) 또는 프로젝트 수준 중 택1
mkdir -p ~/.claude/output-styles
cp output-styles/*.md ~/.claude/output-styles/     # 사용자 수준
# cp output-styles/*.md .claude/output-styles/      # 프로젝트 수준
```

클로드 코드에서 `/config` → **Output style** 메뉴로 전환한다(예전 `/output-style` 명령은 v2.1.73 폐기 → v2.1.91 제거됨):

```
/config     # → Output style → korean-architecture-focused / team-verified-style 선택
```

| 파일 | 내용 |
|---|---|
| `korean-architecture-focused.md` | 한국어 응답 + 아키텍처 집중 |
| `team-standard.md` | 팀 코드 리뷰 표준 |
| `team-verified-style.md` | 환각 방지(출처·신뢰도 표기) |
