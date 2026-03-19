import { Gamepad2, Wallet, Loader2, Sun, Moon } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useTheme } from "@/contexts/ThemeContext";

export default function TopBar() {
  const { connected, connecting, shortAddress, connectPetra } = useWallet();
  const { theme, toggle } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-full px-4 max-w-5xl mx-auto">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Gamepad2 className="w-4 h-4 text-background" />
          </div>
          <span className="font-display font-black text-sm tracking-tight text-foreground">
            ArcadeForge
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Connect wallet */}
          {connecting ? (
            <button disabled className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              Connecting…
            </button>
          ) : connected ? (
            <div className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {shortAddress}
            </div>
          ) : (
            <button
              onClick={connectPetra}
              className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition-all"
            >
              <Wallet className="w-3 h-3" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
