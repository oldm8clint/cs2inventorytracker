// Budapest 2025 Sticker Price Tracker
// Fetches fresh prices, saves history, builds HTML with trends
// Runs via GitHub Actions daily — deploys to GitHub Pages

const SCRIPT_DIR = import.meta.dir;
const HISTORY_FILE = `${SCRIPT_DIR}/sticker_price_history.json`;
const HTML_FILE = `${SCRIPT_DIR}/index.html`;
const CSV_FILE = `${SCRIPT_DIR}/budapest2025_stickers.csv`;
const IMAGES_FILE = `${SCRIPT_DIR}/sticker_images.json`;
const DELAY_MS = 1800;
const CURRENCY_AUD = 21;

// ── Sticker inventory ──────────────────────────────────────────────
interface StickerEntry { name: string; quality: string; qty: number; }

const stickers: StickerEntry[] = [
  { name: "910", quality: "Embroidered", qty: 2 },
  { name: "910", quality: "Normal", qty: 14 },
  { name: "Aleksib", quality: "Embroidered", qty: 3 },
  { name: "Aleksib", quality: "Normal", qty: 3 },
  { name: "alex666", quality: "Embroidered", qty: 1 },
  { name: "alex666", quality: "Holo", qty: 1 },
  { name: "alex666", quality: "Normal", qty: 5 },
  { name: "apEX", quality: "Embroidered", qty: 1 },
  { name: "apEX", quality: "Embroidered (Champion)", qty: 1 },
  { name: "apEX", quality: "Holo (Champion)", qty: 1 },
  { name: "apEX", quality: "Normal", qty: 4 },
  { name: "apEX", quality: "Normal (Champion)", qty: 12 },
  { name: "arT", quality: "Gold", qty: 1 },
  { name: "arT", quality: "Holo", qty: 1 },
  { name: "arT", quality: "Normal", qty: 5 },
  { name: "Astralis", quality: "Normal", qty: 4 },
  { name: "Attacker", quality: "Embroidered", qty: 1 },
  { name: "Attacker", quality: "Normal", qty: 3 },
  { name: "Aurora", quality: "Holo", qty: 1 },
  { name: "Aurora", quality: "Normal", qty: 1 },
  { name: "AW", quality: "Embroidered", qty: 1 },
  { name: "AW", quality: "Normal", qty: 11 },
  { name: "b1t", quality: "Normal", qty: 6 },
  { name: "B8", quality: "Normal", qty: 4 },
  { name: "Bart4k", quality: "Embroidered", qty: 1 },
  { name: "Bart4k", quality: "Normal", qty: 8 },
  { name: "BELCHONOKK", quality: "Normal", qty: 6 },
  { name: "biguzera", quality: "Embroidered", qty: 1 },
  { name: "biguzera", quality: "Holo", qty: 1 },
  { name: "biguzera", quality: "Normal", qty: 10 },
  { name: "blameF", quality: "Embroidered", qty: 2 },
  { name: "blameF", quality: "Normal", qty: 5 },
  { name: "bLitz", quality: "Embroidered", qty: 4 },
  { name: "bLitz", quality: "Gold", qty: 1 },
  { name: "bLitz", quality: "Normal", qty: 13 },
  { name: "bodyy", quality: "Embroidered", qty: 1 },
  { name: "bodyy", quality: "Normal", qty: 4 },
  { name: "br0", quality: "Embroidered", qty: 1 },
  { name: "br0", quality: "Normal", qty: 6 },
  { name: "brnz4n", quality: "Normal", qty: 6 },
  { name: "broky", quality: "Holo", qty: 1 },
  { name: "broky", quality: "Normal", qty: 3 },
  { name: "Brollan", quality: "Embroidered", qty: 1 },
  { name: "Brollan", quality: "Normal", qty: 13 },
  { name: "C4LLM3SU3", quality: "Embroidered", qty: 1 },
  { name: "C4LLM3SU3", quality: "Gold", qty: 1 },
  { name: "C4LLM3SU3", quality: "Holo", qty: 1 },
  { name: "C4LLM3SU3", quality: "Normal", qty: 10 },
  { name: "chayJESUS", quality: "Embroidered", qty: 3 },
  { name: "chayJESUS", quality: "Normal", qty: 7 },
  { name: "chelo", quality: "Embroidered", qty: 1 },
  { name: "chelo", quality: "Normal", qty: 4 },
  { name: "ChildKing", quality: "Embroidered", qty: 2 },
  { name: "ChildKing", quality: "Normal", qty: 4 },
  { name: "chopper", quality: "Embroidered", qty: 3 },
  { name: "chopper", quality: "Normal", qty: 6 },
  { name: "cobra", quality: "Embroidered", qty: 2 },
  { name: "cobra", quality: "Normal", qty: 8 },
  { name: "Cypher", quality: "Normal", qty: 9 },
  { name: "dav1deuS", quality: "Embroidered", qty: 4 },
  { name: "dav1deuS", quality: "Normal", qty: 13 },
  { name: "decenty", quality: "Embroidered", qty: 4 },
  { name: "decenty", quality: "Holo", qty: 1 },
  { name: "decenty", quality: "Normal", qty: 8 },
  { name: "device", quality: "Embroidered", qty: 1 },
  { name: "device", quality: "Normal", qty: 6 },
  { name: "dgt", quality: "Embroidered", qty: 3 },
  { name: "dgt", quality: "Normal", qty: 7 },
  { name: "donk", quality: "Embroidered", qty: 1 },
  { name: "donk", quality: "Normal", qty: 8 },
  { name: "drop", quality: "Embroidered", qty: 4 },
  { name: "drop", quality: "Normal", qty: 6 },
  { name: "dumau", quality: "Embroidered", qty: 1 },
  { name: "dumau", quality: "Normal", qty: 6 },
  { name: "EliGE", quality: "Embroidered", qty: 1 },
  { name: "EliGE", quality: "Normal", qty: 4 },
  { name: "EmiliaQAQ", quality: "Embroidered", qty: 1 },
  { name: "EmiliaQAQ", quality: "Gold", qty: 1 },
  { name: "EmiliaQAQ", quality: "Normal", qty: 5 },
  { name: "esenthial", quality: "Embroidered", qty: 1 },
  { name: "esenthial", quality: "Normal", qty: 7 },
  { name: "ewjerkz", quality: "Embroidered", qty: 1 },
  { name: "ewjerkz", quality: "Normal", qty: 7 },
  { name: "Ex3rcice", quality: "Embroidered", qty: 1 },
  { name: "Ex3rcice", quality: "Holo", qty: 1 },
  { name: "Ex3rcice", quality: "Normal", qty: 5 },
  { name: "exit", quality: "Normal", qty: 2 },
  { name: "Falcons", quality: "Embroidered", qty: 1 },
  { name: "Falcons", quality: "Normal", qty: 4 },
  { name: "FalleN", quality: "Embroidered", qty: 3 },
  { name: "FalleN", quality: "Normal", qty: 14 },
  { name: "FaZe Clan", quality: "Normal", qty: 1 },
  { name: "fEAR", quality: "Embroidered", qty: 2 },
  { name: "fEAR", quality: "Holo", qty: 1 },
  { name: "fEAR", quality: "Normal", qty: 9 },
  { name: "FlameZ", quality: "Embroidered", qty: 2 },
  { name: "FlameZ", quality: "Holo", qty: 1 },
  { name: "FlameZ", quality: "Normal", qty: 9 },
  { name: "FlameZ", quality: "Normal (Champion)", qty: 8 },
  { name: "Fluxo", quality: "Normal", qty: 2 },
  { name: "fnatic", quality: "Normal", qty: 2 },
  { name: "frozen", quality: "Normal", qty: 10 },
  { name: "FURIA", quality: "Normal", qty: 4 },
  { name: "G2 esports", quality: "Embroidered", qty: 2 },
  { name: "G2 esports", quality: "Gold", qty: 1 },
  { name: "G2 esports", quality: "Normal", qty: 5 },
  { name: "GamerLegion", quality: "Normal", qty: 1 },
  { name: "Graviti", quality: "Embroidered", qty: 1 },
  { name: "Graviti", quality: "Normal", qty: 3 },
  { name: "Grim", quality: "Embroidered", qty: 2 },
  { name: "Grim", quality: "Normal", qty: 2 },
  { name: "hallzerk", quality: "Embroidered", qty: 3 },
  { name: "hallzerk", quality: "Holo", qty: 1 },
  { name: "hallzerk", quality: "Normal", qty: 9 },
  { name: "headtr1ck", quality: "Embroidered", qty: 1 },
  { name: "headtr1ck", quality: "Normal", qty: 8 },
  { name: "Heavygod", quality: "Embroidered", qty: 4 },
  { name: "Heavygod", quality: "Normal", qty: 10 },
  { name: "HexT", quality: "Embroidered", qty: 4 },
  { name: "HexT", quality: "Normal", qty: 3 },
  { name: "History", quality: "Embroidered", qty: 1 },
  { name: "History", quality: "Normal", qty: 6 },
  { name: "HooXi", quality: "Embroidered", qty: 2 },
  { name: "HooXi", quality: "Gold", qty: 1 },
  { name: "HooXi", quality: "Holo", qty: 1 },
  { name: "HooXi", quality: "Normal", qty: 3 },
  { name: "huNter-", quality: "Embroidered", qty: 2 },
  { name: "huNter-", quality: "Normal", qty: 9 },
  { name: "iM", quality: "Embroidered", qty: 2 },
  { name: "iM", quality: "Normal", qty: 1 },
  { name: "INS", quality: "Embroidered", qty: 1 },
  { name: "INS", quality: "Normal", qty: 5 },
  { name: "insani", quality: "Embroidered", qty: 2 },
  { name: "insani", quality: "Normal", qty: 3 },
  { name: "jabbi", quality: "Embroidered", qty: 2 },
  { name: "jabbi", quality: "Normal", qty: 2 },
  { name: "jambo", quality: "Embroidered", qty: 1 },
  { name: "jambo", quality: "Normal", qty: 4 },
  { name: "Jame", quality: "Embroidered", qty: 2 },
  { name: "Jame", quality: "Normal", qty: 6 },
  { name: "JamYoung", quality: "Embroidered", qty: 1 },
  { name: "JamYoung", quality: "Normal", qty: 11 },
  { name: "jcobbb", quality: "Embroidered", qty: 1 },
  { name: "jcobbb", quality: "Holo", qty: 1 },
  { name: "jcobbb", quality: "Normal", qty: 10 },
  { name: "Jee", quality: "Embroidered", qty: 1 },
  { name: "Jee", quality: "Normal", qty: 7 },
  { name: "jeorge", quality: "Normal", qty: 4 },
  { name: "Jimpphat", quality: "Normal", qty: 4 },
  { name: "jks", quality: "Normal", qty: 4 },
  { name: "jottAAA", quality: "Holo", qty: 1 },
  { name: "jottAAA", quality: "Normal", qty: 7 },
  { name: "JT", quality: "Normal", qty: 6 },
  { name: "karrigan", quality: "Embroidered", qty: 1 },
  { name: "karrigan", quality: "Normal", qty: 5 },
  { name: "kauez", quality: "Embroidered", qty: 3 },
  { name: "kauez", quality: "Normal", qty: 3 },
  { name: "kensizor", quality: "Normal", qty: 7 },
  { name: "kl1m", quality: "Embroidered", qty: 3 },
  { name: "kl1m", quality: "Normal", qty: 3 },
  { name: "KRIMZ", quality: "Embroidered", qty: 1 },
  { name: "KRIMZ", quality: "Normal", qty: 8 },
  { name: "KSCERATO", quality: "Embroidered", qty: 1 },
  { name: "KSCERATO", quality: "Holo", qty: 1 },
  { name: "KSCERATO", quality: "Normal", qty: 8 },
  { name: "Kursy", quality: "Embroidered", qty: 1 },
  { name: "Kursy", quality: "Normal", qty: 3 },
  { name: "Kvem", quality: "Embroidered", qty: 1 },
  { name: "Kvem", quality: "Normal", qty: 2 },
  { name: "kye", quality: "Embroidered", qty: 1 },
  { name: "kye", quality: "Normal", qty: 6 },
  { name: "kyousuke", quality: "Embroidered", qty: 1 },
  { name: "kyousuke", quality: "Holo", qty: 1 },
  { name: "kyousuke", quality: "Normal", qty: 15 },
  { name: "kyxsan", quality: "Embroidered", qty: 2 },
  { name: "kyxsan", quality: "Holo", qty: 1 },
  { name: "kyxsan", quality: "Normal", qty: 11 },
  { name: "L1haNg", quality: "Embroidered", qty: 1 },
  { name: "L1haNg", quality: "Normal", qty: 6 },
  { name: "Lake", quality: "Normal", qty: 5 },
  { name: "latto", quality: "Embroidered", qty: 4 },
  { name: "latto", quality: "Normal", qty: 4 },
  { name: "Legacy", quality: "Normal", qty: 1 },
  { name: "Lucaozy", quality: "Normal", qty: 8 },
  { name: "Lucky", quality: "Embroidered", qty: 3 },
  { name: "Lucky", quality: "Gold", qty: 1 },
  { name: "Lucky", quality: "Normal", qty: 3 },
  { name: "lux", quality: "Embroidered", qty: 2 },
  { name: "lux", quality: "Gold", qty: 1 },
  { name: "lux", quality: "Normal", qty: 7 },
  { name: "Lynn Vision", quality: "Normal", qty: 2 },
  { name: "m0NESY", quality: "Embroidered", qty: 2 },
  { name: "m0NESY", quality: "Holo", qty: 2 },
  { name: "m0NESY", quality: "Normal", qty: 13 },
  { name: "Magisk", quality: "Normal", qty: 6 },
  { name: "MAJ3R", quality: "Normal", qty: 5 },
  { name: "Maka", quality: "Normal", qty: 4 },
  { name: "makazze", quality: "Normal", qty: 7 },
  { name: "malbsMd", quality: "Normal", qty: 8 },
  { name: "Marek", quality: "Normal", qty: 7 },
  { name: "MATYS", quality: "Embroidered", qty: 2 },
  { name: "MATYS", quality: "Normal", qty: 11 },
  { name: "Mercury", quality: "Embroidered", qty: 3 },
  { name: "Mercury", quality: "Normal", qty: 7 },
  { name: "mezii", quality: "Embroidered", qty: 4 },
  { name: "mezii", quality: "Normal", qty: 15 },
  { name: "mezii", quality: "Normal (Champion)", qty: 5 },
  { name: "MIBR", quality: "Embroidered", qty: 2 },
  { name: "MIBR", quality: "Holo", qty: 1 },
  { name: "MIBR", quality: "Normal", qty: 3 },
  { name: "molodoy", quality: "Embroidered", qty: 2 },
  { name: "molodoy", quality: "Normal", qty: 14 },
  { name: "Moseyuh", quality: "Normal", qty: 5 },
  { name: "MOUZ", quality: "Embroidered", qty: 1 },
  { name: "MOUZ", quality: "Normal", qty: 1 },
  { name: "mzinho", quality: "Embroidered", qty: 1 },
  { name: "mzinho", quality: "Holo", qty: 1 },
  { name: "mzinho", quality: "Normal", qty: 12 },
  { name: "n1ssim", quality: "Embroidered", qty: 1 },
  { name: "n1ssim", quality: "Holo", qty: 1 },
  { name: "n1ssim", quality: "Normal", qty: 5 },
  { name: "NAF", quality: "Embroidered", qty: 2 },
  { name: "NAF", quality: "Normal", qty: 6 },
  { name: "Natus Vincere", quality: "Normal", qty: 1 },
  { name: "NertZ", quality: "Normal", qty: 8 },
  { name: "nettik", quality: "Embroidered", qty: 2 },
  { name: "nettik", quality: "Normal", qty: 2 },
  { name: "nicx", quality: "Normal", qty: 6 },
  { name: "NiKo", quality: "Embroidered", qty: 3 },
  { name: "NiKo", quality: "Normal", qty: 16 },
  { name: "nin9", quality: "Embroidered", qty: 1 },
  { name: "nin9", quality: "Holo", qty: 1 },
  { name: "nin9", quality: "Normal", qty: 6 },
  { name: "Ninjas in Pyjamas", quality: "Normal", qty: 2 },
  { name: "nitr0", quality: "Embroidered", qty: 3 },
  { name: "nitr0", quality: "Normal", qty: 6 },
  { name: "nota", quality: "Embroidered", qty: 1 },
  { name: "nota", quality: "Normal", qty: 8 },
  { name: "noway", quality: "Embroidered", qty: 1 },
  { name: "noway", quality: "Normal", qty: 9 },
  { name: "npl", quality: "Embroidered", qty: 3 },
  { name: "npl", quality: "Normal", qty: 4 },
  { name: "NQZ", quality: "Embroidered", qty: 1 },
  { name: "NQZ", quality: "Normal", qty: 8 },
  { name: "NRG", quality: "Normal", qty: 1 },
  { name: "paiN Gaming", quality: "Normal", qty: 7 },
  { name: "Passion UA", quality: "Embroidered", qty: 2 },
  { name: "Passion UA", quality: "Normal", qty: 2 },
  { name: "PR", quality: "Embroidered", qty: 1 },
  { name: "PR", quality: "Normal", qty: 8 },
  { name: "qikert", quality: "Normal", qty: 6 },
  { name: "r1nkle", quality: "Embroidered", qty: 1 },
  { name: "r1nkle", quality: "Normal", qty: 10 },
  { name: "rain", quality: "Embroidered", qty: 1 },
  { name: "rain", quality: "Holo", qty: 1 },
  { name: "rain", quality: "Normal", qty: 3 },
  { name: "Rare Atom", quality: "Normal", qty: 2 },
  { name: "RED Canids", quality: "Normal", qty: 1 },
  { name: "regali", quality: "Holo", qty: 1 },
  { name: "regali", quality: "Normal", qty: 8 },
  { name: "REZ", quality: "Normal", qty: 6 },
  { name: "ropz", quality: "Embroidered", qty: 3 },
  { name: "ropz", quality: "Embroidered (Champion)", qty: 1 },
  { name: "ropz", quality: "Holo (Champion)", qty: 1 },
  { name: "ropz", quality: "Normal", qty: 14 },
  { name: "ropz", quality: "Normal (Champion)", qty: 4 },
  { name: "s1n", quality: "Embroidered", qty: 1 },
  { name: "s1n", quality: "Normal", qty: 8 },
  { name: "saadzin", quality: "Normal", qty: 7 },
  { name: "Senzu", quality: "Embroidered", qty: 5 },
  { name: "Senzu", quality: "Holo", qty: 2 },
  { name: "Senzu", quality: "Normal", qty: 14 },
  { name: "sh1ro", quality: "Embroidered", qty: 3 },
  { name: "sh1ro", quality: "Holo", qty: 1 },
  { name: "sh1ro", quality: "Normal", qty: 14 },
  { name: "siuhy", quality: "Embroidered", qty: 2 },
  { name: "siuhy", quality: "Normal", qty: 5 },
  { name: "sjuush", quality: "Embroidered", qty: 1 },
  { name: "sjuush", quality: "Normal", qty: 8 },
  { name: "sk0R", quality: "Embroidered", qty: 1 },
  { name: "sk0R", quality: "Holo", qty: 1 },
  { name: "sk0R", quality: "Normal", qty: 10 },
  { name: "skullz", quality: "Embroidered", qty: 2 },
  { name: "skullz", quality: "Normal", qty: 5 },
  { name: "slaxz-", quality: "Embroidered", qty: 1 },
  { name: "slaxz-", quality: "Normal", qty: 6 },
  { name: "Snappi", quality: "Normal", qty: 4 },
  { name: "snow", quality: "Embroidered", qty: 4 },
  { name: "snow", quality: "Gold", qty: 1 },
  { name: "snow", quality: "Normal", qty: 17 },
  { name: "Sonic", quality: "Embroidered", qty: 1 },
  { name: "Sonic", quality: "Normal", qty: 7 },
  { name: "Spinx", quality: "Embroidered", qty: 4 },
  { name: "Spinx", quality: "Normal", qty: 10 },
  { name: "Staehr", quality: "Embroidered", qty: 1 },
  { name: "Staehr", quality: "Normal", qty: 6 },
  { name: "StarLadder", quality: "Embroidered", qty: 2 },
  { name: "StarLadder", quality: "Normal", qty: 1 },
  { name: "Starry", quality: "Holo", qty: 1 },
  { name: "Starry", quality: "Normal", qty: 7 },
  { name: "Summer", quality: "Embroidered", qty: 2 },
  { name: "Summer", quality: "Normal", qty: 3 },
  { name: "SunPayus", quality: "Embroidered", qty: 2 },
  { name: "SunPayus", quality: "Normal", qty: 12 },
  { name: "Swisher", quality: "Embroidered", qty: 2 },
  { name: "Swisher", quality: "Normal", qty: 7 },
  { name: "Tauson", quality: "Embroidered", qty: 2 },
  { name: "Tauson", quality: "Holo", qty: 1 },
  { name: "Tauson", quality: "Normal", qty: 10 },
  { name: "Team Liquid", quality: "Normal", qty: 1 },
  { name: "Team Spirit", quality: "Embroidered", qty: 1 },
  { name: "Team Spirit", quality: "Normal", qty: 3 },
  { name: "Techno4K", quality: "Embroidered", qty: 3 },
  { name: "Techno4K", quality: "Normal", qty: 13 },
  { name: "TeSeS", quality: "Embroidered", qty: 5 },
  { name: "TeSeS", quality: "Holo", qty: 2 },
  { name: "TeSeS", quality: "Normal", qty: 15 },
  { name: "The Huns", quality: "Normal", qty: 1 },
  { name: "The Mongolz", quality: "Normal", qty: 5 },
  { name: "Tiger", quality: "Embroidered", qty: 1 },
  { name: "Tiger", quality: "Normal", qty: 6 },
  { name: "torzsi", quality: "Embroidered", qty: 3 },
  { name: "torzsi", quality: "Normal", qty: 8 },
  { name: "TRY", quality: "Embroidered", qty: 3 },
  { name: "TRY", quality: "Normal", qty: 4 },
  { name: "TYLOO", quality: "Embroidered", qty: 1 },
  { name: "TYLOO", quality: "Normal", qty: 1 },
  { name: "ultimate", quality: "Normal", qty: 7 },
  { name: "venomzera", quality: "Embroidered", qty: 3 },
  { name: "venomzera", quality: "Normal", qty: 7 },
  { name: "vexite", quality: "Normal", qty: 3 },
  { name: "VINI", quality: "Normal", qty: 6 },
  { name: "Vitality", quality: "Embroidered", qty: 1 },
  { name: "Vitality", quality: "Normal", qty: 1 },
  { name: "w0nderful", quality: "Embroidered", qty: 3 },
  { name: "w0nderful", quality: "Normal", qty: 9 },
  { name: "westmelon", quality: "Embroidered", qty: 1 },
  { name: "westmelon", quality: "Holo", qty: 1 },
  { name: "westmelon", quality: "Normal", qty: 6 },
  { name: "Wicadia", quality: "Embroidered", qty: 1 },
  { name: "Wicadia", quality: "Normal", qty: 8 },
  { name: "woxic", quality: "Embroidered", qty: 2 },
  { name: "woxic", quality: "Holo", qty: 1 },
  { name: "woxic", quality: "Normal", qty: 5 },
  { name: "XANTARES", quality: "Normal", qty: 7 },
  { name: "xerolte", quality: "Embroidered", qty: 3 },
  { name: "xerolte", quality: "Holo", qty: 1 },
  { name: "xerolte", quality: "Normal", qty: 5 },
  { name: "xertioN", quality: "Embroidered", qty: 6 },
  { name: "xertioN", quality: "Gold", qty: 1 },
  { name: "xertioN", quality: "Holo", qty: 1 },
  { name: "xertioN", quality: "Normal", qty: 10 },
  { name: "xiELO", quality: "Normal", qty: 7 },
  { name: "xKacpersky", quality: "Embroidered", qty: 3 },
  { name: "xKacpersky", quality: "Normal", qty: 7 },
  { name: "XotiC", quality: "Embroidered", qty: 1 },
  { name: "XotiC", quality: "Holo", qty: 1 },
  { name: "XotiC", quality: "Normal", qty: 10 },
  { name: "YEKINDAR", quality: "Embroidered", qty: 6 },
  { name: "YEKINDAR", quality: "Normal", qty: 10 },
  { name: "yuurih", quality: "Embroidered", qty: 1 },
  { name: "yuurih", quality: "Normal", qty: 11 },
  { name: "z4KR", quality: "Embroidered", qty: 2 },
  { name: "z4KR", quality: "Normal", qty: 8 },
  { name: "zevy", quality: "Embroidered", qty: 1 },
  { name: "zevy", quality: "Normal", qty: 3 },
  { name: "zont1x", quality: "Normal", qty: 15 },
  { name: "ztr", quality: "Embroidered", qty: 4 },
  { name: "ztr", quality: "Normal", qty: 9 },
  { name: "zweih", quality: "Embroidered", qty: 3 },
  { name: "zweih", quality: "Normal", qty: 13 },
  { name: "ZywOo", quality: "Embroidered", qty: 6 },
  { name: "ZywOo", quality: "Embroidered (Champion)", qty: 1 },
  { name: "ZywOo", quality: "Normal", qty: 9 },
  { name: "ZywOo", quality: "Normal (Champion)", qty: 6 },
  // ── Capsules ──
  { name: "Legends", quality: "Capsule", qty: 20 },
  { name: "Challengers", quality: "Capsule", qty: 20 },
  { name: "Contenders", quality: "Capsule", qty: 20 },
];

