import type { Prototype } from "../types/content";
import { prototypeUrl } from "../lib/content";
import { AuthorChip } from "./AuthorChip";
import "./PrototypeFrame.css";

interface Props {
  prototype: Prototype;
  /** iframe 높이. 기본 70vh */
  height?: string;
}

/** HTML 프로토타입을 인앱 iframe 으로 미리 보여주는 카드. */
export function PrototypeFrame({ prototype: proto, height = "70vh" }: Props) {
  const src = prototypeUrl(proto);

  return (
    <div className="prototype-frame">
      {/* 상단 바 */}
      <div className="prototype-frame__bar">
        <span className="prototype-frame__title">{proto.title}</span>
        <AuthorChip name={proto.author} role="작성자" size="sm" />
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="prototype-frame__open"
        >
          새 탭에서 열기 ↗
        </a>
      </div>

      {/* 본문 iframe */}
      <div className="prototype-frame__body" style={{ height }}>
        <iframe
          src={src}
          title={proto.title}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          className="prototype-frame__iframe"
        />
      </div>
    </div>
  );
}
