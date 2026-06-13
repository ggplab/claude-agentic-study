import { Link } from "react-router-dom";
import type { Chapter } from "../../types/content";
import { Card } from "../Card";
import { AuthorChip } from "../AuthorChip";
import { StatusBadge } from "../StatusBadge";
import "./ChapterCard.css";

interface Props {
  chapter: Chapter;
}

/** 챕터 한 건을 요약 표시하는 카드. 클릭 시 챕터 상세 페이지로 이동. */
export function ChapterCard({ chapter }: Props) {
  const isMuted = chapter.status === "예정" && !chapter.hasContent;

  return (
    <Link
      to={`/chapter/${chapter.number}`}
      className="chapter-card-link"
      aria-label={`${chapter.slug} ${chapter.title} — ${chapter.status}`}
    >
      <Card
        as="article"
        className={`chapter-card${isMuted ? " is-muted" : ""}${chapter.status === "완료" ? " is-done" : ""}`}
      >
        {/* 상단: 슬러그 + 상태 배지 */}
        <div className="chapter-card-top">
          <span className="chapter-card-slug">{chapter.slug}</span>
          <StatusBadge status={chapter.status} />
        </div>

        {/* 제목 */}
        <h3 className="chapter-card-title">{chapter.title}</h3>

        {/* 리드 */}
        <div className="chapter-card-lead">
          <AuthorChip name={chapter.lead} role="리드" size="sm" />
        </div>

        {/* 항목 수 배지 */}
        <div className="chapter-card-badges">
          {chapter.conceptPicks.length > 0 && (
            <span className="chapter-badge">
              <span className="chapter-badge-icon" aria-hidden>
                💡
              </span>
              핵심개념 {chapter.conceptPicks.length}
            </span>
          )}
          {chapter.notes.length > 0 && (
            <span className="chapter-badge">
              <span className="chapter-badge-icon" aria-hidden>
                📝
              </span>
              정리본 {chapter.notes.length}
            </span>
          )}
          {chapter.prototypes.length > 0 && (
            <span className="chapter-badge">
              <span className="chapter-badge-icon" aria-hidden>
                🔬
              </span>
              프로토타입 {chapter.prototypes.length}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
