#!/usr/bin/env node
import assert from "node:assert/strict";

const CANONICAL_ORIGIN = "https://waslislam.fun";

const PUBLIC_INDEXABLE_PATHS = [
  "/",
  "/quran",
  "/mushaf",
  "/tafsir",
  "/khatmah",
  "/listen",
  "/listen/reciters",
  "/prayer-times",
  "/adhkar",
  "/hadith",
  "/radio",
  "/lectures",
  "/knowledge",
  "/ramadan",
  "/zakat",
  "/charity",
  "/quiz",
  "/calendar",
  "/resources",
  "/updates",
  "/quran/1",
  "/quran/18",
  "/knowledge/foundations-of-tawhid",
  "/tafsir/2/255",
];

const NOINDEX_UTILITY_PATHS = [
  "/bookmarks",
  "/notifications",
  "/reading-settings",
  "/listen/library",
];

function parseBaseUrlArg(argv) {
  const idx = argv.indexOf("--url");
  if (idx !== -1 && argv[idx + 1]) {
    return argv[idx + 1].trim().replace(/\/+$/, "");
  }
  return "http://127.0.0.1:3000";
}

function normalizePath(p) {
  if (!p || p === "/") return "/";
  return (p.startsWith("/") ? p : `/${p}`).replace(/\/+$/, "") || "/";
}

async function fetchWithRetry(url, init = {}, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fetch(url, {
        ...init,
        signal: init.signal ?? AbortSignal.timeout(15000),
      });
    } catch (err) {
      lastErr = err;
      if (i + 1 < attempts) {
        await new Promise((r) => setTimeout(r, 600 * (i + 1)));
      }
    }
  }
  throw lastErr;
}

function extractMetaTags(html) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const canonicalMatch =
    html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) ||
    html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
  const descMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  const robotsMatch =
    html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']robots["'][^>]*>/i);
  const ogImageMatch =
    html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:image["'][^>]*>/i);

  const jsonLdScripts = [
    ...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ].map((m) => m[1]);

  return {
    title: titleMatch?.[1]?.trim() || "",
    canonical: canonicalMatch?.[1]?.trim() || "",
    description: descMatch?.[1]?.trim() || "",
    robots: robotsMatch?.[1]?.trim() || "",
    ogImage: ogImageMatch?.[1]?.trim() || "",
    jsonLdScripts,
  };
}

async function auditRobots(baseUrl, errors) {
  const res = await fetchWithRetry(`${baseUrl}/robots.txt`, { redirect: "manual" });
  const ct = res.headers.get("content-type") || "";
  const body = await res.text();

  try {
    assert.equal(res.status, 200, `robots.txt HTTP status expected 200, got ${res.status}`);
    assert.ok(ct.toLowerCase().includes("text/plain"), `robots.txt Content-Type expected text/plain, got '${ct}'`);
    assert.ok(!/<!DOCTYPE|<html/i.test(body), "robots.txt must not return HTML");

    const lines = body.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const sitemapLines = lines.filter((l) => /^sitemap:/i.test(l));
    assert.equal(sitemapLines.length, 1, `Expected 1 Sitemap directive in robots.txt, got ${sitemapLines.length}`);
    assert.equal(
      sitemapLines[0].toLowerCase(),
      `sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`,
      `Incorrect Sitemap directive: ${sitemapLines[0]}`
    );

    const hasGlobalDisallow = /^disallow:\s*\/\s*$/im.test(body);
    assert.ok(!hasGlobalDisallow, "robots.txt must NOT contain Disallow: /");
    assert.ok(!/^disallow:\s*\/_next/im.test(body), "robots.txt must NOT block /_next/ assets");
    assert.ok(/^disallow:\s*\/api\/?\s*$/im.test(body), "robots.txt must disallow /api/");
    for (const pub of ["/quran", "/hadith", "/adhkar", "/mushaf", "/charity", "/listen"]) {
      assert.ok(!new RegExp(`^disallow:\\s*${pub}`, "im").test(body), `Public route blocked in robots.txt: ${pub}`);
    }

    console.log(`[PASS] robots.txt (${res.status}, ${ct}) — valid directives & exact Sitemap URL`);
    return body;
  } catch (err) {
    errors.push(`robots.txt: ${err.message}`);
    return body;
  }
}

