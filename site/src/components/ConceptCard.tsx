import type { ConceptPick } from "../types/content";
import { Card } from "./Card";
import { AuthorChip } from "./AuthorChip";
import "./ConceptCard.css";

interface Props {
  pick: ConceptPick;
}

/** 개인이 고른 핵심 개념 카드. Card 기반. */
export function ConceptCard({ pick }: Props) {
  return (
    <Card as="article" className="concept-card">
      {/* 상단: 작성자 + 개념명 */}
      <div className="concept-card__header">
        <AuthorChip name={pick.author} size="sm" />
        <h3 className="concept-card__concept">{pick.concept}</h3>
      </div>

      {/* 본문 */}
      {pick.remind && (
        <div className="concept-card__section">
          <span className="concept-card__label">리마인드</span>
          <p className="concept-card__text">{pick.remind}</p>
        </div>
      )}

      {pick.meaning && (
        <div className="concept-card__section">
          <span className="concept-card__label">나에게 어떤 의미였나</span>
          <p className="concept-card__text">{pick.meaning}</p>
        </div>
      )}

      {/* LinkedIn 링크 */}
      {pick.linkedin && (
        <a
          href={pick.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="concept-card__linkedin"
        >
          LinkedIn 글 보기 ↗
        </a>
      )}
    </Card>
  );
}
