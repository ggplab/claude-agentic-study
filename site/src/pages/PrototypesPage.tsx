import { Link } from "react-router-dom";
import { allPrototypes, prototypeUrl } from "../lib/content";
import type { Prototype } from "../types/content";
import { AuthorChip } from "../components/AuthorChip";
import { PrototypeFrame } from "../components/PrototypeFrame";
import "./PrototypesPage.css";

/** 전체 프로토타입 갤러리 페이지. 챕터별로 그룹핑. */
export function PrototypesPage() {
  const prototypes = allPrototypes();

  if (prototypes.length === 0) {
    return (
      <div className="prototypes-page">
        <h1 className="prototypes-page__heading">프로토타입 갤러리</h1>
        <p className="prototypes-page__empty">
          아직 등록된 프로토타입이 없습니다.
        </p>
      </div>
    );
  }

  /* 챕터 번호 기준 그룹핑 */
  const grouped = groupByChapter(prototypes);
  const chapterNums = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="prototypes-page">
      <h1 className="prototypes-page__heading">프로토타입 갤러리</h1>
      <p className="prototypes-page__sub">
        총 {prototypes.length}개의 프로토타입
      </p>

      {chapterNums.map((chNum) => {
        const items = grouped[chNum];
        const chapterSlug = `ch${String(chNum).padStart(2, "0")}`;

        return (
          <section key={chNum} className="prototypes-chapter">
            <div className="prototypes-chapter__header">
              <h2 className="prototypes-chapter__title">
                CHAPTER {chapterSlug.toUpperCase()}
              </h2>
              <Link
                to={`/chapter/${chNum}`}
                className="prototypes-chapter__link"
              >
                챕터 상세 보기 →
              </Link>
            </div>

            <div className="prototypes-chapter__grid">
              {items.map((proto) => (
                <PrototypeCard key={proto.path} proto={proto} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** 개별 프로토타입 카드 (미리보기 포함) */
function PrototypeCard({ proto }: { proto: Prototype }) {
  const src = prototypeUrl(proto);

  return (
    <article className="proto-card">
      {/* 카드 헤더 */}
      <div className="proto-card__header">
        <span className="proto-card__title">{proto.title}</span>
        <div className="proto-card__meta">
          <AuthorChip name={proto.author} role="작성자" size="sm" />
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="proto-card__open"
          >
            새 탭에서 열기 ↗
          </a>
        </div>
      </div>

      {/* iframe 미리보기 */}
      <PrototypeFrame prototype={proto} height="360px" />
    </article>
  );
}

/** 챕터 번호 기준 그룹핑 */
function groupByChapter(
  prototypes: Prototype[]
): Record<number, Prototype[]> {
  return prototypes.reduce<Record<number, Prototype[]>>((acc, proto) => {
    const ch = proto.chapter;
    if (!acc[ch]) acc[ch] = [];
    acc[ch].push(proto);
    return acc;
  }, {});
}
