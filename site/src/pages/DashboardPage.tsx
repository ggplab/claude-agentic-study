import { content, members } from "../lib/content";
import { ProgressBar } from "../components/dashboard/ProgressBar";
import { StatCard } from "../components/dashboard/StatCard";
import { ChapterCard } from "../components/dashboard/ChapterCard";
import { MembersTable } from "../components/dashboard/MembersTable";
import "./DashboardPage.css";

/** 스터디 아카이브 메인 대시보드. 책 정보·진행 현황·챕터 그리드·참여자를 한 눈에 표시. */
export function DashboardPage() {
  const { book, chapters, stats } = content;
  const memberList = members();

  return (
    <main className="dashboard" aria-label="스터디 대시보드">
      {/* 1) 히어로: 책 정보 */}
      <section className="dashboard-hero" aria-labelledby="hero-title">
        <h1 className="dashboard-hero-book-title" id="hero-title">
          {book.title}
        </h1>
        <p className="dashboard-hero-book-subtitle">{book.subtitle}</p>
        <div className="dashboard-hero-book-meta">
          <span>저자 {book.author}</span>
          <span>출판 {book.publisher}</span>
          <span>{book.year}</span>
        </div>
        <hr className="dashboard-hero-divider" />
        <p className="dashboard-hero-desc">
          Claude Agentic AI 스터디 — 책의 핵심 개념을 함께 읽고, 개인 정리본과
          프로토타입을 축적하는 아카이브입니다.
        </p>
      </section>

      {/* 2) 진행 개요 */}
      <section aria-labelledby="overview-title">
        <h2 className="dashboard-section-title" id="overview-title">
          진행 개요
        </h2>
        <div className="dashboard-overview">
          <ProgressBar
            done={stats.done}
            total={stats.totalChapters}
            inProgress={stats.inProgress}
          />
        </div>
      </section>

      {/* 3) 통계 카드 */}
      <section aria-labelledby="stats-title">
        <h2 className="dashboard-section-title" id="stats-title">
          스터디 통계
        </h2>
        <div className="dashboard-stats-grid">
          <StatCard
            icon="✅"
            value={stats.done}
            label="완료 챕터"
          />
          <StatCard
            icon="💡"
            value={stats.conceptPicks}
            label="핵심 개념"
          />
          <StatCard
            icon="🔬"
            value={stats.prototypeCount}
            label="프로토타입"
          />
          <StatCard
            icon="👥"
            value={stats.contributors}
            label="기여자"
          />
        </div>
      </section>

      {/* 4) 챕터 그리드 */}
      <section aria-labelledby="chapters-title">
        <h2 className="dashboard-section-title" id="chapters-title">
          챕터 목록
        </h2>
        <div className="dashboard-chapter-grid">
          {chapters.map((chapter) => (
            <ChapterCard key={chapter.slug} chapter={chapter} />
          ))}
        </div>
      </section>

      {/* 5) 참여자 섹션 */}
      <section
        className="dashboard-members-section"
        aria-labelledby="members-title"
      >
        <h2 className="dashboard-section-title" id="members-title">
          참여자
        </h2>
        <MembersTable members={memberList} />
      </section>
    </main>
  );
}
