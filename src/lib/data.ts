import { supabase } from "@/integrations/supabase/client";
import type { OrgType, OpportunityType, TrackerStatus } from "@/lib/constants";

export type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  role: "student" | "educator";
  organization_id: string | null;
  school_id: string | null;
  grade: string | null;
  governorate: string | null;
  interests: string[];
};

export type Organization = {
  id: string;
  name: string;
  type: OrgType;
  governorate: string | null;
  website: string | null;
  created_by: string | null;
  created_at: string;
};

export type Opportunity = {
  id: string;
  title: string;
  type: OpportunityType;
  summary: string;
  description: string | null;
  provider_name: string;
  organization_id: string | null;
  posted_by: string | null;
  link: string;
  is_free: boolean;
  location: string;
  eligibility: string | null;
  requirements: string[];
  deadline: string | null;
  created_at: string;
};

export type TrackerEntry = {
  id: string;
  student_id: string;
  opportunity_id: string;
  status: TrackerStatus;
  created_at: string;
  updated_at: string;
  opportunity?: Opportunity;
};

export type OrgTrackerEntry = {
  id: string;
  student_id: string;
  opportunity_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  application_checklist: unknown;
  opportunity: { title: string; type: string } | null;
};

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function fetchOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Organization[];
}

export async function createOrganization(input: {
  name: string;
  type: OrgType;
  governorate: string | null;
  website: string | null;
}): Promise<Organization> {
  const { data, error } = await supabase
    .from("organizations")
    .insert({ ...input, created_by: null })
    .select("*")
    .single();
  if (error) throw error;
  return data as Organization;
}

export async function createProfile(input: {
  user_id: string;
  display_name: string;
  role: "student" | "educator";
  organization_id?: string | null;
  school_id?: string | null;
  grade?: string | null;
  governorate?: string | null;
  interests?: string[];
}): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").insert(input).select("*").single();
  if (error) throw error;
  return data as Profile;
}

export async function fetchOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("deadline", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as Opportunity[];
}

export async function fetchOpportunity(id: string): Promise<Opportunity | null> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Opportunity | null) ?? null;
}

export async function fetchMyTracker(studentId: string): Promise<TrackerEntry[]> {
  const { data, error } = await supabase
    .from("tracker_entries")
    .select("*, opportunity:opportunities(*)")
    .eq("student_id", studentId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TrackerEntry[];
}

export async function fetchTrackerForOpportunity(
  studentId: string,
  opportunityId: string,
): Promise<TrackerEntry | null> {
  const { data, error } = await supabase
    .from("tracker_entries")
    .select("*")
    .eq("student_id", studentId)
    .eq("opportunity_id", opportunityId)
    .maybeSingle();
  if (error) throw error;
  return (data as TrackerEntry | null) ?? null;
}

export async function saveOpportunity(studentId: string, opportunityId: string): Promise<void> {
  const { error } = await supabase
    .from("tracker_entries")
    .insert({ student_id: studentId, opportunity_id: opportunityId, status: "saved" });
  if (error) throw error;
}

export async function updateTrackerStatus(entryId: string, status: TrackerStatus): Promise<void> {
  const { error } = await supabase
    .from("tracker_entries")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", entryId);
  if (error) throw error;
}

export async function removeTrackerEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from("tracker_entries").delete().eq("id", entryId);
  if (error) throw error;
}

export async function createOpportunity(input: {
  title: string;
  type: OpportunityType;
  summary: string;
  description: string | null;
  provider_name: string;
  organization_id: string | null;
  posted_by: string;
  link: string;
  is_free: boolean;
  location: string;
  eligibility: string | null;
  requirements: string[];
  deadline: string | null;
}): Promise<Opportunity> {
  const { data, error } = await supabase.from("opportunities").insert(input).select("*").single();
  if (error) throw error;
  return data as Opportunity;
}

export async function deleteOpportunity(id: string): Promise<void> {
  const { error } = await supabase.from("opportunities").delete().eq("id", id);
  if (error) throw error;
}

/** Students linked to an organization (visible to educators of that org via RLS). */
export async function fetchOrgStudents(organizationId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .eq("school_id", organizationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

/** Tracker entries across an educator's students (RLS-scoped). */
export async function fetchOrgTrackerEntries(): Promise<OrgTrackerEntry[]> {
  const { data, error } = await supabase
    .from("tracker_entries")
    .select("*, opportunity:opportunities(title, type)");
  if (error) throw error;
  return (data ?? []) as OrgTrackerEntry[];
}

/** Opportunities posted by one educator profile. */
export async function fetchPostedOpportunities(profileId: string): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("posted_by", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Opportunity[];
}
