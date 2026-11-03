import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Users, Megaphone, BookmarkCheck, Play, Send, Globe } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  fetchOrgStudents,
  fetchOrgTrackerEntries,
  fetchPostedOpportunities,
  deleteOpportunity,
  type Profile,
  type TrackerEntry,
  type Opportunity,
} from "@/lib/data";
import {
  ORG_TYPE_LABELS,
  OPPORTUNITY_TYPE_EMOJI,
  OPPORTUNITY_TYPE_LABELS,
  deadlineLabel,
  type OpportunityType,
} from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/org")({
  component: OrgDashboard,
  head: () => ({
    meta: [
      { title: "Impact dashboard — Equało" },
      {
        name: "description",
        content: "Post opportunities, follow your students and see your organization's impact.",
      },
      { property: "og:title", content: "Impact dashboard — Equało" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function OrgDashboard() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    if (profile.role === "student") {
      navigate({ to: "/dashboard", replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, profile]);

  if (loading || !profile || profile.role !== "educator") {
    return (
      <div className="min-h-dvh bg-background">
        <AppHeader title="Impact" />
        <main className="app-shell space-y-3 px-4 py-6">
          <Skeleton className="h-10 w-2/3 rounded-xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader title="Impact" />
      <main className="app-shell app-shell-with-nav px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-extrabold leading-tight text-primary">
              {profile.display_name}
            </h1>
            <p className="text-xs font-semibold text-muted-foreground">
              Education account
              {profile.organization_id ? "" : " · no organization linked"}
            </p>
          </div>
          <Button asChild size="sm" className="h-10 shrink-0 rounded-xl bg-accent font-bold text-accent-foreground hover:bg-accent/90">
            <Link to="/post">
              <Plus className="h-4 w-4" /> Post
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="impact" className="mt-4">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-secondary p-1">
            <TabsTrigger value="impact" className="rounded-xl text-xs font-bold">Impact</TabsTrigger>
            <TabsTrigger value="opportunities" className="rounded-xl text-xs font-bold">Opportunities</TabsTrigger>
            <TabsTrigger value="students" className="rounded-xl text-xs font-bold">Students</TabsTrigger>
          </TabsList>
          <TabsContent value="impact">
            <ImpactTab organizationId={profile.organization_id} />
          </TabsContent>
          <TabsContent value="opportunities">
            <OpportunitiesTab profileId={profile.id} />
          </TabsContent>
          <TabsContent value="students">
            <StudentsTab organizationId={profile.organization_id} />
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, hint }: { label: string; value: string | number; icon: typeof Users; hint?: string }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-bold">{label}</span>
        </div>
        <p className="mt-1 text-2xl font-extrabold text-foreground">{value}</p>
        {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function ImpactTab({ organizationId }: { organizationId: string | null }) {
  const [students, setStudents] = useState<Profile[] | null>(null);
  const [entries, setEntries] = useState<TrackerEntry[] | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    fetchOrgStudents(organizationId).then(setStudents).catch(() => setStudents([]));
    fetchOrgTrackerEntries().then(setEntries).catch(() => setEntries([]));
  }, [organizationId]);

  const statusCounts = useMemo(() => {
    const list = entries ?? [];
    return {
      saved: list.filter((e) => e.status === "saved").length,
      inProgress: list.filter((e) => e.status === "in_progress").length,
      submitted: list.filter((e) => e.status === "submitted").length,
    };
  }, [entries]);

  const governorates = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of students ?? []) {
      const g = s.governorate ?? "Unknown";
      counts.set(g, (counts.get(g) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [students]);

  if (!organizationId) {
    return (
      <p className="mt-4 rounded-2xl bg-card p-5 text-center text-sm text-muted-foreground">
        No organization linked yet — your impact shows once students link to your
        organization and you post opportunities.
      </p>
    );
  }

  const maxGov = Math.max(1, ...governorates.map(([, n]) => n));

  return (
    <div className="mt-4 space-y-4">
      {students === null ? (
        <Skeleton className="h-24 rounded-2xl" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Students linked" value={students.length} icon={Users} />
          <StatCard label="Applications tracked" value={(entries ?? []).length} icon={BookmarkCheck} />
          <StatCard label="Saved" value={statusCounts.saved} icon={BookmarkCheck} hint="opportunities students kept" />
          <StatCard label="In progress" value={statusCounts.inProgress} icon={Play} hint="applications being prepared" />
          <StatCard label="Submitted" value={statusCounts.submitted} icon={Send} hint="completed applications" />
          <StatCard label="On-time rate" value={
            statusCounts.submitted === 0
              ? "—"
              : `${Math.round((statusCounts.submitted / Math.max(1, statusCounts.submitted + statusCounts.inProgress)) * 100)}%`
          } icon={Globe} hint="submitted vs still applying" />
        </div>
      )}

      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <h3 className="text-sm font-extrabold">Students by governorate</h3>
          {governorates.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">No linked students yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {governorates.map(([gov, n]) => (
                <div key={gov} className="flex items-center gap-2">
                  <span className="w-28 shrink-0 truncate text-xs font-semibold">{gov}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(n / maxGov) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-bold">{n}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <p className="px-1 text-center text-[11px] text-muted-foreground">
        Live figures from your organization's activity on Equało.
      </p>
    </div>
  );
}

function OpportunitiesTab({ profileId }: { profileId: string }) {
  const [ops, setOps] = useState<Opportunity[] | null>(null);

  async function load() {
    setOps(await fetchPostedOpportunities(profileId).catch(() => []));
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  async function handleDelete(id: string) {
    try {
      await deleteOpportunity(id);
      setOps((prev) => (prev ?? []).filter((o) => o.id !== id));
      toast.success("Opportunity removed");
    } catch {
      toast.error("Couldn't remove. Please try again.");
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <Button asChild variant="outline" className="h-11 rounded-xl border-2 border-accent/40 font-bold text-accent hover:bg-pink-soft/50">
        <Link to="/post">
          <Megaphone className="h-4 w-4" /> Post a new opportunity
        </Link>
      </Button>
      {ops === null
        ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        : ops.length === 0
          ? (
            <p className="rounded-2xl bg-card p-5 text-center text-sm text-muted-foreground">
              Nothing posted yet. Share a scholarship, competition or training your
              organization offers or recommends.
            </p>
          )
          : ops.map((op) => (
              <Card key={op.id} className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link to="/opportunity/$id" params={{ id: op.id }} className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="rounded-full text-[11px] font-semibold">
                          <span aria-hidden className="mr-1">{OPPORTUNITY_TYPE_EMOJI[op.type as OpportunityType]}</span>
                          {OPPORTUNITY_TYPE_LABELS[op.type as OpportunityType] ?? op.type}
                        </Badge>
                        {op.is_free ? <Badge className="rounded-full bg-accent text-accent-foreground text-[11px]">Free</Badge> : null}
                      </div>
                      <p className="mt-1.5 truncate text-sm font-extrabold">{op.title}</p>
                      <p className="text-xs text-muted-foreground">{deadlineLabel(op.deadline)}</p>
                    </Link>
                    <button
                      onClick={() => void handleDelete(op.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                      aria-label={`Delete ${op.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
    </div>
  );
}

function StudentsTab({ organizationId }: { organizationId: string | null }) {
  const [students, setStudents] = useState<Profile[] | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    fetchOrgStudents(organizationId).then(setStudents).catch(() => setStudents([]));
  }, [organizationId]);

  if (!organizationId) {
    return (
      <p className="mt-4 rounded-2xl bg-card p-5 text-center text-sm text-muted-foreground">
        Students appear here once they link your organization as their school.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {students === null
        ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        : students.length === 0
          ? (
            <p className="rounded-2xl bg-card p-5 text-center text-sm text-muted-foreground">
              No students linked yet. Ask your students to pick your organization when they
              set up their Equało profile.
            </p>
          )
          : students.map((s) => (
              <Card key={s.id} className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-soft text-sm font-extrabold text-accent">
                      {s.display_name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold">{s.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[s.grade, s.governorate].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                  {s.interests?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {s.interests.slice(0, 4).map((i) => (
                        <Badge key={i} variant="outline" className="rounded-full text-[10px]">
                          {i}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
    </div>
  );
}
