// Track previous major sticker prices every 2 days
// Fetches live Steam Market prices for representative stickers from each CS major
// Builds a time series in major_price_history.json for more accurate Budapest 2025 predictions

const SCRIPT_DIR = import.meta.dir;
const HISTORY_FILE = `${SCRIPT_DIR}/major_price_history.json`;
const CONFIG_FILE = `${SCRIPT_DIR}/config.json`;
const DELAY_MS = 2000;

// Load currency code from config.json, fallback to AUD (21)
let CURRENCY_CODE = 21;
try {
  const configFile = Bun.file(CONFIG_FILE);
  if (await configFile.exists()) {
    const cfg = await configFile.json();
    CURRENCY_CODE = cfg.currencyCode || 21;
  }
} catch {};

// ── Representative stickers per major ──────────────────────────────
// For each major, track ~3-6 stickers across quality tiers to get average prices
// Format: { hashName: Steam Market hash name, major, quality }
interface TrackedSticker {
  hashName: string;
  major: string;
  quality: 'Normal' | 'Holo' | 'Foil' | 'Gold' | 'Glitter' | 'Embroidered';
}

const trackedStickers: TrackedSticker[] = [
  // ── Boston 2018 ──
  { hashName: "Sticker | FaZe Clan | Boston 2018", major: "Boston 2018", quality: "Normal" },
  { hashName: "Sticker | Astralis (Holo) | Boston 2018", major: "Boston 2018", quality: "Holo" },
  { hashName: "Sticker | Cloud9 (Holo) | Boston 2018", major: "Boston 2018", quality: "Holo" },
  { hashName: "Sticker | FaZe Clan (Foil) | Boston 2018", major: "Boston 2018", quality: "Foil" },

  // ── London 2018 ──
  { hashName: "Sticker | Astralis | London 2018", major: "London 2018", quality: "Normal" },
  { hashName: "Sticker | Natus Vincere (Holo) | London 2018", major: "London 2018", quality: "Holo" },
  { hashName: "Sticker | Astralis (Foil) | London 2018", major: "London 2018", quality: "Foil" },

  // ── Katowice 2019 ──
  { hashName: "Sticker | Astralis | Katowice 2019", major: "Katowice 2019", quality: "Normal" },
  { hashName: "Sticker | Natus Vincere (Holo) | Katowice 2019", major: "Katowice 2019", quality: "Holo" },
  { hashName: "Sticker | s1mple (Gold) | Katowice 2019", major: "Katowice 2019", quality: "Gold" },
  { hashName: "Sticker | Astralis (Gold) | Katowice 2019", major: "Katowice 2019", quality: "Gold" },

  // ── Berlin 2019 ──
  { hashName: "Sticker | Astralis | Berlin 2019", major: "Berlin 2019", quality: "Normal" },
  { hashName: "Sticker | Natus Vincere (Holo) | Berlin 2019", major: "Berlin 2019", quality: "Holo" },
  { hashName: "Sticker | s1mple (Gold) | Berlin 2019", major: "Berlin 2019", quality: "Gold" },

  // ── Stockholm 2021 ──
  { hashName: "Sticker | Natus Vincere | Stockholm 2021", major: "Stockholm 2021", quality: "Normal" },
  { hashName: "Sticker | FaZe Clan (Holo) | Stockholm 2021", major: "Stockholm 2021", quality: "Holo" },
  { hashName: "Sticker | s1mple (Gold) | Stockholm 2021", major: "Stockholm 2021", quality: "Gold" },
  { hashName: "Sticker | Natus Vincere (Gold) | Stockholm 2021", major: "Stockholm 2021", quality: "Gold" },

  // ── Antwerp 2022 ──
  { hashName: "Sticker | FaZe Clan | Antwerp 2022", major: "Antwerp 2022", quality: "Normal" },
  { hashName: "Sticker | Natus Vincere (Holo) | Antwerp 2022", major: "Antwerp 2022", quality: "Holo" },
  { hashName: "Sticker | s1mple (Gold) | Antwerp 2022", major: "Antwerp 2022", quality: "Gold" },

  // ── Rio 2022 (EXPANDED TRACKING — 15 stickers) ──
  // Normal tier
  { hashName: "Sticker | FURIA | Rio 2022", major: "Rio 2022", quality: "Normal" },
  { hashName: "Sticker | Natus Vincere | Rio 2022", major: "Rio 2022", quality: "Normal" },
  { hashName: "Sticker | FaZe Clan | Rio 2022", major: "Rio 2022", quality: "Normal" },
  { hashName: "Sticker | Outsiders | Rio 2022", major: "Rio 2022", quality: "Normal" },
  // Holo tier
  { hashName: "Sticker | Natus Vincere (Holo) | Rio 2022", major: "Rio 2022", quality: "Holo" },
  { hashName: "Sticker | FURIA (Holo) | Rio 2022", major: "Rio 2022", quality: "Holo" },
  { hashName: "Sticker | FaZe Clan (Holo) | Rio 2022", major: "Rio 2022", quality: "Holo" },
  { hashName: "Sticker | s1mple (Holo) | Rio 2022", major: "Rio 2022", quality: "Holo" },
  { hashName: "Sticker | NiKo (Holo) | Rio 2022", major: "Rio 2022", quality: "Holo" },
  { hashName: "Sticker | m0NESY (Holo) | Rio 2022", major: "Rio 2022", quality: "Holo" },
  // Gold tier
  { hashName: "Sticker | s1mple (Gold) | Rio 2022", major: "Rio 2022", quality: "Gold" },
  { hashName: "Sticker | NiKo (Gold) | Rio 2022", major: "Rio 2022", quality: "Gold" },
  { hashName: "Sticker | m0NESY (Gold) | Rio 2022", major: "Rio 2022", quality: "Gold" },
  { hashName: "Sticker | FaZe Clan (Gold) | Rio 2022", major: "Rio 2022", quality: "Gold" },
  { hashName: "Sticker | FURIA (Gold) | Rio 2022", major: "Rio 2022", quality: "Gold" },

  // ── Paris 2023 (EXPANDED TRACKING — 17 stickers) ──
  // Normal tier
  { hashName: "Sticker | Vitality | Paris 2023", major: "Paris 2023", quality: "Normal" },
  { hashName: "Sticker | Natus Vincere | Paris 2023", major: "Paris 2023", quality: "Normal" },
  { hashName: "Sticker | FaZe Clan | Paris 2023", major: "Paris 2023", quality: "Normal" },
  { hashName: "Sticker | G2 Esports | Paris 2023", major: "Paris 2023", quality: "Normal" },
  { hashName: "Sticker | Heroic | Paris 2023", major: "Paris 2023", quality: "Normal" },
  // Glitter tier (mid-tier for Paris 2023)
  { hashName: "Sticker | NiKo (Glitter) | Paris 2023", major: "Paris 2023", quality: "Glitter" },
  { hashName: "Sticker | m0NESY (Glitter) | Paris 2023", major: "Paris 2023", quality: "Glitter" },
  { hashName: "Sticker | Vitality (Glitter) | Paris 2023", major: "Paris 2023", quality: "Glitter" },
  // Holo tier
  { hashName: "Sticker | NiKo (Holo) | Paris 2023", major: "Paris 2023", quality: "Holo" },
  { hashName: "Sticker | m0NESY (Holo) | Paris 2023", major: "Paris 2023", quality: "Holo" },
  { hashName: "Sticker | Vitality (Holo) | Paris 2023", major: "Paris 2023", quality: "Holo" },
  { hashName: "Sticker | Natus Vincere (Holo) | Paris 2023", major: "Paris 2023", quality: "Holo" },
  // Gold tier
  { hashName: "Sticker | NiKo (Gold) | Paris 2023", major: "Paris 2023", quality: "Gold" },
  { hashName: "Sticker | s1mple (Gold) | Paris 2023", major: "Paris 2023", quality: "Gold" },
  { hashName: "Sticker | m0NESY (Gold) | Paris 2023", major: "Paris 2023", quality: "Gold" },
  { hashName: "Sticker | Vitality (Gold) | Paris 2023", major: "Paris 2023", quality: "Gold" },
  { hashName: "Sticker | G2 Esports (Gold) | Paris 2023", major: "Paris 2023", quality: "Gold" },

  // ── Copenhagen 2024 (DEEP TRACKING — 20 stickers) ──
  // Normal tier
  { hashName: "Sticker | Vitality | Copenhagen 2024", major: "Copenhagen 2024", quality: "Normal" },
  { hashName: "Sticker | Natus Vincere | Copenhagen 2024", major: "Copenhagen 2024", quality: "Normal" },
  { hashName: "Sticker | FaZe Clan | Copenhagen 2024", major: "Copenhagen 2024", quality: "Normal" },
  { hashName: "Sticker | G2 Esports | Copenhagen 2024", major: "Copenhagen 2024", quality: "Normal" },
  { hashName: "Sticker | MOUZ | Copenhagen 2024", major: "Copenhagen 2024", quality: "Normal" },
  // Embroidered tier
  { hashName: "Sticker | Natus Vincere (Embroidered) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Embroidered" },
  { hashName: "Sticker | Vitality (Embroidered) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Embroidered" },
  { hashName: "Sticker | donk (Embroidered) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Embroidered" },
  { hashName: "Sticker | NiKo (Embroidered) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Embroidered" },
  // Holo tier
  { hashName: "Sticker | donk (Holo) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Holo" },
  { hashName: "Sticker | NiKo (Holo) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Holo" },
  { hashName: "Sticker | m0NESY (Holo) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Holo" },
  { hashName: "Sticker | s1mple (Holo) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Holo" },
  { hashName: "Sticker | Natus Vincere (Holo) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Holo" },
  { hashName: "Sticker | FaZe Clan (Holo) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Holo" },
  // Gold tier
  { hashName: "Sticker | donk (Gold) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Gold" },
  { hashName: "Sticker | NiKo (Gold) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Gold" },
  { hashName: "Sticker | m0NESY (Gold) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Gold" },
  { hashName: "Sticker | s1mple (Gold) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Gold" },
  { hashName: "Sticker | Natus Vincere (Gold) | Copenhagen 2024", major: "Copenhagen 2024", quality: "Gold" },

  // ── Shanghai 2024 (DEEP TRACKING — 20 stickers) ──
  // Normal tier
  { hashName: "Sticker | Team Spirit | Shanghai 2024", major: "Shanghai 2024", quality: "Normal" },
  { hashName: "Sticker | FaZe Clan | Shanghai 2024", major: "Shanghai 2024", quality: "Normal" },
  { hashName: "Sticker | Vitality | Shanghai 2024", major: "Shanghai 2024", quality: "Normal" },
  { hashName: "Sticker | G2 Esports | Shanghai 2024", major: "Shanghai 2024", quality: "Normal" },
  { hashName: "Sticker | Natus Vincere | Shanghai 2024", major: "Shanghai 2024", quality: "Normal" },
  // Embroidered tier
  { hashName: "Sticker | Team Spirit (Embroidered) | Shanghai 2024", major: "Shanghai 2024", quality: "Embroidered" },
  { hashName: "Sticker | donk (Embroidered) | Shanghai 2024", major: "Shanghai 2024", quality: "Embroidered" },
  { hashName: "Sticker | NiKo (Embroidered) | Shanghai 2024", major: "Shanghai 2024", quality: "Embroidered" },
  { hashName: "Sticker | m0NESY (Embroidered) | Shanghai 2024", major: "Shanghai 2024", quality: "Embroidered" },
  // Holo tier
  { hashName: "Sticker | donk (Holo) | Shanghai 2024", major: "Shanghai 2024", quality: "Holo" },
  { hashName: "Sticker | NiKo (Holo) | Shanghai 2024", major: "Shanghai 2024", quality: "Holo" },
  { hashName: "Sticker | m0NESY (Holo) | Shanghai 2024", major: "Shanghai 2024", quality: "Holo" },
  { hashName: "Sticker | s1mple (Holo) | Shanghai 2024", major: "Shanghai 2024", quality: "Holo" },
  { hashName: "Sticker | Team Spirit (Holo) | Shanghai 2024", major: "Shanghai 2024", quality: "Holo" },
  { hashName: "Sticker | FaZe Clan (Holo) | Shanghai 2024", major: "Shanghai 2024", quality: "Holo" },
  // Gold tier
  { hashName: "Sticker | donk (Gold) | Shanghai 2024", major: "Shanghai 2024", quality: "Gold" },
  { hashName: "Sticker | NiKo (Gold) | Shanghai 2024", major: "Shanghai 2024", quality: "Gold" },
  { hashName: "Sticker | m0NESY (Gold) | Shanghai 2024", major: "Shanghai 2024", quality: "Gold" },
  { hashName: "Sticker | s1mple (Gold) | Shanghai 2024", major: "Shanghai 2024", quality: "Gold" },
  { hashName: "Sticker | Team Spirit (Gold) | Shanghai 2024", major: "Shanghai 2024", quality: "Gold" },

  // ── Austin 2025 (DEEP TRACKING — 20 stickers) ──
  // Normal tier
  { hashName: "Sticker | Vitality | Austin 2025", major: "Austin 2025", quality: "Normal" },
  { hashName: "Sticker | FaZe Clan | Austin 2025", major: "Austin 2025", quality: "Normal" },
  { hashName: "Sticker | Natus Vincere | Austin 2025", major: "Austin 2025", quality: "Normal" },
  { hashName: "Sticker | Team Spirit | Austin 2025", major: "Austin 2025", quality: "Normal" },
  { hashName: "Sticker | G2 Esports | Austin 2025", major: "Austin 2025", quality: "Normal" },
  // Embroidered tier
  { hashName: "Sticker | Vitality (Embroidered) | Austin 2025", major: "Austin 2025", quality: "Embroidered" },
  { hashName: "Sticker | donk (Embroidered) | Austin 2025", major: "Austin 2025", quality: "Embroidered" },
  { hashName: "Sticker | NiKo (Embroidered) | Austin 2025", major: "Austin 2025", quality: "Embroidered" },
  { hashName: "Sticker | m0NESY (Embroidered) | Austin 2025", major: "Austin 2025", quality: "Embroidered" },
  // Holo tier
  { hashName: "Sticker | TYLOO (Holo) | Austin 2025", major: "Austin 2025", quality: "Holo" },
  { hashName: "Sticker | NiKo (Holo) | Austin 2025", major: "Austin 2025", quality: "Holo" },
  { hashName: "Sticker | donk (Holo) | Austin 2025", major: "Austin 2025", quality: "Holo" },
  { hashName: "Sticker | m0NESY (Holo) | Austin 2025", major: "Austin 2025", quality: "Holo" },
  { hashName: "Sticker | s1mple (Holo) | Austin 2025", major: "Austin 2025", quality: "Holo" },
  { hashName: "Sticker | Vitality (Holo) | Austin 2025", major: "Austin 2025", quality: "Holo" },
  // Gold tier
  { hashName: "Sticker | NiKo (Gold) | Austin 2025", major: "Austin 2025", quality: "Gold" },
  { hashName: "Sticker | donk (Gold) | Austin 2025", major: "Austin 2025", quality: "Gold" },
  { hashName: "Sticker | m0NESY (Gold) | Austin 2025", major: "Austin 2025", quality: "Gold" },
  { hashName: "Sticker | s1mple (Gold) | Austin 2025", major: "Austin 2025", quality: "Gold" },
  { hashName: "Sticker | TYLOO (Gold) | Austin 2025", major: "Austin 2025", quality: "Gold" },
];

