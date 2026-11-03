export const GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Port Said",
  "Suez",
  "Damietta",
  "Dakahlia",
  "Sharqia",
  "Monufia",
  "Gharbia",
  "Beheira",
  "Kafr El Sheikh",
  "Ismailia",
  "Fayoum",
  "Beni Suef",
  "Minya",
  "Asyut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "Red Sea",
  "New Valley",
  "Matrouh",
  "North Sinai",
  "South Sinai",
] as const;

export const INTERESTS = [
  "STEM",
  "Technology",
  "Arts & Design",
  "Sports",
  "Languages",
  "Entrepreneurship",
  "Research",
  "Community & Volunteering",
] as const;

export const GRADES = ["Grade 10", "Grade 11", "Grade 12", "Recent graduate"] as const;

export const ORG_TYPES = ["school", "university", "ngo", "donor_government"] as const;
export type OrgType = (typeof ORG_TYPES)[number];

export const ORG_TYPE_LABELS: Record<OrgType, string> = {
  school: "School",
  university: "University",
  ngo: "NGO / Charity",
  donor_government: "Donor / Government",
};

export const OPPORTUNITY_TYPES = ["scholarship", "competition", "research", "training"] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  scholarship: "Scholarship",
  competition: "Competition",
  research: "Research program",
  training: "Training",
};

export const OPPORTUNITY_TYPE_EMOJI: Record<OpportunityType, string> = {
  scholarship: "🎓",
  competition: "🏆",
  research: "🔬",
  training: "📚",
};

export const LOCATION_LABELS: Record<string, string> = {
  online: "Online",
  egypt: "In Egypt",
  abroad: "Abroad",
};

export const TRACKER_STATUSES = ["saved", "in_progress", "submitted"] as const;
export type TrackerStatus = (typeof TRACKER_STATUSES)[number];

export const TRACKER_STATUS_LABELS: Record<TrackerStatus, string> = {
  saved: "Saved",
  in_progress: "In progress",
  submitted: "Submitted",
};

export function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  const target = new Date(`${deadline}T23:59:59`).getTime();
  return Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
}

export function deadlineLabel(deadline: string | null): string {
  const days = daysUntil(deadline);
  if (days === null) return "Rolling deadline";
  if (days < 0) return "Deadline passed";
  if (days === 0) return "Deadline: today!";
  if (days === 1) return "Deadline: tomorrow";
  return `Deadline in ${days} days`;
}
