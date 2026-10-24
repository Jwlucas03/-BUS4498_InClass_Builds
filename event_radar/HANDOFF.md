# HANDOFF.md

## 1. What works now

Club Event Radar is live at [https://bus4498.github.io/BUS4498_InClass_Builds/event_radar/](https://bus4498.github.io/BUS4498_InClass_Builds/event_radar/). Visitors can read published events and submit announcements. The Supabase Edge Function uses Claude to turn announcements and flyer photos into event cards, checks the posting rules, detects duplicates, and holds flagged posts for review. A moderator can sign in, approve or reject waiting posts, and approved flyer posts appear on the public board with their image.

## 2. Where things live

- **GitHub repository:** `BUS4498_InClass_Builds`
- **Supabase project:** `event-radar`
- **Project URL:** [https://oqcxudkczwbxkqxdzlul.supabase.co](https://oqcxudkczwbxkqxdzlul.supabase.co)
- **Website:** `event_radar/index.html`, `event_radar/style.css`, `event_radar/app.js`, and `event_radar/config.js`
- **AI agent:** `event_radar/supabase/functions/submit-event/index.ts`
- **Database changes:** `event_radar/supabase/migrations/`
- **Rules and test data:** `event_radar/context/` and `event_radar/test/`
- **Database table:** `public.events`; **storage bucket:** `flyers`

## 3. Secrets

- `ANTHROPIC_API_KEY` — set in Supabase → Edge Functions → Secrets. It is used only by the `submit-event` Edge Function.
- The function uses Supabase’s server-side `SUPABASE_SECRET_KEYS` default value, with the legacy `SUPABASE_SERVICE_ROLE_KEY` only as a fallback. Do not copy either value into the repository.
- The teammate does not need any secret values. The website may contain only the Project URL and publishable key in `config.js`.

## 4. How to test

1. Submit sample post A from `event_radar/test/sample-announcements.md`. It should publish as Board Game Guild Game Night.
2. Submit post A again, or submit post C after A. It should say **Already posted** because the database catches the duplicate.
3. Submit the flyer photo with its sample text. It should wait for review, show the extracted Sustainability Crew Clothing Swap card, and display the flyer after the moderator approves it.

Keep new user sign-ups turned off in Supabase Authentication. The current moderator review policy is restricted to the existing moderator account; if that account changes, update the Stage 8 policy migration carefully.

## 5. What’s next

- Confirm GitHub Pages is serving the latest `main` branch.
- Enable Supabase’s leaked-password protection warning if appropriate for the moderator account.
- Consider adding the optional nightly cleanup job to archive past events.
- Keep the moderator account private and review waiting posts before approving them.

## 6. How we take turns

Before starting, download the latest repository changes with **pull**. Before stopping, upload completed changes with **push**. Tell the other person before working so changes do not overlap.
