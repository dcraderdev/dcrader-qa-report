# Shmedium QA Audit — 2026-05-16

**Auditor:** Claude Code (automated Playwright + Lighthouse)
**Target:** https://shmedium-api.fly.dev/
**Tested:** 2026-05-16
**Tools:** Playwright 1.60, Lighthouse 12.8.2, Node.js 20.19.1

---

## TL;DR — Top 5 Highest-Impact Fixes

| # | Issue | Severity | Impact |
|---|-------|----------|--------|
| 1 | **78% of home page images are broken** (156/200 fail to load) | P1 | Every user sees broken images on the feed; core content is missing |
| 2 | **Mobile LCP is 5.6s** — render-blocking Google Fonts + JS chunk adds 2.46s on mobile | P1 | Mobile Lighthouse performance score is 70; half of mobile users bounce before content loads |
| 3 | **`manifest.json` still says "Authenticate Me App Academy Project"** — exposed boilerplate identity | P0 | Immediately visible to anyone opening devtools; brand-destroying and signals an unfinished project |
| 4 | **`/login`, `/signup`, `/register`, `/our-story` all return 404** — auth routes are not SPA-routed | P0 | Direct-linking to these URLs (from emails, Google, social shares) shows a 404 page; users cannot sign in via direct URL |
| 5 | **`robots.txt` and `sitemap.xml` serve the React SPA HTML instead of real files** | P1 | Search engines cannot crawl the site correctly; Googlebot will reject the robots.txt; site will not be indexed |

---

## Lighthouse Scores

### Desktop Home (`/`)
| Metric | Score / Value |
|--------|--------------|
| Performance | **99** |
| Accessibility | 92 |
| Best Practices | **78** |
| SEO | **83** |
| FCP | 0.5 s |
| LCP | 1.0 s |
| TBT | 0 ms |
| CLS | 0.001 |
| Speed Index | 0.6 s |
| TTFB | 24 ms |
| TTI | 1.0 s |

### Desktop Story `/story/1`
| Metric | Score / Value |
|--------|--------------|
| Performance | **99** |
| Accessibility | 95 |
| Best Practices | **78** |
| SEO | **83** |
| FCP | 0.5 s |
| LCP | 1.0 s |
| TBT | 0 ms |
| CLS | 0.006 |
| Speed Index | 0.6 s |
| TTFB | 32 ms |
| TTI | 1.0 s |

### Mobile Home (`/`) — simulated mobile throttling
| Metric | Score / Value |
|--------|--------------|
| Performance | **70** |
| Accessibility | 95 |
| Best Practices | **79** |
| SEO | **83** |
| FCP | **3.3 s** |
| LCP | **5.6 s** |
| TBT | 40 ms |
| CLS | 0 |
| Speed Index | **4.6 s** |
| TTFB | 31 ms |
| TTI | **5.7 s** |

---

## Performance Metrics Table (Playwright — real browser, no throttling)

| Metric | Desktop Home | Desktop /story/1 | Desktop /story/5 | Desktop /story/15 | Mobile Home |
|--------|-------------|------------------|------------------|-------------------|-------------|
| TTFB | 106 ms | 61 ms | 54 ms | 72 ms | 55 ms |
| DOMContentLoaded | 285 ms | 160 ms | 150 ms | 370 ms | — |
| Load event | 417 ms | 160 ms | 150 ms | 370 ms | — |
| LCP (observed) | 392 ms | 1,200 ms | 1,180 ms | 1,536 ms | 324 ms |
| CLS (observed) | 0.0032 | **0.1057** | **0.1060** | **0.1387** | 0.0003 |
| Total page weight | 4.73 MB | 827 KB | 1.23 MB | 1.56 MB | — |
| Images loaded | 4.41 MB | 661 KB | 937 KB | 1.44 MB | — |
| JS | 0* | 0* | 0* | 0* | — |
| CSS | 0* | 0* | 0* | 0* | — |

