# Global Conversation on Access to Labour Justice

[Open the live dashboard](https://global-conversation-labour-justice.darrin-dookie.chatgpt.site)

ITCILO / ILO — Diverse practices, shared goals. Residential phase: 23–27 November 2026.

## Included
- Searchable residential programme with parallel tracks, based on the supplied draft agenda.
- Eight topic companions usable independently of presenters.
- Private, account-linked session notebook and action plan, with export and print.
- Live Build a Bridge icebreaker with flexible groups, participant contributions, QR join, projector wall and facilitator spotlight.
- Five workshop formats: Routes to Labour Justice, Case Challenge, JusticeWorks, Missing Voice and Digital Justice.
- Original course visual identity, nine downloadable resources and dashboard help.

## Hosting and access
This repository contains the full source and course assets. The live application uses a Cloudflare Worker and D1 database through Sites. GitHub Pages alone cannot run the authenticated notebooks and shared live rooms. GitHub Pages forwards directly to the hosted dashboard with an immediate head script and a no-JavaScript fallback. There is no separate welcome screen or opening message. The supplied QR code remains on the main dashboard home; the two platform games appear only under Workshop games.

[GitHub Pages dashboard link](https://darrindookie-itcilo.github.io/Global-Conversation-on-Access-to-Labour-Justice/)

Visual identity follows the supplied April 2026 ITCILO guidance: complete primary logo, right aligned on white with clear space, Noto Sans condensed typography, institutional blue `#284B96`, and the original course artwork/social card.

Participant reading, workshop games and room-code access are public. The notebook sign-in screen uses facilitator-issued workshop accounts. Workshop accounts support password resets with session revocation and mandatory password changes; chosen passwords are salted and hashed with PBKDF2. The facilitator studio has its own server-validated login. Facilitator credentials are runtime secrets and are not included in this repository. Notebook contents are not listed in the facilitator studio. Existing account-linked notes are retained; the ChatGPT sign-in option is no longer displayed.

## Development
Requires Node.js 22+. Run `npm ci`, then the development command in package.json. Database schema and migrations are in `db` and `drizzle`. Configure D1 binding `DB` and runtime secrets `FACILITATOR_EMAIL` and `FACILITATOR_PASSWORD`. Never commit secrets or local database state.

Validation: `npx tsc --noEmit`, `node tests/api.test.mjs`, `npm run build`.

## Facilitation
See [Facilitator guide](FACILITATOR_GUIDE.md). Game situations are fictional learning scenarios; the dashboard links to the relevant ILO sources. They are not official diagnostic scores or assessments of particular countries.

## Source notes
The programme remains a draft. Friday afternoon is unspecified in the supplied agenda. The 2025 expert meeting resources provide substantive learning material, not 2026 course logistics. Original publication and institutional branding rights remain with their respective owners.

## Platform economy games
`/game1/`, `/game1/host`, `/game1/board` and corresponding `/game2/` routes provide live teams, host controls and projector views. Shared state uses the existing D1 service with optimistic version checks; the endpoint creates its namespaced table if absent. Questions, scores and explanations are preserved from the supplied briefs in `app/platform-content.json` and `public/platform/content.json`. No Firebase account is required.

Checks: `node tests/platform.test.mjs` and `node tests/platform-api.test.mjs` cover scoring and concurrent requests in addition to the original tests.

## Daily track allocation
My programme collects one preference per authenticated workshop account for each of Tuesday, Wednesday and Thursday. A day key covers both morning and afternoon. Facilitators confirm the attendance roster, request volunteers, generate a reproducible balanced proposal and publish it. Drafts are private to facilitators; participants receive only their own preference and confirmed assignment plus aggregate totals. Recorded reasons are required for manual adjustments, reopening and imbalanced exceptions. Track changes use version checks, with concurrent participant submissions retried safely.

The existing service creates its namespaced `track_allocations` table on first use. Run `node tests/tracks.test.mjs` and `node tests/tracks-api.test.mjs` for balancing and access/concurrency verification.