// ── Helpers ─────────────────────────────────────────────────────────
function getMarketHashName(name: string, quality: string): string {
  if (quality === 'Capsule') {
    return `Budapest 2025 ${name} Sticker Capsule`;
  }
  const q: Record<string, string> = {
    "Normal": "", "Embroidered": " (Embroidered)", "Gold": " (Gold)", "Holo": " (Holo)",
    "Normal (Champion)": " (Champion)", "Embroidered (Champion)": " (Embroidered, Champion)",
    "Holo (Champion)": " (Holo, Champion)",
  };
  return `Sticker | ${name}${q[quality] || ""} | Budapest 2025`;
}

function getSlabMarketHashName(name: string, quality: string): string {
  if (quality === 'Capsule') return ''; // capsules don't have slabs
  const q: Record<string, string> = {
    "Normal": "", "Embroidered": " (Embroidered)", "Gold": " (Gold)", "Holo": " (Holo)",
    "Normal (Champion)": " (Champion)", "Embroidered (Champion)": " (Embroidered, Champion)",
    "Holo (Champion)": " (Holo, Champion)",
  };
  return `Sticker Slab | ${name}${q[quality] || ""} | Budapest 2025`;
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
interface PerformerSnapshot { name: string; quality: string; price: number; }

interface HistoryEntry {
  date: string;
  prices: Record<string, number>;
  totalValue: number;
  totalCost: number;
  topPerformers?: PerformerSnapshot[];
  bottomPerformers?: PerformerSnapshot[];
  slabPrices?: Record<string, number>;
  volumes?: Record<string, number>;
  listings?: Record<string, number>;
  weeklyReportSent?: string;
  milestones?: string[];
  lastInvestmentScore?: number;
  lastInvestmentSignal?: string;
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

function computePerformers(prices: Record<string, number>): { top: PerformerSnapshot[]; bottom: PerformerSnapshot[] } {
  const items = Object.entries(prices)
    .map(([key, price]) => { const [name, quality] = key.split('|||'); return { name, quality, price }; })
    .filter(i => i.price > 0);
  const sorted = [...items].sort((a, b) => b.price - a.price);
  return {
    top: sorted.slice(0, 10),
    bottom: [...items].sort((a, b) => a.price - b.price).slice(0, 10),
  };
}

function backfillPerformers(history: HistoryData): boolean {
  let changed = false;
  for (const entry of history.entries) {
    if (!entry.topPerformers || !entry.bottomPerformers) {
      const { top, bottom } = computePerformers(entry.prices);
      entry.topPerformers = top;
      entry.bottomPerformers = bottom;
      changed = true;
    }
  }
  return changed;
}

function backfillSlabPrices(history: HistoryData): boolean {
  let changed = false;
  for (const entry of history.entries) {
    if (!entry.slabPrices) {
      entry.slabPrices = {};
      changed = true;
    }
  }
  return changed;
}

// ── Team sticker names (for Team vs Player breakdown) ───────────────
const TEAM_NAMES = new Set([
  "910", "AW", "Astralis", "Aurora", "B8", "FURIA", "FaZe Clan", "Falcons",
  "Fluxo", "G2 esports", "GamerLegion", "Legacy", "Lynn Vision", "MIBR",
  "MOUZ", "NRG", "Natus Vincere", "Ninjas in Pyjamas", "Passion UA",
  "RED Canids", "Rare Atom", "StarLadder", "TYLOO", "Team Liquid",
  "Team Spirit", "The Huns", "The Mongolz", "Vitality", "fnatic",
  "paiN Gaming", "Attacker", "Lake",
]);

// ── Sticker images ──────────────────────────────────────────────────
interface StickerImageCache {
  [marketHashName: string]: string; // icon_url from Steam
}

async function loadImageCache(): Promise<StickerImageCache> {
  try {
    const f = Bun.file(IMAGES_FILE);
    if (await f.exists()) return await f.json();
  } catch {}
  return {};
}

async function fetchStickerImages(): Promise<StickerImageCache> {
  const existing = await loadImageCache();
  if (Object.keys(existing).length > 0) {
    console.log(`Sticker image cache exists (${Object.keys(existing).length} entries), skipping fetch.`);
    return existing;
  }

  console.log(`Fetching sticker images from Steam Market...`);
  const cache: StickerImageCache = {};
  const PAGE_SIZE = 100;
  let start = 0;
  let totalCount = Infinity;

  while (start < totalCount) {
    const url = `https://steamcommunity.com/market/search/render/?query=Sticker+Budapest+2025&appid=730&start=${start}&count=${PAGE_SIZE}&norender=1`;
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.log(`  Rate limited on images, waiting 15s...`);
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }
      const data = await res.json() as any;
      if (data.total_count !== undefined) totalCount = data.total_count;
      if (data.results) {
        for (const item of data.results) {
          const name = item.hash_name || item.name;
          const iconUrl = item.asset_description?.icon_url;
          if (name && iconUrl) {
            cache[name] = iconUrl;
          }
        }
      }
      console.log(`  Fetched images page ${Math.floor(start / PAGE_SIZE) + 1} (${Object.keys(cache).length} total)`);
      start += PAGE_SIZE;
      if (start < totalCount) await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.log(`  Image fetch error at start=${start}: ${e}`);
      start += PAGE_SIZE;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  await Bun.write(IMAGES_FILE, JSON.stringify(cache, null, 2));
  console.log(`Saved ${Object.keys(cache).length} sticker image URLs to ${IMAGES_FILE}`);
  return cache;
}

function getImageUrl(imageCache: StickerImageCache, hashName: string, size: number = 128): string {
  const iconUrl = imageCache[hashName];
  if (!iconUrl) return '';
  return `https://community.cloudflare.steamstatic.com/economy/image/${iconUrl}/${size}x${size}`;
}

// ── Iconic stickers (one per major for the comparison table) ─────────
const ICONIC_STICKERS: Record<string, { hashName: string; label: string }> = {
  "Katowice 2014": { hashName: "Sticker | iBUYPOWER (Holo) | Katowice 2014", label: "iBUYPOWER Holo" },
  "Cologne 2014": { hashName: "Sticker | Virtus.Pro (Holo) | Cologne 2014", label: "VP Holo" },
  "Katowice 2015": { hashName: "Sticker | Virtus.Pro (Foil) | Katowice 2015", label: "VP Foil" },
  "Cologne 2015": { hashName: "Sticker | Ninjas in Pyjamas (Foil) | Cologne 2015", label: "NiP Foil" },
  "Cluj-Napoca 2015": { hashName: "Sticker | Luminosity Gaming (Foil) | Cluj-Napoca 2015", label: "LG Foil" },
  "Columbus 2016": { hashName: "Sticker | FaZe Clan (Holo) | MLG Columbus 2016", label: "FaZe Holo" },
  "Cologne 2016": { hashName: "Sticker | Astralis (Holo) | Cologne 2016", label: "Astralis Holo" },
  "Atlanta 2017": { hashName: "Sticker | Astralis (Holo) | Atlanta 2017", label: "Astralis Holo" },
  "Krakow 2017": { hashName: "Sticker | FaZe Clan (Holo) | Krakow 2017", label: "FaZe Holo" },
  "Boston 2018": { hashName: "Sticker | FaZe Clan (Holo) | Boston 2018", label: "FaZe Holo" },
  "London 2018": { hashName: "Sticker | Astralis (Holo) | London 2018", label: "Astralis Holo" },
  "Katowice 2019": { hashName: "Sticker | Astralis (Gold) | Katowice 2019", label: "Astralis Gold" },
  "Berlin 2019": { hashName: "Sticker | Astralis (Gold) | Berlin 2019", label: "Astralis Gold" },
  "Stockholm 2021": { hashName: "Sticker | s1mple (Gold) | Stockholm 2021", label: "s1mple Gold" },
  "Antwerp 2022": { hashName: "Sticker | s1mple (Gold) | Antwerp 2022", label: "s1mple Gold" },
  "Rio 2022": { hashName: "Sticker | s1mple (Gold) | Rio 2022", label: "s1mple Gold" },
  "Paris 2023": { hashName: "Sticker | NiKo (Gold) | Paris 2023", label: "NiKo Gold" },
  "Copenhagen 2024": { hashName: "Sticker | NiKo (Gold) | Copenhagen 2024", label: "NiKo Gold" },
  "Shanghai 2024": { hashName: "Sticker | NiKo (Gold) | PGL Major Copenhagen 2024", label: "NiKo Gold" },
  "Austin 2025": { hashName: "Sticker | NiKo (Gold) | Austin 2025", label: "NiKo Gold" },
};

async function fetchIconicImages(cache: StickerImageCache): Promise<StickerImageCache> {
  let changed = false;
  for (const [major, info] of Object.entries(ICONIC_STICKERS)) {
    if (cache[info.hashName]) continue;
    console.log(`  Fetching iconic image for ${major}: ${info.label}...`);
    const url = `https://steamcommunity.com/market/search/render/?query=${encodeURIComponent(info.hashName)}&appid=730&start=0&count=1&norender=1`;
    try {
      const res = await fetch(url);
      if (res.status === 429) { await new Promise(r => setTimeout(r, 15000)); continue; }
      const data = await res.json() as any;
      if (data.results?.[0]?.asset_description?.icon_url) {
        cache[info.hashName] = data.results[0].asset_description.icon_url;
        changed = true;
      }
      await new Promise(r => setTimeout(r, DELAY_MS));
    } catch (e) {
      console.log(`  Failed to fetch iconic image for ${major}: ${e}`);
    }
  }
  if (changed) {
    await Bun.write(IMAGES_FILE, JSON.stringify(cache, null, 2));
    console.log(`  Updated image cache with iconic sticker images`);
  }
  return cache;
}

// ── Discord Webhooks ────────────────────────────────────────────────
const DISCORD_WEBHOOK_DEFAULT = 'https://discord.com/api/webhooks/1481846126679429201/8qvK6c3cjVdE2XJv7FJk-OtxoizFU2QEz3XUw540U7qjAGMYHREU8Qoa8SODF25DExrb';
const DISCORD_WEBHOOKS = {
  alerts: process.env.DISCORD_ALERTS || DISCORD_WEBHOOK_DEFAULT,
  portfolio: process.env.DISCORD_PORTFOLIO || DISCORD_WEBHOOK_DEFAULT,
  milestones: process.env.DISCORD_MILESTONES || DISCORD_WEBHOOK_DEFAULT,
  signals: process.env.DISCORD_SIGNALS || DISCORD_WEBHOOK_DEFAULT,
  weekly: process.env.DISCORD_WEEKLY || DISCORD_WEBHOOK_DEFAULT,
};

function discordTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

function discordFooter() {
  return { text: `Budapest 2025 Tracker \u2022 ${discordTimestamp()}` };
}

async function sendDiscord(webhookUrl: string, embeds: object[]): Promise<void> {
  if (!webhookUrl) return;
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: embeds.slice(0, 10) }),
    });
    if (!res.ok) console.log(`Discord webhook ${res.status}: ${await res.text()}`);
  } catch (e) {
    console.log(`Discord webhook error: ${e}`);
  }
}

// ── Fetch prices ────────────────────────────────────────────────────
interface PriceResult { price: number; volume: number; }

