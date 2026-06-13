# claude-agentic-study — 프로젝트 가이드

〈클로드 코드로 시작하는 실전 에이전틱 코딩〉 스터디 아카이브.
정본 규칙: [CONTRIBUTING.md](CONTRIBUTING.md) · 챕터 README 양식 [chapters/_TEMPLATE.md](chapters/_TEMPLATE.md) · 개인 정리본 규격 [.claude/skills/study-chapter](.claude/skills/study-chapter/SKILL.md)

## 진행 현황 갱신 규칙

챕터 작성(writer)이 끝나면 — 즉 `chapters/chNN/README.md`(공용) 또는 `chapters/chNN/<이름>/README.md`(개인 정리본) 작성·정리를 완료하면(직접 작성·서브에이전트 위임 모두 포함) — **메인 세션에서 사용자에게 루트 [README.md](README.md) "진행 현황" 표의 해당 챕터 상태 갱신 여부를 먼저 묻는다.**

- 승인 시: 표의 `상태` 칸을 갱신(`예정` → `진행중` / `완료`). 필요하면 `제목`·`기록` 링크도 함께 갱신한다.
- 거절 시: 표는 그대로 둔다.
- **묻지 않고 임의로 바꾸지 않는다.** 챕터 제목은 실물 책 목차 기준으로만 채운다(임의 생성 금지).

## 저장소 작업 규칙 (요약 — 상세는 CONTRIBUTING.md)

- 작업용 메모·초안은 `_drafts/`(gitignore)에만 둔다. 정리본만 커밋.
- 스테이징은 명시 경로만 — `git add -A` 금지(`_drafts/` 혼입 방지).
- 다른 참여자의 README 섹션은 수정·삭제 금지(본인 섹션만 채움).
- 응답은 한국어.
