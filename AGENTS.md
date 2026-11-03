<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Equało (TanStack Start) — technical decisions

- Role model: `profiles.role` = `student | educator`, `org_type` on `organizations` = school / university / ngo / donor_government. Educator access is ownership-based (RLS scoped by profile/org), not an admin role — no `user_roles` table needed.
- Students link to an organization via `profiles.school_id`; educators see linked students through a security-definer helper `is_educator_of_org()` to avoid RLS recursion.
- Google is the only sign-in method (user's explicit choice); email/password stays off.
- All data reads/writes go through the browser Supabase client with RLS; no admin client anywhere.
- Mobile-first: `app-shell` (max-w-md centered) + fixed bottom tab nav; fonts via Google Fonts `Cairo` loaded in `src/routes/__root.tsx`.
- Brand tokens live in `src/styles.css` (navy primary `--primary`, pink `--accent`, `--pink-soft`, `--navy-soft`) — never hardcode colors in components.
- Seed data lives in migration `drizzle/migrations/0000_equola_core_schema.sql` (9 orgs, 9 real programs); deadlines are placeholders to verify with providers.