async function auditSitemap(baseUrl, errors) {
  const res = await fetchWithRetry(`${baseUrl}/sitemap.xml`, { redirect: "manual" });
  const ct = res.headers.get("content-type") || "";
  const xml = await res.text();

  try {
    assert.equal(res.status, 200, `sitemap.xml HTTP status expected 200, got ${res.status}`);
    assert.ok(/xml/i.test(ct), `sitemap.xml Content-Type expected XML, got '${ct}'`);
    assert.ok(!/<!DOCTYPE|<html/i.test(xml), "sitemap.xml must not return HTML");
    assert.ok(xml.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), "Missing official sitemaps.org namespace");
    assert.ok(Buffer.byteLength(xml, "utf8") < 50 * 1024 * 1024, "Sitemap exceeds 50MB limit");
    assert.ok(!/<changefreq>/i.test(xml), "Deprecated <changefreq> tag present in sitemap");
    assert.ok(!/<priority>/i.test(xml), "Meaningless <priority> tag present in sitemap");

    const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
    assert.ok(urlBlocks.length >= 130, `Expected >= 130 URLs in sitemap, got ${urlBlocks.length}`);
    assert.ok(urlBlocks.length <= 50000, `Sitemap exceeds 50,000 URL limit (${urlBlocks.length})`);

    const seenLocs = new Set();
    const lastMods = new Set();

    for (const block of urlBlocks) {
      const loc = block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim() || "";
      const lastmod = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1]?.trim() || "";

      assert.ok(loc.startsWith(`${CANONICAL_ORIGIN}`), `Invalid non-canonical URL in sitemap: ${loc}`);
      const afterHost = loc.slice(CANONICAL_ORIGIN.length);
      assert.ok(!afterHost.startsWith("//"), `Double slash URL in sitemap: ${loc}`);
      assert.ok(!/[?&]/.test(loc), `Query parameters not allowed in sitemap: ${loc}`);
      assert.ok(!/localhost|127\.0\.0\.1/i.test(loc), `Development URL in sitemap: ${loc}`);
      assert.ok(!seenLocs.has(loc), `Duplicate URL in sitemap: ${loc}`);
      seenLocs.add(loc);

      for (const blocked of [...NOINDEX_UTILITY_PATHS, "/api/"]) {
        assert.ok(
          !loc.startsWith(`${CANONICAL_ORIGIN}${blocked}`),
          `Noindex/private route included in sitemap: ${loc}`
        );
      }

      if (lastmod) {
        assert.ok(!Number.isNaN(Date.parse(lastmod)), `Invalid <lastmod> date in sitemap: ${lastmod}`);
        lastMods.add(lastmod);
      }
    }

    assert.ok(lastMods.size > 1, "Expected varied genuine <lastmod> timestamps rather than single uniform date");
    console.log(
      `[PASS] sitemap.xml (${res.status}, ${ct}) — ${seenLocs.size} unique canonical HTTPS URLs validated`
    );
    return Array.from(seenLocs);
  } catch (err) {
    errors.push(`sitemap.xml: ${err.message}`);
    return [];
  }
}