async function fetchPrice(hashName: string, retries = 2): Promise<PriceResult> {
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
      if (data.lowest_price) {
        const volume = data.volume ? parseInt(data.volume.replace(/,/g, ''), 10) : 0;
        return { price: parsePrice(data.lowest_price), volume };
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
  return { price: 0, volume: 0 };
}

// Fetch sell_listings count from Steam search/render API
async function fetchListings(hashNames: string[]): Promise<Record<string, number>> {
  const listings: Record<string, number> = {};
  // Steam search API returns listings for multiple items at once
  // We'll batch by 100 items per request using the search endpoint
  const batchSize = 100;
  for (let i = 0; i < hashNames.length; i += batchSize) {
    const batch = hashNames.slice(i, i + batchSize);
    try {
      const searchUrl = `https://steamcommunity.com/market/search/render/?appid=730&norender=1&count=${batchSize}&start=0&search_descriptions=0&sort_column=name&sort_dir=asc&category_730_Type%5B%5D=tag_CSGO_Tool_Sticker&q=Budapest+2025`;
      const res = await fetch(searchUrl);
      if (res.ok) {
        const data = await res.json() as any;
        if (data.results) {
          for (const item of data.results) {
            if (item.hash_name && item.sell_listings !== undefined) {
              listings[item.hash_name] = item.sell_listings;
            }
          }
        }
      }
    } catch {}
    if (i + batchSize < hashNames.length) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  return listings;
}

function getPriceStrength(volume: number): string {
  if (volume >= 50) return 'Strong';
  if (volume >= 10) return 'Moderate';
  if (volume >= 1) return 'Weak';
  return 'Dead';
}

function getInvestmentGrade(roi: number, volume: number): { grade: string; color: string } {
  let grade: string;
  const roiPct = roi;
  if (roiPct >= 1000) grade = 'S';
  else if (roiPct > 0) grade = 'A';
  else if (roiPct >= -50) grade = 'B';
  else if (roiPct >= -75) grade = 'C';
  else if (roiPct >= -90) grade = 'D';
  else grade = 'F';

  // Volume-adjust: downgrade 1 tier if volume is Weak/Dead
  const strength = getPriceStrength(volume);
  if (strength === 'Weak' || strength === 'Dead') {
    const tiers = ['S', 'A', 'B', 'C', 'D', 'F'];
    const idx = tiers.indexOf(grade);
    if (idx < tiers.length - 1) grade = tiers[idx + 1];
  }

  const colors: Record<string, string> = { S: '#ffd700', A: '#22c55e', B: '#f59e0b', C: '#f97316', D: '#ef4444', F: '#991b1b' };
  return { grade, color: colors[grade] || '#555' };
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  try {
    console.log('=== Starting Budapest 2025 Tracker Update ===');
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}`;
    const todayFull = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} UTC`;

    console.log('Loading price history...');
    const history = await loadHistory();
    console.log(`Loaded ${history.entries.length} price snapshots`);

    console.log('Fetching sticker images...');
    let imageCache = await fetchStickerImages();
    imageCache = await fetchIconicImages(imageCache);
    console.log(`Image cache ready (${Object.keys(imageCache).length} entries)`);

  // Check if we already have today's data
  const existingToday = history.entries.find(e => e.date === today);
  if (existingToday) {
    console.log(`Already have prices for ${today}. Skipping fetch, rebuilding HTML...`);
  }

  const prices: Record<string, number> = {};
  const volumes: Record<string, number> = {};

  if (!existingToday) {
    console.log(`Fetching prices for ${stickers.length} stickers...`);
    console.log(`Estimated time: ~${Math.ceil(stickers.length * DELAY_MS / 60000)} minutes\n`);

    for (let i = 0; i < stickers.length; i++) {
      const s = stickers[i];
      const hashName = getMarketHashName(s.name, s.quality);
      const key = stickerKey(s.name, s.quality);

      process.stdout.write(`[${i + 1}/${stickers.length}] ${hashName}...`);
      const result = await fetchPrice(hashName);
      prices[key] = result.price;
      volumes[key] = result.volume;

      if (result.price === 0) {
        console.log(` FAILED`);
      } else {
        console.log(` A$${result.price.toFixed(2)} (vol: ${result.volume})`);
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

    // ── Fetch slab prices ──────────────────────────────────────────
    const slabPrices: Record<string, number> = {};
    console.log(`\nFetching slab prices for ${stickers.length} variants...`);
    for (let i = 0; i < stickers.length; i++) {
      const s = stickers[i];
      const slabHash = getSlabMarketHashName(s.name, s.quality);
      const key = stickerKey(s.name, s.quality);
      if (!slabHash) { slabPrices[key] = 0; continue; } // skip capsules
      process.stdout.write(`[SLAB ${i + 1}/${stickers.length}] ${slabHash}...`);
      const slabResult = await fetchPrice(slabHash, 1);
      slabPrices[key] = slabResult.price;
      console.log(slabResult.price === 0 ? ` NO LISTING` : ` A$${slabResult.price.toFixed(2)}`);
      if (i < stickers.length - 1) await new Promise(r => setTimeout(r, DELAY_MS));
    }

    // Calculate totals
    let totalValue = 0;
    const totalCost = stickers.reduce((a, s) => a + s.qty * 0.35, 0);
    for (const s of stickers) {
      totalValue += s.qty * (prices[stickerKey(s.name, s.quality)] || 0);
    }

    // Fetch sell listings from search API
    console.log(`\nFetching sell listings...`);
    const allHashNames = stickers.map(s => getMarketHashName(s.name, s.quality));
    const listingsData = await fetchListings(allHashNames);
    const listings: Record<string, number> = {};
    for (const s of stickers) {
      const key = stickerKey(s.name, s.quality);
      const hashName = getMarketHashName(s.name, s.quality);
      listings[key] = listingsData[hashName] || 0;
    }

    // Save to history
    const { top, bottom } = computePerformers(prices);
    history.entries.push({ date: today, prices, totalValue, totalCost, topPerformers: top, bottomPerformers: bottom, slabPrices, volumes, listings });
    await Bun.write(HISTORY_FILE, JSON.stringify(history, null, 2));
    console.log(`\nSaved price snapshot for ${today}`);
  }

  // Backfill existing entries that lack performer/slab data
  let backfilled = backfillPerformers(history);
  if (backfillSlabPrices(history)) backfilled = true;
  if (backfilled) {
    await Bun.write(HISTORY_FILE, JSON.stringify(history, null, 2));
    console.log('Backfilled performer/slab data for existing history entries');
  }

  // Use today's prices (either just fetched or from history)
  const todayEntry = existingToday || history.entries[history.entries.length - 1];
  const currentPrices = todayEntry.prices;
  const currentVolumes = todayEntry.volumes || {};
  const currentListings = todayEntry.listings || {};

  // ── Build data rows ───────────────────────────────────────────────
  interface Row {
    name: string; quality: string; qty: number; costPerUnit: number;
    totalCost: number; currentPrice: number; totalValue: number;
    profitLoss: number; roi: string; marketUrl: string; hashName: string;
    priceHistory: { date: string; price: number }[];
    imageUrl: string; imageLargeUrl: string; isTeam: boolean;
    volume: number; listings: number; priceStrength: string; grade: string; gradeColor: string;
    allTimeHigh: number; allTimeHighDate: string;
    allTimeLow: number; allTimeLowDate: string;
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

    const vol = currentVolumes[key] || 0;
    const list = currentListings[key] || 0;
    const strength = getPriceStrength(vol);
    const { grade: invGrade, color: gradeColor } = getInvestmentGrade(parseFloat(roi), vol);

    // Compute all-time high and low from price history
    let allTimeHigh = price, allTimeHighDate = todayEntry.date;
    let allTimeLow = price > 0 ? price : Infinity, allTimeLowDate = todayEntry.date;
    for (const h of ph) {
      if (h.price > allTimeHigh) { allTimeHigh = h.price; allTimeHighDate = h.date; }
      if (h.price > 0 && h.price < allTimeLow) { allTimeLow = h.price; allTimeLowDate = h.date; }
    }
    if (allTimeLow === Infinity) { allTimeLow = 0; allTimeLowDate = '-'; }

    data.push({
      name: s.name, quality: s.quality, qty: s.qty, costPerUnit: 0.35,
      totalCost, currentPrice: price, totalValue, profitLoss: pl,
      roi: roi + '%', marketUrl: getMarketUrl(hashName), hashName, priceHistory: ph,
      imageUrl: getImageUrl(imageCache, hashName, 128),
      imageLargeUrl: getImageUrl(imageCache, hashName, 256),
      isTeam: TEAM_NAMES.has(s.name),
      volume: vol, listings: list, priceStrength: strength, grade: invGrade, gradeColor,
      allTimeHigh, allTimeHighDate, allTimeLow, allTimeLowDate,
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

  // Market volume metrics
  const totalVolume24h = data.reduce((a, r) => a + r.volume, 0);
  const avgVolume = data.length > 0 ? totalVolume24h / data.length : 0;
  const strongCount = data.filter(r => r.priceStrength === 'Strong').length;
  const moderateCount = data.filter(r => r.priceStrength === 'Moderate').length;
  const weakCount = data.filter(r => r.priceStrength === 'Weak').length;
  const deadCount = data.filter(r => r.priceStrength === 'Dead').length;
  const strongPct = data.length > 0 ? ((strongCount / data.length) * 100).toFixed(1) : '0';
  const dataWithVolume = data.filter(r => r.volume > 0);
  const medianVolume = dataWithVolume.length > 0 ? (() => {
    const sorted = [...dataWithVolume].map(r => r.volume).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  })() : 0;
  const mostTraded = [...data].filter(r => r.volume > 0).sort((a, b) => b.volume - a.volume).slice(0, 10);
  const leastTraded = [...data].filter(r => r.volume >= 1).sort((a, b) => a.volume - b.volume).slice(0, 10);
  const mostListed = [...data].filter(r => r.listings > 0).sort((a, b) => b.listings - a.listings).slice(0, 10);

  // Player/Team grouping data
  const playerTeamGroups: Record<string, { name: string; rows: Row[]; totalInvested: number; totalValue: number; combinedROI: string; imageUrl: string }> = {};
  for (const r of data) {
    if (!playerTeamGroups[r.name]) {
      const normalRow = data.find(d => d.name === r.name && d.quality === 'Normal');
      playerTeamGroups[r.name] = { name: r.name, rows: [], totalInvested: 0, totalValue: 0, combinedROI: '0%', imageUrl: normalRow?.imageUrl || r.imageUrl };
    }
    playerTeamGroups[r.name].rows.push(r);
    playerTeamGroups[r.name].totalInvested += r.totalCost;
    playerTeamGroups[r.name].totalValue += r.totalValue;
  }
  for (const g of Object.values(playerTeamGroups)) {
    const pl = g.totalValue - g.totalInvested;
    g.combinedROI = g.totalInvested > 0 ? ((pl / g.totalInvested) * 100).toFixed(1) + '%' : '0%';
  }
  const sortedGroups = Object.values(playerTeamGroups).sort((a, b) => b.totalValue - a.totalValue);

  // Extra metrics
  const avgStickerValue = grandValue / grandQty;
  const breakEvenPct = Math.min((grandValue / grandCost) * 100, 999);
  const profitableCount = data.filter(r => r.currentPrice >= 0.35).length;
  const unprofitableCount = data.filter(r => r.currentPrice > 0 && r.currentPrice < 0.35).length;
  const bestPerformer = [...data].filter(r => r.currentPrice > 0).sort((a, b) => b.currentPrice - a.currentPrice)[0];
  const worstPerformer = [...data].filter(r => r.currentPrice > 0).sort((a, b) => a.currentPrice - b.currentPrice)[0];

  // Portfolio all-time high/low
  const portfolioATH = history.entries.length > 0 ? history.entries.reduce((best, e) => e.totalValue > best.totalValue ? e : best, history.entries[0]) : null;
  const portfolioATL = history.entries.length > 0 ? history.entries.reduce((worst, e) => e.totalValue < worst.totalValue ? e : worst, history.entries[0]) : null;

  // Per-sticker all-time records
  const stickerATH = [...data].filter(r => r.allTimeHigh > 0).sort((a, b) => b.allTimeHigh - a.allTimeHigh)[0];
  const stickerATL = [...data].filter(r => r.allTimeLow > 0).sort((a, b) => a.allTimeLow - b.allTimeLow)[0];

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

  // New metrics: Profitable %, Best Quality Tier, Diversity Score
  const profitablePct = ((profitableCount / data.length) * 100).toFixed(1);
  const bestQualityTier = Object.entries(qualityTotals).sort((a, b) => {
    const roiA = (b[1].value - b[1].cost) / b[1].cost;
    const roiB = (a[1].value - a[1].cost) / a[1].cost;
    return roiA - roiB;
  })[0];
  const uniqueNames = new Set(data.map(r => r.name));
  const diversityScore = ((uniqueNames.size / data.length) * 100).toFixed(0);

  // Team vs Player breakdown
  const teamData = data.filter(r => r.isTeam);
  const playerData = data.filter(r => !r.isTeam);
  const teamStats = {
    count: teamData.length,
    qty: teamData.reduce((a, r) => a + r.qty, 0),
    invested: teamData.reduce((a, r) => a + r.totalCost, 0),
    value: teamData.reduce((a, r) => a + r.totalValue, 0),
  };
  const playerStats = {
    count: playerData.length,
    qty: playerData.reduce((a, r) => a + r.qty, 0),
    invested: playerData.reduce((a, r) => a + r.totalCost, 0),
    value: playerData.reduce((a, r) => a + r.totalValue, 0),
  };
  const teamROI = teamStats.invested > 0 ? ((teamStats.value - teamStats.invested) / teamStats.invested * 100).toFixed(1) : '0';
  const playerROI = playerStats.invested > 0 ? ((playerStats.value - playerStats.invested) / playerStats.invested * 100).toFixed(1) : '0';

  // Featured stickers (top 5 by value)
  const featured = [...data].filter(r => r.currentPrice > 0 && r.imageUrl).sort((a, b) => b.currentPrice - a.currentPrice).slice(0, 12);

  // Price distribution histogram bins
  const priceBins = [
    { label: '$0.00-0.05', min: 0, max: 0.05 },
    { label: '$0.05-0.10', min: 0.05, max: 0.10 },
    { label: '$0.10-0.15', min: 0.10, max: 0.15 },
    { label: '$0.15-0.20', min: 0.15, max: 0.20 },
    { label: '$0.20-0.25', min: 0.20, max: 0.25 },
    { label: '$0.25-0.30', min: 0.25, max: 0.30 },
    { label: '$0.30-0.35', min: 0.30, max: 0.35 },
    { label: '$0.35-0.50', min: 0.35, max: 0.50 },
    { label: '$0.50-1.00', min: 0.50, max: 1.00 },
    { label: '$1.00-2.00', min: 1.00, max: 2.00 },
    { label: '$2.00-5.00', min: 2.00, max: 5.00 },
    { label: '$5.00+', min: 5.00, max: Infinity },
  ];
  const priceDistribution = priceBins.map(b => ({
    ...b,
    count: data.filter(r => r.currentPrice > 0 && r.currentPrice >= b.min && r.currentPrice < b.max).length,
  })).filter(b => b.count > 0);

  // Quality breakdown - find representative sticker (highest-value) per quality
  const qualityRepresentatives: Record<string, Row> = {};
  for (const r of data) {
    if (!r.imageUrl) continue;
    const existing = qualityRepresentatives[r.quality];
    if (!existing || r.currentPrice > existing.currentPrice) {
      qualityRepresentatives[r.quality] = r;
    }
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

  // ── Performer Trends (across snapshots) ─────────────────────────────
  interface PerformerTrend {
    name: string; quality: string; appearances: number;
    firstPrice: number; latestPrice: number; priceChange: number; rising: boolean;
  }
  const topAppearances: Record<string, { name: string; quality: string; count: number; firstPrice: number; latestPrice: number }> = {};
  const bottomAppearances: Record<string, { name: string; quality: string; count: number; firstPrice: number; latestPrice: number }> = {};
  for (const entry of history.entries) {
    for (const p of entry.topPerformers || []) {
      const k = `${p.name}|||${p.quality}`;
      if (!topAppearances[k]) topAppearances[k] = { name: p.name, quality: p.quality, count: 0, firstPrice: p.price, latestPrice: p.price };
      topAppearances[k].count++;
      topAppearances[k].latestPrice = p.price;
    }
    for (const p of entry.bottomPerformers || []) {
      const k = `${p.name}|||${p.quality}`;
      if (!bottomAppearances[k]) bottomAppearances[k] = { name: p.name, quality: p.quality, count: 0, firstPrice: p.price, latestPrice: p.price };
      bottomAppearances[k].count++;
      bottomAppearances[k].latestPrice = p.price;
    }
  }
  const topTrends: PerformerTrend[] = Object.values(topAppearances)
    .sort((a, b) => b.count - a.count || b.latestPrice - a.latestPrice)
    .slice(0, 10)
    .map(t => ({ name: t.name, quality: t.quality, appearances: t.count, firstPrice: t.firstPrice, latestPrice: t.latestPrice, priceChange: t.latestPrice - t.firstPrice, rising: t.latestPrice >= t.firstPrice }));
  const bottomTrends: PerformerTrend[] = Object.values(bottomAppearances)
    .sort((a, b) => b.count - a.count || a.latestPrice - b.latestPrice)
    .slice(0, 10)
    .map(t => ({ name: t.name, quality: t.quality, appearances: t.count, firstPrice: t.firstPrice, latestPrice: t.latestPrice, priceChange: t.latestPrice - t.firstPrice, rising: t.latestPrice >= t.firstPrice }));

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
    // Last 4 majors — updated with researched prices (March 2026, AUD ≈ 1.55x USD)
    // Paris 2023: 30mo post-removal, worst investment ever ($110M sales, 377K listings). Capsules $0.07-$0.09 USD
    { name: "Paris 2023", date: "2023-05-21", monthsOld: monthsSince("2023-05-21"), avgPaper: 0.14, avgMidTier: 0.73, avgHolo: 11.10, avgGold: 34.81 },
    // Copenhagen 2024: 18mo post-removal, first CS2 major. Capsules $0.42-$0.71 USD, donk Gold ~$111 USD
    { name: "Copenhagen 2024", date: "2024-03-31", monthsOld: monthsSince("2024-03-31"), avgPaper: 0.12, avgMidTier: 2.15, avgHolo: 23.10, avgGold: 172.73 },
    // Shanghai 2024: 11mo post-removal, only 20% of Paris volume. Capsules $0.39-$0.59 USD, donk Gold ~$62 USD
    { name: "Shanghai 2024", date: "2024-12-15", monthsOld: monthsSince("2024-12-15"), avgPaper: 0.09, avgMidTier: 1.19, avgHolo: 22.48, avgGold: 96.10 },
    // Austin 2025: 5mo post-removal, shortest sale (48 days). Capsules $0.27-$0.41 USD, 121K listings
    { name: "Austin 2025", date: "2025-06-15", monthsOld: monthsSince("2025-06-15"), avgPaper: 0.05, avgMidTier: 0.34, avgHolo: 16.12, avgGold: 41.54 },
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
  const KATOWICE_2014_WEIGHT = 0.02; // Heavy de-weight Katowice 2014 (extreme outlier, not realistic for modern majors)
  const RECENCY_BOOST = 5; // 5x weight for last 4 majors (data-driven short-term predictions)
  // 2-week intervals for first year, monthly for year 2, then quarterly/yearly out to 12 years
  const timePoints = [
    0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12,
    13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    27, 30, 33, 36, 42, 48, 54, 60, 72, 84, 96, 120, 144,
  ];
  interface TimeProjection { months: number; label: string; avgROI: number; projectedValue: number; projectedPerSticker: number; actualValue?: number; actualROI?: number; }
  const timeProjections: TimeProjection[] = timePoints.map(targetMonths => {
    // Find majors near this age and interpolate
    const nearby = projections.filter(p => Math.abs(p.monthsOld - targetMonths) <= 12);
    let avgROI: number;
    if (nearby.length > 0) {
      // Weight closer majors more heavily, with recency bias for last 4 majors
      let totalWeight = 0, weightedROI = 0;
      for (const p of nearby) {
        const w = (1 / (1 + Math.abs(p.monthsOld - targetMonths))) * (recentMajors.has(p.name) ? RECENCY_BOOST : 1) * (p.name === 'Katowice 2014' ? KATOWICE_2014_WEIGHT : 1);
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
      label: targetMonths < 1 ? `${Math.round(targetMonths * 30.44)} days` : targetMonths < 12 ? `${targetMonths} mo` : `${(targetMonths / 12).toFixed(1)} yr`,
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

  // Build actual portfolio trajectory for prediction chart overlay
  // Each snapshot becomes a data point at its real month offset from Budapest release
  const actualTrajectory: { months: number; value: number }[] = [];
  for (const entry of history.entries) {
    const entryDate = new Date(entry.date);
    const monthsFromRelease = (entryDate.getTime() - BUDAPEST_EVENT.getTime()) / (30.44 * 86400000);
    if (monthsFromRelease >= 0) {
      actualTrajectory.push({ months: +monthsFromRelease.toFixed(1), value: entry.totalValue });
    }
  }
  // Also add "Now" as the latest point
  const nowMonthsFromRelease = (refDate.getTime() - BUDAPEST_EVENT.getTime()) / (30.44 * 86400000);
  if (actualTrajectory.length === 0 || actualTrajectory[actualTrajectory.length - 1].months !== +nowMonthsFromRelease.toFixed(1)) {
    actualTrajectory.push({ months: +nowMonthsFromRelease.toFixed(1), value: grandValue });
  }

  // For the chart: map actual values onto the same x-axis labels as predictions
  // The x-axis labels are: "Now", "6 months", "1.0 years", ...
  // We need to place actual values at the closest label or use null for labels without data
  const actualDataForChart: (number | null)[] = [grandValue]; // "Now" always has actual
  for (const tp of timeProjections) {
    if (tp.actualValue !== undefined) {
      actualDataForChart.push(tp.actualValue);
    } else {
      actualDataForChart.push(null);
    }
  }

  // Find estimated break-even month
  let breakEvenMonths = 0;
  for (let m = 1; m <= 120; m++) {
    const nearby = projections.filter(p => Math.abs(p.monthsOld - m) <= 12);
    if (nearby.length > 0) {
      let tw = 0, wr = 0;
      for (const p of nearby) { const w = (1 / (1 + Math.abs(p.monthsOld - m))) * (recentMajors.has(p.name) ? RECENCY_BOOST : 1) * (p.name === 'Katowice 2014' ? KATOWICE_2014_WEIGHT : 1); wr += p.roi * w; tw += w; }
      if (wr / tw >= 0) { breakEvenMonths = m; break; }
    }
  }

  const bestMajor = projections.find(p => p.bestMajor)!;

  // ── Investment Score (1-10) ──────────────────────────────────────
  const budapestMonths = monthsSince("2025-09-15");
  // Factor 1: Cycle position (early = bullish accumulation phase)
  const cycleScore = budapestMonths <= 6 ? 8 : budapestMonths <= 18 ? 7 : budapestMonths <= 48 ? 5 : 3;
  const cycleLabel = budapestMonths <= 6 ? 'Accumulation Phase' : budapestMonths <= 18 ? 'Early Growth' : budapestMonths <= 48 ? 'Appreciation' : 'Mature';
  // Factor 2: Performance vs history at same age
  const nearbyForScore = projections.filter(p => p.name !== 'Katowice 2014' && Math.abs(p.monthsOld - budapestMonths) <= 12);
  const avgHistROI = nearbyForScore.length > 0 ? nearbyForScore.reduce((a, p) => a + p.roi, 0) / nearbyForScore.length : 0;
  const currentROI = parseFloat(grandROI);
  const perfScore = currentROI > avgHistROI ? 8 : currentROI > avgHistROI * 0.5 ? 6 : currentROI > 0 ? 4 : 2;
  // Factor 3: Quality mix (higher tier = more upside)
  const premiumPct = (userHoloCount + userGoldCount) / userTotal;
  const qualityMixScore = premiumPct > 0.15 ? 8 : premiumPct > 0.08 ? 6 : premiumPct > 0.03 ? 4 : 2;
  // Factor 4: Momentum (requires 2+ snapshots)
  let momentumScore = 5;
  if (history.entries.length >= 2) {
    const prev = history.entries[history.entries.length - 2];
    const curr = history.entries[history.entries.length - 1];
    const change = (curr.totalValue - prev.totalValue) / prev.totalValue;
    momentumScore = change > 0.05 ? 9 : change > 0 ? 7 : change > -0.05 ? 4 : 2;
  }
  // Factor 5: Diversification
  const divPct = uniqueNames.size / data.length;
  const divScore = divPct > 0.5 ? 7 : divPct > 0.3 ? 5 : 3;
  // Weighted average
  const investmentScore = Math.min(10, Math.max(1, Math.round(cycleScore * 0.25 + perfScore * 0.25 + qualityMixScore * 0.2 + momentumScore * 0.15 + divScore * 0.15)));
  const investmentSignal = investmentScore >= 7 ? 'BUY MORE' : investmentScore >= 4 ? 'HOLD' : 'WAIT';
  const signalColor = investmentScore >= 7 ? '#22c55e' : investmentScore >= 4 ? '#f59e0b' : '#ef4444';
  const scoreFactors = [
    { name: 'Cycle Position', score: cycleScore, detail: `${cycleLabel} (${budapestMonths} months)` },
    { name: 'Performance vs History', score: perfScore, detail: `${currentROI.toFixed(1)}% vs avg ${avgHistROI.toFixed(1)}%` },
    { name: 'Quality Mix', score: qualityMixScore, detail: `${(premiumPct * 100).toFixed(1)}% premium (Holo+Gold)` },
    { name: 'Price Momentum', score: momentumScore, detail: history.entries.length >= 2 ? 'Based on last 2 snapshots' : 'Need more data' },
    { name: 'Diversification', score: divScore, detail: `${uniqueNames.size} unique across ${data.length} items` },
  ];

  // ── Quality Tier ROI Analysis (historical) ────────────────────────
  // Approximate initial buy prices per quality tier
  const INITIAL_PRICES: Record<string, number> = { Paper: 0.15, MidTier: 0.60, Holo: 0.50, Gold: 3.00 };
  interface TierROI { major: string; paper: number; mid: number; holo: number; gold: number; }
  const post2019Majors = historicalMajors.filter(m => new Date(m.date) >= new Date('2019-01-01'));
  const tierROIData: TierROI[] = post2019Majors.map(m => ({
    major: m.name.replace('Katowice ', 'Kato ').replace('Copenhagen ', 'Cph ').replace('Stockholm ', 'Stk '),
    paper: ((m.avgPaper - INITIAL_PRICES.Paper) / INITIAL_PRICES.Paper) * 100,
    mid: ((m.avgMidTier - INITIAL_PRICES.MidTier) / INITIAL_PRICES.MidTier) * 100,
    holo: ((m.avgHolo - INITIAL_PRICES.Holo) / INITIAL_PRICES.Holo) * 100,
    gold: m.avgGold > 0 ? ((m.avgGold - INITIAL_PRICES.Gold) / INITIAL_PRICES.Gold) * 100 : 0,
  }));
  const avgTierROI = {
    paper: tierROIData.reduce((a, t) => a + t.paper, 0) / tierROIData.length,
    mid: tierROIData.reduce((a, t) => a + t.mid, 0) / tierROIData.length,
    holo: tierROIData.reduce((a, t) => a + t.holo, 0) / tierROIData.length,
    gold: tierROIData.filter(t => t.gold > 0).reduce((a, t) => a + t.gold, 0) / (tierROIData.filter(t => t.gold > 0).length || 1),
  };
  const bestTier = Object.entries(avgTierROI).sort((a, b) => b[1] - a[1])[0];

  // ── Risk Assessment ───────────────────────────────────────────────
  const top5Value = [...data].sort((a, b) => b.totalValue - a.totalValue).slice(0, 5).reduce((a, r) => a + r.totalValue, 0);
  const concentrationPct = (top5Value / grandValue) * 100;
  const concentrationRisk = concentrationPct > 40 ? 'HIGH' : concentrationPct > 25 ? 'MEDIUM' : 'LOW';
  const concentrationColor = concentrationPct > 40 ? '#ef4444' : concentrationPct > 25 ? '#f59e0b' : '#22c55e';
  // Optimal mix (based on historical returns): ~60% Normal, 20% Embroidered, 15% Holo, 5% Gold
  const optimalMix = { normal: 0.60, embroidered: 0.20, holo: 0.15, gold: 0.05 };
  const mixDeviation = Math.abs(pctNormal - optimalMix.normal) + Math.abs(pctEmbroidered - optimalMix.embroidered) + Math.abs(pctHolo - optimalMix.holo) + Math.abs(pctGold - optimalMix.gold);
  const qualityRisk = mixDeviation > 0.4 ? 'HIGH' : mixDeviation > 0.2 ? 'MEDIUM' : 'LOW';
  const qualityRiskColor = mixDeviation > 0.4 ? '#ef4444' : mixDeviation > 0.2 ? '#f59e0b' : '#22c55e';
  // Liquidity estimate
  const highLiqCount = data.filter(r => r.currentPrice < 0.50 && r.currentPrice > 0).length;
  const medLiqCount = data.filter(r => r.currentPrice >= 0.50 && r.currentPrice < 5.00).length;
  const lowLiqCount = data.filter(r => r.currentPrice >= 5.00).length;
  const liquidityRisk = lowLiqCount > data.length * 0.3 ? 'LOW' : medLiqCount > data.length * 0.3 ? 'MEDIUM' : 'HIGH';
  const liquidityLabel = liquidityRisk === 'HIGH' ? 'High Liquidity' : liquidityRisk === 'MEDIUM' ? 'Medium Liquidity' : 'Low Liquidity';
  const liquidityColor = liquidityRisk === 'LOW' ? '#ef4444' : liquidityRisk === 'MEDIUM' ? '#f59e0b' : '#22c55e';

  // ── Sell Timing Analysis ──────────────────────────────────────────
  // Analyze historical peak times (excluding Katowice 2014 as an outlier)
  // For each major, estimate peak appreciation period based on age and ROI
  interface SellWindow { label: string; months: number; avgROI: number; majorsInRange: string[]; recommendation: string; }
  const sellWindows: SellWindow[] = [
    { label: '2 Weeks', months: 0.5, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '1 Month', months: 1, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '3 Months', months: 3, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '6 Months', months: 6, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '1 Year', months: 12, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '1.5 Years', months: 18, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '2 Years', months: 24, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '3 Years', months: 36, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '5 Years', months: 60, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '7 Years', months: 84, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '10 Years', months: 120, avgROI: 0, majorsInRange: [], recommendation: '' },
  ];
  const realisticProjections = projections.filter(p => p.name !== 'Katowice 2014');
  for (const sw of sellWindows) {
    const searchRadius = Math.max(6, sw.months * 0.5); // proportional search radius
    const nearby = realisticProjections.filter(p => Math.abs(p.monthsOld - sw.months) <= searchRadius);
    if (nearby.length > 0) {
      let tw = 0, wr = 0;
      for (const p of nearby) {
        const w = 1 / (1 + Math.abs(p.monthsOld - sw.months));
        wr += p.roi * w;
        tw += w;
      }
      sw.avgROI = wr / tw;
      sw.majorsInRange = nearby.map(p => p.name);
    }
    if (sw.avgROI > 500) sw.recommendation = 'STRONG SELL';
    else if (sw.avgROI > 200) sw.recommendation = 'CONSIDER SELLING';
    else if (sw.avgROI > 50) sw.recommendation = 'HOLD FOR MORE';
    else if (sw.avgROI > 0) sw.recommendation = 'HOLD';
    else sw.recommendation = 'TOO EARLY';
  }
  const peakWindow = [...sellWindows].sort((a, b) => b.avgROI - a.avgROI)[0];
  const bestSellMonths = peakWindow.months;
  const bestSellDate = new Date(new Date("2025-09-15").getTime() + bestSellMonths * 30.44 * 86400000);
  const bestSellStr = `${bestSellDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

  // ── Slab Analysis Data ────────────────────────────────────────────
  const currentSlabPrices = todayEntry.slabPrices || {};
  interface SlabRow { name: string; quality: string; stickerPrice: number; fiveXPrice: number; slabPrice: number; premiumPct: number; verdict: string; verdictColor: string; hashName: string; }
  const slabRows: SlabRow[] = [];
  let slabsCheaper = 0, slabsAvailable = 0, totalPremium = 0;
  for (const s of stickers) {
    const key = stickerKey(s.name, s.quality);
    const stickerPrice = currentPrices[key] || 0;
    const slabPrice = currentSlabPrices[key] || 0;
    const fiveX = stickerPrice * 5;
    const hashName = getSlabMarketHashName(s.name, s.quality);
    if (slabPrice > 0 && stickerPrice > 0) {
      slabsAvailable++;
      const premium = ((slabPrice - fiveX) / fiveX) * 100;
      totalPremium += premium;
      if (premium < 0) slabsCheaper++;
      slabRows.push({
        name: s.name, quality: s.quality, stickerPrice, fiveXPrice: fiveX, slabPrice,
        premiumPct: premium, hashName,
        verdict: premium < -5 ? 'Buy Slab' : premium > 5 ? 'Buy Individual' : 'Similar',
        verdictColor: premium < -5 ? '#22c55e' : premium > 5 ? '#ef4444' : '#888',
      });
    } else if (stickerPrice > 0) {
      slabRows.push({ name: s.name, quality: s.quality, stickerPrice, fiveXPrice: fiveX, slabPrice: 0, premiumPct: 0, hashName, verdict: 'No Listing', verdictColor: '#555' });
    }
  }
  // Deduplicate slab rows (same name+quality appears once)
  const seenSlabs = new Set<string>();
  const uniqueSlabRows = slabRows.filter(r => {
    const k = `${r.name}|||${r.quality}`;
    if (seenSlabs.has(k)) return false;
    seenSlabs.add(k);
    return true;
  });
  const avgPremium = slabsAvailable > 0 ? totalPremium / slabsAvailable : 0;

  // Helper to generate strength bar HTML
  function strengthBarsHtml(strength: string): string {
    const levels: Record<string, { bars: number; color: string }> = {
      Strong: { bars: 4, color: '#22c55e' },
      Moderate: { bars: 3, color: '#f59e0b' },
      Weak: { bars: 2, color: '#f97316' },
      Dead: { bars: 1, color: '#ef4444' },
    };
    const { bars, color } = levels[strength] || { bars: 0, color: '#555' };
    let html = '<div class="strength-bars" title="' + strength + '">';
    for (let i = 1; i <= 4; i++) {
      const h = 4 + i * 3;
      const bg = i <= bars ? color : 'rgba(255,255,255,0.08)';
      html += '<div class="strength-bar" style="height:' + h + 'px;background:' + bg + '"></div>';
    }
    html += '</div> <span style="font-size:10px;color:' + color + ';margin-left:4px">' + strength + '</span>';
    return html;
  }

  // Helper to generate grade badge HTML
  function gradeBadgeHtml(grade: string, color: string): string {
    return '<span class="grade-badge" style="background:' + color + '20;color:' + color + '">' + grade + '</span>';
  }

  // ── Generate CSV ──────────────────────────────────────────────────
  let csvOut = "Sticker Name,Quality,Qty,Cost/Unit (AUD),Total Cost (AUD),Current Price (AUD),Total Value (AUD),Profit/Loss (AUD),ROI %,Steam Market Link\n";
  for (const r of data) {
    const esc = (s: string) => s.includes(',') ? `"${s}"` : s;
    csvOut += `${esc(r.name)},${esc(r.quality)},${r.qty},0.35,${r.totalCost.toFixed(2)},${r.currentPrice.toFixed(2)},${r.totalValue.toFixed(2)},${r.profitLoss.toFixed(2)},${r.roi},${r.marketUrl}\n`;
  }
  csvOut += `\nTOTAL,,${grandQty},,${grandCost.toFixed(2)},,${grandValue.toFixed(2)},${grandPL.toFixed(2)},${grandROI}%,\n`;
  console.log(`Writing CSV (${csvOut.length} bytes)...`);
  await Bun.write(CSV_FILE, csvOut);
  console.log(`CSV written successfully`);

  // ── Generate HTML ─────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Budapest 2025 Sticker Investment Tracker</title>
<link rel="icon" type="image/webp" href="https://cdn.csgoskins.gg/public/uih/tournaments/aHR0cHM6Ly9jc2dvc2tpbnMuZ2cvYnVpbGQvYXNzZXRzLzIwMjUtc3RhcmxhZGRlci1idWRhcGVzdC1ESnM3aFlfdi5wbmc-/auto/auto/85/notrim/eec62b9fb416cc1a7052736b519b8499.webp">
<meta property="og:title" content="Budapest 2025 Sticker Investment Tracker">
<meta property="og:description" content="Live tracking of CS2 Budapest 2025 Major sticker investments - updated 6x daily">
<meta property="og:image" content="https://cdn.csgoskins.gg/public/uih/tournaments/aHR0cHM6Ly9jc2dvc2tpbnMuZ2cvYnVpbGQvYXNzZXRzLzIwMjUtc3RhcmxhZGRlci1idWRhcGVzdC1ESnM3aFlfdi5wbmc-/auto/auto/85/notrim/eec62b9fb416cc1a7052736b519b8499.webp">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', 'Motiva Sans', Arial, Helvetica, sans-serif; background: #1b2838; color: #c6d4df; padding: 0; min-height: 100vh; }
  ::selection { background: rgba(102,192,244,0.3); }
  .page-content { max-width: 1200px; margin: 0 auto; padding: 20px 24px 40px; }
  h1 { color: #fff; font-size: 28px; font-weight: 700; letter-spacing: -0.3px; }
  .subtitle { color: #8f98a0; font-size: 13px; margin-top: 4px; margin-bottom: 24px; font-weight: 400; }
  .subtitle span { color: #acb2b8; }
  h3 { color: #fff; margin: 32px 0 14px; font-size: 16px; font-weight: 600; letter-spacing: -0.2px; display: flex; align-items: center; gap: 8px; }
  h3::before { content: ''; display: inline-block; width: 3px; height: 16px; background: #66c0f4; border-radius: 2px; }

  /* Steam profile header */
  .steam-header { background: linear-gradient(180deg, #2a475e 0%, #1b2838 100%); border-bottom: 1px solid #0e1a26; padding: 20px 0; margin-bottom: 0; }
  .steam-header-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 20px; }
  .steam-avatar { width: 64px; height: 64px; border-radius: 4px; border: 2px solid #66c0f4; }
  .steam-profile-info { flex: 1; }
  .steam-profile-name { font-size: 22px; font-weight: 700; color: #fff; }
  .steam-profile-name a { color: #fff; text-decoration: none; }
  .steam-profile-name a:hover { color: #66c0f4; }
  .steam-profile-sub { font-size: 12px; color: #8f98a0; margin-top: 2px; }
  .steam-profile-sub a { color: #66c0f4; text-decoration: none; }
  .steam-profile-sub a:hover { text-decoration: underline; }
  .steam-profile-links { display: flex; gap: 10px; }
  .steam-link-btn { background: rgba(103,193,245,0.1); border: 1px solid rgba(103,193,245,0.3); color: #67c1f5; padding: 6px 14px; border-radius: 2px; font-size: 11px; font-weight: 600; text-decoration: none; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.5px; }
  .steam-link-btn:hover { background: rgba(103,193,245,0.2); color: #fff; }

  /* Cards — Steam market style */
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

  /* Break-even progress */
  .progress-section { margin-bottom: 24px; }
  .progress-bar-outer { background: rgba(0,0,0,0.3); border: 1px solid rgba(0,0,0,0.4); border-radius: 2px; height: 28px; overflow: hidden; position: relative; }
  .progress-bar-inner { height: 100%; border-radius: 2px; transition: width 0.5s ease; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; font-size: 12px; font-weight: 700; min-width: 60px; }
  .progress-labels { display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; color: #8f98a0; font-weight: 500; }

  /* Charts */
  .chart-container { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 20px; margin-bottom: 24px; }
  canvas { width: 100% !important; max-height: 280px; }

  /* Quality cards */
  .quality-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px; margin-bottom: 24px; }
  .qs-card { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 14px 16px; font-size: 13px; transition: background 0.2s; }
  .qs-card:hover { background: rgba(103,193,245,0.05); }
  .qs-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
  .qs-stat { font-size: 12px; color: #8f98a0; }
  .qs-val { font-weight: 600; }

  /* Snapshot history */
  .history-table { font-size: 13px; margin-bottom: 24px; border-collapse: separate; border-spacing: 0; }
  .history-table th { background: #1a3a52; color: #8f98a0; padding: 8px 12px; text-align: left; border-bottom: 1px solid #0e1a26; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
  .history-table td { padding: 8px 12px; border-bottom: 1px solid rgba(0,0,0,0.2); }
  .history-table tr:hover td { background: rgba(103,193,245,0.03); }

  /* Filter bar */
  .filter-bar { margin-bottom: 12px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .filter-bar input, .filter-bar select { background: rgba(0,0,0,0.3); border: 1px solid #2a475e; color: #c6d4df; padding: 8px 12px; border-radius: 2px; font-size: 13px; font-family: inherit; transition: border-color 0.2s; outline: none; }
  .filter-bar input { width: 300px; }
  .filter-bar input:focus, .filter-bar select:focus { border-color: #66c0f4; }

  /* Main table — Steam market style */
  table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
  thead { position: sticky; top: 48px; z-index: 10; }
  th { background: #1a3a52; color: #8f98a0; padding: 8px 8px; text-align: left; border-bottom: 1px solid #0e1a26; cursor: pointer; user-select: none; white-space: nowrap; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; transition: color 0.2s; }
  th:hover { color: #66c0f4; }
  td { padding: 7px 8px; border-bottom: 1px solid rgba(0,0,0,0.15); font-variant-numeric: tabular-nums; }
  tbody tr { transition: background 0.15s; }
  tbody tr:nth-child(even) { background: rgba(0,0,0,0.1); }
  tbody tr:hover { background: rgba(103,193,245,0.05); }
  tr.total-row { background: #1a3a52; font-weight: 700; }
  tr.total-row td { border-top: 2px solid #66c0f4; padding: 10px 8px; }
  a { color: #67c1f5; text-decoration: none; font-weight: 500; transition: color 0.2s; }
  a:hover { color: #fff; }

  /* Quality badges — Steam rarity style */
  .quality-badge { display: inline-block; padding: 2px 8px; border-radius: 2px; font-size: 10px; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase; }
  .q-normal { background: rgba(176,195,217,0.1); color: #b0c3d9; }
  .q-embroidered { background: rgba(75,105,255,0.15); color: #4b69ff; border: 1px solid rgba(75,105,255,0.2); }
  .q-holo { background: rgba(136,71,255,0.15); color: #8847ff; border: 1px solid rgba(136,71,255,0.2); }
  .q-gold { background: rgba(255,215,0,0.1); color: #ffd700; border: 1px solid rgba(255,215,0,0.2); }
  .q-champion { background: rgba(235,75,75,0.12); color: #eb4b4b; border: 1px solid rgba(235,75,75,0.2); }
  .q-capsule { background: rgba(102,192,244,0.12); color: #66c0f4; border: 1px solid rgba(102,192,244,0.2); }

  /* ROI bar in table */
  .roi-bar { display: flex; align-items: center; gap: 6px; }
  .roi-fill { height: 4px; border-radius: 2px; min-width: 2px; max-width: 60px; }

  /* Top/Bottom tables */
  .split-tables { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  @media (max-width: 1200px) { .split-tables { grid-template-columns: 1fr; } }
  .sub-table { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 16px; }
  .sub-table h4 { color: #fff; font-size: 14px; font-weight: 700; margin-bottom: 10px; }
  .sub-table table { font-size: 12px; }

  /* Footer — Steam style */
  .footer { margin-top: 40px; padding: 20px; text-align: center; border-top: 1px solid rgba(0,0,0,0.3); background: rgba(0,0,0,0.15); }
  .footer p { color: #8f98a0; font-size: 12px; margin: 4px 0; }
  .footer strong { color: #acb2b8; }
  .footer a { color: #67c1f5; }

  .snapshot-count { color: #8f98a0; font-size: 13px; margin-bottom: 16px; font-style: italic; }

  /* Distance badge */
  .dist-badge { font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 2px; }
  .dist-pos { background: rgba(91,163,43,0.15); color: #5ba32b; }
  .dist-neg { background: rgba(195,60,60,0.15); color: #c33c3c; }

  /* Time to ROI */
  .roi-time { font-size: 11px; color: #8f98a0; font-weight: 500; }
  .roi-time.achieved { color: #5ba32b; }
  .roi-time.declining { color: #c33c3c; }

  /* Sticker thumbnails */
  .sticker-thumb { width: 32px; height: 32px; vertical-align: middle; margin-right: 6px; border-radius: 2px; image-rendering: auto; }
  .sticker-name-cell { display: flex; align-items: center; gap: 6px; }

  /* Featured stickers — Steam item cards */
  .featured-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .featured-card { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 16px; text-align: center; transition: background 0.2s, transform 0.2s; position: relative; overflow: hidden; cursor: pointer; }
  .featured-card:hover { background: rgba(103,193,245,0.08); transform: translateY(-2px); }
  .featured-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(102,192,244,0.3), transparent); }
  .featured-card img { width: 120px; height: 120px; margin: 8px auto; display: block; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4)); }
  .featured-name { font-size: 14px; font-weight: 600; color: #fff; margin-top: 8px; }
  .featured-price { font-size: 20px; font-weight: 700; margin-top: 4px; }
  .featured-roi { font-size: 11px; margin-top: 2px; font-weight: 600; }
  .featured-rank { position: absolute; top: 10px; left: 12px; font-size: 18px; font-weight: 800; color: rgba(102,192,244,0.3); }

  /* Team vs Player */
  .tvp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  @media (max-width: 800px) { .tvp-grid { grid-template-columns: 1fr; } }
  .tvp-card { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 16px 20px; }
  .tvp-card h4 { font-size: 14px; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .tvp-stat { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid rgba(0,0,0,0.2); font-size: 13px; }
  .tvp-stat:last-child { border-bottom: none; }
  .tvp-label { color: #8f98a0; }
  .tvp-val { font-weight: 600; }

  /* Donut chart */
  .chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  @media (max-width: 1000px) { .chart-row { grid-template-columns: 1fr; } }
  .chart-box { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 20px; }
  .chart-box canvas { max-height: 300px; }

  /* Investment Signal */
  .signal-card { background: rgba(0,0,0,0.25); border: 2px solid; border-radius: 4px; padding: 24px 28px; margin-bottom: 24px; position: relative; overflow: hidden; }
  .signal-header { display: flex; align-items: center; gap: 20px; margin-bottom: 16px; }
  .signal-score { font-size: 48px; font-weight: 900; line-height: 1; }
  .signal-label { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
  .signal-sub { font-size: 13px; color: #8f98a0; }
  .signal-factors { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin-top: 14px; }
  .signal-factor { display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; background: rgba(0,0,0,0.2); border-radius: 2px; font-size: 12px; }
  .signal-factor-name { color: #8f98a0; }
  .signal-factor-score { font-weight: 700; }

  /* Risk cards */
  .risk-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 24px; }
  .risk-card { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 16px 18px; }
  .risk-badge { display: inline-block; padding: 3px 10px; border-radius: 2px; font-size: 11px; font-weight: 800; letter-spacing: 1px; }

  /* Sell timing */
  .sell-card { background: rgba(0,0,0,0.2); border: 1px solid #66c0f4; border-radius: 4px; padding: 18px 22px; margin-bottom: 14px; }

  /* Slab table */
  .slab-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 16px; }

  /* Market cycle */
  .cycle-callout { background: rgba(0,0,0,0.2); border-left: 3px solid #66c0f4; border-radius: 0 4px 4px 0; padding: 14px 18px; margin-bottom: 20px; font-size: 13px; color: #acb2b8; }
  .cycle-callout strong { color: #66c0f4; }

  /* Iconic sticker in table */
  .iconic-thumb { width: 40px; height: 40px; vertical-align: middle; border-radius: 2px; }

  /* Sticky Nav — Steam top bar style */
  .sticky-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: #171a21; border-bottom: 1px solid #0e1a26; padding: 0 24px; display: flex; align-items: center; gap: 0; height: 48px; }
  .sticky-nav a { color: #b8b6b4; font-size: 12px; font-weight: 600; text-decoration: none; padding: 14px 12px; transition: color 0.2s, background 0.2s; border-bottom: 2px solid transparent; white-space: nowrap; }
  .sticky-nav a:hover, .sticky-nav a.active { color: #fff; background: rgba(255,255,255,0.05); }
  body { padding-top: 48px; }

  /* Grid view toggle */
  .view-toggle { display: inline-flex; gap: 0; margin-left: 12px; }
  .view-toggle button { background: rgba(0,0,0,0.3); border: 1px solid #2a475e; color: #8f98a0; padding: 6px 14px; font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; }
  .view-toggle button:first-child { border-radius: 2px 0 0 2px; }
  .view-toggle button:last-child { border-radius: 0 2px 2px 0; }
  .view-toggle button.active { background: rgba(103,193,245,0.15); color: #67c1f5; border-color: rgba(103,193,245,0.3); }

  /* Sticker grid — Steam inventory style */
  .sticker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; display: none; }
  .sticker-grid.visible { display: grid; }
  .grid-card { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; padding: 14px; text-align: center; cursor: pointer; transition: background 0.2s, transform 0.2s; position: relative; overflow: hidden; }
  .grid-card:hover { transform: translateY(-2px); background: rgba(103,193,245,0.05); }
  .grid-card.profitable { border-left: 3px solid #5ba32b; }
  .grid-card.losing { border-left: 3px solid #c33c3c; }
  .grid-card.premium { border-left: 3px solid #ffd700; }
  .grid-card img { width: 80px; height: 80px; margin: 4px auto; display: block; }
  .grid-card-name { font-size: 13px; font-weight: 600; color: #fff; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .grid-card-price { font-size: 18px; font-weight: 700; margin-top: 2px; }
  .grid-card-roi { font-size: 11px; font-weight: 600; margin-top: 2px; }

  /* Sticker detail modal — Steam item inspect */
  .modal-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); z-index: 2000; justify-content: center; align-items: center; animation: fadeIn 0.2s; }
  .modal-overlay.visible { display: flex; }
  .modal-content { background: #1b2838; border: 1px solid #2a475e; border-radius: 4px; padding: 28px; max-width: 480px; width: 90%; position: relative; animation: slideUp 0.25s; }
  .modal-close { position: absolute; top: 10px; right: 14px; background: none; border: none; color: #8f98a0; font-size: 22px; cursor: pointer; padding: 4px 8px; transition: color 0.2s; }
  .modal-close:hover { color: #fff; }
  .modal-img { width: 192px; height: 192px; margin: 0 auto 14px; display: block; }
  .modal-name { font-size: 20px; font-weight: 700; color: #fff; text-align: center; }
  .modal-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px; }
  .modal-stat { padding: 8px; background: rgba(0,0,0,0.2); border-radius: 2px; }
  .modal-stat-label { font-size: 10px; text-transform: uppercase; color: #8f98a0; letter-spacing: 1px; font-weight: 600; }
  .modal-stat-val { font-size: 15px; font-weight: 700; margin-top: 2px; color: #c6d4df; }
  .modal-sparkline { margin: 14px 0; }
  .modal-link { display: block; text-align: center; margin-top: 10px; color: #67c1f5; font-weight: 600; font-size: 14px; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* Price strength indicator */
  .strength-bars { display: inline-flex; gap: 2px; align-items: flex-end; height: 16px; vertical-align: middle; }
  .strength-bar { width: 4px; border-radius: 1px; transition: background 0.2s; }

  /* Investment grade badge */
  .grade-badge { display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 2px; font-size: 11px; font-weight: 900; }

  /* Scroll to top */
  .scroll-top { position: fixed; bottom: 30px; right: 30px; width: 40px; height: 40px; border-radius: 2px; background: rgba(103,193,245,0.15); border: 1px solid rgba(103,193,245,0.3); color: #67c1f5; font-size: 18px; cursor: pointer; display: none; align-items: center; justify-content: center; z-index: 999; transition: opacity 0.3s, background 0.2s; }
  .scroll-top:hover { background: rgba(103,193,245,0.25); color: #fff; }
  .scroll-top.visible { display: flex; }

  /* CSV download button — Steam green button */
  .btn-download { background: linear-gradient(to right, #47bfff 5%, #1a44c2 60%); background-position: 25%; background-size: 330% 100%; border: none; color: #fff; padding: 8px 18px; border-radius: 2px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.5px; }
  .btn-download:hover { background-position: 0%; }

  /* Player/Team accordion — Steam inventory style */
  .accordion-group { background: rgba(0,0,0,0.2); border: 1px solid rgba(0,0,0,0.3); border-radius: 4px; margin-bottom: 6px; overflow: hidden; }
  .accordion-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background 0.2s; }
  .accordion-header:hover { background: rgba(103,193,245,0.04); }
  .accordion-header img { width: 36px; height: 36px; border-radius: 2px; }
  .accordion-header-name { font-weight: 700; font-size: 14px; flex: 1; color: #fff; }
  .accordion-header-stats { display: flex; gap: 14px; font-size: 12px; color: #8f98a0; }
  .accordion-header-stats span { font-weight: 600; }
  .accordion-arrow { color: #8f98a0; transition: transform 0.2s; font-size: 14px; }
  .accordion-group.open .accordion-arrow { transform: rotate(90deg); }
  .accordion-body { display: none; padding: 0 16px 12px; }
  .accordion-group.open .accordion-body { display: block; }
  .accordion-body table { font-size: 12px; }

  /* Market activity section */
  .market-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 20px; }
  .strength-dist { display: flex; gap: 12px; align-items: flex-end; height: 80px; padding: 12px 0; }
  .strength-dist-bar { flex: 1; border-radius: 2px 2px 0 0; min-width: 40px; text-align: center; font-size: 10px; font-weight: 700; position: relative; transition: height 0.3s; }
  .strength-dist-label { position: absolute; bottom: -18px; left: 0; right: 0; font-size: 10px; color: #8f98a0; }

  /* Animated counter */
  .counter-value { display: inline-block; }

  /* Details/Summary Steam style */
  details summary { list-style: none; }
  details summary::-webkit-details-marker { display: none; }
</style>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
</head>
<body>

<nav class="sticky-nav" id="stickyNav">
  <a href="#summary-section">Summary</a>
  <a href="#charts-section">Charts</a>
  <a href="#quality-section">Quality</a>
  <a href="#leaderboard-section">Leaderboards</a>
  <a href="#market-section">Market Activity</a>
  <a href="#history-section">History</a>
  <a href="#predictions-section">Predictions</a>
  <a href="#browse-section">Browse</a>
  <a href="#inventory-section">Inventory</a>
</nav>

<div class="steam-header">
  <div class="steam-header-inner">
    <a href="https://steamcommunity.com/id/oldm8clint" target="_blank"><img class="steam-avatar" src="https://avatars.akamai.steamstatic.net/596b07e4b11e4821c9a695accd501f7180bc5f99_full.jpg" alt="clint"></a>
    <div class="steam-profile-info">
      <div class="steam-profile-name"><a href="https://steamcommunity.com/id/oldm8clint" target="_blank">clint</a></div>
      <div class="steam-profile-sub">Budapest 2025 Major Sticker Portfolio &middot; Last updated ${todayFull} &middot; <a href="https://steamcommunity.com/id/oldm8clint/inventory/" target="_blank">${history.entries.length} snapshot${history.entries.length !== 1 ? 's' : ''}</a></div>
    </div>
    <div class="steam-profile-links">
      <a class="steam-link-btn" href="https://steamcommunity.com/id/oldm8clint/inventory/" target="_blank">Inventory</a>
      <a class="steam-link-btn" href="https://steamcommunity.com/id/oldm8clint" target="_blank">Profile</a>
      <button class="steam-link-btn" onclick="downloadCSV()" style="cursor:pointer">Download CSV</button>
    </div>
  </div>
</div>

<div class="page-content">
<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:4px;">
  <div>
    <h1>Budapest 2025 Major Sticker Investments</h1>
<div class="subtitle">All prices AUD &middot; Buy price $0.35/ea &middot; <span>${data.length} items, ${grandQty} stickers</span></div>
  </div>
</div>

<div id="summary-section"></div>
<div class="summary">
  <div class="card"><div class="card-label">Stickers Held</div><div class="card-value neutral">${grandQty.toLocaleString()}</div><div class="card-sub">${data.length} unique line items</div></div>
  <div class="card"><div class="card-label">Total Invested</div><div class="card-value" style="color:#60a5fa">$${grandCost.toFixed(2)}</div><div class="card-sub">@ $0.35 each</div></div>
  <div class="card"><div class="card-label">Current Value</div><div class="card-value ${grandValue >= grandCost ? 'positive' : 'negative'}">$${grandValue.toFixed(2)}</div><div class="card-sub">Avg $${avgStickerValue.toFixed(3)}/sticker</div></div>
  <div class="card"><div class="card-label">Profit / Loss</div><div class="card-value ${grandPL >= 0 ? 'positive' : 'negative'}">${grandPL >= 0 ? '+' : ''}$${grandPL.toFixed(2)}</div><div class="card-sub">${grandROI}% return</div></div>
  <div class="card"><div class="card-label">Break-Even Progress</div><div class="card-value ${breakEvenPct >= 100 ? 'positive' : 'negative'}">${breakEvenPct.toFixed(1)}%</div><div class="card-sub">${profitableCount} of ${data.length} items profitable</div></div>
  <div class="card"><div class="card-label">Est. Time to ROI</div><div class="card-value ${roiEstimate === 'Achieved!' ? 'positive' : roiEstimate === 'Declining' ? 'negative' : 'dimmed'}" style="font-size:${roiEstimate.length > 10 ? '18' : '26'}px">${roiEstimate}</div><div class="card-sub">Based on price trend</div></div>
  <div class="card"><div class="card-label">Best Performer</div><div class="card-value" style="font-size:16px;color:#22c55e">${bestPerformer ? bestPerformer.name : '-'}</div><div class="card-sub">${bestPerformer ? bestPerformer.quality + ' @ $' + bestPerformer.currentPrice.toFixed(2) : ''}</div></div>
  <div class="card"><div class="card-label">Worst Performer</div><div class="card-value" style="font-size:16px;color:#ef4444">${worstPerformer ? worstPerformer.name : '-'}</div><div class="card-sub">${worstPerformer ? worstPerformer.quality + ' @ $' + worstPerformer.currentPrice.toFixed(2) : ''}</div></div>
  <div class="card"><div class="card-label">Profitable Items</div><div class="card-value ${parseFloat(profitablePct) >= 50 ? 'positive' : 'negative'}">${profitablePct}%</div><div class="card-sub">${profitableCount} of ${data.length} above $0.35</div></div>
  <div class="card"><div class="card-label">Best Quality Tier</div><div class="card-value neutral" style="font-size:18px">${bestQualityTier ? bestQualityTier[0] : '-'}</div><div class="card-sub">${bestQualityTier ? ((bestQualityTier[1].value - bestQualityTier[1].cost) / bestQualityTier[1].cost * 100).toFixed(1) + '% ROI' : ''}</div></div>
  <div class="card"><div class="card-label">Diversity Score</div><div class="card-value dimmed">${diversityScore}%</div><div class="card-sub">${uniqueNames.size} unique stickers across ${data.length} items</div></div>
</div>

<h3 id="signal-section">Investment Signal</h3>
<div class="signal-card" style="border-color:${signalColor}">
  <div class="signal-header">
    <div class="signal-score" style="color:${signalColor}">${investmentScore}</div>
    <div>
      <div class="signal-label" style="color:${signalColor}">${investmentSignal}</div>
      <div class="signal-sub">Investment Score (1-10) based on 5 weighted factors</div>
    </div>
  </div>
  <div class="signal-factors">
    ${scoreFactors.map(f => `<div class="signal-factor"><span class="signal-factor-name">${f.name}</span><span class="signal-factor-score" style="color:${f.score >= 7 ? '#22c55e' : f.score >= 4 ? '#f59e0b' : '#ef4444'}">${f.score}/10</span></div>`).join('\n    ')}
  </div>
  <p style="color:#555;font-size:11px;margin-top:12px;">${scoreFactors.map(f => `${f.name}: ${f.detail}`).join(' | ')}</p>
</div>

<div class="cycle-callout">
  <strong>Market Cycle: ${cycleLabel}</strong> &mdash; Budapest stickers are ~${budapestMonths} months old. ${
    budapestMonths <= 6 ? 'Most majors are still below cost at this point. The typical break-even is 12-24 months. This is the accumulation window.' :
    budapestMonths <= 18 ? 'Prices are beginning to stabilize. Early investors may start seeing returns on premium tiers.' :
    budapestMonths <= 48 ? 'Stickers are entering the appreciation phase where significant gains historically occur.' :
    'The portfolio is in the mature phase. Consider taking profits on high-performers.'
  }
</div>

<h3>Risk Assessment</h3>
<div class="risk-grid">
  <div class="risk-card">
    <div class="card-label">Concentration Risk</div>
    <div style="margin:10px 0"><span class="risk-badge" style="background:${concentrationColor}20;color:${concentrationColor}">${concentrationRisk}</span></div>
    <div style="font-size:12px;color:#888">Top 5 stickers = ${concentrationPct.toFixed(1)}% of portfolio value</div>
  </div>
  <div class="risk-card">
    <div class="card-label">Quality Distribution</div>
    <div style="margin:10px 0"><span class="risk-badge" style="background:${qualityRiskColor}20;color:${qualityRiskColor}">${qualityRisk}</span></div>
    <div style="font-size:12px;color:#888">Mix deviation: ${(mixDeviation * 100).toFixed(0)}% from optimal (${(pctNormal*100).toFixed(0)}N/${(pctEmbroidered*100).toFixed(0)}E/${(pctHolo*100).toFixed(0)}H/${(pctGold*100).toFixed(0)}G vs 60/20/15/5)</div>
  </div>
  <div class="risk-card">
    <div class="card-label">Liquidity Estimate</div>
    <div style="margin:10px 0"><span class="risk-badge" style="background:${liquidityColor}20;color:${liquidityColor}">${liquidityLabel}</span></div>
    <div style="font-size:12px;color:#888">${highLiqCount} high / ${medLiqCount} medium / ${lowLiqCount} low liquidity items</div>
  </div>
</div>

<h3 id="charts-section">Quality Tier ROI Analysis (Post-2019 Majors)</h3>
<p style="color:#888;font-size:13px;margin-bottom:16px;">${bestTier[0] === 'gold' ? 'Gold' : bestTier[0] === 'holo' ? 'Holo' : bestTier[0] === 'mid' ? 'Embroidered' : 'Paper'} stickers average ${avgTierROI[bestTier[0] as keyof typeof avgTierROI].toFixed(0)}% ROI historically &mdash; the best long-term investment tier. Your current mix is ${(pctNormal*100).toFixed(0)}% Normal. ${pctGold < 0.05 ? 'Consider shifting toward Gold/Holo for better returns.' : 'Good premium tier allocation.'}</p>
<div class="chart-container">
  <canvas id="tierRoiChart"></canvas>
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

${featured.length > 0 ? `
<h3>Featured Stickers</h3>
<div class="featured-grid">
${featured.map((r, i) => {
  const roiVal = parseFloat(r.roi);
  const qc = r.quality.toLowerCase();
  const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
  return `<div class="featured-card">
    <div class="featured-rank">#${i + 1}</div>
    <a href="${r.marketUrl}" target="_blank"><img src="${r.imageUrl}" alt="${r.name}" loading="lazy"></a>
    <div class="featured-name">${r.name}</div>
    <span class="quality-badge q-${cls}" style="margin-top:6px">${r.quality}</span>
    <div class="featured-price ${r.currentPrice >= 0.35 ? 'positive' : 'negative'}">$${r.currentPrice.toFixed(2)}</div>
    <div class="featured-roi ${roiVal >= 0 ? 'positive' : 'negative'}">${roiVal >= 0 ? '+' : ''}${r.roi} ROI</div>
  </div>`;
}).join('\n')}
</div>
` : ''}

${portfolioHistory.length > 1 ? `
<h3>Portfolio Value Over Time</h3>
<div class="chart-container">
  <canvas id="portfolioChart"></canvas>
</div>
` : `<p class="snapshot-count">Run again on a different day to start building a price history chart.</p>`}

<h3>Investment Analysis</h3>
<div class="chart-row">
  <div class="chart-box">
    <h4 style="color:#fff;font-size:14px;font-weight:700;margin-bottom:12px;">Investment Allocation by Quality</h4>
    <canvas id="allocationChart"></canvas>
  </div>
  <div class="chart-box">
    <h4 style="color:#fff;font-size:14px;font-weight:700;margin-bottom:12px;">Price Distribution</h4>
    <canvas id="priceDistChart"></canvas>
  </div>
</div>

<h3>Team vs Player Stickers</h3>
<div class="tvp-grid">
  <div class="tvp-card">
    <h4 style="color:#60a5fa">Team Stickers</h4>
    <div class="tvp-stat"><span class="tvp-label">Line Items</span><span class="tvp-val">${teamStats.count}</span></div>
    <div class="tvp-stat"><span class="tvp-label">Total Qty</span><span class="tvp-val">${teamStats.qty}</span></div>
    <div class="tvp-stat"><span class="tvp-label">Invested</span><span class="tvp-val">$${teamStats.invested.toFixed(2)}</span></div>
    <div class="tvp-stat"><span class="tvp-label">Current Value</span><span class="tvp-val ${teamStats.value >= teamStats.invested ? 'positive' : 'negative'}">$${teamStats.value.toFixed(2)}</span></div>
    <div class="tvp-stat"><span class="tvp-label">P/L</span><span class="tvp-val ${teamStats.value >= teamStats.invested ? 'positive' : 'negative'}">${teamStats.value >= teamStats.invested ? '+' : ''}$${(teamStats.value - teamStats.invested).toFixed(2)}</span></div>
    <div class="tvp-stat"><span class="tvp-label">ROI</span><span class="tvp-val ${parseFloat(teamROI) >= 0 ? 'positive' : 'negative'}">${teamROI}%</span></div>
  </div>
  <div class="tvp-card">
    <h4 style="color:#c084fc">Player Stickers</h4>
    <div class="tvp-stat"><span class="tvp-label">Line Items</span><span class="tvp-val">${playerStats.count}</span></div>
    <div class="tvp-stat"><span class="tvp-label">Total Qty</span><span class="tvp-val">${playerStats.qty}</span></div>
    <div class="tvp-stat"><span class="tvp-label">Invested</span><span class="tvp-val">$${playerStats.invested.toFixed(2)}</span></div>
    <div class="tvp-stat"><span class="tvp-label">Current Value</span><span class="tvp-val ${playerStats.value >= playerStats.invested ? 'positive' : 'negative'}">$${playerStats.value.toFixed(2)}</span></div>
    <div class="tvp-stat"><span class="tvp-label">P/L</span><span class="tvp-val ${playerStats.value >= playerStats.invested ? 'positive' : 'negative'}">${playerStats.value >= playerStats.invested ? '+' : ''}$${(playerStats.value - playerStats.invested).toFixed(2)}</span></div>
    <div class="tvp-stat"><span class="tvp-label">ROI</span><span class="tvp-val ${parseFloat(playerROI) >= 0 ? 'positive' : 'negative'}">${playerROI}%</span></div>
  </div>
</div>

<h3>Sticker Slab Analysis</h3>
<div class="slab-summary">
  <div class="card"><div class="card-label">Slabs Available</div><div class="card-value neutral">${slabsAvailable}</div><div class="card-sub">of ${uniqueSlabRows.length} variants tracked</div></div>
  <div class="card"><div class="card-label">Avg Premium/Discount</div><div class="card-value ${avgPremium <= 0 ? 'positive' : 'negative'}">${avgPremium >= 0 ? '+' : ''}${avgPremium.toFixed(1)}%</div><div class="card-sub">vs buying 5 individual stickers</div></div>
  <div class="card"><div class="card-label">Slabs Cheaper</div><div class="card-value positive">${slabsCheaper}</div><div class="card-sub">${slabsAvailable > 0 ? ((slabsCheaper / slabsAvailable) * 100).toFixed(0) + '% of listed slabs' : 'No data yet'}</div></div>
</div>
${slabsCheaper > 0 ? `<p style="color:#22c55e;font-size:13px;margin-bottom:16px;font-weight:600;">${slabsCheaper} out of ${slabsAvailable} slabs are cheaper than buying 5 individual stickers &mdash; consider slabs for bulk investment.</p>` : ''}
<table class="history-table" style="max-width: 1000px;">
<thead><tr><th>Sticker</th><th>Quality</th><th>Sticker Price</th><th>5x Price</th><th>Slab Price</th><th>Premium</th><th>Verdict</th></tr></thead>
<tbody>
${uniqueSlabRows.filter(r => r.slabPrice > 0).sort((a, b) => a.premiumPct - b.premiumPct).slice(0, 30).map(r => {
  const qc = r.quality.toLowerCase();
  const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
  const slabDataRow = data.find(d => d.name === r.name && d.quality === r.quality);
  const slabThumb = slabDataRow?.imageUrl ? '<img src="' + getImageUrl(imageCache, slabDataRow.hashName, 64) + '" class="sticker-thumb" loading="lazy">' : '';
  return `<tr>
    <td><div class="sticker-name-cell">${slabThumb}<span style="font-weight:500">${r.name}</span></div></td>
    <td><span class="quality-badge q-${cls}">${r.quality}</span></td>
    <td>$${r.stickerPrice.toFixed(2)}</td>
    <td>$${r.fiveXPrice.toFixed(2)}</td>
    <td>$${r.slabPrice.toFixed(2)}</td>
    <td class="${r.premiumPct <= 0 ? 'positive' : 'negative'}">${r.premiumPct >= 0 ? '+' : ''}${r.premiumPct.toFixed(1)}%</td>
    <td style="color:${r.verdictColor};font-weight:600">${r.verdict}</td>
  </tr>`;
}).join('\n')}
</tbody>
</table>
${uniqueSlabRows.filter(r => r.slabPrice > 0).length > 30 ? `<p style="color:#555;font-size:11px;margin-top:8px;">Showing top 30 slab deals. ${uniqueSlabRows.filter(r => r.slabPrice > 0).length - 30} more slabs tracked.</p>` : ''}

<h3 id="quality-section">Quality Breakdown</h3>
<div class="quality-summary">
${Object.entries(qualityTotals).sort((a,b) => b[1].value - a[1].value).map(([q, t]) => {
  const pl = t.value - t.cost;
  const roi = ((pl / t.cost) * 100).toFixed(1);
  const qc = q.toLowerCase();
  const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
  const avgP = t.value / t.qty;
  const rep = qualityRepresentatives[q];
  return `<div class="qs-card">
    <div style="display:flex;align-items:center;gap:12px;">
      ${rep ? `<img src="${getImageUrl(imageCache, rep.hashName, 64)}" alt="${rep.name}" style="width:48px;height:48px;border-radius:6px;" loading="lazy">` : ''}
      <div><span class="quality-badge q-${cls}">${q}</span>${rep ? `<div style="color:#555;font-size:10px;margin-top:3px;">Top: ${rep.name}</div>` : ''}</div>
    </div>
    <div class="qs-row"><span class="qs-stat">Stickers</span><span class="qs-val">${t.qty}</span></div>
    <div class="qs-row"><span class="qs-stat">Invested</span><span class="qs-val">$${t.cost.toFixed(2)}</span></div>
    <div class="qs-row"><span class="qs-stat">Value</span><span class="qs-val">$${t.value.toFixed(2)}</span></div>
    <div class="qs-row"><span class="qs-stat">Avg Price</span><span class="qs-val">$${avgP.toFixed(3)}</span></div>
    <div class="qs-row"><span class="qs-stat">P/L</span><span class="qs-val ${pl >= 0 ? 'positive' : 'negative'}">${pl >= 0 ? '+' : ''}$${pl.toFixed(2)} (${roi}%)</span></div>
  </div>`;
}).join('\n')}
</div>

<h3 id="leaderboard-section">Top & Bottom Performers</h3>
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
      const thumb = r.imageUrl ? `<img src="${getImageUrl(imageCache, r.hashName, 64)}" class="sticker-thumb" loading="lazy">` : '';
      return `<tr><td><div class="sticker-name-cell">${thumb}<a href="${r.marketUrl}" target="_blank">${r.name}</a></div></td><td><span class="quality-badge q-${cls}">${r.quality}</span></td><td>${r.qty}</td><td>$${r.currentPrice.toFixed(2)}</td><td>$${r.totalValue.toFixed(2)}</td><td><span class="dist-badge ${distCls}">${dist}</span></td></tr>`;
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
      const thumb = r.imageUrl ? `<img src="${getImageUrl(imageCache, r.hashName, 64)}" class="sticker-thumb" loading="lazy">` : '';
      return `<tr><td><div class="sticker-name-cell">${thumb}<a href="${r.marketUrl}" target="_blank">${r.name}</a></div></td><td><span class="quality-badge q-${cls}">${r.quality}</span></td><td>${r.qty}</td><td>$${r.currentPrice.toFixed(2)}</td><td class="${parseFloat(r.roi) >= 0 ? 'positive' : 'negative'}">${r.roi}</td><td><span class="dist-badge ${distCls}">${dist}</span></td></tr>`;
    }).join('\n')}
    </tbody>
    </table>
  </div>
</div>

${history.entries.length >= 2 ? `
<h3>Performer Trends</h3>
<p style="color:#888;font-size:13px;margin-bottom:16px;">Players/teams appearing here consistently are ones to watch for future majors. Based on ${history.entries.length} snapshots.</p>
<div class="split-tables">
  <div class="sub-table">
    <h4 style="color:#22c55e">Top 10 Consistent Risers</h4>
    <table>
    <thead><tr><th>Sticker</th><th>Quality</th><th>Appearances</th><th>First Price</th><th>Latest Price</th><th>Change</th><th>Trend</th></tr></thead>
    <tbody>
    ${topTrends.map(t => {
      const qc = t.quality.toLowerCase();
      const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
      const changePct = t.firstPrice > 0 ? ((t.priceChange / t.firstPrice) * 100).toFixed(1) : '0.0';
      return `<tr><td>${t.name}</td><td><span class="quality-badge q-${cls}">${t.quality}</span></td><td>${t.appearances}/${history.entries.length}</td><td>$${t.firstPrice.toFixed(2)}</td><td>$${t.latestPrice.toFixed(2)}</td><td class="${t.rising ? 'positive' : 'negative'}">${t.rising ? '+' : ''}${changePct}%</td><td>${t.rising ? '📈' : '📉'}</td></tr>`;
    }).join('\n')}
    </tbody>
    </table>
  </div>
  <div class="sub-table">
    <h4 style="color:#ef4444">Bottom 10 Watch List</h4>
    <table>
    <thead><tr><th>Sticker</th><th>Quality</th><th>Appearances</th><th>First Price</th><th>Latest Price</th><th>Change</th><th>Trend</th></tr></thead>
    <tbody>
    ${bottomTrends.map(t => {
      const qc = t.quality.toLowerCase();
      const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
      const changePct = t.firstPrice > 0 ? ((t.priceChange / t.firstPrice) * 100).toFixed(1) : '0.0';
      return `<tr><td>${t.name}</td><td><span class="quality-badge q-${cls}">${t.quality}</span></td><td>${t.appearances}/${history.entries.length}</td><td>$${t.firstPrice.toFixed(2)}</td><td>$${t.latestPrice.toFixed(2)}</td><td class="${t.rising ? 'positive' : 'negative'}">${t.rising ? '+' : ''}${changePct}%</td><td>${t.rising ? '📈' : '📉'}</td></tr>`;
    }).join('\n')}
    </tbody>
    </table>
  </div>
</div>
` : ''}

<h3 id="market-section">Market Activity</h3>
<div class="market-summary">
  <div class="card"><div class="card-label">24h Volume</div><div class="card-value neutral counter-value" data-target="${totalVolume24h}">${totalVolume24h.toLocaleString()}</div><div class="card-sub">Total sales across all stickers</div></div>
  <div class="card"><div class="card-label">Avg Volume/Sticker</div><div class="card-value dimmed counter-value" data-target="${Math.round(avgVolume)}">${Math.round(avgVolume).toLocaleString()}</div><div class="card-sub">Average 24h sales per sticker</div></div>
  <div class="card"><div class="card-label">Strong Pricing</div><div class="card-value positive">${strongPct}%</div><div class="card-sub">${strongCount} of ${data.length} with 50+ daily sales</div></div>
  <div class="card"><div class="card-label">Median Volume</div><div class="card-value dimmed counter-value" data-target="${medianVolume}">${medianVolume.toLocaleString()}</div><div class="card-sub">Middle value of all sticker volumes</div></div>
</div>

<h4 style="color:#fff;font-size:14px;margin-bottom:12px;">Price Strength Distribution</h4>
<div style="display:flex;gap:16px;margin-bottom:24px;">
${(() => {
  const maxStr = Math.max(strongCount, moderateCount, weakCount, deadCount, 1);
  return [
    { label: 'Strong', count: strongCount, color: '#22c55e' },
    { label: 'Moderate', count: moderateCount, color: '#f59e0b' },
    { label: 'Weak', count: weakCount, color: '#f97316' },
    { label: 'Dead', count: deadCount, color: '#ef4444' },
  ].map(s => `<div style="flex:1;text-align:center;">
    <div style="height:80px;display:flex;align-items:flex-end;justify-content:center;">
      <div style="width:100%;max-width:60px;height:${Math.max((s.count / maxStr) * 80, 4)}px;background:${s.color};border-radius:4px 4px 0 0;"></div>
    </div>
    <div style="font-size:18px;font-weight:800;color:${s.color};margin-top:6px;">${s.count}</div>
    <div style="font-size:11px;color:#888;">${s.label}</div>
  </div>`).join('');
})()}
</div>

<div class="split-tables">
  <div class="sub-table">
    <h4 style="color:#22c55e">Most Traded (24h) - Reliable Prices</h4>
    <table>
    <thead><tr><th>Sticker</th><th>Quality</th><th>Vol (24h)</th><th>Price</th><th>Strength</th></tr></thead>
    <tbody>
    ${mostTraded.map(r => {
      const qc = r.quality.toLowerCase();
      const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
      const thumb = r.imageUrl ? '<img src="' + getImageUrl(imageCache, r.hashName, 64) + '" class="sticker-thumb" loading="lazy">' : '';
      return '<tr><td><div class="sticker-name-cell">' + thumb + '<span class="sticker-modal-trigger" data-idx="' + data.indexOf(r) + '" style="cursor:pointer;font-weight:500">' + r.name + '</span></div></td><td><span class="quality-badge q-' + cls + '">' + r.quality + '</span></td><td style="font-weight:700;color:#22c55e">' + r.volume.toLocaleString() + '</td><td>$' + r.currentPrice.toFixed(2) + '</td><td>' + strengthBarsHtml(r.priceStrength) + '</td></tr>';
    }).join('\n')}
    </tbody>
    </table>
  </div>
  <div class="sub-table">
    <h4 style="color:#f97316">Least Traded (24h) - Fragile Prices</h4>
    <table>
    <thead><tr><th>Sticker</th><th>Quality</th><th>Vol (24h)</th><th>Price</th><th>Strength</th></tr></thead>
    <tbody>
    ${leastTraded.map(r => {
      const qc = r.quality.toLowerCase();
      const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
      const thumb = r.imageUrl ? '<img src="' + getImageUrl(imageCache, r.hashName, 64) + '" class="sticker-thumb" loading="lazy">' : '';
      return '<tr><td><div class="sticker-name-cell">' + thumb + '<span class="sticker-modal-trigger" data-idx="' + data.indexOf(r) + '" style="cursor:pointer;font-weight:500">' + r.name + '</span></div></td><td><span class="quality-badge q-' + cls + '">' + r.quality + '</span></td><td style="font-weight:700;color:#f97316">' + r.volume.toLocaleString() + '</td><td>$' + r.currentPrice.toFixed(2) + '</td><td>' + strengthBarsHtml(r.priceStrength) + '</td></tr>';
    }).join('\n')}
    </tbody>
    </table>
  </div>
</div>

<div class="sub-table" style="margin-bottom:32px;">
  <h4 style="color:#60a5fa">Most Listed - High Supply (Downward Pressure)</h4>
  <table>
  <thead><tr><th>Sticker</th><th>Quality</th><th>Listings</th><th>Vol (24h)</th><th>Price</th><th>Strength</th></tr></thead>
  <tbody>
  ${mostListed.map(r => {
    const qc = r.quality.toLowerCase();
    const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
    const thumb = r.imageUrl ? '<img src="' + getImageUrl(imageCache, r.hashName, 64) + '" class="sticker-thumb" loading="lazy">' : '';
    return '<tr><td><div class="sticker-name-cell">' + thumb + '<span class="sticker-modal-trigger" data-idx="' + data.indexOf(r) + '" style="cursor:pointer;font-weight:500">' + r.name + '</span></div></td><td><span class="quality-badge q-' + cls + '">' + r.quality + '</span></td><td style="font-weight:700;color:#60a5fa">' + r.listings.toLocaleString() + '</td><td>' + r.volume.toLocaleString() + '</td><td>$' + r.currentPrice.toFixed(2) + '</td><td>' + strengthBarsHtml(r.priceStrength) + '</td></tr>';
  }).join('\n')}
  </tbody>
  </table>
</div>

<h3 id="history-section">Snapshot History</h3>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
<div class="chart-container">
  <h4 style="color:#fff;font-size:14px;margin-bottom:12px;">Value Change Per Snapshot</h4>
  <canvas id="snapshotChangeChart"></canvas>
</div>
<div class="chart-container">
  <h4 style="color:#fff;font-size:14px;margin-bottom:12px;">Cumulative P/L Over Time</h4>
  <canvas id="cumulativePLChart"></canvas>
</div>
</div>
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

<table class="history-table" style="max-width: 1050px;">
<thead><tr>
  <th></th>
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
  const iconic = ICONIC_STICKERS[p.name];
  const iconicImg = iconic ? getImageUrl(imageCache, iconic.hashName, 80) : '';
  const iconicLink = iconic ? getMarketUrl(iconic.hashName) : '';
  const rowStyle = p.bestMajor ? 'background:rgba(255,215,0,0.05);' : '';
  const badge = p.bestMajor ? ' <span style="color:#ffd700;font-size:10px;font-weight:700;">BEST</span>' : '';
  const years = p.monthsOld >= 12 ? `${(p.monthsOld/12).toFixed(1)}y` : `${p.monthsOld}mo`;
  return `<tr style="${rowStyle}">
    <td>${iconicImg ? `<a href="${iconicLink}" target="_blank" title="${iconic?.label}"><img src="${iconicImg}" class="iconic-thumb" loading="lazy"></a>` : ''}</td>
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
  <td></td>
  <td>Budapest 2025</td>
  <td>Now</td>
  <td colspan="4" style="color:#888;">Your current portfolio</td>
  <td>$${avgStickerValue.toFixed(3)}</td>
  <td class="${grandValue >= grandCost ? 'positive' : 'negative'}">$${grandValue.toFixed(2)}</td>
  <td class="${parseFloat(grandROI) >= 0 ? 'positive' : 'negative'}">${grandROI}%</td>
</tr>
</tbody>
</table>

<h3 id="predictions-section">Budapest 2025 Price Predictions</h3>
<p style="color:#888;font-size:13px;margin-bottom:16px;">Based on how previous major stickers appreciated over time, here's a projection for your Budapest 2025 portfolio. Best-performing major: <span style="color:#ffd700;font-weight:600">${bestMajor.name}</span> at <span class="positive">+${bestMajor.roiStr}</span> after ${(bestMajor.monthsOld/12).toFixed(1)} years.</p>

<div class="chart-container">
  <canvas id="predictionChart"></canvas>
</div>

<div class="summary" style="margin-top:20px;">
  <div class="card"><div class="card-label">Est. Break-Even</div><div class="card-value neutral" style="font-size:20px">${breakEvenMonths > 0 ? (breakEvenMonths < 12 ? breakEvenMonths + ' months' : (breakEvenMonths/12).toFixed(1) + ' years') : 'Unknown'}</div><div class="card-sub">When portfolio value hits $${grandCost.toFixed(0)}</div></div>
  <div class="card"><div class="card-label">Best Case (${bestMajor.name} path)</div><div class="card-value positive" style="font-size:20px">$${bestMajor.portfolioValue.toFixed(0)}</div><div class="card-sub">After ${(bestMajor.monthsOld/12).toFixed(1)} years | +${bestMajor.roiStr}</div></div>
  <div class="card"><div class="card-label">Conservative (avg all majors)</div><div class="card-value positive" style="font-size:20px">$${(projections.reduce((a,p) => a + p.portfolioValue, 0) / projections.length).toFixed(0)}</div><div class="card-sub">Average across ${projections.length} majors</div></div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
<div class="chart-container">
  <h4 style="color:#fff;font-size:14px;margin-bottom:12px;">Per-Quality Projected Value Over Time</h4>
  <canvas id="qualityPredChart"></canvas>
</div>
<div class="chart-container">
  <h4 style="color:#fff;font-size:14px;margin-bottom:12px;">ROI % by Timeline</h4>
  <canvas id="roiTimelineChart"></canvas>
</div>
</div>

<details style="margin-bottom:20px;">
<summary style="cursor:pointer;color:#67c1f5;font-weight:600;font-size:14px;padding:10px 0;">Show Full Prediction Table (${timeProjections.length} intervals)</summary>
<table class="history-table" style="max-width: 900px;margin-top:12px;">
<thead><tr><th>Timeline</th><th>Projected Value</th><th>Est. ROI</th><th>Per Sticker</th><th>Actual Value</th><th>Actual ROI</th><th>Accuracy</th></tr></thead>
<tbody>
${timeProjections.map(t => {
  const pl = t.projectedValue - grandCost;
  const hasActual = t.actualValue !== undefined;
  const accPct = hasActual ? ((t.actualValue! / t.projectedValue) * 100).toFixed(0) : '';
  const accColor = hasActual ? (t.actualValue! >= t.projectedValue ? '#22c55e' : t.actualValue! >= t.projectedValue * 0.8 ? '#f59e0b' : '#ef4444') : '';
  return `<tr>
    <td style="font-weight:600">${t.label}</td>
    <td class="${t.projectedValue >= grandCost ? 'positive' : 'negative'}">$${t.projectedValue.toFixed(2)}</td>
    <td class="${t.avgROI >= 0 ? 'positive' : 'negative'}">${t.avgROI >= 0 ? '+' : ''}${t.avgROI.toFixed(1)}%</td>
    <td style="color:#888">$${t.projectedPerSticker.toFixed(3)}</td>
    <td style="font-weight:600">${hasActual ? '<span class="' + (t.actualValue! >= grandCost ? 'positive' : 'negative') + '">$' + t.actualValue!.toFixed(2) + '</span>' : '<span style="color:#555">—</span>'}</td>
    <td>${hasActual ? '<span class="' + (t.actualROI! >= 0 ? 'positive' : 'negative') + '">' + (t.actualROI! >= 0 ? '+' : '') + t.actualROI!.toFixed(1) + '%</span>' : '<span style="color:#555">—</span>'}</td>
    <td>${hasActual ? '<span style="color:' + accColor + ';font-weight:600">' + accPct + '%</span>' : '<span style="color:#555">Pending</span>'}</td>
  </tr>`;
}).join('\n')}
</tbody>
</table>
</details>

<h4 style="color:#fff;font-size:14px;margin:20px 0 12px;">Key Milestones</h4>
<table class="history-table" style="max-width: 900px;">
<thead><tr><th>Timeline</th><th>Projected Value</th><th>Est. ROI</th><th>Per Sticker</th><th>Actual Value</th><th>Accuracy</th></tr></thead>
<tbody>
${timeProjections.filter(t => [0.5, 1, 3, 6, 12, 18, 24, 36, 48, 60, 84, 120, 144].includes(t.months)).map(t => {
  const hasActual = t.actualValue !== undefined;
  const accPct = hasActual ? ((t.actualValue! / t.projectedValue) * 100).toFixed(0) : '';
  const accColor = hasActual ? (t.actualValue! >= t.projectedValue ? '#22c55e' : t.actualValue! >= t.projectedValue * 0.8 ? '#f59e0b' : '#ef4444') : '';
  return `<tr>
    <td style="font-weight:600">${t.label}</td>
    <td class="${t.projectedValue >= grandCost ? 'positive' : 'negative'}">$${t.projectedValue.toFixed(2)}</td>
    <td class="${t.avgROI >= 0 ? 'positive' : 'negative'}">${t.avgROI >= 0 ? '+' : ''}${t.avgROI.toFixed(1)}%</td>
    <td style="color:#888">$${t.projectedPerSticker.toFixed(3)}</td>
    <td style="font-weight:600">${hasActual ? '<span class="' + (t.actualValue! >= grandCost ? 'positive' : 'negative') + '">$' + t.actualValue!.toFixed(2) + '</span>' : '<span style="color:#555">—</span>'}</td>
    <td>${hasActual ? '<span style="color:' + accColor + ';font-weight:600">' + accPct + '%</span>' : '<span style="color:#555">Pending</span>'}</td>
  </tr>`;
}).join('\n')}
</tbody>
</table>
<p style="color:#555;font-size:11px;margin-top:8px;font-style:italic;">Projections based on ${projections.length} previous CS majors (Katowice 2014 - Austin 2025). Weighted by your quality distribution. Pre-2019 majors lack Gold tier (marked N/A). Katowice 2014 is heavily de-weighted (3%) as an unrealistic outlier for modern predictions. 2-week granularity for first year, monthly for year 2, quarterly/yearly beyond. Updated 6x daily. Past performance does not guarantee future results.</p>

<h3>Sell Timing Recommendation</h3>
<div class="sell-card">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
    <div style="font-size:36px;font-weight:900;color:#67c1f5;">SELL @ ${bestSellStr}</div>
  </div>
  <p style="color:#aaa;font-size:13px;margin-bottom:12px;">Based on historical major performance (excluding Katowice 2014), the optimal sell window for Budapest 2025 stickers is around <strong style="color:#fff">${peakWindow.label}</strong> after release (~${bestSellStr}), when similar-age majors averaged <span class="positive">+${peakWindow.avgROI.toFixed(0)}%</span> ROI.</p>
  <p style="color:#888;font-size:12px;">Reference majors at that age: ${peakWindow.majorsInRange.join(', ') || 'None'}</p>
</div>

<table class="history-table" style="max-width: 900px;">
<thead><tr><th>Sell Window</th><th>Target Age</th><th>Avg ROI at Age</th><th>Portfolio Estimate</th><th>Reference Majors</th><th>Signal</th></tr></thead>
<tbody>
${sellWindows.map(sw => {
  const projVal = grandCost * (1 + sw.avgROI / 100);
  const sellDate = new Date(new Date("2025-09-15").getTime() + sw.months * 30.44 * 86400000);
  const sellStr = sellDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const sigColor = sw.recommendation === 'STRONG SELL' ? '#22c55e' : sw.recommendation === 'CONSIDER SELLING' ? '#f59e0b' : sw.recommendation === 'TOO EARLY' ? '#ef4444' : '#888';
  return `<tr>
    <td style="font-weight:600">${sw.label}</td>
    <td>${sellStr}</td>
    <td class="${sw.avgROI >= 0 ? 'positive' : 'negative'}">${sw.avgROI >= 0 ? '+' : ''}${sw.avgROI.toFixed(0)}%</td>
    <td class="${projVal >= grandCost ? 'positive' : 'negative'}">$${projVal.toFixed(2)}</td>
    <td style="font-size:11px;color:#888">${sw.majorsInRange.slice(0, 3).join(', ') || '-'}</td>
    <td style="color:${sigColor};font-weight:700;font-size:11px">${sw.recommendation}</td>
  </tr>`;
}).join('\n')}
</tbody>
</table>
<p style="color:#555;font-size:11px;margin-top:8px;font-style:italic;">Sell timing based on ${realisticProjections.length} majors (Katowice 2014 excluded as outlier). These are averages &mdash; individual stickers (especially Gold/Holo) may appreciate faster or slower than the portfolio average.</p>

<h3 id="quick-stats-section">Quick Stats</h3>
<div class="summary" style="margin-bottom:16px;">
  <div class="card"><div class="card-label">Price Updates</div><div class="card-value neutral">${history.entries.length}</div><div class="card-sub">snapshots recorded</div></div>
  <div class="card"><div class="card-label">Updates Per Day</div><div class="card-value dimmed">6x</div><div class="card-sub">every 4 hours</div></div>
  <div class="card"><div class="card-label">Avg Sticker Price</div><div class="card-value ${avgStickerValue >= 0.35 ? 'positive' : 'negative'}">$${avgStickerValue.toFixed(3)}</div><div class="card-sub">need $0.35 to break even</div></div>
  <div class="card"><div class="card-label">Gold Value</div><div class="card-value positive">$${(qualityTotals['Gold']?.value || 0).toFixed(2)}</div><div class="card-sub">${((qualityTotals['Gold']?.value || 0) / grandValue * 100).toFixed(1)}% of portfolio</div></div>
  <div class="card"><div class="card-label">Holo Value</div><div class="card-value positive">$${(qualityTotals['Holo']?.value || 0).toFixed(2)}</div><div class="card-sub">${((qualityTotals['Holo']?.value || 0) / grandValue * 100).toFixed(1)}% of portfolio</div></div>
  <div class="card"><div class="card-label">Normal Value</div><div class="card-value negative">$${(qualityTotals['Normal']?.value || 0).toFixed(2)}</div><div class="card-sub">${((qualityTotals['Normal']?.value || 0) / grandValue * 100).toFixed(1)}% of portfolio</div></div>
  <div class="card"><div class="card-label">Most Valuable</div><div class="card-value" style="font-size:15px;color:#ffd700">${bestPerformer ? bestPerformer.name + ' ' + bestPerformer.quality : '-'}</div><div class="card-sub">${bestPerformer ? '$' + bestPerformer.currentPrice.toFixed(2) + ' (+' + ((bestPerformer.currentPrice / 0.35 - 1) * 100).toFixed(0) + '%)' : ''}</div></div>
  <div class="card"><div class="card-label">Portfolio ATH</div><div class="card-value positive">${portfolioATH ? '$' + portfolioATH.totalValue.toFixed(2) : '-'}</div><div class="card-sub">${portfolioATH ? portfolioATH.date : ''}</div></div>
  <div class="card"><div class="card-label">Portfolio ATL</div><div class="card-value negative">${portfolioATL ? '$' + portfolioATL.totalValue.toFixed(2) : '-'}</div><div class="card-sub">${portfolioATL ? portfolioATL.date : ''}</div></div>
  <div class="card"><div class="card-label">Sticker ATH</div><div class="card-value" style="font-size:15px;color:#22c55e">${stickerATH ? stickerATH.name + ' ' + stickerATH.quality : '-'}</div><div class="card-sub">${stickerATH ? '$' + stickerATH.allTimeHigh.toFixed(2) + ' on ' + stickerATH.allTimeHighDate : ''}</div></div>
  <div class="card"><div class="card-label">Sticker ATL</div><div class="card-value" style="font-size:15px;color:#ef4444">${stickerATL ? stickerATL.name + ' ' + stickerATL.quality : '-'}</div><div class="card-sub">${stickerATL ? '$' + stickerATL.allTimeLow.toFixed(2) + ' on ' + stickerATL.allTimeLowDate : ''}</div></div>
  <div class="card"><div class="card-label">Page Views</div><div class="card-value dimmed" id="pageViewCount">-</div><div class="card-sub">since tracking started</div></div>
</div>

<h3 id="browse-section">Browse by Player / Team (${sortedGroups.length} entities)</h3>
<p style="color:#888;font-size:13px;margin-bottom:16px;">Click any player/team to expand quality variants. Sorted by total portfolio value.</p>
<details open>
<summary style="cursor:pointer;color:#67c1f5;font-weight:600;font-size:14px;padding:8px 0;margin-bottom:12px;">Show/Hide Browse (${sortedGroups.length} players & teams)</summary>
<div id="accordionContainer">
${sortedGroups.map((g, gi) => {
  const pl = g.totalValue - g.totalInvested;
  const plCls = pl >= 0 ? 'positive' : 'negative';
  return `<div class="accordion-group" data-group="${gi}">
    <div class="accordion-header" onclick="toggleAccordion(${gi})">
      ${g.imageUrl ? '<img src="' + g.imageUrl + '" loading="lazy">' : '<div style="width:36px;height:36px;background:#1a1a28;border-radius:6px"></div>'}
      <span class="accordion-header-name">${g.name}</span>
      <div class="accordion-header-stats">
        <span>${g.rows.length} variant${g.rows.length !== 1 ? 's' : ''}</span>
        <span>Invested: $${g.totalInvested.toFixed(2)}</span>
        <span class="${plCls}">Value: $${g.totalValue.toFixed(2)}</span>
        <span class="${plCls}">ROI: ${g.combinedROI}</span>
      </div>
      <span class="accordion-arrow">&#9654;</span>
    </div>
    <div class="accordion-body">
      <table>
      <thead><tr><th>Quality</th><th>Qty</th><th>Price</th><th>ATH</th><th>ATL</th><th>Value</th><th>P/L</th><th>ROI</th><th>Grade</th><th>Vol</th></tr></thead>
      <tbody>
      ${g.rows.map(r => {
        const qc = r.quality.toLowerCase();
        const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
        return '<tr><td><span class="quality-badge q-' + cls + '">' + r.quality + '</span></td><td>' + r.qty + '</td><td>$' + r.currentPrice.toFixed(2) + '</td><td title="' + r.allTimeHighDate + '" style="color:#22c55e">$' + r.allTimeHigh.toFixed(2) + '</td><td title="' + r.allTimeLowDate + '" style="color:#ef4444">$' + r.allTimeLow.toFixed(2) + '</td><td>$' + r.totalValue.toFixed(2) + '</td><td class="' + (r.profitLoss >= 0 ? 'positive' : 'negative') + '">' + (r.profitLoss >= 0 ? '+' : '') + '$' + r.profitLoss.toFixed(2) + '</td><td class="' + (parseFloat(r.roi) >= 0 ? 'positive' : 'negative') + '">' + r.roi + '</td><td>' + gradeBadgeHtml(r.grade, r.gradeColor) + '</td><td>' + (r.volume > 0 ? r.volume.toLocaleString() : '-') + '</td></tr>';
      }).join('\n')}
      </tbody>
      </table>
    </div>
  </div>`;
}).join('\n')}
</div>
</details>

<h3 id="inventory-section">Full Inventory (${data.length} line items)</h3>
<details>
<summary style="cursor:pointer;color:#67c1f5;font-weight:600;font-size:14px;padding:8px 0;margin-bottom:12px;">Show/Hide Inventory Table & Grid (${data.length} items, ${grandQty} stickers)</summary>
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
<div class="view-toggle" id="viewToggle">
  <button class="active" onclick="setView('table')">Table</button>
  <button onclick="setView('grid')">Grid</button>
</div>

<div class="sticker-grid" id="stickerGrid">
${data.map((r, idx) => {
  const roiVal = parseFloat(r.roi);
  const qc = r.quality.toLowerCase();
  const borderCls = qc.includes('gold') || qc.includes('holo') ? 'premium' : roiVal >= 0 ? 'profitable' : 'losing';
  return `<div class="grid-card ${borderCls} sticker-modal-trigger" data-idx="${idx}">
    ${r.imageUrl ? '<img src="' + getImageUrl(imageCache, r.hashName, 128) + '" alt="' + r.name + '" loading="lazy">' : ''}
    <div class="grid-card-name">${r.name}</div>
    <span class="quality-badge q-${qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal'}" style="font-size:9px;margin-top:4px">${r.quality}</span>
    <div class="grid-card-price ${r.currentPrice >= 0.35 ? 'positive' : 'negative'}">$${r.currentPrice.toFixed(2)}</div>
    <div class="grid-card-roi ${roiVal >= 0 ? 'positive' : 'negative'}">${roiVal >= 0 ? '+' : ''}${r.roi}</div>
  </div>`;
}).join('\n')}
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
  <th onclick="sortTable(7)">Grade</th>
  <th onclick="sortTable(8)">Vol (24h)</th>
  <th onclick="sortTable(9)">Listings</th>
  <th onclick="sortTable(10)">Strength</th>
  <th onclick="sortTable(11)">ATH</th>
  <th onclick="sortTable(12)">ATL</th>
  <th onclick="sortTable(13)">vs Buy</th>
  <th onclick="sortTable(14)">Time to ROI</th>
  <th>Link</th>
</tr></thead>
<tbody>
${data.map((r, idx) => {
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
  const thumb = r.imageUrl ? `<img src="${getImageUrl(imageCache, r.hashName, 64)}" class="sticker-thumb" loading="lazy">` : '';
  return `<tr data-name="${r.name.toLowerCase()}" data-quality="${r.quality}">
  <td><div class="sticker-name-cell">${thumb}<span class="sticker-modal-trigger" data-idx="${idx}" style="cursor:pointer;font-weight:500">${r.name}</span></div></td>
  <td><span class="quality-badge q-${cls}">${r.quality}</span></td>
  <td>${r.qty}</td>
  <td>$${r.currentPrice.toFixed(2)}</td>
  <td>$${r.totalValue.toFixed(2)}</td>
  <td class="${plClass}">${r.profitLoss >= 0 ? '+' : ''}$${r.profitLoss.toFixed(2)}</td>
  <td><div class="roi-bar"><span class="${plClass}">${r.roi}</span><div class="roi-fill" style="width:${barW}px;background:${barColor}"></div></div></td>
  <td>${gradeBadgeHtml(r.grade, r.gradeColor)}</td>
  <td>${r.volume > 0 ? r.volume.toLocaleString() : '<span style="color:#555">-</span>'}</td>
  <td>${r.listings > 0 ? r.listings.toLocaleString() : '<span style="color:#555">-</span>'}</td>
  <td>${strengthBarsHtml(r.priceStrength)}</td>
  <td title="${r.allTimeHighDate}"><span style="color:#22c55e">$${r.allTimeHigh.toFixed(2)}</span></td>
  <td title="${r.allTimeLowDate}"><span style="color:#ef4444">$${r.allTimeLow.toFixed(2)}</span></td>
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
  <td></td><td>${totalVolume24h.toLocaleString()}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
</tr></tfoot>
</table>
</details>

<!-- Sticker Detail Modal -->
<div class="modal-overlay" id="stickerModal">
  <div class="modal-content">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    <img class="modal-img" id="modalImg" src="" alt="">
    <div class="modal-name" id="modalName"></div>
    <div style="text-align:center;margin-top:6px;" id="modalBadges"></div>
    <div class="modal-sparkline" id="modalSparkline"></div>
    <div class="modal-stats" id="modalStats"></div>
    <a class="modal-link" id="modalLink" href="" target="_blank">View on Steam Market &rarr;</a>
  </div>
</div>

<!-- Scroll to Top -->
<button class="scroll-top" id="scrollTop" onclick="window.scrollTo({top:0,behavior:'smooth'})">&uarr;</button>

<div class="footer">
  <p>Sticker Investment Tracker by <a href="https://steamcommunity.com/id/oldm8clint" target="_blank">clint</a> &middot; Prices updated 6x daily via GitHub Actions</p>
  <p><a href="https://steamcommunity.com/id/oldm8clint/inventory/" target="_blank">Steam Inventory</a> &middot; <a href="https://steamcommunity.com/id/oldm8clint" target="_blank">Steam Profile</a></p>
</div>
</div><!-- end .page-content -->

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
        borderColor: '#67c1f5',
        backgroundColor: 'rgba(102, 192, 244, 0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#67c1f5',
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

// Investment Allocation donut chart
const allocCtx = document.getElementById('allocationChart').getContext('2d');
new Chart(allocCtx, {
  type: 'doughnut',
  data: {
    labels: ${JSON.stringify(Object.keys(qualityTotals))},
    datasets: [{
      data: ${JSON.stringify(Object.values(qualityTotals).map(t => +t.value.toFixed(2)))},
      backgroundColor: [${Object.keys(qualityTotals).map(q => {
        const qc = q.toLowerCase();
        if (qc.includes('gold')) return "'rgba(255,215,0,0.7)'";
        if (qc.includes('holo')) return "'rgba(99,102,241,0.7)'";
        if (qc.includes('embroidered')) return "'rgba(34,197,94,0.7)'";
        if (qc.includes('champion')) return "'rgba(168,85,247,0.7)'";
        return "'rgba(255,255,255,0.2)'";
      }).join(',')}],
      borderColor: '#06060a',
      borderWidth: 2,
    }]
  },
  options: {
    responsive: true,
    cutout: '60%',
    plugins: {
      legend: { position: 'right', labels: { color: '#888', font: { family: 'Inter', size: 12 }, padding: 12 } },
      tooltip: { callbacks: { label: (c) => c.label + ': $' + c.parsed.toFixed(2) + ' (' + ((c.parsed / ${grandValue.toFixed(2)}) * 100).toFixed(1) + '%)' } },
    }
  }
});

// Price Distribution histogram
const pdCtx = document.getElementById('priceDistChart').getContext('2d');
new Chart(pdCtx, {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(priceDistribution.map(b => b.label))},
    datasets: [{
      label: 'Sticker Count',
      data: ${JSON.stringify(priceDistribution.map(b => b.count))},
      backgroundColor: ${JSON.stringify(priceDistribution.map(b => b.min >= 0.35 ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.4)'))},
      borderColor: ${JSON.stringify(priceDistribution.map(b => b.min >= 0.35 ? '#22c55e' : '#ef4444'))},
      borderWidth: 1,
      borderRadius: 4,
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { title: (items) => items[0].label, label: (c) => c.parsed.y + ' stickers' } },
    },
    scales: {
      x: { ticks: { color: '#666', font: { family: 'Inter', size: 10 }, maxRotation: 45 }, grid: { display: false } },
      y: { ticks: { color: '#444', font: { family: 'Inter' }, stepSize: 1 }, grid: { color: '#111' }, beginAtZero: true },
    }
  }
});

// Quality Tier ROI chart (grouped bar)
const trCtx = document.getElementById('tierRoiChart')?.getContext('2d');
if (trCtx) {
  new Chart(trCtx, {
    type: 'bar',
    data: {
      labels: ${JSON.stringify(tierROIData.map(t => t.major))},
      datasets: [
        { label: 'Paper', data: ${JSON.stringify(tierROIData.map(t => +t.paper.toFixed(0)))}, backgroundColor: 'rgba(255,255,255,0.2)', borderColor: '#888', borderWidth: 1, borderRadius: 4 },
        { label: 'Embroidered', data: ${JSON.stringify(tierROIData.map(t => +t.mid.toFixed(0)))}, backgroundColor: 'rgba(34,197,94,0.5)', borderColor: '#22c55e', borderWidth: 1, borderRadius: 4 },
        { label: 'Holo', data: ${JSON.stringify(tierROIData.map(t => +t.holo.toFixed(0)))}, backgroundColor: 'rgba(99,102,241,0.5)', borderColor: '#6366f1', borderWidth: 1, borderRadius: 4 },
        { label: 'Gold', data: ${JSON.stringify(tierROIData.map(t => +t.gold.toFixed(0)))}, backgroundColor: 'rgba(255,215,0,0.5)', borderColor: '#ffd700', borderWidth: 1, borderRadius: 4 },
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#888', font: { family: 'Inter' } } },
        tooltip: { callbacks: { label: (c) => c.dataset.label + ': ' + c.parsed.y.toFixed(0) + '% ROI' } },
      },
      scales: {
        x: { ticks: { color: '#666', font: { family: 'Inter', size: 10 }, maxRotation: 45 }, grid: { display: false } },
        y: { ticks: { color: '#444', callback: v => v + '%', font: { family: 'Inter' } }, grid: { color: '#111' } },
      }
    }
  });
}

// Prediction timeline chart — show every nth label to avoid crowding
const predLabels = ['Now', ${timeProjections.map(t => "'" + t.label + "'").join(',')}];
const predValues = [${grandValue.toFixed(2)}, ${timeProjections.map(t => t.projectedValue.toFixed(2)).join(',')}];
const predActual = ${JSON.stringify(actualDataForChart)};
const predBestCase = [${grandValue.toFixed(2)}, ${timeProjections.map((t) => {
  const ratio = t.months / bestMajor.monthsOld;
  return (grandCost * (1 + bestMajor.roi / 100 * ratio)).toFixed(2);
}).join(',')}];
const pCtx = document.getElementById('predictionChart').getContext('2d');
new Chart(pCtx, {
  type: 'line',
  data: {
    labels: predLabels,
    datasets: [
      {
        label: 'Projected Portfolio Value',
        data: predValues,
        borderColor: '#67c1f5',
        backgroundColor: 'rgba(102,192,244,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: predValues.map((v, i) => [0,1,5,12,24,36,48].includes(i) ? 5 : 1),
        pointBackgroundColor: predValues.map((v, i) => v >= ${grandCost.toFixed(2)} ? '#22c55e' : '#ef4444'),
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
      },
      {
        label: 'Actual Portfolio Value',
        data: predActual,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
        pointRadius: predActual.map(v => v !== null ? 6 : 0),
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        spanGaps: false,
      },
      {
        label: 'Break-Even ($${grandCost.toFixed(0)})',
        data: Array(predLabels.length).fill(${grandCost.toFixed(2)}),
        borderColor: '#ef4444',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Best Case (${bestMajor.name} path)',
        data: predBestCase,
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
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { labels: { color: '#888', font: { family: 'Inter' } } },
      tooltip: {
        callbacks: { label: (c) => c.dataset.label + ': ' + (c.parsed.y !== null ? '$' + c.parsed.y.toFixed(2) : 'No data') },
        backgroundColor: 'rgba(10,10,20,0.9)', borderColor: '#333', borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#666', font: { family: 'Inter', size: 10 }, maxRotation: 45,
          callback: function(val, idx) {
            // Show fewer labels: Now, key milestones only
            const keyIdxs = [0, 6, 12, 24, 30, 36, 40, 42, 45, 47, 48];
            return keyIdxs.includes(idx) ? predLabels[idx] : '';
          }
        },
        grid: { color: '#111' }
      },
      y: { ticks: { color: '#444', callback: v => '$' + v, font: { family: 'Inter' } }, grid: { color: '#111' }, suggestedMin: 0 },
    }
  }
});

// Per-Quality Projected Value Chart
{
  const qualNames = ['Normal', 'Embroidered', 'Holo', 'Gold'];
  const qualColors = { Normal: '#888', Embroidered: '#4ade80', Holo: '#a5b4fc', Gold: '#ffd700' };
  const qualPredData = {};
  for (const q of qualNames) {
    const qStickers = ${JSON.stringify(stickers)}.filter(s => s.quality === q || (q === 'Normal' && s.quality.startsWith('Normal')));
    const qQty = qStickers.reduce((a, s) => a + s.qty, 0);
    const qCost = qQty * 0.35;
    qualPredData[q] = predValues.map((v, i) => {
      if (i === 0) {
        const qCurrentVal = ${JSON.stringify(Object.fromEntries(
          ['Normal', 'Embroidered', 'Holo', 'Gold'].map(q => {
            const qData = data.filter(r => r.quality === q || (q === 'Normal' && r.quality.startsWith('Normal')));
            return [q, qData.reduce((a, r) => a + r.totalValue, 0)];
          })
        ))}[q] || 0;
        return qCurrentVal;
      }
      return qCost * (1 + ${JSON.stringify(timeProjections.map(t => t.avgROI))}[i-1] / 100);
    });
  }
  const qpCtx = document.getElementById('qualityPredChart').getContext('2d');
  new Chart(qpCtx, {
    type: 'line',
    data: {
      labels: predLabels,
      datasets: qualNames.map(q => ({
        label: q,
        data: qualPredData[q],
        borderColor: qualColors[q],
        backgroundColor: qualColors[q] + '10',
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
      })),
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#888', font: { family: 'Inter' } } },
        tooltip: { callbacks: { label: (c) => c.dataset.label + ': $' + c.parsed.y.toFixed(2) }, backgroundColor: 'rgba(10,10,20,0.9)', borderColor: '#333', borderWidth: 1 },
      },
      scales: {
        x: { ticks: { color: '#666', font: { size: 10 }, callback: function(val, idx) { const ki = [0,6,12,24,30,36,42,48]; return ki.includes(idx) ? predLabels[idx] : ''; } }, grid: { display: false } },
        y: { ticks: { color: '#444', callback: v => '$' + v }, grid: { color: '#111' }, suggestedMin: 0 },
      }
    }
  });
}

// ROI % Timeline Chart
{
  const roiCtx = document.getElementById('roiTimelineChart').getContext('2d');
  const roiData = [${JSON.stringify(parseFloat(grandROI))}, ${timeProjections.map(t => +t.avgROI.toFixed(1)).join(',')}];
  new Chart(roiCtx, {
    type: 'bar',
    data: {
      labels: predLabels,
      datasets: [{
        label: 'Projected ROI %',
        data: roiData,
        backgroundColor: roiData.map(v => v >= 0 ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'),
        borderColor: roiData.map(v => v >= 0 ? '#22c55e' : '#ef4444'),
        borderWidth: 1,
        borderRadius: 3,
      }],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => 'ROI: ' + (c.parsed.y >= 0 ? '+' : '') + c.parsed.y.toFixed(1) + '%' }, backgroundColor: 'rgba(10,10,20,0.9)', borderColor: '#333', borderWidth: 1 },
      },
      scales: {
        x: { ticks: { color: '#666', font: { size: 10 }, callback: function(val, idx) { const ki = [0,6,12,24,30,36,42,48]; return ki.includes(idx) ? predLabels[idx] : ''; } }, grid: { display: false } },
        y: { ticks: { color: '#444', callback: v => v + '%' }, grid: { color: '#111' } },
      }
    }
  });
}

// ── Snapshot Change Chart ──
{
  const snapEntries = ${JSON.stringify([...history.entries].reverse().map(e => ({ date: e.date, value: e.totalValue, cost: e.totalCost })))};
  if (snapEntries.length >= 2) {
    const changes = [];
    const changeDates = [];
    for (let i = 0; i < snapEntries.length - 1; i++) {
      changes.push(+(snapEntries[i].value - snapEntries[i+1].value).toFixed(2));
      changeDates.push(snapEntries[i].date);
    }
    const scCtx = document.getElementById('snapshotChangeChart').getContext('2d');
    new Chart(scCtx, {
      type: 'bar',
      data: {
        labels: changeDates,
        datasets: [{
          label: 'Value Change ($)',
          data: changes,
          backgroundColor: changes.map(v => v >= 0 ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'),
          borderColor: changes.map(v => v >= 0 ? '#22c55e' : '#ef4444'),
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => (c.parsed.y >= 0 ? '+' : '') + '$' + c.parsed.y.toFixed(2) }, backgroundColor: 'rgba(10,10,20,0.9)', borderColor: '#333', borderWidth: 1 },
        },
        scales: {
          x: { ticks: { color: '#666', font: { size: 10 }, maxRotation: 45 }, grid: { display: false } },
          y: { ticks: { color: '#444', callback: v => '$' + v }, grid: { color: '#111' } },
        }
      }
    });
  }
  // Cumulative P/L Chart
  const plCtx = document.getElementById('cumulativePLChart').getContext('2d');
  const plDates = snapEntries.map(e => e.date).reverse();
  const plValues = snapEntries.map(e => +(e.value - e.cost).toFixed(2)).reverse();
  new Chart(plCtx, {
    type: 'line',
    data: {
      labels: plDates,
      datasets: [{
        label: 'P/L ($)',
        data: plValues,
        borderColor: plValues[plValues.length-1] >= 0 ? '#22c55e' : '#ef4444',
        backgroundColor: plValues[plValues.length-1] >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: plValues.map(v => v >= 0 ? '#22c55e' : '#ef4444'),
      },
      {
        label: 'Break-Even',
        data: Array(plDates.length).fill(0),
        borderColor: '#555',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      }],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#888' } },
        tooltip: { callbacks: { label: (c) => c.dataset.label + ': ' + (c.parsed.y >= 0 ? '+' : '') + '$' + c.parsed.y.toFixed(2) }, backgroundColor: 'rgba(10,10,20,0.9)', borderColor: '#333', borderWidth: 1 },
      },
      scales: {
        x: { ticks: { color: '#666', font: { size: 10 }, maxRotation: 45 }, grid: { display: false } },
        y: { ticks: { color: '#444', callback: v => '$' + v }, grid: { color: '#111' } },
      }
    }
  });
}

// ── Sticker data for modal ──
const STICKER_DATA = ${JSON.stringify(data.map(r => ({
  name: r.name, quality: r.quality, qty: r.qty, price: r.currentPrice,
  value: r.totalValue, pl: r.profitLoss, roi: r.roi, volume: r.volume,
  listings: r.listings, strength: r.priceStrength, grade: r.grade, gradeColor: r.gradeColor,
  img: r.imageLargeUrl || r.imageUrl, url: r.marketUrl,
  history: r.priceHistory.map(h => ({ d: h.date, p: h.price })),
  ath: r.allTimeHigh, athDate: r.allTimeHighDate,
  atl: r.allTimeLow, atlDate: r.allTimeLowDate,
})))};

// ── Modal ──
function openModal(idx) {
  const d = STICKER_DATA[idx];
  if (!d) return;
  const modal = document.getElementById('stickerModal');
  document.getElementById('modalImg').src = d.img || '';
  document.getElementById('modalName').textContent = d.name;
  const qc = d.quality.toLowerCase();
  const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
  document.getElementById('modalBadges').innerHTML =
    '<span class="quality-badge q-' + cls + '">' + d.quality + '</span>' +
    ' <span class="grade-badge" style="background:' + d.gradeColor + '20;color:' + d.gradeColor + ';margin-left:6px">' + d.grade + '</span>';

  // Sparkline SVG
  const spark = document.getElementById('modalSparkline');
  if (d.history.length >= 2) {
    const prices = d.history.map(h => h.p);
    const min = Math.min(...prices), max = Math.max(...prices);
    const range = max - min || 1;
    const w = 400, h = 50;
    const pts = prices.map((p, i) => (i / (prices.length - 1)) * w + ',' + (h - ((p - min) / range) * h)).join(' ');
    spark.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:50px;"><polyline points="' + pts + '" fill="none" stroke="#67c1f5" stroke-width="2"/></svg>';
  } else {
    spark.innerHTML = '<div style="text-align:center;color:#555;font-size:12px;">Not enough data for sparkline</div>';
  }

  document.getElementById('modalStats').innerHTML = [
    ['Price', '$' + d.price.toFixed(2)],
    ['Qty Held', '' + d.qty],
    ['Total Value', '$' + d.value.toFixed(2)],
    ['P/L', (d.pl >= 0 ? '+' : '') + '$' + d.pl.toFixed(2)],
    ['ROI', d.roi],
    ['All-Time High', '$' + d.ath.toFixed(2) + ' (' + d.athDate + ')'],
    ['All-Time Low', '$' + d.atl.toFixed(2) + ' (' + d.atlDate + ')'],
    ['Grade', d.grade],
    ['Vol (24h)', d.volume > 0 ? d.volume.toLocaleString() : '-'],
    ['Listings', d.listings > 0 ? d.listings.toLocaleString() : '-'],
    ['Strength', d.strength],
  ].map(([label, val]) => '<div class="modal-stat"><div class="modal-stat-label">' + label + '</div><div class="modal-stat-val">' + val + '</div></div>').join('');

  document.getElementById('modalLink').href = d.url;
  modal.classList.add('visible');
}
function closeModal() { document.getElementById('stickerModal').classList.remove('visible'); }
document.getElementById('stickerModal').addEventListener('click', function(e) { if (e.target === this) closeModal(); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
document.querySelectorAll('.sticker-modal-trigger').forEach(el => {
  el.addEventListener('click', function(e) {
    e.preventDefault();
    const idx = parseInt(this.getAttribute('data-idx'));
    if (!isNaN(idx)) openModal(idx);
  });
});

// ── Grid/Table toggle ──
function setView(mode) {
  const table = document.getElementById('mainTable');
  const grid = document.getElementById('stickerGrid');
  const btns = document.querySelectorAll('.view-toggle button');
  if (mode === 'grid') {
    table.style.display = 'none';
    grid.classList.add('visible');
    btns[0].classList.remove('active');
    btns[1].classList.add('active');
  } else {
    table.style.display = '';
    grid.classList.remove('visible');
    btns[0].classList.add('active');
    btns[1].classList.remove('active');
  }
}

// ── Accordion ──
function toggleAccordion(idx) {
  const el = document.querySelector('.accordion-group[data-group="' + idx + '"]');
  if (el) el.classList.toggle('open');
}

// ── Scroll to top ──
window.addEventListener('scroll', function() {
  document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 500);
});

// ── Sticky nav active section ──
const navLinks = document.querySelectorAll('.sticky-nav a');
const sections = Array.from(navLinks).map(a => {
  const id = a.getAttribute('href').slice(1);
  return document.getElementById(id);
}).filter(Boolean);
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const link = document.querySelector('.sticky-nav a[href="#' + entry.target.id + '"]');
      if (link) link.classList.add('active');
    }
  });
}, { rootMargin: '-80px 0px -60% 0px' });
sections.forEach(s => navObserver.observe(s));

// ── Animated counters ──
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.getAttribute('data-target') || '0');
      if (target === 0 || el.dataset.counted) return;
      el.dataset.counted = 'true';
      const start = performance.now();
      const duration = 1500;
      const fmt = target >= 1000;
      function step(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        el.textContent = fmt ? val.toLocaleString() : '' + val;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.counter-value[data-target]').forEach(el => counterObserver.observe(el));

// ── CSV Download ──
function downloadCSV() {
  const csv = ${JSON.stringify(csvOut.replace(/\n/g, '\r\n'))};
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'budapest2025_stickers.csv';
  a.click();
  URL.revokeObjectURL(url);
}
</script>
</body>
</html>`;

  console.log(`\nWriting HTML (${html.length} bytes) to ${HTML_FILE}...`);
  await Bun.write(HTML_FILE, html);
  console.log(`HTML written successfully`);

  console.log(`\n========================================`);
  console.log(`DONE - ${todayFull}`);
  console.log(`========================================`);
  console.log(`Stickers: ${grandQty} | Cost: A$${grandCost.toFixed(2)} | Value: A$${grandValue.toFixed(2)} | P/L: A$${grandPL.toFixed(2)} (${grandROI}%)`);
  console.log(`Investment Signal: ${investmentSignal} (${investmentScore}/10)`);
  console.log(`Snapshots saved: ${history.entries.length}`);
  console.log(`\nFiles updated:`);
  console.log(`  ${HTML_FILE}`);
  console.log(`  ${CSV_FILE}`);
  console.log(`  ${HISTORY_FILE}`);

  // ── Discord Notifications ─────────────────────────────────────────
  if (!existingToday) {
    const prevEntry = history.entries.length >= 2 ? history.entries[history.entries.length - 2] : null;

    // 5A/5B: Price Spike & Crash Alerts
    if (prevEntry) {
      const spikeEmbeds: object[] = [];
      const crashEmbeds: object[] = [];
      for (const s of stickers) {
        const key = stickerKey(s.name, s.quality);
        const curr = currentPrices[key] || 0;
        const prev = prevEntry.prices[key] || 0;
        if (prev <= 0 || curr <= 0) continue;
        const changePct = ((curr - prev) / prev) * 100;
        const hashName = getMarketHashName(s.name, s.quality);
        const iconUrl = getImageUrl(imageCache, hashName, 128);
        if (changePct >= 50) {
          spikeEmbeds.push({
            title: `\u{1F4C8} Price Spike: ${s.name} (${s.quality})`,
            color: 0x22c55e,
            thumbnail: iconUrl ? { url: iconUrl } : undefined,
            fields: [
              { name: 'Previous', value: `A$${prev.toFixed(2)}`, inline: true },
              { name: 'Current', value: `A$${curr.toFixed(2)}`, inline: true },
              { name: 'Change', value: `+${changePct.toFixed(1)}%`, inline: true },
            ],
            url: getMarketUrl(hashName),
            footer: discordFooter(),
          });
        } else if (changePct <= -30) {
          crashEmbeds.push({
            title: `\u{1F4C9} Price Drop: ${s.name} (${s.quality})`,
            color: 0xef4444,
            thumbnail: iconUrl ? { url: iconUrl } : undefined,
            fields: [
              { name: 'Previous', value: `A$${prev.toFixed(2)}`, inline: true },
              { name: 'Current', value: `A$${curr.toFixed(2)}`, inline: true },
              { name: 'Change', value: `${changePct.toFixed(1)}%`, inline: true },
            ],
            url: getMarketUrl(hashName),
            footer: discordFooter(),
          });
        }
      }
      if (spikeEmbeds.length > 0 || crashEmbeds.length > 0) {
        await sendDiscord(DISCORD_WEBHOOKS.alerts, [...spikeEmbeds, ...crashEmbeds].slice(0, 10));
        console.log(`Discord: Sent ${spikeEmbeds.length} spike + ${crashEmbeds.length} crash alerts`);
      }
    }

    // 5C: Portfolio Summary (every run)
    const portfolioChange = prevEntry ? todayEntry.totalValue - prevEntry.totalValue : 0;
    const portfolioChangePct = prevEntry ? ((portfolioChange / prevEntry.totalValue) * 100).toFixed(1) : '0';
    const topMovers = prevEntry ? [...stickers].map(s => {
      const key = stickerKey(s.name, s.quality);
      const curr = currentPrices[key] || 0;
      const prev = prevEntry.prices[key] || 0;
      return { name: s.name, quality: s.quality, changePct: prev > 0 ? ((curr - prev) / prev) * 100 : 0 };
    }).filter(m => m.changePct !== 0).sort((a, b) => b.changePct - a.changePct) : [];
    const top3Up = topMovers.slice(0, 3).map(m => `${m.name} (${m.quality}): +${m.changePct.toFixed(1)}%`).join('\n');
    const top3Down = topMovers.slice(-3).reverse().map(m => `${m.name} (${m.quality}): ${m.changePct.toFixed(1)}%`).join('\n');

    await sendDiscord(DISCORD_WEBHOOKS.portfolio, [{
      title: '\u{1F4CA} Portfolio Summary',
      color: 0x3b82f6,
      fields: [
        { name: 'Total Value', value: `A$${grandValue.toFixed(2)}`, inline: true },
        { name: 'P/L', value: `${grandPL >= 0 ? '+' : ''}A$${grandPL.toFixed(2)} (${grandROI}%)`, inline: true },
        { name: 'Change', value: prevEntry ? `${portfolioChange >= 0 ? '+' : ''}A$${portfolioChange.toFixed(2)} (${portfolioChangePct}%)` : 'First snapshot', inline: true },
        ...(top3Up ? [{ name: '\u{1F4C8} Top Movers', value: top3Up, inline: true }] : []),
        ...(top3Down ? [{ name: '\u{1F4C9} Bottom Movers', value: top3Down, inline: true }] : []),
        { name: 'Stats', value: `${history.entries.length} snapshots | ${grandQty} stickers tracked`, inline: false },
      ],
      footer: discordFooter(),
    }]);
    console.log('Discord: Sent portfolio summary');

    // 5D: Milestone Alerts
    const milestoneEmbeds: object[] = [];
    const entryMilestones = todayEntry.milestones || [];
    if (grandPL >= 0 && prevEntry && (prevEntry.totalValue - prevEntry.totalCost) < 0) {
      if (!entryMilestones.includes('breakeven')) {
        milestoneEmbeds.push({ title: '\u{1F389} Break-Even Achieved!', color: 0xffd700, description: `Your portfolio just crossed the break-even point! Value: A$${grandValue.toFixed(2)} vs Cost: A$${grandCost.toFixed(2)}`, footer: discordFooter() });
        entryMilestones.push('breakeven');
      }
    }
    // ATH check
    const allTimeHigh = Math.max(...history.entries.map(e => e.totalValue));
    if (todayEntry.totalValue >= allTimeHigh && history.entries.length > 1) {
      if (!entryMilestones.includes('ath')) {
        milestoneEmbeds.push({ title: '\u{1F680} New All-Time High!', color: 0xffd700, description: `Portfolio reached a new ATH: A$${grandValue.toFixed(2)}`, footer: discordFooter() });
        entryMilestones.push('ath');
      }
    }
    // ROI milestones
    const roiVal = parseFloat(grandROI);
    for (const threshold of [10, 25, 50, 100]) {
      if (roiVal >= threshold && !entryMilestones.includes(`roi${threshold}`)) {
        milestoneEmbeds.push({ title: `\u{1F3AF} ROI Milestone: +${threshold}%!`, color: 0xffd700, description: `Portfolio ROI has reached +${roiVal.toFixed(1)}%, crossing the ${threshold}% milestone!`, footer: discordFooter() });
        entryMilestones.push(`roi${threshold}`);
      }
    }
    todayEntry.milestones = entryMilestones;
    if (milestoneEmbeds.length > 0) {
      await sendDiscord(DISCORD_WEBHOOKS.milestones, milestoneEmbeds);
      console.log(`Discord: Sent ${milestoneEmbeds.length} milestone alerts`);
    }

    // 5E: Investment Signal Update
    if (prevEntry) {
      const prevScore = prevEntry.lastInvestmentScore || 0;
      const prevSignal = prevEntry.lastInvestmentSignal || '';
      if (Math.abs(investmentScore - prevScore) >= 2 || (prevSignal && prevSignal !== investmentSignal)) {
        await sendDiscord(DISCORD_WEBHOOKS.signals, [{
          title: `\u{1F4A1} Investment Signal: ${investmentSignal}`,
          color: investmentScore >= 7 ? 0x22c55e : investmentScore >= 4 ? 0xf59e0b : 0xef4444,
          fields: [
            { name: 'Score', value: `${investmentScore}/10 (was ${prevScore}/10)`, inline: true },
            { name: 'Signal', value: `${prevSignal || 'N/A'} \u2192 ${investmentSignal}`, inline: true },
            ...scoreFactors.map(f => ({ name: f.name, value: `${f.score}/10 \u2014 ${f.detail}`, inline: false })),
          ],
          footer: discordFooter(),
        }]);
        console.log(`Discord: Sent signal update (${prevSignal || 'N/A'} -> ${investmentSignal})`);
      }
    }
    todayEntry.lastInvestmentScore = investmentScore;
    todayEntry.lastInvestmentSignal = investmentSignal;

    // 5F: Slab Opportunity Alerts
    const slabOpps = uniqueSlabRows.filter(r => r.slabPrice > 0 && r.premiumPct <= -20);
    if (slabOpps.length > 0) {
      const slabEmbeds = slabOpps.slice(0, 5).map(r => ({
        title: `\u{1F4B0} Slab Deal: ${r.name} (${r.quality})`,
        color: 0x22c55e,
        fields: [
          { name: '5x Individual', value: `A$${r.fiveXPrice.toFixed(2)}`, inline: true },
          { name: 'Slab Price', value: `A$${r.slabPrice.toFixed(2)}`, inline: true },
          { name: 'Savings', value: `${Math.abs(r.premiumPct).toFixed(1)}% cheaper`, inline: true },
        ],
        url: getMarketUrl(r.hashName),
        footer: discordFooter(),
      }));
      await sendDiscord(DISCORD_WEBHOOKS.signals, slabEmbeds);
      console.log(`Discord: Sent ${slabEmbeds.length} slab opportunity alerts`);
    }

    // 5G: Weekly Trend Report (first run of Monday)
    const isMonday = now.getDay() === 1;
    const lastWeeklyDate = history.entries.find(e => e.weeklyReportSent)?.weeklyReportSent;
    const alreadySentThisWeek = lastWeeklyDate && (now.getTime() - new Date(lastWeeklyDate).getTime()) < 6 * 86400000;
    if (isMonday && !alreadySentThisWeek) {
      // Find snapshot from ~7 days ago
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      const weekAgoEntry = history.entries.reduce((closest, e) => {
        const d = Math.abs(new Date(e.date).getTime() - weekAgo.getTime());
        return d < Math.abs(new Date(closest.date).getTime() - weekAgo.getTime()) ? e : closest;
      }, history.entries[0]);
      const weekChange = todayEntry.totalValue - weekAgoEntry.totalValue;
      const weekChangePct = ((weekChange / weekAgoEntry.totalValue) * 100).toFixed(1);

      await sendDiscord(DISCORD_WEBHOOKS.weekly, [{
        title: '\u{1F4C5} Weekly Trend Report',
        color: 0x8b5cf6,
        fields: [
          { name: 'Week-over-Week', value: `${weekChange >= 0 ? '+' : ''}A$${weekChange.toFixed(2)} (${weekChangePct}%)`, inline: true },
          { name: 'Portfolio Value', value: `A$${grandValue.toFixed(2)}`, inline: true },
          { name: 'ROI', value: `${grandROI}%`, inline: true },
          { name: 'Investment Signal', value: `${investmentSignal} (${investmentScore}/10)`, inline: true },
          { name: 'Quality Breakdown', value: `Normal: ${(pctNormal*100).toFixed(0)}% | Emb: ${(pctEmbroidered*100).toFixed(0)}% | Holo: ${(pctHolo*100).toFixed(0)}% | Gold: ${(pctGold*100).toFixed(0)}%`, inline: false },
          { name: 'Est. Sell Window', value: `${peakWindow.label} (~${bestSellStr})`, inline: true },
          { name: 'Projected Break-Even', value: breakEvenMonths > 0 ? (breakEvenMonths < 12 ? breakEvenMonths + ' months' : (breakEvenMonths/12).toFixed(1) + ' years') : 'Unknown', inline: true },
          { name: 'Dashboard', value: '[View Live Dashboard](https://oldm8clint.github.io/budapest2025/)', inline: false },
        ],
        footer: discordFooter(),
      }]);
      todayEntry.weeklyReportSent = now.toISOString();
      console.log('Discord: Sent weekly trend report');
    }

    // Save updated milestones/signal data back to history
    await Bun.write(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (err) {
    console.error('ERROR in main():', err);
    console.error('Stack:', (err instanceof Error) ? err.stack : 'N/A');
    throw err;
  }
}

main().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
