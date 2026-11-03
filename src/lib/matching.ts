import type { Opportunity } from "@/lib/data";

export type MatchResult = {
  score: number;
  reasons: string[];
};

/**
 * Simple rule-based matching: interest overlap, free access and open deadlines.
 * Structured so a real AI model can replace it later.
 */
export function scoreOpportunity(
  op: Opportunity,
  interests: string[],
): MatchResult {
  const score = 0;
  const reasons: string[] = [];
  let total = score;

  const hay = `${op.title} ${op.summary} ${op.description ?? ""} ${op.eligibility ?? ""}`.toLowerCase();
  for (const interest of interests) {
    const keyword = interest.split(/[ &/]+/)[0]?.toLowerCase() ?? "";
    if (keyword && hay.includes(keyword)) {
      total += 2;
      reasons.push(`Matches your interest in ${interest}`);
      break;
    }
  }
  if (op.is_free) {
    total += 1;
    reasons.push("Free to join");
  }
  if (op.deadline && new Date(`${op.deadline}T23:59:59`) > new Date()) {
    total += 1;
    reasons.push("Applications still open");
  }
  return { score: total, reasons };
}

export function matchLabel(score: number): string {
  if (score >= 4) return "Great match";
  if (score >= 2) return "Good match";
  return "Worth a look";
}
