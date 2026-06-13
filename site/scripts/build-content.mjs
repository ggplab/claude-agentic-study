/**
 * build-content.mjs
 * 저장소의 markdown/html을 파싱하여 content.json을 생성하고
 * 프로토타입 HTML 파일을 site/public/prototypes/ 에 복사한다.
 *
 * 실행 방법: node site/scripts/build-content.mjs
 * (cwd에 무관하게 __dirname 기준 경로를 계산한다)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ─── 경로 계산 ───────────────────────────────────────────────────────────────
const __dir = path.dirname(fileURLToPath(import.meta.url)); // = site/scripts
const repoRoot = path.resolve(__dir, "../.."); // = 저장소 루트
const outputPath = path.join(repoRoot, "site/src/generated/content.json");
const prototypesDestRoot = path.join(repoRoot, "site/public/prototypes");

// ─── 유틸리티 함수 ────────────────────────────────────────────────────────────

/** 파일을 UTF-8로 읽는다. 없으면 null 반환. */
function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

/** 디렉터리 항목 목록(전체 경로 포함). 없으면 빈 배열. */
function listDir(dirPath) {
  try {
    return fs.readdirSync(dirPath).map((name) => ({
      name,
      fullPath: path.join(dirPath, name),
    }));
  } catch {
    return [];
  }
}

/** stat 래퍼 — 실패 시 null */
function statSafe(p) {
  try {
    return fs.statSync(p);
  } catch {
    return null;
  }
}

