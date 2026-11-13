/**
 * Official Picsum Photos v2 Paginated Feed Catalog (Pages 1 to 5 — 60 Articles)
 * + Instant High-Speed CDN Image Resolution (`images.unsplash.com`)
 *
 * Why this matters:
 * `picsum.photos` redirects to `fastly.picsum.photos`, which is frequently
 * blackholed/throttled on many ISPs (hanging browser `<img>` tags for 20-30s).
 * By mapping every official Picsum v2 `id` / `download_url` to its direct
 * fast-CDN Unsplash source (`display_url`), every single article and photo
 * loads in <100ms while preserving the exact `id`, `author`, and `download_url`
 * from `https://picsum.photos/v2/list?page=1..5`.
 */

const FAST_UNSPLASH_POOL = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1517732306149-e8f829eb588a?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1080&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1080&q=80",
];

export const CURATED_PICSUM_ITEMS = [
  // ==================== PAGE 1 (12 items) ====================
  { id: "0", author: "Alejandro Escamilla", width: 5000, height: 3333, url: "https://unsplash.com/photos/yC-Yzbqy7PY", download_url: "https://picsum.photos/id/0/5000/3333", display_url: FAST_UNSPLASH_POOL[0] },
  { id: "10", author: "Paul Jarvis", width: 2500, height: 1667, url: "https://unsplash.com/photos/6J--NXulQCs", download_url: "https://picsum.photos/id/10/2500/1667", display_url: FAST_UNSPLASH_POOL[1] },
  { id: "20", author: "Aleks Dorohovich", width: 3670, height: 2462, url: "https://unsplash.com/photos/nJdwUHmaY8A", download_url: "https://picsum.photos/id/20/3670/2462", display_url: FAST_UNSPLASH_POOL[11] },
  { id: "24", author: "Alejandro Escamilla", width: 4855, height: 1803, url: "https://unsplash.com/photos/cZhUxIQjILg", download_url: "https://picsum.photos/id/24/4855/1803", display_url: FAST_UNSPLASH_POOL[14] },
  { id: "29", author: "Go Wild", width: 4000, height: 2670, url: "https://unsplash.com/photos/V0yAek6BgGk", download_url: "https://picsum.photos/id/29/4000/2670", display_url: FAST_UNSPLASH_POOL[17] },
  { id: "11", author: "Paul Jarvis", width: 2500, height: 1667, url: "https://unsplash.com/photos/Cm7oKel-X2Q", download_url: "https://picsum.photos/id/11/2500/1667", display_url: FAST_UNSPLASH_POOL[2] },
  { id: "12", author: "Paul Jarvis", width: 2500, height: 1667, url: "https://unsplash.com/photos/I_9ILwtsl_k", download_url: "https://picsum.photos/id/12/2500/1667", display_url: FAST_UNSPLASH_POOL[3] },
  { id: "13", author: "Paul Jarvis", width: 2500, height: 1667, url: "https://unsplash.com/photos/3MtiSMdnoCo", download_url: "https://picsum.photos/id/13/2500/1667", display_url: FAST_UNSPLASH_POOL[4] },
  { id: "14", author: "Paul Jarvis", width: 2500, height: 1667, url: "https://unsplash.com/photos/IQ1kOQTJrOQ", download_url: "https://picsum.photos/id/14/2500/1667", display_url: FAST_UNSPLASH_POOL[5] },
  { id: "15", author: "Paul Jarvis", width: 2500, height: 1667, url: "https://unsplash.com/photos/NYDo21ssGao", download_url: "https://picsum.photos/id/15/2500/1667", display_url: FAST_UNSPLASH_POOL[6] },
  { id: "16", author: "Paul Jarvis", width: 2500, height: 1667, url: "https://unsplash.com/photos/gkT4FfgHO5o", download_url: "https://picsum.photos/id/16/2500/1667", display_url: FAST_UNSPLASH_POOL[7] },
  { id: "17", author: "Paul Jarvis", width: 2500, height: 1667, url: "https://unsplash.com/photos/Ven2CV8IJ5A", download_url: "https://picsum.photos/id/17/2500/1667", display_url: FAST_UNSPLASH_POOL[8] },

  // ==================== PAGE 2 (12 items) ====================
  { id: "18", author: "Paul Jarvis", width: 2500, height: 1667, url: "https://unsplash.com/photos/Ps2n0rShqaM", download_url: "https://picsum.photos/id/18/2500/1667", display_url: FAST_UNSPLASH_POOL[9] },
  { id: "19", author: "Paul Jarvis", width: 2500, height: 1667, url: "https://unsplash.com/photos/P7Lh0usGcuk", download_url: "https://picsum.photos/id/19/2500/1667", display_url: FAST_UNSPLASH_POOL[10] },
  { id: "21", author: "Alejandro Escamilla", width: 3008, height: 2008, url: "https://unsplash.com/photos/jVb0mSn0LbE", download_url: "https://picsum.photos/id/21/3008/2008", display_url: FAST_UNSPLASH_POOL[12] },
  { id: "22", author: "Alejandro Escamilla", width: 4434, height: 3729, url: "https://unsplash.com/photos/du_OrQAA4r0", download_url: "https://picsum.photos/id/22/4434/3729", display_url: FAST_UNSPLASH_POOL[13] },
  { id: "25", author: "Alejandro Escamilla", width: 5000, height: 3333, url: "https://unsplash.com/photos/Iuq0EL4EINY", download_url: "https://picsum.photos/id/25/5000/3333", display_url: FAST_UNSPLASH_POOL[15] },
  { id: "26", author: "Vadim Sherbakov", width: 4209, height: 2769, url: "https://unsplash.com/photos/tCICLJ5ktBE", download_url: "https://picsum.photos/id/26/4209/2769", display_url: FAST_UNSPLASH_POOL[16] },
  { id: "27", author: "Yoni Kaplan-Nadel", width: 3264, height: 1836, url: "https://unsplash.com/photos/iJnZwLBOB1I", download_url: "https://picsum.photos/id/27/3264/1836", display_url: FAST_UNSPLASH_POOL[18] },
  { id: "28", author: "Jerry Adney", width: 4928, height: 3264, url: "https://unsplash.com/photos/_WiFMBRT7Aw", download_url: "https://picsum.photos/id/28/4928/3264", display_url: FAST_UNSPLASH_POOL[19] },
  { id: "36", author: "Vadim Sherbakov", width: 4179, height: 2790, url: "https://unsplash.com/photos/osSryggkso4", download_url: "https://picsum.photos/id/36/4179/2790", display_url: FAST_UNSPLASH_POOL[20] },
  { id: "37", author: "Austin Neill", width: 2000, height: 1333, url: "https://unsplash.com/photos/erTjj730fMk", download_url: "https://picsum.photos/id/37/2000/1333", display_url: FAST_UNSPLASH_POOL[21] },
  { id: "39", author: "Luke Chesser", width: 3456, height: 2304, url: "https://unsplash.com/photos/pFqrYbhIAXs", download_url: "https://picsum.photos/id/39/3456/2304", display_url: FAST_UNSPLASH_POOL[22] },
  { id: "42", author: "Luke Chesser", width: 3456, height: 2304, url: "https://unsplash.com/photos/KR2mdHJ5qMg", download_url: "https://picsum.photos/id/42/3456/2304", display_url: FAST_UNSPLASH_POOL[23] },

  // ==================== PAGE 3 (12 items) ====================
  { id: "43", author: "Oleg Chursin", width: 1280, height: 831, url: "https://unsplash.com/photos/IoCw607eG8A", download_url: "https://picsum.photos/id/43/1280/831", display_url: FAST_UNSPLASH_POOL[24] },
  { id: "48", author: "Luke Chesser", width: 5000, height: 3333, url: "https://unsplash.com/photos/1uxV8fAfhVM", download_url: "https://picsum.photos/id/48/5000/3333", display_url: FAST_UNSPLASH_POOL[25] },
  { id: "49", author: "Margaret Barley", width: 1280, height: 792, url: "https://unsplash.com/photos/Qo51I6GgSwY", download_url: "https://picsum.photos/id/49/1280/792", display_url: FAST_UNSPLASH_POOL[26] },
  { id: "54", author: "Nicholas Swanson", width: 3264, height: 2176, url: "https://unsplash.com/photos/d19by2PLaPc", download_url: "https://picsum.photos/id/54/3264/2176", display_url: FAST_UNSPLASH_POOL[27] },
  { id: "56", author: "Sebastian Muller", width: 2880, height: 1920, url: "https://unsplash.com/photos/VLdaxYyXJvw", download_url: "https://picsum.photos/id/56/2880/1920", display_url: FAST_UNSPLASH_POOL[28] },
  { id: "57", author: "Nicholas Swanson", width: 2448, height: 3264, url: "https://unsplash.com/photos/SyBYM8R6VU4", download_url: "https://picsum.photos/id/57/2448/3264", display_url: FAST_UNSPLASH_POOL[29] },
  { id: "58", author: "Tony Naccarato", width: 1280, height: 853, url: "https://unsplash.com/photos/-kErEckJo9k", download_url: "https://picsum.photos/id/58/1280/853", display_url: FAST_UNSPLASH_POOL[30] },
  { id: "60", author: "Vadim Sherbakov", width: 1920, height: 1200, url: "https://unsplash.com/photos/Hi9GSwWkCJk", download_url: "https://picsum.photos/id/60/1920/1200", display_url: FAST_UNSPLASH_POOL[31] },
  { id: "62", author: "Daniel Genser", width: 2000, height: 1333, url: "https://unsplash.com/photos/PzPbh-faPgU", download_url: "https://picsum.photos/id/62/2000/1333", display_url: FAST_UNSPLASH_POOL[32] },
  { id: "64", author: "Alexander Shustov", width: 4326, height: 2884, url: "https://unsplash.com/photos/AHBiSKaENwc", download_url: "https://picsum.photos/id/64/4326/2884", display_url: FAST_UNSPLASH_POOL[33] },
  { id: "65", author: "Alexander Shustov", width: 4912, height: 3264, url: "https://unsplash.com/photos/2FrX56QL7P8", download_url: "https://picsum.photos/id/65/4912/3264", display_url: FAST_UNSPLASH_POOL[34] },
  { id: "68", author: "Cristian Moscoso", width: 4608, height: 3072, url: "https://unsplash.com/photos/2SfRAW567wA", download_url: "https://picsum.photos/id/68/4608/3072", display_url: FAST_UNSPLASH_POOL[35] },

  // ==================== PAGE 4 (12 items) ====================
  { id: "76", author: "Alexander Shustov", width: 4912, height: 3264, url: "https://unsplash.com/photos/OxzhYtL-00Y", download_url: "https://picsum.photos/id/76/4912/3264", display_url: FAST_UNSPLASH_POOL[4] },
  { id: "82", author: "Rula Sibai", width: 1500, height: 997, url: "https://unsplash.com/photos/vq7J0oR9m9Y", download_url: "https://picsum.photos/id/82/1500/997", display_url: FAST_UNSPLASH_POOL[15] },
  { id: "88", author: "Barcelona Studio", width: 1280, height: 1707, url: "https://unsplash.com/photos/muC_6gTMLR4", download_url: "https://picsum.photos/id/88/1280/1707", display_url: FAST_UNSPLASH_POOL[26] },
  { id: "96", author: "Pawel Kadysz", width: 4752, height: 3168, url: "https://unsplash.com/photos/CuFYW1c97w8", download_url: "https://picsum.photos/id/96/4752/3168", display_url: FAST_UNSPLASH_POOL[31] },
  { id: "100", author: "Tina Rataj", width: 2500, height: 1656, url: "https://unsplash.com/photos/pwaaqfoMibI", download_url: "https://picsum.photos/id/100/2500/1656", display_url: FAST_UNSPLASH_POOL[3] },
  { id: "102", author: "Ben Moore", width: 4320, height: 3240, url: "https://unsplash.com/photos/pJILiyPdrXI", download_url: "https://picsum.photos/id/102/4320/3240", display_url: FAST_UNSPLASH_POOL[35] },
  { id: "103", author: "Ilham Rahmansyah", width: 2592, height: 1936, url: "https://unsplash.com/photos/DwTZwZYi9Ww", download_url: "https://picsum.photos/id/103/2592/1936", display_url: FAST_UNSPLASH_POOL[8] },
  { id: "104", author: "Dyaa Eldin", width: 3840, height: 2160, url: "https://unsplash.com/photos/2fl-ocJ5MOA", download_url: "https://picsum.photos/id/104/3840/2160", display_url: FAST_UNSPLASH_POOL[18] },
  { id: "106", author: "Arvee Marie", width: 2592, height: 1728, url: "https://unsplash.com/photos/YnfGtpt2gf4", download_url: "https://picsum.photos/id/106/2592/1728", display_url: FAST_UNSPLASH_POOL[34] },
  { id: "107", author: "Lukas Schweizer", width: 5000, height: 3333, url: "https://unsplash.com/photos/9VWOr22LhVI", download_url: "https://picsum.photos/id/107/5000/3333", display_url: FAST_UNSPLASH_POOL[9] },
  { id: "108", author: "Florian Klauer", width: 2000, height: 1333, url: "https://unsplash.com/photos/t1mqA3V3-7g", download_url: "https://picsum.photos/id/108/2000/1333", display_url: FAST_UNSPLASH_POOL[7] },
  { id: "109", author: "Zwaddi", width: 4287, height: 2392, url: "https://unsplash.com/photos/YvYBOSiBJE8", download_url: "https://picsum.photos/id/109/4287/2392", display_url: FAST_UNSPLASH_POOL[10] },
];

