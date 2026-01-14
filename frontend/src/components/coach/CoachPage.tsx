import { useEffect, useRef } from "react";
import { RotateCcw, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/coach/useChat";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { WelcomeMessage } from "./components/WelcomeMessage";
import { ThinkingIndicator } from "./components/ThinkingIndicator";

export function CoachPage() {
  const {
    messages,
    input,
    isLoading,
    setInput,
    handleSubmit,
    handlePromptClick,
    resetChat,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const showThinking =
    isLoading && messages[messages.length - 1]?.role === "user";

  return (
    <>
      <div className="hidden md:block mb-4">
        <h1 className="text-3xl font-bold">AI Coach</h1>
        <p className="text-muted-foreground text-lg">
          Ask questions about your training
        </p>
      </div>

      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b pt-2 pb-3 mb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex items-center justify-between">
          <div className="text-base font-medium flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Training Coach
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={resetChat}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4 pb-32 md:pb-24">
        {messages.length === 0 ? (
          <WelcomeMessage
            onPromptClick={(prompt) => {
              void handlePromptClick(prompt);
            }}
            disabled={isLoading}
          />
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        {showThinking && <ThinkingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-background border-t md:border-t-0 py-4">
        <div className="container mx-auto max-w-4xl px-4">
          <ChatInput
            input={input}
            isLoading={isLoading}
            onInputChange={setInput}
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
          />
        </div>
      </div>
    </>
  );
}
