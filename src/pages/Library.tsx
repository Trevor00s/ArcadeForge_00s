import { useEffect, useState } from "react";
import { FolderOpen, Play, Trash2, Download, Loader2 } from "lucide-react";
import { useShelby } from "@/hooks/useShelby";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Game {
  id: string;
  title: string;
  html: string;
  createdAt: string;
}

export default function Library() {
  const { getGames, deleteGame, connected } = useShelby();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingGame, setPlayingGame] = useState<Game | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, [connected]);

  async function fetchGames() {
    setLoading(true);
    try {
      const g = await getGames();
      setGames(g as Game[]);
    } catch {
      toast.error("Could not load library");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteGame(id);
    setGames(prev => prev.filter(g => g.id !== id));
    if (playingGame?.id === id) setPlayingGame(null);
    toast.success("Removed from library");
  }

  function handleDownload(game: Game) {
    const blob = new Blob([game.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${game.title}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });

  // Full-screen game player
  if (playingGame) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <p className="text-sm font-body font-medium text-foreground truncate max-w-[70%]">{playingGame.title}</p>
          <button
            onClick={() => setPlayingGame(null)}
            className="text-xs font-body text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            ✕ Close
          </button>
        </div>
        <iframe
          srcDoc={playingGame.html}
          className="flex-1 border-0"
          sandbox="allow-scripts allow-same-origin"
          title={playingGame.title}
        />
      </div>
    );
  }

  return (
    <div className="px-5 py-6 pb-6 space-y-4 max-w-lg mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-display italic text-foreground">Library</h1>
        <p className="text-sm text-muted-foreground font-body">Your saved & created games</p>
      </div>

      {/* Not connected */}
      {!connected && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-body text-center">
            Connect your Petra wallet<br />to see your saved games.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="text-xs font-body text-primary hover:underline"
          >
            Go to Profile →
          </button>
        </div>
      )}

      {/* Loading */}
      {connected && loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty */}
      {connected && !loading && games.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-body text-center">
            No games yet.<br />Build your first one!
          </p>
          <button
            onClick={() => navigate("/build")}
            className="text-xs font-body text-primary hover:underline"
          >
            Start building →
          </button>
        </div>
      )}

      {/* Games list */}
      {connected && !loading && games.length > 0 && (
        <div className="space-y-3">
          {games.map(game => (
            <div
              key={game.id}
              className="rounded-2xl border border-border bg-card overflow-hidden group"
            >
              {/* Mini iframe preview */}
              <div
                className="h-32 bg-secondary relative overflow-hidden cursor-pointer"
                onClick={() => setPlayingGame(game)}
              >
                <iframe
                  srcDoc={game.html}
                  className="pointer-events-none border-0"
                  style={{
                    width: "200%",
                    height: "200%",
                    transform: "scale(0.5)",
                    transformOrigin: "top left",
                  }}
                  sandbox="allow-scripts"
                  title={game.title}
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/20">
                  <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
                    <Play className="w-4 h-4 text-background ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Info row */}
              <div className="px-4 py-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-body font-medium text-foreground truncate">{game.title}</p>
                  <p className="text-xs text-muted-foreground font-body">{fmt(game.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleDownload(game)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(game.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
