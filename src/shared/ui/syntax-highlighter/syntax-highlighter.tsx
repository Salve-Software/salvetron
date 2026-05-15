import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Icon } from "../icon";

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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-olive-800/80 hover:bg-olive-700 transition-colors duration-150 opacity-0 group-hover:opacity-100"
        title="Copy to clipboard"
      >
        <Icon
          name={copied ? "checkmark" : "copy"}
          size={14}
          className={copied ? "text-green-400" : "text-olive-300"}
        />
      </button>
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
    </div>
  );
}
