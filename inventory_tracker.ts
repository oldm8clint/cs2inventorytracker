// CS2 Full Inventory Tracker
// Fetches entire Steam inventory, resolves prices, builds portfolio overview HTML
// Outputs index.html — the main landing page linking to budapest.html for sticker details

const SCRIPT_DIR = import.meta.dir;
const HTML_FILE = `${SCRIPT_DIR}/index.html`;
const HISTORY_FILE = `${SCRIPT_DIR}/inventory_price_history.json`;
const CONFIG_FILE = `${SCRIPT_DIR}/config.json`;

// ── Config ──────────────────────────────────────────────────────────
interface TrackerConfig {
  event: string;
  costPerUnit: number;
  currency: string;
  currencyCode: number;
  currencySymbol: string;
  steamProfile: { vanityUrl: string; displayName: string; avatarUrl: string };
  siteTitle: string;
  githubPagesUrl: string;
  portfolio?: {
    costBasis?: Record<string, { qty: number; costEach: number; currency: string }>;
    manualItems?: { market_hash_name: string; name?: string; qty: number; category?: string; note?: string; skinport?: { market_hash_name: string; version: string }; icon_url?: string }[];
  };
}

async function loadConfig(): Promise<TrackerConfig> {
  try {
    const file = Bun.file(CONFIG_FILE);
    if (await file.exists()) return await file.json();
  } catch (e) { console.log(`Warning: Could not load config.json: ${e}`); }
  return {
    event: "Budapest 2025", costPerUnit: 0.35, currency: "AUD", currencyCode: 21, currencySymbol: "$",
    steamProfile: { vanityUrl: "oldm8clint", displayName: "clint", avatarUrl: "" },
    siteTitle: "CS2 Inventory Tracker", githubPagesUrl: "",
  };
}

const config = await loadConfig();

// ── Steam Inventory Fetch ───────────────────────────────────────────
interface SteamAsset { classid: string; instanceid: string; amount: string; assetid: string; }
interface SteamDescription {
  classid: string;
  instanceid: string;
  market_hash_name: string;
  market_name?: string;
  name: string;
  type: string;
  tradable: number;
  marketable: number;
  icon_url?: string;
  icon_url_large?: string;
  tags?: { category: string; localized_category_name: string; localized_tag_name: string; internal_name: string; color?: string }[];
}
interface SteamInventoryResponse {
  success: number;
  total_inventory_count: number;
  assets?: SteamAsset[];
  descriptions?: SteamDescription[];
  last_assetid?: string;
  more_items?: number;
}

async function resolveSteamId(vanityUrl: string): Promise<string> {
  const res = await fetch(`https://steamcommunity.com/id/${vanityUrl}/?xml=1`);
  if (!res.ok) throw new Error(`Failed to fetch profile (HTTP ${res.status})`);
  const xml = await res.text();
  const m = xml.match(/<steamID64>(\d+)<\/steamID64>/);
  if (!m) throw new Error(`Could not resolve SteamID64 for "${vanityUrl}"`);
  return m[1];
}

interface InventoryItem {
  name: string;
  market_hash_name: string;
  type: string;
  category: string;      // Cases, Stickers, Skins, etc.
  rarity: string;
  qty: number;
  tradable: boolean;
  marketable: boolean;
  iconUrl: string;
  iconUrlLarge: string;
  tags: Record<string, string>; // category -> tag name
}

function categorizeItem(desc: SteamDescription): string {
  const tags = desc.tags || [];
  const typeTag = tags.find(t => t.category === 'Type')?.localized_tag_name || '';
  const type = desc.type?.toLowerCase() || '';
  const name = desc.market_hash_name || '';

  if (typeTag === 'Sticker' || type.includes('sticker')) return 'Stickers';
  if (typeTag === 'Container' || name.includes('Case') || name.includes('Capsule') || name.includes('Package') || type.includes('container')) {
    if (name.includes('Sticker') && name.includes('Capsule')) return 'Sticker Capsules';
    if (name.includes('Capsule')) return 'Capsules';
    return 'Cases';
  }
  if (typeTag === 'Key' || name.includes('Key')) return 'Keys';
  if (typeTag === 'Graffiti' || type.includes('graffiti')) return 'Graffiti';
  if (typeTag === 'Patch' || type.includes('patch')) return 'Patches';
  if (typeTag === 'Agent' || type.includes('agent')) return 'Agents';
  if (typeTag === 'Music Kit' || type.includes('music kit')) return 'Music Kits';
  if (typeTag === 'Collectible' || type.includes('collectible')) return 'Collectibles';
  if (typeTag === 'Tool' || type.includes('tool')) return 'Tools';
  if (typeTag === 'Gift' || type.includes('gift')) return 'Gifts';
  if (type.includes('rifle') || type.includes('pistol') || type.includes('smg') || type.includes('shotgun') || type.includes('sniper') || type.includes('machinegun') || type.includes('knife') || type.includes('gloves')) return 'Skins';
  if (typeTag) return typeTag;
  return 'Other';
}

interface InventoryResult {
  items: InventoryItem[];
  steamTotalCount: number;  // What Steam reports as total (includes cooldown items)
  fetchedCount: number;     // How many we actually got back
}

