import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/lib/auth";
import { createOpportunity } from "@/lib/data";
import {
  OPPORTUNITY_TYPES,
  OPPORTUNITY_TYPE_LABELS,
  type OpportunityType,
} from "@/lib/constants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/post")({
  component: PostOpportunityPage,
  head: () => ({
    meta: [
      { title: "Post an opportunity — Equało" },
      { name: "description", content: "Share a scholarship, competition, research program or training." },
      { property: "og:title", content: "Post an opportunity — Equało" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function PostOpportunityPage() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<OpportunityType>("scholarship");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [providerName, setProviderName] = useState("");
  const [link, setLink] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [location, setLocation] = useState("online");
  const [eligibility, setEligibility] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deadline, setDeadline] = useState("");

  const valid =
    title.trim().length > 2 &&
    summary.trim().length > 5 &&
    providerName.trim().length > 1 &&
    /^https?:\/\/.+/.test(link.trim());

  async function handleSubmit() {
    if (!profile) return;
    setSaving(true);
    try {
      await createOpportunity({
        title: title.trim(),
        type,
        summary: summary.trim(),
        description: description.trim() || null,
        provider_name: providerName.trim(),
        organization_id: profile.organization_id,
        posted_by: profile.id,
        link: link.trim(),
        is_free: isFree,
        location,
        eligibility: eligibility.trim() || null,
        requirements: requirements
          .split("\n")
          .map((r) => r.trim())
          .filter(Boolean),
        deadline: deadline || null,
      });
      toast.success("Opportunity posted — students can see it now!");
      navigate({ to: "/org", replace: true });
    } catch (e) {
      console.error(e);
      toast.error("Couldn't post. Please check the fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile || profile.role !== "educator") {
    return (
      <div className="min-h-dvh bg-background">
        <AppHeader title="Post" />
        <main className="app-shell px-4 py-6">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader title="Post" />
      <main className="app-shell app-shell-with-nav px-4 py-4">
        <Link to="/org" className="text-sm font-bold text-accent">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-xl font-extrabold text-primary">Post an opportunity</h1>
        <p className="text-sm text-muted-foreground">
          It appears instantly in the student catalogue and your impact dashboard.
        </p>

        <Card className="mt-4 rounded-3xl">
          <CardContent className="space-y-4 p-5">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Nile Delta STEM Scholarship 2027"
                className="mt-1.5 h-12 rounded-xl text-base"
                maxLength={100}
              />
            </div>

            <div>
              <Label>Type</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {OPPORTUNITY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`h-11 rounded-xl text-sm font-bold transition-colors ${
                      type === t
                        ? "bg-accent text-accent-foreground"
                        : "border border-border bg-card text-foreground"
                    }`}
                    aria-pressed={type === t}
                  >
                    {OPPORTUNITY_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="summary">One-line summary *</Label>
              <Input
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="What is it, in one sentence?"
                className="mt-1.5 h-12 rounded-xl text-base"
                maxLength={160}
              />
            </div>

            <div>
              <Label htmlFor="description">Details (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add context: what students get, how it works…"
                className="mt-1.5 min-h-20 rounded-xl text-base"
                maxLength={1000}
              />
            </div>

            <div>
              <Label htmlFor="provider">Provider name *</Label>
              <Input
                id="provider"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="Who runs it (your organization or a partner)"
                className="mt-1.5 h-12 rounded-xl text-base"
                maxLength={80}
              />
            </div>

            <div>
              <Label htmlFor="link">Official application link *</Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://…"
                inputMode="url"
                className="mt-1.5 h-12 rounded-xl text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="location">Where</Label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1.5 h-12 w-full rounded-xl border border-input bg-card px-3 text-base"
                >
                  <option value="online">Online</option>
                  <option value="egypt">In Egypt</option>
                  <option value="abroad">Abroad</option>
                </select>
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1.5 h-12 rounded-xl text-base"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
              <Label htmlFor="free" className="text-sm font-bold">
                Free for students
              </Label>
              <Switch id="free" checked={isFree} onCheckedChange={setIsFree} />
            </div>

            <div>
              <Label htmlFor="eligibility">Who can apply</Label>
              <Input
                id="eligibility"
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                placeholder="e.g. Grades 10–12 in Upper Egypt"
                className="mt-1.5 h-12 rounded-xl text-base"
                maxLength={160}
              />
            </div>

            <div>
              <Label htmlFor="requirements">Requirements (one per line)</Label>
              <Textarea
                id="requirements"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder={"Transcript\nCopy of ID\nShort essay"}
                className="mt-1.5 min-h-24 rounded-xl text-base"
              />
            </div>

            <Button
              className="h-12 w-full rounded-xl text-base font-bold"
              disabled={saving || !valid}
              onClick={() => void handleSubmit()}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Publish opportunity
            </Button>
            {!valid ? (
              <p className="text-center text-xs text-muted-foreground">
                Fill the required fields — the link must start with https://
              </p>
            ) : null}
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
