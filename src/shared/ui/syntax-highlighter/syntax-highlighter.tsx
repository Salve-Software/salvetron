import { Highlight, themes } from "prism-react-renderer";

interface SyntaxHighlighterProps {
  code: string;
  language?: "json" | "javascript" | "typescript" | "html" | "css";
  className?: string;
}

export function SyntaxHighlighter({
  code,
  language = "json",
  className = "",
}: SyntaxHighlighterProps) {
  return (
    <Highlight theme={themes.nightOwl} code={code} language={language}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`text-xs bg-olive-950 rounded-lg p-3 overflow-x-auto max-h-96 overflow-y-auto ${className}`}
          style={{ ...style, backgroundColor: "transparent" }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