async function fetchFullInventory(steamId64: string): Promise<InventoryResult> {
  const descMap = new Map<string, SteamDescription>();
  const assetCounts = new Map<string, number>();
  let lastAssetId: string | undefined;
  let page = 0;
  let steamTotalCount = 0;

  console.log(`Fetching CS2 inventory for ${steamId64}...`);

  while (true) {
    page++;
    let url = `https://steamcommunity.com/inventory/${steamId64}/730/2?l=english&count=75`;
    if (lastAssetId) url += `&start_assetid=${lastAssetId}`;

    let data: SteamInventoryResponse | null = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const res = await fetch(url);
        if (res.status === 429) {
          const wait = Math.min(30, 5 * (attempt + 1));
          console.log(`  Rate limited, waiting ${wait}s...`);
          await new Promise(r => setTimeout(r, wait * 1000));
          continue;
        }
        if (res.status === 403) throw new Error("Inventory is private!");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json() as SteamInventoryResponse;
        break;
      } catch (e: any) {
        if (e.message?.includes("private")) throw e;
        if (attempt === 3) throw e;
        console.log(`  Retry (${attempt + 1}/4): ${e.message}`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    if (!data || !data.success) throw new Error("Steam API returned unsuccessful response");
    steamTotalCount = data.total_inventory_count;
    console.log(`  Page ${page}: ${data.assets?.length || 0} assets (${steamTotalCount} total)`);

    // Use classid+instanceid as key for counting
    for (const asset of data.assets || []) {
      const key = `${asset.classid}_${asset.instanceid}`;
      assetCounts.set(key, (assetCounts.get(key) || 0) + parseInt(asset.amount, 10));
    }
    for (const desc of data.descriptions || []) {
      const key = `${desc.classid}_${desc.instanceid}`;
      descMap.set(key, desc);
    }

    if (!data.more_items || !data.last_assetid) break;
    lastAssetId = data.last_assetid;
    await new Promise(r => setTimeout(r, 1500));
  }

  const items: InventoryItem[] = [];
  for (const [key, desc] of descMap) {
    const qty = assetCounts.get(key) || 1;
    const tags: Record<string, string> = {};
    for (const t of desc.tags || []) {
      tags[t.category] = t.localized_tag_name;
    }
    items.push({
      name: desc.name,
      market_hash_name: desc.market_hash_name,
      type: desc.type || '',
      category: categorizeItem(desc),
      rarity: tags['Rarity'] || '',
      qty,
      tradable: desc.tradable === 1,
      marketable: desc.marketable === 1,
      iconUrl: desc.icon_url ? `https://community.akamai.steamstatic.com/economy/image/${desc.icon_url}/96x96` : '',
      iconUrlLarge: desc.icon_url_large ? `https://community.akamai.steamstatic.com/economy/image/${desc.icon_url_large}/256x256`
        : desc.icon_url ? `https://community.akamai.steamstatic.com/economy/image/${desc.icon_url}/256x256` : '',
      tags,
    });
  }

  const fetchedCount = items.reduce((s, i) => s + i.qty, 0);
  console.log(`  Total: ${items.length} unique items (${fetchedCount} total)`);
  if (steamTotalCount > fetchedCount) {
    console.log(`  ⚠ Steam reports ${steamTotalCount} items but API only returned ${fetchedCount} — ${steamTotalCount - fetchedCount} items on market/trade cooldown`);
  }
  return { items, steamTotalCount, fetchedCount };
}

// ── Price Fetching ──────────────────────────────────────────────────
// Uses priceoverview API as primary source (accurate, small item count ~28).
// Falls back to search/render for items that fail.
async function fetchPrices(items: InventoryItem[]): Promise<Record<string, { price: number; listings: number }>> {
  const result: Record<string, { price: number; listings: number }> = {};
  const marketable = items.filter(i => i.marketable);
  const needed = new Set(marketable.map(i => i.market_hash_name));

  // Primary: fetch each item via priceoverview (most accurate)
  console.log(`  Fetching ${needed.size} items via priceoverview (accurate)...`);
  let fetched = 0;
  for (const hashName of needed) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=${config.currencyCode}&market_hash_name=${encodeURIComponent(hashName)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json() as any;
          if (data.success && data.lowest_price) {
            const price = parseFloat(data.lowest_price.replace(/[^0-9.]/g, '')) || 0;
            if (price > 0) {
              result[hashName] = { price, listings: 0 };
              fetched++;
              break;
            }
          }
        } else if (res.status === 429) {
          // Rate limited — wait longer and retry
          console.log(`  Rate limited on ${hashName}, waiting 10s...`);
          await new Promise(r => setTimeout(r, 10000));
          continue;
        }
      } catch {}
      if (attempt === 0) await new Promise(r => setTimeout(r, 3000)); // retry delay
    }
    await new Promise(r => setTimeout(r, 2500));
  }
  console.log(`  Priceoverview: ${fetched}/${needed.size} items priced`);

  // Fallback: use search/render for any items that priceoverview missed
  const missing = [...needed].filter(n => !result[n]);
  if (missing.length > 0) {
    console.log(`  Fetching ${missing.length} remaining items via search/render...`);
  }

  // Build search terms — group missing items by shared search queries
  const missingItems = marketable.filter(i => !result[i.market_hash_name]);
  const searchTerms = new Set<string>();
  for (const item of missingItems) {
    const name = item.market_hash_name;
    if (name.includes('|')) {
      const parts = name.split('|');
      const lastPart = parts[parts.length - 1]?.trim();
      if (lastPart) searchTerms.add(lastPart);
    } else {
      searchTerms.add(name);
    }
  }

  if (searchTerms.size === 0) {
    console.log(`  Total prices resolved: ${Object.keys(result).length}/${needed.size}`);
    return result;
  }
  console.log(`  Fetching ${missingItems.length} remaining items via ${searchTerms.size} search queries...`);

  let searchIdx = 0;
  for (const term of searchTerms) {
    // Skip if we already have all items this term could match
    const couldMatch = marketable.filter(i => i.market_hash_name.includes(term) && !result[i.market_hash_name]);
    if (couldMatch.length === 0) {
      searchIdx++;
      continue;
    }

    searchIdx++;
    let start = 0;
    let totalCount = Infinity;
    let pageSize = 10;

    while (start < totalCount) {
      const url = `https://steamcommunity.com/market/search/render/?query=${encodeURIComponent(term)}&appid=730&start=${start}&count=100&norender=1&currency=${config.currencyCode}`;

      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const res = await fetch(url);
          if (res.status === 429) {
            const backoff = Math.min(15000 * Math.pow(2, attempt), 60000);
            console.log(`  [SEARCH] Rate limited on "${term}" (attempt ${attempt + 1}), waiting ${backoff / 1000}s...`);
            await new Promise(r => setTimeout(r, backoff));
            continue;
          }
          if (!res.ok) {
            await new Promise(r => setTimeout(r, 5000));
            break;
          }
          const data = await res.json() as any;
          if (data.total_count !== undefined) totalCount = data.total_count;
          const results = data.results || [];
          if (results.length > 0) pageSize = results.length;
          for (const item of results) {
            if (!item.hash_name || item.sell_price === undefined) continue;
            // Only store items we actually need
            if (needed.has(item.hash_name)) {
              result[item.hash_name] = { price: item.sell_price / 100, listings: item.sell_listings || 0 };
            }
          }
          break;
        } catch (e) {
          console.log(`  [SEARCH] Error for "${term}": ${e}`);
          break;
        }
      }

      start += pageSize;
      if (start < totalCount) {
        await new Promise(r => setTimeout(r, 3000));
      }
      // Only paginate if we're still missing items from this search
      const stillMissing = couldMatch.filter(i => !result[i.market_hash_name]);
      if (stillMissing.length === 0) break;
    }

    if (searchIdx % 5 === 0 || searchIdx === searchTerms.size) {
      console.log(`  [SEARCH] ${searchIdx}/${searchTerms.size} queries done, ${Object.keys(result).length}/${needed.size} prices found`);
    }
    await new Promise(r => setTimeout(r, 3000));
  }

  // Any remaining items — try exact-name search
  const stillMissing = marketable.filter(i => !result[i.market_hash_name]);
  if (stillMissing.length > 0) {
    console.log(`  Searching ${stillMissing.length} remaining items by exact name...`);
    for (const item of stillMissing) {
      const url = `https://steamcommunity.com/market/search/render/?query=${encodeURIComponent(item.market_hash_name)}&appid=730&start=0&count=10&norender=1&currency=${config.currencyCode}`;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json() as any;
          for (const r of data.results || []) {
            if (r.hash_name === item.market_hash_name && r.sell_price !== undefined) {
              result[item.market_hash_name] = { price: r.sell_price / 100, listings: r.sell_listings || 0 };
            }
          }
        }
      } catch {}
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log(`  Total prices resolved: ${Object.keys(result).length}/${needed.size}`);
  return result;
}

// ── Skinport Pricing (for Doppler variants, etc.) ──────────────────────
// Skinport API separates Doppler phases via a "version" field (Ruby, Sapphire, etc.)
// while Steam Market lumps them all under one market_hash_name.
async function fetchSkinportPrices(manualItems: any[]): Promise<Record<string, { price: number; listings: number; itemPage?: string }>> {
  const result: Record<string, { price: number; listings: number; itemPage?: string }> = {};
  const skinportItems = manualItems.filter((mi: any) => mi.skinport);
  if (skinportItems.length === 0) return result;

  console.log(`  Fetching ${skinportItems.length} Skinport-priced items...`);
  try {
    const res = await fetch('https://api.skinport.com/v1/items?app_id=730&currency=AUD', {
      headers: { 'Accept-Encoding': 'br, gzip, deflate' },
    });
    if (!res.ok) {
      console.log(`  Skinport API error: HTTP ${res.status}`);
      return result;
    }
    const data = await res.json() as any[];
    for (const mi of skinportItems) {
      const sp = mi.skinport;
      const match = data.find((item: any) =>
        item.market_hash_name === sp.market_hash_name && item.version === sp.version
      );
      if (match) {
        const price = match.min_price || match.suggested_price || 0;
        result[mi.market_hash_name] = { price, listings: match.quantity || 0, itemPage: match.item_page };
        console.log(`  ✓ ${mi.name || mi.market_hash_name}: ${config.currencySymbol}${price.toFixed(2)} (${match.quantity} listings on Skinport)`);
      } else {
        console.log(`  ✗ ${mi.name || mi.market_hash_name}: not found on Skinport (${sp.market_hash_name} / ${sp.version})`);
      }
    }
  } catch (e: any) {
    console.log(`  Skinport API error: ${e.message}`);
  }
  return result;
}

