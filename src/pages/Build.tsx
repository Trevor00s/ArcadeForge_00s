import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import GameStage from "@/components/GameStage";

export default function Build() {
  const [gameHtml, setGameHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Toggle tabs */}
      <div className="flex border-b border-border bg-card">
        <button
          onClick={() => setShowPreview(false)}
          className={`flex-1 py-3 text-sm font-body font-medium transition-colors ${
            !showPreview ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className={`flex-1 py-3 text-sm font-body font-medium transition-colors ${
            showPreview ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!showPreview ? (
          <ChatPanel
            onGameGenerated={(html) => {
              setGameHtml(html);
              setShowPreview(true);
            }}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />
        ) : (
          <GameStage gameHtml={gameHtml} isGenerating={isGenerating} />
        )}
      </div>
    </div>
  );
}
