# Inge — Pianoles Website

## Project
Simple website for a piano teacher in Gorssel: one landing page plus a separate contact page.
Hosted on GitHub Pages from `main` (repo `valentijnweinans/inge`). **Open tasks: see `TODO.md`.**

## Tech Stack
- Vanilla HTML, CSS, JavaScript (no frameworks, no build tools)
- Served as static files (GitHub Pages). Texts are loaded with `fetch('content.json')`, which
  browsers block on `file://` — preview locally with `python3 -m http.server 8080`
- Google Fonts: Cormorant Garamond (headings, italic accents), Jost (body)

## File Structure
```
index.html    → Landing page: hero, Over mij, Ervaringen (reviews), green CTA band
contact.html  → Contact form
content.json  → ALL website text, photo paths and alt texts (editable by client)
main.js       → Content injection, header-on-scroll, contact form submit
styles.css    → All styling, mobile-first
img/          → hero.jpg (landscape), hero-mobiel.jpg (portrait, phones), over-mij.jpg, contact.jpg —
                web-sized, EXIF stripped. IMG2026*.jpg are the original phone photos (not used by the site)
```

## Design
Black and white, artistic and clean, with pastel green as the only accent.
Colors are custom properties in `:root` of `styles.css`:
- `--black #0b0b0b`, `--ink #1c1c1c`, `--paper #fbfbf9`, `--grey #6b6b6b`
- `--green #cfe3d3` (pastel, backgrounds and hovers), `--green-deep #9fc5a8` (lines)
The whole site is capped at `--site-max: 1800px` and centred; outside it the background is plain `--paper`.
Pictures are big: full-viewport hero, half-screen photo in Over mij. Photos are shown in
black-and-white via `--photo-filter` in `:root` (set to `none` for colour). Hero slogan sits
bottom-right on desktop because Inge is on the left of the photo.

## Key Conventions
- **Content lives in `content.json`**. HTML elements are empty and carry `data-content="key"`;
  `init()` in `main.js` fetches the JSON and `injectContent()` fills them (images via `setImage()`).
  Never hardcode text in HTML. Adding text = new key in `content.json` **and** an injection call.
- JSON has no comments: editing instructions for the client live in the `_uitleg` array.
- If the JSON is invalid, `showContentError()` shows a readable message at the top of the page.
- Text is injected with `textContent` (never `innerHTML`).
- Lists (over mij paragraphs, facts, reviews) are arrays in `content.json`, rendered via `fill()`.
- Separate files: no inline CSS or JS in the HTML.
- **Dutch language** for all UI text and code comments.
- The reviews in `content.json` are placeholders and must be replaced with real ones.

## SEO (local: pianoles Gorssel)
- Exceptions to "no hardcoded text": the `<head>` (title, description, canonical, Open Graph,
  JSON-LD `MusicSchool`/`LocalBusiness` for Gorssel) and image `src`/`alt`/`width`/`height` are
  static in the HTML so crawlers and link previews see them without JavaScript. `main.js` still
  overrides title/description/images from `content.json` — keep both in sync when changing them.
- H1 is `hero.kop` ("Pianoles in Gorssel"); the slogan is a `<p>`.
- Base URL is currently `https://valentijnweinans.github.io/inge` (GitHub Pages) in index.html,
  contact.html, robots.txt and sitemap.xml — swap it when a custom domain is set (see TODO.md).
- Don't add the reviews to JSON-LD (self-serving reviews aren't eligible and these are placeholders).

## Contact Form Contract
Posts JSON to the shared mail API (`vitis-mail-api` on Fly.io, source in `../anne_weinans/mail_api`)
with header `X-Api-Key` (constant `MAIL_API_KEY` in `main.js`).
Field names must stay Dutch: `naam`, `email`, `telefoon`, `bericht`, plus the `website` honeypot
and `form_loaded_at` timestamp (submissions under 3 seconds are silently dropped).
The client is registered as `inge` in `mail_api/config/clients.yml`.
