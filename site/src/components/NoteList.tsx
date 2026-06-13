import { useState } from "react";
import type { PersonalNote } from "../types/content";
import { repoUrl } from "../lib/content";
import { AuthorChip } from "./AuthorChip";
import { MarkdownView } from "./MarkdownView";
import { PrototypeFrame } from "./PrototypeFrame";
import "./NoteList.css";

interface Props {
  notes: PersonalNote[];
}

/** 개인 정리본 목록. 각 항목은 접기/펼치기 토글. */
export function NoteList({ notes }: Props) {
  return (
    <div className="note-list">
      {notes.map((note) => (
        <NoteItem key={note.path} note={note} />
      ))}
    </div>
  );
}

function NoteItem({ note }: { note: PersonalNote }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="note-item">
      {/* 헤더 행 */}
      <div className="note-item__header">
        <button
          className="note-item__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="note-item__arrow" aria-hidden>
            {open ? "▾" : "▸"}
          </span>
          <span className="note-item__title">{note.title}</span>
        </button>

        <div className="note-item__meta">
          <AuthorChip name={note.author} role="작성자" size="sm" />
          <a
            href={repoUrl(note.path)}
            target="_blank"
            rel="noopener noreferrer"
            className="note-item__repo-link"
            title="GitHub 원본 보기"
          >
            GitHub 원본 ↗
          </a>
        </div>
      </div>

      {/* 펼쳐진 본문 */}
      {open && (
        <div className="note-item__body">
          {note.markdown ? (
            <MarkdownView markdown={note.markdown} />
          ) : (
            <p className="note-item__empty">정리본 내용이 없습니다.</p>
          )}

          {/* 해당 정리본의 프로토타입 */}
          {note.prototypes.length > 0 && (
            <div className="note-item__prototypes">
              <h4 className="note-item__proto-heading">관련 프로토타입</h4>
              {note.prototypes.map((proto) => (
                <PrototypeFrame
                  key={proto.path}
                  prototype={proto}
                  height="60vh"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
