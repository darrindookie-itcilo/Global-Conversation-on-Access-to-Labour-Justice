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
This repository contains the full source and course assets. The live application uses a Cloudflare Worker and D1 database through Sites. GitHub Pages alone cannot run the authenticated notebooks and shared live rooms. GitHub Pages publishes the `docs` folder as a doorway to the live application, preserving notebook sign-in and live-room functionality.

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