async function auditPagesAndSamples(baseUrl, sitemapUrls, errors) {
  const seenTitles = new Map();
  const seenDescs = new Map();

  for (const path of PUBLIC_INDEXABLE_PATHS) {
    const res = await fetchWithRetry(`${baseUrl}${path}`, { redirect: "manual" });
    if (res.status !== 200) {
      errors.push(`${path}: expected HTTP 200, got ${res.status}`);
      continue;
    }
    const html = await res.text();
    const xRobots = res.headers.get("x-robots-tag") || "";
    const meta = extractMetaTags(html);

    if (/noindex/i.test(meta.robots) || /noindex/i.test(xRobots)) {
      errors.push(`${path}: unexpected noindex directive on public page`);
    }
    if (!meta.title) {
      errors.push(`${path}: missing <title>`);
    } else {
      if ((meta.title.match(/وصل الإسلامية/g) || []).length > 1) {
        errors.push(`${path}: duplicated site name suffix in <title>: '${meta.title}'`);
      }
      if (seenTitles.has(meta.title)) {
        errors.push(`${path}: duplicate <title> with ${seenTitles.get(meta.title)}: '${meta.title}'`);
      } else {
        seenTitles.set(meta.title, path);
      }
    }

    if (!meta.description || meta.description.length < 25) {
      errors.push(`${path}: missing or too short meta description`);
    } else if (seenDescs.has(meta.description)) {
      errors.push(`${path}: duplicate meta description with ${seenDescs.get(meta.description)}`);
    } else {
      seenDescs.set(meta.description, path);
    }

    const expectedCanon =
      normalizePath(path) === "/"
        ? `${CANONICAL_ORIGIN}`
        : `${CANONICAL_ORIGIN}${normalizePath(path)}`;
    const normObservedCanon = meta.canonical.replace(/\/+$/, "");
    if (normObservedCanon !== expectedCanon) {
      errors.push(`${path}: canonical mismatch (expected '${expectedCanon}', got '${meta.canonical}')`);
    }

    if (!meta.ogImage.startsWith(CANONICAL_ORIGIN)) {
      errors.push(`${path}: missing or invalid og:image URL ('${meta.ogImage}')`);
    }

    for (const rawLd of meta.jsonLdScripts) {
      try {
        const parsed = JSON.parse(rawLd);
        assert.equal(parsed["@context"], "https://schema.org");
      } catch (e) {
        errors.push(`${path}: invalid JSON-LD (${e.message})`);
      }
    }
  }

  // Verify utility noindex pages cleanly carry noindex + self canonical
  for (const path of NOINDEX_UTILITY_PATHS) {
    const res = await fetchWithRetry(`${baseUrl}${path}`, { redirect: "manual" });
    if (res.status !== 200) {
      errors.push(`${path}: expected HTTP 200 on utility page, got ${res.status}`);
      continue;
    }
    const html = await res.text();
    const meta = extractMetaTags(html);
    if (!/noindex/i.test(meta.robots)) {
      errors.push(`${path}: utility page MUST have <meta name="robots" content="noindex, ...">`);
    }
  }

  // Verify genuine 404 on unknown route
  const notFoundRes = await fetchWithRetry(`${baseUrl}/nonexistent-seo-verification-404`, { redirect: "manual" });
  if (notFoundRes.status !== 404) {
    errors.push(`404 probe: expected HTTP 404, got ${notFoundRes.status}`);
  } else {
    console.log("[PASS] Nonexistent route returns genuine HTTP 404");
  }

  // Verify dynamic sample URLs extracted directly from sitemap.xml return HTTP 200 cleanly
  const sampleDynamic = sitemapUrls
    .filter((u) => /\/(lectures|listen\/reciters|knowledge|quran)\//.test(u))
    .slice(0, 6);
  for (const fullUrl of sampleDynamic) {
    const relPath = fullUrl.slice(CANONICAL_ORIGIN.length) || "/";
    const res = await fetchWithRetry(`${baseUrl}${relPath}`, { redirect: "manual" });
    if (res.status !== 200) {
      errors.push(`Sitemap sample ${relPath}: expected HTTP 200, got ${res.status}`);
    }
  }

  console.log(
    `[PASS] Audited ${PUBLIC_INDEXABLE_PATHS.length} public pages + ${NOINDEX_UTILITY_PATHS.length} noindex pages + ${sampleDynamic.length} dynamic sitemap samples`
  );
}

async function main() {
  const baseUrl = parseBaseUrlArg(process.argv);
  const errors = [];
  console.log(`Running Wasl Islamic Technical SEO Audit against ${baseUrl}...`);

  await auditRobots(baseUrl, errors);
  const sitemapUrls = await auditSitemap(baseUrl, errors);
  await auditPagesAndSamples(baseUrl, sitemapUrls, errors);

  if (errors.length > 0) {
    console.error(`\n[SEO AUDIT FAILED] Found ${errors.length} issue(s):`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log("\n[SEO AUDIT PASSED] All robots.txt, sitemap.xml, canonical, metadata, noindex, and JSON-LD checks passed!");
}

main().catch((err) => {
  console.error("SEO audit fatal error:", err);
  process.exit(1);
});
