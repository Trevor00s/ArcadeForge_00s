import { useEffect, useState } from "react";
import { Store, Play, Loader2, ExternalLink } from "lucide-react";
import { fetchMarketplaceNFTs } from "@/hooks/useNFT";
import { toast } from "sonner";

interface NFT {
  token_data_id_hash: string;
  name: string;
  metadata_uri: string;
  creator_address: string;
  current_token_ownerships: { owner_address: string }[];
}

interface GameMeta { id: string; title: string; html: string; createdAt: string; }

function shortAddr(addr: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

export default function Marketplace() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [metas, setMetas] = useState<Record<string, GameMeta>>({});
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<GameMeta | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchMarketplaceNFTs();
      setNfts(data);
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
            const owner = nft.current_token_ownerships?.[0]?.owner_address ?? nft.creator_address;
            return (
              <div key={nft.token_data_id_hash} className="rounded-2xl border border-border bg-card overflow-hidden group">
                <div className="h-36 bg-secondary relative overflow-hidden cursor-pointer" onClick={() => meta && setPlaying(meta)}>
                  {meta?.html ? (
                    <iframe srcDoc={meta.html} className="pointer-events-none border-0"
                      style={{ width: "200%", height: "200%", transform: "scale(0.5)", transformOrigin: "top left" }}
                      sandbox="allow-scripts" title={nft.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Store className="w-8 h-8 text-muted-foreground/30" /></div>
                  )}
                  {meta && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/20">
                      <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
                        <Play className="w-4 h-4 text-background ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 space-y-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">{nft.name}</p>
                  <p className="text-[11px] text-muted-foreground">by {shortAddr(owner)}</p>
                  <a href={`https://explorer.aptoslabs.com/account/${nft.creator_address}/tokens?network=testnet`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline">
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
