'use strict';
/**
 * XYLO UI Demo Script
 * ===================
 * Phase 1: Discover  — inspect actual DOM before scripting
 * Phase 2: Rehearse  — verify every selector resolves (--rehearse flag)
 * Phase 3: Record    — produce a polished WebM walkthrough
 *
 * Usage:
 *   node scripts/demo.cjs --discover   (print interactive elements per page)
 *   node scripts/demo.cjs --rehearse   (verify selectors, exit 1 on failure)
 *   node scripts/demo.cjs              (record: saves screenshots/demo-xylo.webm)
 *
 * Requires:
 *   npm install -D playwright
 *   npx playwright install chromium
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.DEMO_URL || 'http://localhost:5173';
const VIDEO_DIR = path.join(__dirname, '..', 'screenshots');
const OUTPUT_NAME = 'demo-xylo.webm';

const DISCOVER  = process.argv.includes('--discover');
const REHEARSAL = process.argv.includes('--rehearse');

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    cursor.style.cssText = `
      position: fixed; z-index: 999999; pointer-events: none;
      width: 24px; height: 24px;
      transition: left 0.08s linear, top 0.08s linear;
      filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.35));
      left: 0px; top: 0px;
    `;
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  });
}

async function injectSubtitleBar(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-subtitle')) return;
    const bar = document.createElement('div');
    bar.id = 'demo-subtitle';
    bar.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 999998;
      text-align: center; padding: 14px 32px;
      background: rgba(10, 10, 15, 0.82);
      backdrop-filter: blur(12px);
      color: white; font-family: -apple-system, "Segoe UI", sans-serif;
      font-size: 15px; font-weight: 500; letter-spacing: 0.2px;
      transition: opacity 0.3s;
      pointer-events: none;
    `;
    bar.style.opacity = '0';
    document.body.appendChild(bar);
  });
}

async function showSubtitle(page, text, dwell = 900) {
  await page.evaluate((t) => {
    const bar = document.getElementById('demo-subtitle');
    if (!bar) return;
    bar.textContent = t || '';
    bar.style.opacity = t ? '1' : '0';
  }, text);
  if (text) await page.waitForTimeout(dwell);
}

async function moveAndClick(page, locator, label, opts = {}) {
  const { postClickDelay = 800, ...clickOpts } = opts;
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: moveAndClick skipped — "${label}" not visible`);
    return false;
  }
  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    const box = await el.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
      await page.waitForTimeout(350);
    }
    await el.click(clickOpts);
  } catch (e) {
    console.error(`WARNING: moveAndClick failed on "${label}": ${e.message}`);
    return false;
  }
  await page.waitForTimeout(postClickDelay);
  return true;
}

async function typeSlowly(page, locator, text, label, charDelay = 38) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARNING: typeSlowly skipped — "${label}" not visible`);
    return false;
  }
  await moveAndClick(page, el, label);
  await el.fill('');
  await el.pressSequentially(text, { delay: charDelay });
  await page.waitForTimeout(450);
  return true;
}

async function ensureVisible(page, locator, label) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    const found = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button, input, select, textarea, a, [role="button"]'))
        .filter(el => el.offsetParent !== null)
        .map(el => `${el.tagName}[${el.type || ''}] "${el.textContent?.trim().substring(0, 30)}"`)
        .join('\n  ')
    );
    console.error(`REHEARSAL FAIL: "${label}" not found`);
    console.error(`  Visible interactive elements:\n  ${found}`);
    return false;
  }
  console.log(`REHEARSAL OK:  "${label}"`);
  return true;
}

async function panElements(page, selector, maxCount = 6) {
  const elements = await page.locator(selector).all();
  for (let i = 0; i < Math.min(elements.length, maxCount); i++) {
    try {
      const box = await elements[i].boundingBox();
      if (box && box.y < 680) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
        await page.waitForTimeout(550);
      }
    } catch (e) {
      console.warn(`WARNING: panElements skipped element ${i}: ${e.message}`);
    }
  }
}

async function discoverPage(page, url, label) {
  await page.goto(url, { waitUntil: 'networkidle' });
  const fields = await page.evaluate(() => {
    const els = [];
    document.querySelectorAll('input, select, textarea, button, [contenteditable], [role="button"]').forEach(el => {
      if (el.offsetParent !== null) {
        els.push({
          tag: el.tagName,
          type: el.type || '',
          name: el.name || '',
          placeholder: el.placeholder || '',
          text: el.textContent?.trim().substring(0, 50) || '',
          role: el.getAttribute('role') || '',
        });
      }
    });
    return els;
  });
  console.log(`\n── ${label} (${url}) ─────────────────`);
  console.table(fields);
}

// ─── Phase 1: Discover ───────────────────────────────────────────────────────

async function runDiscover() {
  console.log('=== XYLO Demo — Phase 1: Discover ===\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  await discoverPage(page, `${BASE_URL}/`, 'Landing Page');
  await discoverPage(page, `${BASE_URL}/auth/login`, 'Login Page');
  await discoverPage(page, `${BASE_URL}/auth/signup`, 'Signup Page');

  await browser.close();
  console.log('\nDiscovery complete — update selector constants above before rehearsal.');
}

// ─── Phase 2: Rehearse ────────────────────────────────────────────────────────

async function runRehearsal() {
  console.log('=== XYLO Demo — Phase 2: Rehearse ===\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  let allOk = true;

  // ── Landing page ──
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const checks = [
    ['a:has-text("Start for free")',        'Landing CTA — Start for free'],
    ['a:has-text("For schools")',            'Landing CTA — For schools'],
    ['.lp-bento-card',                       'Bento feature cards'],
    ['.lp-chat-card',                        'Hero chat preview card'],
    ['a:has-text("Get started free")',       'Final CTA — Get started free'],
  ];
  for (const [sel, label] of checks) {
    if (!await ensureVisible(page, sel, label)) allOk = false;
  }

  // ── Login page ──
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
  const loginChecks = [
    ['input[type="email"]',    'Login — email field'],
    ['input[type="password"]', 'Login — password field'],
    ['button[type="submit"]',  'Login — submit button'],
  ];
  for (const [sel, label] of loginChecks) {
    if (!await ensureVisible(page, sel, label)) allOk = false;
  }

  await browser.close();

  if (!allOk) {
    console.error('\nREHEARSAL FAILED — fix selectors before recording.\n');
    process.exit(1);
  }
  console.log('\nREHEARSAL PASSED ✓ — all selectors verified. Ready to record.\n');
}

// ─── Phase 3: Record ──────────────────────────────────────────────────────────

async function runRecord() {
  console.log('=== XYLO Demo — Phase 3: Record ===\n');

  if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  async function reinject() {
    await injectCursor(page);
    await injectSubtitleBar(page);
  }

  try {
    // ── Entry: Landing page ───────────────────────────────────────────────────
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await reinject();
    await page.waitForTimeout(1500);

    await showSubtitle(page, 'Step 1 — XYLO: AI Study Companion for African Students');
    await page.waitForTimeout(3000);

    // Pan hero text
    const heroH1 = page.locator('.lp-hero-h1').first();
    const heroBox = await heroH1.boundingBox().catch(() => null);
    if (heroBox) {
      await page.mouse.move(heroBox.x + heroBox.width / 2, heroBox.y + 20, { steps: 8 });
      await page.waitForTimeout(1200);
    }

    // Move to hero chat preview card
    const chatCard = page.locator('.lp-chat-card').first();
    const cardBox = await chatCard.boundingBox().catch(() => null);
    if (cardBox) {
      await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2, { steps: 14 });
      await page.waitForTimeout(2000);
    }

    // ── Features bento ────────────────────────────────────────────────────────
    await showSubtitle(page, 'Step 2 — Six powerful study capabilities');
    await page.evaluate(() => {
      document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    await page.waitForTimeout(1800);
    await panElements(page, '.lp-bento-card', 6);
    await page.waitForTimeout(1000);

    // ── Study modes ───────────────────────────────────────────────────────────
    await showSubtitle(page, 'Step 3 — Four modes: Understand · Quiz · Study Plan · Exam Prep');
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    await panElements(page, '.lp-mode-row', 4);
    await page.waitForTimeout(1000);

    // ── How it works ──────────────────────────────────────────────────────────
    await showSubtitle(page, 'Step 4 — Up and studying in four simple steps');
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    await panElements(page, '.lp-step', 4);
    await page.waitForTimeout(1000);

    // ── Schools section ───────────────────────────────────────────────────────
    await showSubtitle(page, 'Step 5 — School admin dashboard for institutions');
    await page.evaluate(() => {
      document.querySelector('#schools')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await page.waitForTimeout(2200);

    const schoolCard = page.locator('.lp-school-card').first();
    const schoolBox = await schoolCard.boundingBox().catch(() => null);
    if (schoolBox) {
      await page.mouse.move(schoolBox.x + schoolBox.width / 2, schoolBox.y + schoolBox.height / 2, { steps: 10 });
      await page.waitForTimeout(1800);
    }

    // ── Pricing mention + CTA ─────────────────────────────────────────────────
    await showSubtitle(page, 'Step 6 — Free forever · Upgrade when ready');
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    await page.waitForTimeout(2500);

    // Hover CTA button
    const ctaBtn = page.locator('.lp-cta-band .lp-btn-primary').first();
    const ctaBox = await ctaBtn.boundingBox().catch(() => null);
    if (ctaBox) {
      await page.mouse.move(ctaBox.x + ctaBox.width / 2, ctaBox.y + ctaBox.height / 2, { steps: 10 });
      await page.waitForTimeout(1500);
    }

    // ── Navigate to Pricing ───────────────────────────────────────────────────
    await showSubtitle(page, 'Step 7 — Simple, transparent pricing');
    await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle' });
    await reinject();
    await page.waitForTimeout(2000);
    await panElements(page, '.plan-card, [class*="plan-card"]', 3);
    await page.waitForTimeout(1500);

    // ── Sign-up flow ──────────────────────────────────────────────────────────
    await showSubtitle(page, 'Step 8 — Getting started takes less than a minute');
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
    await reinject();
    await page.waitForTimeout(1800);

    const emailField = page.locator('input[type="email"]').first();
    if (await emailField.isVisible().catch(() => false)) {
      await typeSlowly(page, emailField, 'demo@student.ng', 'Signup email');
    }

    const passField = page.locator('input[type="password"]').first();
    if (await passField.isVisible().catch(() => false)) {
      await typeSlowly(page, passField, '••••••••', 'Signup password');
    }

    // Hover submit (don't click — no real creds)
    const submitBtn = page.locator('button[type="submit"]').first();
    const submitBox = await submitBtn.boundingBox().catch(() => null);
    if (submitBox) {
      await page.mouse.move(submitBox.x + submitBox.width / 2, submitBox.y + submitBox.height / 2, { steps: 10 });
      await page.waitForTimeout(1200);
    }

    await showSubtitle(page, '');
    await page.waitForTimeout(2000);

    // ── Final frame ───────────────────────────────────────────────────────────
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await reinject();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(1000);
    await showSubtitle(page, 'XYLO — Smarter Learning. Stronger Students. Better Outcomes.');
    await page.waitForTimeout(3500);
    await showSubtitle(page, '');
    await page.waitForTimeout(1500);

  } catch (err) {
    console.error('DEMO ERROR:', err.message);
  } finally {
    await context.close();
    const video = page.video();
    if (video) {
      const src = await video.path();
      const dest = path.join(VIDEO_DIR, OUTPUT_NAME);
      try {
        fs.copyFileSync(src, dest);
        console.log(`\nVideo saved: ${dest}\n`);
      } catch (e) {
        console.error('ERROR: Failed to copy video:', e.message);
        console.error('  Source:', src);
        console.error('  Destination:', dest);
      }
    }
    await browser.close();
  }
}

// ─── Entry point ──────────────────────────────────────────────────────────────

(async () => {
  if (DISCOVER)  return runDiscover();
  if (REHEARSAL) return runRehearsal();
  return runRecord();
})();
