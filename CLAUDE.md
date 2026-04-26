# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal website for Marco Montanari, served at https://ingmmo.com (see `static/CNAME`). It's a Hugo static site with a hand-rolled layout — no Hugo theme, no Markdown content posts. The home page is rendered from JSON data files under `data/`.

## Commands

- `hugo server` — local dev server with live reload
- `hugo --minify` — production build into `./public` (this is what CI runs)

Hugo **extended** is required (the deployment uses `peaceiris/actions-hugo@v2` with `extended: true`).

## Deployment

GitHub Actions (`.github/workflows/gh-pages.yaml`) builds on every push to `main` and publishes `./public` to the `gh-pages` branch. The `static/CNAME` file pins the custom domain.

## Architecture

Single-page site assembled from partials and JSON.

- `layouts/index.html` — the home page. It calls a fixed sequence of partials in `layouts/partials/`.
- `layouts/_default/baseof.html` — outer HTML shell (loads `head.html` + `header.html`, then the `main` block).
- `layouts/partials/<name>.html` — each partial reads from a matching `data/<name>.json` via `.Site.Data.<name>`. For example, `partials/project.html` iterates `.Site.Data.projects.list`, and `partials/aboutDesc.html` reads `.Site.Data.aboutme`.

**To change content of a section, edit the JSON in `data/`, not the HTML.** Edit a partial only when changing markup or layout.

`static/css/main.min.css` is a prebuilt Tailwind bundle checked in directly — there is no JS/CSS toolchain in this repo. Don't try to "rebuild Tailwind"; just edit the minified CSS or override with inline classes that already exist in it. Font Awesome and Academicons are pulled from CDNs in `partials/head.html`.

## Conventions

- Project entries in `data/projects.json` use `list` (current) and `list_past` (archived). A `repo_icon` field selects the Font Awesome brand icon (e.g., `github`).
- The site uses `params.theme = "dark"` in `config.toml`; the value is applied as a class on `<html>` in `baseof.html`.
- Matomo analytics is hardcoded in `partials/head.html` pointing at `track.mousetracker.tech` site id 4.

## Design Context

`.impeccable.md` in the repo root is the source of truth for design decisions — read it before any design or frontend work. The summary:

### Users
Three concentric audiences, browser-on-a-laptop: freelance/consulting leads scanning for credibility, open-source collaborators considering joining Open History Map / Open Fantasy Maps / Just Play Bologna, and peers & curious technologists. Not a personal canonical record — the site needs to land with outsiders.

### Brand Personality
**Curious, polymathic, opinionated.** Restless intelligence that has chosen a frame. First-person, plain-spoken, willing to have a position. Not PR copy. Not a buzzword skills list.

### Aesthetic Direction
**Cartographic / atlas.** The site is a map of a person, and Marco's flagship projects are literally maps. Typographic legends, coordinates, considered margins. Paper / ink / cinnabar / woodblock-green palette in OKLCH (no pure black, no pure white). Asymmetric layout, strong typographic hierarchy, a distinctive display/body pairing — avoid the impeccable reflex-font list. Light and dark both designed with intent; respects `prefers-color-scheme` with a manual toggle.

**Anti-references:** the current dev-portfolio template itself, corporate consultancy vibes, AI-startup chrome (cyan-on-dark, gradients, glassmorphism), aggressive maximalism.

### Design Principles
1. **The map is the metaphor, not the wallpaper.** If a cartographic flourish doesn't help someone navigate, cut it.
2. **Show breadth without sprawl.** One rigorous system across all sections.
3. **Earn the dark mode.** Both themes designed; neither is a fallback.
4. **No identical card grid for projects.** Points on an atlas plate, not repeating rectangles.
5. **Italian, in Bologna, plainly.** Place is part of the brand.
