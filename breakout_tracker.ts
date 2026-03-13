// Operation Breakout Weapon Case Tracker
// Monitors 19 cases for price appreciation and investment performance

const SCRIPT_DIR = import.meta.dir;
const HISTORY_FILE = `${SCRIPT_DIR}/breakout_price_history.json`;
const HTML_FILE = `${SCRIPT_DIR}/breakout.html`;
const CSV_FILE = `${SCRIPT_DIR}/breakout_cases_inventory.csv`;

const DELAY_MS = 2000;
const CURRENCY_AUD = 21;

// Inventory: 19 Operation Breakout cases
const inventory = {
  name: "Operation Breakout Weapon Case",
  hashName: "Operation Breakout Weapon Case",
  qty: 19,
  costPerUnit: 3.00, // AUD (historical cost basis, ~$1.95 USD in 2018)
  totalCost: 57.00,
};

interface HistoryEntry {
  date: string;
  price: number;
  volume: number;
  totalValue: number;
  totalCost: number;
  roi: string;
  profitLoss: number;
  listings: number;
}

interface HistoryData {
  entries: HistoryEntry[];
}

async function loadHistory(): Promise<HistoryData> {
  try {
    const f = Bun.file(HISTORY_FILE);
    if (await f.exists()) return await f.json();
  } catch {}
  return { entries: [] };
}

function getMarketUrl(hashName: string): string {
  return `https://steamcommunity.com/market/listings/730/${encodeURIComponent(hashName)}`;
}

async function fetchPrice(hashName: string): Promise<{ price: number; volume: number; listings: number }> {
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=${CURRENCY_AUD}&market_hash_name=${encodeURIComponent(hashName)}`;
      const res = await fetch(url);
      if (res.status === 429) {
        console.log(`Rate limited, waiting 15s...`);
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }
      const data = await res.json() as any;

      let volume = 0;
      if (data.volume) {
        const volStr = data.volume.toString().replace(/,/g, '');
        volume = parseInt(volStr, 10);
      }

      if (data.lowest_price) {
        // Parse price like "A$27.50"
        const priceStr = data.lowest_price.replace(/[^0-9.]/g, '');
        const price = parseFloat(priceStr);

        // Fetch listings from search API
        let listings = 0;
        try {
          const searchUrl = `https://steamcommunity.com/market/search/render/?appid=730&norender=1&count=1&start=0&search_descriptions=0&sort_column=name&sort_dir=asc&q=${encodeURIComponent(hashName)}`;
          const searchRes = await fetch(searchUrl);
          if (searchRes.ok) {
            const searchData = await searchRes.json() as any;
            if (searchData.results?.[0]) {
              listings = searchData.results[0].sell_listings || 0;
            }
          }
        } catch {}

        return { price, volume, listings };
      }
      if (attempt < 2) await new Promise(r => setTimeout(r, 5000));
    } catch (e) {
      console.log(`Fetch error (attempt ${attempt + 1}): ${e}`);
      if (attempt < 2) await new Promise(r => setTimeout(r, 5000));
    }
  }
  return { price: 0, volume: 0, listings: 0 };
}