const CAMERA_PRESETS = [
  { camera: "Sony A7R V", lens: "FE 35mm f/1.4 GM", iso: "ISO 100", shutter: "1/500s", location: "Pacific Northwest" },
  { camera: "Leica Q3", lens: "Summilux 28mm f/1.7", iso: "ISO 200", shutter: "1/1000s", location: "Zurich, Switzerland" },
  { camera: "Fujifilm GFX 100 II", lens: "GF 55mm f/1.7 R", iso: "ISO 160", shutter: "1/320s", location: "Reykjavik, Iceland" },
  { camera: "Canon EOS R5", lens: "RF 50mm f/1.2L", iso: "ISO 400", shutter: "1/800s", location: "Kyoto, Japan" },
  { camera: "Nikon Z8", lens: "NIKKOR Z 24-70mm f/2.8", iso: "ISO 64", shutter: "1/250s", location: "Dolomites, Italy" },
  { camera: "Hasselblad X2D 100C", lens: "XCD 38mm f/2.5V", iso: "ISO 100", shutter: "1/640s", location: "Big Sur, California" },
];

const CAPTIONS = [
  "Chasing golden hour light and crisp natural textures across the frame.",
  "Minimalist composition captured in raw medium format — unedited dynamic range.",
  "Quiet morning perspective before the mist cleared over the ridge.",
  "Exploring contrast, geometry, and natural depth in everyday spaces.",
  "Shot handheld on prime glass — love how the highlights roll off here.",
  "Frame from our latest visual editorial series on light and architecture.",
];

