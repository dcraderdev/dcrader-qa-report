# Load Time Benchmark — 2026-05-16

**Method:** curl (3-run median) + Lighthouse 12.8.2 mobile simulation  
**Lighthouse version:** 12.8.2  
**Chrome:** /Applications/Google Chrome.app (headless)  
**Run date:** 2026-05-16 / 2026-05-17  

---

## Methodology Notes

- **curl:** 3 runs per URL, median TTFB and total time recorded. Size is compressed HTML bytes from curl (not full page weight including sub-resources).
- **Lighthouse:** `--throttling-method=simulate --emulated-form-factor=mobile --only-categories=performance`. Perf score is 0–1 (multiply by 100 for percentage).
- **Lighthouse Bytes** = full page weight including all sub-resources (JS, CSS, images, fonts) as measured by Lighthouse network audit — this is the meaningful weight figure.
- **curl Size** = compressed HTML document only (not full page).

### Known Lighthouse Failures / Caveats

| URL | Status | Reason |
|-----|--------|--------|
| `www.dcrader.dev/restaurants` | NO_FCP | Body CSS has `animation: body-fadein` starting at `opacity:0` — headless Chrome detects no first paint. Homepage (`/`) is unaffected. All 5 sub-pages share `_industry_.css`. |
| `www.dcrader.dev/trades` | NO_FCP | Same cause as above |
| `www.dcrader.dev/realestate` | NO_FCP | Same cause as above |
| `www.dcrader.dev/photographers` | NO_FCP | Same cause as above |
| `www.dcrader.dev/pets` | NO_FCP | Same cause as above |
| `socialstakes-api.fly.dev/` | ERRORED_DOCUMENT_REQUEST | Server returns HTTP 404 — it's an API backend, not a frontend. Missing `/frontend/build/index.html`. |
| `dcrader-template-restaurants.vercel.app` | Partial | FCP + Speed Index recorded; LCP/TBT null (mid-audit error). Perf score null. |

---

## Summary Table (sorted by Perf score ascending — worst first)

