import { useEffect, useState } from "react";
import { Store, Play, Loader2, Coins, Lock } from "lucide-react";
import { useNFT } from "@/hooks/useNFT";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";

interface Listing {
  priceApt: number;
  owner: string;
  name: string;
  metadata_uri: string;
}

interface GameMeta { id: string; title: string; html: string; createdAt: string; }

const APT_OCTAS = 100_000_000;

function shortAddr(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

function formatApt(apt: number) {
  return (apt === 0 ? "Free" : apt.toFixed(apt % 1 === 0 ? 0 : 2) + " APT");
}

export default function Marketplace() {
  const [listings, setListings] = useState<Record<string, Listing>>({});
  const [metas, setMetas] = useState<Record<string, GameMeta>>({});
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<GameMeta | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("af-unlocked") || "[]")); }
    catch { return new Set(); }
  });

  const { payToPlay, connected } = useNFT();
  const { address } = useWallet();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data: Record<string, Listing> = await fetch('/api/listings').then(r => r.json()).catch(() => ({}));
      setListings(data);
      // Fetch Shelby metadata for each listing
      const entries = Object.entries(data);
      const metaResults = await Promise.all(
        entries.map(async ([gameId, listing]) => {
          try {
            const res = await fetch(listing.metadata_uri);
            if (!res.ok) return null;
            return { gameId, meta: await res.json() };
          } catch { return null; }
        })
      );
      const metaMap: Record<string, GameMeta> = {};
      metaResults.forEach((r: any) => { if (r) metaMap[r.gameId] = r.meta; });
      setMetas(metaMap);
    } catch { toast.error("Could not load marketplace"); }
    finally { setLoading(false); }
  }

  async function handlePlay(gameId: string) {
    const listing = listings[gameId];
    const meta = metas[gameId];
    if (!meta) return;

    const priceOctas = Math.round(listing.priceApt * APT_OCTAS);
    const isOwn = address && address === listing.owner;
    const isUnlocked = unlockedIds.has(gameId);

    if (priceOctas === 0 || isOwn || isUnlocked) {
      setPlaying(meta);
      return;
    }

    if (!connected) { toast.error("Connect your wallet to play paid games"); return; }

    setPaying(gameId);
    try {
      toast.info(`Paying ${listing.priceApt} APT… approve in Petra`);
      await payToPlay(listing.owner, priceOctas);
      const next = new Set(unlockedIds);
      next.add(gameId);
      setUnlockedIds(next);
      localStorage.setItem("af-unlocked", JSON.stringify([...next]));
      toast.success("Payment sent! Loading game…");
      setPlaying(meta);
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    } finally { setPaying(null); }
  }

  if (playing) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <p className="text-sm font-medium text-foreground truncate max-w-[70%]">{playing.title}</p>
          <button onClick={() => setPlaying(null)} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors">✕ Close</button>
        </div>
        <iframe srcDoc={playing.html} className="flex-1 border-0" sandbox="allow-scripts allow-same-origin" title={playing.title} />
      </div>
    );
  }

  const entries = Object.entries(listings);

  return (
    <div className="px-5 py-6 pb-6 space-y-4 max-w-5xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold text-foreground">Marketplace</h1>
        <p className="text-sm text-muted-foreground">AI-generated games listed for play</p>
      </div>

      {loading && <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}

      {!loading && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
            <Store className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">No games listed yet.<br />Go to Library → List on Marketplace!</p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map(([gameId, listing]) => {
            const meta = metas[gameId];
            const priceOctas = Math.round(listing.priceApt * APT_OCTAS);
            const isFree = priceOctas === 0;
            const isOwn = address && address === listing.owner;
            const isUnlocked = unlockedIds.has(gameId);
            const isPaying = paying === gameId;
            const canPlayFree = isFree || isOwn || isUnlocked;

            return (
              <div key={gameId} className="rounded-2xl border border-border bg-card overflow-hidden group">
                {/* Preview */}
                <div className="h-36 bg-secondary relative overflow-hidden">
                  {meta?.html ? (
                    <iframe srcDoc={meta.html} className="pointer-events-none border-0"
                      style={{ width: "200%", height: "200%", transform: "scale(0.5)", transformOrigin: "top left" }}
                      sandbox="allow-scripts" title={listing.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Store className="w-8 h-8 text-muted-foreground/30" /></div>
                  )}
                  {!canPlayFree && (
                    <div className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <Lock className="w-5 h-5 text-background" />
                        <span className="text-[11px] font-bold text-background">{listing.priceApt} APT</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground truncate">{listing.name}</p>
                    <p className="text-[11px] text-muted-foreground">by {shortAddr(listing.owner)}</p>
                  </div>

                  {isOwn && <div className="text-[11px] text-primary font-semibold">Your game</div>}
                  {!isOwn && isFree && <div className="text-[11px] text-emerald-500 font-semibold">Free</div>}
                  {!isOwn && !isFree && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                      <Coins className="w-3 h-3" />
                      {isUnlocked ? "Unlocked" : `${listing.priceApt} APT to play`}
                    </div>
                  )}

                  <button
                    onClick={() => handlePlay(gameId)}
                    disabled={!meta || isPaying}
                    className="w-full flex items-center justify-center gap-1.5 h-8 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {isPaying ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Paying…</>
                    ) : canPlayFree ? (
                      <><Play className="w-3 h-3" /> Play</>
                    ) : (
                      <><Coins className="w-3 h-3" /> Buy & Play</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
