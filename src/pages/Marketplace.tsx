import { Search, Gamepad2 } from "lucide-react";

const CATEGORIES = ["All", "Arcade", "Puzzle", "Quiz", "Strategy", "Action"];

export default function Marketplace() {
  return (
    <div className="px-5 py-6 pb-24 space-y-6 max-w-lg mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-display italic text-foreground">Marketplace</h1>
        <p className="text-sm text-muted-foreground font-body">Discover games built by the community</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search games..."
          className="w-full rounded-2xl border border-border bg-card pl-10 pr-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full text-xs font-body font-medium whitespace-nowrap transition-colors ${
              i === 0
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
          <Gamepad2 className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground font-body text-center">
          Community games coming soon.<br />Be the first to publish!
        </p>
      </div>
    </div>
  );
}
