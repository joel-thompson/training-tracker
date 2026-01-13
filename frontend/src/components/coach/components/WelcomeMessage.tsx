import { memo } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUGGESTED_PROMPTS = [
  "What have I been working on lately?",
  "How am I progressing on my goals?",
  "What patterns do you see in my training?",
  "Summarize my last week of training",
] as const;

interface WelcomeMessageProps {
  onPromptClick: (prompt: string) => void;
  disabled: boolean;
}

export const WelcomeMessage = memo(function WelcomeMessage({
  onPromptClick,
  disabled,
}: WelcomeMessageProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 space-y-3">
          <p className="text-sm leading-relaxed">
            Hey! I'm your AI training coach. I have access to your training
            sessions, goals, and stats from the last 90 days. Ask me anything
            about your BJJ journey!
          </p>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              Try asking:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1.5 px-3"
                  onClick={() => onPromptClick(prompt)}
                  disabled={disabled}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
