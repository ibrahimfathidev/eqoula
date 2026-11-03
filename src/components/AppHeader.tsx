import { Link, useNavigate } from "@tanstack/react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import markAsset from "@/assets/equola-mark.png.asset.json";

export function AppHeader({ title }: { title?: string }) {
  const { session, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card/90 backdrop-blur">
      <div className="app-shell flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Equało home">
          <img src={markAsset.url} alt="Equało mark" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-lg font-extrabold tracking-tight text-primary">Equało</span>
          {title ? (
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              · {title}
            </span>
          ) : null}
        </Link>

        {loading ? (
          <div className="h-9 w-9 rounded-full bg-muted" aria-hidden />
        ) : session && profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-9 items-center gap-2 rounded-full bg-secondary px-3 text-sm font-semibold text-secondary-foreground"
                aria-label="Account menu"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {profile.display_name.slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{profile.display_name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="normal-case">
                <div className="text-sm font-semibold">{profile.display_name}</div>
                <div className="text-xs font-normal text-muted-foreground">
                  {profile.role === "educator" ? "Education account" : "Student account"}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/onboarding" })}>
                <UserRound className="h-4 w-4" /> Edit my details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void signOut()} className="text-destructive">
                <LogOut className="h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            size="sm"
            className="h-9 rounded-full"
            onClick={() => navigate({ to: "/auth" })}
          >
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}
