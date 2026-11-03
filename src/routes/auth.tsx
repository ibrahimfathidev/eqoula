import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { useAuth, destinationFor } from "@/lib/auth";
import { fetchMyProfile } from "@/lib/data";
import { toast } from "sonner";
import { GoogleLogo } from "@/components/GoogleLogo";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [signingIn, setSigningIn] = useState(false);

  // Already signed in? Send the user where they belong.
  useEffect(() => {
    if (loading || !session) return;
    navigate({ to: profile ? destinationFor(profile) : "/onboarding", replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session, profile]);

  async function handleGoogleSignIn() {
    setSigningIn(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      setSigningIn(false);
      return;
    }
    if (result.redirected) {
      // The browser is navigating to Google — nothing else to do here.
      return;
    }
    // Tokens were returned and the session is already set: route by profile.
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    if (!userId) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    const p = await fetchMyProfile(userId);
    navigate({ to: p ? destinationFor(p) : "/onboarding", replace: true });
  }

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader />
      <main className="app-shell flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-6 py-16">
        <img
          src="/icon-192.png"
          alt=""
          className="h-20 w-20 rounded-2xl object-contain shadow-sm"
          aria-hidden
        />
        <h1 className="mt-6 text-center text-2xl font-extrabold text-primary">
          Welcome to Equało
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Turn your ambitions into achievements. Sign in to discover scholarships,
          competitions, research programs and training.
        </p>

        <Card className="mt-8 w-full max-w-sm rounded-3xl">
          <CardContent className="flex flex-col gap-3 p-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="h-12 rounded-xl text-base font-semibold"
            >
              <GoogleLogo className="h-5 w-5" />
              {signingIn ? "Signing you in…" : "Continue with Google"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Students pick their school and interests after signing in. Schools,
              universities, NGOs and donors get an impact dashboard.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
