import "./AuthorChip.css";

interface Props {
  name: string;
  /** 라벨 접두사. 예: "작성자" → "작성자 문종운" */
  role?: string;
  size?: "sm" | "md";
}

/** 이름 앞 한 글자로 만든 색 아바타 + 이름 칩. 작성자 표시에 전역 사용. */
export function AuthorChip({ name, role, size = "md" }: Props) {
  const initial = name.trim().charAt(0) || "?";
  const hue = hashHue(name);
  return (
    <span className={`author-chip size-${size}`} title={role ? `${role}: ${name}` : name}>
      <span
        className="author-avatar"
        style={{ background: `hsl(${hue} 65% 45%)` }}
        aria-hidden
      >
        {initial}
      </span>
      {role && <span className="author-role">{role}</span>}
      <span className="author-name">{name}</span>
    </span>
  );
}

function hashHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}
