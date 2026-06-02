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

## Substack syndication (canonical-back)

Distribution strategy: real humans are ~95% Direct (network-driven), SEO is effectively dead. So the **site is canonical**, Substack is the distribution engine. Publication URL lives in `_config.yml` (`substack:`) — single source of truth, consumed by `_includes/subscribe.html` (subscribe CTA on post pages + homepage) and `_data/social.yml` (footer icon).

**Bulk back-catalog import:** Substack's Settings → Imports reads an **RSS feed**, not single-post URLs. The public `feed-blog.xml` carries only 200-char summaries, so a dedicated full-content feed `feed-substack-import.xml` exists (RSS 2.0, `content:encoded`, absolute asset/link URLs, all posts). Point Substack's importer at `https://nicolobrandizzi.com/feed-substack-import.xml`. After importing, verify each post's canonical points back to the site; the import feed can be deleted once the back-catalog is in.

**Per-new-post workflow:**
1. Publish on nicolobrandizzi.com first (canonical lives here via `jekyll-seo-tag`).
2. In Substack, create the post via the editor and either paste the body or pull it in, then **set the editor's Canonical URL field to the site post URL**. Review fidelity (images, code blocks, footnotes), publish web-only, then send as email + share to Notes.
3. Add `substack_url: <substack post URL>` to the post's front matter — `_layouts/blogs.html` renders a "Read & discuss this on Substack" backlink (Substack hosts the comment community).

Never rank content by raw page-views while the `page_view` under-fire bug is open — use session/human-event counts.
