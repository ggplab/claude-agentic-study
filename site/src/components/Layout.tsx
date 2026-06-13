import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { ThemeToggle } from "../theme/ThemeToggle";
import "./Layout.css";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="layout">
      <header className="site-header">
        <div className="wrap header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">◆</span>
            <span className="brand-text">claude-agentic-study</span>
          </Link>
          <nav className="site-nav">
            <NavLink to="/" end className="nav-link">
              대시보드
            </NavLink>
            <NavLink to="/prototypes" className="nav-link">
              프로토타입
            </NavLink>
            <a
              className="nav-link"
              href="https://github.com/ggplab/claude-agentic-study"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="site-main">
        <div className="wrap">{children}</div>
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <span>
            〈클로드 코드로 시작하는 실전 에이전틱 코딩〉 스터디 아카이브
          </span>
          <span className="footer-note">
            README가 갱신되면 자동으로 다시 빌드됩니다.
          </span>
        </div>
      </footer>
    </div>
  );
}
