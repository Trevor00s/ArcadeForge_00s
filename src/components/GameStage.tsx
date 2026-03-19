import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Share2, Play, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { useShelby } from "@/hooks/useShelby";
import { v4 as uuidv4 } from "uuid";

interface GameStageProps {
  gameHtml: string | null;
  isGenerating: boolean;
}

export default function GameStage({ gameHtml, isGenerating }: GameStageProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { saveGame, connected } = useShelby();

  const handleRefresh = () => {
    if (iframeRef.current && gameHtml) {
      iframeRef.current.srcdoc = gameHtml;
    }
    setSaved(false);
  };

  const handleSave = async () => {
    if (!gameHtml || saving) return;
    if (!connected) {
      toast.error("Connect your Petra wallet first (Profile tab)");
      return;
    }
    setSaving(true);
    const titleMatch = gameHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || "Untitled Game";
    try {
      await saveGame({ id: uuidv4(), title, html: gameHtml, createdAt: new Date().toISOString() });
      setSaved(true);
      toast.success("Saved to Shelby! 🎮");
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!gameHtml) return;
    const blob = new Blob([gameHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "arcade-game.html";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Game downloaded!");
  };

  const handleShare = async () => {
    if (!gameHtml) return;
    try {
      await navigator.clipboard.writeText(gameHtml);
      toast.success("HTML copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex flex-col h-full relative p-4">
      <div className="flex-1 rounded-2xl overflow-hidden border border-border bg-card relative">
        {gameHtml ? (
          <iframe
            ref={iframeRef}
            srcDoc={gameHtml}
            className="w-full h-full border-0 animate-shutter"
            sandbox="allow-scripts allow-same-origin"
            title="Game Preview"
          />
        ) : (
          <div className="w-full h-full stage-grid flex items-center justify-center">
            <div className="text-center space-y-4 animate-float">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto">
                <Play className="w-6 h-6 text-muted-foreground ml-0.5" />
              </div>
              <div>
                <p className="text-lg font-display text-foreground italic">Your game appears here</p>
                <p className="text-xs text-muted-foreground mt-1 font-body">
                  It'll load instantly — no setup needed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Floating action bar */}
        {gameHtml && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-card/80 backdrop-blur-md border border-border rounded-full px-1.5 py-1 shadow-sm">
            <Button variant="ghost" size="sm" onClick={handleRefresh} className="gap-1.5 text-xs rounded-full h-8 px-3">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className={`gap-1.5 text-xs rounded-full h-8 px-3 ${saved ? "text-primary" : ""}`}
            >
              {saved ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
              {saving ? "Saving…" : saved ? "Saved" : "Save"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="gap-1.5 text-xs rounded-full h-8 px-3">
              <Download className="w-3 h-3" />
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="gap-1.5 text-xs rounded-full h-8 px-3">
              <Share2 className="w-3 h-3" />
              Share
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
