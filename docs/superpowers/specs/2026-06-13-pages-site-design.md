# claude-agentic-study Pages — 설계 문서

- 작성일: 2026-06-13
- 브랜치: `worktree-pages-site`
- 배포 대상: `ggplab/claude-agentic-study` → GitHub Pages (`https://ggplab.github.io/claude-agentic-study/`)

## 1. 목표

스터디 아카이브를 한눈에 보는 **React 기반 GitHub Pages 대시보드**. 데이터의 단일 원천(source of truth)은 저장소의 markdown(README들)이며, **작성자가 README를 작성·push 하면 GitHub Actions가 자동으로 재빌드·배포**한다.

요구사항:
1. 각 챕터 내용 보기
2. HTML 프로토타입이 있으면 페이지 안에서 보는 view (iframe)
3. 파일별 작성자 표시
4. 진행 현황 대시보드
5. README → 자동 갱신
6. 본 설계를 CLAUDE.md에 기록
7. 독립 작업은 병렬로 진행

## 2. 아키텍처

```
저장소 markdown/html (source of truth)
   │  site/scripts/build-content.mjs  (Node, 빌드 전 실행: prebuild/predev)
   ▼
site/src/generated/content.json  +  site/public/prototypes/**.html   (gitignore — 빌드 시 재생성)
   │  Vite + React 빌드 (base: /claude-agentic-study/)
   ▼
site/dist  →  GitHub Actions(.github/workflows/pages.yml) → Pages
```

- 앱 위치: 저장소 내 `/site` (Vite + React + TypeScript)
- 라우팅: **HashRouter** (프로젝트 Pages의 SPA 404 회피)
- 갱신 트리거: `chapters/**`, `README.md`, `members.md`, `site/**` push → 워크플로 실행 → `npm run build`(prebuild가 content 재생성) → Pages 배포
- 생성물(`content.json`, `public/prototypes/`, `dist`, `node_modules`)은 **커밋하지 않는다.** markdown/html이 원천이며 빌드 때마다 재생성된다.

## 3. 데이터 파이프라인 — `site/scripts/build-content.mjs` (순수 Node)

저장소 루트를 걸어 다니며 파싱 → `site/src/generated/content.json` 생성 + HTML을 `site/public/prototypes/`로 복사.

파싱 원천:
- 루트 `README.md` "진행 현황" 표 → `{number, lead, title, status, recordLink}`
- 루트 `README.md` "책 정보" → `book`
- `members.md` 표 → 참여자 + 담당(리드) 챕터
- `chapters/chNN/README.md` → 제목(H1)·요약(첫 blockquote)·리드(`**리드**:`)·핵심개념 섹션(`### 이름 — 개념`; `<이름>` 플레이스홀더 및 빈 슬롯 제외)·전체 본문 markdown
- `chapters/chNN/<이름>/README.md` → **작성자 = 폴더명**, 제목, 본문 markdown
- `*.html` → 프로토타입 `{title, path, author, chapter, source}` (개인 폴더 하위 = 폴더명, 챕터 루트 = 리드)

## 4. content.json 스키마 (계약 — `site/src/types/content.ts`)

```ts
interface Content {
  generatedAt: string;
  book: { title: string; subtitle: string; author: string; publisher: string; year: string };
  members: Member[];
  chapters: Chapter[];
  prototypes: Prototype[];          // 전체 프로토타입 평탄화 목록
  stats: {
    totalChapters: number; done: number; inProgress: number; planned: number;
    conceptPicks: number; prototypeCount: number; contributors: number;
  };
}
interface Member { name: string; leadChapters: number[]; github?: string; interests?: string }
interface Chapter {
  number: number; slug: string; lead: string; title: string;
  status: "완료" | "진행중" | "예정"; hasContent: boolean;
  summary: string; readmePath: string; readmeMarkdown: string;
  conceptPicks: ConceptPick[]; notes: PersonalNote[]; prototypes: Prototype[];
  recordLink: string | null;
}
interface ConceptPick { author: string; concept: string; remind?: string; meaning?: string; linkedin?: string }
interface PersonalNote { author: string; path: string; title: string; markdown: string; prototypes: Prototype[] }
interface Prototype { title: string; path: string; author: string; chapter: number; source: string }
```

