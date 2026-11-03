# Equało — Ambition Without Barriers

Roadmap (progressive build). Source of truth: the capstone brief + the user's choices:
role-based accounts (student / education: School, University, NGO, Donor-Government),
Google sign-in only, education features = impact dashboard, post opportunities, see students,
real seed data.

## Done
- [x] Lovable Cloud backend (database, auth) connected
- [x] Schema: organizations, profiles (roles), opportunities, tracker_entries + RLS + GRANTs
- [x] Real seed data: 9 Egyptian organizations, 9 real programs (Rise, Misr El Kheir, AUC, ISEF…)
- [x] Google sign-in (managed OAuth broker)
- [x] Role-based onboarding (student vs education org; students link their school)
- [x] Student: explore catalogue with filters, opportunity detail, tracker (saved/in progress/submitted), matched-for-you, deadlines
- [x] Education accounts: impact dashboard (live counts), post opportunities, see linked students
- [x] Equało branding: logo assets, favicon, PWA manifest (installable)

## Open
- [ ] Verify full flow end-to-end with a real sign-in (needs a test Google account in preview)
- [ ] Arabic + English toggle with RTL (brief asks for Cairo/Tajawal, full RTL mirror)
- [ ] Offline support (service worker) — manifest-only PWA shipped so far
- [ ] Deadline reminders (WhatsApp-style preview) and notifications
- [ ] AI Guide chat (scripted) for "Am I eligible?" questions
- [ ] Application checklist per opportunity (beyond saved/in-progress/submitted)
- [ ] Opportunity editing for educators (delete works; edit form not built)
