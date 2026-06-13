import type { CSSProperties, ReactNode } from "react";
import "./Card.css";

interface Props {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  style?: CSSProperties;
}

/** 입체감 있는 표면 컨테이너. 대시보드/상세 카드의 공통 기반. */
export function Card({ children, className = "", as = "div", style }: Props) {
  const Tag = as;
  return (
    <Tag className={`card ${className}`.trim()} style={style}>
      {children}
    </Tag>
  );
}
