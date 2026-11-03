import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  fetchMyTracker,
  updateTrackerStatus,
  removeTrackerEntry,
  type TrackerEntry,
} from "@/lib/data";
import {
  TRACKER_STATUSES,
  TRACKER_STATUS_LABELS,
  OPPORTUNITY_TYPE_EMOJI,
  deadlineLabel,
  type TrackerStatus,
  type OpportunityType,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tracker")({
  component: TrackerPage,
  head: () => ({
    meta: [
      { title: "My tracker — Equało" },
      { name: "description", content: "Track every application from saved to submitted." },
      { property: "og:title", content: "My tracker — Equało" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function TrackerPage() {
  const { profile, loading } = useAuth();
  const [entries, setEntries] = useState<TrackerEntry[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !profile || profile.role !== "student") return;
    fetchMyTracker(profile.id).then(setEntries).catch(() => setEntries([]));
  }, [loading, profile]);

  async function changeStatus(entry: TrackerEntry, status: TrackerStatus) {
    setBusyId(entry.id);
    try {
      await updateTrackerStatus(entry.id, status);
      setEntries((prev) =>
        (prev ?? []).map((e) => (e.id === entry.id ? { ...e, status } : e)),
      );
      toast.success(
        status === "submitted" ? "Marked as submitted — well done! 🎉" : "Updated",
      );
    } catch {
      toast.error("Couldn't update. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(entry: TrackerEntry) {
    setBusyId(entry.id);
    try {
      await removeTrackerEntry(entry.id);
      setEntries((prev) => (prev ?? []).filter((e) => e.id !== entry.id));
      toast.success("Removed");
    } catch {
      toast.error("Couldn't remove. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const counts = TRACKER_STATUSES.map(
    (s) => (entries ?? []).filter((e) => e.status === s).length,
  );
  const total = entries?.length ?? 0;
  const progress = total === 0 ? 0 : Math.round((((counts[2] ?? 0) + (counts[1] ?? 0) * 0.5) / total) * 100);

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader title="Tracker" />
      <main className="app-shell app-shell-with-nav px-4 py-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>My application progress</span>
              <span className="text-accent">{progress}%</span>
            </div>
            <Progress value={progress} className="mt-2 h-2.5" />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              {TRACKER_STATUSES.map((s, i) => (
                <div key={s} className="rounded-xl bg-secondary py-2">
                  <p className="text-lg font-extrabold text-foreground">{counts[i]}</p>
                  <p className="font-semibold text-muted-foreground">{TRACKER_STATUS_LABELS[s]}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-col gap-3">
          {entries === null
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
            : entries.length === 0
              ? (
                <div className="rounded-3xl bg-card p-6 text-center">
                  <p className="text-sm font-bold">Nothing saved yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Explore opportunities and save the ones you like to build your tracker.
                  </p>
                  <Button asChild size="sm" className="mt-3 rounded-xl bg-accent font-bold text-accent-foreground hover:bg-accent/90">
                    <Link to="/explore">Explore opportunities</Link>
                  </Button>
                </div>
              )
              : entries.map((entry) => {
                  const op = entry.opportunity!;
                  return (
                    <Card key={entry.id} className="rounded-2xl">
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <Link to="/opportunity/$id" params={{ id: entry.opportunity_id }} className="min-w-0">
                            <p className="truncate text-sm font-extrabold">
                              <span aria-hidden className="mr-1">
                                {OPPORTUNITY_TYPE_EMOJI[op.type as OpportunityType]}
                              </span>
                              {op.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{op.provider_name}</p>
                          </Link>
                          <button
                            onClick={() => void remove(entry)}
                            disabled={busyId === entry.id}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                            aria-label={`Remove ${op.title} from tracker`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p
                          className={cn(
                            "text-xs font-bold",
                            deadlineLabel(op.deadline).includes("passed")
                              ? "text-muted-foreground"
                              : "text-accent",
                          )}
                        >
                          {deadlineLabel(op.deadline)}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {TRACKER_STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => void changeStatus(entry, s)}
                              disabled={busyId === entry.id}
                              className={cn(
                                "h-10 rounded-xl text-xs font-bold transition-colors",
                                entry.status === s
                                  ? "bg-accent text-accent-foreground"
                                  : "border border-border bg-card text-muted-foreground hover:border-accent/50",
                              )}
                              aria-pressed={entry.status === s}
                            >
                              {TRACKER_STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
