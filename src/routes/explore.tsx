import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { OpportunityCard } from "@/components/OpportunityCard";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import {
  OPPORTUNITY_TYPES,
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_TYPE_EMOJI,
  type OpportunityType,
} from "@/lib/constants";
import { fetchOpportunities, type Opportunity } from "@/lib/data";

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
  head: () => ({
    meta: [
      { title: "Explore opportunities — Equało" },
      {
        name: "description",
        content:
          "Search real scholarships, competitions, research programs and training open to students in Egypt and online.",
      },
      { property: "og:title", content: "Explore opportunities — Equało" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ExplorePage() {
  const [all, setAll] = useState<Opportunity[] | null>(null);
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [freeOnly, setFreeOnly] = useState(false);

  useEffect(() => {
    fetchOpportunities()
      .then(setAll)
      .catch(() => setAll([]));
  }, []);

  const results = useMemo(() => {
    if (!all) return null;
    const q = query.trim().toLowerCase();
    return all.filter((op) => {
      if (freeOnly && !op.is_free) return false;
      if (types.length > 0 && !types.includes(op.type)) return false;
      if (q) {
        const hay = `${op.title} ${op.summary} ${op.provider_name} ${op.eligibility ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [all, query, types, freeOnly]);

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader title="Explore" />
      <main className="app-shell app-shell-with-nav px-4 py-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scholarships, competitions…"
            className="h-12 rounded-2xl bg-card pl-10 text-base"
            inputMode="search"
          />
        </div>

        {/* Type filter chips */}
        <div className="mt-3 flex items-center gap-2">
          <ToggleGroup
            type="multiple"
            value={types}
            onValueChange={setTypes}
            className="no-scrollbar flex-1 flex-wrap justify-start gap-1.5"
            variant="outline"
          >
            {OPPORTUNITY_TYPES.map((t) => (
              <ToggleGroupItem
                key={t}
                value={t}
                className="rounded-full border-border bg-card px-3 py-1 text-xs font-semibold data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:border-accent"
                aria-label={OPPORTUNITY_TYPE_LABELS[t as OpportunityType]}
              >
                <span aria-hidden className="mr-1">{OPPORTUNITY_TYPE_EMOJI[t as OpportunityType]}</span>
                {OPPORTUNITY_TYPE_LABELS[t as OpportunityType]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl bg-card px-4 py-2.5">
          <Label htmlFor="free-only" className="text-sm font-semibold">
            Free opportunities only
          </Label>
          <Switch id="free-only" checked={freeOnly} onCheckedChange={setFreeOnly} />
        </div>

        <p className="mt-4 px-1 text-xs font-semibold text-muted-foreground">
          {results === null ? "Loading…" : `${results.length} opportunities`}
        </p>

        <div className="mt-2 flex flex-col gap-3">
          {results === null
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
            : results.map((op) => <OpportunityCard key={op.id} opportunity={op} />)}
          {results?.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing matches yet — try removing a filter.
            </p>
          ) : null}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
