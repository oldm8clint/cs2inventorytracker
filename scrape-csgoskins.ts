// CSGOSkins.gg Weekly Scraper
// Scrapes multi-marketplace pricing data (BUFF163, DMarket, CSFloat, BitSkins, etc.)
// Uses Playwright to bypass Cloudflare protection
// Run: bunx playwright install chromium && bun scrape-csgoskins.ts

import { chromium, type Page, type Browser } from "playwright";

const SCRIPT_DIR = import.meta.dir;
const OUTPUT_FILE = `${SCRIPT_DIR}/csgoskins_data.json`;
const CONFIG_FILE = `${SCRIPT_DIR}/config.json`;
const STICKERS_FILE = `${SCRIPT_DIR}/stickers.json`;

// ── Config ──────────────────────────────────────────────────────────
interface StickerEntry { name: string; quality: string; qty: number; }

interface CsgoSkinsItem {
  slug: string;
  prices: Record<string, number>; // marketplace → USD price
  listings?: Record<string, number>; // marketplace → listing count
  lowestMarket: string;
  lowestPrice: number;
  currency: "USD";
}

interface CsgoSkinsData {
  lastScraped: string;
  items: Record<string, CsgoSkinsItem>; // key = "name|||quality"
  scrapedCount: number;
  failedSlugs: string[];
}

// ── Load stickers ───────────────────────────────────────────────────
async function loadStickers(): Promise<StickerEntry[]> {
  try {
    const file = Bun.file(STICKERS_FILE);
    if (await file.exists()) {
      const raw = await file.json();
      if (raw.stickers && Array.isArray(raw.stickers)) {
        return raw.stickers;
      }
    }
  } catch {}
  console.error("Could not load stickers.json — run import-inventory.ts first");
  process.exit(1);
}

// ── URL slug generation ─────────────────────────────────────────────
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars except hyphens
    .replace(/\s+/g, "-")          // spaces → hyphens
    .replace(/-+/g, "-")           // collapse multiple hyphens
    .replace(/^-|-$/g, "");        // trim leading/trailing hyphens
}

function qualityToSlugPart(quality: string): string {
  const q = quality.toLowerCase();
  if (q === "normal") return "";
  if (q === "holo") return "-holo";
  if (q === "gold") return "-gold";
  if (q === "embroidered") return "-embroidered";
  if (q === "normal (champion)") return "-champion";
  if (q === "holo (champion)") return "-holo-champion";
  if (q === "embroidered (champion)") return "-embroidered-champion";
  if (q === "gold (champion)") return "-gold-champion";
  return "";
}

function buildSlug(name: string, quality: string): string {
  if (quality === "Capsule") return ""; // skip capsules
  const nameSlug = nameToSlug(name);
  const qualPart = qualityToSlugPart(quality);
  return `sticker-${nameSlug}${qualPart}-budapest-2025`;
}

function buildUrl(slug: string): string {
  return `https://csgoskins.gg/items/${slug}`;
}

function stickerKey(name: string, quality: string): string {
  return `${name}|||${quality}`;
}

// ── Marketplace name normalization ──────────────────────────────────
function normalizeMarketName(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (lower.includes("buff") || lower.includes("163")) return "buff163";
  if (lower.includes("steam") && lower.includes("market")) return "steam";
  if (lower.includes("skinport")) return "skinport";
  if (lower.includes("dmarket")) return "dmarket";
  if (lower.includes("csfloat") || lower.includes("cs.float") || lower.includes("float")) return "csfloat";
  if (lower.includes("bitskins")) return "bitskins";
  if (lower.includes("skinbaron")) return "skinbaron";
  if (lower.includes("tradeit") || lower.includes("trade.it")) return "tradeit";
  if (lower.includes("lisskins") || lower.includes("lis-skins")) return "lisskins";
  if (lower.includes("waxpeer")) return "waxpeer";
  if (lower.includes("mannco")) return "mannco";
  if (lower.includes("gamerpay")) return "gamerpay";
  if (lower.includes("cs.money") || lower.includes("csmoney")) return "csmoney";
  if (lower.includes("swap.gg") || lower.includes("swapgg")) return "swapgg";
  if (lower.includes("shadowpay")) return "shadowpay";
  if (lower.includes("cs.deals") || lower.includes("csdeals")) return "csdeals";
  if (lower.includes("whitemarket")) return "whitemarket";
  if (lower.includes("csgo500") || lower.includes("500")) return "csgo500";
  if (lower.includes("skinswap")) return "skinswap";
  if (lower.includes("marketcsgo") || lower.includes("market.csgo")) return "marketcsgo";
  return lower.replace(/[^a-z0-9]/g, "");
}