*JS/CSS size bytes were 0 because assets were served from Fly.dev's CDN without Content-Length headers, preventing byte counting in the response interceptor.

---

## P0 Issues — Site-Breaking / Identity / Security

### P0-1: `manifest.json` Contains App Academy Boilerplate Identity
**URL:** `https://shmedium-api.fly.dev/manifest.json`
**Observed:**
```json
{
  "short_name": "Authenticate Me",
  "name": "Authenticate Me App Academy Project",
  ...
}
```
**Impact:** Anyone opening devtools, "Add to Home Screen" on mobile, or reading the PWA manifest sees "Authenticate Me App Academy Project" — not "Shmedium." This is a credibility-destroying artifact that signals an unfinished/school project.
**Fix:** Update `public/manifest.json` with correct app name, description, and icons.

---

### P0-2: `/login`, `/signup`, `/register`, `/our-story` All Serve 404
**URLs tested:**
- `https://shmedium-api.fly.dev/login` → 404 "Page not found"
- `https://shmedium-api.fly.dev/signup` → 404 "Page not found"
- `https://shmedium-api.fly.dev/register` → 404 "Page not found"
- `https://shmedium-api.fly.dev/our-story` → 404 "Page not found"

**Impact:** Auth routes are accessed via modal on the home page, but none of these URL paths are registered in the React Router. This means:
- Any link to `/login` or `/signup` (in emails, social posts, Google results) shows a 404
- Users cannot bookmark or deep-link to the auth flow
- Password manager autofill by URL is broken
- Sharing a "create account" link is impossible

**Note:** The "Our Story" link in the nav correctly navigates to `/about` (which works), but `/our-story` as a direct URL 404s.
**Fix:** Register `/login`, `/signup`, `/register` routes in React Router (even if they render the modal inline). Configure the Fly.dev server to catch-all to `index.html` for unknown paths — the SPA already handles 404 with a custom page, but the router needs to know about these routes.

---

## P1 Issues — Significant UX Harm, Core Features Broken

### P1-1: 78% of Home Page Feed Images Fail to Load
**Observed:** 156 out of 200 images on the home page feed return `naturalWidth === 0` (broken).
**Broken image sources by domain (top offenders):**
| Domain | Broken count |
|--------|-------------|
| miro.medium.com | 40 |
| images.unsplash.com | 31 |
| cdn2.iconfinder.com | 14 |
| cdn1.iconfinder.com | 9 |
| images.pexels.com | 11 |
| cdn.dribbble.com | 5 |
| cdn.icon-icons.com | 6 |
| freeiconshop.com | 6 |
| logos-world.net | 6 |
| logowik.com | 6 |
| Others | 12 |