| # | URL | Platform | Perf Score | FCP | LCP | TBT | TTFB (s) | Total (s) | LH Bytes (KB) |
|---|-----|----------|-----------|-----|-----|-----|----------|-----------|--------------|
| 1 | thedoglodgesd.com | Fly.io/custom | **0.52** | 1.9 s | 39.9 s | 990 ms | 0.246 | 0.247 | 23,363 |
| 2 | shmedium-api.fly.dev | Fly.io React SPA | **0.66** | 3.8 s | 7.2 s | 0 ms | 0.058 | 0.061 | 2,368 |
| 3 | dcrader-re-v1-coastal.vercel.app | Vercel/Astro | **0.67** | 3.5 s | 7.6 s | 0 ms | 0.091 | 0.101 | 1,456 |
| 4 | dcrader-re-v4-luxury.vercel.app | Vercel/Astro | **0.79** | 2.8 s | 4.3 s | 0 ms | 0.085 | 0.096 | 686 |
| 5 | dcrader-template-realestate.vercel.app | Vercel/Astro | **0.80** | 3.0 s | 4.0 s | 0 ms | 0.091 | 0.092 | 420 |
| 6 | dcrader-re-v5-fresh.vercel.app | Vercel/Astro | **0.80** | 2.7 s | 4.2 s | 0 ms | 0.108 | 0.117 | 724 |
| 7 | dcrader-template-trades.vercel.app | Vercel/Astro | **0.82** | 3.5 s | 3.5 s | 0 ms | 0.125 | 0.127 | 227 |
| 8 | dcrader-re-v2-urban.vercel.app | Vercel/Astro | **0.84** | 2.9 s | 3.5 s | 0 ms | 0.087 | 0.088 | 597 |
| 9 | dcrader-template-dentists.vercel.app | Vercel/Astro | **0.86** | 2.7 s | 3.3 s | 0 ms | 0.109 | 0.110 | 233 |
| 10 | dcrader-re-v3-classic.vercel.app | Vercel/Astro | **0.87** | 2.8 s | 3.3 s | 0 ms | 0.085 | 0.085 | 551 |
| 11 | dcrader-template-pets.vercel.app | Vercel/Astro | **0.89** | 2.8 s | 2.9 s | 0 ms | 0.224 | 0.225 | 198 |
| 12 | dcrader-template-chiropractors.vercel.app | Vercel/Astro | **0.89** | 2.8 s | 2.8 s | 0 ms | 0.093 | 0.093 | 93 |
| 13 | dcraderdev.github.io/dcrader-template-auto/ | GitHub Pages | **0.90** | 2.8 s | 3.0 s | 0 ms | 0.044 | 0.044 | 312 |
| 14 | dcrader-template-landscape.vercel.app | Vercel/Astro | **0.91** | 2.6 s | 2.6 s | 0 ms | 0.099 | 0.100 | 78 |
| 15 | dcrader-template-salons.vercel.app | Vercel/Astro | **0.90** | 2.9 s | 2.9 s | 0 ms | 0.091 | 0.093 | 91 |
| 16 | dcrader-template-photographers.vercel.app | Vercel/Astro | **0.96** | 1.4 s | 2.7 s | 0 ms | 0.102 | 0.108 | 823 |
| 17 | www.dcrader.dev | Vercel/Astro | **0.96** | 1.9 s | 2.1 s | 0 ms | 0.094 | 0.120 | 132 |
| 18 | dcraderdev.github.io/dcrader-template-tattoo/ | GitHub Pages | **0.98** | 1.6 s | 1.6 s | 0 ms | 0.048 | 0.050 | 12 |
| 19 | dcrader-template-trainers.vercel.app | Vercel/Astro | **1.00** | 0.8 s | 0.8 s | 0 ms | 0.087 | 0.092 | 181 |
| 20 | dcrader-template-restaurants.vercel.app | Vercel/Astro | **N/A*** | 3.0 s | N/A | N/A | 0.109 | 0.109 | 612 |
| — | www.dcrader.dev/restaurants | Vercel/Astro | **NO_FCP** | — | — | — | 0.093 | 0.103 | — |
| — | www.dcrader.dev/trades | Vercel/Astro | **NO_FCP** | — | — | — | 0.091 | 0.100 | — |
| — | www.dcrader.dev/realestate | Vercel/Astro | **NO_FCP** | — | — | — | 0.096 | 0.100 | — |
| — | www.dcrader.dev/photographers | Vercel/Astro | **NO_FCP** | — | — | — | 0.094 | 0.102 | — |
| — | www.dcrader.dev/pets | Vercel/Astro | **NO_FCP** | — | — | — | 0.084 | 0.091 | — |
| — | socialstakes-api.fly.dev/ | Fly.io Express | **LH Error** | — | — | — | 0.089 | 0.091 | — |

*\* dcrader-template-restaurants: partial Lighthouse result — FCP scored 0.5 (3.0 s), LCP and TBT null. Overall perf score null due to incomplete metrics. Estimated score ~70–75 based on available signals.*

---

## Top 5 Worst Offenders

### 1. thedoglodgesd.com — Score: 52

**What was measured:**
- Performance: 0.52 (52/100)
- FCP: 1.9 s (good) — LCP: **39.9 s** (critical failure) — TBT: **990 ms** (needs improvement)
- Total page weight: **23.4 MB** (Lighthouse) — TTFB: 246 ms

**Blockers:**
- LCP of 39.9 s is catastrophically slow — the largest element on the page (likely a hero image or above-the-fold section) is loading nearly 40 seconds into the session on a simulated mobile connection
- TBT of 990 ms means the main thread is blocked for nearly a full second, causing input latency; this suggests large synchronous JavaScript bundles executing on load
- Total page weight of 23.4 MB is extreme — approximately 16–18 MB over budget for mobile; this alone explains the LCP
- The TTFB of 246 ms is the slowest among all tested URLs and indicates no CDN caching on the server response itself

