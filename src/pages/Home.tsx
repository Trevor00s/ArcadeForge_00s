import { Sparkles, Zap, Users, Gamepad2, ArrowRight, MessageSquare, Wand2, Share2 } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const STEPS = [
  { icon: MessageSquare, step: "01", title: "Describe it", desc: "Tell us what game you want — arcade, quiz, puzzle, anything." },
  { icon: Wand2, step: "02", title: "AI builds it", desc: "Our AI generates a fully playable game in seconds." },
  { icon: Share2, step: "03", title: "Make it yours", desc: "Customize, tweak, and share your creation with the world." },
];

const STATS = [
  { icon: Gamepad2, value: "1,200+", label: "Games Built" },
  { icon: Users, value: "8,500+", label: "Players" },
  { icon: Zap, value: "<10s", label: "Build Time" },
];

const CATEGORIES = [
  { emoji: "🕹️", name: "Arcade" },
  { emoji: "🧩", name: "Puzzle" },
  { emoji: "🧠", name: "Quiz" },
  { emoji: "⚔️", name: "Strategy" },
  { emoji: "🏃", name: "Action" },
  { emoji: "🎲", name: "Board" },
];

const ORBIT_OUTER = [
  { emoji: "🕹️", style: { top: 0, left: "50%", transform: "translate(-50%, -50%)" }, delay: "0s" },
  { emoji: "⚔️", style: { top: "50%", right: 0, transform: "translate(50%, -50%)" }, delay: "0.8s" },
  { emoji: "🧩", style: { bottom: 0, left: "50%", transform: "translate(-50%, 50%)" }, delay: "1.6s" },
  { emoji: "🎲", style: { top: "50%", left: 0, transform: "translate(-50%, -50%)" }, delay: "2.4s" },
];

const ORBIT_INNER = [
  { emoji: "🧠", top: "15%", left: "78%", delay: "0.4s" },
  { emoji: "🏃", top: "78%", left: "20%", delay: "1.2s" },
];

function OrbitalGraphic() {
  return (
    <div className="relative w-[300px] h-[300px] shrink-0">
      <div className="absolute inset-0 rounded-full border border-primary/20" />
      <div className="absolute inset-10 rounded-full border border-primary/15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[190px] h-[190px]">
        <img src="/logo.png" alt="ArcadeForge" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen" />
      </div>
      {ORBIT_OUTER.map(({ emoji, style, delay }) => (
        <div
          key={emoji}
          className="absolute w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-xl animate-float"
          style={{ ...style, animationDelay: delay } as React.CSSProperties}
        >
          {emoji}
        </div>
      ))}
      {ORBIT_INNER.map(({ emoji, top, left, delay }) => (
        <div
          key={emoji}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-lg animate-float"
          style={{ top, left, animationDelay: delay }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="pb-6 overflow-y-auto">
      {/* Hero — two columns */}
      <section className="relative px-6 pt-10 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">

          {/* Left: text */}
          <div className="flex-1 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              AI-Powered Game Builder
            </div>
            <h1 className="text-4xl font-display font-black text-foreground leading-[1.1] md:text-5xl">
              Build games with<br />
              <span className="text-muted-foreground font-black">just words.</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Describe any game from classic arcade to brain teasers and watch AI code it instantly. No skills needed.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => navigate("/build")}
                className="rounded-full px-6 h-11 font-bold text-sm gap-2 bg-foreground text-background hover:bg-foreground/90"
              >
                Start Building
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/marketplace")}
                className="rounded-full px-6 h-11 text-sm font-medium"
              >
                Explore Games
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground">
                🎮 No coding needed
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                Aptos Testnet
              </span>
            </div>
          </div>

          {/* Right: Orbital graphic */}
          <div className="hidden md:flex items-center justify-center">
            <OrbitalGraphic />
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="px-6 py-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-card border border-border">
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-lg font-display font-bold text-foreground">{value}</span>
              <span className="text-[11px] text-muted-foreground font-body">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-4 max-w-5xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-foreground">Categories</h2>
          <button className="text-xs text-primary font-medium hover:underline">See all</button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className="flex flex-col items-center gap-1.5 min-w-[72px] p-3 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-[11px] font-medium text-foreground">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="px-6 py-4 max-w-5xl mx-auto space-y-3">
        <h2 className="text-lg font-display font-bold text-foreground">How it works</h2>
        <div className="grid gap-3">
          {STEPS.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-card">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                  {step}
                </span>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="font-semibold text-foreground text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-foreground to-foreground/90 text-background overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <div className="relative space-y-3">
            <h3 className="text-xl font-display font-black">Ready to create?</h3>
            <p className="text-sm opacity-70 max-w-xs leading-relaxed">
              Your next game is one prompt away. No coding needed.
            </p>
            <Button
              onClick={() => navigate("/build")}
              className="rounded-full px-5 h-10 bg-background text-foreground hover:bg-background/90 font-bold text-sm gap-2 mt-1"
            >
              <Zap className="w-4 h-4" />
              Build Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
