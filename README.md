# analytics-chart-dashboard

A responsive marketing analytics dashboard built with Vite, React, strict TypeScript, Tailwind CSS, Recharts, and lucide-react. Runs entirely in the browser without a backend, remote API, external fonts, or state library.

## Setup

Use Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. For a production build and local preview:

```sh
npm run build
npm run preview
```

`build` runs TypeScript checking before bundling to `dist/`. `preview` serves that build. Deploy `dist/` to any static host. No environment variables are required.

## Data model

`src/analytics.ts` is the single typed data source. It contains 900 daily campaign rows spanning **July 17–October 14, 2026** (90 inclusive UTC days), five acquisition channels, and two campaigns per channel. Each row includes date, channel, campaign, sessions, signups, conversions, and gross revenue in integer USD cents. Fixed arithmetic trends and weekday seasonality produce deterministic data once at module initialization; there is no random generator or current-clock dependency.

Sessions are visits rather than unique visitors. Signups and purchases are nested session-level events: at most one signup and one purchase per session, with purchase following signup. The funnel is an illustrative same-session funnel, not a cross-session cohort analysis. Revenue excludes refunds and expenses. Campaign attribution is mutually exclusive.

## Aggregations and filters

Pure `total`, `ratio`, `change`, and `aggregate` utilities centralize calculations. Date presets use the fixed snapshot date. Both date and channel filters recalculate KPI totals, the daily series, channel shares, funnel values and progression rates, and all campaign rows. Campaigns are sorted by revenue descending. A single channel selection correctly shows a 100% share for that channel.

Rates divide summed numerators by summed denominators, never average daily rates. Zero denominators return 0. Relative change is `(current - previous) / previous`; a zero prior value has no computable percentage and is labeled accordingly. The conversion-rate tile comparison is relative percent change, not percentage points. Comparisons use equal-length adjacent periods and the same channel filter. Seven- and thirty-day views have full prior periods. Ninety-day comparisons are unavailable because prior data does not exist; partial periods are never compared.

Currency is stored and summed as cents, then formatted as USD rounded to whole dollars for display. Daily series include zero-value days. No activity produces explicit chart and table empty states. The supplied demo has activity for every selectable combination; the empty-state branches also handle empty source rows.

## Interface and accessibility

- Four KPI cards: sessions, signups, conversion rate, revenue.
- Daily sessions line/area chart, session-share donut with numeric legend, proportional conversion funnel, and all matching campaigns ranked by revenue.
- Keyboard-accessible metric definition tooltips, labeled native filter controls, live selection summary, chart text summaries, expandable daily values, and semantic campaign table.
- Responsive desktop sidebar, compact tablet navigation, and single-column mobile charts. System fonts, reduced-motion support, and local-only state.

## Source layout

- `src/analytics.ts`: types, deterministic data, pure aggregation and formatting utilities.
- `src/App.tsx`: dashboard and local filter state.
- `src/styles.css`: Tailwind directives and responsive dashboard styling.
- `src/main.tsx`: React entry point.

## Screenshot

<img width="1900" height="908" alt="image" src="https://github.com/user-attachments/assets/eee36970-28b3-4cb8-a80e-473495895c9f" />


No tests, database, authentication, or additional dashboards are included.
