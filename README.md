# nicolobrandizzi.com

Personal website of **Dr. Nicolò Brandizzi** — AI researcher.

🌐 Live at **[nicolobrandizzi.com](https://nicolobrandizzi.com/)**

Built with [Jekyll](https://jekyllrb.com/), SCSS, and Tailwind (via PostCSS), hosted on GitHub Pages.

## Local development

Requires Ruby (3.3), Bundler, and Node (20).

```bash
bundle install        # install Ruby gems (first time)
npm install           # install Node deps for Tailwind/PostCSS (first time)
bundle exec jekyll serve   # serve locally with live reload
```

Tailwind CSS is compiled from `css/tailwind.css` to `dist/styles.css`:

```bash
npm run build
```

## Deployment

Deployment is **automatic**. Every push to `master` triggers the
"Build & Deploy Jekyll" GitHub Actions workflow
([`.github/workflows/jekyll.yml`](.github/workflows/jekyll.yml)), which builds
the site and publishes it to GitHub Pages. No manual build or `/docs` commit is
needed.

## Structure

- `_blog/`, `_news/`, `_projects/` — content collections
- `_education/`, `_experience/`, `_certificates/` — data collections
- `_scss/` — styles, with design tokens in `_scss/abstracts/_variables.scss`
- `assets/` — images, JS (including custom bot-detection for clean analytics)