**Quick wins:**
1. Audit and compress all images — convert hero/gallery images to WebP or AVIF with proper `width`/`height` attributes and `loading="lazy"` on below-fold images; the LCP image specifically needs `fetchpriority="high"` and must be server-side rendered, not JS-injected
2. Add `preconnect` and preload hints for the LCP image in the `<head>` so the browser starts fetching it before JS executes
3. Split and defer non-critical JavaScript — identify what is causing the 990 ms TBT (likely a large bundle) and code-split it; defer analytics, chat widgets, and any third-party scripts
4. Enable Fly.io response caching or add a CDN (Cloudflare free tier) in front of the Fly.io origin to reduce TTFB; 246 ms server response is hitting the origin on every request
5. Audit third-party embeds (booking widgets, maps, social feeds) — each one adds network round-trips and JS blocking time on mobile

---

### 2. shmedium-api.fly.dev — Score: 66

**What was measured:**
- Performance: 0.66 (66/100)
- FCP: 3.8 s — LCP: **7.2 s** — TBT: 0 ms
- Total page weight: **2.4 MB** (Lighthouse) — TTFB: 58 ms (excellent)

**Blockers:**
- This is a React SPA (Create React App from the HTML structure) — all rendering is client-side, so FCP and LCP are gated behind JavaScript parsing and execution
- The 2.4 MB page weight is almost entirely JavaScript bundles — the main chunk and split chunks must all download, parse, and execute before any content appears
- LCP of 7.2 s means the hero or main content area doesn't render for over 7 seconds on a mobile connection — a user will likely bounce
- The app serves the frontend from the same Fly.io machine as the API (Express serves `/frontend/build/`) — static assets should be served from a CDN, not an app server

**Quick wins:**
1. Move the frontend off the API server — deploy the React build to Vercel or Netlify (free tier) so static assets are served from a CDN edge near the user; TTFB is already 58 ms so the server is fast, but assets need CDN distribution
2. Migrate from Create React App to Vite + React — CRA's production builds are significantly larger and less optimized than Vite; this alone typically reduces bundle size 20–40%
3. Implement route-based code splitting with `React.lazy()` and `Suspense` — the page loads the code for every route (about, author-profile, create, drafts, feed, etc.) upfront; split these so only the home route code loads initially
4. Preload the Google Fonts stylesheet using `<link rel="preload">` and add `font-display: swap` to prevent render blocking
5. Add a skeleton or placeholder HTML in `index.html` so something appears before JS executes — reduces perceived wait time even if actual LCP doesn't change

---

### 3. dcrader-re-v1-coastal.vercel.app — Score: 67

**What was measured:**
- Performance: 0.67 (67/100)
- FCP: 3.5 s — LCP: **7.6 s** — TBT: 0 ms
- Total page weight: **1.46 MB** (Lighthouse) — TTFB: 91 ms

