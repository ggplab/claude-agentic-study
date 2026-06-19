# 기여 가이드

작은 스터디라 흐름은 가볍게 갑니다. 규칙은 최소만.

## 폴더 구조
```
chapters/
  _TEMPLATE.md        # 챕터 README 양식 (복사해서 사용)
  chNN/
    README.md         # 그 챕터의 공용 기록 (다 같이 채움)
    <이름>/           # (선택) 본인 정리본·결과물 코드
meetings/             # 회의록 (녹음·전사 원본은 gitignore)
_drafts/              # 개인 작업 파일 (gitignore — 푸시 안 됨)
.claude/skills/       # 프로젝트 스킬 — Claude Code가 자동 인식
```

## Claude Code로 작업하기

이 리포를 Claude Code에 열면(리포 루트에서 `claude` 실행) 프로젝트 스킬이 자동 등록됩니다. 직접 절차를 설명할 필요 없이 스킬을 호출하면 됩니다.

| 역할 | 스킬 | 사용법 |
|------|------|--------|
| 참여자 (매주) | [`/study-chapter`](.claude/skills/study-chapter/SKILL.md) | `/study-chapter <챕터번호> <이름>` 실행 후 읽기 메모를 붙여넣기. 개념정리 → **본인 클로드 시스템에서 적용예시 실측** → 챕터 README 기본글 → LinkedIn 초안까지 만들고, 정리본만 커밋·푸시 |
| 리더 (일요일 오후) | [`/order-session`](.claude/skills/order-session/SKILL.md) | `/order-session <챕터번호>` — 참여자 글을 읽어 중복 점검 + 발표 순서 제안 + README 기록 |

Claude Code 없이 직접 써도 됩니다. 스킬은 자동화일 뿐 산출물 형식은 동일합니다.

### 로컬 전용 vs 푸시 대상
- **푸시 대상**: 챕터 README 기본글, `chapters/chNN/<이름>/` 정리본·결과물
- **로컬 전용**: 읽기 원본 메모, LinkedIn 초안 등 작업 파일 → 리포 루트 `_drafts/`에 `chNN-` 접두 파일명으로 저장 (gitignore 처리되어 있음). 깊은 하위 폴더에 `_drafts/`를 또 만들지 않습니다
- LinkedIn 글은 발행 후 **링크만** 챕터 README 본인 섹션에 기록합니다

### 에이전트에게 시킬 때 주의 (사람이 직접 할 때도 동일)
- 챕터 README에서 **다른 참여자의 섹션은 수정·삭제 금지** — 본인 섹션만 채웁니다
- 챕터 제목·목차는 실물 책 기준. 임의 생성 금지
- `git add -A` 대신 명시 경로로 스테이징 — `_drafts/`나 무관 파일이 섞여 들어가는 것을 방지
- 적용예시는 본인 설정 파일(`~/.claude/` 등)을 실제로 열어 확인한 내용만. 추정 금지
- 개인 정리본(`chapters/chNN/<이름>/README.md`)을 작성·커밋하면 루트 `README.md`의 "개인 정리본 제출 현황" 표에서 **본인 칸만** `☐ → ☑` 로 갱신합니다. 다른 참여자의 칸은 건드리지 않습니다 (다른 참여자도 같은 방식으로 클로드로 작업하므로 이 규칙을 지킵니다)

## 챕터 추가
스터디가 새 챕터에 도달하면:
1. `chapters/chNN/` 폴더 생성
2. `_TEMPLATE.md`를 복사해 `chapters/chNN/README.md`로
3. 제목은 실물 책 목차대로 채움 (임의 생성 금지)
4. 루트 `README.md`의 진행 현황 표에 한 줄 추가

> `/study-chapter`를 쓰면 1~2번은 자동으로 처리됩니다.

## 기록할 때
- **각자 만든 것**: 표에 이름 / 무엇을 / 링크
- **결과물 위치**: 본인 레포·Gist 링크 OK, 또는 `chapters/chNN/<이름>/`에 직접
- **시행착오**: 막혔던 지점·삽질을 남겨야 다음 사람에게 도움이 됩니다

## 커밋 / PR
- 직접 push 또는 PR 둘 다 OK
- 커밋 메시지 예: `docs(ch02): 홍길동 2장 정리 + 기본글` 또는 가볍게 `ch01: 홍길동 - 커스텀 슬래시 커맨드 만들어봄`
- 푸시 전 확인 한 가지: `git status`에 `_drafts/` 파일이 보이면 안 됩니다 (보이면 gitignore가 깨진 것)