/** mkdir -p */
function mkdirp(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// ─── 책 정보 파싱 ─────────────────────────────────────────────────────────────

/**
 * 루트 README.md "## 책 정보" 섹션에서 Book 객체를 추출한다.
 * 실패하는 필드는 빈 문자열로 채운다.
 */
function parseBook(readmeText) {
  const book = { title: "", subtitle: "", author: "", publisher: "", year: "" };

  // "## 책 정보" 섹션 추출
  const sectionMatch = readmeText.match(/## 책 정보([\s\S]*?)(?:\n## |\n---|\n#[^#]|$)/);
  if (!sectionMatch) return book;
  const section = sectionMatch[1];

  // 제목
  const titleMatch = section.match(/- 제목:\s*(.+)/);
  if (titleMatch) book.title = titleMatch[1].trim();

  // 부제
  const subtitleMatch = section.match(/- 부제:\s*(.+)/);
  if (subtitleMatch) book.subtitle = subtitleMatch[1].trim();

  // 저자 / 출판
  const authorPublisherMatch = section.match(/- 저자:\s*(.+?)\s*\/\s*출판:\s*(.+?)\s*\((\d{4})/);
  if (authorPublisherMatch) {
    book.author = authorPublisherMatch[1].trim();
    book.publisher = authorPublisherMatch[2].trim();
    book.year = authorPublisherMatch[3].trim();
  }

  return book;
}

// ─── 진행 현황 표 파싱 ────────────────────────────────────────────────────────

/**
 * 루트 README.md "## 진행 현황" 아래 markdown 표를 파싱한다.
 * 헤더: | 챕터 | 리드 | 제목 | 상태 | 기록 |
 * 챕터 목록의 기준이 된다.
 */
function parseProgressTable(readmeText) {
  const sectionMatch = readmeText.match(/## 진행 현황([\s\S]*?)(?:\n## |\n---|\n#[^#]|$)/);
  if (!sectionMatch) return [];
  const section = sectionMatch[1];

  const rows = [];
  const lines = section.split("\n");

  for (const line of lines) {
    // 데이터 행: | 숫자 | ... | 형식
    const cellMatch = line.match(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
    if (!cellMatch) continue;

    const [, chapterStr, lead, title, statusRaw, recordRaw] = cellMatch;

    const number = parseInt(chapterStr, 10);
    const slug = "ch" + String(number).padStart(2, "0");

    // 상태 정규화
    let status = "예정";
    const st = statusRaw.trim();
    if (st === "완료") status = "완료";
    else if (st === "진행중") status = "진행중";

    // 기록 링크 추출: [텍스트](대상) → 대상. "—"이나 빈칸이면 null.
    let recordLink = null;
    const linkMatch = recordRaw.trim().match(/\[([^\]]*)\]\(([^)]+)\)/);
    if (linkMatch) {
      recordLink = linkMatch[2].trim();
    }

    rows.push({
      number,
      slug,
      lead: lead.trim(),
      title: title.trim(),
      status,
      recordLink,
    });
  }

  return rows;
}

// ─── members.md 파싱 ──────────────────────────────────────────────────────────

/**
 * members.md의 표를 파싱한다.
 * 헤더: | 이름 | 맡은 챕터 (리드) | GitHub | 관심사 / 만들고 싶은 것 |
 */
function parseMembers(membersText) {
  const members = [];
  const lines = membersText.split("\n");

  for (const line of lines) {
    // 헤더 행, 구분 행 제외 — 첫 셀이 이름인 데이터 행만 추출
    const cellMatch = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|/);
    if (!cellMatch) continue;

    const [, name, chaptersRaw, githubRaw, interestsRaw] = cellMatch;

    // 헤더 행 스킵
    if (name.trim() === "이름" || name.trim().startsWith("-")) continue;

    // leadChapters: "1, 6" → [1, 6]
    const leadChapters = chaptersRaw
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const member = { name: name.trim(), leadChapters };

    const github = githubRaw.trim();
    if (github) member.github = github;

    const interests = interestsRaw.trim();
    if (interests) member.interests = interests;

    members.push(member);
  }

  return members;
}

// ─── 챕터 README 파싱 ─────────────────────────────────────────────────────────

/** 템플릿 placeholder 패턴 — summary 내용이 이에 해당하면 "" 처리 */
const TEMPLATE_SUMMARY_PATTERNS = [
  "책에서 이 챕터가",
  "무엇을 해야 한다",
  "한두 줄로.",
];

/**
 * blockquote 텍스트가 템플릿 placeholder인지 판단한다.
 */
function isTemplateSummary(text) {
  return TEMPLATE_SUMMARY_PATTERNS.some((pat) => text.includes(pat));
}

/**
 * "### 이름 — 개념" 헤딩이 placeholder인지 판단한다.
 * 이름 또는 개념에 "<" 가 포함되면 placeholder.
 */
function isPlaceholderConcept(author, concept) {
  return author.includes("<") || concept.includes("<");
}

/** 값이 placeholder인지 확인 (빈 문자열이거나 "(발행 후 링크)" 형태 등) */
function isPlaceholderValue(value) {
  if (!value || value.trim() === "") return true;
  const v = value.trim();
  // "(..." 형태의 괄호 안 설명은 placeholder로 간주
  if (v.startsWith("(") && v.endsWith(")")) return true;
  return false;
}

/**
 * 챕터 공용 README에서 conceptPicks를 파싱한다.
 * "## 🎯 각자 고른 핵심 개념" 섹션 안의 "### 이름 — 개념" 헤딩들을 추출.
 */
function parseConceptPicks(readmeText) {
  const picks = [];

  // "## 🎯 각자 고른 핵심 개념" 섹션 추출
  const sectionMatch = readmeText.match(
    /##\s+[^\n]*각자 고른 핵심 개념[^\n]*([\s\S]*?)(?:\n## |\n#[^#]|$)/
  );
  if (!sectionMatch) return picks;

  const section = sectionMatch[1];

  // "### 이름 — 개념" 헤딩 분리
  const headingRegex = /###\s+([^—\n]+?)\s*[—–-]\s*([^\n]+)/g;
  let match;

  while ((match = headingRegex.exec(section)) !== null) {
    const authorRaw = match[1].trim();
    const conceptRaw = match[2].trim();

    // placeholder 헤딩 스킵
    if (isPlaceholderConcept(authorRaw, conceptRaw)) continue;

    // 이 헤딩 다음 "###" 또는 "##" 전까지의 내용 추출
    const startIdx = match.index + match[0].length;
    const restSection = section.slice(startIdx);
    const nextHeadingIdx = restSection.search(/\n##/);
    const body = nextHeadingIdx >= 0 ? restSection.slice(0, nextHeadingIdx) : restSection;

    const pick = { author: authorRaw, concept: conceptRaw };

    // 불릿에서 필드 추출
    const remindMatch = body.match(/- \*\*내용 리마인드\*\*:\s*([^\n]+)/);
    if (remindMatch && !isPlaceholderValue(remindMatch[1])) {
      pick.remind = remindMatch[1].trim();
    }

    const meaningMatch = body.match(/- \*\*나에게 어떤 의미였나\*\*:\s*([^\n]+)/);
    if (meaningMatch && !isPlaceholderValue(meaningMatch[1])) {
      pick.meaning = meaningMatch[1].trim();
    }

    const linkedinMatch = body.match(/- \*\*LinkedIn\*\*:\s*([^\n]+)/);
    if (linkedinMatch && !isPlaceholderValue(linkedinMatch[1])) {
      pick.linkedin = linkedinMatch[1].trim();
    }

    picks.push(pick);
  }

  return picks;
}

/**
 * 챕터 README에서 summary(H1 다음 첫 blockquote)를 추출한다.
 * 템플릿 placeholder이면 "" 반환.
 */
function parseSummary(readmeText) {
  // H1 이후 첫 번째 blockquote 추출
  const afterH1 = readmeText.replace(/^#[^#][^\n]*\n/, "");
  const blockquoteMatch = afterH1.match(/^>\s*(.+)/m);
  if (!blockquoteMatch) return "";

  const text = blockquoteMatch[1].trim();
  if (isTemplateSummary(text)) return "";
  return text;
}

/**
 * README 텍스트에서 H1 제목을 추출한다. 없으면 fallback 반환.
 */
function parseH1(text, fallback) {
  const match = text.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : fallback;
}

/**
 * README 텍스트에서 **리드**: 이름 패턴을 추출한다. 없으면 null.
 */
function parseLead(text) {
  const match = text.match(/\*\*리드\*\*:\s*([^\n]+)/);
  return match ? match[1].trim() : null;
}

// ─── 프로토타입 경로 매핑 ─────────────────────────────────────────────────────

/**
 * source 경로(예: "chapters/ch01/slides.html")에서
 * 배포 기준 path(예: "prototypes/ch01/slides.html")를 계산한다.
 */
function sourceToDeployPath(source) {
  // "chapters/" 제거 후 "prototypes/" 앞에 붙임
  const withoutChapters = source.replace(/^chapters\//, "");
  return "prototypes/" + withoutChapters;
}

/**
 * HTML 파일을 site/public/prototypes/ 로 복사한다.
 * 상위 디렉터리가 없으면 생성한다.
 */
function copyPrototype(source, deployPath) {
  const srcAbsPath = path.join(repoRoot, source);
  const destAbsPath = path.join(prototypesDestRoot, deployPath.replace(/^prototypes\//, ""));

  mkdirp(path.dirname(destAbsPath));
  fs.copyFileSync(srcAbsPath, destAbsPath);
}

// ─── 챕터 스캔 ────────────────────────────────────────────────────────────────

/**
 * 챕터 폴더(repoRoot/chapters/chNN/)를 스캔하여 Chapter 객체를 구성한다.
 * tableRow: parseProgressTable()의 결과 행.
 */
function buildChapter(tableRow) {
  const { number, slug, lead: tableLead, title, status, recordLink } = tableRow;
  const chapterDir = path.join(repoRoot, "chapters", slug);

  // 폴더가 없으면 내용 없는 챕터
  const dirStat = statSafe(chapterDir);
  if (!dirStat || !dirStat.isDirectory()) {
    return {
      number,
      slug,
      lead: tableLead,
      title,
      status,
      hasContent: false,
      summary: "",
      readmePath: "",
      readmeMarkdown: "",
      conceptPicks: [],
      notes: [],
      prototypes: [],
      recordLink,
    };
  }

  // 공용 README 읽기
  const readmePath = `chapters/${slug}/README.md`;
  const readmeAbsPath = path.join(chapterDir, "README.md");
  const readmeMarkdown = readFileSafe(readmeAbsPath) || "";

  // lead: README에서 추출, 없으면 표 값
  const lead = parseLead(readmeMarkdown) || tableLead;

  // summary
  const summary = parseSummary(readmeMarkdown);

  // conceptPicks
  const conceptPicks = parseConceptPicks(readmeMarkdown);

  // 챕터 루트 *.html (하위 폴더 제외)
  const rootPrototypes = [];
  const entries = listDir(chapterDir);
  for (const entry of entries) {
    const st = statSafe(entry.fullPath);
    if (!st || !st.isFile()) continue;
    if (!entry.name.endsWith(".html")) continue;

    const source = `chapters/${slug}/${entry.name}`;
    const deployPath = sourceToDeployPath(source);
    rootPrototypes.push({
      title: entry.name,
      path: deployPath,
      author: lead,
      chapter: number,
      source,
    });
  }

  // 하위 디렉터리(개인 폴더) 스캔
  const notes = [];
  for (const entry of entries) {
    const st = statSafe(entry.fullPath);
    if (!st || !st.isDirectory()) continue;

    const noteReadmePath = `chapters/${slug}/${entry.name}/README.md`;
    const noteReadmeAbsPath = path.join(entry.fullPath, "README.md");
    const noteMarkdown = readFileSafe(noteReadmeAbsPath);
    if (noteMarkdown === null) continue; // README 없는 폴더는 개인 폴더로 보지 않음

    const noteTitle = parseH1(noteMarkdown, entry.name);

    // 개인 폴더 안의 *.html
    const notePrototypes = [];
    const noteEntries = listDir(entry.fullPath);
    for (const ne of noteEntries) {
      const nst = statSafe(ne.fullPath);
      if (!nst || !nst.isFile()) continue;
      if (!ne.name.endsWith(".html")) continue;

      const source = `chapters/${slug}/${entry.name}/${ne.name}`;
      const deployPath = sourceToDeployPath(source);
      notePrototypes.push({
        title: ne.name,
        path: deployPath,
        author: entry.name,
        chapter: number,
        source,
      });
    }

    notes.push({
      author: entry.name,
      path: noteReadmePath,
      title: noteTitle,
      markdown: noteMarkdown,
      prototypes: notePrototypes,
    });
  }

  // hasContent 계산
  const hasContent =
    conceptPicks.length > 0 ||
    notes.length > 0 ||
    rootPrototypes.length > 0 ||
    summary !== "";

  return {
    number,
    slug,
    lead,
    title,
    status,
    hasContent,
    summary,
    readmePath,
    readmeMarkdown,
    conceptPicks,
    notes,
    prototypes: rootPrototypes,
    recordLink,
  };
}

// ─── 프로토타입 파일 복사 ─────────────────────────────────────────────────────

/**
 * 모든 챕터의 프로토타입 파일을 site/public/prototypes/ 로 복사한다.
 */
function copyAllPrototypes(chapters) {
  mkdirp(prototypesDestRoot);
  for (const chapter of chapters) {
    for (const proto of chapter.prototypes) {
      copyPrototype(proto.source, proto.path);
    }
    for (const note of chapter.notes) {
      for (const proto of note.prototypes) {
        copyPrototype(proto.source, proto.path);
      }
    }
  }
}

// ─── 전체 프로토타입 목록 평탄화 ─────────────────────────────────────────────

/**
 * 모든 챕터의 prototypes + notes.prototypes를 중복 없이 평탄화한다.
 * source를 key로 중복 제거.
 */
function flattenPrototypes(chapters) {
  const seen = new Set();
  const all = [];

  for (const chapter of chapters) {
    for (const proto of chapter.prototypes) {
      if (!seen.has(proto.source)) {
        seen.add(proto.source);
        all.push(proto);
      }
    }
    for (const note of chapter.notes) {
      for (const proto of note.prototypes) {
        if (!seen.has(proto.source)) {
          seen.add(proto.source);
          all.push(proto);
        }
      }
    }
  }

  return all;
}

// ─── stats 계산 ───────────────────────────────────────────────────────────────

/**
 * Stats 객체를 계산한다.
 * contributors = conceptPicks.author ∪ notes.author ∪ prototypes.author 의 distinct 개수.
 */
function buildStats(chapters, allPrototypes) {
  let done = 0;
  let inProgress = 0;
  let planned = 0;
  let conceptPicksCount = 0;
  const contributorSet = new Set();

  for (const chapter of chapters) {
    if (chapter.status === "완료") done++;
    else if (chapter.status === "진행중") inProgress++;
    else planned++;

    conceptPicksCount += chapter.conceptPicks.length;

    for (const pick of chapter.conceptPicks) {
      contributorSet.add(pick.author);
    }
    for (const note of chapter.notes) {
      contributorSet.add(note.author);
      for (const proto of note.prototypes) {
        contributorSet.add(proto.author);
      }
    }
    for (const proto of chapter.prototypes) {
      contributorSet.add(proto.author);
    }
  }

  return {
    totalChapters: chapters.length,
    done,
    inProgress,
    planned,
    conceptPicks: conceptPicksCount,
    prototypeCount: allPrototypes.length,
    contributors: contributorSet.size,
  };
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

function main() {
  // 루트 README.md 읽기
  const rootReadme = readFileSafe(path.join(repoRoot, "README.md")) || "";

  // Book 파싱
  const book = parseBook(rootReadme);

  // 진행 현황 표 파싱 (챕터 기준 목록)
  const tableRows = parseProgressTable(rootReadme);

  // members.md 파싱
  const membersText = readFileSafe(path.join(repoRoot, "members.md")) || "";
  const members = parseMembers(membersText);

  // 각 챕터 구성
  const chapters = tableRows.map((row) => buildChapter(row));

  // 프로토타입 파일 복사
  copyAllPrototypes(chapters);

  // 전체 프로토타입 평탄화
  const allPrototypes = flattenPrototypes(chapters);

  // stats 계산
  const stats = buildStats(chapters, allPrototypes);

  // Content 객체 조립
  const content = {
    generatedAt: new Date().toISOString(),
    book,
    members,
    chapters,
    prototypes: allPrototypes,
    stats,
  };

  // content.json 출력
  mkdirp(path.dirname(outputPath));
  fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), "utf-8");

  // 콘솔 요약
  console.log(
    `[build-content] 챕터 ${stats.totalChapters}개 / 프로토타입 ${stats.prototypeCount}개 / 기여자 ${stats.contributors}명`
  );
}

main();
