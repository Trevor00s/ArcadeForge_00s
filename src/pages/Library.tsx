import { useEffect, useState } from "react";
import { FolderOpen, Play, Trash2, Download, Loader2, Sparkles, ExternalLink, X, Tag } from "lucide-react";
import { useShelby } from "@/hooks/useShelby";
import { useNFT } from "@/hooks/useNFT";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Game {
  id: string;
  title: string;
  html: string;
  createdAt: string;
}

export default function Library() {
  const { getGames, deleteGame, updateGamePrice, connected } = useShelby();
  const { mintGameNFT } = useNFT();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingGame, setPlayingGame] = useState<Game | null>(null);
  const [minting, setMinting] = useState<string | null>(null);
  const [listing, setListing] = useState<string | null>(null);
  const [mintedIds, setMintedIds] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem("af-minted") || "{}") } catch { return {} }
  });
  // Price dialog state (shared for mint + listing)
  const [pendingMint, setPendingMint] = useState<Game | null>(null);
  const [pendingList, setPendingList] = useState<Game | null>(null);
  const [priceInput, setPriceInput] = useState("0");
  const navigate = useNavigate();

  useEffect(() => { fetchGames(); }, [connected]);

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

  function openMintDialog(game: Game) {
    if (minting) return;
    setPriceInput("0");
    setPendingMint(game);
  }

  async function confirmMint() {
    if (!pendingMint) return;
    const game = pendingMint;
    setPendingMint(null);
    const priceApt = Math.max(0, parseFloat(priceInput) || 0);
    setMinting(game.id);
    try {
      toast.info("Minting NFT… approve in Petra");
      const txHash = await mintGameNFT(game, priceApt);
      const updated = { ...mintedIds, [game.id]: txHash };
      setMintedIds(updated);
      localStorage.setItem("af-minted", JSON.stringify(updated));
      toast.success("NFT minted! 🎮✨");
    } catch (err: any) {
      toast.error(err.message || "Mint failed");
    } finally {
      setMinting(null);
    }
  }

  async function confirmList() {
    if (!pendingList) return;
    const game = pendingList;
    setPendingList(null);
    const priceApt = Math.max(0, parseFloat(priceInput) || 0);
    setListing(game.id);
    try {
      toast.info("Listing game on marketplace…");
      await updateGamePrice(game.id, priceApt, game.title);
      toast.success(priceApt === 0 ? "Game set to free!" : `Listed for ${priceApt} APT!`);
    } catch (err: any) {
      toast.error(err.message || "Listing failed");
    } finally {
      setListing(null);
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

  if (playingGame) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <p className="text-sm font-medium text-foreground truncate max-w-[70%]">{playingGame.title}</p>
          <button
            onClick={() => setPlayingGame(null)}
            className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
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
        <h1 className="text-2xl font-display font-bold text-foreground">Library</h1>
        <p className="text-sm text-muted-foreground">Your saved & created games</p>
      </div>

      {!connected && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Connect your Petra wallet<br />to see your saved games.
          </p>
          <button onClick={() => navigate("/profile")} className="text-xs text-primary hover:underline">
            Go to Profile →
          </button>
        </div>
      )}

      {connected && loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {connected && !loading && games.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">No games yet.<br />Build your first one!</p>
          <button onClick={() => navigate("/build")} className="text-xs text-primary hover:underline">
            Start building →
          </button>
        </div>
      )}

      {connected && !loading && games.length > 0 && (
        <div className="space-y-3">
          {games.map(game => {
            const isMinted = !!mintedIds[game.id];
            const isMintingThis = minting === game.id;
            return (
              <div key={game.id} className="rounded-2xl border border-border bg-card overflow-hidden group">
                {/* Mini preview */}
                <div className="h-32 bg-secondary relative overflow-hidden cursor-pointer" onClick={() => setPlayingGame(game)}>
                  <iframe
                    srcDoc={game.html}
                    className="pointer-events-none border-0"
                    style={{ width: "200%", height: "200%", transform: "scale(0.5)", transformOrigin: "top left" }}
                    sandbox="allow-scripts"
                    title={game.title}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/20">
                    <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
                      <Play className="w-4 h-4 text-background ml-0.5" />
                    </div>
                  </div>
                  {isMinted && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-background text-[10px] font-bold">
                      <Sparkles className="w-2.5 h-2.5" /> NFT
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{game.title}</p>
                      <p className="text-xs text-muted-foreground">{fmt(game.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleDownload(game)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" title="Download">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(game.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" title="Remove">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Mint / NFT row */}
                  {isMinted ? (
                    <div className="space-y-1.5">
                      <button
                        onClick={() => { setPriceInput("0"); setPendingList(game); }}
                        disabled={listing === game.id}
                        className="w-full flex items-center justify-center gap-1.5 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-all disabled:opacity-50"
                      >
                        {listing === game.id ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Listing…</>
                        ) : (
                          <><Tag className="w-3 h-3" /> List on Marketplace</>
                        )}
                      </button>
                      <a
                        href={`https://explorer.aptoslabs.com/txn/${mintedIds[game.id]}?network=testnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View NFT on Explorer
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => openMintDialog(game)}
                      disabled={!!minting}
                      className="w-full flex items-center justify-center gap-1.5 h-8 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all disabled:opacity-50"
                    >
                      {isMintingThis ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Minting…</>
                      ) : (
                        <><Sparkles className="w-3 h-3" /> Mint as NFT</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Listing dialog */}
      {pendingList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-6">
          <div className="w-full max-w-xs bg-card rounded-2xl border border-border shadow-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">List on Marketplace</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Set the price players pay to unlock <span className="text-foreground font-medium">{pendingList.title}</span>.
                </p>
              </div>
              <button onClick={() => setPendingList(null)} className="text-muted-foreground hover:text-foreground mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <input
                type="number" min="0" step="0.01"
                value={priceInput}
                onChange={e => setPriceInput(e.target.value)}
                className="w-full h-10 pl-3 pr-12 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">APT</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Set to 0 for a free game. Requires wallet approval.</p>
            <div className="flex gap-2">
              <button onClick={() => setPendingList(null)} className="flex-1 h-9 rounded-xl text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
              <button onClick={confirmList} className="flex-1 h-9 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-500/90 transition-colors flex items-center justify-center gap-1.5">
                <Tag className="w-3 h-3" /> List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price dialog */}
      {pendingMint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm px-6">
          <div className="w-full max-w-xs bg-card rounded-2xl border border-border shadow-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Set play price</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  How much APT should players pay to unlock <span className="text-foreground font-medium">{pendingMint.title}</span>?
                </p>
              </div>
              <button onClick={() => setPendingMint(null)} className="text-muted-foreground hover:text-foreground mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={priceInput}
                onChange={e => setPriceInput(e.target.value)}
                className="w-full h-10 pl-3 pr-12 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">APT</span>
            </div>

            <p className="text-[11px] text-muted-foreground">Set to 0 for a free game.</p>

            <div className="flex gap-2">
              <button
                onClick={() => setPendingMint(null)}
                className="flex-1 h-9 rounded-xl text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmMint}
                className="flex-1 h-9 rounded-xl bg-primary text-background text-xs font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" /> Mint NFT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
