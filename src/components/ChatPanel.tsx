import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useBuild } from "@/contexts/BuildContext";

const EXAMPLE_PROMPTS = [
  "A classic Snake game",
  "Space shooter with a score",
  "Quiz about world capitals",
  "Tic-tac-toe vs AI",
  "Flappy bird clone",
];

export default function ChatPanel({ onGameGenerated }: { onGameGenerated: () => void }) {
  const { messages, isGenerating, sendPrompt, gameHtml } = useBuild();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-switch to preview when game is ready
  const prevGenerating = useRef(false);
  useEffect(() => {
    if (prevGenerating.current && !isGenerating && gameHtml) {
      onGameGenerated();
    }
    prevGenerating.current = isGenerating;
  }, [isGenerating, gameHtml, onGameGenerated]);

  const handleSubmit = async (prompt?: string) => {
    const text = prompt || input.trim();
    if (!text || isGenerating) return;
    setInput("");
    await sendPrompt(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-display text-foreground italic">What shall we build?</h2>
              <p className="text-sm text-muted-foreground font-body">Describe a game or quiz — I'll code it instantly.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm stagger-children">
              {EXAMPLE_PROMPTS.map((p) => (
                <button key={p} onClick={() => handleSubmit(p)}
                  className="animate-fade-in-up opacity-0 px-3.5 py-2 rounded-full border border-border bg-card text-sm text-foreground hover:bg-secondary hover:border-primary/30 transition-all duration-200 font-body">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}>
            <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed font-body ${
              msg.role === "user"
                ? "bg-foreground text-background rounded-2xl rounded-br-md"
                : "bg-card border border-border text-foreground rounded-2xl rounded-bl-md"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="bg-card border border-border px-4 py-3.5 rounded-2xl rounded-bl-md flex gap-1.5 items-center">
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your game..."
            rows={1}
            className="w-full resize-none rounded-2xl border border-border bg-card pl-4 pr-12 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 transition-all font-body"
          />
          <Button variant="generate" size="icon" onClick={() => handleSubmit()}
            disabled={!input.trim() || isGenerating}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl">
            <ArrowUp className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
