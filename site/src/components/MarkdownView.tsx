import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import "./MarkdownView.css";

interface Props {
  markdown: string;
}

/** react-markdown + remark-gfm 기반 마크다운 렌더러. */
export function MarkdownView({ markdown }: Props) {
  const components: Components = {
    a({ href, children, ...rest }) {
      const isExternal =
        href?.startsWith("http://") || href?.startsWith("https://");
      return (
        <a
          href={href}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...rest}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