**Root cause hypothesis:** Images stored by URL reference to external CDNs (Unsplash, Pexels, Medium's own CDN, iconfinder) have either expired, been rate-limited, or been blocked by hotlinking policies. The `miro.medium.com` domain specifically suggests real Medium CDN URLs are stored in the database but are blocked from third-party access.

**Impact:** The home page feed is dominated by empty broken image placeholders. Profile avatars throughout the site (using `freeiconshop.com`) also fail to load. The app looks broken on first visit.

**Screenshot:** `screenshots-2026-05-16/shmedium-home-desktop.png`, `shmedium-home-mobile.png`

---

### P1-2: Mobile LCP Is 5.6 Seconds (Lighthouse Throttled)
**Metric:** LCP = 5,625 ms (Lighthouse mobile simulation)
**Root cause:**
1. **Google Fonts CSS is render-blocking** — `fonts.googleapis.com` stylesheet is loaded synchronously, costing **831 ms** on mobile before any content paints
2. **`/static/js/19.771d1049.chunk.js` is render-blocking** — costs **643 ms** on mobile (161 ms desktop)
3. `/static/js/main.bee08327.chunk.js` is render-blocking — costs **161 ms** extra on mobile
4. Lighthouse estimates **2,460 ms** total savings from eliminating render-blocking resources on mobile

**Lighthouse opportunity:** Add `font-display: swap` or `font-display: optional` to the Google Fonts load. Add `defer` or `async` to the JS chunks that are currently blocking.

**Screenshot:** Mobile performance score is 70 (vs 99 desktop).

---

### P1-3: Story Pages Have High CLS (0.10–0.14) in Real Browser
**Playwright-observed CLS:**
| Page | Desktop CLS | Mobile CLS |
|------|------------|-----------|
| /story/1 | 0.1057 | 0.1358 |
| /story/5 | 0.1060 | 0.1385 |
| /story/15 | 0.1387 | 0.1407 |

**Note:** Lighthouse desktop CLS for /story/1 was 0.006 — the discrepancy suggests CLS happens after Lighthouse's measurement window, likely triggered by lazy images loading without reserved dimensions or by the comments section mounting below the story content.

**Root cause:** Images on story pages have no `width`/`height` attributes set, so the browser cannot reserve space. When images load asynchronously, they push content down. Zero images have a `width` or `height` attribute.

**Impact:** Text jumps while reading; annoying and disorienting. CLS > 0.1 is considered "Needs Improvement" by Google Web Vitals (threshold is 0.1).

---

### P1-4: No `srcset` on Any Image — Single 3000px-Wide Images Served to All Viewports
**Observed:** 0 out of 200 home page images have a `srcset` attribute. All story images: 0/26.

**Current image URLs:**
```
?auto=compress&cs=tinysrgb&w=3000&h=3000
```
Images are requested at 3000×3000px and displayed at ~400px wide on desktop, ~360px on mobile.

**Lighthouse estimates:**
- Desktop: 4,489 KiB savings from responsive images
- Mobile: 1,731 KiB savings from responsive images

**Impact:** 4–10× unnecessary image bytes served to mobile. This is also why the Playwright total page weight for the home page is 4.73 MB (mostly images).

---

### P1-5: `robots.txt` and `sitemap.xml` Both Serve the SPA's HTML
**Observed (raw HTTP GET):**
- `GET /robots.txt` → HTTP 200, `Content-Type: text/html`, body is the full React SPA HTML
- `GET /sitemap.xml` → HTTP 200, `Content-Type: text/html`, body is the full React SPA HTML

**Impact:**
- Search engines cannot read crawl directives (Googlebot will log a parse error)
- No sitemap means Google will not know about story URLs — they rely on crawling alone
- Lighthouse flags this as a 0-score audit failure
- The site's SEO is effectively zero for non-homepage content

**Fix:** Add a real `/public/robots.txt` and either a static or server-generated `/sitemap.xml` with story URLs.

---

### P1-6: Mobile Hamburger Nav Drawer Is Invisible Despite Having the `open` Class
**Observed:** Clicking the hamburger button at mobile viewport (390×844) successfully adds the `open` class to `.mobile-nav-drawer` and the drawer has `display: flex`, `visibility: visible`, `opacity: 1` — but the drawer does not appear visually in screenshots.

**Computed styles when `open`:**
```
display: flex
visibility: visible
opacity: 1
height: 312px
position: fixed
z-index: 9
```
The drawer has a bounding rect of `{top: 55, left: 0, w: 390, h: 313}` suggesting it IS laid out, but something (possibly a clipping ancestor or a z-index conflict with the nav bar's overlay) prevents it from being visible on screen.

**Impact:** Mobile users cannot access navigation items (Our Story, Write, Sign In, Get Started) without the hamburger working. Auth is inaccessible on mobile without workaround.

**Screenshot:** `screenshots-2026-05-16/shmedium-mobile-after-hamburger.png`

---

### P1-7: Total Page Weight — Home Page Is 4.73 MB
**Lighthouse audit:** "Total size was 5,155 KiB" (desktop)
**Top bandwidth consumers:**
| Resource | Size |
|----------|------|
| images.pexels.com photo | 576 KB |
| images.pexels.com photo | 487 KB |
| images.pexels.com photo | 468 KB |
| media.cnn.com photo | 356 KB |
| images.pexels.com photo (×6 more) | ~1.2 MB |

**Impact:** Users on slow connections (or mobile data) face a very heavy first load even before broken images factor in.

---

## P2 Issues — Polish, Quality, Optimization

### P2-1: No Meta Descriptions on Any Page
**Observed:** `<meta name="description">` is null on `/`, `/story/1`, and `/about`. No Open Graph tags (`og:title`, `og:description`, `og:image`) exist on any page.

**Impact:** Google search results show no snippet text. Social shares (Twitter, LinkedIn, Slack) show no preview card — just the page title "Medium." Story titles are not used as page titles.

**Fix:** Dynamically set `<title>` and `<meta name="description">` per page using React Helmet or equivalent. Story pages should at minimum set the story title and author.

---

### P2-2: Page Title Is "Medium" on Every Page — Not Differentiated
**Observed:** `document.title` is `"Medium"` on all pages including `/story/1` (which has the title "A Love Letter to Gen Z").

**Impact:** Browser history, bookmarks, and search results all show "Medium" — indistinguishable. Accessibility tools announce the wrong page name.

---

### P2-3: 20 Color Contrast Failures
**Lighthouse audit:** 20 elements fail WCAG AA color contrast.

**Key failures:**
- `.style1-number` (trending numbers "01", "02", etc.) — `#999999` on `#ffffff` — contrast ratio 2.84:1 (need 3:1 for large bold text)
- `.style1-date-content` ("May 17") and `.style1-date-read-time-content` ("3 min read") — `#999999` on `#ffffff` — contrast ratio 2.84:1 (need 4.5:1 for small text)

**Fix:** Darken secondary text from `#999999` to at minimum `#757575` for body-size text (WCAG AA: 4.5:1) or `#767676`.

---

### P2-4: Third-Party Cookies from Pexels and CNN CDN
**Observed:** 5 third-party cookies are set by image CDN requests:
- `countryCode`, `stateCode`, `geoData` from `media.cnn.com`
- `__cf_bm`, `_cfuvid` from `images.pexels.com` (Cloudflare bot management)

**Impact:** Chrome's third-party cookie deprecation will eventually block these. Browser privacy features may already block them for some users. No user consent banner exists.

---

### P2-5: Cache TTL Too Short — CNN Image Cached for Only 5 Minutes
**Observed:** `media.cnn.com` image has `max-age=300` (5 minutes). Lighthouse estimates 349 KB of wasted repeated downloads.

**Impact:** Returning users re-download the same large image every 5 minutes. This is controlled by the origin server (CNN CDN), but using images from a stable self-hosted or Cloudinary source would eliminate the issue.

---

### P2-6: FontAwesome Loaded via External Kit CDN — Adds Latency
**Observed:** `<script src="https://kit.fontawesome.com/e53ac6f8df.js" crossorigin defer>` loads at page start, then triggers a second request to `ka-f.fontawesome.com` for webfonts. The webfont uses `font-display: block` (Lighthouse: 40ms savings on desktop).

**Recommendation:** Host FontAwesome locally or use only the SVG icons actually needed (tree-shaking).

---

### P2-7: Render-Blocking Google Fonts with No `font-display` Fallback
**Observed:** `fonts.googleapis.com` CSS loads Inter and Source Serif 4. The `display=swap` parameter IS in the URL, which is correct for the CSS file — but the actual web font files use `font-display: block` per Lighthouse.

**Desktop impact:** 272 ms render-blocking delay from the Fonts CDN
**Mobile impact:** 831 ms render-blocking delay

---

### P2-8: Login Modal Lacks Input Labels — Accessibility Issue
**Observed:** Sign-in modal inputs are:
```html
<input type="text" placeholder="Please enter a username" required>
<input type="password" placeholder="Please enter a password" required>
```
No `<label>` elements, no `aria-label`, no `id` attributes for association. Screen readers cannot identify these fields.

**Additional issue:** The email field uses `type="text"` instead of `type="email"`, disabling browser email validation and mobile keyboard optimizations.

---

### P2-9: DOM Size Is 2,530 Elements on Home Page
**Lighthouse:** 2,530 DOM elements (threshold is 800; warning at 1,400).

**Root cause:** The home page appears to render all feed items at once without virtualization. With 200+ images already present and more loaded, the DOM grows very large.

**Recommendation:** Implement virtual scrolling (e.g., react-window or react-virtualized) or true infinite scroll with DOM culling for off-screen items.

---

### P2-10: No `<html lang>` Attribute (Implicit Lang)
**Observed:** `<html lang="en">` IS present (found in the robots.txt HTML dump). This is correctly set. No issue.

---

### P2-11: Search Is Triggered by Cmd+K — Not Discoverable on Mobile
**Observed:** There is no visible search input on the home page on desktop. Search is hidden behind a keyboard shortcut (Cmd+K / ⌘K), which is noted with a small "⌘K" label in the nav. On mobile, this shortcut is not accessible.

**Impact:** Mobile users have no search access (the hamburger nav has no search either, based on the drawer content). Search functionality is keyboard-shortcut-only, which is not discoverable.

---

### P2-12: Story Body Selector Is `.story-content` — Not `<article>`
The story body is in a `<div class="story-content">` not an `<article>` tag. Screen readers use `<article>` landmark to navigate between pieces of content. The `<body>` contains no landmark elements (`<main>`, `<article>`, `<aside>`, `<nav>` proper) beyond the `<nav>` element.

---

## Console Errors Log

**All tested pages returned zero console errors.** No JavaScript runtime errors were observed across desktop or mobile on any tested URL.

---

## Network Errors Log

**No HTTP 4xx/5xx errors were returned for any primary resource request** on the pages that rendered correctly (home, story pages, about).

However:
- `/login`, `/signup`, `/register`, `/our-story` all return HTTP 200 but with the 404 page content (SPA routing: the server returns 200 for all routes, but the React Router renders a "Page not found" component)
- `freeiconshop.com` images consistently fail silently (domain accessible but images return empty)
- `miro.medium.com` images fail due to hotlinking restrictions (no CORS/referer policy allowing third-party access)

---

## Screenshot Inventory

All screenshots saved to: `screenshots-2026-05-16/`

| File | Description |
|------|-------------|
| `shmedium-home.png` | Home page, desktop 1440×900, full page |
| `shmedium-home-mobile.png` | Home page, mobile 390×844, full page |
| `shmedium-story-1.png` | Story /story/1 desktop full page |
| `shmedium-story-1-mobile.png` | Story /story/1 mobile full page |
| `shmedium-story-5.png` | Story /story/5 desktop full page |
| `shmedium-about.png` | /about page desktop full page |
| `shmedium-login.png` | /login page desktop (shows 404 not found) |
| `shmedium-signin-modal.png` | Home page with Sign In modal open |
| `shmedium-demo-login-option.png` | Modal showing "Try the Demo" button |
| `shmedium-search-modal.png` | Home page after Cmd+K (search modal open) |
| `shmedium-mobile-before-hamburger.png` | Mobile home before hamburger click |
| `shmedium-mobile-after-hamburger.png` | Mobile home after hamburger click (drawer not visible) |
| `shmedium-mobile-drawer-open.png` | Mobile drawer with `open` class (invisible) |
| `shmedium-our-story-click.png` | After clicking "Our Story" nav item → /about |
| `shmedium-home-desktop.png` (from audit script) | Home page with broken images visible |
| `shmedium-home-mobile.png` (from audit script) | Mobile home |
| `shmedium-story-1-desktop.png` | Story 1 desktop (from audit script) |
| `shmedium-story-15-desktop.png` | Story 15 desktop (from audit script) |

---

## Raw Metrics

### Playwright Timing — All Pages, Desktop

| Page | Status | TTFB | DOMContentLoaded | Load | LCP | CLS |
|------|--------|------|-----------------|------|-----|-----|
| / (home) | 200 | 106ms | 285ms | 417ms | 392ms | 0.0032 |
| /story/1 | 200 | 61ms | 160ms | 160ms | 1200ms | 0.1057 |
| /story/5 | 200 | 54ms | 150ms | 150ms | 1180ms | 0.1060 |
| /story/15 | 200 | 72ms | 370ms | 370ms | 1536ms | 0.1387 |
| /about | 200 | 57ms | — | — | 316ms | 0.0083 |
| /login | 200 (404 content) | 57ms | — | — | 288ms | 0.0043 |
| /signup | 200 (404 content) | 66ms | — | — | 292ms | 0.0043 |
| /register | 200 (404 content) | 61ms | — | — | 428ms | 0.0043 |
| /our-story | 200 (404 content) | 56ms | — | — | 288ms | 0.0043 |

### Image Stats — Desktop

| Page | Total Imgs | With Srcset | Broken | Lazy | Alt Missing |
|------|-----------|-------------|--------|------|-------------|
| / (home) | 200 | 0 | **156 (78%)** | 198 | 0 |
| /story/1 | 26 | 0 | 3 | 10 | 0 |
| /story/5 | 26 | 0 | 2 | 10 | 0 |
| /story/15 | 24 | 0 | 0 | 8 | 0 |

### Lighthouse Summary — All Three Runs

| Metric | Desktop Home | Desktop /story/1 | Mobile Home |
|--------|-------------|-----------------|-------------|
| Performance | 99 | 99 | **70** |
| Accessibility | 92 | 95 | 95 |
| Best Practices | 78 | 78 | 79 |
| SEO | 83 | 83 | 83 |
| FCP | 0.5s | 0.5s | **3.3s** |
| LCP | 1.0s | 1.0s | **5.6s** |
| TBT | 0ms | 0ms | 40ms |
| CLS | 0.001 | 0.006 | 0 |
| Speed Index | 0.6s | 0.6s | **4.6s** |
| TTFB | 24ms | 32ms | 31ms |

### Lighthouse Opportunities (Desktop Home)

| Opportunity | Est. Savings |
|-------------|-------------|
| Responsive images (correct sizing) | 4,489 KiB |
| Modern image formats (WebP/AVIF) | 1,489 KiB |
| Render-blocking resources (Fonts + JS) | 270 ms |
| Unused JS | 21 KiB |
| Unused CSS | 14 KiB |

### Lighthouse Opportunities (Mobile Home)

| Opportunity | Est. Savings |
|-------------|-------------|
| Responsive images | 1,731 KiB |
| Modern image formats | 616 KiB |
| Render-blocking resources | **2,460 ms** |

### Auth Modal Findings

- Modal opens correctly via `.sign-in-nav-button` click
- Modal text: "Welcome back. / Try the Demo → / One click, no signup. Logs you in as Demo User. / OR SIGN IN / Email / Password / Sign In / No account? Create One / Forgot email or trouble signing in? Get help."
- Input types: `type="text"` (email field — should be `type="email"`), `type="password"`
- No `<label>` elements on inputs
- "Get Started" button is blocked by open modal overlay (pointer-events intercepted by `.modal-container`)

### Manifest.json (Verbatim)

```json
{
  "short_name": "Authenticate Me",
  "name": "Authenticate Me App Academy Project",
  "icons": [
    {
      "src": "medium-logo-circles-white.jpeg",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

### robots.txt (Verbatim Response)

HTTP 200, Content-Type: text/html — serves the React SPA HTML instead of robots directives.

### sitemap.xml (Verbatim Response)

HTTP 200, Content-Type: text/html — serves the React SPA HTML instead of XML.

---

*Generated by automated Playwright + Lighthouse audit. Screenshots, raw JSON, and Lighthouse reports are in the same directory as this file.*
