import { User, Settings, LogOut, Wallet, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const { connected, connecting, address, shortAddress, connectPetra, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-5 py-6 pb-24 space-y-6 max-w-lg mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-display italic text-foreground">Profile</h1>
      </div>

      {/* Avatar + info */}
      <div className="flex flex-col items-center space-y-3 py-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${connected ? "bg-primary/10 border-2 border-primary/30" : "bg-secondary"}`}>
          {connected
            ? <Wallet className="w-8 h-8 text-primary" />
            : <User className="w-8 h-8 text-muted-foreground" />
          }
        </div>

        <div className="text-center space-y-1">
          {connected ? (
            <>
              <p className="font-body font-medium text-foreground">Petra Wallet</p>
              <button
                onClick={copyAddress}
                className="flex items-center gap-1.5 text-xs text-muted-foreground font-body hover:text-foreground transition-colors mx-auto"
              >
                <span>{shortAddress}</span>
                {copied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
              </button>
            </>
          ) : (
            <>
              <p className="font-body font-medium text-foreground">Guest User</p>
              <p className="text-xs text-muted-foreground font-body">Connect your Petra wallet to save games</p>
            </>
          )}
        </div>

        {connecting ? (
          <Button variant="outline" className="rounded-full px-6 font-body" disabled>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Connecting…
          </Button>
        ) : connected ? (
          <Button variant="outline" className="rounded-full px-6 font-body border-primary/30 text-primary hover:bg-primary/10">
            Connected ✓
          </Button>
        ) : (
          <Button onClick={connectPetra} variant="outline" className="rounded-full px-6 font-body">
            Connect Petra
          </Button>
        )}
      </div>

      {/* Menu */}
      <div className="space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-secondary transition-colors">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-body text-foreground">Settings</span>
        </button>
        {connected && (
          <button
            onClick={disconnect}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-body text-foreground">Disconnect wallet</span>
          </button>
        )}
        {!connected && (
          <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-secondary transition-colors">
            <LogOut className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-body text-foreground">Log out</span>
          </button>
        )}
      </div>
    </div>
  );
}
