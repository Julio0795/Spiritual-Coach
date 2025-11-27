"use client";

import { useRef, useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export default function ChatWindow() {
  // Use local state for input - this ensures typing always works
  const [input, setInput] = useState("");

  // Configure useChat with API endpoint using DefaultChatTransport
  // useChat from @ai-sdk/react uses sendMessage, not append
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  // Extract loading state from status
  const isLoading = status === "streaming" || status === "submitted";

  // Create handleInputChange that updates local state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Create handleSubmit that uses sendMessage from useChat
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    // Get the current input value
    const messageToSend = input.trim();

    // Clear input immediately for better UX
    setInput("");

    // Use sendMessage from useChat hook
    // sendMessage expects { text: string } format
    try {
      await sendMessage({
        text: messageToSend,
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      // Show user-friendly error message
      alert(`Failed to send message: ${error.message || "Unknown error"}`);
      // Restore input on error
      setInput(messageToSend);
    }
  };

  // Show error if any
  useEffect(() => {
    if (error) {
      console.error("Chat error:", error);
      alert(`Chat error: ${error.message || "Unknown error"}`);
    }
  }, [error]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 text-center italic max-w-md">
              "Silence is the language of God, all else is poor translation." —
              Rumi
              <br />
              <span className="text-slate-500 mt-2 block">
                Ask me anything.
              </span>
            </p>
          </div>
        ) : (
          <>
            {messages.map((m: any) => {
              // UIMessages have a parts array, not content
              // Extract text from text parts
              const textParts =
                m.parts?.filter((part: any) => part.type === "text") || [];
              const messageText = textParts
                .map((part: any) => part.text)
                .join("");

              // Check if message is still streaming
              const isStreaming = textParts.some(
                (part: any) => part.state === "streaming"
              );
              const isEmpty =
                !messageText && (!m.parts || m.parts.length === 0);

              return (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-slate-700 text-white rounded-br-none"
                        : "bg-slate-900 text-amber-100 border border-slate-800 rounded-bl-none"
                    }`}
                  >
                    {messageText || (isEmpty ? "..." : "")}
                    {isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-amber-400 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2"
      >
        <input
          className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-600"
          value={input || ""}
          onChange={handleInputChange}
          placeholder="Ask your council..."
          disabled={isLoading}
        />
        <button
          type="submit"
          // FIX: We added (input || '') to ensure .trim() never crashes
          disabled={isLoading || !(input || "").trim()}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
