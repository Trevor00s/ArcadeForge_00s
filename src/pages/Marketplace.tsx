import { useEffect, useState } from "react";
import { Store, Play, Loader2, ExternalLink, Coins, Lock } from "lucide-react";
import { fetchMarketplaceNFTs } from "@/hooks/useNFT";
import { useNFT } from "@/hooks/useNFT";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";

interface NFT {
  token_data_id_hash: string;
  name: string;
  metadata_uri: string;
  description: string;
  creator_address: string;
}

interface GameMeta { id: string; title: string; html: string; createdAt: string; priceApt?: number; }

const APT_OCTAS = 100_000_000;

function shortAddr(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

function getPriceOctas(nft: NFT, meta?: GameMeta, serverListings?: Record<string, { priceApt: number }>): number {
  // Server listing takes priority (set via "List on Marketplace" button)
  if (meta?.id && serverListings?.[meta.id] !== undefined) {
    return Math.round(serverListings[meta.id].priceApt * APT_OCTAS);
  }
  // Fallback: price encoded in NFT description at mint time
  try {
    if (!nft.description) return 0;
    const match = nft.description.match(/^price:(\d+)\|/);
    return match ? parseInt(match[1]) : 0;
  } catch {
    return 0;
  }
}

function formatApt(octas: number) {
  return (octas / APT_OCTAS).toFixed(octas % APT_OCTAS === 0 ? 0 : 2) + " APT";
}

export default function Marketplace() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [metas, setMetas] = useState<Record<string, GameMeta>>({});
  const [serverListings, setServerListings] = useState<Record<string, { priceApt: number }>>({});
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
      const [data, listingsRes] = await Promise.all([
        fetchMarketplaceNFTs(),
        fetch('/api/listings').then(r => r.json()).catch(() => ({})),
      ]);
      setNfts(data);
      setServerListings(listingsRes);
      const metaResults = await Promise.all(
        data.map(async (nft: NFT) => {
          try {
            const res = await fetch(nft.metadata_uri);
            if (!res.ok) return null;
            return { id: nft.token_data_id_hash, meta: await res.json() };
          } catch { return null; }
        })
      );
      const metaMap: Record<string, GameMeta> = {};
      metaResults.forEach((r: any) => { if (r) metaMap[r.id] = r.meta; });
      setMetas(metaMap);
    } catch { toast.error("Could not load marketplace"); }
    finally { setLoading(false); }
  }

  async function handlePlay(nft: NFT) {
    const meta = metas[nft.token_data_id_hash];
    if (!meta) return;

    const priceOctas = getPriceOctas(nft, meta, serverListings);
    const owner = nft.creator_address;
    const isOwn = address && (address === owner || address === nft.creator_address);
    const isUnlocked = unlockedIds.has(nft.token_data_id_hash);

    if (priceOctas === 0 || isOwn || isUnlocked) {
      setPlaying(meta);
      return;
    }

    // Needs payment
    if (!connected) {
      toast.error("Connect your wallet to play paid games");
      return;
    }

    setPaying(nft.token_data_id_hash);
    try {
      toast.info(`Paying ${formatApt(priceOctas)}… approve in Petra`);
      await payToPlay(owner, priceOctas);
      const next = new Set(unlockedIds);
      next.add(nft.token_data_id_hash);
      setUnlockedIds(next);
      localStorage.setItem("af-unlocked", JSON.stringify([...next]));
      toast.success("Payment sent! Loading game…");
      setPlaying(meta);
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    } finally {
      setPaying(null);
    }
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

  return (
    <div className="px-5 py-6 pb-6 space-y-4 max-w-5xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold text-foreground">Marketplace</h1>
        <p className="text-sm text-muted-foreground">AI-generated games minted as NFTs on Aptos</p>
      </div>

      {loading && <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}

      {!loading && nfts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
            <Store className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">No games in marketplace yet.<br />Build a game and mint it as an NFT!</p>
        </div>
      )}

      {!loading && nfts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nfts.map(nft => {
            const meta = metas[nft.token_data_id_hash];
            const owner = nft.creator_address;
            const priceOctas = getPriceOctas(nft, meta, serverListings);
            const isFree = priceOctas === 0;
            const isOwn = address && (address === owner || address === nft.creator_address);
            const isUnlocked = unlockedIds.has(nft.token_data_id_hash);
            const isPaying = paying === nft.token_data_id_hash;
            const canPlayFree = isFree || isOwn || isUnlocked;

            return (
              <div key={nft.token_data_id_hash} className="rounded-2xl border border-border bg-card overflow-hidden group">
                {/* Preview */}
                <div className="h-36 bg-secondary relative overflow-hidden">
                  {meta?.html ? (
                    <iframe srcDoc={meta.html} className="pointer-events-none border-0"
                      style={{ width: "200%", height: "200%", transform: "scale(0.5)", transformOrigin: "top left" }}
                      sandbox="allow-scripts" title={nft.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Store className="w-8 h-8 text-muted-foreground/30" /></div>
                  )}
                  {/* Locked overlay */}
                  {!canPlayFree && (
                    <div className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <Lock className="w-5 h-5 text-background" />
                        <span className="text-[11px] font-bold text-background">{formatApt(priceOctas)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="px-4 py-3 space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground truncate">{nft.name}</p>
                    <p className="text-[11px] text-muted-foreground">by {shortAddr(owner)}</p>
                  </div>

                  {/* Price tag */}
                  {!isFree && !isOwn && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                      <Coins className="w-3 h-3" />
                      {isUnlocked ? "Unlocked" : formatApt(priceOctas) + " to play"}
                    </div>
                  )}
                  {isFree && (
                    <div className="text-[11px] text-emerald-500 font-semibold">Free</div>
                  )}
                  {isOwn && (
                    <div className="text-[11px] text-primary font-semibold">Your game</div>
                  )}

                  {/* Play button */}
                  <button
                    onClick={() => handlePlay(nft)}
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

                  <a href={`https://explorer.aptoslabs.com/account/${nft.creator_address}/tokens?network=testnet`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:underline transition-colors">
                    <ExternalLink className="w-3 h-3" /> View on Explorer
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
