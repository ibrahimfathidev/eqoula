import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  OPPORTUNITY_TYPE_EMOJI,
  OPPORTUNITY_TYPE_LABELS,
  LOCATION_LABELS,
  deadlineLabel,
  type OpportunityType,
} from "@/lib/constants";
import { matchLabel, type MatchResult } from "@/lib/matching";
import type { Opportunity } from "@/lib/data";

export function OpportunityCard({
  opportunity,
  match,
}: {
  opportunity: Opportunity;
  match?: MatchResult;
}) {
  const type = opportunity.type as OpportunityType;
  return (
    <Link
      to="/opportunity/$id"
      params={{ id: opportunity.id }}
      className="block active:scale-[0.99]"
    >
      <Card className="h-full rounded-2xl border-border/70 shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="gap-1 rounded-full font-semibold">
              <span aria-hidden>{OPPORTUNITY_TYPE_EMOJI[type]}</span>
              {OPPORTUNITY_TYPE_LABELS[type] ?? opportunity.type}
            </Badge>
            {opportunity.is_free ? (
              <Badge className="rounded-full bg-accent text-accent-foreground">Free</Badge>
            ) : null}
            {match ? (
              <Badge
                variant="outline"
                className="rounded-full border-accent/50 text-accent"
              >
                {matchLabel(match.score)}
              </Badge>
            ) : null}
          </div>
          <h3 className="text-[15px] font-bold leading-snug text-foreground">
            {opportunity.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{opportunity.summary}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <span className="truncate text-xs font-medium text-muted-foreground">
              {opportunity.provider_name} · {LOCATION_LABELS[opportunity.location] ?? opportunity.location}
            </span>
            <span
              className={`shrink-0 text-xs font-bold ${
                deadlineLabel(opportunity.deadline).startsWith("Deadline")
                  ? "text-accent"
                  : "text-muted-foreground"
              }`}
            >
              {deadlineLabel(opportunity.deadline)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