// ── Price parsing ───────────────────────────────────────────────────
function parseUsdPrice(text: string): number {
  // Handle various formats: "$0.05", "0.05 USD", "$1,234.56", "¥3.50" (CNY)
  const cleaned = text.replace(/[^\d.,]/g, "").replace(",", "");
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

// ── Page scraping ───────────────────────────────────────────────────
async function scrapeStickerPage(page: Page, slug: string): Promise<{
  prices: Record<string, number>;
  listings: Record<string, number>;
} | null> {
  const url = buildUrl(slug);

  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    if (!response) return null;
    const status = response.status();

    if (status === 404) return null; // page doesn't exist for this quality variant

    if (status === 403 || status === 503) {
      // Cloudflare challenge — wait and retry once
      console.log(`  ⏳ CF challenge on ${slug}, waiting 10s...`);
      await page.waitForTimeout(10000);
      const retry = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      if (!retry || retry.status() !== 200) return null;
    } else if (status !== 200) {
      return null;
    }

    // Wait for marketplace price elements to render
    // CSGOSkins.gg uses JS-rendered marketplace price grids
    await page.waitForTimeout(3000);

    // Extract marketplace prices from the page
    // The site renders marketplace offers in a structured format
    const data = await page.evaluate(() => {
      const prices: Record<string, number> = {};
      const listings: Record<string, number> = {};

      // Strategy 1: Look for marketplace offer rows/cards with price data
      // CSGOSkins.gg typically shows a grid of marketplace logos + prices
      const allElements = document.querySelectorAll("[class*='market'], [class*='offer'], [class*='price'], [data-market], [data-provider]");

      // Strategy 2: Look for structured marketplace data in page scripts (__NEXT_DATA__ or similar)
      const nextDataEl = document.getElementById("__NEXT_DATA__");
      if (nextDataEl) {
        try {
          const nextData = JSON.parse(nextDataEl.textContent || "{}");
          // Navigate through Next.js page props to find marketplace data
          const pageProps = nextData?.props?.pageProps;
          if (pageProps) {
            // Look for offers/listings/prices in various possible locations
            const item = pageProps.item || pageProps.skin || pageProps.sticker || pageProps;
            const offers = item?.offers || item?.market_offers || item?.prices || item?.marketplaces || [];

            if (Array.isArray(offers)) {
              for (const offer of offers) {
                const name = (offer.market_name || offer.marketplace || offer.provider || offer.name || "").toString();
                const price = parseFloat(offer.price || offer.min_price || offer.lowest_price || 0);
                const count = parseInt(offer.count || offer.listings || offer.offers_count || 0);
                if (name && price > 0) {
                  prices[name] = price;
                  if (count > 0) listings[name] = count;
                }
              }
            }

            // Also check for a prices object keyed by marketplace
            if (item?.prices && typeof item.prices === "object" && !Array.isArray(item.prices)) {
              for (const [mkt, val] of Object.entries(item.prices)) {
                if (typeof val === "number" && val > 0) prices[mkt] = val;
                else if (typeof val === "object" && val !== null) {
                  const p = (val as any).price || (val as any).min_price || (val as any).lowest;
                  if (typeof p === "number" && p > 0) prices[mkt] = p;
                }
              }
            }
          }
        } catch {}
      }

      // Strategy 3: Scrape visible marketplace elements from the DOM
      // Look for common patterns: marketplace logo/name + price text
      const rows = document.querySelectorAll("a[href*='redirect'], a[href*='market'], [class*='listing'], [class*='marketplace-row'], tr[class*='market'], div[class*='offer']");
      for (const row of rows) {
        // Try to find marketplace name (from img alt, text, or data attr)
        let marketName = "";
        const img = row.querySelector("img[alt]");
        if (img) marketName = img.getAttribute("alt") || "";
        if (!marketName) {
          const nameEl = row.querySelector("[class*='name'], [class*='market'], [class*='provider']");
          if (nameEl) marketName = nameEl.textContent?.trim() || "";
        }
        if (!marketName) {
          const href = row.getAttribute("href") || "";
          const hrefMatch = href.match(/redirect\/([\w-]+)/);
          if (hrefMatch) marketName = hrefMatch[1];
        }

        // Try to find price
        let priceText = "";
        const priceEl = row.querySelector("[class*='price'], [class*='cost'], [class*='amount']");
        if (priceEl) priceText = priceEl.textContent?.trim() || "";
        if (!priceText) {
          // Look for $ sign in text content
          const fullText = row.textContent || "";
          const priceMatch = fullText.match(/\$[\d.,]+/);
          if (priceMatch) priceText = priceMatch[0];
        }

        if (marketName && priceText) {
          const val = parseFloat(priceText.replace(/[^\d.,]/g, "").replace(",", ""));
          if (!isNaN(val) && val > 0) {
            prices[marketName] = val;
          }
        }

        // Try to find listing count
        const countEl = row.querySelector("[class*='count'], [class*='listing'], [class*='offer']");
        if (countEl && marketName) {
          const countText = countEl.textContent || "";
          const countMatch = countText.match(/(\d+)/);
          if (countMatch) {
            const count = parseInt(countMatch[1]);
            if (count > 0) listings[marketName] = count;
          }
        }
      }

      // Strategy 4: Check for any JSON-LD or microdata
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const s of jsonLdScripts) {
        try {
          const ld = JSON.parse(s.textContent || "{}");
          if (ld.offers) {
            const offerArr = Array.isArray(ld.offers) ? ld.offers : [ld.offers];
            for (const o of offerArr) {
              if (o.seller?.name && o.price) {
                prices[o.seller.name] = parseFloat(o.price);
              }
            }
          }
        } catch {}
      }

      return { prices, listings };
    });

    // Normalize marketplace names
    const normalizedPrices: Record<string, number> = {};
    const normalizedListings: Record<string, number> = {};
    for (const [raw, price] of Object.entries(data.prices)) {
      const normalized = normalizeMarketName(raw);
      if (normalized && price > 0) normalizedPrices[normalized] = price;
    }
    for (const [raw, count] of Object.entries(data.listings)) {
      const normalized = normalizeMarketName(raw);
      if (normalized && count > 0) normalizedListings[normalized] = count;
    }

    if (Object.keys(normalizedPrices).length === 0) return null;

    return { prices: normalizedPrices, listings: normalizedListings };
  } catch (err) {
    console.log(`  ❌ Error scraping ${slug}: ${err}`);
    return null;
  }
}