// ── Budapest Stickers — read aggregate from sticker_price_history.json ──
// Instead of fetching hundreds of sticker prices individually, we read the
// latest total value/cost from tracker.ts's price history (it already does the work)
const STICKER_HISTORY_FILE = `${SCRIPT_DIR}/sticker_price_history.json`;

interface BudapestAggregate { totalValue: number; totalCost: number; totalQty: number; date: string; }

async function loadBudapestAggregate(): Promise<BudapestAggregate | null> {
  try {
    const file = Bun.file(STICKER_HISTORY_FILE);
    if (await file.exists()) {
      const raw = await file.json() as any;
      const entries = raw.entries || [];
      if (entries.length === 0) return null;
      const last = entries[entries.length - 1];
      // Count total stickers from prices object
      const totalQty = Object.values(last.prices || {}).length;
      return { totalValue: last.totalValue || 0, totalCost: last.totalCost || 0, totalQty, date: last.date };
    }
  } catch {}
  return null;
}

function mergeBudapestAsLot(inventory: InventoryItem[], agg: BudapestAggregate, config: TrackerConfig) {
  // Add as a single aggregated line item — price is the total portfolio value
  inventory.push({
    name: `${config.event} Stickers`,
    market_hash_name: `__budapest_sticker_lot__`,
    type: `${config.event} Sticker Collection (${agg.totalQty} stickers)`,
    category: 'Sticker Investments',
    rarity: 'Collection',
    qty: 1,
    tradable: true,
    marketable: false, // Don't try to fetch price — we already have it
    iconUrl: 'https://cdn.csgoskins.gg/public/uih/tournaments/aHR0cHM6Ly9jc2dvc2tpbnMuZ2cvYnVpbGQvYXNzZXRzLzIwMjUtc3RhcmxhZGRlci1idWRhcGVzdC1ESnM3aFlfdi5wbmc-/auto/auto/85/notrim/eec62b9fb416cc1a7052736b519b8499.webp',
    iconUrlLarge: 'https://cdn.csgoskins.gg/public/uih/tournaments/aHR0cHM6Ly9jc2dvc2tpbnMuZ2cvYnVpbGQvYXNzZXRzLzIwMjUtc3RhcmxhZGRlci1idWRhcGVzdC1ESnM3aFlfdi5wbmc-/auto/auto/85/notrim/eec62b9fb416cc1a7052736b519b8499.webp',
    tags: {},
  });
  console.log(`  + ${config.event} stickers as 1 lot: A$${agg.totalValue.toFixed(2)} value, A$${agg.totalCost.toFixed(2)} cost (${agg.totalQty} stickers, data from ${agg.date})`);
}

// ── Exchange Rates ──────────────────────────────────────────────────
interface ExchangeRates {
  audToUsd: number; usdToAud: number; audToEur: number; audToGbp: number;
  btcUsd: number; ethUsd: number; solUsd: number;
}

async function fetchExchangeRates(): Promise<ExchangeRates> {
  const rates: ExchangeRates = { audToUsd: 0.645, usdToAud: 1.55, audToEur: 0.58, audToGbp: 0.50, btcUsd: 0, ethUsd: 0, solUsd: 0 };
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/AUD');
    if (res.ok) {
      const data = await res.json() as any;
      if (data?.rates) {
        rates.audToUsd = data.rates.USD || 0.645;
        rates.usdToAud = 1 / rates.audToUsd;
        rates.audToEur = data.rates.EUR || 0.58;
        rates.audToGbp = data.rates.GBP || 0.50;
      }
    }
  } catch {}
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
    if (res.ok) {
      const data = await res.json() as any;
      rates.btcUsd = data?.bitcoin?.usd || 0;
      rates.ethUsd = data?.ethereum?.usd || 0;
      rates.solUsd = data?.solana?.usd || 0;
    }
  } catch {}
  return rates;
}

// ── History ─────────────────────────────────────────────────────────
interface HistoryEntry {
  date: string;
  totalValue: number;
  totalItems: number;
  categoryValues: Record<string, { count: number; value: number }>;
  itemPrices: Record<string, number>; // market_hash_name → price
}

interface PriceHistory {
  entries: HistoryEntry[];
}