async function main() {
  try {
    console.log('=== Operation Breakout Case Tracker ===');
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}`;
    const todayFull = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} UTC`;

    const history = await loadHistory();
    const existingToday = history.entries.find(e => e.date === today);

    if (existingToday) {
      console.log(`Already have prices for ${today}. Skipping fetch, rebuilding HTML...`);
    } else {
      console.log(`Fetching current price for Operation Breakout Weapon Case...`);
      const result = await fetchPrice(inventory.hashName);
      const totalValue = result.price * inventory.qty;
      const pl = totalValue - inventory.totalCost;
      const roi = ((pl / inventory.totalCost) * 100).toFixed(1);

      console.log(`Price: A$${result.price.toFixed(2)} | Value: A$${totalValue.toFixed(2)} | P/L: A$${pl.toFixed(2)} (${roi}%)`);
      console.log(`Market Volume: ${result.volume} | Sell Listings: ${result.listings}`);

      history.entries.push({
        date: today,
        price: result.price,
        volume: result.volume,
        listings: result.listings,
        totalValue,
        totalCost: inventory.totalCost,
        roi,
        profitLoss: pl,
      });

      await Bun.write(HISTORY_FILE, JSON.stringify(history, null, 2));
    }

    // Use today's or last known data
    const todayEntry = existingToday || history.entries[history.entries.length - 1];
    const currentPrice = todayEntry?.price || 0;
    const currentValue = currentPrice * inventory.qty;
    const pl = currentValue - inventory.totalCost;
    const roi = ((pl / inventory.totalCost) * 100).toFixed(1);

    // Build portfolio history for chart
    const portfolioHistory = history.entries.map(e => ({ date: e.date, value: e.totalValue }));

    // All-time high/low
    let ath = currentPrice, athDate = todayEntry?.date || today;
    let atl = currentPrice > 0 ? currentPrice : Infinity, atlDate = todayEntry?.date || today;
    for (const entry of history.entries) {
      if (entry.price > ath) { ath = entry.price; athDate = entry.date; }
      if (entry.price > 0 && entry.price < atl) { atl = entry.price; atlDate = entry.date; }
    }
    if (atl === Infinity) { atl = 0; atlDate = '-'; }

    // CSV update
    const csvOut = `Case Name,Condition,Qty,Cost Per Unit (AUD),Total Cost (AUD),Current Price (AUD),Total Value (AUD),Profit/Loss (AUD),ROI %,Steam Market Link,Last Updated
Operation Breakout Weapon Case,Factory New,${inventory.qty},${inventory.costPerUnit.toFixed(2)},${inventory.totalCost.toFixed(2)},${currentPrice.toFixed(2)},${currentValue.toFixed(2)},${pl.toFixed(2)},${roi}%,${getMarketUrl(inventory.hashName)},${todayFull}
`;
    await Bun.write(CSV_FILE, csvOut);

    // HTML output
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Operation Breakout Case Tracker</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='50' font-size='50'>📦</text></svg>">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', Arial, sans-serif; background: #1b2838; color: #c6d4df; padding: 20px; min-height: 100vh; }
  .container { max-width: 1000px; margin: 0 auto; }
  h1 { color: #fff; font-size: 32px; margin-bottom: 8px; }
  .subtitle { color: #8f98a0; font-size: 14px; margin-bottom: 24px; }

  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .card { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 16px; }
  .card-label { color: #8f98a0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px; }
  .card-value { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
  .card-sub { color: #8f98a0; font-size: 12px; }

  .positive { color: #5ba32b; }
  .negative { color: #c33c3c; }
  .neutral { color: #66c0f4; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #1a3a52; color: #8f98a0; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #0e1a26; }
  td { padding: 10px; border-bottom: 1px solid rgba(0,0,0,0.2); }

  .timeline { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 16px; margin-bottom: 24px; }
  .timeline-item { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.2); }
  .timeline-item:last-child { border-bottom: none; }
  .timeline-date { color: #8f98a0; font-size: 12px; min-width: 120px; }
  .timeline-data { flex: 1; }
  .timeline-price { font-weight: 700; }

  h2 { color: #fff; font-size: 18px; margin-top: 32px; margin-bottom: 12px; border-bottom: 1px solid rgba(0,0,0,0.3); padding-bottom: 8px; }

  .footer { text-align: center; color: #8f98a0; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.3); }
  a { color: #67c1f5; text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="container">
  <h1>📦 Operation Breakout Case Tracker</h1>
  <p class="subtitle">Tracking investment performance of 19 Operation Breakout Weapon Cases | Updated ${todayFull}</p>

  <div class="summary">
    <div class="card">
      <div class="card-label">Current Price (AUD)</div>
      <div class="card-value neutral">$${currentPrice.toFixed(2)}</div>
      <div class="card-sub">per case</div>
    </div>
    <div class="card">
      <div class="card-label">Portfolio Value</div>
      <div class="card-value ${currentValue >= inventory.totalCost ? 'positive' : 'negative'}">$${currentValue.toFixed(2)}</div>
      <div class="card-sub">${inventory.qty} cases × $${currentPrice.toFixed(2)}</div>
    </div>
    <div class="card">
      <div class="card-label">Profit/Loss</div>
      <div class="card-value ${pl >= 0 ? 'positive' : 'negative'}">$${pl >= 0 ? '+' : ''}${pl.toFixed(2)}</div>
      <div class="card-sub">${roi}% ROI</div>
    </div>
    <div class="card">
      <div class="card-label">All-Time High</div>
      <div class="card-value positive">$${ath.toFixed(2)}</div>
      <div class="card-sub">${athDate}</div>
    </div>
    <div class="card">
      <div class="card-label">All-Time Low</div>
      <div class="card-value">$${atl.toFixed(2)}</div>
      <div class="card-sub">${atlDate}</div>
    </div>
    <div class="card">
      <div class="card-label">Snapshots</div>
      <div class="card-value neutral">${history.entries.length}</div>
      <div class="card-sub">price updates recorded</div>
    </div>
  </div>

  <h2>Investment Summary</h2>
  <table>
    <thead>
      <tr>
        <th>Case Name</th>
        <th>Qty</th>
        <th>Cost/Unit</th>
        <th>Total Invested</th>
        <th>Current Price</th>
        <th>Portfolio Value</th>
        <th>Profit/Loss</th>
        <th>ROI</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><a href="${getMarketUrl(inventory.hashName)}" target="_blank">${inventory.name}</a></td>
        <td>${inventory.qty}</td>
        <td>$${inventory.costPerUnit.toFixed(2)}</td>
        <td>$${inventory.totalCost.toFixed(2)}</td>
        <td>$${currentPrice.toFixed(2)}</td>
        <td class="${currentValue >= inventory.totalCost ? 'positive' : 'negative'}">$${currentValue.toFixed(2)}</td>
        <td class="${pl >= 0 ? 'positive' : 'negative'}">${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}</td>
        <td class="${roi > '0' ? 'positive' : 'negative'}">${roi}%</td>
      </tr>
    </tbody>
  </table>

  ${portfolioHistory.length > 1 ? '<h2>Price History</h2><div class="timeline">' + history.entries.slice().reverse().map(entry => `
    <div class="timeline-item">
      <div class="timeline-date">${entry.date}</div>
      <div class="timeline-data">
        <span class="timeline-price">$${entry.price.toFixed(2)}</span>
        <span style="color: #8f98a0; font-size: 12px;"> • Vol: ${entry.volume} • Listings: ${entry.listings}</span>
      </div>
    </div>
  `).join('') + '</div>' : '<p style="color: #8f98a0;">Run again on a different day to start tracking price history.</p>'}

  <h2>Investment Analysis</h2>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th>Value</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Cost Basis (Total)</td>
        <td>$${inventory.totalCost.toFixed(2)}</td>
        <td>Based on estimated $3 AUD per case from 2018</td>
      </tr>
      <tr>
        <td>Current Value</td>
        <td class="positive">$${currentValue.toFixed(2)}</td>
        <td>\${inventory.qty} cases × $\${currentPrice.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Unrealized P/L</td>
        <td class="${pl >= 0 ? 'positive' : 'negative'}">${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}</td>
        <td>${roi}% ROI</td>
      </tr>
      <tr>
        <td>Break-Even Price</td>
        <td>$${(inventory.totalCost / inventory.qty).toFixed(2)}</td>
        <td>Already exceeded 10x profit margin</td>
      </tr>
      <tr>
        <td>Days Held (approx)</td>
        <td>${Math.floor((Date.now() - new Date("2018-01-02").getTime()) / 86400000)}</td>
        <td>Since case discontinuation (Jan 2018)</td>
      </tr>
    </tbody>
  </table>

  <h2>Sell Recommendations</h2>
  <div style="background: rgba(0,0,0,0.2); border-left: 3px solid #66c0f4; border-radius: 0 4px 4px 0; padding: 16px; margin-bottom: 24px;">
    <p><strong>Conservative Strategy:</strong> Old cases show steady 10-20% annual appreciation. Consider taking profits gradually, especially if price spikes.</p>
    <p><strong>Target Price Points:</strong></p>
    <ul style="margin-left: 20px; color: #8f98a0; font-size: 13px;">
      <li>🎯 $35-40 AUD: Sell 30-40% (take early profits, lock in gains)</li>
      <li>🎯 $50+ AUD: Sell remaining position (exceptional market conditions)</li>
      <li>📅 Best Time: November-December (holiday season) or major game updates</li>
    </ul>
  </div>

  <div class="footer">
    <p>Operation Breakout Case Tracker • Last updated ${todayFull}</p>
    <p><a href="https://oldm8clint.github.io/budapest2025/">← Back to Budapest 2025 Tracker</a></p>
  </div>
</div>

<script>
  // Auto-refresh every 30 minutes
  setTimeout(() => location.reload(), 30 * 60 * 1000);
</script>
</body>
</html>`;

    console.log(`Writing HTML...`);
    await Bun.write(HTML_FILE, html);
    console.log(`\n========================================`);
    console.log(`DONE - ${todayFull}`);
    console.log(`========================================`);
    console.log(`Portfolio: ${inventory.qty} cases | Cost: $${inventory.totalCost.toFixed(2)} | Value: $${currentValue.toFixed(2)} | P/L: $${pl.toFixed(2)} (${roi}%)`);
    console.log(`Current Price: $${currentPrice.toFixed(2)} | Snapshots: ${history.entries.length}`);

  } catch (err) {
    console.error('ERROR:', err);
    console.error('Stack:', (err instanceof Error) ? err.stack : 'N/A');
    process.exit(1);
  }
}

main();
