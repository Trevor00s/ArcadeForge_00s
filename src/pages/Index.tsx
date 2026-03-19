import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import GameStage from "@/components/GameStage";

const Index = () => {
  const [gameHtml, setGameHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Chat panel */}
      <div className="w-[380px] min-w-[340px] border-r border-border bg-background">
        <ChatPanel
          onGameGenerated={setGameHtml}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
      </div>

      {/* Game stage */}
      <div className="flex-1 bg-secondary/40">
        <GameStage gameHtml={gameHtml} isGenerating={isGenerating} />
      </div>
    </div>
  );
};

export default Index;
