import { Wallet, Loader2, Sun, Moon, Home, Hammer, Store, BookOpen, User, LogOut, Copy, Check } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/build", icon: Hammer, label: "Build" },
  { to: "/marketplace", icon: Store, label: "Marketplace" },
  { to: "/library", icon: BookOpen, label: "Library" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function TopBar() {
  const { connected, connecting, shortAddress, address, connectPetra, disconnect } = useWallet();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-full px-4 max-w-5xl mx-auto gap-4">

        {/* Logo */}
        <div className="flex items-center gap-1 shrink-0">
          <img src="/logo.png" alt="ArcadeForge" className="w-9 h-9 object-contain mix-blend-multiply" />
          <span className="font-display font-black text-sm tracking-tight text-foreground hidden sm:block">
            ArcadeForge
          </span>
        </div>

        {/* Center nav */}
        <nav className="flex items-center gap-1 flex-1 justify-center">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-medium transition-all",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              <span className="hidden sm:block">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right: theme + wallet */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {connecting ? (
            <button disabled className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              Connecting…
            </button>
          ) : connected ? (
            <div ref={ref} className="relative">
              <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {shortAddress}
              </button>
              {open && (
                <div className="absolute right-0 top-10 w-44 rounded-xl bg-card border border-border shadow-lg overflow-hidden z-50">
                  <button
                    onClick={copyAddress}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-foreground hover:bg-secondary transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy address
                  </button>
                  <button
                    onClick={() => { disconnect(); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </div>
              )}
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