// ── Price parsing ──────────────────────────────────────────────────
function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^0-9.,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

// ── Fetch single price from Steam ──────────────────────────────────
interface PriceResult { price: number; volume: number; medianPrice: number; }

async function fetchPrice(hashName: string, retries = 2): Promise<PriceResult> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=${CURRENCY_CODE}&market_hash_name=${encodeURIComponent(hashName)}`;
      const res = await fetch(url);
      if (res.status === 429) {
        console.log(`  Rate limited, waiting 15s...`);
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }
      const data = await res.json() as any;
      if (data.lowest_price || data.median_price) {
        const volume = data.volume ? parseInt(data.volume.replace(/,/g, ''), 10) : 0;
        return {
          price: data.lowest_price ? parsePrice(data.lowest_price) : 0,
          volume,
          medianPrice: data.median_price ? parsePrice(data.median_price) : 0,
        };
      }
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
    } catch {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
    }
  }
  return { price: 0, volume: 0, medianPrice: 0 };
}

// ── Skinport API — third-party sales data (no auth needed) ────────
// Skinport prices are ~15% lower than Steam (no seller fee)
// We apply a 15% markup to Skinport prices for fair comparison
const SKINPORT_MARKUP = 1.15;

interface SkinportItem {
  market_hash_name: string;
  quantity: number;
  min_price: number;
  suggested_price: number;
}

interface SkinportSalesData {
  market_hash_name: string;
  last_24_hours: { volume: number };
  last_7_days: { volume: number; avg: number | null };
  last_30_days: { volume: number; avg: number | null };
  last_90_days: { volume: number; avg: number | null };
}

async function fetchSkinportData(trackedNames: string[]): Promise<Record<string, { listings: number; minPrice: number; suggestedPrice: number; vol7d: number; vol30d: number; vol90d: number; avg7d: number; avg30d: number }>> {
  const result: Record<string, { listings: number; minPrice: number; suggestedPrice: number; vol7d: number; vol30d: number; vol90d: number; avg7d: number; avg30d: number }> = {};
  const nameSet = new Set(trackedNames);

  // Fetch listings
  try {
    console.log('\nFetching Skinport listings...');
    const res = await fetch('https://api.skinport.com/v1/items?app_id=730&currency=USD&tradable=0', {
      headers: { 'Accept-Encoding': 'br, gzip, deflate' },
    });
    if (res.ok) {
      const items = await res.json() as SkinportItem[];
      for (const item of items) {
        if (nameSet.has(item.market_hash_name)) {
          result[item.market_hash_name] = {
            listings: item.quantity,
            minPrice: item.min_price,
            suggestedPrice: item.suggested_price,
            vol7d: 0, vol30d: 0, vol90d: 0,
            avg7d: 0, avg30d: 0,
          };
        }
      }
      console.log(`  Skinport: ${Object.keys(result).length}/${trackedNames.length} tracked stickers found with listings`);
    } else {
      console.log(`  Skinport items API returned ${res.status}`);
    }
  } catch (e) { console.log(`  Skinport items fetch failed: ${e}`); }

  // Wait 1s between API calls to be respectful
  await new Promise(r => setTimeout(r, 1000));

  // Fetch sales history
  try {
    console.log('Fetching Skinport sales history...');
    const res = await fetch('https://api.skinport.com/v1/sales/history?app_id=730&currency=USD', {
      headers: { 'Accept-Encoding': 'br, gzip, deflate' },
    });
    if (res.ok) {
      const items = await res.json() as SkinportSalesData[];
      let matched = 0;
      for (const item of items) {
        if (nameSet.has(item.market_hash_name)) {
          matched++;
          if (!result[item.market_hash_name]) {
            result[item.market_hash_name] = { listings: 0, minPrice: 0, suggestedPrice: 0, vol7d: 0, vol30d: 0, vol90d: 0, avg7d: 0, avg30d: 0 };
          }
          const r = result[item.market_hash_name];
          r.vol7d = item.last_7_days?.volume || 0;
          r.vol30d = item.last_30_days?.volume || 0;
          r.vol90d = item.last_90_days?.volume || 0;
          r.avg7d = item.last_7_days?.avg || 0;
          r.avg30d = item.last_30_days?.avg || 0;
        }
      }
      console.log(`  Skinport: ${matched} tracked stickers found with sales history`);
    } else {
      console.log(`  Skinport sales API returned ${res.status}`);
    }
  } catch (e) { console.log(`  Skinport sales fetch failed: ${e}`); }

  return result;
}

// ── History data structures ────────────────────────────────────────
interface MajorPriceEntry {
  date: string;
  stickers: Record<string, { price: number; volume: number; medianPrice: number }>;
  // Skinport data per sticker (prices in USD, pre-markup)
  skinportData?: Record<string, { listings: number; minPrice: number; suggestedPrice: number; vol7d: number; vol30d: number; vol90d: number; avg7d: number; avg30d: number }>;
  // Computed averages per major per quality
  averages: Record<string, {
    avgNormal: number;
    avgMidTier: number; // Foil/Glitter/Embroidered
    avgHolo: number;
    avgGold: number;
    totalVolume: number;
    stickerCount: number;
    // Skinport aggregates
    skinportTotalVol7d?: number;
    skinportTotalVol30d?: number;
    skinportAvgPrice?: number; // USD, with 15% markup applied
    skinportListings?: number;
  }>;
}

interface MajorPriceHistory {
  entries: MajorPriceEntry[];
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  // Load existing history
  let history: MajorPriceHistory = { entries: [] };
  try {
    const raw = await Bun.file(HISTORY_FILE).text();
    history = JSON.parse(raw);
  } catch { /* first run */ }

  const today = new Date().toISOString().slice(0, 10);

  // Check if we already have an entry for today with same sticker count
  const todayEntry = history.entries.find(e => e.date === today);
  if (todayEntry) {
    const existingCount = Object.keys(todayEntry.stickers || {}).length;
    if (existingCount >= trackedStickers.length) {
      console.log(`Already have data for ${today} (${existingCount} stickers), skipping.`);
      return;
    }
    // Sticker list expanded — remove old entry and re-fetch
    console.log(`Sticker list expanded (${existingCount} → ${trackedStickers.length}), re-fetching for ${today}...`);
    history.entries = history.entries.filter(e => e.date !== today);
  }

  console.log(`Fetching prices for ${trackedStickers.length} stickers from ${new Set(trackedStickers.map(s => s.major)).size} majors...`);
  console.log(`Estimated time: ~${Math.ceil(trackedStickers.length * DELAY_MS / 1000 / 60)} minutes\n`);

  const stickerPrices: Record<string, { price: number; volume: number; medianPrice: number }> = {};
  let fetched = 0;

  for (const sticker of trackedStickers) {
    fetched++;
    process.stdout.write(`[${fetched}/${trackedStickers.length}] ${sticker.hashName}...`);

    const result = await fetchPrice(sticker.hashName);
    stickerPrices[sticker.hashName] = result;

    if (result.price > 0) {
      console.log(` A$${result.price.toFixed(2)} (vol: ${result.volume})`);
    } else {
      console.log(` FAILED`);
    }

    if (fetched < trackedStickers.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  // Fetch Skinport data for all tracked stickers
  const allHashNames = trackedStickers.map(s => s.hashName);
  const skinportData = await fetchSkinportData(allHashNames);

  // Compute averages per major per quality
  const averages: MajorPriceEntry['averages'] = {};
  const majorNames = [...new Set(trackedStickers.map(s => s.major))];

  for (const major of majorNames) {
    const majorStickers = trackedStickers.filter(s => s.major === major);
    const normals: number[] = [];
    const midTiers: number[] = []; // Foil, Glitter, Embroidered
    const holos: number[] = [];
    const golds: number[] = [];
    let totalVolume = 0;

    for (const s of majorStickers) {
      const data = stickerPrices[s.hashName];
      if (!data || data.price === 0) continue;
      totalVolume += data.volume;

      if (s.quality === 'Normal') normals.push(data.price);
      else if (s.quality === 'Holo') holos.push(data.price);
      else if (s.quality === 'Gold') golds.push(data.price);
      else midTiers.push(data.price); // Foil, Glitter, Embroidered
    }

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    // Skinport aggregates for this major
    let spVol7d = 0, spVol30d = 0, spListings = 0;
    const spPrices: number[] = [];
    for (const s of majorStickers) {
      const sp = skinportData[s.hashName];
      if (sp) {
        spVol7d += sp.vol7d;
        spVol30d += sp.vol30d;
        spListings += sp.listings;
        if (sp.minPrice > 0) spPrices.push(sp.minPrice * SKINPORT_MARKUP); // Apply 15% markup
      }
    }

    averages[major] = {
      avgNormal: avg(normals),
      avgMidTier: avg(midTiers),
      avgHolo: avg(holos),
      avgGold: avg(golds),
      totalVolume,
      stickerCount: majorStickers.filter(s => stickerPrices[s.hashName]?.price > 0).length,
      skinportTotalVol7d: spVol7d,
      skinportTotalVol30d: spVol30d,
      skinportAvgPrice: avg(spPrices),
      skinportListings: spListings,
    };

    console.log(`\n${major}: Normal=$${avg(normals).toFixed(2)}, Mid=$${avg(midTiers).toFixed(2)}, Holo=$${avg(holos).toFixed(2)}, Gold=$${avg(golds).toFixed(2)}, Vol=${totalVolume}`);
    console.log(`  Skinport: ${spListings} listings, ${spVol7d} sales/7d, ${spVol30d} sales/30d, avg $${avg(spPrices).toFixed(2)} (+15%)`);
  }

  // Save entry
  const entry: MajorPriceEntry = {
    date: today,
    stickers: stickerPrices,
    skinportData,
    averages,
  };

  history.entries.push(entry);

  // Keep last 365 entries (~2 years at every-2-day schedule)
  if (history.entries.length > 365) {
    history.entries = history.entries.slice(-365);
  }

  await Bun.write(HISTORY_FILE, JSON.stringify(history, null, 2));
  console.log(`\nSaved ${history.entries.length} entries to ${HISTORY_FILE}`);

  // Summary
  console.log('\n── Summary ──────────────────────────────────────────');
  for (const major of majorNames) {
    const a = averages[major];
    if (!a) continue;
    const fetched = a.stickerCount;
    const total = trackedStickers.filter(s => s.major === major).length;
    console.log(`${major}: ${fetched}/${total} fetched | Normal A$${a.avgNormal.toFixed(2)} | Mid A$${a.avgMidTier.toFixed(2)} | Holo A$${a.avgHolo.toFixed(2)} | Gold A$${a.avgGold.toFixed(2)} | Vol ${a.totalVolume} | SP Vol7d ${a.skinportTotalVol7d || 0} | SP Listings ${a.skinportListings || 0}`);
  }
}

main().catch(console.error);
