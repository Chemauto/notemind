import ReactMarkdown from "react-markdown";

interface PreviewProps {
  markdown: string;
}

export function MarkdownPreview({ markdown }: PreviewProps) {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
