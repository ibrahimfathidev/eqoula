import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useAuth, destinationFor } from "@/lib/auth";
import { fetchOpportunities, type Opportunity } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      {
        title: "Equało — Turn Your Ambitions Into Achievements",
      },
      {
        name: "description",
        content:
          "Free platform helping underserved students in Egypt find scholarships, competitions, research programs and training. Schools, universities, NGOs and donors post opportunities and track their impact.",
      },
      { property: "og:title", content: "Equało — Turn Your Ambitions Into Achievements" },
      {
        property: "og:description",
        content: "Every student deserves the chance to dream big. Find opportunities in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function LandingPage() {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Opportunity[] | null>(null);

  useEffect(() => {
    fetchOpportunities()
      .then((ops) => setFeatured(ops.slice(0, 4)))
      .catch(() => setFeatured([]));
  }, []);

  // Signed-in users land inside the app.
  useEffect(() => {
    if (loading || !session) return;
    navigate({ to: profile ? destinationFor(profile) : "/onboarding", replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session, profile]);

  return (
    <div className="min-h-dvh bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-b from-secondary to-background px-6 pb-12 pt-14">
        <div className="app-shell text-center">
          <img
            src="/icon-192.png"
            alt="Equało"
            className="mx-auto h-24 w-24 rounded-3xl object-contain shadow-md"
          />
          <h1 className="mt-6 text-3xl font-extrabold leading-tight text-primary">
            Turn your ambitions into achievements
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            Every student deserves the chance to dream big. Equało brings scholarships,
            competitions, research programs and training into one free place — no
            privileged connections required.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button size="lg" className="h-12 rounded-2xl text-base font-bold" onClick={() => navigate({ to: session ? (profile ? destinationFor(profile) : "/onboarding") : "/auth" })}>
              {session ? "Go to my dashboard" : "Get started — it's free"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-2xl border-2 border-primary/20 bg-card text-base font-bold text-primary hover:bg-secondary"
              onClick={() => navigate({ to: "/explore" })}
            >
              Explore opportunities
            </Button>
          </div>
          <p className="mt-6 text-xs font-medium text-muted-foreground">
            Free forever for students · Built for schools, universities, NGOs &amp; donors
          </p>
        </div>
      </section>

      {/* Featured opportunities */}
      <section className="app-shell px-4 pb-12">
        <div className="flex items-end justify-between px-1">
          <div>
            <h2 className="text-lg font-extrabold text-primary">Open right now</h2>
            <p className="text-xs text-muted-foreground">Real programs with real deadlines</p>
          </div>
          <Button
            variant="link"
            className="h-auto p-0 text-sm font-bold text-accent"
            onClick={() => navigate({ to: "/explore" })}
          >
            See all →
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {featured === null
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
            : featured.map((op) => <OpportunityCard key={op.id} opportunity={op} />)}
        </div>
      </section>

      {/* For organizations */}
      <section className="app-shell px-4 pb-16">
        <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-sm">
          <h2 className="text-lg font-extrabold">For schools, universities, NGOs &amp; donors</h2>
          <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
            Post opportunities, follow your students' applications and see your impact —
            students reached, applications started and submitted.
          </p>
          <Button
            className="mt-4 h-11 rounded-xl bg-accent px-6 font-bold text-accent-foreground hover:bg-accent/90"
            onClick={() => navigate({ to: session ? (profile ? destinationFor(profile) : "/onboarding") : "/auth" })}
          >
            Open the impact dashboard
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 px-6 py-8 text-center text-xs text-muted-foreground">
        Equało — Ambition Without Barriers · SDG 10: Reduced Inequalities
      </footer>
    </div>
  );
}
