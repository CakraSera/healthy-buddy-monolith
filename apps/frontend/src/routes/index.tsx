import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { useChat } from "@anvia/react";
import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

const SUGGESTIONS = [
  "I'm having trouble sleeping lately",
  "Give me a gentle stretch I can do at my desk",
  "I've been feeling stressed, any tips?",
  "What's a simple way to eat healthier?",
];

function getSessionId() {
  let id = localStorage.getItem("health-buddy-session-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("health-buddy-session-id", id);
  }
  return id;
}

function Home() {
  const [input, setInput] = useState("");
  const { send, messages, status } = useChat({
    endpoint: "http://localhost:8000/chat",
    // ! Research codes below
    createRequest: ({ coreMessages }) => ({
      messages: coreMessages,
      stream: true,
      metadata: {
        sessionId: getSessionId(),
      },
    }),
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const isStreaming = status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    send(trimmed);
    setInput("");
  };

  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b px-4 py-3 sm:px-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <span className="text-base">🌱</span>
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold sm:text-base">
            Health Buddy
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            Your gentle coach for sleep, food, movement & stress
          </p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {messages.length === 0 ? (
          <EmptyState onPick={submit} />
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%]",
                    message.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground",
                  )}
                >
                  {message.parts.map((part, i) =>
                    part.type === "text" ? (
                      <span key={i}>{part.text}</span>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                  <Dot />
                  <Dot delay="150ms" />
                  <Dot delay="300ms" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="shrink-0 border-t bg-background px-3 py-3 sm:px-6"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Ask about sleep, food, movement, stress..."
            rows={1}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-input bg-transparent px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="h-11 w-11 shrink-0 rounded-full p-0 disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (value: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-8 text-center">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold">How are you feeling today?</h2>
        <p className="text-sm text-muted-foreground">
          I can help with sleep, nutrition basics, gentle movement, and stress.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-xl border bg-card px-4 py-3 text-left text-sm text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay?: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
      style={{ animationDelay: delay }}
    />
  );
}
