import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Home, LayoutDashboard, PlusCircle, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";

const STUDENT_NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/tracker", label: "Tracker", icon: BookmarkCheck },
] as const;

const EDUCATOR_NAV = [
  { to: "/org", label: "Dashboard", icon: LayoutDashboard },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/post", label: "Post", icon: PlusCircle },
] as const;

export function BottomNav() {
  const { profile } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = profile?.role === "educator" ? EDUCATOR_NAV : STUDENT_NAV;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main navigation"
    >
      <div className="app-shell mx-auto grid grid-cols-3 px-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-semibold transition-colors ${
                active ? "text-accent" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
