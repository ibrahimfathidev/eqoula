import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OpportunityCard } from "@/components/OpportunityCard";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { Compass, CalendarClock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  fetchOpportunities,
  fetchMyTracker,
  type Opportunity,
  type TrackerEntry,
} from "@/lib/data";
import { scoreOpportunity, matchLabel } from "@/lib/matching";
import { deadlineLabel } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: StudentDashboard,
  head: () => ({
    meta: [
      { title: "My dashboard — Equało" },
      { name: "description", content: "Opportunities matched to your interests and your deadlines." },
      { property: "og:title", content: "My dashboard — Equało" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function StudentDashboard() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [ops, setOps] = useState<Opportunity[] | null>(null);
  const [entries, setEntries] = useState<TrackerEntry[] | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    if (profile.role === "educator") {
      navigate({ to: "/org", replace: true });
      return;
    }
    fetchOpportunities().then(setOps).catch(() => setOps([]));
    fetchMyTracker(profile.id).then(setEntries).catch(() => setEntries([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, profile]);

  const matched = useMemo(() => {
    if (!ops || !profile) return [];
    const interests = profile.interests ?? [];
    return ops
      .filter((op) => !op.deadline || new Date(`${op.deadline}T23:59:59`) > new Date())
      .filter((op) => !entries?.some((e) => e.opportunity_id === op.id))
      .map((op) => ({ op, match: scoreOpportunity(op, interests) }))
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 6);
  }, [ops, entries, profile]);

  const deadlines = useMemo(() => {
    if (!entries) return [];
    return entries
      .filter((e) => e.opportunity?.deadline && e.status !== "submitted")
      .sort(
        (a, b) =>
          new Date(`${a.opportunity!.deadline}T00:00:00`).getTime() -
          new Date(`${b.opportunity!.deadline}T00:00:00`).getTime(),
      )
      .slice(0, 4);
  }, [entries]);

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />
      <main className="app-shell app-shell-with-nav px-4 py-4">
        <h1 className="text-xl font-extrabold text-primary">
          Hi {profile?.display_name.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Here's what fits you today.</p>

        {/* Matched for you */}
        <section className="mt-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-extrabold text-foreground">Matched for you</h2>
            <Button asChild variant="link" className="h-auto p-0 text-sm font-bold text-accent">
              <Link to="/explore">See all →</Link>
            </Button>
          </div>
          <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
            {ops === null
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-64 shrink-0 snap-start rounded-2xl" />
                ))
              : matched.length === 0
                ? null
                : matched.map(({ op, match }) => (
                    <div key={op.id} className="w-64 shrink-0 snap-start">
                      <OpportunityCard opportunity={op} match={match} />
                      <p className="mt-1 px-1 text-[11px] leading-tight text-muted-foreground">
                        {match.reasons.slice(0, 2).join(" · ") || matchLabel(match.score)}
                      </p>
                    </div>
                  ))}
            {ops !== null && matched.length === 0 ? (
              <div className="w-full rounded-2xl bg-card p-5 text-center">
                <p className="text-sm font-semibold">You've seen it all for now!</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Explore the catalogue for more opportunities.
                </p>
                <Button asChild size="sm" className="mt-3 rounded-xl bg-accent font-bold text-accent-foreground hover:bg-accent/90">
                  <Link to="/explore">
                    <Compass className="h-4 w-4" /> Explore
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
        </section>

        {/* Upcoming deadlines */}
        <section className="mt-6">
          <h2 className="text-base font-extrabold text-foreground">Upcoming deadlines</h2>
          <div className="mt-3 flex flex-col gap-2">
            {entries === null
              ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)
              : deadlines.length === 0
                ? (
                  <div className="rounded-2xl bg-card p-5 text-center">
                    <p className="text-sm font-semibold">No deadlines tracked yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Save opportunities to see their deadlines here.
                    </p>
                    <Button asChild size="sm" variant="outline" className="mt-3 rounded-xl font-bold">
                      <Link to="/explore">Browse opportunities</Link>
                    </Button>
                  </div>
                )
                : deadlines.map((e) => (
                    <Link
                      key={e.id}
                      to="/opportunity/$id"
                      params={{ id: e.opportunity_id }}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{e.opportunity!.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.status === "saved" ? "Saved" : "In progress"}
                        </p>
                      </div>
                      <Badge className="shrink-0 gap-1 rounded-full bg-pink-soft text-accent hover:bg-pink-soft">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {deadlineLabel(e.opportunity!.deadline)}
                      </Badge>
                    </Link>
                  ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
