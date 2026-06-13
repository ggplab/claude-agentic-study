import type { ChapterStatus } from "../types/content";
import "./StatusBadge.css";

const LABEL: Record<ChapterStatus, string> = {
  완료: "완료",
  진행중: "진행중",
  예정: "예정",
};

const CLASS: Record<ChapterStatus, string> = {
  완료: "is-done",
  진행중: "is-progress",
  예정: "is-planned",
};

export function StatusBadge({ status }: { status: ChapterStatus }) {
  return (
    <span className={`status-badge ${CLASS[status]}`}>
      <span className="status-dot" aria-hidden />
      {LABEL[status]}
    </span>
  );
}
