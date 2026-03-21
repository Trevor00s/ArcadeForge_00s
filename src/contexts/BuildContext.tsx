import { createContext, useContext, useState, useRef, useCallback, ReactNode } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface BuildContextValue {
  messages: Message[];
  gameHtml: string | null;
  isGenerating: boolean;
  sendPrompt: (prompt: string) => Promise<void>;
  reset: () => void;
}

const BuildContext = createContext<BuildContextValue | null>(null);

export function BuildProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [gameHtml, setGameHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendPrompt = useCallback(async (prompt: string) => {
    if (isGenerating) return;
    setMessages(prev => [...prev, { role: "user", content: prompt }]);
    setIsGenerating(true);
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: abortRef.current.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setGameHtml(data.html);
      setMessages(prev => [...prev, { role: "assistant", content: "✓ Game ready! Click Preview to play." }]);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setGameHtml(null);
    setIsGenerating(false);
  }, []);

  return (
    <BuildContext.Provider value={{ messages, gameHtml, isGenerating, sendPrompt, reset }}>
      {children}
    </BuildContext.Provider>
  );
}

export function useBuild() {
  const ctx = useContext(BuildContext);
  if (!ctx) throw new Error("useBuild must be used inside BuildProvider");
  return ctx;
}