**Blockers:**
- LCP of 7.6 s is the worst among all Vercel/Astro sites — significantly worse than the other 4 real estate variants (V2: 3.5 s, V3: 3.3 s, V4: 4.3 s, V5: 4.2 s)
- Page weight of 1.46 MB is the largest of the 5 real estate variants — V2-Urban is 597 KB, V3-Classic is 551 KB; V1-Coastal has ~2.4x more weight than comparable variants
- The Cormorant Garamond font (V1's signature font) adds a heavy Google Fonts dependency — this variant uses the most ornate typography of the 5
- Likely cause: a large unoptimized hero image or background specific to the coastal/cream aesthetic

**Quick wins:**
1. Audit the hero image for V1 — find the LCP element (likely a large Unsplash background image), compress it to WebP, and add `fetchpriority="high"` to its `<img>` tag or as a `<link rel="preload">` in `<head>`
2. Compare V1's image list against V2 and V3 — identify which assets are unique to V1 and account for the extra ~800 KB weight gap; resize or compress those specifically
3. Self-host the Cormorant Garamond font and use `font-display: optional` for decorative headings — this eliminates the Google Fonts round-trip on the critical path
4. Add `loading="lazy"` to all below-fold images — with 1.46 MB of assets, deferring off-screen images will dramatically reduce initial load weight
5. Consider using an Astro `<Image>` component with `widths` for responsive images if not already in use — Astro 4's built-in image optimization can auto-generate WebP/AVIF variants

---

### 4. dcrader-re-v4-luxury.vercel.app — Score: 79

**What was measured:**
- Performance: 0.79 (79/100)
- FCP: 2.8 s — LCP: **4.3 s** — TBT: 0 ms
- Total page weight: **686 KB** (Lighthouse) — TTFB: 85 ms

**Blockers:**
- LCP of 4.3 s — the Playfair Display font and luxury hero image (likely gold/emerald palette) are on the critical render path
- 686 KB is reasonable but ~100 KB heavier than V3-Classic (551 KB) — likely one or two larger hero images for the luxury aesthetic
- FCP is 2.8 s — suggests render-blocking Google Fonts (Playfair Display) or a large above-fold CSS block

**Quick wins:**
1. Add `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` and preload the specific Playfair Display woff2 font file directly (bypass Google Fonts API latency for the critical font weight)
2. Identify the LCP element in Chrome DevTools and add `fetchpriority="high"` to that image; the luxury hero is likely a full-bleed high-res image
3. Set `font-display: swap` on Playfair Display so text renders immediately in the fallback font while the decorative font loads
4. Audit whether the gold/emerald hero gradient uses a raster image or pure CSS — if it's a background image, convert to a CSS gradient to eliminate that network request
5. Apply `loading="lazy"` to property listing images below the fold

---

### 5. dcrader-template-realestate.vercel.app — Score: 80 (tied with dcrader-re-v5-fresh)

**What was measured:**
- Performance: 0.80 (80/100)
- FCP: 3.0 s — LCP: **4.0 s** — TBT: 0 ms
- Total page weight: **420 KB** (Lighthouse) — TTFB: 91 ms

**Blockers:**
- This is the gallery/index page for all 5 real estate variants — it loads preview thumbnails and cards for all 5 variants, making it heavier than an individual variant page
- FCP of 3.0 s suggests render-blocking font loading (multiple Google Fonts families loaded for the showcase grid)
- LCP of 4.0 s indicates a large preview card image or hero section is the bottleneck

**Quick wins:**
1. Lazy-load the variant preview images below the fold on the showcase index — only the first 1–2 visible cards need `loading="eager"`; the rest should be `loading="lazy"`
2. Add a `<link rel="preconnect" href="https://fonts.googleapis.com">` and limit the number of font families loaded on the index page — 5 variants × multiple font families is a large font dependency graph
3. Use Astro's `<Image>` component for variant preview thumbnails to auto-generate correctly-sized WebP images
4. Consider adding `rel="prefetch"` links to the 5 variant URLs from the index page — users landing on the gallery will likely click into a variant, and prefetching reduces perceived navigation time
5. Add explicit `width` and `height` to all preview card images to prevent layout shift during load

---

## Full Results Detail

### Portfolio — www.dcrader.dev

| Page | Perf | FCP | LCP | TBT | TTFB | Total | HTML (KB) |
|------|------|-----|-----|-----|------|-------|-----------|
| / (homepage) | 0.96 | 1.9 s | 2.1 s | 0 ms | 0.094 s | 0.120 s | 175.5 |
| /restaurants | NO_FCP* | — | — | — | 0.093 s | 0.103 s | 50.1 |
| /trades | NO_FCP* | — | — | — | 0.091 s | 0.100 s | 49.6 |
| /realestate | NO_FCP* | — | — | — | 0.096 s | 0.100 s | 49.4 |
| /photographers | NO_FCP* | — | — | — | 0.094 s | 0.102 s | 50.0 |
| /pets | NO_FCP* | — | — | — | 0.084 s | 0.091 s | 49.8 |

*\* The `_industry_` CSS shared by all sub-pages contains `animation: body-fadein 0.45s ease-out both` with keyframe `0% { opacity: 0 }`. Lighthouse headless Chrome cannot detect a first contentful paint when the body starts at opacity:0. The pages load and serve correctly in a real browser. See Notes section.*

---

### Active Apps

| App | Perf | FCP | LCP | TBT | TTFB | Total | LH Bytes (KB) |
|-----|------|-----|-----|-----|------|-------|--------------|
| thedoglodgesd.com | 0.52 | 1.9 s | 39.9 s | 990 ms | 0.246 s | 0.247 s | 23,363 |
| shmedium-api.fly.dev | 0.66 | 3.8 s | 7.2 s | 0 ms | 0.058 s | 0.061 s | 2,368 |
| socialstakes-api.fly.dev | LH Error* | — | — | — | 0.089 s | 0.091 s | — |

*\* socialstakes-api.fly.dev returns HTTP 404 to Lighthouse — Express cannot find `/frontend/build/index.html`. The API server is live and responding (JSON 404 body received in 64 ms); the frontend is not deployed to this origin.*

---

### Template Hubs (Vercel index pages)

| Template | Perf | FCP | LCP | TBT | TTFB | Total | LH Bytes (KB) |
|----------|------|-----|-----|-----|------|-------|--------------|
| dcrader-template-restaurants.vercel.app | N/A* | 3.0 s | — | — | 0.109 s | 0.109 s | 612 |
| dcrader-template-trades.vercel.app | 0.82 | 3.5 s | 3.5 s | 0 ms | 0.125 s | 0.127 s | 227 |
| dcrader-template-realestate.vercel.app | 0.80 | 3.0 s | 4.0 s | 0 ms | 0.091 s | 0.092 s | 420 |
| dcrader-template-photographers.vercel.app | 0.96 | 1.4 s | 2.7 s | 0 ms | 0.102 s | 0.108 s | 823 |
| dcrader-template-pets.vercel.app | 0.89 | 2.8 s | 2.9 s | 0 ms | 0.224 s | 0.225 s | 198 |
| dcrader-template-dentists.vercel.app | 0.86 | 2.7 s | 3.3 s | 0 ms | 0.109 s | 0.110 s | 233 |
| dcrader-template-chiropractors.vercel.app | 0.89 | 2.8 s | 2.8 s | 0 ms | 0.093 s | 0.093 s | 93 |
| dcrader-template-trainers.vercel.app | 1.00 | 0.8 s | 0.8 s | 0 ms | 0.087 s | 0.092 s | 181 |
| dcrader-template-salons.vercel.app | 0.90 | 2.9 s | 2.9 s | 0 ms | 0.091 s | 0.093 s | 91 |
| dcrader-template-landscape.vercel.app | 0.91 | 2.6 s | 2.6 s | 0 ms | 0.099 s | 0.100 s | 78 |

*\* Partial Lighthouse result — see methodology notes.*

---

### GitHub Pages

| Site | Perf | FCP | LCP | TBT | TTFB | Total | LH Bytes (KB) |
|------|------|-----|-----|-----|------|-------|--------------|
| dcraderdev.github.io/dcrader-template-auto/ | 0.90 | 2.8 s | 3.0 s | 0 ms | 0.044 s | 0.044 s | 312 |
| dcraderdev.github.io/dcrader-template-tattoo/ | 0.98 | 1.6 s | 1.6 s | 0 ms | 0.048 s | 0.050 s | 12 |

---

### Real Estate Variants (individual Vercel projects)

| Variant | Perf | FCP | LCP | TBT | TTFB | Total | LH Bytes (KB) |
|---------|------|-----|-----|-----|------|-------|--------------|
| dcrader-re-v1-coastal (Sarah Mitchell) | 0.67 | 3.5 s | 7.6 s | 0 ms | 0.091 s | 0.101 s | 1,456 |
| dcrader-re-v2-urban (Marcus Chen) | 0.84 | 2.9 s | 3.5 s | 0 ms | 0.087 s | 0.088 s | 597 |
| dcrader-re-v3-classic (Petersen Group) | 0.87 | 2.8 s | 3.3 s | 0 ms | 0.085 s | 0.085 s | 551 |
| dcrader-re-v4-luxury (Vivienne Laurent) | 0.79 | 2.8 s | 4.3 s | 0 ms | 0.085 s | 0.096 s | 686 |
| dcrader-re-v5-fresh (Jordan Reyes) | 0.80 | 2.7 s | 4.2 s | 0 ms | 0.108 s | 0.117 s | 724 |

---

## Notable Highlights

**Top performers (score ≥ 0.95):**
- `dcrader-template-trainers.vercel.app` — **perfect 1.00** score, 0.8 s FCP/LCP, 181 KB total
- `dcraderdev.github.io/dcrader-template-tattoo/` — **0.98**, 1.6 s FCP/LCP, only 12 KB total (lightest page in the entire set)
- `dcrader-template-photographers.vercel.app` — **0.96**, 1.4 s FCP despite 823 KB total weight (well-optimized images)
- `www.dcrader.dev` (homepage) — **0.96**, 1.9 s FCP/2.1 s LCP

**Fastest TTFB:**
- GitHub Pages sites (~44–48 ms) — GitHub's CDN edge is extremely fast for static content
- shmedium-api.fly.dev (58 ms) — Fly.io machine response is very fast even though frontend LCP is poor

**Slowest TTFB:**
- thedoglodgesd.com (246 ms) — likely no CDN layer
- dcrader-template-pets.vercel.app (224 ms on second run, 88 ms on third) — occasional cold-start latency on Vercel

**Real estate variant spread:**
- V1-Coastal is a significant outlier (0.67, 1.46 MB) vs the other 4 variants (0.79–0.87, 551–724 KB). V1 has a specific image optimization issue.

---

## Notes

1. **dcrader.dev sub-pages (5 routes) — Lighthouse NO_FCP:** The `_industry_.CcYTMous.css` file contains `body { animation: body-fadein 0.45s ease-out both }` with `@keyframes body-fadein { 0% { opacity: 0 } }`. Lighthouse headless Chrome (no animation frame budget) interprets the initial opacity:0 state as "no paint" and aborts with NO_FCP. This does not affect real users — the animation fires normally in a real browser. To fix for Lighthouse scoring, wrap the animation in `@media (prefers-reduced-motion: no-preference)` so headless (which has no preference) skips it. The homepage (`/`) apparently does not use this shared CSS and scores 0.96.

2. **socialstakes-api.fly.dev — 404:** The Express server is running and responding (64 ms TTFB) but serves a JSON 404 error instead of the React frontend. The `frontend/build/` directory is not present on the Fly machine. This is a deployment gap — the frontend needs to be built and bundled into the Docker image, or better, deployed separately to Vercel/Netlify.

3. **dcrader-template-restaurants — partial LH result:** Lighthouse completed FCP (3.0 s, score 0.5) and Speed Index (4.7 s, score 0.68) but failed to measure LCP and TBT, resulting in a null overall score. This suggests the LCP element (likely a hero image) triggered an error or very long network wait that caused the audit to time out mid-run. The 612 KB page weight and slow FCP suggest unoptimized images.

4. **Per-variant guessed URLs (realestate):** The 5 real estate variant URLs (`dcrader-re-v{n}-{name}.vercel.app`) were found in memory files and all confirmed HTTP 200. The guessed URL patterns in the task brief (`dcrader-template-realestate-{variant}.vercel.app`) were not checked since the real URLs differ.

5. **Trades variants:** The memory file mentions 5 variants for trades (V1–V5) but no explicit separate Vercel URLs for individual variants — only the gallery index (`dcrader-template-trades.vercel.app`) was benchmarked. The memory does not provide `dcrader-trades-v{n}-*.vercel.app` style URLs.

6. **Lighthouse TBT = 0 ms across almost all Vercel/Astro sites:** This is expected — Astro generates static HTML with minimal client-side JavaScript, so the main thread is rarely blocked.
