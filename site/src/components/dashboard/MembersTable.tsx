import type { Member } from "../../types/content";
import { Card } from "../Card";
import { AuthorChip } from "../AuthorChip";
import "./MembersTable.css";

interface Props {
  members: Member[];
}

/** 스터디 참여자 목록. 이름·담당 챕터·깃허브·관심사 표시. */
export function MembersTable({ members }: Props) {
  if (members.length === 0) {
    return <p className="members-empty">참여자 정보가 없습니다.</p>;
  }

  return (
    <ul className="members-list" role="list">
      {members.map((member) => (
        <li key={member.name}>
          <Card className="member-row">
            {/* 이름 + 부가 정보 */}
            <div className="member-row-info">
              <AuthorChip name={member.name} size="md" />
              <div className="member-row-meta">
                {member.github && (
                  <a
                    href={`https://github.com/${member.github}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="member-github-link"
                    aria-label={`${member.name}의 GitHub 프로필`}
                  >
                    GitHub @{member.github}
                  </a>
                )}
                {member.interests && (
                  <span className="member-interests">
                    관심사: {member.interests}
                  </span>
                )}
              </div>
            </div>

            {/* 담당 챕터 */}
            {member.leadChapters.length > 0 && (
              <div className="member-chapters">
                <span className="member-chapters-label">담당</span>
                {member.leadChapters.map((n) => (
                  <span key={n} className="member-chapter-chip">
                    ch{String(n).padStart(2, "0")}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </li>
      ))}
    </ul>
  );
}
