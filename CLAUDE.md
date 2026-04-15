# Project: nicolobrandizzi.com

Personal website of Dr. Nicolo' Brandizzi. Jekyll + SCSS + Tailwind, hosted on GitHub Pages at `nicolobrandizzi.com`.

## Google Analytics (GA4)

GA4 property is named "github page - GA4". Use `get_account_summaries` to look up the property ID at query time.

### Bot filtering: visitor_type

The site uses a custom bot detection system (`assets/js/bot_detection.js`) that classifies every session and sets a **user-scoped custom dimension** called `visitor_type`.

**Values:**
- `human` — confirmed via interaction signals (mouse movement, scroll, click, keyboard, touch). Page view fires only after confirmation.
- `bot` — flagged via headless browser indicators or no interaction. **No page_view is fired**, so bots don't inflate metrics.
- `uncertain` — no interaction after 8s timeout, but no bot indicators either (passive readers). Page view fires (benefit of the doubt).
- `unknown` — visitor left before classification ran. Default value set in `head.html`. No page_view fired.

**How it works:**
1. `head.html` loads GA4 with `send_page_view: false` and sets `visitor_type: 'unknown'`
2. `bot_detection.js` (deferred) monitors interaction signals and bot indicators
3. On classification, it calls `gtag('set', 'user_properties', { visitor_type: '...' })`
4. For `human` and `uncertain`, it also fires `gtag('event', 'page_view')`
5. For `bot` and `unknown`, no page_view — these sessions don't appear in page view counts

**Querying clean data:**
- Filter by `visitor_type = human` for strictest view (only confirmed interactive visitors)
- Filter by `visitor_type IN (human, uncertain)` for broader view including passive readers
- The `page_view` metric already excludes bots by design — it only fires for human + uncertain
- Legacy events (`confirmed_human`, `likely_bot`, `uncertain_visitor`) are still sent alongside the user property for backwards compatibility

**GA4 Admin setup:**
The `visitor_type` custom dimension must be registered in GA4 Admin > Custom definitions:
- Name: `Visitor Type`
- Scope: **User**
- Event parameter: `visitor_type`

## Build

Jekyll site with PostCSS (Tailwind). SCSS lives in `_scss/`, design tokens in `_scss/abstracts/_variables.scss`.

```bash
# Local dev (requires Ruby + bundler + Node)
bundle exec jekyll serve
```

CI/CD runs via GitHub Actions ("Build & Deploy Jekyll" workflow).

## Collections

- `_blog/` — blog posts (layout: `blogs`), permalink: `/blog/:slug/`
- `_news/` — news items (layout: `news`), permalink: `/news/:slug/`
- `_projects/` — projects (layout: `projects`), permalink: `/projects/:title/`
- `_education/`, `_experience/`, `_certificates/` — data collections (no output)
