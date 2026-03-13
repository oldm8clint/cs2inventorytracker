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
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}`;
  const todayFull = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')} UTC`;
  const history = await loadHistory();
  let imageCache = await fetchStickerImages();
  imageCache = await fetchIconicImages(imageCache);

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

    data.push({
      name: s.name, quality: s.quality, qty: s.qty, costPerUnit: 0.35,
      totalCost, currentPrice: price, totalValue, profitLoss: pl,
      roi: roi + '%', marketUrl: getMarketUrl(hashName), hashName, priceHistory: ph,
      imageUrl: getImageUrl(imageCache, hashName, 128),
      imageLargeUrl: getImageUrl(imageCache, hashName, 256),
      isTeam: TEAM_NAMES.has(s.name),
      volume: vol, listings: list, priceStrength: strength, grade: invGrade, gradeColor,
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
  const featured = [...data].filter(r => r.currentPrice > 0 && r.imageUrl).sort((a, b) => b.currentPrice - a.currentPrice).slice(0, 5);

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
  const KATOWICE_2014_WEIGHT = 0.1; // De-weight Katowice 2014 (outlier, not realistic for modern majors)
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

  // ── DCA Calculator ────────────────────────────────────────────────
  const dcaScenarios = [50, 100, 250, 500].map(amount => {
    const avgPrice = grandValue / grandQty;
    const newStickers = Math.floor(amount / avgPrice);
    const newTotal = grandValue + amount;
    const newCost = grandCost + amount;
    const newBreakEven = newCost / (grandQty + newStickers);
    // Conservative: avg of last 4 majors ROI; Best: best major ROI (excluding Katowice 2014)
    const conservativeROI = projections.filter(p => recentMajors.has(p.name)).reduce((a, p) => a + p.roi, 0) / 4;
    const bestCaseROI = projections.filter(p => p.name !== 'Katowice 2014').reduce((max, p) => Math.max(max, p.roi), 0);
    return {
      amount,
      newStickers,
      newTotal,
      newCost,
      newBreakEven,
      projected2yr: newCost * (1 + (conservativeROI * 0.3) / 100),
      projected5yr: newCost * (1 + conservativeROI / 100),
      bestCase5yr: newCost * (1 + bestCaseROI / 100),
    };
  });

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
    { label: '1-2 Years', months: 18, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '2-4 Years', months: 36, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '4-6 Years', months: 60, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '6-8 Years', months: 84, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '8-10 Years', months: 108, avgROI: 0, majorsInRange: [], recommendation: '' },
    { label: '10+ Years', months: 132, avgROI: 0, majorsInRange: [], recommendation: '' },
  ];
  const realisticProjections = projections.filter(p => p.name !== 'Katowice 2014');
  for (const sw of sellWindows) {
    const nearby = realisticProjections.filter(p => Math.abs(p.monthsOld - sw.months) <= 18);
    if (nearby.length > 0) {
      sw.avgROI = nearby.reduce((a, p) => a + p.roi, 0) / nearby.length;
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
  .q-capsule { background: rgba(56,189,248,0.12); color: #38bdf8; border: 1px solid rgba(56,189,248,0.15); }

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

  /* Sticker thumbnails */
  .sticker-thumb { width: 32px; height: 32px; vertical-align: middle; margin-right: 6px; border-radius: 4px; image-rendering: auto; }
  .sticker-name-cell { display: flex; align-items: center; gap: 6px; }

  /* Featured stickers */
  .featured-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .featured-card { background: linear-gradient(145deg, #111118, #0d0d14); border: 1px solid #1a1a28; border-radius: 14px; padding: 20px; text-align: center; transition: border-color 0.3s, transform 0.2s; position: relative; overflow: hidden; }
  .featured-card:hover { border-color: #ffd700; transform: translateY(-2px); }
  .featured-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent); }
  .featured-card img { width: 128px; height: 128px; margin: 8px auto; display: block; filter: drop-shadow(0 4px 12px rgba(255,215,0,0.15)); }
  .featured-name { font-size: 15px; font-weight: 700; color: #fff; margin-top: 8px; }
  .featured-price { font-size: 22px; font-weight: 800; margin-top: 4px; }
  .featured-roi { font-size: 12px; margin-top: 2px; font-weight: 600; }
  .featured-rank { position: absolute; top: 12px; left: 14px; font-size: 20px; font-weight: 800; color: rgba(255,215,0,0.3); }

  /* Team vs Player */
  .tvp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
  @media (max-width: 800px) { .tvp-grid { grid-template-columns: 1fr; } }
  .tvp-card { background: linear-gradient(145deg, #111118, #0d0d14); border: 1px solid #1a1a28; border-radius: 12px; padding: 20px 24px; }
  .tvp-card h4 { font-size: 15px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .tvp-stat { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #0f0f18; font-size: 13px; }
  .tvp-stat:last-child { border-bottom: none; }
  .tvp-label { color: #888; }
  .tvp-val { font-weight: 600; }

  /* Donut chart */
  .chart-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  @media (max-width: 1000px) { .chart-row { grid-template-columns: 1fr; } }
  .chart-box { background: linear-gradient(145deg, #111118, #0d0d14); border: 1px solid #1a1a28; border-radius: 12px; padding: 24px; }
  .chart-box canvas { max-height: 300px; }

  /* Investment Signal */
  .signal-card { background: linear-gradient(145deg, #111118, #0d0d14); border: 2px solid; border-radius: 16px; padding: 28px 32px; margin-bottom: 32px; position: relative; overflow: hidden; }
  .signal-header { display: flex; align-items: center; gap: 20px; margin-bottom: 16px; }
  .signal-score { font-size: 52px; font-weight: 900; line-height: 1; }
  .signal-label { font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
  .signal-sub { font-size: 13px; color: #888; }
  .signal-factors { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 16px; }
  .signal-factor { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: 8px; font-size: 12px; }
  .signal-factor-name { color: #888; }
  .signal-factor-score { font-weight: 700; }

  /* Risk cards */
  .risk-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 32px; }
  .risk-card { background: linear-gradient(145deg, #111118, #0d0d14); border: 1px solid #1a1a28; border-radius: 12px; padding: 18px 20px; }
  .risk-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; letter-spacing: 1px; }

  /* Sell timing */
  .sell-card { background: linear-gradient(145deg, #111118, #0d0d14); border: 1px solid #ffd700; border-radius: 12px; padding: 20px 24px; margin-bottom: 16px; }

  /* Slab table */
  .slab-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px; }

  /* DCA table */
  .dca-table { max-width: 900px; }
  .dca-table td, .dca-table th { padding: 10px 14px; }

  /* Market cycle */
  .cycle-callout { background: linear-gradient(145deg, #111118, #0d0d14); border-left: 3px solid #ffd700; border-radius: 0 12px 12px 0; padding: 16px 20px; margin-bottom: 24px; font-size: 13px; color: #aaa; }
  .cycle-callout strong { color: #ffd700; }

  /* Iconic sticker in table */
  .iconic-thumb { width: 40px; height: 40px; vertical-align: middle; border-radius: 4px; }

  /* Sticky Nav */
  .sticky-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(6,6,10,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,215,0,0.15); padding: 0 40px; display: flex; align-items: center; gap: 0; height: 48px; }
  .sticky-nav a { color: #888; font-size: 12px; font-weight: 600; text-decoration: none; padding: 14px 14px; transition: color 0.2s, border-color 0.2s; border-bottom: 2px solid transparent; white-space: nowrap; }
  .sticky-nav a:hover, .sticky-nav a.active { color: #ffd700; border-bottom-color: #ffd700; }
  body { padding-top: 68px; }

  /* Grid view toggle */
  .view-toggle { display: inline-flex; gap: 0; margin-left: 12px; }
  .view-toggle button { background: #111118; border: 1px solid #1a1a28; color: #888; padding: 8px 16px; font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; }
  .view-toggle button:first-child { border-radius: 8px 0 0 8px; }
  .view-toggle button:last-child { border-radius: 0 8px 8px 0; }
  .view-toggle button.active { background: rgba(255,215,0,0.1); color: #ffd700; border-color: rgba(255,215,0,0.3); }

  /* Sticker grid */
  .sticker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; display: none; }
  .sticker-grid.visible { display: grid; }
  .grid-card { background: linear-gradient(145deg, #111118, #0d0d14); border: 1px solid #1a1a28; border-radius: 12px; padding: 16px; text-align: center; cursor: pointer; transition: border-color 0.3s, transform 0.2s; position: relative; overflow: hidden; }
  .grid-card:hover { transform: translateY(-2px); border-color: #2a2a3e; }
  .grid-card.profitable { border-left: 3px solid #22c55e; }
  .grid-card.losing { border-left: 3px solid #ef4444; }
  .grid-card.premium { border-left: 3px solid #ffd700; }
  .grid-card img { width: 80px; height: 80px; margin: 4px auto; display: block; }
  .grid-card-name { font-size: 13px; font-weight: 600; color: #fff; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .grid-card-price { font-size: 18px; font-weight: 800; margin-top: 2px; }
  .grid-card-roi { font-size: 11px; font-weight: 600; margin-top: 2px; }

  /* Sticker detail modal */
  .modal-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 2000; justify-content: center; align-items: center; animation: fadeIn 0.2s; }
  .modal-overlay.visible { display: flex; }
  .modal-content { background: #0d0d14; border: 1px solid #1a1a28; border-radius: 16px; padding: 32px; max-width: 480px; width: 90%; position: relative; animation: slideUp 0.25s; }
  .modal-close { position: absolute; top: 12px; right: 16px; background: none; border: none; color: #888; font-size: 24px; cursor: pointer; padding: 4px 8px; transition: color 0.2s; }
  .modal-close:hover { color: #fff; }
  .modal-img { width: 192px; height: 192px; margin: 0 auto 16px; display: block; }
  .modal-name { font-size: 22px; font-weight: 800; color: #fff; text-align: center; }
  .modal-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
  .modal-stat { padding: 10px; background: rgba(255,255,255,0.02); border-radius: 8px; }
  .modal-stat-label { font-size: 10px; text-transform: uppercase; color: #555; letter-spacing: 1px; font-weight: 600; }
  .modal-stat-val { font-size: 16px; font-weight: 700; margin-top: 2px; }
  .modal-sparkline { margin: 16px 0; }
  .modal-link { display: block; text-align: center; margin-top: 12px; color: #60a5fa; font-weight: 600; font-size: 14px; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* Price strength indicator */
  .strength-bars { display: inline-flex; gap: 2px; align-items: flex-end; height: 16px; vertical-align: middle; }
  .strength-bar { width: 4px; border-radius: 1px; transition: background 0.2s; }

  /* Investment grade badge */
  .grade-badge { display: inline-block; width: 26px; height: 26px; line-height: 26px; text-align: center; border-radius: 6px; font-size: 12px; font-weight: 900; }

  /* Scroll to top */
  .scroll-top { position: fixed; bottom: 30px; right: 30px; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,215,0,0.15); border: 1px solid rgba(255,215,0,0.3); color: #ffd700; font-size: 20px; cursor: pointer; display: none; align-items: center; justify-content: center; z-index: 999; transition: opacity 0.3s, transform 0.2s; backdrop-filter: blur(8px); }
  .scroll-top:hover { transform: translateY(-2px); background: rgba(255,215,0,0.25); }
  .scroll-top.visible { display: flex; }

  /* CSV download button */
  .btn-download { background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.3); color: #ffd700; padding: 8px 18px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.5px; }
  .btn-download:hover { background: rgba(255,215,0,0.2); }

  /* Player/Team accordion */
  .accordion-group { background: linear-gradient(145deg, #111118, #0d0d14); border: 1px solid #1a1a28; border-radius: 10px; margin-bottom: 8px; overflow: hidden; }
  .accordion-header { display: flex; align-items: center; gap: 12px; padding: 14px 18px; cursor: pointer; transition: background 0.2s; }
  .accordion-header:hover { background: rgba(255,215,0,0.02); }
  .accordion-header img { width: 36px; height: 36px; border-radius: 6px; }
  .accordion-header-name { font-weight: 700; font-size: 14px; flex: 1; }
  .accordion-header-stats { display: flex; gap: 16px; font-size: 12px; color: #888; }
  .accordion-header-stats span { font-weight: 600; }
  .accordion-arrow { color: #555; transition: transform 0.2s; font-size: 14px; }
  .accordion-group.open .accordion-arrow { transform: rotate(90deg); }
  .accordion-body { display: none; padding: 0 18px 14px; }
  .accordion-group.open .accordion-body { display: block; }
  .accordion-body table { font-size: 12px; }

  /* Market activity section */
  .market-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 24px; }
  .strength-dist { display: flex; gap: 12px; align-items: flex-end; height: 80px; padding: 12px 0; }
  .strength-dist-bar { flex: 1; border-radius: 4px 4px 0 0; min-width: 40px; text-align: center; font-size: 10px; font-weight: 700; position: relative; transition: height 0.3s; }
  .strength-dist-label { position: absolute; bottom: -18px; left: 0; right: 0; font-size: 10px; color: #888; }

  /* Animated counter */
  .counter-value { display: inline-block; }
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
  <a href="#inventory-section">Inventory</a>
  <a href="#browse-section">Browse</a>
</nav>

<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
  <div>
    <h1>Budapest 2025 Major Sticker Investments</h1>
<div class="subtitle">Last updated <span>${todayFull}</span> &middot; All prices AUD &middot; Buy price $0.35/ea &middot; <span>${history.entries.length} snapshot${history.entries.length !== 1 ? 's' : ''}</span></div>
  </div>
  <button class="btn-download" onclick="downloadCSV()">Download CSV</button>
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

<h3>Dollar-Cost Averaging Calculator</h3>
<p style="color:#888;font-size:13px;margin-bottom:16px;">What if you invested more? Projections based on current avg price of $${(grandValue / grandQty).toFixed(3)}/sticker. Conservative = avg of last 4 majors, Best case = top major (excl. Katowice 2014).</p>
<table class="history-table dca-table">
<thead><tr><th>Additional $</th><th>New Stickers</th><th>New Portfolio</th><th>New Cost</th><th>Break-Even/ea</th><th>Projected 2yr</th><th>Projected 5yr</th><th>Best Case 5yr</th></tr></thead>
<tbody>
${dcaScenarios.map(d => `<tr>
  <td style="font-weight:600;color:#60a5fa">+$${d.amount}</td>
  <td>~${d.newStickers}</td>
  <td>$${d.newTotal.toFixed(2)}</td>
  <td>$${d.newCost.toFixed(2)}</td>
  <td>$${d.newBreakEven.toFixed(3)}</td>
  <td class="${d.projected2yr >= d.newCost ? 'positive' : 'negative'}">$${d.projected2yr.toFixed(2)}</td>
  <td class="${d.projected5yr >= d.newCost ? 'positive' : 'negative'}">$${d.projected5yr.toFixed(2)}</td>
  <td class="positive">$${d.bestCase5yr.toFixed(2)}</td>
</tr>`).join('\n')}
</tbody>
</table>

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
  return `<tr>
    <td style="font-weight:500">${r.name}</td>
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
<p style="color:#555;font-size:11px;margin-top:8px;font-style:italic;">Projections based on ${projections.length} previous CS majors (Katowice 2014 - Austin 2025). Weighted by your quality distribution. Pre-2019 majors lack Gold tier (marked N/A). Katowice 2014 is de-weighted (10%) as an unrealistic outlier for modern predictions. Past performance does not guarantee future results. Prices sampled March 2026.</p>

<h3>Sell Timing Recommendation</h3>
<div class="sell-card">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
    <div style="font-size:36px;font-weight:900;color:#ffd700;">SELL @ ${bestSellStr}</div>
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

<h3 id="inventory-section">Full Inventory (${data.length} line items)</h3>
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
  <th onclick="sortTable(11)">vs Buy</th>
  <th onclick="sortTable(12)">Time to ROI</th>
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
  <td></td><td>${totalVolume24h.toLocaleString()}</td><td></td><td></td><td></td><td></td><td></td>
</tr></tfoot>
</table>

<h3 id="browse-section">Browse by Player / Team</h3>
<p style="color:#888;font-size:13px;margin-bottom:16px;">Click to expand. Sorted by total portfolio value. Shows all quality variants per entity.</p>
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
      <thead><tr><th>Quality</th><th>Qty</th><th>Price</th><th>Value</th><th>P/L</th><th>ROI</th><th>Grade</th><th>Vol</th></tr></thead>
      <tbody>
      ${g.rows.map(r => {
        const qc = r.quality.toLowerCase();
        const cls = qc.includes('holo') ? 'holo' : qc.includes('embroidered') ? 'embroidered' : qc.includes('gold') ? 'gold' : qc.includes('champion') ? 'champion' : 'normal';
        return '<tr><td><span class="quality-badge q-' + cls + '">' + r.quality + '</span></td><td>' + r.qty + '</td><td>$' + r.currentPrice.toFixed(2) + '</td><td>$' + r.totalValue.toFixed(2) + '</td><td class="' + (r.profitLoss >= 0 ? 'positive' : 'negative') + '">' + (r.profitLoss >= 0 ? '+' : '') + '$' + r.profitLoss.toFixed(2) + '</td><td class="' + (parseFloat(r.roi) >= 0 ? 'positive' : 'negative') + '">' + r.roi + '</td><td>' + gradeBadgeHtml(r.grade, r.gradeColor) + '</td><td>' + (r.volume > 0 ? r.volume.toLocaleString() : '-') + '</td></tr>';
      }).join('\n')}
      </tbody>
      </table>
    </div>
  </div>`;
}).join('\n')}
</div>

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
        label: 'Actual Portfolio Value',
        data: ${JSON.stringify(actualDataForChart)},
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
        pointRadius: ${JSON.stringify(actualDataForChart.map(v => v !== null ? 6 : 0))},
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        spanGaps: false,
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
      tooltip: { callbacks: { label: (c) => c.dataset.label + ': ' + (c.parsed.y !== null ? '$' + c.parsed.y.toFixed(2) : 'No data') } },
    },
    scales: {
      x: { ticks: { color: '#666', font: { family: 'Inter' } }, grid: { color: '#111' } },
      y: { ticks: { color: '#444', callback: v => '$' + v, font: { family: 'Inter' } }, grid: { color: '#111' },
        suggestedMin: 0,
      },
    }
  }
});

// ── Sticker data for modal ──
const STICKER_DATA = ${JSON.stringify(data.map(r => ({
  name: r.name, quality: r.quality, qty: r.qty, price: r.currentPrice,
  value: r.totalValue, pl: r.profitLoss, roi: r.roi, volume: r.volume,
  listings: r.listings, strength: r.priceStrength, grade: r.grade, gradeColor: r.gradeColor,
  img: r.imageLargeUrl || r.imageUrl, url: r.marketUrl,
  history: r.priceHistory.map(h => ({ d: h.date, p: h.price })),
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
    spark.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + h + '" style="width:100%;height:50px;"><polyline points="' + pts + '" fill="none" stroke="#ffd700" stroke-width="2"/></svg>';
  } else {
    spark.innerHTML = '<div style="text-align:center;color:#555;font-size:12px;">Not enough data for sparkline</div>';
  }

  document.getElementById('modalStats').innerHTML = [
    ['Price', '$' + d.price.toFixed(2)],
    ['Qty Held', '' + d.qty],
    ['Total Value', '$' + d.value.toFixed(2)],
    ['P/L', (d.pl >= 0 ? '+' : '') + '$' + d.pl.toFixed(2)],
    ['ROI', d.roi],
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

  await Bun.write(HTML_FILE, html);

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
  }

}

main().catch(console.error);