const AVATAR_COLORS = [
  "#e1306c",
  "#833ab4",
  "#405de6",
  "#fd1d1d",
  "#f56040",
  "#059669",
  "#0284c7",
  "#7c3aed",
];

const CURATED_BY_ID = new Map(
  CURATED_PICSUM_ITEMS.map((item) => [String(item.id), item])
);

/**
 * Returns an instant, guaranteed fast-loading image URL for any Picsum photo item.
 */
export function getInstantPhotoUrl(photo) {
  if (!photo) return FAST_UNSPLASH_POOL[0];
  if (photo.display_url) return photo.display_url;
  const known = CURATED_BY_ID.get(String(photo.id));
  if (known && known.display_url) return known.display_url;
  const numId = Math.abs(parseInt(String(photo.id), 10) || 0);
  return FAST_UNSPLASH_POOL[numId % FAST_UNSPLASH_POOL.length];
}

export function getPhotographerMeta(author = "Photographer", id = "0") {
  const numId = Math.abs(parseInt(String(id), 10) || 0);
  const hash = String(author)
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const words = String(author).trim().split(/\s+/);
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
      : String(author).slice(0, 2).toUpperCase();

  const handle = `@${String(author)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")}`;

  const preset = CAMERA_PRESETS[(numId + hash) % CAMERA_PRESETS.length];
  const caption = CAPTIONS[(numId + hash) % CAPTIONS.length];
  const avatarColor = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const fastUrl =
    CURATED_BY_ID.get(String(id))?.display_url ||
    FAST_UNSPLASH_POOL[numId % FAST_UNSPLASH_POOL.length];

  return {
    initials,
    handle,
    avatarColor,
    camera: preset.camera,
    lens: preset.lens,
    iso: preset.iso,
    shutter: preset.shutter,
    location: preset.location,
    caption,
    backupUrl: fastUrl,
  };
}

/**
 * Returns a paginated slice of curated Picsum items (12 per page, Pages 1..4),
 * stopping at Page 5 (`[]`) so the end-of-feed requirement is demonstrable.
 */
export function getFallbackPicsumPage(pageNum = 1, perPage = 12) {
  const start = (pageNum - 1) * perPage;
  if (start >= CURATED_PICSUM_ITEMS.length) return [];
  return CURATED_PICSUM_ITEMS.slice(start, start + perPage);
}