// ── Tournament index page scraper ───────────────────────────────────
// Try to get all sticker prices from the tournament index first (single page load)
async function scrapeIndexPage(page: Page): Promise<Record<string, Record<string, number>> | null> {
  const url = "https://csgoskins.gg/tournaments/2025-starladder-budapest/sticker";
  console.log("Attempting to scrape tournament index page...");

  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    if (!response || response.status() !== 200) {
      console.log(`  Index page returned ${response?.status() || "no response"}`);
      return null;
    }

    await page.waitForTimeout(5000); // let JS render

    // Try to extract __NEXT_DATA__ or similar data from index page
    const indexData = await page.evaluate(() => {
      const result: Record<string, Record<string, number>> = {};

      // Check __NEXT_DATA__
      const nextDataEl = document.getElementById("__NEXT_DATA__");
      if (nextDataEl) {
        try {
          const nextData = JSON.parse(nextDataEl.textContent || "{}");
          const pageProps = nextData?.props?.pageProps;
          const items = pageProps?.items || pageProps?.skins || pageProps?.stickers || [];

          if (Array.isArray(items)) {
            for (const item of items) {
              const slug = item.slug || item.market_hash_name || "";
              if (!slug) continue;
              const prices: Record<string, number> = {};

              // Extract prices from whatever structure the API returns
              if (item.prices && typeof item.prices === "object") {
                for (const [mkt, val] of Object.entries(item.prices)) {
                  const p = typeof val === "number" ? val : typeof val === "object" && val !== null ? ((val as any).price || (val as any).min_price || 0) : 0;
                  if (p > 0) prices[mkt] = p;
                }
              }
              if (item.min_price) prices["_lowest"] = item.min_price;
              if (item.steam_price) prices["steam"] = item.steam_price;

              if (Object.keys(prices).length > 0) {
                result[slug] = prices;
              }
            }
          }
        } catch {}
      }

      // Also scrape visible grid items
      const cards = document.querySelectorAll("[class*='item-card'], [class*='skin-card'], [class*='sticker-card'], a[href*='/items/sticker-']");
      for (const card of cards) {
        const href = (card as HTMLAnchorElement).href || card.querySelector("a")?.href || "";
        const slugMatch = href.match(/\/items\/(sticker-[^/?]+)/);
        if (!slugMatch) continue;
        const slug = slugMatch[1];

        const priceEl = card.querySelector("[class*='price']");
        if (priceEl) {
          const priceText = priceEl.textContent?.trim() || "";
          const val = parseFloat(priceText.replace(/[^\d.,]/g, "").replace(",", ""));
          if (!isNaN(val) && val > 0) {
            if (!result[slug]) result[slug] = {};
            result[slug]["_indexPrice"] = val;
          }
        }
      }

      return result;
    });

    const count = Object.keys(indexData).length;
    if (count > 0) {
      console.log(`  Found ${count} items from index page`);
      return indexData;
    }

    console.log("  No structured data found on index page — will scrape individual pages");
    return null;
  } catch (err) {
    console.log(`  Index page error: ${err}`);
    return null;
  }
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log("CSGOSkins.gg Scraper — Starting...\n");

  const stickers = await loadStickers();
  console.log(`Loaded ${stickers.length} sticker entries`);

  // Deduplicate stickers by name+quality (we just need unique items, not qty)
  const uniqueItems = new Map<string, { name: string; quality: string; slug: string }>();
  for (const s of stickers) {
    if (s.quality === "Capsule") continue; // skip capsules
    const key = stickerKey(s.name, s.quality);
    if (!uniqueItems.has(key)) {
      const slug = buildSlug(s.name, s.quality);
      if (slug) uniqueItems.set(key, { name: s.name, quality: s.quality, slug });
    }
  }
  console.log(`${uniqueItems.size} unique sticker variants to scrape\n`);

  // Launch browser
  console.log("Launching Playwright Chromium...");
  const browser: Browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: "en-US",
    timezoneId: "America/New_York",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  const result: CsgoSkinsData = {
    lastScraped: new Date().toISOString(),
    items: {},
    scrapedCount: 0,
    failedSlugs: [],
  };

  // Step 1: Try index page for bulk data
  const indexData = await scrapeIndexPage(page);

  // If we got meaningful data from the index, map it to our sticker keys
  if (indexData && Object.keys(indexData).length > 10) {
    console.log("\nMapping index data to sticker inventory...");
    for (const [key, item] of uniqueItems) {
      const slug = item.slug;
      const data = indexData[slug];
      if (data && Object.keys(data).length > 0) {
        const normalizedPrices: Record<string, number> = {};
        for (const [mkt, price] of Object.entries(data)) {
          if (mkt.startsWith("_")) continue; // skip internal keys
          const normalized = normalizeMarketName(mkt);
          if (normalized && price > 0) normalizedPrices[normalized] = price;
        }

        // Also include index/lowest prices if available
        if (data["_lowest"]) normalizedPrices["_lowest"] = data["_lowest"];
        if (data["_indexPrice"]) normalizedPrices["_indexPrice"] = data["_indexPrice"];

        if (Object.keys(normalizedPrices).length > 0) {
          const pricesOnly = Object.entries(normalizedPrices).filter(([k]) => !k.startsWith("_"));
          const lowest = pricesOnly.length > 0
            ? pricesOnly.reduce((a, b) => b[1] < a[1] ? b : a)
            : ["unknown", data["_lowest"] || data["_indexPrice"] || 0];

          result.items[key] = {
            slug,
            prices: normalizedPrices,
            lowestMarket: lowest[0],
            lowestPrice: lowest[1],
            currency: "USD",
          };
          result.scrapedCount++;
        }
      }
    }
    console.log(`Mapped ${result.scrapedCount} items from index data`);
  }

  // Step 2: Scrape individual pages for items not found in index data
  const remaining = [...uniqueItems.entries()].filter(([key]) => !result.items[key]);

  if (remaining.length > 0) {
    console.log(`\nScraping ${remaining.length} individual sticker pages...`);

    // Warm up session by visiting the tournament index first (if we haven't already)
    if (!indexData) {
      console.log("Warming Cloudflare session with index page...");
      await page.goto("https://csgoskins.gg/tournaments/2025-starladder-budapest/sticker", {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      }).catch(() => {});
      await page.waitForTimeout(5000);
    }

    for (let i = 0; i < remaining.length; i++) {
      const [key, item] = remaining[i];
      const pct = ((i + 1) / remaining.length * 100).toFixed(0);
      process.stdout.write(`[${i + 1}/${remaining.length}] (${pct}%) ${item.slug}...`);

      const data = await scrapeStickerPage(page, item.slug);

      if (data && Object.keys(data.prices).length > 0) {
        const priceEntries = Object.entries(data.prices);
        const lowest = priceEntries.reduce((a, b) => b[1] < a[1] ? b : a);

        result.items[key] = {
          slug: item.slug,
          prices: data.prices,
          listings: Object.keys(data.listings).length > 0 ? data.listings : undefined,
          lowestMarket: lowest[0],
          lowestPrice: lowest[1],
          currency: "USD",
        };
        result.scrapedCount++;
        console.log(` ✓ ${priceEntries.length} markets (lowest: $${lowest[1].toFixed(2)} @ ${lowest[0]})`);
      } else {
        result.failedSlugs.push(item.slug);
        console.log(" ✗ no data");
      }

      // Rate limit: random 3-5s delay between pages
      if (i < remaining.length - 1) {
        const delay = 3000 + Math.random() * 2000;
        await page.waitForTimeout(delay);
      }
    }
  }

  await browser.close();

  // Save results
  await Bun.write(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Scraping complete!`);
  console.log(`  Items scraped: ${result.scrapedCount}`);
  console.log(`  Failed: ${result.failedSlugs.length}`);
  console.log(`  Saved to: ${OUTPUT_FILE}`);
  if (result.failedSlugs.length > 0) {
    console.log(`  Failed slugs: ${result.failedSlugs.slice(0, 10).join(", ")}${result.failedSlugs.length > 10 ? "..." : ""}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
