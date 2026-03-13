// Budapest 2025 Sticker Price Tracker
// Fetches fresh prices, saves history, builds HTML with trends
// Runs via GitHub Actions daily — deploys to GitHub Pages

const SCRIPT_DIR = import.meta.dir;
const HISTORY_FILE = `${SCRIPT_DIR}/sticker_price_history.json`;
const HTML_FILE = `${SCRIPT_DIR}/index.html`;
const CSV_FILE = `${SCRIPT_DIR}/budapest2025_stickers.csv`;
const DELAY_MS = 1800;
const CURRENCY_AUD = 21;

// ── Sticker inventory ──────────────────────────────────────────────
interface StickerEntry { name: string; quality: string; qty: number; }

const stickers: StickerEntry[] = [
  { name: "910", quality: "Embroidered", qty: 1 },
  { name: "910", quality: "Normal", qty: 8 },
  { name: "AW", quality: "Embroidered", qty: 1 },
  { name: "AW", quality: "Normal", qty: 11 },
  { name: "Attacker", quality: "Normal", qty: 1 },
  { name: "Aleksib", quality: "Normal", qty: 1 },
  { name: "Astralis", quality: "Normal", qty: 4 },
  { name: "Aurora", quality: "Holo", qty: 1 },
  { name: "Aurora", quality: "Normal", qty: 1 },
  { name: "B8", quality: "Normal", qty: 4 },
  { name: "BELCHONOKK", quality: "Normal", qty: 5 },
  { name: "Bart4k", quality: "Embroidered", qty: 1 },
  { name: "Bart4k", quality: "Normal", qty: 6 },
  { name: "Brollan", quality: "Embroidered", qty: 1 },
  { name: "Brollan", quality: "Normal", qty: 11 },
  { name: "C4LLM3SU3", quality: "Gold", qty: 1 },
  { name: "C4LLM3SU3", quality: "Holo", qty: 1 },
  { name: "C4LLM3SU3", quality: "Normal", qty: 6 },
  { name: "ChildKing", quality: "Embroidered", qty: 1 },
  { name: "ChildKing", quality: "Normal", qty: 3 },
  { name: "Cypher", quality: "Normal", qty: 9 },
  { name: "EliGE", quality: "Normal", qty: 1 },
  { name: "EmiliaQAQ", quality: "Embroidered", qty: 1 },
  { name: "EmiliaQAQ", quality: "Normal", qty: 5 },
  { name: "Ex3rcice", quality: "Holo", qty: 1 },
  { name: "Ex3rcice", quality: "Normal", qty: 2 },
  { name: "FURIA", quality: "Normal", qty: 4 },
  { name: "FaZe Clan", quality: "Normal", qty: 1 },
  { name: "Falcons", quality: "Embroidered", qty: 1 },
  { name: "Falcons", quality: "Normal", qty: 4 },
  { name: "FalleN", quality: "Embroidered", qty: 2 },
  { name: "FalleN", quality: "Normal", qty: 7 },
  { name: "FlameZ", quality: "Normal (Champion)", qty: 8 },
  { name: "FlameZ", quality: "Embroidered", qty: 2 },
  { name: "FlameZ", quality: "Holo", qty: 1 },
  { name: "FlameZ", quality: "Normal", qty: 6 },
  { name: "Fluxo", quality: "Normal", qty: 2 },
  { name: "G2 esports", quality: "Gold", qty: 1 },
  { name: "G2 esports", quality: "Embroidered", qty: 2 },
  { name: "G2 esports", quality: "Normal", qty: 5 },
  { name: "GamerLegion", quality: "Normal", qty: 1 },
  { name: "Graviti", quality: "Embroidered", qty: 1 },
  { name: "Graviti", quality: "Normal", qty: 2 },
  { name: "Heavygod", quality: "Embroidered", qty: 2 },
  { name: "Heavygod", quality: "Normal", qty: 5 },
  { name: "HexT", quality: "Embroidered", qty: 3 },
  { name: "HexT", quality: "Normal", qty: 3 },
  { name: "History", quality: "Embroidered", qty: 1 },
  { name: "History", quality: "Normal", qty: 5 },
  { name: "HooXi", quality: "Normal", qty: 2 },
  { name: "HooXi", quality: "Gold", qty: 1 },
  { name: "INS", quality: "Embroidered", qty: 1 },
  { name: "INS", quality: "Normal", qty: 4 },
  { name: "JT", quality: "Normal", qty: 3 },
  { name: "JamYoung", quality: "Normal", qty: 5 },
  { name: "JamYoung", quality: "Embroidered", qty: 1 },
  { name: "Jame", quality: "Embroidered", qty: 2 },
  { name: "Jame", quality: "Normal", qty: 4 },
  { name: "Jee", quality: "Embroidered", qty: 1 },
  { name: "Jee", quality: "Normal", qty: 2 },
  { name: "Jimpphat", quality: "Normal", qty: 1 },
  { name: "KRIMZ", quality: "Embroidered", qty: 1 },
  { name: "KRIMZ", quality: "Normal", qty: 4 },
  { name: "KSCERATO", quality: "Holo", qty: 1 },
  { name: "KSCERATO", quality: "Normal", qty: 5 },
  { name: "Kursy", quality: "Normal", qty: 3 },
  { name: "Kvem", quality: "Embroidered", qty: 1 },
  { name: "Kvem", quality: "Normal", qty: 1 },
  { name: "L1haNg", quality: "Embroidered", qty: 1 },
  { name: "L1haNg", quality: "Normal", qty: 4 },
  { name: "Lake", quality: "Normal", qty: 5 },
  { name: "Legacy", quality: "Normal", qty: 1 },
  { name: "Lucaozy", quality: "Normal", qty: 6 },
  { name: "Lucky", quality: "Embroidered", qty: 2 },
  { name: "Lucky", quality: "Gold", qty: 1 },
  { name: "Lynn Vision", quality: "Normal", qty: 2 },
  { name: "MAJ3R", quality: "Normal", qty: 2 },
  { name: "MATYS", quality: "Embroidered", qty: 2 },
  { name: "MATYS", quality: "Normal", qty: 10 },
  { name: "MIBR", quality: "Embroidered", qty: 2 },
  { name: "MIBR", quality: "Holo", qty: 1 },
  { name: "MIBR", quality: "Normal", qty: 3 },
  { name: "MOUZ", quality: "Embroidered", qty: 1 },
  { name: "MOUZ", quality: "Normal", qty: 1 },
  { name: "Magisk", quality: "Normal", qty: 4 },
  { name: "Maka", quality: "Normal", qty: 1 },
  { name: "Marek", quality: "Normal", qty: 6 },
  { name: "Mercury", quality: "Normal", qty: 4 },
  { name: "Moseyuh", quality: "Normal", qty: 1 },
  { name: "NAF", quality: "Embroidered", qty: 2 },
  { name: "NAF", quality: "Normal", qty: 3 },
  { name: "NQZ", quality: "Embroidered", qty: 1 },
  { name: "NQZ", quality: "Normal", qty: 7 },
  { name: "NRG", quality: "Normal", qty: 1 },
  { name: "Natus Vincere", quality: "Normal", qty: 1 },
  { name: "NertZ", quality: "Normal", qty: 5 },
  { name: "NiKo", quality: "Embroidered", qty: 3 },
  { name: "NiKo", quality: "Normal", qty: 11 },
  { name: "Ninjas in Pyjamas", quality: "Normal", qty: 2 },
  { name: "PR", quality: "Embroidered", qty: 1 },
  { name: "PR", quality: "Normal", qty: 6 },
  { name: "Passion UA", quality: "Embroidered", qty: 2 },
  { name: "Passion UA", quality: "Normal", qty: 2 },
  { name: "RED Canids", quality: "Normal", qty: 1 },
  { name: "REZ", quality: "Normal", qty: 5 },
  { name: "Rare Atom", quality: "Normal", qty: 2 },
  { name: "Senzu", quality: "Embroidered", qty: 5 },
  { name: "Senzu", quality: "Holo", qty: 1 },
  { name: "Senzu", quality: "Normal", qty: 12 },
  { name: "Snappi", quality: "Normal", qty: 4 },
  { name: "Sonic", quality: "Normal", qty: 5 },
  { name: "Spinx", quality: "Embroidered", qty: 4 },
  { name: "Spinx", quality: "Normal", qty: 7 },
  { name: "Staehr", quality: "Normal", qty: 4 },
  { name: "StarLadder", quality: "Embroidered", qty: 2 },
  { name: "StarLadder", quality: "Normal", qty: 1 },
  { name: "Starry", quality: "Holo", qty: 1 },
  { name: "Starry", quality: "Normal", qty: 6 },
  { name: "Summer", quality: "Embroidered", qty: 1 },
  { name: "Summer", quality: "Normal", qty: 3 },
  { name: "SunPayus", quality: "Embroidered", qty: 2 },
  { name: "SunPayus", quality: "Normal", qty: 10 },
  { name: "Swisher", quality: "Embroidered", qty: 2 },
  { name: "Swisher", quality: "Normal", qty: 6 },
  { name: "TRY", quality: "Embroidered", qty: 2 },
  { name: "TRY", quality: "Normal", qty: 3 },
  { name: "TYLOO", quality: "Embroidered", qty: 1 },
  { name: "TYLOO", quality: "Normal", qty: 1 },
  { name: "Tauson", quality: "Embroidered", qty: 1 },
  { name: "Tauson", quality: "Holo", qty: 1 },
  { name: "Tauson", quality: "Normal", qty: 6 },
  { name: "TeSeS", quality: "Embroidered", qty: 4 },
  { name: "TeSeS", quality: "Holo", qty: 2 },
  { name: "TeSeS", quality: "Normal", qty: 11 },
  { name: "Team Liquid", quality: "Normal", qty: 1 },
  { name: "Team Spirit", quality: "Embroidered", qty: 1 },
  { name: "Team Spirit", quality: "Normal", qty: 3 },
  { name: "Techno4K", quality: "Embroidered", qty: 3 },
  { name: "Techno4K", quality: "Normal", qty: 10 },
  { name: "The Huns", quality: "Normal", qty: 1 },
  { name: "The Mongolz", quality: "Normal", qty: 5 },
  { name: "Tiger", quality: "Normal", qty: 5 },
  { name: "VINI", quality: "Normal", qty: 4 },
  { name: "Vitality", quality: "Embroidered", qty: 1 },
  { name: "Vitality", quality: "Normal", qty: 1 },
  { name: "Wicadia", quality: "Embroidered", qty: 1 },
  { name: "Wicadia", quality: "Normal", qty: 5 },
  { name: "XANTARES", quality: "Normal", qty: 3 },
  { name: "XotiC", quality: "Embroidered", qty: 1 },
  { name: "XotiC", quality: "Holo", qty: 1 },
  { name: "XotiC", quality: "Normal", qty: 7 },
  { name: "YEKINDAR", quality: "Embroidered", qty: 6 },
  { name: "YEKINDAR", quality: "Normal", qty: 4 },
  { name: "ZywOo", quality: "Normal (Champion)", qty: 6 },
  { name: "ZywOo", quality: "Embroidered (Champion)", qty: 1 },
  { name: "ZywOo", quality: "Embroidered", qty: 4 },
  { name: "ZywOo", quality: "Normal", qty: 6 },
  { name: "alex666", quality: "Normal", qty: 5 },
  { name: "apEX", quality: "Normal (Champion)", qty: 12 },
  { name: "apEX", quality: "Embroidered (Champion)", qty: 1 },
  { name: "apEX", quality: "Holo (Champion)", qty: 1 },
  { name: "apEX", quality: "Embroidered", qty: 1 },
  { name: "apEX", quality: "Normal", qty: 2 },
  { name: "arT", quality: "Gold", qty: 1 },
  { name: "arT", quality: "Holo", qty: 1 },
  { name: "arT", quality: "Normal", qty: 4 },
  { name: "b1t", quality: "Normal", qty: 2 },
  { name: "bLitz", quality: "Embroidered", qty: 4 },
  { name: "bLitz", quality: "Normal", qty: 8 },
  { name: "bLitz", quality: "Gold", qty: 1 },
  { name: "biguzera", quality: "Holo", qty: 1 },
  { name: "biguzera", quality: "Normal", qty: 5 },
  { name: "blameF", quality: "Embroidered", qty: 1 },
  { name: "blameF", quality: "Normal", qty: 4 },
  { name: "bodyy", quality: "Normal", qty: 3 },
  { name: "br0", quality: "Embroidered", qty: 1 },
  { name: "br0", quality: "Normal", qty: 6 },
  { name: "brnz4n", quality: "Normal", qty: 1 },
  { name: "broky", quality: "Holo", qty: 1 },
  { name: "broky", quality: "Normal", qty: 2 },
  { name: "chayJESUS", quality: "Embroidered", qty: 2 },
  { name: "chayJESUS", quality: "Normal", qty: 5 },
  { name: "chelo", quality: "Embroidered", qty: 1 },
  { name: "chelo", quality: "Normal", qty: 3 },
  { name: "chopper", quality: "Embroidered", qty: 1 },
  { name: "chopper", quality: "Normal", qty: 5 },
  { name: "cobra", quality: "Embroidered", qty: 2 },
  { name: "cobra", quality: "Normal", qty: 6 },
  { name: "dav1deuS", quality: "Embroidered", qty: 4 },
  { name: "dav1deuS", quality: "Normal", qty: 10 },
  { name: "decenty", quality: "Embroidered", qty: 4 },
  { name: "decenty", quality: "Normal", qty: 4 },
  { name: "device", quality: "Embroidered", qty: 1 },
  { name: "device", quality: "Normal", qty: 4 },
  { name: "dgt", quality: "Embroidered", qty: 1 },
  { name: "dgt", quality: "Normal", qty: 4 },
  { name: "donk", quality: "Embroidered", qty: 1 },
  { name: "donk", quality: "Normal", qty: 5 },
  { name: "drop", quality: "Embroidered", qty: 4 },
  { name: "drop", quality: "Normal", qty: 4 },
  { name: "dumau", quality: "Normal", qty: 3 },
  { name: "esenthial", quality: "Embroidered", qty: 1 },
  { name: "esenthial", quality: "Normal", qty: 6 },
  { name: "ewjerkz", quality: "Embroidered", qty: 1 },
  { name: "ewjerkz", quality: "Normal", qty: 7 },
  { name: "exit", quality: "Normal", qty: 2 },
  { name: "fEAR", quality: "Embroidered", qty: 1 },
  { name: "fEAR", quality: "Holo", qty: 1 },
  { name: "fEAR", quality: "Normal", qty: 6 },
  { name: "fnatic", quality: "Normal", qty: 2 },
  { name: "frozen", quality: "Normal", qty: 9 },
  { name: "hallzerk", quality: "Embroidered", qty: 1 },
  { name: "hallzerk", quality: "Normal", qty: 6 },
  { name: "headtr1ck", quality: "Embroidered", qty: 1 },
  { name: "headtr1ck", quality: "Normal", qty: 5 },
  { name: "huNter-", quality: "Embroidered", qty: 1 },
  { name: "huNter-", quality: "Normal", qty: 9 },
  { name: "iM", quality: "Embroidered", qty: 2 },
  { name: "iM", quality: "Normal", qty: 1 },
  { name: "jabbi", quality: "Normal", qty: 1 },
  { name: "jambo", quality: "Embroidered", qty: 1 },
  { name: "jambo", quality: "Normal", qty: 3 },
  { name: "jcobbb", quality: "Embroidered", qty: 1 },
  { name: "jcobbb", quality: "Holo", qty: 1 },
  { name: "jcobbb", quality: "Normal", qty: 5 },
  { name: "jeorge", quality: "Normal", qty: 3 },
  { name: "jks", quality: "Normal", qty: 3 },
  { name: "jottAAA", quality: "Holo", qty: 1 },
  { name: "jottAAA", quality: "Normal", qty: 3 },
  { name: "karrigan", quality: "Embroidered", qty: 1 },
  { name: "karrigan", quality: "Normal", qty: 3 },
  { name: "kauez", quality: "Embroidered", qty: 1 },
  { name: "kauez", quality: "Normal", qty: 1 },
  { name: "kensizor", quality: "Normal", qty: 4 },
  { name: "kl1m", quality: "Embroidered", qty: 1 },
  { name: "kl1m", quality: "Normal", qty: 3 },
  { name: "kye", quality: "Embroidered", qty: 1 },
  { name: "kye", quality: "Normal", qty: 5 },
  { name: "kyousuke", quality: "Embroidered", qty: 1 },
  { name: "kyousuke", quality: "Holo", qty: 1 },
  { name: "kyousuke", quality: "Normal", qty: 10 },
  { name: "kyxsan", quality: "Embroidered", qty: 1 },
  { name: "kyxsan", quality: "Normal", qty: 8 },
  { name: "latto", quality: "Embroidered", qty: 3 },
  { name: "latto", quality: "Normal", qty: 4 },
  { name: "lux", quality: "Gold", qty: 1 },
  { name: "lux", quality: "Embroidered", qty: 2 },
  { name: "lux", quality: "Normal", qty: 3 },
  { name: "m0NESY", quality: "Embroidered", qty: 1 },
  { name: "m0NESY", quality: "Holo", qty: 1 },
  { name: "m0NESY", quality: "Normal", qty: 9 },
  { name: "malbsMd", quality: "Normal", qty: 5 },
  { name: "mezii", quality: "Normal (Champion)", qty: 5 },
  { name: "mezii", quality: "Embroidered", qty: 3 },
  { name: "mezii", quality: "Normal", qty: 7 },
  { name: "molodoy", quality: "Embroidered", qty: 2 },
  { name: "molodoy", quality: "Normal", qty: 10 },
  { name: "mzinho", quality: "Embroidered", qty: 1 },
  { name: "mzinho", quality: "Normal", qty: 7 },
  { name: "n1ssim", quality: "Embroidered", qty: 1 },
  { name: "n1ssim", quality: "Holo", qty: 1 },
  { name: "n1ssim", quality: "Normal", qty: 4 },
  { name: "nettik", quality: "Embroidered", qty: 2 },
  { name: "nettik", quality: "Normal", qty: 2 },
  { name: "nicx", quality: "Normal", qty: 3 },
  { name: "nin9", quality: "Embroidered", qty: 1 },
  { name: "nin9", quality: "Holo", qty: 1 },
  { name: "nin9", quality: "Normal", qty: 4 },
  { name: "nitr0", quality: "Embroidered", qty: 2 },
  { name: "nitr0", quality: "Normal", qty: 3 },
  { name: "nota", quality: "Embroidered", qty: 1 },
  { name: "nota", quality: "Normal", qty: 8 },
  { name: "noway", quality: "Embroidered", qty: 1 },
  { name: "noway", quality: "Normal", qty: 6 },
  { name: "npl", quality: "Embroidered", qty: 2 },
  { name: "npl", quality: "Normal", qty: 3 },
  { name: "paiN Gaming", quality: "Normal", qty: 7 },
  { name: "qikert", quality: "Normal", qty: 3 },
  { name: "r1nkle", quality: "Normal", qty: 7 },
  { name: "rain", quality: "Holo", qty: 1 },
  { name: "rain", quality: "Normal", qty: 3 },
  { name: "regali", quality: "Normal", qty: 7 },
  { name: "ropz", quality: "Normal (Champion)", qty: 4 },
  { name: "ropz", quality: "Embroidered (Champion)", qty: 1 },
  { name: "ropz", quality: "Holo (Champion)", qty: 1 },
  { name: "ropz", quality: "Embroidered", qty: 2 },
  { name: "ropz", quality: "Normal", qty: 12 },
  { name: "s1n", quality: "Embroidered", qty: 1 },
  { name: "s1n", quality: "Normal", qty: 6 },
  { name: "saadzin", quality: "Normal", qty: 2 },
  { name: "sh1ro", quality: "Embroidered", qty: 2 },
  { name: "sh1ro", quality: "Normal", qty: 11 },
  { name: "siuhy", quality: "Embroidered", qty: 1 },
  { name: "siuhy", quality: "Normal", qty: 3 },
  { name: "sjuush", quality: "Embroidered", qty: 1 },
  { name: "sjuush", quality: "Normal", qty: 5 },
  { name: "sk0R", quality: "Embroidered", qty: 1 },
  { name: "sk0R", quality: "Holo", qty: 1 },
  { name: "sk0R", quality: "Normal", qty: 10 },
  { name: "skullz", quality: "Embroidered", qty: 1 },
  { name: "skullz", quality: "Normal", qty: 4 },
  { name: "slaxz-", quality: "Embroidered", qty: 1 },
  { name: "slaxz-", quality: "Normal", qty: 4 },
  { name: "snow", quality: "Gold", qty: 1 },
  { name: "snow", quality: "Embroidered", qty: 2 },
  { name: "snow", quality: "Normal", qty: 12 },
  { name: "torzsi", quality: "Embroidered", qty: 3 },
  { name: "torzsi", quality: "Normal", qty: 7 },
  { name: "ultimate", quality: "Normal", qty: 3 },
  { name: "venomzera", quality: "Embroidered", qty: 3 },
  { name: "venomzera", quality: "Normal", qty: 5 },
  { name: "vexite", quality: "Normal", qty: 2 },
  { name: "w0nderful", quality: "Embroidered", qty: 2 },
  { name: "w0nderful", quality: "Normal", qty: 5 },
  { name: "westmelon", quality: "Embroidered", qty: 1 },
  { name: "westmelon", quality: "Holo", qty: 1 },
  { name: "westmelon", quality: "Normal", qty: 5 },
  { name: "woxic", quality: "Embroidered", qty: 1 },
  { name: "woxic", quality: "Normal", qty: 3 },
  { name: "xKacpersky", quality: "Embroidered", qty: 3 },
  { name: "xKacpersky", quality: "Normal", qty: 3 },
  { name: "xerolte", quality: "Embroidered", qty: 1 },
  { name: "xerolte", quality: "Normal", qty: 2 },
  { name: "xertioN", quality: "Gold", qty: 1 },
  { name: "xertioN", quality: "Embroidered", qty: 5 },
  { name: "xertioN", quality: "Holo", qty: 1 },
  { name: "xertioN", quality: "Normal", qty: 7 },
  { name: "xiELO", quality: "Normal", qty: 4 },
  { name: "yuurih", quality: "Embroidered", qty: 1 },
  { name: "yuurih", quality: "Normal", qty: 9 },
  { name: "z4KR", quality: "Embroidered", qty: 1 },
  { name: "z4KR", quality: "Normal", qty: 5 },
  { name: "zevy", quality: "Embroidered", qty: 1 },
  { name: "zevy", quality: "Normal", qty: 2 },
  { name: "zont1x", quality: "Normal", qty: 13 },
  { name: "ztr", quality: "Embroidered", qty: 4 },
  { name: "ztr", quality: "Normal", qty: 8 },
  { name: "zweih", quality: "Embroidered", qty: 2 },
  { name: "zweih", quality: "Normal", qty: 12 },
];