## 5. 화면 / 라우트

- `#/` 대시보드: 진행률 바(N/10 완료) · 10챕터 상태 카드(StatusBadge) · 참여자(담당 챕터) · 통계 카드
- `#/chapter/:n` 챕터 상세: README 렌더(react-markdown + remark-gfm) · 작성자별 핵심개념 카드 · 개인 정리본 목록(작성자 칩) · 프로토타입 iframe 뷰어(작성자 라벨 + 새 탭 열기)
- `#/prototypes` 갤러리: 전체 HTML 프로토타입 모음(작성자·챕터별)
- 공통 레이아웃: 상단 네비 + **라이트/다크 토글**(localStorage + `prefers-color-scheme`), 푸터(원천 저장소 링크)

## 6. 컴포넌트 (단일 책임)

- 테마: `ThemeProvider`, `ThemeToggle`, `theme/tokens.css`
- 공통: `Layout`, `AuthorChip`, `StatusBadge`, `Card`
- 대시보드: `ProgressBar`, `ChapterGrid`/`ChapterCard`, `MembersTable`, `StatCard`
- 상세: `MarkdownView`(react-markdown 래퍼), `PrototypeFrame`(iframe), `ConceptCard`, `NoteList`
- 페이지: `pages/DashboardPage`, `pages/ChapterPage`, `pages/PrototypesPage`
- 데이터 접근: `lib/content.ts` (generated/content.json 타입 임포트)

## 7. 배포 — `.github/workflows/pages.yml`

- 트리거: `push` to `main`, paths `chapters/**`, `README.md`, `members.md`, `site/**` + `workflow_dispatch`
- job: checkout → `actions/setup-node`(node 20, cache npm) → `cd site && npm ci && npm run build` → `actions/upload-pages-artifact`(site/dist) → `actions/deploy-pages`
- 권한: `contents: read, pages: write, id-token: write`; concurrency: `pages`
- 1회 수동: 저장소 Settings → Pages → Source = "GitHub Actions" (가능하면 `gh api`로 활성화 시도)

## 8. 저장소 위생

`.gitignore`에 추가: `site/node_modules/`, `site/dist/`, `site/src/generated/`, `site/public/prototypes/`. 스테이징은 명시 경로만(`git add -A` 금지).

## 9. 구현 순서 (병렬화 전략)

**Phase 0 (순차, 공통 기반)**: 스캐폴드(package.json[모든 deps+scripts]·vite·tsconfig·index.html·main.tsx) · `types/content.ts` · 테마 · 공통 컴포넌트(Layout/AuthorChip/StatusBadge/Card) · `App.tsx`(라우트 + 스텁 페이지) · 대표 fixture `generated/content.json` + `public/prototypes/` 복사 · `lib/content.ts` · `npm install` + 빌드 확인 · `.gitignore`.

**Phase 1 (병렬 4스트림 — 파일 집합 분리)**:
- A `scripts/build-content.mjs` 실제 파서 (스키마 준수, fixture 대체)
- B `DashboardPage` + 대시보드 컴포넌트
- C `ChapterPage` + `PrototypesPage` + `MarkdownView`/`PrototypeFrame`/`ConceptCard`
- D `.github/workflows/pages.yml` + `site/README.md` + CLAUDE.md Pages 섹션

**Phase 2 (순차, 통합)**: 실제 파서 실행(→ 실제 content.json) · typecheck · build · 통합 수정 · 검증 · 커밋.

## 10. 검증 기준

- `cd site && npm run build` 성공(파서 → content.json → vite 빌드, 0 에러)
- 타입체크 통과(fixture/실데이터 모두 `types/content.ts` 준수)
- 대시보드에 10챕터·진행률·참여자·통계 표시
- ch01 상세에서 slides.html / 문종운-소개.html iframe 렌더 + 작성자 표시
- README 수정 후 재빌드 시 변경이 반영(파이프라인 재생성 확인)
