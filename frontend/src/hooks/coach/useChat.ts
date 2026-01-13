import { useState, useCallback, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "@/utils/api";
import type { ChatMessage } from "shared/types";

export interface UIMessage extends ChatMessage {
  id: string;
}

export function useChat() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sendChatMessage = useCallback(
    async (chatMessages: ChatMessage[]) => {
      const token = await getToken();
      const response = await api("/api/v1/coach/chat", {
        method: "POST",
        token,
        body: JSON.stringify({ messages: chatMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantContent += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: assistantContent } : m
          )
        );
      }
    },
    [getToken]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: input.trim(),
      };

      const chatMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        await sendChatMessage(chatMessages);
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, sendChatMessage]
  );

  const handlePromptClick = useCallback(
    async (prompt: string) => {
      if (isLoading) return;

      const userMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        await sendChatMessage([{ role: "user", content: prompt }]);
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sendChatMessage]
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  }, []);

  return {
    messages,
    input,
    isLoading,
    inputRef,
    setInput,
    handleSubmit,
    handlePromptClick,
    resetChat,
  };
}
