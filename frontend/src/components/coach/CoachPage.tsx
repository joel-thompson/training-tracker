import { useEffect, useRef } from "react";
import { RotateCcw, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="flex flex-col h-full overflow-hidden md:mt-0 md:mb-0">
      <div className="hidden md:flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold">AI Coach</h1>
          <p className="text-muted-foreground text-lg">
            Ask questions about your training
          </p>
        </div>
      </div>

      <Card className="flex flex-col flex-1 min-h-0 overflow-hidden ">
        <CardHeader className="pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Training Coach
            </CardTitle>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={resetChat}>
                <RotateCcw className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0 pb-4">
          <ScrollArea className="flex-1 min-h-0 pr-4">
            <div className="space-y-4 pb-4">
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
          </ScrollArea>

          <ChatInput
            input={input}
            isLoading={isLoading}
            onInputChange={setInput}
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
