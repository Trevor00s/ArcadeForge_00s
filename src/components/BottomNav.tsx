import { Home, Hammer, Store, BookOpen, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/build", icon: Hammer, label: "Build" },
  { to: "/marketplace", icon: Store, label: "Marketplace" },
  { to: "/library", icon: BookOpen, label: "Library" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200",
                    isActive && "bg-primary/10 scale-110"
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                <span className="text-[10px] font-body font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
