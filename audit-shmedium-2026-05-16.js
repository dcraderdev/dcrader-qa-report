/**
 * Shmedium QA Audit — 2026-05-16
 * Full Playwright audit of https://shmedium-api.fly.dev/
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://shmedium-api.fly.dev';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots-2026-05-16');
const RESULTS_FILE = path.join(__dirname, 'audit-shmedium-raw-2026-05-16.json');

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const URLS_TO_TEST = [
  { url: `${BASE_URL}/`, name: 'home' },
  { url: `${BASE_URL}/story/1`, name: 'story-1' },
  { url: `${BASE_URL}/story/5`, name: 'story-5' },
  { url: `${BASE_URL}/story/15`, name: 'story-15' },
  { url: `${BASE_URL}/about`, name: 'about' },
  { url: `${BASE_URL}/our-story`, name: 'our-story' },
  { url: `${BASE_URL}/login`, name: 'login' },
  { url: `${BASE_URL}/signup`, name: 'signup' },
  { url: `${BASE_URL}/register`, name: 'register' },
];

function slugify(str) {
  return str.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').toLowerCase();
}

async function measurePage(page, url, name, viewport, viewportLabel) {
  const result = {
    url,
    name,
    viewport: viewportLabel,
    consoleErrors: [],
    consoleWarnings: [],
    networkErrors: [],
    resourceSizes: { js: 0, css: 0, images: 0, total: 0 },
    timing: {},
    lcp: null,
    cls: 0,
    statusCode: null,
    redirected: false,
    finalUrl: null,
    screenshot: null,
    imgStats: { total: 0, withSrcset: 0, broken: 0, lazy: 0 },
    storyContent: null,
  };

  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') result.consoleErrors.push(msg.text());
    if (msg.type() === 'warning') result.consoleWarnings.push(msg.text());
  });

  // Track resource sizes
  page.on('response', async (response) => {
    try {
      const reqUrl = response.url();
      const status = response.status();
      const headers = response.headers();
      const contentType = headers['content-type'] || '';

      if (status >= 400) {
        result.networkErrors.push({ url: reqUrl, status, method: response.request().method() });
      }

      // Measure sizes
      const contentLength = parseInt(headers['content-length'] || '0', 10);
      if (contentType.includes('javascript')) result.resourceSizes.js += contentLength;
      else if (contentType.includes('css')) result.resourceSizes.css += contentLength;
      else if (contentType.includes('image')) result.resourceSizes.images += contentLength;
      result.resourceSizes.total += contentLength;
    } catch(e) {
      // ignore
    }
  });

  let response;
  try {
    response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 45000,
    });
    result.statusCode = response ? response.status() : null;
    result.finalUrl = page.url();
    result.redirected = result.finalUrl !== url;
  } catch(e) {
    result.error = e.message;
    return result;
  }

  // If page redirected to a 404 or similar, note it
  if (result.statusCode >= 400) {
    result.networkErrors.push({ url, status: result.statusCode, note: 'primary page request failed' });
  }

  // Wait a bit more for React hydration
  await page.waitForTimeout(2000);

  // Capture timing metrics
  result.timing = await page.evaluate(() => {
    const t = performance.timing;
    const navStart = t.navigationStart;
    return {
      ttfb: t.responseStart - navStart,
      domContentLoaded: t.domContentLoadedEventEnd - navStart,
      loadEvent: t.loadEventEnd - navStart,
      domInteractive: t.domInteractive - navStart,
      responseEnd: t.responseEnd - navStart,
      connectTime: t.connectEnd - t.connectStart,
    };
  });

  // LCP via PerformanceObserver polled entries
  result.lcp = await page.evaluate(() => {
    return new Promise((resolve) => {
      let lcpValue = null;
      try {
        const obs = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          if (last) lcpValue = { startTime: last.startTime, size: last.size, url: last.url || null, element: last.element ? last.element.tagName : null };
        });
        obs.observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => {
          obs.disconnect();
          resolve(lcpValue);
        }, 1000);
      } catch(e) {
        resolve(null);
      }
    });
  });

  // CLS
  result.cls = await page.evaluate(() => {
    return new Promise((resolve) => {
      let clsScore = 0;
      try {
        const obs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) clsScore += entry.value;
          }
        });
        obs.observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => {
          obs.disconnect();
          resolve(clsScore);
        }, 1000);
      } catch(e) {
        resolve(0);
      }
    });
  });

  // Screenshot
  const screenshotName = `shmedium-${slugify(name)}-${viewportLabel}.png`;
  const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  result.screenshot = screenshotName;

  // Image stats
  result.imgStats = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return {
      total: imgs.length,
      withSrcset: imgs.filter(img => img.srcset).length,
      broken: imgs.filter(img => !img.complete || img.naturalWidth === 0).length,
      lazy: imgs.filter(img => img.loading === 'lazy').length,
      altMissing: imgs.filter(img => !img.alt).length,
    };
  });

  // Story-specific checks
  if (name.startsWith('story-')) {
    result.storyContent = await page.evaluate(() => {
      const title = document.querySelector('h1, .story-title, [class*="title"]');
      const body = document.querySelector('article, .story-body, [class*="body"], [class*="content"]');
      const imgs = Array.from(document.querySelectorAll('img'));
      return {
        hasTitle: !!title,
        titleText: title ? title.innerText.substring(0, 100) : null,
        hasBody: !!body,
        bodyCharCount: body ? body.innerText.length : 0,
        brokenImgs: imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src || img.currentSrc),
      };
    });
  }

  return result;
}

async function auditPage(browser, url, name, options = {}) {
  console.log(`\n=== Auditing: ${name} (${url}) ===`);
  const results = [];

  // Desktop
  const desktopCtx = await browser.newContext({ viewport: DESKTOP_VIEWPORT });
  const desktopPage = await desktopCtx.newPage();
  const desktopResult = await measurePage(desktopPage, url, name, DESKTOP_VIEWPORT, 'desktop');

  // Extra checks for home page on desktop
  if (name === 'home') {
    console.log('  Running home-specific checks...');

    // Check for search input
    desktopResult.hasSearch = await desktopPage.evaluate(() => {
      return !!document.querySelector('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i], [class*="search"] input');
    });

    // Test infinite scroll — scroll to bottom
    try {
      const initialCount = await desktopPage.evaluate(() => {
        return document.querySelectorAll('article, [class*="story"], [class*="card"], [class*="post"]').length;
      });

      // Scroll down multiple times
      for (let i = 0; i < 5; i++) {
        await desktopPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await desktopPage.waitForTimeout(1500);
      }

      const afterScrollCount = await desktopPage.evaluate(() => {
        return document.querySelectorAll('article, [class*="story"], [class*="card"], [class*="post"]').length;
      });

      desktopResult.infiniteScroll = {
        initialItemCount: initialCount,
        afterScrollItemCount: afterScrollCount,
        newItemsLoaded: afterScrollCount - initialCount,
        appearsToWork: afterScrollCount > initialCount,
      };

      // Scroll back up and screenshot
      await desktopPage.evaluate(() => window.scrollTo(0, 0));
      await desktopPage.waitForTimeout(500);

    } catch(e) {
      desktopResult.infiniteScrollError = e.message;
    }

    // Check lazy image loading
    desktopResult.lazyImgDetail = await desktopPage.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: (img.src || img.currentSrc || '').substring(0, 120),
        loading: img.loading,
        hasSrcset: !!img.srcset,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
      }));
    });

    // Try triggering auth modal — look for login/signup buttons
    try {
      const loginBtn = await desktopPage.$('button:has-text("Log in"), button:has-text("Login"), button:has-text("Sign in"), a:has-text("Log in"), a:has-text("Login"), a:has-text("Sign in")');
      if (loginBtn) {
        await loginBtn.click();
        await desktopPage.waitForTimeout(1500);
        const screenshotName = `shmedium-home-auth-modal-desktop.png`;
        await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, screenshotName), fullPage: false });
        desktopResult.authModalScreenshot = screenshotName;
        desktopResult.authModalFound = true;
        // Close modal if possible
        const closeBtn = await desktopPage.$('button[aria-label="close"], button:has-text("×"), button:has-text("Close"), [class*="close"]');
        if (closeBtn) await closeBtn.click();
      } else {
        desktopResult.authModalFound = false;
      }
    } catch(e) {
      desktopResult.authModalError = e.message;
    }
  }

  results.push(desktopResult);
  await desktopCtx.close();

  // Mobile
  const mobileCtx = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const mobilePage = await mobileCtx.newPage();
  const mobileResult = await measurePage(mobilePage, url, name, MOBILE_VIEWPORT, 'mobile');
  results.push(mobileResult);
  await mobileCtx.close();

  console.log(`  Desktop: ${desktopResult.statusCode} | TTFB: ${desktopResult.timing.ttfb}ms | LCP: ${desktopResult.lcp ? Math.round(desktopResult.lcp.startTime) + 'ms' : 'N/A'} | CLS: ${desktopResult.cls.toFixed(4)}`);
  console.log(`  Mobile:  ${mobileResult.statusCode} | TTFB: ${mobileResult.timing.ttfb}ms | LCP: ${mobileResult.lcp ? Math.round(mobileResult.lcp.startTime) + 'ms' : 'N/A'} | CLS: ${mobileResult.cls.toFixed(4)}`);
  console.log(`  Console errors: ${desktopResult.consoleErrors.length} | Network errors: ${desktopResult.networkErrors.length}`);

  return results;
}

async function main() {
  console.log('Starting Shmedium QA Audit — 2026-05-16');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const allResults = [];

  for (const { url, name } of URLS_TO_TEST) {
    try {
      const results = await auditPage(browser, url, name);
      allResults.push(...results);
    } catch(e) {
      console.error(`Error auditing ${name}: ${e.message}`);
      allResults.push({ url, name, error: e.message });
    }
  }

  await browser.close();

  // Write raw results
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(allResults, null, 2));
  console.log(`\nRaw results written to: ${RESULTS_FILE}`);

  // Print summary
  console.log('\n=== SUMMARY ===');
  const desktopResults = allResults.filter(r => r.viewport === 'desktop');
  for (const r of desktopResults) {
    console.log(`${r.name}: status=${r.statusCode} ttfb=${r.timing?.ttfb}ms lcp=${r.lcp ? Math.round(r.lcp.startTime) : 'N/A'}ms cls=${r.cls?.toFixed(4)} errors=${r.consoleErrors?.length} netErrors=${r.networkErrors?.length}`);
  }

  console.log('\nDone!');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
