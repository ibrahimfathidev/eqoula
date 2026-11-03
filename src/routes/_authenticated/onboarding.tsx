import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchOrganizations, createOrganization, createProfile, type Organization } from "@/lib/data";
import { GOVERNORATES, INTERESTS, GRADES, ORG_TYPES, ORG_TYPE_LABELS, type OrgType } from "@/lib/constants";
import { toast } from "sonner";
import { GraduationCap, Building2, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "Set up your account — Equało" },
      { name: "description", content: "Tell us if you're a student or an education organization." },
      { property: "og:title", content: "Set up your account — Equało" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Role = "student" | "educator";

function OnboardingPage() {
  const { profile, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [saving, setSaving] = useState(false);

  // Student form state
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<string>("Grade 11");
  const [governorate, setGovernorate] = useState<string>("");
  const [interests, setInterests] = useState<string[]>([]);
  const [schoolId, setSchoolId] = useState<string>("");

  // Educator form state
  const [orgChoice, setOrgChoice] = useState<string>(""); // existing org id, or "new"
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgType, setNewOrgType] = useState<OrgType>("school");
  const [newOrgGovernorate, setNewOrgGovernorate] = useState<string>("");

  useEffect(() => {
    fetchOrganizations().then(setOrgs).catch(() => setOrgs([]));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!profile) return;
    // Existing profile: allow editing details, prefill and route by role on save.
    setRole(profile.role);
    setName((n) => n || profile.display_name);
    setGrade((g) => g || profile.grade || "Grade 11");
    setGovernorate((g) => g || profile.governorate || "");
    setInterests((i) => (i.length ? i : profile.interests));
    setSchoolId((s) => s || profile.school_id || "");
    setOrgChoice((c) => c || profile.organization_id || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, profile]);

  const canSaveStudent = useMemo(
    () => name.trim().length > 1 && governorate !== "" && interests.length > 0,
    [name, governorate, interests],
  );
  const canSaveEducator = useMemo(() => {
    if (name.trim().length < 2) return false;
    if (orgChoice === "new")
      return newOrgName.trim().length > 1 && newOrgGovernorate !== "";
    return orgChoice !== "";
  }, [name, orgChoice, newOrgName, newOrgGovernorate]);

  async function handleSave() {
    setSaving(true);
    try {
      let orgId: string | null = null;
      if (role === "educator") {
        if (orgChoice === "new") {
          const org = await createOrganization({
            name: newOrgName.trim(),
            type: newOrgType,
            governorate: newOrgGovernorate,
            website: null,
          });
          orgId = org.id;
        } else {
          orgId = orgChoice;
        }
      }
      await createProfile({
        user_id: (await supabase.auth.getUser()).data.user!.id,
        display_name: name.trim(),
        role: role === "educator" ? "educator" : "student",
        organization_id: role === "educator" ? orgId : null,
        school_id: role === "student" ? schoolId || null : null,
        grade: role === "student" ? grade : null,
        governorate,
        interests,
      });
      await refresh();
      toast.success("You're all set!");
      navigate({ to: role === "educator" ? "/org" : "/dashboard", replace: true });
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader title="Set up" />
      <main className="app-shell app-shell-with-nav px-4 py-6">
        {role === null ? (
          <>
            <h1 className="text-2xl font-extrabold text-primary">Who are you?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This helps us show the right tools for you.
            </p>
            <div className="mt-6 grid gap-3">
              <button
                onClick={() => setRole("student")}
                className="flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-5 text-left transition-colors hover:border-accent"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-soft">
                  <GraduationCap className="h-6 w-6 text-accent" />
                </span>
                <span>
                  <span className="block text-base font-extrabold text-foreground">I'm a student</span>
                  <span className="block text-sm text-muted-foreground">
                    Find opportunities and track applications
                  </span>
                </span>
              </button>
              <button
                onClick={() => setRole("educator")}
                className="flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-5 text-left transition-colors hover:border-accent"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-soft">
                  <Building2 className="h-6 w-6 text-primary" />
                </span>
                <span>
                  <span className="block text-base font-extrabold text-foreground">
                    We're an education organization
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    School, university, NGO or donor / government program
                  </span>
                </span>
              </button>
            </div>
          </>
        ) : (
          <Card className="rounded-3xl">
            <CardContent className="space-y-4 p-5">
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === "student" ? "e.g. Ahmed Mohamed" : "e.g. Ms. Sara Hassan"}
                  className="mt-1.5 h-12 rounded-xl text-base"
                  maxLength={60}
                />
              </div>

              {role === "student" ? (
                <>
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <select
                      id="grade"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="mt-1.5 h-12 w-full rounded-xl border border-input bg-card px-3 text-base"
                    >
                      {GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="gov">Governorate</Label>
                    <select
                      id="gov"
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="mt-1.5 h-12 w-full rounded-xl border border-input bg-card px-3 text-base"
                    >
                      <option value="">Choose your governorate…</option>
                      {GOVERNORATES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Interests (pick at least one)</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {INTERESTS.map((interest) => {
                        const active = interests.includes(interest);
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() =>
                              setInterests((prev) =>
                                active ? prev.filter((x) => x !== interest) : [...prev, interest],
                              )
                            }
                            className={cn(
                              "rounded-full border-2 px-3.5 py-2 text-sm font-semibold transition-colors",
                              active
                                ? "border-accent bg-accent text-accent-foreground"
                                : "border-border bg-card text-foreground hover:border-accent/50",
                            )}
                            aria-pressed={active}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="school">My school or organization (optional)</Label>
                    <select
                      id="school"
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                      className="mt-1.5 h-12 w-full rounded-xl border border-input bg-card px-3 text-base"
                    >
                      <option value="">Not linked right now</option>
                      {orgs.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} — {ORG_TYPE_LABELS[o.type]}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Linking lets your school or organization follow and support your applications.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="org">Your organization</Label>
                    <select
                      id="org"
                      value={orgChoice}
                      onChange={(e) => setOrgChoice(e.target.value)}
                      className="mt-1.5 h-12 w-full rounded-xl border border-input bg-card px-3 text-base"
                    >
                      <option value="">Choose your organization…</option>
                      {orgs.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} — {ORG_TYPE_LABELS[o.type]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrgChoice(orgChoice === "new" ? "" : "new")}
                    className="flex items-center gap-2 text-sm font-bold text-accent"
                  >
                    <Plus className="h-4 w-4" /> Add a new organization instead
                  </button>
                  {orgChoice === "new" ? (
                    <div className="space-y-3 rounded-2xl bg-secondary p-4">
                      <div>
                        <Label htmlFor="new-org-name">Organization name</Label>
                        <Input
                          id="new-org-name"
                          value={newOrgName}
                          onChange={(e) => setNewOrgName(e.target.value)}
                          placeholder="e.g. Sohag Youth Association"
                          className="mt-1.5 h-12 rounded-xl text-base"
                          maxLength={80}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-org-type">Type</Label>
                        <select
                          id="new-org-type"
                          value={newOrgType}
                          onChange={(e) => setNewOrgType(e.target.value as OrgType)}
                          className="mt-1.5 h-12 w-full rounded-xl border border-input bg-card px-3 text-base"
                        >
                          {ORG_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {ORG_TYPE_LABELS[t]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="new-org-gov">Governorate</Label>
                        <select
                          id="new-org-gov"
                          value={newOrgGovernorate}
                          onChange={(e) => setNewOrgGovernorate(e.target.value)}
                          className="mt-1.5 h-12 w-full rounded-xl border border-input bg-card px-3 text-base"
                        >
                          <option value="">Choose governorate…</option>
                          {GOVERNORATES.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : null}
                </>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={() => setRole(null)}>
                  Back
                </Button>
                <Button
                  className="h-12 flex-[2] rounded-xl font-bold"
                  disabled={saving || (role === "student" ? !canSaveStudent : !canSaveEducator)}
                  onClick={() => void handleSave()}
                >
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {profile ? "Update & continue" : "Continue"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
