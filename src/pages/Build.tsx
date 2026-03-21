import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import GameStage from "@/components/GameStage";
import { useBuild } from "@/contexts/BuildContext";

export default function Build() {
  const { gameHtml, isGenerating } = useBuild();
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

      {/* Both panels always mounted — CSS visibility only */}
      <div className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 ${showPreview ? "invisible pointer-events-none" : ""}`}>
          <ChatPanel onGameGenerated={() => setShowPreview(true)} />
        </div>
        <div className={`absolute inset-0 ${!showPreview ? "invisible pointer-events-none" : ""}`}>
          <GameStage gameHtml={gameHtml} isGenerating={isGenerating} />
        </div>
      </div>
    </div>
  );
}