// ── Helpers ─────────────────────────────────────────────────────────
function getMarketHashName(name: string, quality: string): string {
  const q: Record<string, string> = {
    "Normal": "", "Embroidered": " (Embroidered)", "Gold": " (Gold)", "Holo": " (Holo)",
    "Normal (Champion)": " (Champion)", "Embroidered (Champion)": " (Embroidered, Champion)",
    "Holo (Champion)": " (Holo, Champion)",
  };
  return `Sticker | ${name}${q[quality] || ""} | Budapest 2025`;
}

function getMarketUrl(hashName: string): string {
  return `https://steamcommunity.com/market/listings/730/${encodeURIComponent(hashName)}`;
}

function parsePrice(s: string): number {
  const m = s.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function stickerKey(name: string, quality: string): string {
  return `${name}|||${quality}`;
}

// ── History ─────────────────────────────────────────────────────────
interface HistoryEntry {
  date: string;
  prices: Record<string, number>;
  totalValue: number;
  totalCost: number;
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

// ── Fetch prices ────────────────────────────────────────────────────
async function fetchPrice(hashName: string, retries = 2): Promise<number> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=${CURRENCY_AUD}&market_hash_name=${encodeURIComponent(hashName)}`;
      const res = await fetch(url);
      if (res.status === 429) {
        console.log(`  Rate limited, waiting 15s...`);
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }
      const data = await res.json() as any;
      if (data.lowest_price) return parsePrice(data.lowest_price);
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
  return 0;
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const history = await loadHistory();

  // Check if we already have today's data
  const existingToday = history.entries.find(e => e.date === today);
  if (existingToday) {
    console.log(`Already have prices for ${today}. Skipping fetch, rebuilding HTML...`);
  }

  const prices: Record<string, number> = {};

  if (!existingToday) {
    console.log(`Fetching prices for ${stickers.length} stickers...`);
    console.log(`Estimated time: ~${Math.ceil(stickers.length * DELAY_MS / 60000)} minutes\n`);

    for (let i = 0; i < stickers.length; i++) {
      const s = stickers[i];
      const hashName = getMarketHashName(s.name, s.quality);
      const key = stickerKey(s.name, s.quality);

      process.stdout.write(`[${i + 1}/${stickers.length}] ${hashName}...`);
      const price = await fetchPrice(hashName);
      prices[key] = price;

      if (price === 0) {
        console.log(` FAILED`);
      } else {
        console.log(` A$${price.toFixed(2)}`);
      }

      if (i < stickers.length - 1) {
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }

    // For any failures, try to use last known price
    const lastEntry = history.entries[history.entries.length - 1];
    for (const s of stickers) {
      const key = stickerKey(s.name, s.quality);
      if (prices[key] === 0 && lastEntry?.prices[key]) {
        prices[key] = lastEntry.prices[key];
        console.log(`Using last known price for ${s.name} ${s.quality}: A$${prices[key].toFixed(2)}`);
      }
    }

    // Calculate totals
    let totalValue = 0;
    const totalCost = stickers.reduce((a, s) => a + s.qty * 0.35, 0);
    for (const s of stickers) {
      totalValue += s.qty * (prices[stickerKey(s.name, s.quality)] || 0);
    }

    // Save to history
    history.entries.push({ date: today, prices, totalValue, totalCost });
    await Bun.write(HISTORY_FILE, JSON.stringify(history, null, 2));
    console.log(`\nSaved price snapshot for ${today}`);
  }

  // Use today's prices (either just fetched or from history)
  const todayEntry = existingToday || history.entries[history.entries.length - 1];
  const currentPrices = todayEntry.prices;

  // ── Build data rows ───────────────────────────────────────────────
  interface Row {
    name: string; quality: string; qty: number; costPerUnit: number;
    totalCost: number; currentPrice: number; totalValue: number;
    profitLoss: number; roi: string; marketUrl: string; hashName: string;
    priceHistory: { date: string; price: number }[];
  }

  const data: Row[] = [];
  let grandQty = 0, grandCost = 0, grandValue = 0;

  for (const s of stickers) {
    const key = stickerKey(s.name, s.quality);
    const hashName = getMarketHashName(s.name, s.quality);
    const price = currentPrices[key] || 0;
    const totalCost = s.qty * 0.35;
    const totalValue = s.qty * price;
    const pl = totalValue - totalCost;
    const roi = totalCost > 0 ? ((pl / totalCost) * 100).toFixed(1) : "0";

    // Build price history for this sticker
    const ph: { date: string; price: number }[] = [];
    for (const entry of history.entries) {
      if (entry.prices[key] !== undefined) {
        ph.push({ date: entry.date, price: entry.prices[key] });
      }
    }

    data.push({
      name: s.name, quality: s.quality, qty: s.qty, costPerUnit: 0.35,
      totalCost, currentPrice: price, totalValue, profitLoss: pl,
      roi: roi + '%', marketUrl: getMarketUrl(hashName), hashName, priceHistory: ph,
    });

    grandQty += s.qty;
    grandCost += totalCost;
    grandValue += totalValue;
  }

  const grandPL = grandValue - grandCost;
  const grandROI = ((grandPL / grandCost) * 100).toFixed(1);

  // Quality totals
  const qualityTotals: Record<string, { qty: number; cost: number; value: number }> = {};
  for (const r of data) {
    if (!qualityTotals[r.quality]) qualityTotals[r.quality] = { qty: 0, cost: 0, value: 0 };
    qualityTotals[r.quality].qty += r.qty;
    qualityTotals[r.quality].cost += r.totalCost;
    qualityTotals[r.quality].value += r.totalValue;
  }

  const top20 = [...data].sort((a, b) => b.totalValue - a.totalValue).slice(0, 20);
  const bottom10 = [...data].filter(r => r.currentPrice > 0).sort((a, b) => parseFloat(a.roi) - parseFloat(b.roi)).slice(0, 10);

  // Extra metrics
  const avgStickerValue = grandValue / grandQty;
  const breakEvenPct = Math.min((grandValue / grandCost) * 100, 999);
  const profitableCount = data.filter(r => r.currentPrice >= 0.35).length;
  const unprofitableCount = data.filter(r => r.currentPrice > 0 && r.currentPrice < 0.35).length;
  const bestPerformer = [...data].filter(r => r.currentPrice > 0).sort((a, b) => b.currentPrice - a.currentPrice)[0];
  const worstPerformer = [...data].filter(r => r.currentPrice > 0).sort((a, b) => a.currentPrice - b.currentPrice)[0];

  // Time to ROI estimate (need 2+ snapshots)
  let roiEstimate = '';
  if (history.entries.length >= 2) {
    const first = history.entries[0];
    const last = history.entries[history.entries.length - 1];
    const daysBetween = (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000;
    if (daysBetween > 0) {
      const dailyChange = (last.totalValue - first.totalValue) / daysBetween;
      if (dailyChange > 0 && grandPL < 0) {
        const daysToBreakEven = Math.ceil(Math.abs(grandPL) / dailyChange);
        roiEstimate = `~${daysToBreakEven} days`;
      } else if (grandPL >= 0) {
        roiEstimate = 'Achieved!';
      } else {
        roiEstimate = 'Declining';
      }
    } else {
      roiEstimate = 'Need more data';
    }
  } else {
    // With 1 snapshot, estimate based on typical major sticker appreciation
    if (grandPL >= 0) {
      roiEstimate = 'Achieved!';
    } else {
      roiEstimate = 'Need more snapshots';
    }
  }

  // Per-sticker time to ROI
  function stickerROIEstimate(r: Row): string {
    if (r.currentPrice >= 0.35) return 'Profitable';
    if (r.currentPrice === 0) return 'No data';
    if (r.priceHistory.length >= 2) {
      const first = r.priceHistory[0];
      const last = r.priceHistory[r.priceHistory.length - 1];
      const days = (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86400000;
      if (days > 0) {
        const daily = (last.price - first.price) / days;
        if (daily > 0) return `~${Math.ceil((0.35 - r.currentPrice) / daily)}d`;
        return 'Declining';
      }
    }
    return 'Pending';
  }

  // Distance to break-even per sticker
  function distToBreakEven(price: number): string {
    if (price === 0) return '-';
    const diff = price - 0.35;
    const pct = (diff / 0.35 * 100).toFixed(1);
    return `${parseFloat(pct) >= 0 ? '+' : ''}${pct}%`;
  }

  // Portfolio history for chart
  const portfolioHistory = history.entries.map(e => ({
    date: e.date, value: e.totalValue, cost: e.totalCost,
  }));

  // ── Historical Major Data (fetched Mar 2026) ────────────────────────
  // Quality mapping: Normal→Paper, Embroidered→Foil/Glitter, Holo→Holo, Gold→Gold
  interface HistoricalMajor {
    name: string;
    date: string;
    monthsOld: number;
    avgPaper: number;
    avgMidTier: number; // Foil or Glitter (maps to Embroidered)
    avgHolo: number;
    avgGold: number;
  }

  const refDate = new Date();
  function monthsSince(dateStr: string): number {
    const d = new Date(dateStr);
    return Math.round((refDate.getTime() - d.getTime()) / (30.44 * 86400000));
  }

  const historicalMajors: HistoricalMajor[] = [
    // Pre-2019 majors (Gold stickers didn't exist before Katowice 2019)
    // Katowice 2014: Prices from csgoskins.gg (exceed Steam Market cap). Paper avg $1,443 USD, Holo avg $22,031 USD
    { name: "Katowice 2014", date: "2014-03-16", monthsOld: monthsSince("2014-03-16"), avgPaper: 2236, avgMidTier: 2236, avgHolo: 34148, avgGold: 0 },
    { name: "Cologne 2014", date: "2014-08-17", monthsOld: monthsSince("2014-08-17"), avgPaper: 17.46, avgMidTier: 17.46, avgHolo: 100.25, avgGold: 0 },
    { name: "Katowice 2015", date: "2015-03-15", monthsOld: monthsSince("2015-03-15"), avgPaper: 50.22, avgMidTier: 223.14, avgHolo: 128.47, avgGold: 0 },
    { name: "Cologne 2015", date: "2015-08-23", monthsOld: monthsSince("2015-08-23"), avgPaper: 11.06, avgMidTier: 58.59, avgHolo: 58.59, avgGold: 0 },
    { name: "Cluj-Napoca 2015", date: "2015-11-01", monthsOld: monthsSince("2015-11-01"), avgPaper: 10.95, avgMidTier: 81.07, avgHolo: 81.07, avgGold: 0 },
    { name: "Columbus 2016", date: "2016-04-03", monthsOld: monthsSince("2016-04-03"), avgPaper: 14.60, avgMidTier: 153.98, avgHolo: 68.70, avgGold: 0 },
    { name: "Cologne 2016", date: "2016-07-10", monthsOld: monthsSince("2016-07-10"), avgPaper: 14.94, avgMidTier: 159.91, avgHolo: 39.08, avgGold: 0 },
    { name: "Atlanta 2017", date: "2017-01-29", monthsOld: monthsSince("2017-01-29"), avgPaper: 38.12, avgMidTier: 409.85, avgHolo: 137.31, avgGold: 0 },
    { name: "Krakow 2017", date: "2017-07-23", monthsOld: monthsSince("2017-07-23"), avgPaper: 16.86, avgMidTier: 103.13, avgHolo: 46.62, avgGold: 0 },
    { name: "Boston 2018", date: "2018-01-28", monthsOld: monthsSince("2018-01-28"), avgPaper: 13.27, avgMidTier: 109.54, avgHolo: 94.90, avgGold: 0 },
    { name: "London 2018", date: "2018-09-23", monthsOld: monthsSince("2018-09-23"), avgPaper: 5.84, avgMidTier: 79.90, avgHolo: 25.27, avgGold: 0 },
    { name: "Katowice 2019", date: "2019-03-03", monthsOld: monthsSince("2019-03-03"), avgPaper: 5.43, avgMidTier: 35.75, avgHolo: 12.27, avgGold: 606.69 },
    // Post-2019 majors (all have Gold tier)
    { name: "Berlin 2019", date: "2019-09-08", monthsOld: monthsSince("2019-09-08"), avgPaper: 1.17, avgMidTier: 6.95, avgHolo: 6.95, avgGold: 95.90 },
    { name: "Stockholm 2021", date: "2021-11-07", monthsOld: monthsSince("2021-11-07"), avgPaper: 0.26, avgMidTier: 6.53, avgHolo: 11.16, avgGold: 58.56 },
    { name: "Antwerp 2022", date: "2022-05-22", monthsOld: monthsSince("2022-05-22"), avgPaper: 0.13, avgMidTier: 0.13, avgHolo: 17.72, avgGold: 40.34 },
    { name: "Rio 2022", date: "2022-11-13", monthsOld: monthsSince("2022-11-13"), avgPaper: 0.24, avgMidTier: 0.24, avgHolo: 7.62, avgGold: 41.40 },
    { name: "Paris 2023", date: "2023-05-21", monthsOld: monthsSince("2023-05-21"), avgPaper: 0.09, avgMidTier: 0.47, avgHolo: 7.16, avgGold: 22.46 },
    { name: "Copenhagen 2024", date: "2024-03-31", monthsOld: monthsSince("2024-03-31"), avgPaper: 0.08, avgMidTier: 1.39, avgHolo: 14.90, avgGold: 25.86 },
    { name: "Shanghai 2024", date: "2024-12-15", monthsOld: monthsSince("2024-12-15"), avgPaper: 0.06, avgMidTier: 0.77, avgHolo: 14.50, avgGold: 19.61 },
    { name: "Austin 2025", date: "2025-06-15", monthsOld: monthsSince("2025-06-15"), avgPaper: 0.22, avgMidTier: 0.22, avgHolo: 10.40, avgGold: 26.79 },
  ];

  // User's quality distribution
  const userNormalCount = data.filter(r => r.quality === 'Normal' || r.quality.startsWith('Normal')).reduce((a, r) => a + r.qty, 0);
  const userEmbroideredCount = data.filter(r => r.quality.includes('Embroidered')).reduce((a, r) => a + r.qty, 0);
  const userHoloCount = data.filter(r => r.quality.includes('Holo')).reduce((a, r) => a + r.qty, 0);
  const userGoldCount = data.filter(r => r.quality === 'Gold').reduce((a, r) => a + r.qty, 0);
  const userTotal = grandQty;
  const pctNormal = userNormalCount / userTotal;
  const pctEmbroidered = userEmbroideredCount / userTotal;
  const pctHolo = userHoloCount / userTotal;
  const pctGold = userGoldCount / userTotal;

  // For each historical major: weighted avg price matching user's quality mix, and portfolio value
  interface MajorProjection {
    name: string;
    monthsOld: number;
    weightedAvgPrice: number;
    portfolioValue: number;
    roi: number;
    roiStr: string;
    bestMajor: boolean;
  }

  let bestROI = -Infinity;
  const projections: MajorProjection[] = historicalMajors.map(m => {
    // For majors without Gold (avgGold=0), renormalize across available tiers
    let weightedAvg: number;
    if (m.avgGold > 0) {
      weightedAvg = m.avgPaper * pctNormal + m.avgMidTier * pctEmbroidered + m.avgHolo * pctHolo + m.avgGold * pctGold;
    } else {
      // Exclude Holo too if it's 0 (e.g. Katowice 2014)
      const usePaper = m.avgPaper > 0, useMid = m.avgMidTier > 0, useHolo = m.avgHolo > 0;
      let num = 0, denom = 0;
      if (usePaper) { num += m.avgPaper * pctNormal; denom += pctNormal; }
      if (useMid) { num += m.avgMidTier * pctEmbroidered; denom += pctEmbroidered; }
      if (useHolo) { num += m.avgHolo * pctHolo; denom += pctHolo; }
      weightedAvg = denom > 0 ? num / denom : m.avgPaper;
    }
    const portfolioVal = weightedAvg * userTotal;
    const roi = ((portfolioVal - grandCost) / grandCost) * 100;
    if (roi > bestROI) bestROI = roi;
    return {
      name: m.name,
      monthsOld: m.monthsOld,
      weightedAvgPrice: weightedAvg,
      portfolioValue: portfolioVal,
      roi,
      roiStr: roi.toFixed(0) + '%',
      bestMajor: false,
    };
  });
  projections.forEach(p => { if (p.roi === bestROI) p.bestMajor = true; });

  // Timeline projections for Budapest 2025
  // Use historical data points (months vs weighted ROI) to project future values
  // Bias towards last 4 majors (most relevant for modern CS2 economy)
  const recentMajors = new Set(["Paris 2023", "Copenhagen 2024", "Shanghai 2024", "Austin 2025"]);
  const RECENCY_BOOST = 3; // 3x weight for last 4 majors
  const timePoints = [6, 12, 18, 24, 36, 48, 60, 78, 96, 120, 144];
  interface TimeProjection { months: number; label: string; avgROI: number; projectedValue: number; projectedPerSticker: number; actualValue?: number; actualROI?: number; }
  const timeProjections: TimeProjection[] = timePoints.map(targetMonths => {
    // Find majors near this age and interpolate
    const nearby = projections.filter(p => Math.abs(p.monthsOld - targetMonths) <= 12);
    let avgROI: number;
    if (nearby.length > 0) {
      // Weight closer majors more heavily, with recency bias for last 4 majors
      let totalWeight = 0, weightedROI = 0;
      for (const p of nearby) {
        const w = (1 / (1 + Math.abs(p.monthsOld - targetMonths))) * (recentMajors.has(p.name) ? RECENCY_BOOST : 1);
        weightedROI += p.roi * w;
        totalWeight += w;
      }
      avgROI = weightedROI / totalWeight;
    } else {
      // Extrapolate from closest
      const sorted = [...projections].sort((a, b) => Math.abs(a.monthsOld - targetMonths) - Math.abs(b.monthsOld - targetMonths));
      avgROI = sorted[0].roi;
    }
    const projValue = grandCost * (1 + avgROI / 100);
    return {
      months: targetMonths,
      label: targetMonths < 12 ? `${targetMonths} months` : `${(targetMonths / 12).toFixed(1)} years`,
      avgROI,
      projectedValue: projValue,
      projectedPerSticker: projValue / userTotal,
    };
  });

  // Match actual data from price history snapshots
  const BUDAPEST_EVENT = new Date("2025-09-15"); // approximate sticker release date
  for (const tp of timeProjections) {
    const targetDate = new Date(BUDAPEST_EVENT.getTime() + tp.months * 30.44 * 86400000);
    if (targetDate <= refDate && history.entries.length > 0) {
      // Find closest snapshot to this target date
      let closest: HistoryEntry | null = null;
      let closestDist = Infinity;
      for (const entry of history.entries) {
        const dist = Math.abs(new Date(entry.date).getTime() - targetDate.getTime());
        if (dist < closestDist) { closestDist = dist; closest = entry; }
      }
      if (closest && closestDist < 45 * 86400000) { // within 45 days
        tp.actualValue = closest.totalValue;
        tp.actualROI = ((closest.totalValue - grandCost) / grandCost) * 100;
      }
    }
  }

  // Find estimated break-even month
  let breakEvenMonths = 0;
  for (let m = 1; m <= 120; m++) {
    const nearby = projections.filter(p => Math.abs(p.monthsOld - m) <= 12);
    if (nearby.length > 0) {
      let tw = 0, wr = 0;
      for (const p of nearby) { const w = (1 / (1 + Math.abs(p.monthsOld - m))) * (recentMajors.has(p.name) ? RECENCY_BOOST : 1); wr += p.roi * w; tw += w; }
      if (wr / tw >= 0) { breakEvenMonths = m; break; }
    }
  }

  const bestMajor = projections.find(p => p.bestMajor)!;

  // ── Generate CSV ──────────────────────────────────────────────────
  let csvOut = "Sticker Name,Quality,Qty,Cost/Unit (AUD),Total Cost (AUD),Current Price (AUD),Total Value (AUD),Profit/Loss (AUD),ROI %,Steam Market Link\n";
  for (const r of data) {
    const esc = (s: string) => s.includes(',') ? `"${s}"` : s;
    csvOut += `${esc(r.name)},${esc(r.quality)},${r.qty},0.35,${r.totalCost.toFixed(2)},${r.currentPrice.toFixed(2)},${r.totalValue.toFixed(2)},${r.profitLoss.toFixed(2)},${r.roi},${r.marketUrl}\n`;
  }
  csvOut += `\nTOTAL,,${grandQty},,${grandCost.toFixed(2)},,${grandValue.toFixed(2)},${grandPL.toFixed(2)},${grandROI}%,\n`;
  await Bun.write(CSV_FILE, csvOut);

  // ── Generate HTML ─────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Budapest 2025 Sticker Investment Tracker</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #06060a; color: #e0e0e0; padding: 30px 40px; min-height: 100vh; }
  ::selection { background: rgba(255,215,0,0.3); }
  h1 { background: linear-gradient(135deg, #ffd700, #ff8c00, #ffd700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
  .subtitle { color: #666; font-size: 13px; margin-top: 4px; margin-bottom: 28px; font-weight: 400; }
  .subtitle span { color: #888; }
  h3 { color: #fff; margin: 40px 0 16px; font-size: 17px; font-weight: 700; letter-spacing: -0.3px; display: flex; align-items: center; gap: 8px; }
  h3::before { content: ''; display: inline-block; width: 3px; height: 18px; background: linear-gradient(180deg, #ffd700, #ff8c00); border-radius: 2px; }

  /* Cards */
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 32px; }
  .card { background: linear-gradient(145deg, #111118, #0d0d14); border: 1px solid #1a1a28; border-radius: 12px; padding: 18px 20px; position: relative; overflow: hidden; transition: border-color 0.2s, transform 0.2s; }
  .card:hover { border-color: #2a2a3e; transform: translateY(-1px); }
  .card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,215,0,0.15), transparent); }
  .card-label { color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
  .card-value { font-size: 26px; font-weight: 800; margin-top: 6px; letter-spacing: -0.5px; }
  .card-sub { font-size: 11px; color: #555; margin-top: 4px; font-weight: 500; }
  .positive { color: #22c55e; }
  .negative { color: #ef4444; }
  .neutral { color: #ffd700; }
  .dimmed { color: #888; }

  /* Break-even progress */
  .progress-section { margin-bottom: 32px; }
  .progress-bar-outer { background: #111118; border: 1px solid #1a1a28; border-radius: 10px; height: 32px; overflow: hidden; position: relative; }
  .progress-bar-inner { height: 100%; border-radius: 10px; transition: width 0.5s ease; display: flex; align-items: center; justify-content: flex-end; padding-right: 12px; font-size: 12px; font-weight: 700; min-width: 60px; }
  .progress-labels { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: #555; font-weight: 500; }

  /* Charts */
  .chart-container { background: linear-gradient(145deg, #111118, #0d0d14); border: 1px solid #1a1a28; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
  canvas { width: 100% !important; max-height: 280px; }

  /* Quality cards */
  .quality-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 32px; }
  .qs-card { background: linear-gradient(145deg, #111118, #0d0d14); border: 1px solid #1a1a28; border-radius: 10px; padding: 16px 18px; font-size: 13px; transition: border-color 0.2s; }
  .qs-card:hover { border-color: #2a2a3e; }
  .qs-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
  .qs-stat { font-size: 12px; color: #888; }
  .qs-val { font-weight: 600; }

  /* Snapshot history */
  .history-table { font-size: 13px; margin-bottom: 32px; border-collapse: separate; border-spacing: 0; }
  .history-table th { background: #111118; color: #888; padding: 10px 14px; text-align: left; border-bottom: 1px solid #1a1a28; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
  .history-table td { padding: 10px 14px; border-bottom: 1px solid #0f0f18; }
  .history-table tr:hover td { background: rgba(255,215,0,0.02); }

  /* Filter bar */
  .filter-bar { margin-bottom: 12px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .filter-bar input, .filter-bar select { background: #111118; border: 1px solid #1a1a28; color: #e0e0e0; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-family: inherit; transition: border-color 0.2s; outline: none; }
  .filter-bar input { width: 300px; }
  .filter-bar input:focus, .filter-bar select:focus { border-color: #ffd700; }

  /* Main table */
  table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
  thead { position: sticky; top: 0; z-index: 10; }
  th { background: #0a0a10; color: #666; padding: 11px 10px; text-align: left; border-bottom: 1px solid #1a1a28; cursor: pointer; user-select: none; white-space: nowrap; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; transition: color 0.2s; }
  th:hover { color: #ffd700; }
  td { padding: 9px 10px; border-bottom: 1px solid #0f0f18; font-variant-numeric: tabular-nums; }
  tbody tr { transition: background 0.15s; }
  tbody tr:nth-child(even) { background: rgba(255,255,255,0.01); }
  tbody tr:hover { background: rgba(255,215,0,0.03); }
  tr.total-row { background: linear-gradient(145deg, #111118, #0d0d14); font-weight: 700; }
  tr.total-row td { border-top: 2px solid #ffd700; padding: 12px 10px; }
  a { color: #60a5fa; text-decoration: none; font-weight: 500; transition: color 0.2s; }
  a:hover { color: #93c5fd; }

  /* Quality badges */
  .quality-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase; }
  .q-normal { background: rgba(255,255,255,0.06); color: #888; }
  .q-embroidered { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.15); }
  .q-holo { background: rgba(99,102,241,0.12); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.15); }
  .q-gold { background: rgba(255,215,0,0.1); color: #ffd700; border: 1px solid rgba(255,215,0,0.15); }
  .q-champion { background: rgba(168,85,247,0.12); color: #c084fc; border: 1px solid rgba(168,85,247,0.15); }

  /* ROI bar in table */
  .roi-bar { display: flex; align-items: center; gap: 6px; }
  .roi-fill { height: 4px; border-radius: 2px; min-width: 2px; max-width: 60px; }

  /* Top/Bottom tables */
  .split-tables { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  @media (max-width: 1200px) { .split-tables { grid-template-columns: 1fr; } }
  .sub-table { background: linear-gradient(145deg, #111118, #0d0d14); border: 1px solid #1a1a28; border-radius: 12px; padding: 20px; }
  .sub-table h4 { color: #fff; font-size: 14px; font-weight: 700; margin-bottom: 12px; }
  .sub-table table { font-size: 12px; }

  /* Footer */
  .footer { margin-top: 50px; padding: 24px; text-align: center; border-top: 1px solid #111; }
  .footer p { color: #444; font-size: 12px; margin: 4px 0; }
  .footer strong { color: #666; }

  .snapshot-count { color: #555; font-size: 13px; margin-bottom: 20px; font-style: italic; }

  /* Distance badge */
  .dist-badge { font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
  .dist-pos { background: rgba(34,197,94,0.1); color: #22c55e; }
  .dist-neg { background: rgba(239,68,68,0.1); color: #ef4444; }

  /* Time to ROI */
  .roi-time { font-size: 11px; color: #888; font-weight: 500; }
  .roi-time.achieved { color: #22c55e; }
  .roi-time.declining { color: #ef4444; }
</style>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
</head>
<body>

<h1>Budapest 2025 Major Sticker Investments</h1>
<div class="subtitle">Last updated <span>${todayEntry.date}</span> &middot; All prices AUD &middot; Buy price $0.35/ea &middot; <span>${history.entries.length} snapshot${history.entries.length !== 1 ? 's' : ''}</span></div>

<div class="summary">
  <div class="card"><div class="card-label">Stickers Held</div><div class="card-value neutral">${grandQty.toLocaleString()}</div><div class="card-sub">${data.length} unique line items</div></div>
  <div class="card"><div class="card-label">Total Invested</div><div class="card-value" style="color:#60a5fa">$${grandCost.toFixed(2)}</div><div class="card-sub">@ $0.35 each</div></div>
  <div class="card"><div class="card-label">Current Value</div><div class="card-value ${grandValue >= grandCost ? 'positive' : 'negative'}">$${grandValue.toFixed(2)}</div><div class="card-sub">Avg $${avgStickerValue.toFixed(3)}/sticker</div></div>
  <div class="card"><div class="card-label">Profit / Loss</div><div class="card-value ${grandPL >= 0 ? 'positive' : 'negative'}">${grandPL >= 0 ? '+' : ''}$${grandPL.toFixed(2)}</div><div class="card-sub">${grandROI}% return</div></div>
  <div class="card"><div class="card-label">Break-Even Progress</div><div class="card-value ${breakEvenPct >= 100 ? 'positive' : 'negative'}">${breakEvenPct.toFixed(1)}%</div><div class="card-sub">${profitableCount} of ${data.length} items profitable</div></div>
  <div class="card"><div class="card-label">Est. Time to ROI</div><div class="card-value ${roiEstimate === 'Achieved!' ? 'positive' : roiEstimate === 'Declining' ? 'negative' : 'dimmed'}" style="font-size:${roiEstimate.length > 10 ? '18' : '26'}px">${roiEstimate}</div><div class="card-sub">Based on price trend</div></div>
  <div class="card"><div class="card-label">Best Performer</div><div class="card-value" style="font-size:16px;color:#22c55e">${bestPerformer ? bestPerformer.name : '-'}</div><div class="card-sub">${bestPerformer ? bestPerformer.quality + ' @ $' + bestPerformer.currentPrice.toFixed(2) : ''}</div></div>
  <div class="card"><div class="card-label">Worst Performer</div><div class="card-value" style="font-size:16px;color:#ef4444">${worstPerformer ? worstPerformer.name : '-'}</div><div class="card-sub">${worstPerformer ? worstPerformer.quality + ' @ $' + worstPerformer.currentPrice.toFixed(2) : ''}</div></div>
</div>

<h3>Break-Even Progress</h3>
<div class="progress-section">
  <div class="progress-bar-outer">
    <div class="progress-bar-inner" style="width:${Math.min(breakEvenPct, 100)}%;background:linear-gradient(90deg,${breakEvenPct >= 100 ? '#22c55e,#16a34a' : breakEvenPct >= 70 ? '#f59e0b,#d97706' : '#ef4444,#dc2626'});">
      ${breakEvenPct.toFixed(1)}%
    </div>
  </div>
  <div class="progress-labels">
    <span>$0.00</span>
    <span>Break-even: $${grandCost.toFixed(2)}</span>
    <span>Current: $${grandValue.toFixed(2)}</span>
  </div>
</div>

${portfolioHistory.length > 1 ? `
<h3>Portfolio Value Over Time</h3>
<div class="chart-container">
  <canvas id="portfolioChart"></canvas>
</div>
` : `<p class="snapshot-count">Run again on a different day to start building a price history chart.</p>`}

<h3>Quality Breakdown</h3>
<div class="quality-summary">
${Object.entries(qualityTotals).sort((a,b) => b[1].value - a[1].value).map(([q, t]) => {
  const pl = t.value - t.cost;
  const roi = ((pl / t.cost) * 100).toFixed(1);
  const qc = q.toLowerCase();
  const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
  const avgP = t.value / t.qty;
  return `<div class="qs-card">
    <span class="quality-badge q-${cls}">${q}</span>
    <div class="qs-row"><span class="qs-stat">Stickers</span><span class="qs-val">${t.qty}</span></div>
    <div class="qs-row"><span class="qs-stat">Invested</span><span class="qs-val">$${t.cost.toFixed(2)}</span></div>
    <div class="qs-row"><span class="qs-stat">Value</span><span class="qs-val">$${t.value.toFixed(2)}</span></div>
    <div class="qs-row"><span class="qs-stat">Avg Price</span><span class="qs-val">$${avgP.toFixed(3)}</span></div>
    <div class="qs-row"><span class="qs-stat">P/L</span><span class="qs-val ${pl >= 0 ? 'positive' : 'negative'}">${pl >= 0 ? '+' : ''}$${pl.toFixed(2)} (${roi}%)</span></div>
  </div>`;
}).join('\n')}
</div>

<h3>Top & Bottom Performers</h3>
<div class="split-tables">
  <div class="sub-table">
    <h4 style="color:#22c55e">Top 20 Most Valuable</h4>
    <table>
    <thead><tr><th>Sticker</th><th>Quality</th><th>Qty</th><th>Price</th><th>Value</th><th>vs Buy</th></tr></thead>
    <tbody>
    ${top20.map(r => {
      const qc = r.quality.toLowerCase();
      const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
      const dist = distToBreakEven(r.currentPrice);
      const distCls = r.currentPrice >= 0.35 ? 'dist-pos' : 'dist-neg';
      return `<tr><td><a href="${r.marketUrl}" target="_blank">${r.name}</a></td><td><span class="quality-badge q-${cls}">${r.quality}</span></td><td>${r.qty}</td><td>$${r.currentPrice.toFixed(2)}</td><td>$${r.totalValue.toFixed(2)}</td><td><span class="dist-badge ${distCls}">${dist}</span></td></tr>`;
    }).join('\n')}
    </tbody>
    </table>
  </div>
  <div class="sub-table">
    <h4 style="color:#ef4444">Bottom 10 by ROI</h4>
    <table>
    <thead><tr><th>Sticker</th><th>Quality</th><th>Qty</th><th>Price</th><th>ROI</th><th>vs Buy</th></tr></thead>
    <tbody>
    ${bottom10.map(r => {
      const qc = r.quality.toLowerCase();
      const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
      const dist = distToBreakEven(r.currentPrice);
      const distCls = r.currentPrice >= 0.35 ? 'dist-pos' : 'dist-neg';
      return `<tr><td><a href="${r.marketUrl}" target="_blank">${r.name}</a></td><td><span class="quality-badge q-${cls}">${r.quality}</span></td><td>${r.qty}</td><td>$${r.currentPrice.toFixed(2)}</td><td class="${parseFloat(r.roi) >= 0 ? 'positive' : 'negative'}">${r.roi}</td><td><span class="dist-badge ${distCls}">${dist}</span></td></tr>`;
    }).join('\n')}
    </tbody>
    </table>
  </div>
</div>

<h3>Snapshot History</h3>
<table class="history-table" style="max-width: 700px;">
<thead><tr><th>Date</th><th>Portfolio Value</th><th>P/L vs Cost</th><th>ROI</th><th>Day Change</th></tr></thead>
<tbody>
${[...history.entries].reverse().map((e, i, arr) => {
  const pl = e.totalValue - e.totalCost;
  const roi = ((pl / e.totalCost) * 100).toFixed(1);
  const prev = arr[i + 1];
  const change = prev ? e.totalValue - prev.totalValue : 0;
  return `<tr>
    <td style="font-weight:600">${e.date}</td>
    <td>$${e.totalValue.toFixed(2)}</td>
    <td class="${pl >= 0 ? 'positive' : 'negative'}">${pl >= 0 ? '+' : ''}$${pl.toFixed(2)}</td>
    <td class="${pl >= 0 ? 'positive' : 'negative'}">${roi}%</td>
    <td class="${change >= 0 ? 'positive' : 'negative'}">${prev ? (change >= 0 ? '+' : '') + '$' + change.toFixed(2) : '-'}</td>
  </tr>`;
}).join('\n')}
</tbody>
</table>

<h3>Historical Major Comparison (20 Majors: 2014-2025)</h3>
<p style="color:#888;font-size:13px;margin-bottom:16px;">If you invested $${grandCost.toFixed(2)} AUD in stickers from each previous major (weighted by your quality mix: ${(pctNormal*100).toFixed(0)}% Normal, ${(pctEmbroidered*100).toFixed(0)}% Embroidered, ${(pctHolo*100).toFixed(0)}% Holo, ${(pctGold*100).toFixed(0)}% Gold), here's what it would be worth today. Pre-2019 majors without Gold tier are weighted across available qualities only.</p>

<div class="chart-container">
  <canvas id="historicalChart"></canvas>
</div>

<table class="history-table" style="max-width: 900px;">
<thead><tr>
  <th>Major</th>
  <th>Age</th>
  <th>Avg Paper</th>
  <th>Avg Mid-Tier</th>
  <th>Avg Holo</th>
  <th>Avg Gold</th>
  <th>Weighted Avg</th>
  <th>Portfolio Would Be</th>
  <th>ROI</th>
</tr></thead>
<tbody>
${projections.map(p => {
  const m = historicalMajors.find(h => h.name === p.name)!;
  const rowStyle = p.bestMajor ? 'background:rgba(255,215,0,0.05);' : '';
  const badge = p.bestMajor ? ' <span style="color:#ffd700;font-size:10px;font-weight:700;">BEST</span>' : '';
  const years = p.monthsOld >= 12 ? `${(p.monthsOld/12).toFixed(1)}y` : `${p.monthsOld}mo`;
  return `<tr style="${rowStyle}">
    <td style="font-weight:600">${p.name}${badge}</td>
    <td>${years}</td>
    <td>$${m.avgPaper.toFixed(2)}</td>
    <td>${m.avgMidTier > 0 ? '$' + m.avgMidTier.toFixed(2) : '<span style="color:#555">N/A</span>'}</td>
    <td>${m.avgHolo > 0 ? '$' + m.avgHolo.toFixed(2) : '<span style="color:#555">N/A</span>'}</td>
    <td>${m.avgGold > 0 ? '$' + m.avgGold.toFixed(2) : '<span style="color:#555">N/A</span>'}</td>
    <td style="font-weight:600">$${p.weightedAvgPrice.toFixed(2)}</td>
    <td style="font-weight:600" class="${p.portfolioValue >= grandCost ? 'positive' : 'negative'}">$${p.portfolioValue.toFixed(2)}</td>
    <td class="${p.roi >= 0 ? 'positive' : 'negative'}" style="font-weight:700">${p.roi >= 0 ? '+' : ''}${p.roiStr}</td>
  </tr>`;
}).join('\n')}
<tr style="border-top:2px solid #ffd700;font-weight:600;">
  <td>Budapest 2025</td>
  <td>Now</td>
  <td colspan="4" style="color:#888;">Your current portfolio</td>
  <td>$${avgStickerValue.toFixed(3)}</td>
  <td class="${grandValue >= grandCost ? 'positive' : 'negative'}">$${grandValue.toFixed(2)}</td>
  <td class="${parseFloat(grandROI) >= 0 ? 'positive' : 'negative'}">${grandROI}%</td>
</tr>
</tbody>
</table>

<h3>Budapest 2025 Price Predictions</h3>
<p style="color:#888;font-size:13px;margin-bottom:16px;">Based on how previous major stickers appreciated over time, here's a projection for your Budapest 2025 portfolio. Best-performing major: <span style="color:#ffd700;font-weight:600">${bestMajor.name}</span> at <span class="positive">+${bestMajor.roiStr}</span> after ${(bestMajor.monthsOld/12).toFixed(1)} years.</p>

<div class="chart-container">
  <canvas id="predictionChart"></canvas>
</div>

<div class="summary" style="margin-top:20px;">
  <div class="card"><div class="card-label">Est. Break-Even</div><div class="card-value neutral" style="font-size:20px">${breakEvenMonths > 0 ? (breakEvenMonths < 12 ? breakEvenMonths + ' months' : (breakEvenMonths/12).toFixed(1) + ' years') : 'Unknown'}</div><div class="card-sub">When portfolio value hits $${grandCost.toFixed(0)}</div></div>
  <div class="card"><div class="card-label">Best Case (${bestMajor.name} path)</div><div class="card-value positive" style="font-size:20px">$${bestMajor.portfolioValue.toFixed(0)}</div><div class="card-sub">After ${(bestMajor.monthsOld/12).toFixed(1)} years | +${bestMajor.roiStr}</div></div>
  <div class="card"><div class="card-label">Conservative (avg all majors)</div><div class="card-value positive" style="font-size:20px">$${(projections.reduce((a,p) => a + p.portfolioValue, 0) / projections.length).toFixed(0)}</div><div class="card-sub">Average across ${projections.length} majors</div></div>
</div>

<table class="history-table" style="max-width: 700px;">
<thead><tr><th>Timeline</th><th>Projected Value</th><th>Est. ROI</th><th>Actual Value</th><th>Actual ROI</th><th>Accuracy</th></tr></thead>
<tbody>
${timeProjections.map(t => {
  const pl = t.projectedValue - grandCost;
  const hasActual = t.actualValue !== undefined;
  const accPct = hasActual ? ((t.actualValue! / t.projectedValue) * 100).toFixed(0) : '';
  const accColor = hasActual ? (t.actualValue! >= t.projectedValue ? '#22c55e' : t.actualValue! >= t.projectedValue * 0.8 ? '#f59e0b' : '#ef4444') : '';
  return `<tr>
    <td style="font-weight:600">${t.label}</td>
    <td class="${t.projectedValue >= grandCost ? 'positive' : 'negative'}">$${t.projectedValue.toFixed(2)}</td>
    <td class="${t.avgROI >= 0 ? 'positive' : 'negative'}">${t.avgROI >= 0 ? '+' : ''}${t.avgROI.toFixed(0)}%</td>
    <td style="font-weight:600">${hasActual ? '<span class="' + (t.actualValue! >= grandCost ? 'positive' : 'negative') + '">$' + t.actualValue!.toFixed(2) + '</span>' : '<span style="color:#555">—</span>'}</td>
    <td>${hasActual ? '<span class="' + (t.actualROI! >= 0 ? 'positive' : 'negative') + '">' + (t.actualROI! >= 0 ? '+' : '') + t.actualROI!.toFixed(0) + '%</span>' : '<span style="color:#555">—</span>'}</td>
    <td>${hasActual ? '<span style="color:' + accColor + ';font-weight:600">' + accPct + '%</span>' : '<span style="color:#555">Pending</span>'}</td>
  </tr>`;
}).join('\n')}
</tbody>
</table>
<p style="color:#555;font-size:11px;margin-top:8px;font-style:italic;">Projections based on ${projections.length} previous CS majors (Katowice 2014 - Austin 2025). Weighted by your quality distribution. Pre-2019 majors lack Gold tier (marked N/A). Katowice 2014 Holos ($10K-$87K USD each) exceed Steam Market cap. Past performance does not guarantee future results. Prices sampled March 2026.</p>

<h3>Full Inventory (${data.length} line items)</h3>
<div class="filter-bar">
  <input type="text" id="search" placeholder="Search sticker name..." oninput="filterTable()">
  <select id="qualFilter" onchange="filterTable()">
    <option value="">All Qualities</option>
    <option value="Normal">Normal</option>
    <option value="Embroidered">Embroidered</option>
    <option value="Holo">Holo</option>
    <option value="Gold">Gold</option>
    <option value="Champion">Champion</option>
  </select>
</div>
<table id="mainTable">
<thead><tr>
  <th onclick="sortTable(0)">Sticker</th>
  <th onclick="sortTable(1)">Quality</th>
  <th onclick="sortTable(2)">Qty</th>
  <th onclick="sortTable(3)">Price</th>
  <th onclick="sortTable(4)">Value</th>
  <th onclick="sortTable(5)">P/L</th>
  <th onclick="sortTable(6)">ROI</th>
  <th onclick="sortTable(7)">vs Buy</th>
  <th onclick="sortTable(8)">Time to ROI</th>
  <th>Link</th>
</tr></thead>
<tbody>
${data.map(r => {
  const plClass = r.profitLoss >= 0 ? 'positive' : 'negative';
  const qc = r.quality.toLowerCase();
  const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
  const dist = distToBreakEven(r.currentPrice);
  const distCls = r.currentPrice >= 0.35 ? 'dist-pos' : 'dist-neg';
  const roiPct = parseFloat(r.roi);
  const barW = Math.min(Math.abs(roiPct) / 2, 60);
  const barColor = roiPct >= 0 ? '#22c55e' : '#ef4444';
  const timeEst = stickerROIEstimate(r);
  const timeCls = timeEst === 'Profitable' ? 'achieved' : timeEst === 'Declining' ? 'declining' : '';
  return `<tr data-name="${r.name.toLowerCase()}" data-quality="${r.quality}">
  <td style="font-weight:500">${r.name}</td>
  <td><span class="quality-badge q-${cls}">${r.quality}</span></td>
  <td>${r.qty}</td>
  <td>$${r.currentPrice.toFixed(2)}</td>
  <td>$${r.totalValue.toFixed(2)}</td>
  <td class="${plClass}">${r.profitLoss >= 0 ? '+' : ''}$${r.profitLoss.toFixed(2)}</td>
  <td><div class="roi-bar"><span class="${plClass}">${r.roi}</span><div class="roi-fill" style="width:${barW}px;background:${barColor}"></div></div></td>
  <td><span class="dist-badge ${distCls}">${dist}</span></td>
  <td><span class="roi-time ${timeCls}">${timeEst}</span></td>
  <td><a href="${r.marketUrl}" target="_blank">View</a></td>
</tr>`;
}).join('\n')}
</tbody>
<tfoot><tr class="total-row">
  <td>TOTAL</td><td></td><td>${grandQty}</td><td></td>
  <td>$${grandValue.toFixed(2)}</td>
  <td class="${grandPL >= 0 ? 'positive' : 'negative'}">${grandPL >= 0 ? '+' : ''}$${grandPL.toFixed(2)}</td>
  <td class="${parseFloat(grandROI) >= 0 ? 'positive' : 'negative'}">${grandROI}%</td>
  <td></td><td></td><td></td>
</tr></tfoot>
</table>

<div class="footer">
  <p>Double-click <strong>Budapest 2025 Spreadsheet.bat</strong> to refresh prices & record a new snapshot.</p>
  <p>Data stored in D:/Desktop/.budapest2025/</p>
</div>

<script>
function filterTable() {
  const s = document.getElementById('search').value.toLowerCase();
  const q = document.getElementById('qualFilter').value;
  document.querySelectorAll('#mainTable tbody tr').forEach(row => {
    const ok = (!s || row.getAttribute('data-name').includes(s)) && (!q || row.getAttribute('data-quality').includes(q));
    row.style.display = ok ? '' : 'none';
  });
}
let sortDir = {};
function sortTable(col) {
  const tbody = document.querySelector('#mainTable tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  sortDir[col] = !sortDir[col];
  const dir = sortDir[col] ? 1 : -1;
  rows.sort((a, b) => {
    let va = a.children[col].textContent.trim(), vb = b.children[col].textContent.trim();
    const na = parseFloat(va.replace(/[^\\d.-]/g, '')), nb = parseFloat(vb.replace(/[^\\d.-]/g, ''));
    if (!isNaN(na) && !isNaN(nb)) return (na - nb) * dir;
    return va.localeCompare(vb) * dir;
  });
  rows.forEach(r => tbody.appendChild(r));
}

${portfolioHistory.length > 1 ? `
const ctx = document.getElementById('portfolioChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ${JSON.stringify(portfolioHistory.map(p => p.date))},
    datasets: [
      {
        label: 'Portfolio Value (AUD)',
        data: ${JSON.stringify(portfolioHistory.map(p => +p.value.toFixed(2)))},
        borderColor: '#ffd700',
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#ffd700',
      },
      {
        label: 'Total Cost (AUD)',
        data: ${JSON.stringify(portfolioHistory.map(p => +p.cost.toFixed(2)))},
        borderColor: '#ef4444',
        borderDash: [5, 5],
        fill: false,
        tension: 0,
        borderWidth: 1.5,
        pointRadius: 0,
      }
    ]
  },
  options: {
    responsive: true,
    plugins: { legend: { labels: { color: '#888', font: { family: 'Inter' } } } },
    scales: {
      x: { ticks: { color: '#444', font: { family: 'Inter' } }, grid: { color: '#111' } },
      y: { ticks: { color: '#444', callback: v => '$' + v, font: { family: 'Inter' } }, grid: { color: '#111' } },
    }
  }
});
` : ''}

// Historical comparison chart
const hCtx = document.getElementById('historicalChart').getContext('2d');
new Chart(hCtx, {
  type: 'bar',
  data: {
    labels: ${JSON.stringify([...projections.map(p => p.name), 'Budapest 2025'])},
    datasets: [
      {
        label: 'Portfolio Value (AUD)',
        data: ${JSON.stringify([...projections.map(p => +p.portfolioValue.toFixed(2)), +grandValue.toFixed(2)])},
        backgroundColor: ${JSON.stringify([...projections.map(p => p.bestMajor ? 'rgba(255,215,0,0.7)' : p.roi >= 0 ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.3)'), 'rgba(96,165,250,0.5)'])},
        borderColor: ${JSON.stringify([...projections.map(p => p.bestMajor ? '#ffd700' : p.roi >= 0 ? '#22c55e' : '#ef4444'), '#60a5fa'])},
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Your Investment ($${grandCost.toFixed(0)})',
        data: Array(${projections.length + 1}).fill(${grandCost.toFixed(2)}),
        type: 'line',
        borderColor: '#ef4444',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#888', font: { family: 'Inter' } } },
      tooltip: { callbacks: { label: (c) => c.dataset.label + ': $' + c.parsed.y.toFixed(2) } },
    },
    scales: {
      x: { ticks: { color: '#666', font: { family: 'Inter', size: 10 }, maxRotation: 55, minRotation: 35 }, grid: { display: false } },
      y: { ticks: { color: '#444', callback: v => '$' + v, font: { family: 'Inter' } }, grid: { color: '#111' } },
    }
  }
});

// Prediction timeline chart
const pCtx = document.getElementById('predictionChart').getContext('2d');
new Chart(pCtx, {
  type: 'line',
  data: {
    labels: ['Now', ${timeProjections.map(t => "'" + t.label + "'").join(',')}],
    datasets: [
      {
        label: 'Projected Portfolio Value',
        data: [${grandValue.toFixed(2)}, ${timeProjections.map(t => t.projectedValue.toFixed(2)).join(',')}],
        borderColor: '#ffd700',
        backgroundColor: 'rgba(255,215,0,0.05)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: ${JSON.stringify(['#60a5fa', ...timeProjections.map(t => t.projectedValue >= grandCost ? '#22c55e' : '#ef4444')])},
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
      },
      {
        label: 'Break-Even ($${grandCost.toFixed(0)})',
        data: Array(${timeProjections.length + 1}).fill(${grandCost.toFixed(2)}),
        borderColor: '#ef4444',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Best Case (${bestMajor.name} path)',
        data: [${grandValue.toFixed(2)}, ${timeProjections.map((t, i) => {
          const ratio = t.months / bestMajor.monthsOld;
          return (grandCost * (1 + bestMajor.roi / 100 * ratio)).toFixed(2);
        }).join(',')}],
        borderColor: 'rgba(34,197,94,0.4)',
        borderDash: [3, 3],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#888', font: { family: 'Inter' } } },
      tooltip: { callbacks: { label: (c) => c.dataset.label + ': $' + c.parsed.y.toFixed(2) } },
    },
    scales: {
      x: { ticks: { color: '#666', font: { family: 'Inter' } }, grid: { color: '#111' } },
      y: { ticks: { color: '#444', callback: v => '$' + v, font: { family: 'Inter' } }, grid: { color: '#111' },
        suggestedMin: 0,
      },
    }
  }
});
</script>
</body>
</html>`;

  await Bun.write(HTML_FILE, html);

  console.log(`\n========================================`);
  console.log(`DONE - ${today}`);
  console.log(`========================================`);
  console.log(`Stickers: ${grandQty} | Cost: A$${grandCost.toFixed(2)} | Value: A$${grandValue.toFixed(2)} | P/L: A$${grandPL.toFixed(2)} (${grandROI}%)`);
  console.log(`Snapshots saved: ${history.entries.length}`);
  console.log(`\nFiles updated:`);
  console.log(`  ${HTML_FILE}`);
  console.log(`  ${CSV_FILE}`);
  console.log(`  ${HISTORY_FILE}`);

}

main().catch(console.error);
