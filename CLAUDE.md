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

## Google Search Console (GSC)

MCP server `gsc` (package: `mcp-search-console` via `uvx`, [AminForou/mcp-gsc](https://github.com/AminForou/mcp-gsc)). Configured in `.mcp.json` with OAuth using `client_secret.json` (gitignored).

**Properties:**
- `sc-domain:nicolobrandizzi.com` — primary (domain property, owner)
- `https://nicofirst1.github.io/` — old property, 301-redirects to new domain

Use `list_properties` to confirm property URLs before querying. The `site_url` parameter must match exactly (e.g. `sc-domain:nicolobrandizzi.com`, not `https://nicolobrandizzi.com`).

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

When drafting or editing blog posts (or any published prose), follow the learned patterns in `.claude/skills/learned/`: `blog-writing-style.md` (voice, balance, interaction) and `verify-claims-with-research-agent.md` (fact-check claims before publishing).

## Substack syndication (distribution-first, backlink attribution)

Distribution strategy: real humans are ~95% Direct (network-driven), SEO is effectively dead (~21 organic humans/yr). So the **site is the permanent home / portfolio / brand-search anchor**, Substack is the distribution + audience-growth engine. Publication URL lives in `_config.yml` (`substack:`) — single source of truth, consumed by `_includes/subscribe.html` (subscribe CTA on post pages + homepage) and `_data/social.yml` (footer icon).

**IMPORTANT — Substack has NO canonical-back (verified 2026-06-03).** Substack self-canonicalizes every post to its own URL and exposes **no canonical-URL field** in the editor (any plan); the RSS `<link>` is used to fetch content but ignored for canonical. So Google will treat the **Substack** copy as canonical for syndicated posts and may out-rank the site copy. This is **acceptable** because SEO is already ~dead for us — we trade near-zero post-level SEO for full Substack reach. Do NOT chase a canonical-back workflow; it doesn't exist. Attribution is handled by an **in-body backlink** instead (auto-injected by `_plugins/substack_clean.rb` just under the TL;DR, so it stays out of the email preview). Protect brand/name SEO via the homepage + `/projects` (unaffected by post-level cannibalization), not via post canonicals.

**Bulk back-catalog import:** Substack's Settings → Imports reads an **RSS feed**, not single-post URLs. The public `feed-blog.xml` carries only 200-char summaries, so a dedicated full-content feed `feed-substack-import.xml` exists (RSS 2.0, `content:encoded`, absolute asset/link URLs, all posts). Point Substack's importer at `https://nicolobrandizzi.com/feed-substack-import.xml`. The import feed can be deleted once the back-catalog is in. **Footnotes:** Substack strips footnote anchor IDs, so clickable in-page footnotes can't survive import — `substack_clean.rb` flattens them to a numbered "Notes" endnote block. The only way to get native clickable Substack footnotes is to re-add them by hand in Substack's editor (not worth it).

**Per-new-post workflow (mostly automated):**
1. Publish on nicolobrandizzi.com first (the site's `<link rel="canonical">` self-references via `jekyll-seo-tag` — this is your owned system-of-record copy).
2. On push, the `Substack syndication reminder` GitHub Action (`.github/workflows/substack-syndicate.yml`) detects newly-added `_blog/` posts and opens a GitHub issue with: the Substack import page (`https://nicolobrandizzi.substack.com/publish/import`) and a **single-post RSS feed** (`/feed-substack/<slug>.xml`, generated by `_plugins/substack_post_feeds.rb`). Click import → one clean draft, footnotes flattened, backlink already injected under the TL;DR.
3. Review fidelity (images, Notes endnotes, the "Originally published at" line under the TL;DR), publish web-only, then send as email + share to Notes.
4. Add `substack_url: <substack post URL>` to the post's front matter — `_layouts/blogs.html` renders a "Read & discuss this on Substack" backlink (Substack hosts the comment community).

Never rank content by raw page-views while the `page_view` under-fire bug is open — use session/human-event counts.
