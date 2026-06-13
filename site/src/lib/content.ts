// content.json 으로의 타입 안전한 단일 진입점.
// 빌드 전 scripts/build-content.mjs 가 src/generated/content.json 을 생성한다.
import type {
  Chapter,
  Content,
  Member,
  Prototype,
} from "../types/content";
import raw from "../generated/content.json";

export const content = raw as Content;

export function getChapter(n: number): Chapter | undefined {
  return content.chapters.find((c) => c.number === n);
}

export function allPrototypes(): Prototype[] {
  return content.prototypes;
}

export function members(): Member[] {
  return content.members;
}

/** BASE_URL 을 반영한 프로토타입의 실제 로드 경로 */
export function prototypeUrl(p: Prototype): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${p.path.replace(/^\//, "")}`;
}

/** 원본 저장소(GitHub) 파일 링크 */
export function repoUrl(repoRelativePath: string): string {
  return `https://github.com/ggplab/claude-agentic-study/blob/main/${repoRelativePath}`;
}
