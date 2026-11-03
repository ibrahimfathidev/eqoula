import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BookmarkPlus,
  BookmarkCheck,
  ExternalLink,
  Loader2,
  Play,
  Send,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  fetchOpportunity,
  fetchTrackerForOpportunity,
  saveOpportunity,
  updateTrackerStatus,
  removeTrackerEntry,
  type Opportunity,
  type TrackerEntry,
} from "@/lib/data";
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_TYPE_EMOJI,
  LOCATION_LABELS,
  deadlineLabel,
  type OpportunityType,
} from "@/lib/constants";

export const Route = createFileRoute("/opportunity/$id")({
  component: OpportunityDetail,
  head: () => ({
    meta: [
      { title: "Opportunity details — Equało" },
      {
        name: "description",
        content: "Eligibility, requirements, deadline and the official application link.",
      },
      { property: "og:title", content: "Opportunity details — Equało" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function OpportunityDetail() {
  const { id } = Route.useParams();
  const { session, profile, loading } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [entry, setEntry] = useState<TrackerEntry | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchOpportunity(id).then(setOpportunity).catch(() => setOpportunity(null));
  }, [id]);

  useEffect(() => {
    if (!profile || profile.role !== "student") return;
    fetchTrackerForOpportunity(profile.id, id).then(setEntry).catch(() => setEntry(null));
  }, [profile, id]);

  async function handleSave() {
    if (!profile) return;
    setBusy(true);
    try {
      await saveOpportunity(profile.id, id);
      setEntry(await fetchTrackerForOpportunity(profile.id, id));
      toast.success("Saved — find it in your Tracker");
    } catch {
      toast.error("Couldn't save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleStatus(status: TrackerEntry["status"]) {
    if (!entry) return;
    setBusy(true);
    try {
      await updateTrackerStatus(entry.id, status);
      setEntry({ ...entry, status });
      toast.success(
        status === "submitted" ? "Marked as submitted — well done! 🎉" : "Updated",
      );
    } catch {
      toast.error("Couldn't update. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!entry) return;
    setBusy(true);
    try {
      await removeTrackerEntry(entry.id);
      setEntry(null);
      toast.success("Removed from tracker");
    } catch {
      toast.error("Couldn't remove. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (opportunity === null) {
    return (
      <div className="min-h-dvh bg-background">
        <AppHeader />
        <main className="app-shell space-y-3 px-4 py-6">
          <Skeleton className="h-8 w-3/4 rounded-xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </main>
      </div>
    );
  }

  const type = opportunity.type as OpportunityType;

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />
      <main className="app-shell app-shell-with-nav px-4 py-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="gap-1 rounded-full font-semibold">
            <span aria-hidden>{OPPORTUNITY_TYPE_EMOJI[type]}</span>
            {OPPORTUNITY_TYPE_LABELS[type] ?? opportunity.type}
          </Badge>
          {opportunity.is_free ? (
            <Badge className="rounded-full bg-accent text-accent-foreground">Free</Badge>
          ) : null}
          <Badge variant="outline" className="rounded-full">
            {LOCATION_LABELS[opportunity.location] ?? opportunity.location}
          </Badge>
        </div>

        <h1 className="mt-3 text-2xl font-extrabold leading-tight text-primary">
          {opportunity.title}
        </h1>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          {opportunity.provider_name}
        </p>
        <p
          className={`mt-2 text-sm font-bold ${
            deadlineLabel(opportunity.deadline).includes("passed")
              ? "text-muted-foreground"
              : "text-accent"
          }`}
        >
          {deadlineLabel(opportunity.deadline)}
          {opportunity.deadline
            ? ` · ${new Date(`${opportunity.deadline}T00:00:00`).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}`
            : ""}
        </p>

        <Card className="mt-4 rounded-2xl">
          <CardContent className="space-y-3 p-4 text-sm leading-relaxed">
            <p className="font-medium">{opportunity.summary}</p>
            {opportunity.description ? (
              <p className="text-muted-foreground">{opportunity.description}</p>
            ) : null}
            <Separator />
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                Who can apply
              </h3>
              <p className="mt-1">{opportunity.eligibility ?? "Open — check the official page"}</p>
            </div>
            {opportunity.requirements.length > 0 ? (
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                  What you need
                </h3>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {opportunity.requirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Always confirm details on the official provider page before applying.
            </p>
          </CardContent>
        </Card>

        {/* Tracker actions */}
        <div className="mt-4 flex flex-col gap-2">
          {loading ? null : !session ? (
            <Button asChild className="h-12 rounded-2xl text-base font-bold">
              <Link to="/auth">Sign in with Google to save &amp; track</Link>
            </Button>
          ) : !profile ? (
            <Button asChild className="h-12 rounded-2xl text-base font-bold">
              <Link to="/onboarding">Finish setting up your profile to save</Link>
            </Button>
          ) : profile.role === "educator" ? (
            <p className="rounded-2xl bg-secondary px-4 py-3 text-center text-sm font-medium text-secondary-foreground">
              You're signed in as an education account — students can save and track this
              opportunity.
            </p>
          ) : entry ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                {(["saved", "in_progress", "submitted"] as const).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={entry.status === status ? "default" : "outline"}
                    className={`h-11 rounded-xl text-xs font-bold ${
                      entry.status === status ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""
                    }`}
                    disabled={busy}
                    onClick={() => void handleStatus(status)}
                  >
                    {status === "saved" ? <BookmarkCheck className="h-4 w-4" /> : null}
                    {status === "in_progress" ? <Play className="h-4 w-4" /> : null}
                    {status === "submitted" ? <Send className="h-4 w-4" /> : null}
                    {status === "saved" ? "Saved" : status === "in_progress" ? "Applying" : "Submitted"}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="h-10 text-xs text-muted-foreground" disabled={busy} onClick={() => void handleRemove()}>
                Remove from tracker
              </Button>
            </>
          ) : (
            <Button
              className="h-12 rounded-2xl text-base font-bold"
              disabled={busy}
              onClick={() => void handleSave()}
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookmarkPlus className="h-5 w-5" />}
              Save to my tracker
            </Button>
          )}

          <Button asChild variant="outline" className="h-12 rounded-2xl border-2 border-accent/40 text-base font-bold text-accent hover:bg-pink-soft/60">
            <a href={opportunity.link} target="_blank" rel="noopener noreferrer">
              Apply on official site <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
