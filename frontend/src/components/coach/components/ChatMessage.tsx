import { memo } from "react";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { UIMessage } from "@/hooks/coach/useChat";

interface ChatMessageProps {
  message: UIMessage;
}

export const ChatMessage = memo(function ChatMessage({
  message,
}: ChatMessageProps) {
  return (
    <div className="flex gap-3">
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.role === "assistant" ? "bg-primary/10" : "bg-muted"
        }`}
      >
        {message.role === "assistant" ? (
          <Bot className="h-4 w-4 text-primary" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0 text-sm leading-relaxed">
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="my-2 first:mt-0 last:mb-0">{children}</p>
            ),
            h1: ({ children }) => (
              <h1 className="text-xl font-semibold mt-4 mb-2 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold mt-4 mb-2 first:mt-0">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-semibold mt-4 mb-2 first:mt-0">
                {children}
              </h3>
            ),
            ul: ({ children }) => (
              <ul className="my-2 list-disc list-outside ml-6 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="my-2 list-decimal list-outside ml-6 space-y-1">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="my-1 pl-2">{children}</li>,
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              return isInline ? (
                <code
                  className="text-sm bg-muted px-1 py-0.5 rounded font-mono"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <code
                  className="block text-sm font-mono whitespace-pre"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="bg-muted p-3 rounded-md overflow-x-auto my-3">
                {children}
              </pre>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-primary underline hover:text-primary/80"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-muted pl-4 italic my-3">
                {children}
              </blockquote>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
});
