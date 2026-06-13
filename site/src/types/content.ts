// 빌드 시 site/scripts/build-content.mjs 가 생성하는 content.json 의 계약(스키마).
// 파서(Stream A)와 UI(Stream B/C)는 이 타입을 단일 기준으로 삼는다.

export type ChapterStatus = "완료" | "진행중" | "예정";

export interface Book {
  title: string;
  subtitle: string;
  author: string;
  publisher: string;
  year: string;
}

export interface Member {
  name: string;
  /** 이 사람이 리드(담당)하는 챕터 번호들 */
  leadChapters: number[];
  github?: string;
  interests?: string;
}

/** HTML 프로토타입 한 건 */
export interface Prototype {
  title: string;
  /** 배포 기준 경로 (BASE_URL 뒤에 붙는다). 예: "prototypes/ch01/slides.html" */
  path: string;
  /** 작성자 (개인 폴더 하위면 폴더명, 챕터 루트면 리드) */
  author: string;
  chapter: number;
  /** 원본 저장소 경로. 예: "chapters/ch01/slides.html" */
  source: string;
}

/** `### 이름 — 개념` 으로 표기된 각자 고른 핵심 개념 */
export interface ConceptPick {
  author: string;
  concept: string;
  remind?: string;
  meaning?: string;
  linkedin?: string;
}

/** chapters/chNN/<이름>/README.md — 개인 정리본 */
export interface PersonalNote {
  author: string;
  /** 원본 저장소 경로. 예: "chapters/ch01/문종운/README.md" */
  path: string;
  title: string;
  markdown: string;
  prototypes: Prototype[];
}

export interface Chapter {
  number: number;
  /** 폴더 슬러그. 예: "ch01" */
  slug: string;
  lead: string;
  title: string;
  status: ChapterStatus;
  /** README 가 템플릿과 달라 실제 내용이 채워졌는지 */
  hasContent: boolean;
  /** H1 아래 첫 blockquote 요약 */
  summary: string;
  /** 원본 저장소 경로. 예: "chapters/ch01/README.md" */
  readmePath: string;
  /** 공용 README 전체 본문 (MarkdownView 용) */
  readmeMarkdown: string;
  conceptPicks: ConceptPick[];
  notes: PersonalNote[];
  prototypes: Prototype[];
  /** 루트 README 진행 현황 표의 기록 링크 (없으면 null) */
  recordLink: string | null;
}

export interface Stats {
  totalChapters: number;
  done: number;
  inProgress: number;
  planned: number;
  conceptPicks: number;
  prototypeCount: number;
  contributors: number;
}

export interface Content {
  /** 빌드 생성 시각 (ISO 8601) */
  generatedAt: string;
  book: Book;
  members: Member[];
  chapters: Chapter[];
  /** 전체 프로토타입 평탄화 목록 */
  prototypes: Prototype[];
  stats: Stats;
}
