import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Protected layout. Runs only in the browser (ssr: false) because the session
 * lives in browser storage. Everything under /dashboard, /tracker, /org and
 * /onboarding is gated here; server-side data access is additionally scoped
 * by RLS policies.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
