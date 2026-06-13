import { Link, useParams } from "react-router-dom";
import { getChapter, repoUrl } from "../lib/content";
import { Card } from "../components/Card";
import { AuthorChip } from "../components/AuthorChip";
import { StatusBadge } from "../components/StatusBadge";
import { MarkdownView } from "../components/MarkdownView";
import { ConceptCard } from "../components/ConceptCard";
import { NoteList } from "../components/NoteList";
import { PrototypeFrame } from "../components/PrototypeFrame";
import "./ChapterPage.css";

/** 챕터 상세 페이지 */
export function ChapterPage() {
  const { n } = useParams();
  const chapter = getChapter(Number(n));

  /* 챕터 없음 처리 */
  if (!chapter) {
    return (
      <div className="chapter-not-found">
        <p className="chapter-not-found__msg">챕터를 찾을 수 없습니다.</p>
        <Link to="/" className="chapter-not-found__back">
          ← 대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  const hasReadme = !!chapter.readmeMarkdown?.trim();
  const hasConcepts = chapter.conceptPicks.length > 0;
  const hasNotes = chapter.notes.length > 0;
  const hasPrototypes = chapter.prototypes.length > 0;

  /* 챕터 수준 슬라이드(프로토타입 중 슬라이드성이 있는 것) — 모든 프로토타입 대상 */
  const slidePrototype = hasPrototypes ? chapter.prototypes[0] : null;

  return (
    <div className="chapter-page">
      {/* ── 헤더 ── */}
      <header className="chapter-header">
        <div className="chapter-header__top">
          <StatusBadge status={chapter.status} />
          <Link to="/" className="chapter-header__back">
            ← 목록으로
          </Link>
        </div>

        <h1 className="chapter-header__title">
          CHAPTER {chapter.slug.toUpperCase()} — {chapter.title}
        </h1>

        <div className="chapter-header__meta">
          <AuthorChip name={chapter.lead} role="리드" />
          {chapter.readmePath && (
            <a
              href={repoUrl(chapter.readmePath)}
              target="_blank"
              rel="noopener noreferrer"
              className="chapter-header__repo"
            >
              GitHub 원본 ↗
            </a>
          )}
          {chapter.recordLink && chapter.recordLink !== chapter.readmePath && (
            <a
              href={
                chapter.recordLink.startsWith("http")
                  ? chapter.recordLink
                  : repoUrl(chapter.recordLink)
              }
              target="_blank"
              rel="noopener noreferrer"
              className="chapter-header__record"
            >
              기록 링크 ↗
            </a>
          )}
        </div>

        {chapter.summary && (
          <p className="chapter-header__summary">{chapter.summary}</p>
        )}

        {/* 슬라이드 프로토타입 바로가기 */}
        {hasPrototypes && slidePrototype && (
          <div className="chapter-header__slide-hint">
            <span className="chapter-header__slide-label">슬라이드</span>
            <a href="#prototypes" className="chapter-header__slide-link">
              {slidePrototype.title} 바로가기 ↓
            </a>
          </div>
        )}
      </header>

      {/* ── 준비 중 챕터 ── */}
      {!chapter.hasContent ? (
        <Card className="chapter-pending">
          <p className="chapter-pending__msg">
            이 챕터는 아직 준비 중입니다.
          </p>
          <p className="chapter-pending__sub">
            리드: <AuthorChip name={chapter.lead} />
          </p>
        </Card>
      ) : (
        <>
          {/* ── 공용 README ── */}
          {hasReadme && (
            <section className="chapter-section">
              <h2 className="chapter-section__title">공용 README</h2>
              <Card className="chapter-readme">
                <MarkdownView markdown={chapter.readmeMarkdown} />
              </Card>
            </section>
          )}

          {/* ── 핵심 개념 ── */}
          {hasConcepts && (
            <section className="chapter-section">
              <h2 className="chapter-section__title">핵심 개념</h2>
              <div className="chapter-concept-grid">
                {chapter.conceptPicks.map((pick, i) => (
                  <ConceptCard key={`${pick.author}-${i}`} pick={pick} />
                ))}
              </div>
            </section>
          )}

          {/* ── 개인 정리본 ── */}
          {hasNotes && (
            <section className="chapter-section">
              <h2 className="chapter-section__title">개인 정리본</h2>
              <NoteList notes={chapter.notes} />
            </section>
          )}

          {/* ── 프로토타입 ── */}
          {hasPrototypes && (
            <section className="chapter-section" id="prototypes">
              <h2 className="chapter-section__title">프로토타입</h2>
              <div className="chapter-prototype-list">
                {chapter.prototypes.map((proto) => (
                  <PrototypeFrame key={proto.path} prototype={proto} />
                ))}
              </div>
            </section>
          )}

          {/* 콘텐츠가 있는 챕터인데 섹션이 모두 비어있는 경우 */}
          {!hasReadme && !hasConcepts && !hasNotes && !hasPrototypes && (
            <Card className="chapter-empty">
              <p>아직 등록된 내용이 없습니다.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
