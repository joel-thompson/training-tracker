import { memo } from "react";
import { Bot, User } from "lucide-react";
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
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
          {message.content}
        </p>
      </div>
    </div>
  );
});
