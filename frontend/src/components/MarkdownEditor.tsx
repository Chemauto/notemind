import { forwardRef } from "react";
import ReactMarkdown from "react-markdown";

import { Textarea } from "@/components/ui/textarea";

interface MarkdownEditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
  preview?: boolean;
}

export const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
  function MarkdownEditor({ markdown, onChange, preview = false }, ref) {
    if (preview) {
      return (
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      );
    }

    return (
      <Textarea
        ref={ref}
        className="min-h-full h-full font-mono resize-none"
        value={markdown}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
);
