# Third-Party Notices

> **Canonical submission records:** `SUBMISSION_FINAL_SUMMARY.md`,
> `SUBMISSION_TEST_RESULTS.md`, `SUBMISSION_KNOWN_ISSUES.md`, and
> `SUBMISSION_RELEASE_CHECKLIST.md`.

Last reviewed: 2026-07-28

TOUCHLINE 26 is an independent, unofficial project. It is not affiliated with,
endorsed by, or sponsored by FIFA, the Korea Football Association, the Football
Association of the Czech Republic, the Mexican Football Federation, the South
African Football Association, COSAFA, any competition operator, club, coach, or
player represented in the service.

## Open-source runtime

The application uses the following open-source projects. Original copyright
notices and complete license texts remain in each installed package and linked
upstream repository.

| Component | Purpose | License |
| --- | --- | --- |
| [Next.js](https://github.com/vercel/next.js) | Web framework | MIT |
| [React](https://github.com/facebook/react) | User interface runtime | MIT |
| [React DOM](https://github.com/facebook/react) | Browser rendering | MIT |
| [dnd-kit](https://github.com/clauderic/dnd-kit) | Accessible drag and drop | MIT |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | CSS tooling | MIT |

TypeScript, ESLint, Vitest, Testing Library, jsdom, and transitive development
dependencies retain their upstream notices in the installed dependency tree.

## Official data sources

The canonical Group A dataset references:

- the FIFA World Cup 2026 final squad-list PDF;
- FIFA Full-Time Match Reports for M01, M02, M25, M28, M53, and M54;
- FIFA Tactical Line-up reports for those six matches;
- FIFA Training Centre Post-Match Summary Reports for those six matches;
- FIFA official match-data API responses and official match articles;
- FIFA official men's ranking articles;
- one COSAFA official article used only to fill the club omitted for Jayden
  Adams in the FIFA squad PDF.

Exact URLs, access dates, purposes, and conflict-resolution notes are stored in
`src/data/sources/sourceRegistry.json` and documented in
`docs/DATA_RESEARCH.md`. Product-asset provenance is recorded separately in
`docs/ASSET_MANIFEST.md`.

The registry currently contains 51 unique URLs: 34 sources linked to existing
match and squad facts plus 17 BASE rights-and-coverage audit candidates. Its
recorded permission classification is 46 `restricted` and 5 `open_license`.
None of the 51 sources is accepted as recent-365-day P0 performance evidence:
the restricted sources do not grant the required reuse scope, while the five
open-license candidates do not cover the required players, period, and metrics.

The service stores a limited set of match and squad facts in a new structure.
It does not redistribute source PDFs, article text, photographs, video,
broadcast footage, source branding, or report layouts. Locally downloaded
research PDFs and rendered pages must not be committed to a public repository.
All rights in the source publications, names, and marks remain with their
respective owners.

## Derived and incomplete values

The final squad list verifies identity, shirt number, official position, club
association, and related squad metadata. It is not presented as a player
performance license or a recent-365-day performance dataset.

No verified common player-level dataset was available for the BASE PROFILE
window of 2025-06-11 through 2026-06-10. The mission P0 contains 81 players and
remains 0/81 complete with 0/648 active attributes. Across the full 104-player
squad registry, all profiles keep analysis minutes and attributes null with
grade D/incomplete, for 0/832 active attributes. No FIFA or Football Manager
rating is copied or imitated.

The project implements club/national 80/20 evidence combination, Tournament
Form, and effective-attribute integration. Those functions have zero production
effect because no qualifying performance records were accepted, stored BASE
attributes remain null, and all current Form adjustments are zero.

Tournament Form, Current Condition, tactical scores, risks, and explanations
are project-defined data layers. In particular:

- Tournament Form uses only earlier appearance facts and applies no numeric
  adjustment when metrics are missing.
- Current Condition's energy estimate is a disclosed formula based on verified
  current-match minutes, not official biometric data.
- the TOUCHLINE League Strength Index contains 26 club-association contexts,
  but all strength factors are marked low/incomplete, are not applied, and have
  zero attribute effect because no verified cross-league comparison source was
  available.

These values must not be described as FIFA ratings, medical facts, validated
league rankings, or predictions.

## Product assets

- The TOUCHLINE 26 interface, pitch, player tokens, gauges, and text-based
  country identifiers are original project assets.
- The `TL26` browser icon and header mark are code-authored project assets, and
  the 1200×630 Open Graph image is generated dynamically by Next.js
  `ImageResponse`; no external image original is embedded in either asset.
- The application uses system font fallbacks and does not bundle an external
  commercial font.
- No third-party player portrait, team crest, national association logo, FIFA
  tournament logo, report screenshot, stock photograph, or paid icon set is
  included.
- Country and player names are factual identifiers; no endorsement is implied.

## Project code rights

No project-level open-source license has been selected. Public availability for
hackathon review does not grant permission to copy, modify, distribute, or
reuse the application code, design, or original product assets. Separate
written permission from the project owner is required. This notice does not
grant rights to external source materials, names, marks, or publications.

## Historical Python reference implementation

`python-fastapi/` is intentionally excluded from the final public main tip. A
frozen reference implementation of the earlier single-match concept remains
only in the Git-ignored local workspace and earlier Git history. It is not the
canonical Group A runtime, deployment, submission, or feature-equivalent
product. The dependencies in that local or historical copy retain their
respective upstream licenses.

If a notice is missing or inaccurate, correct the attribution before public
redistribution.