async function loadHistory(): Promise<PriceHistory> {
  try {
    const file = Bun.file(HISTORY_FILE);
    if (await file.exists()) return await file.json();
  } catch {}
  return { entries: [] };
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log("=== CS2 Full Inventory Tracker ===");
  const now = new Date();
  const dateKey = now.toISOString().slice(0, 13).replace('T', '-'); // YYYY-MM-DD-HH

  // 1. Resolve Steam ID
  console.log(`\n1. Resolving Steam ID for "${config.steamProfile.vanityUrl}"...`);
  const steamId64 = await resolveSteamId(config.steamProfile.vanityUrl);
  console.log(`  SteamID64: ${steamId64}`);

  // 2. Fetch full inventory
  console.log("\n2. Fetching inventory...");
  const inventoryResult = await fetchFullInventory(steamId64);
  const inventory = inventoryResult.items;
  const cooldownItems = Math.max(0, inventoryResult.steamTotalCount - inventoryResult.fetchedCount);
  const steamTotalCount = inventoryResult.steamTotalCount;
  const steamFetchedCount = inventoryResult.fetchedCount;

  // 2b. Merge manual items (trade hold, etc.)
  const manualItems = config.portfolio?.manualItems || [];
  for (const mi of manualItems as any[]) {
    const existing = inventory.find(i => i.market_hash_name === mi.market_hash_name);
    if (existing) {
      // Update qty if manual says more
      if (mi.qty > existing.qty) existing.qty = mi.qty;
    } else {
      inventory.push({
        name: mi.name || mi.market_hash_name,
        market_hash_name: mi.market_hash_name,
        type: mi.note || '',
        category: mi.category || 'Other',
        rarity: '',
        qty: mi.qty || 1,
        tradable: false,
        marketable: true,
        iconUrl: mi.icon_url || '',
        iconUrlLarge: mi.icon_url || '',
        tags: {},
      });
      console.log(`  + Manual item: ${mi.qty}x ${mi.market_hash_name} (${mi.note || mi.category})`);
    }
  }

  // 2c. Merge Budapest stickers as single lot (from sticker_price_history.json)
  const budapestAgg = await loadBudapestAggregate();
  if (budapestAgg) {
    mergeBudapestAsLot(inventory, budapestAgg, config);
  }

  // 3. Fetch prices via search/render API
  console.log("\n3. Fetching market prices...");
  const prices = await fetchPrices(inventory);

  // 3b. Fetch Skinport prices for Doppler variants (Ruby, Sapphire, etc.)
  const skinportPrices = await fetchSkinportPrices(manualItems);
  for (const [key, val] of Object.entries(skinportPrices)) {
    prices[key] = val; // Override Steam price with Skinport version-specific price
  }

  // 4. Exchange rates
  console.log("\n4. Fetching exchange rates...");
  const fx = await fetchExchangeRates();

  // 5. Build enriched data
  console.log("\n5. Building portfolio data...");

  const costBasis = config.portfolio?.costBasis || {};
  // Also add Budapest stickers cost basis from main config
  // Budapest stickers: $0.35 each
  const budapestCostPerUnit = config.costPerUnit || 0.35;

  interface EnrichedItem {
    name: string;
    market_hash_name: string;
    category: string;
    rarity: string;
    qty: number;
    tradable: boolean;
    marketable: boolean;
    iconUrl: string;
    iconUrlLarge: string;
    currentPrice: number;     // per unit, AUD
    totalValue: number;       // qty * price
    costEach: number | null;  // known cost basis per unit, or null
    totalCost: number | null; // qty * costEach, or null
    profitLoss: number | null;
    roi: number | null;       // percentage
    marketUrl: string;
    listings: number;
  }

  const enriched: EnrichedItem[] = [];
  let grandValue = 0;
  let grandCost = 0;
  let trackedValue = 0; // Only items with cost basis
  let knownCostItems = 0;

  for (const item of inventory) {
    // Special handling for Budapest sticker lot — use aggregate values directly
    if (item.market_hash_name === '__budapest_sticker_lot__' && budapestAgg) {
      const totalValue = budapestAgg.totalValue;
      const totalCost = budapestAgg.totalCost;
      const profitLoss = totalValue - totalCost;
      const roi = totalCost > 0 ? ((profitLoss) / totalCost) * 100 : null;
      grandValue += totalValue;
      grandCost += totalCost;
      trackedValue += totalValue;
      knownCostItems += budapestAgg.totalQty;
      enriched.push({
        ...item,
        currentPrice: totalValue, // Show total as "price" since qty=1
        totalValue,
        costEach: totalCost,
        totalCost,
        profitLoss,
        roi,
        marketUrl: 'budapest.html',
        listings: 0,
      });
      continue;
    }

    const priceData = prices[item.market_hash_name];
    const currentPrice = priceData?.price || 0;
    const totalValue = currentPrice * item.qty;

    // Determine cost basis
    let costEach: number | null = null;
    const cb = costBasis[item.market_hash_name];
    if (cb) {
      costEach = cb.costEach;
    } else if (item.market_hash_name.includes(config.event) && (item.category === 'Stickers' || item.category === 'Sticker Capsules')) {
      costEach = item.category === 'Sticker Capsules' ? (config as any).capsules?.costEach || budapestCostPerUnit : budapestCostPerUnit;
    }

    const totalCost = costEach !== null ? costEach * item.qty : null;
    const profitLoss = costEach !== null && currentPrice > 0 ? totalValue - totalCost! : null;
    const roi = costEach !== null && costEach > 0 && currentPrice > 0 ? ((currentPrice - costEach) / costEach) * 100 : null;

    if (totalCost !== null) {
      grandCost += totalCost;
      trackedValue += totalValue;
      knownCostItems += item.qty;
    }
    grandValue += totalValue;

    enriched.push({
      ...item,
      currentPrice,
      totalValue,
      costEach,
      totalCost,
      profitLoss,
      roi,
      marketUrl: skinportPrices[item.market_hash_name]?.itemPage
        || (item.marketable ? `https://steamcommunity.com/market/listings/730/${encodeURIComponent(item.market_hash_name)}` : ''),
      listings: priceData?.listings || 0,
    });
  }

  // Sort by total value descending
  enriched.sort((a, b) => b.totalValue - a.totalValue);

  // Category breakdown
  const categories: Record<string, { count: number; value: number; items: EnrichedItem[] }> = {};
  for (const item of enriched) {
    if (!categories[item.category]) categories[item.category] = { count: 0, value: 0, items: [] };
    categories[item.category].count += item.qty;
    categories[item.category].value += item.totalValue;
    categories[item.category].items.push(item);
  }

  // Sort categories by value
  const sortedCategories = Object.entries(categories).sort((a, b) => b[1].value - a[1].value);

  // Top/bottom performers (only items with cost basis)
  const withCost = enriched.filter(i => i.roi !== null && i.currentPrice > 0);
  const topPerformers = [...withCost].sort((a, b) => (b.roi || 0) - (a.roi || 0)).slice(0, 5);
  const bottomPerformers = [...withCost].sort((a, b) => (a.roi || 0) - (b.roi || 0)).slice(0, 5);

  // Most valuable individual items
  const mostValuable = [...enriched].filter(i => i.currentPrice > 0).sort((a, b) => b.totalValue - a.totalValue).slice(0, 10);

  // 6. Save history
  console.log("\n6. Saving history...");
  const history = await loadHistory();

  // Only keep one entry per hour
  const existingIdx = history.entries.findIndex(e => e.date === dateKey);
  const categoryValues: Record<string, { count: number; value: number }> = {};
  for (const [cat, data] of sortedCategories) {
    categoryValues[cat] = { count: data.count, value: data.value };
  }
  const itemPrices: Record<string, number> = {};
  for (const item of enriched) {
    if (item.currentPrice > 0) itemPrices[item.market_hash_name] = item.currentPrice;
  }

  const entry: HistoryEntry = { date: dateKey, totalValue: grandValue, totalItems: enriched.reduce((s, i) => s + i.qty, 0), categoryValues, itemPrices };
  if (existingIdx >= 0) {
    history.entries[existingIdx] = entry;
  } else {
    history.entries.push(entry);
  }
  // Keep last 90 days (~2160 hourly entries max)
  if (history.entries.length > 2160) {
    history.entries = history.entries.slice(-2160);
  }
  await Bun.write(HISTORY_FILE, JSON.stringify(history, null, 2));

  // 7. Compute trends from history
  const prevEntries = history.entries.slice(-48); // last 2 days
  const dayAgoValue = prevEntries.length > 24 ? prevEntries[prevEntries.length - 25]?.totalValue || grandValue : grandValue;
  const dayChange = grandValue - dayAgoValue;
  const dayChangePct = dayAgoValue > 0 ? (dayChange / dayAgoValue) * 100 : 0;

  const weekEntries = history.entries.slice(-168); // last 7 days
  const weekAgoValue = weekEntries.length > 0 ? weekEntries[0].totalValue : grandValue;
  const weekChange = grandValue - weekAgoValue;
  const weekChangePct = weekAgoValue > 0 ? (weekChange / weekAgoValue) * 100 : 0;

  // Value over time for chart
  const chartData = history.entries.slice(-336); // last 14 days

  // 8. Generate HTML
  console.log("\n7. Generating HTML...");

  const totalItems = enriched.reduce((s, i) => s + i.qty, 0);
  const marketableCount = enriched.filter(i => i.marketable && i.currentPrice > 0).reduce((s, i) => s + i.qty, 0);
  const tradableCount = enriched.filter(i => i.tradable).reduce((s, i) => s + i.qty, 0);
  const uniqueItems = enriched.length;
  const grandPL = grandCost > 0 ? trackedValue - grandCost : 0;
  const grandROI = grandCost > 0 ? ((grandPL / grandCost) * 100).toFixed(1) : 'N/A';

  const localTimeStr = now.toLocaleString('en-AU', { timeZone: 'Australia/Perth', dateStyle: 'medium', timeStyle: 'short' });

  // Category colors for charts
  const categoryColors: Record<string, string> = {
    'Cases': '#f59e0b',
    'Stickers': '#8b5cf6',
    'Skins': '#ef4444',
    'Sticker Capsules': '#c084fc',
    'Capsules': '#a78bfa',
    'Keys': '#fbbf24',
    'Graffiti': '#34d399',
    'Patches': '#60a5fa',
    'Agents': '#f97316',
    'Music Kits': '#ec4899',
    'Collectibles': '#fcd34d',
    'Tools': '#9ca3af',
    'Gifts': '#22c55e',
    'Other': '#6b7280',
  };

  function getCatColor(cat: string): string {
    return categoryColors[cat] || '#6b7280';
  }

  function fmtPrice(v: number): string {
    return `${config.currencySymbol}${v.toFixed(2)}`;
  }

  function fmtPct(v: number): string {
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
  }

  function escHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Build category cards HTML
  const categoryCardsHtml = sortedCategories.map(([cat, data]) => {
    const color = getCatColor(cat);
    const pct = grandValue > 0 ? ((data.value / grandValue) * 100).toFixed(1) : '0';
    return `
    <div class="cat-card" style="border-left:3px solid ${color}">
      <div class="cat-card-header">
        <span class="cat-name" style="color:${color}">${escHtml(cat)}</span>
        <span class="cat-count">${data.count} item${data.count !== 1 ? 's' : ''}</span>
      </div>
      <div class="cat-value">${fmtPrice(data.value)}</div>
      <div class="cat-pct">${pct}% of portfolio</div>
    </div>`;
  }).join('\n');

  // Build items table HTML
  const tableRowsHtml = enriched.filter(i => i.currentPrice > 0 || i.totalCost !== null).map((item, idx) => {
    const plClass = item.profitLoss !== null ? (item.profitLoss >= 0 ? 'positive' : 'negative') : 'dimmed';
    const plStr = item.profitLoss !== null ? fmtPrice(Math.abs(item.profitLoss)) : '-';
    const plSign = item.profitLoss !== null ? (item.profitLoss >= 0 ? '+' : '-') : '';
    const roiStr = item.roi !== null ? fmtPct(item.roi) : '-';
    const catColor = getCatColor(item.category);
    return `<tr>
      <td>${idx + 1}</td>
      <td><div class="item-name-cell">${item.iconUrl ? `<img src="${escHtml(item.iconUrl)}" class="item-thumb" loading="lazy">` : ''}<span>${item.marketUrl ? `<a href="${escHtml(item.marketUrl)}" target="_blank">${escHtml(item.name)}</a>` : escHtml(item.name)}</span></div></td>
      <td><span class="cat-badge" style="background:${catColor}22;color:${catColor};border:1px solid ${catColor}44">${escHtml(item.category)}</span></td>
      <td style="text-align:right">${item.qty}</td>
      <td style="text-align:right">${item.currentPrice > 0 ? fmtPrice(item.currentPrice) : '-'}</td>
      <td style="text-align:right;font-weight:600">${item.totalValue > 0 ? fmtPrice(item.totalValue) : '-'}</td>
      <td style="text-align:right">${item.costEach !== null ? fmtPrice(item.costEach) : '-'}</td>
      <td style="text-align:right" class="${plClass}">${plSign}${plStr}</td>
      <td style="text-align:right" class="${plClass}">${roiStr}</td>
      <td style="text-align:right;color:#8f98a0">${item.listings > 0 ? item.listings.toLocaleString() : '-'}</td>
    </tr>`;
  }).join('\n');

  // Top performers HTML
  const topPerfHtml = topPerformers.map(item => `
    <div class="perf-card positive-border">
      ${item.iconUrl ? `<img src="${escHtml(item.iconUrl)}" class="perf-img" loading="lazy">` : ''}
      <div class="perf-name">${escHtml(item.name)}</div>
      <div class="perf-price">${fmtPrice(item.currentPrice)}</div>
      <div class="perf-roi positive">${fmtPct(item.roi!)}</div>
      <div class="perf-sub">${item.qty}x | Cost: ${fmtPrice(item.costEach!)}</div>
    </div>`).join('\n');

  const bottomPerfHtml = bottomPerformers.map(item => `
    <div class="perf-card negative-border">
      ${item.iconUrl ? `<img src="${escHtml(item.iconUrl)}" class="perf-img" loading="lazy">` : ''}
      <div class="perf-name">${escHtml(item.name)}</div>
      <div class="perf-price">${fmtPrice(item.currentPrice)}</div>
      <div class="perf-roi negative">${fmtPct(item.roi!)}</div>
      <div class="perf-sub">${item.qty}x | Cost: ${fmtPrice(item.costEach!)}</div>
    </div>`).join('\n');

  // Most valuable HTML
  const mostValuableHtml = mostValuable.map((item, idx) => `
    <div class="mv-card">
      <div class="mv-rank">#${idx + 1}</div>
      ${item.iconUrl ? `<img src="${escHtml(item.iconUrl)}" class="mv-img" loading="lazy">` : ''}
      <div class="mv-name">${escHtml(item.name)}</div>
      <div class="mv-price">${fmtPrice(item.totalValue)}</div>
      <div class="mv-sub">${item.qty}x @ ${fmtPrice(item.currentPrice)} | ${escHtml(item.category)}</div>
    </div>`).join('\n');

  // Chart data
  const chartLabels = chartData.map(e => {
    const parts = e.date.split('-');
    return `${parts[1]}/${parts[2]} ${parts[3]}:00`;
  });
  const chartValues = chartData.map(e => e.totalValue);
  const chartCostLine = grandCost > 0 ? chartData.map(() => grandCost) : null;

  // Category allocation data for pie chart
  const pieLabels = sortedCategories.map(([cat]) => cat);
  const pieValues = sortedCategories.map(([, data]) => data.value);
  const pieColors = sortedCategories.map(([cat]) => getCatColor(cat));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CS2 Portfolio — ${escHtml(config.steamProfile.displayName)}</title>
<link rel="icon" href="https://community.akamai.steamstatic.com/public/shared/images/header/logo_steam.svg">
<meta property="og:title" content="CS2 Portfolio — ${escHtml(config.steamProfile.displayName)}">
<meta property="og:description" content="Full Steam CS2 inventory portfolio tracker — ${totalItems} items worth ${fmtPrice(grandValue)} AUD">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', 'Motiva Sans', Arial, Helvetica, sans-serif; background: #1b2838; color: #c6d4df; padding: 0; min-height: 100vh; padding-top: 48px; }
  ::selection { background: rgba(102,192,244,0.3); }
  .page-content { max-width: 1200px; margin: 0 auto; padding: 20px 24px 40px; }
  a { color: #67c1f5; text-decoration: none; font-weight: 500; transition: color 0.2s; }
  a:hover { color: #fff; }

  /* Sticky Nav */
  .sticky-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: #171a21; border-bottom: 1px solid #0e1a26; padding: 0 24px; display: flex; align-items: center; gap: 0; height: 48px; }
  .sticky-nav a { color: #b8b6b4; font-size: 12px; font-weight: 600; text-decoration: none; padding: 14px 12px; transition: color 0.2s, background 0.2s; border-bottom: 2px solid transparent; white-space: nowrap; }
  .sticky-nav a:hover, .sticky-nav a.active { color: #fff; background: rgba(255,255,255,0.05); }
  .sticky-nav .nav-highlight { color: #67c1f5; border-right: 1px solid #2a475e; padding-right: 16px; margin-right: 4px; }

  /* Steam Header */
  .steam-header { background: linear-gradient(180deg, #2a475e 0%, #1b2838 100%); border-bottom: 1px solid #0e1a26; padding: 20px 0; }
  .steam-header-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
  .steam-avatar { width: 72px; height: 72px; border-radius: 4px; border: 2px solid #66c0f4; }
  .steam-profile-info { flex: 1; min-width: 200px; }
  .steam-profile-name { font-size: 24px; font-weight: 700; color: #fff; }
  .steam-profile-name a { color: #fff; text-decoration: none; }
  .steam-profile-name a:hover { color: #66c0f4; }
  .steam-profile-sub { font-size: 12px; color: #8f98a0; margin-top: 2px; }
  .steam-profile-sub a { color: #66c0f4; }
  .steam-profile-links { display: flex; gap: 10px; flex-wrap: wrap; }
  .steam-link-btn { background: rgba(103,193,245,0.1); border: 1px solid rgba(103,193,245,0.3); color: #67c1f5; padding: 6px 14px; border-radius: 2px; font-size: 11px; font-weight: 600; text-decoration: none; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.5px; }
  .steam-link-btn:hover { background: rgba(103,193,245,0.2); color: #fff; }
  .steam-link-btn.btn-accent { background: linear-gradient(to right, #47bfff 5%, #1a44c2 60%); background-position: 25%; background-size: 330% 100%; border: none; color: #fff; }
  .steam-link-btn.btn-accent:hover { background-position: 0%; }

  /* Summary Cards */
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 24px; }
  .card { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 16px 18px; position: relative; overflow: hidden; transition: background 0.2s; }
  .card:hover { background: rgba(103,193,245,0.05); }
  .card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(102,192,244,0.1), transparent); }
  .card-label { color: #8f98a0; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
  .card-value { font-size: 24px; font-weight: 700; margin-top: 6px; letter-spacing: -0.5px; }
  .card-sub { font-size: 11px; color: #8f98a0; margin-top: 4px; font-weight: 500; }
  .positive { color: #5ba32b; }
  .negative { color: #c33c3c; }
  .neutral { color: #66c0f4; }
  .dimmed { color: #8f98a0; }

  /* Section headers */
  h3 { color: #fff; margin: 32px 0 14px; font-size: 16px; font-weight: 600; letter-spacing: -0.2px; display: flex; align-items: center; gap: 8px; }
  h3::before { content: ''; display: inline-block; width: 3px; height: 16px; background: #66c0f4; border-radius: 2px; }

  /* Category cards */
  .cat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 24px; }
  .cat-card { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 14px 16px; transition: background 0.2s; }
  .cat-card:hover { background: rgba(103,193,245,0.05); }
  .cat-card-header { display: flex; justify-content: space-between; align-items: center; }
  .cat-name { font-size: 13px; font-weight: 700; }
  .cat-count { font-size: 11px; color: #8f98a0; }
  .cat-value { font-size: 22px; font-weight: 700; color: #fff; margin-top: 6px; }
  .cat-pct { font-size: 11px; color: #8f98a0; margin-top: 2px; }

  /* Charts */
  .chart-container { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 20px; margin-bottom: 24px; }
  .chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  @media (max-width: 900px) { .chart-row { grid-template-columns: 1fr; } }
  .chart-box { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 20px; }
  canvas { width: 100% !important; max-height: 300px; }

  /* Performer cards */
  .perf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-bottom: 24px; }
  .perf-card { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 14px; text-align: center; transition: background 0.2s; }
  .perf-card:hover { background: rgba(103,193,245,0.05); }
  .perf-card.positive-border { border-left: 3px solid #5ba32b; }
  .perf-card.negative-border { border-left: 3px solid #c33c3c; }
  .perf-img { width: 64px; height: 64px; margin: 4px auto; display: block; border-radius: 2px; }
  .perf-name { font-size: 13px; font-weight: 600; color: #fff; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .perf-price { font-size: 18px; font-weight: 700; margin-top: 2px; }
  .perf-roi { font-size: 12px; font-weight: 700; margin-top: 2px; }
  .perf-sub { font-size: 10px; color: #8f98a0; margin-top: 2px; }

  /* Most valuable */
  .mv-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 24px; }
  .mv-card { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 14px; text-align: center; position: relative; overflow: hidden; transition: background 0.2s; }
  .mv-card:hover { background: rgba(103,193,245,0.05); transform: translateY(-1px); }
  .mv-rank { position: absolute; top: 8px; left: 10px; font-size: 16px; font-weight: 800; color: rgba(102,192,244,0.3); }
  .mv-img { width: 80px; height: 80px; margin: 4px auto; display: block; border-radius: 2px; }
  .mv-name { font-size: 13px; font-weight: 600; color: #fff; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mv-price { font-size: 20px; font-weight: 700; color: #66c0f4; margin-top: 4px; }
  .mv-sub { font-size: 10px; color: #8f98a0; margin-top: 2px; }

  /* Full table */
  table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
  thead { position: sticky; top: 48px; z-index: 50; }
  h3[id] { scroll-margin-top: 60px; }
  table { scroll-margin-top: 60px; }
  th { background: #1a3a52; box-shadow: 0 1px 0 #0e1a26; color: #8f98a0; padding: 8px 8px; text-align: left; border-bottom: 1px solid #0e1a26; cursor: pointer; user-select: none; white-space: nowrap; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; transition: color 0.2s; }
  th:hover { color: #66c0f4; }
  td { padding: 7px 8px; border-bottom: 1px solid rgba(0,0,0,0.15); font-variant-numeric: tabular-nums; }
  tbody tr { transition: background 0.15s; }
  tbody tr:nth-child(even) { background: rgba(0,0,0,0.1); }
  tbody tr:hover { background: rgba(103,193,245,0.05); }

  .item-name-cell { display: flex; align-items: center; gap: 6px; }
  .item-thumb { width: 32px; height: 32px; border-radius: 2px; }
  .cat-badge { display: inline-block; padding: 2px 8px; border-radius: 2px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px; white-space: nowrap; }

  /* Filter bar */
  .filter-bar { margin-bottom: 12px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .filter-bar input, .filter-bar select { background: rgba(0,0,0,0.3); border: 1px solid #2a475e; color: #c6d4df; padding: 8px 12px; border-radius: 2px; font-size: 13px; font-family: inherit; transition: border-color 0.2s; outline: none; }
  .filter-bar input { width: 300px; }
  .filter-bar input:focus, .filter-bar select:focus { border-color: #66c0f4; }

  /* FX bar */
  .fx-bar { background: #0e1a26; border-bottom: 1px solid #1b2838; padding: 4px 24px; display: flex; align-items: center; gap: 16px; font-size: 11px; color: #8f98a0; flex-wrap: wrap; }

  /* Scroll to top */
  .scroll-top { position: fixed; bottom: 30px; right: 30px; width: 40px; height: 40px; border-radius: 2px; background: rgba(103,193,245,0.15); border: 1px solid rgba(103,193,245,0.3); color: #67c1f5; font-size: 18px; cursor: pointer; display: none; align-items: center; justify-content: center; z-index: 999; transition: opacity 0.3s, background 0.2s; }
  .scroll-top:hover { background: rgba(103,193,245,0.25); color: #fff; }
  .scroll-top.visible { display: flex; }

  /* Footer */
  .footer { margin-top: 40px; padding: 20px; text-align: center; border-top: 1px solid rgba(0,0,0,0.3); background: rgba(0,0,0,0.15); }
  .footer p { color: #8f98a0; font-size: 12px; margin: 4px 0; }
  .footer a { color: #67c1f5; }

  /* Responsive */
  @media (max-width: 800px) {
    .summary { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
    .cat-grid { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
    .filter-bar input { width: 100%; }
  }
</style>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
</head>
<body>

<nav class="sticky-nav" id="stickyNav">
  <a href="#summary-section" class="nav-highlight">Portfolio</a>
  <a href="#categories-section">Categories</a>
  <a href="#charts-section">Charts</a>
  <a href="#highlights-section">Highlights</a>
  <a href="#items-section">All Items</a>
  <a href="budapest.html" style="color:#8b5cf6;margin-left:auto;">Budapest 2025 Stickers &rarr;</a>
</nav>

<div class="fx-bar">
  <span style="color:#67c1f5;font-weight:600;">FX:</span>
  <span>1 AUD = <span style="color:#fff">${fx.audToUsd.toFixed(4)}</span> USD</span>
  <span>1 AUD = <span style="color:#fff">${fx.audToEur.toFixed(4)}</span> EUR</span>
  <span>1 AUD = <span style="color:#fff">${fx.audToGbp.toFixed(4)}</span> GBP</span>
  ${fx.btcUsd > 0 ? `<span style="color:#2a475e">|</span><span style="color:#f59e0b;font-weight:600;">Crypto:</span>
  <span>BTC = <span style="color:#f7931a">$${fx.btcUsd.toLocaleString()}</span></span>
  <span>ETH = <span style="color:#627eea">$${fx.ethUsd.toLocaleString()}</span></span>
  <span>SOL = <span style="color:#9945ff">$${fx.solUsd.toLocaleString()}</span></span>` : ''}
  <span style="color:#2a475e">|</span>
  <span>Portfolio: <span style="color:#fff">$${(grandValue * fx.audToUsd).toFixed(2)}</span> USD</span>
</div>

<div class="steam-header">
  <div class="steam-header-inner">
    <a href="https://steamcommunity.com/id/${config.steamProfile.vanityUrl}" target="_blank"><img class="steam-avatar" src="${escHtml(config.steamProfile.avatarUrl)}" alt="${escHtml(config.steamProfile.displayName)}"></a>
    <div class="steam-profile-info">
      <div class="steam-profile-name"><a href="https://steamcommunity.com/id/${config.steamProfile.vanityUrl}" target="_blank">${escHtml(config.steamProfile.displayName)}</a></div>
      <div class="steam-profile-sub">CS2 Portfolio &mdash; ${totalItems} items &mdash; Last updated: <span style="color:#acb2b8">${localTimeStr} AWST</span></div>
    </div>
    <div class="steam-profile-links">
      <a class="steam-link-btn" href="https://steamcommunity.com/id/${config.steamProfile.vanityUrl}/inventory/#730" target="_blank">Steam Inventory</a>
      <a class="steam-link-btn btn-accent" href="budapest.html">Budapest 2025 Stickers</a>
    </div>
  </div>
</div>

<!-- Create Your Own Tracker Banner -->
<div id="createBanner" style="background:linear-gradient(135deg,#1a2a3a 0%,#1b2838 100%);border:1px solid #2a475e;border-radius:0;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
  <div style="flex:1;min-width:200px;">
    <div style="color:#fff;font-weight:600;font-size:15px;margin-bottom:4px;">Track Your Own CS2 Portfolio</div>
    <div style="color:#8f98a0;font-size:13px;">Fork this project, import your Steam inventory, and deploy your own tracker in under 5 minutes.</div>
  </div>
  <div style="display:flex;gap:8px;align-items:center;">
    <a href="https://github.com/${config.steamProfile.vanityUrl}/cs2inventorytracker#create-your-own-tracker" target="_blank" style="background:linear-gradient(135deg,#1a9fff,#0d6efd);color:#fff;padding:8px 20px;border-radius:3px;font-weight:600;font-size:13px;text-decoration:none;white-space:nowrap;border:none;">Create Your Own</a>
    <button onclick="document.getElementById('createBanner').style.display='none';localStorage.setItem('hidePortfolioBanner','1')" style="background:none;border:none;color:#555;font-size:18px;cursor:pointer;padding:4px 8px;line-height:1;" title="Dismiss">&times;</button>
  </div>
</div>
<script>if(localStorage.getItem('hidePortfolioBanner')==='1')document.getElementById('createBanner').style.display='none';</script>

<div class="page-content">

<!-- Summary Section -->
<div id="summary-section"></div>
<div class="summary">
  <div class="card">
    <div class="card-label">Total Value</div>
    <div class="card-value neutral">${fmtPrice(grandValue)}</div>
    <div class="card-sub">~$${(grandValue * fx.audToUsd).toFixed(2)} USD</div>
  </div>
  <div class="card">
    <div class="card-label">Total Items</div>
    <div class="card-value" style="color:#fff">${totalItems}</div>
    <div class="card-sub">${uniqueItems} unique${cooldownItems > 0 ? ` + ${cooldownItems} on cooldown` : ''}</div>
  </div>
  ${grandCost > 0 ? `<div class="card">
    <div class="card-label">Total Invested</div>
    <div class="card-value dimmed">${fmtPrice(grandCost)}</div>
    <div class="card-sub">${knownCostItems} items with cost basis</div>
  </div>
  <div class="card">
    <div class="card-label">Profit / Loss</div>
    <div class="card-value ${grandPL >= 0 ? 'positive' : 'negative'}">${grandPL >= 0 ? '+' : ''}${fmtPrice(grandPL)}</div>
    <div class="card-sub">ROI: ${grandROI}%</div>
  </div>` : ''}
  <div class="card">
    <div class="card-label">24h Change</div>
    <div class="card-value ${dayChange >= 0 ? 'positive' : 'negative'}">${dayChange >= 0 ? '+' : ''}${fmtPrice(dayChange)}</div>
    <div class="card-sub">${fmtPct(dayChangePct)}</div>
  </div>
  <div class="card">
    <div class="card-label">7d Change</div>
    <div class="card-value ${weekChange >= 0 ? 'positive' : 'negative'}">${weekChange >= 0 ? '+' : ''}${fmtPrice(weekChange)}</div>
    <div class="card-sub">${fmtPct(weekChangePct)}</div>
  </div>
  <div class="card">
    <div class="card-label">Marketable</div>
    <div class="card-value" style="color:#fff">${marketableCount}</div>
    <div class="card-sub">${tradableCount} tradable</div>
  </div>
  <div class="card">
    <div class="card-label">Categories</div>
    <div class="card-value" style="color:#fff">${sortedCategories.length}</div>
    <div class="card-sub">${sortedCategories[0]?.[0] || '-'} is largest</div>
  </div>
</div>

${cooldownItems > 0 ? `
<!-- Cooldown Items Notice -->
<div style="background:linear-gradient(135deg,#1a2a3a 0%,#1b2838 100%);border:1px solid #f59e0b44;border-radius:0;padding:12px 20px;display:flex;align-items:center;gap:12px;margin-top:0;">
  <span style="font-size:20px;">&#9203;</span>
  <div>
    <div style="color:#f59e0b;font-weight:600;font-size:14px;">${cooldownItems} items on market/trade cooldown</div>
    <div style="color:#8f98a0;font-size:12px;margin-top:2px;">Steam reports ${steamTotalCount} total items but only ${steamFetchedCount} are visible via the public API. Items on market/trade cooldown will appear automatically once their hold expires.</div>
  </div>
</div>
` : ''}

<!-- Sub-page links -->
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:32px;">
  <a href="budapest.html" style="display:block;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:4px;padding:18px 22px;text-decoration:none;transition:all 0.2s;">
    <div style="font-size:16px;font-weight:700;color:#8b5cf6;margin-bottom:4px;">Budapest 2025 Sticker Tracker &rarr;</div>
    <div style="font-size:12px;color:#8f98a0;">Detailed sticker-by-sticker analysis with price history, quality tiers, leaderboards, predictions, and investment signals</div>
  </a>
</div>

<!-- Category Breakdown -->
<div id="categories-section"></div>
<h3>Category Breakdown</h3>
<div class="cat-grid">
${categoryCardsHtml}
</div>

<!-- Charts -->
<div id="charts-section"></div>
<h3>Portfolio Value Over Time</h3>
<div class="chart-container">
  <canvas id="valueChart"></canvas>
</div>

<div class="chart-row">
  <div class="chart-box">
    <h3 style="margin-top:0">Portfolio Allocation</h3>
    <canvas id="allocationChart"></canvas>
  </div>
  <div class="chart-box">
    <h3 style="margin-top:0">Category Values</h3>
    <canvas id="categoryBarChart"></canvas>
  </div>
</div>

<!-- Highlights -->
<div id="highlights-section"></div>
${mostValuable.length > 0 ? `<h3>Most Valuable Holdings</h3>
<div class="mv-grid">
${mostValuableHtml}
</div>` : ''}

${topPerformers.length > 0 ? `<h3>Best Performers</h3>
<div class="perf-grid">
${topPerfHtml}
</div>` : ''}

${bottomPerformers.length > 0 ? `<h3>Worst Performers</h3>
<div class="perf-grid">
${bottomPerfHtml}
</div>` : ''}

<!-- Full Item Table -->
<div id="items-section"></div>
<h3>All Items (${enriched.filter(i => i.currentPrice > 0 || i.totalCost !== null).length})</h3>
<div class="filter-bar">
  <input type="text" id="searchInput" placeholder="Search items..." oninput="filterTable()">
  <select id="categoryFilter" onchange="filterTable()">
    <option value="">All Categories</option>
    ${sortedCategories.map(([cat]) => `<option value="${escHtml(cat)}">${escHtml(cat)}</option>`).join('\n')}
  </select>
</div>
<div style="overflow-x:auto;">
<table id="itemsTable">
  <thead>
    <tr>
      <th onclick="sortTable(0)">#</th>
      <th onclick="sortTable(1)">Item</th>
      <th onclick="sortTable(2)">Category</th>
      <th onclick="sortTable(3)" style="text-align:right">Qty</th>
      <th onclick="sortTable(4)" style="text-align:right">Price</th>
      <th onclick="sortTable(5)" style="text-align:right">Value</th>
      <th onclick="sortTable(6)" style="text-align:right">Cost</th>
      <th onclick="sortTable(7)" style="text-align:right">P/L</th>
      <th onclick="sortTable(8)" style="text-align:right">ROI</th>
      <th onclick="sortTable(9)" style="text-align:right">Listings</th>
    </tr>
  </thead>
  <tbody>
${tableRowsHtml}
  </tbody>
</table>
</div>

<div class="footer">
  <p style="color:#555;font-size:11px;">Prices from Steam Community Market in AUD. Updated every 15 minutes via GitHub Actions.</p>
  <p style="color:#555;font-size:10px;">This is not financial advice.</p>
</div>

</div><!-- .page-content -->

<button class="scroll-top" id="scrollTop" onclick="window.scrollTo({top:0,behavior:'smooth'})">&#9650;</button>

<script>
// Scroll to top button
window.addEventListener('scroll', () => {
  document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
});

// Sticky nav active state
const sections = document.querySelectorAll('[id$="-section"]');
const navLinks = document.querySelectorAll('.sticky-nav a[href^="#"]');
window.addEventListener('scroll', () => {
  let current = '';
  for (const sec of sections) {
    if (sec.getBoundingClientRect().top <= 100) current = sec.id;
  }
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});

// Table sorting
let sortCol = -1, sortAsc = true;
function sortTable(col) {
  const table = document.getElementById('itemsTable');
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  if (sortCol === col) { sortAsc = !sortAsc; } else { sortCol = col; sortAsc = col <= 2 ? true : false; }
  rows.sort((a, b) => {
    let va = a.cells[col]?.textContent?.trim() || '';
    let vb = b.cells[col]?.textContent?.trim() || '';
    // Numeric sort for columns 3+
    if (col >= 3) {
      const na = parseFloat(va.replace(/[^0-9.-]/g, '')) || 0;
      const nb = parseFloat(vb.replace(/[^0-9.-]/g, '')) || 0;
      return sortAsc ? na - nb : nb - na;
    }
    return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
  });
  for (const row of rows) tbody.appendChild(row);
}

// Table filtering
function filterTable() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const rows = document.querySelectorAll('#itemsTable tbody tr');
  rows.forEach(row => {
    const name = row.cells[1]?.textContent?.toLowerCase() || '';
    const rowCat = row.cells[2]?.textContent?.trim() || '';
    const matchSearch = !search || name.includes(search);
    const matchCat = !cat || rowCat === cat;
    row.style.display = matchSearch && matchCat ? '' : 'none';
  });
}

// Charts
document.addEventListener('DOMContentLoaded', () => {
  // Portfolio value line chart
  ${chartData.length > 1 ? `new Chart(document.getElementById('valueChart'), {
    type: 'line',
    data: {
      labels: ${JSON.stringify(chartLabels)},
      datasets: [
        { label: 'Portfolio Value (AUD)', data: ${JSON.stringify(chartValues)}, borderColor: '#66c0f4', backgroundColor: 'rgba(102,192,244,0.08)', fill: true, tension: 0.3, pointRadius: 0 },
        ${chartCostLine ? `{ label: 'Cost Basis', data: ${JSON.stringify(chartCostLine)}, borderColor: '#c33c3c', borderDash: [5,3], pointRadius: 0, fill: false },` : ''}
      ]
    },
    options: { responsive: true, plugins: { legend: { labels: { color: '#888' } } }, scales: { x: { ticks: { color: '#666', maxTicksLimit: 10 }, grid: { color: '#111' } }, y: { ticks: { color: '#888', callback: v => '$' + v.toFixed(2) }, grid: { color: '#111' } } } }
  });` : `document.getElementById('valueChart').parentElement.innerHTML = '<p style="color:#8f98a0;text-align:center;padding:40px;">Not enough data yet — chart will appear after multiple price snapshots.</p>';`}

  // Allocation donut
  new Chart(document.getElementById('allocationChart'), {
    type: 'doughnut',
    data: {
      labels: ${JSON.stringify(pieLabels)},
      datasets: [{ data: ${JSON.stringify(pieValues)}, backgroundColor: ${JSON.stringify(pieColors)}, borderColor: '#1b2838', borderWidth: 2 }]
    },
    options: { responsive: true, plugins: { legend: { position: 'right', labels: { color: '#888', font: { size: 11 } } } } }
  });

  // Category bar chart
  new Chart(document.getElementById('categoryBarChart'), {
    type: 'bar',
    data: {
      labels: ${JSON.stringify(pieLabels)},
      datasets: [{ label: 'Value (AUD)', data: ${JSON.stringify(pieValues)}, backgroundColor: ${JSON.stringify(pieColors.map(c => c + '88'))}, borderColor: ${JSON.stringify(pieColors)}, borderWidth: 1 }]
    },
    options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#888', callback: v => '$' + v }, grid: { color: '#111' } }, y: { ticks: { color: '#ccc' }, grid: { display: false } } } }
  });

  // Local time display
  const now = new Date();
  const timeEl = document.getElementById('localTime');
  if (timeEl) timeEl.textContent = now.toLocaleString();
});
</script>

</body>
</html>`;

  await Bun.write(HTML_FILE, html);

  console.log(`\n========================================`);
  console.log(`DONE — ${localTimeStr}`);
  console.log(`========================================`);
  console.log(`Items: ${totalItems} (${uniqueItems} unique) | Value: A$${grandValue.toFixed(2)} | Categories: ${sortedCategories.length}`);
  if (grandCost > 0) console.log(`Invested: A$${grandCost.toFixed(2)} | P/L: A$${grandPL.toFixed(2)} (${grandROI}%)`);
  console.log(`Prices resolved: ${Object.keys(prices).length}/${inventory.filter(i => i.marketable).length} marketable`);
  console.log(`\nFiles updated:`);
  console.log(`  ${HTML_FILE}`);
  console.log(`  ${HISTORY_FILE}`);
}

main().catch(console.error);
