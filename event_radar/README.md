# Club Event Radar

A BUS 4498 practice build (Week 9, Friday Build 3). Club officers paste an announcement, an AI agent turns it into an event card and checks the posting rules, and the post is either published or held for a moderator.

## How it's hosted

| Part | What it does | Here |
|---|---|---|
| GitHub repository | Holds the code | This folder |
| GitHub Pages | Serves the public website | `index.html`, `style.css`, `app.js`, `config.js` |
| Supabase project | The backend | The database, the AI agent, the photos, the sign-in |
| Database table | Saves every post and its status | `events` |
| Edge Function | The AI agent | `supabase/functions/submit-event` |
| Secrets | Hold the AI key, which is never in this repository | Set in Supabase |
| Storage | Keeps flyer photos | The `flyers` bucket |
| Sign-in | Moderator accounts | Supabase Auth |

## Files

- `context/`: the posting rules and campus places (stable context).
- `test/`: sample posts, what should happen, and the test log.
- `supabase/migrations/`: the database changes, one per stage.
- `AGENTS.md` and `CLAUDE.md`: instructions for Claude Code and Codex.
- `HANDOFF.md`: handoff notes for a teammate.

Every club, event, and person in the sample posts is made up.

## Moderator Auth setup

The `#moderator` route is protected in two layers: the browser waits for a server-verified Supabase Auth user before it loads waiting posts, and Supabase Row Level Security allows review reads and updates only when the signed-in user has `app_metadata.role = "moderator"`. The browser guard improves the experience; RLS is the security boundary.

In Supabase:

1. Open **Authentication → Users → Add user** and create the moderator account.
2. Turn off **Allow new users to sign up** after the account is created.
3. Set that user’s `app_metadata` to `{ "role": "moderator" }`. Do not use `user_metadata` for authorization.
4. In **Authentication → URL Configuration**, add the deployed website URL to the allowed site URLs if you later add email links or password recovery.

Then open the website’s `#moderator` route, sign in, and confirm that waiting posts appear. Logged-out visitors can still read published events, but cannot read or update waiting posts.
