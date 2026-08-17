const crypto = require('crypto');

// CivicFix AI Engine — deterministic, rule-based issue classification.
// Simulates an AI vision + NLP pipeline without calling an external model:
// text keywords drive detection when present, otherwise a stable hash of the
// image bytes drives a deterministic pick so the same photo always yields
// the same "analysis" (mirrors how a real vision model would be consistent).

const CATALOG = [
  {
    key: 'pothole',
    label: 'Pothole',
    category: 'Road Damage',
    departmentCode: 'ROAD',
    keywords: ['pothole', 'pot hole', 'road hole', 'crater'],
    baseSeverity: 'Medium',
    selfFixEligible: false,
    dangerAlways: false,
    reason: 'Road excavation and traffic hazards require municipal road crews and equipment.',
  },
  {
    key: 'damaged_road',
    label: 'Damaged Road',
    category: 'Road Damage',
    departmentCode: 'ROAD',
    keywords: ['damaged road', 'road crack', 'broken road', 'road damage', 'cracked road'],
    baseSeverity: 'Medium',
    selfFixEligible: false,
    dangerAlways: false,
    reason: 'Structural road repair requires specialized municipal equipment.',
  },
  {
    key: 'damaged_sidewalk',
    label: 'Damaged Sidewalk',
    category: 'Road Damage',
    departmentCode: 'ROAD',
    keywords: ['sidewalk', 'pavement crack', 'footpath', 'walkway damage'],
    baseSeverity: 'Low',
    selfFixEligible: false,
    dangerAlways: false,
    reason: 'Concrete/paving repair requires municipal materials and tools.',
  },
  {
    key: 'water_leakage',
    label: 'Water Leakage',
    category: 'Water Supply',
    departmentCode: 'WATER',
    keywords: ['water leak', 'leakage', 'pipe leak', 'water pipe', 'leaking tap', 'faucet'],
    baseSeverity: 'Medium',
    selfFixEligible: true,
    dangerAlways: false,
    selfFixSteps: [
      'Turn off the nearest accessible water supply valve to stop further loss.',
      'Inspect the visible connection or fitting for the source of the leak.',
      'If the leak is from a loose, easily reachable fitting, gently hand-tighten it or apply plumber\'s tape.',
      'Check whether the leakage has stopped after a few minutes.',
      'If the leak continues, is underground, or comes from a main pipeline, stop and contact the Water Department.',
    ],
  },
  {
    key: 'broken_streetlight',
    label: 'Broken Streetlight',
    category: 'Electrical Infrastructure',
    departmentCode: 'ELECTRICAL',
    keywords: ['streetlight', 'street light', 'lamp post', 'light pole not working'],
    baseSeverity: 'Medium',
    selfFixEligible: false,
    dangerAlways: true,
    reason: 'Electrical infrastructure must only be handled by trained, authorized personnel.',
  },
  {
    key: 'damaged_electrical',
    label: 'Damaged Electrical Infrastructure',
    category: 'Electrical Infrastructure',
    departmentCode: 'ELECTRICAL',
    keywords: ['exposed wire', 'live wire', 'electric pole', 'transformer', 'electrical hazard', 'sparking', 'spark', 'cable hanging', 'power line'],
    baseSeverity: 'High',
    selfFixEligible: false,
    dangerAlways: true,
    reason: 'Exposed or damaged electrical infrastructure is a severe shock/fire hazard — do not approach.',
  },
  {
    key: 'garbage',
    label: 'Garbage Accumulation',
    category: 'Sanitation',
    departmentCode: 'SANITATION',
    keywords: ['garbage', 'trash', 'litter', 'waste pile', 'dump', 'rubbish'],
    baseSeverity: 'Low',
    selfFixEligible: true,
    dangerAlways: false,
    selfFixSteps: [
      'If safe, collect loose surface litter and dispose of it in the nearest bin.',
      'Do not touch hazardous, medical, or unknown chemical waste — report it instead.',
      'Avoid handling large or heavy dumped items yourself.',
      'Report the location so a Sanitation crew can schedule proper collection.',
    ],
  },
  {
    key: 'drainage',
    label: 'Drainage / Waterlogging',
    category: 'Drainage',
    departmentCode: 'DRAINAGE',
    keywords: ['drainage', 'waterlogging', 'water logging', 'flooded', 'blocked drain', 'clogged drain', 'stagnant water'],
    baseSeverity: 'Medium',
    selfFixEligible: true,
    dangerAlways: false,
    selfFixSteps: [
      'Do not enter standing floodwater — it may hide open manholes or be electrically live.',
      'If a surface drain grate is visibly blocked by leaves or debris, clear it from a safe distance using a stick or rake.',
      'Never open or reach into a covered manhole or underground drain.',
      'If waterlogging persists or the water is deep, contact the Drainage Department.',
    ],
  },
  {
    key: 'fallen_tree',
    label: 'Fallen Tree',
    category: 'Environmental Hazard',
    departmentCode: 'PARKS',
    keywords: ['fallen tree', 'tree branch', 'tree fell', 'uprooted tree', 'broken branch'],
    baseSeverity: 'Medium',
    selfFixEligible: true,
    dangerAlways: false,
    selfFixSteps: [
      'Only proceed if the branch is small, light, and clearly not tangled with any power lines.',
      'Move small debris aside so it no longer blocks the path, if you can do so without strain.',
      'Do not attempt to cut, lift, or move large branches or tree trunks.',
      'Report the issue so a crew can safely remove larger debris.',
    ],
  },
  {
    key: 'stray_animal',
    label: 'Stray Animal Issue',
    category: 'Public Safety',
    departmentCode: 'ANIMAL',
    keywords: ['stray dog', 'stray animal', 'stray cattle', 'animal bite', 'aggressive dog', 'stray cow'],
    baseSeverity: 'Medium',
    selfFixEligible: false,
    dangerAlways: true,
    reason: 'Animal handling carries bite/injury risk and requires trained Animal Control staff.',
  },
  {
    key: 'public_toilet',
    label: 'Public Toilet Problem',
    category: 'Public Infrastructure',
    departmentCode: 'SANITATION',
    keywords: ['public toilet', 'restroom', 'washroom', 'sanitation facility'],
    baseSeverity: 'Low',
    selfFixEligible: false,
    dangerAlways: false,
    reason: 'Facility plumbing and hygiene fixtures require municipal sanitation staff.',
  },
];

const SEVERITY_RANK = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const RANK_SEVERITY = ['', 'Low', 'Medium', 'High', 'Critical'];

const CRITICAL_KEYWORDS = [
  'collapse', 'collapsed', 'fire', 'explosion', 'sinkhole', 'live wire', 'exposed wire',
  'electrocut', 'gas leak', 'gas smell', 'structural crack', 'building damage', 'burst pipe',
];
const HIGH_KEYWORDS = ['large', 'deep', 'huge', 'severe', 'flooding', 'overflowing', 'burst', 'heavy', 'major', 'blocked'];
const LOW_KEYWORDS = ['small', 'minor', 'tiny', 'slight', 'little'];

const GENERIC_DANGER_KEYWORDS = [
  'wire', 'electric', 'shock', 'cable', 'high voltage', 'transformer', 'fire', 'collapse',
  'structural', 'sinkhole', 'gas leak', 'gas smell', 'traffic hazard', 'highway',
];

function hashSeed(input) {
  const hash = crypto.createHash('md5').update(input).digest('hex');
  return parseInt(hash.substring(0, 8), 16);
}

function detectFromText(text) {
  for (const entry of CATALOG) {
    if (entry.keywords.some((kw) => text.includes(kw))) return entry;
  }
  return null;
}

function detectFromHash(seed) {
  const index = seed % CATALOG.length;
  return CATALOG[index];
}

function detectSeverityFromText(text, seed) {
  if (CRITICAL_KEYWORDS.some((kw) => text.includes(kw))) return 'Critical';
  if (HIGH_KEYWORDS.some((kw) => text.includes(kw))) return 'High';
  if (LOW_KEYWORDS.some((kw) => text.includes(kw))) return 'Low';
  return null;
}

/**
 * Analyze an uploaded civic issue photo + optional description.
 * @param {Object} params
 * @param {string} params.description
 * @param {Buffer} params.buffer - raw image bytes (used for deterministic fallback detection)
 * @returns {Object} AI analysis result
 */
function analyzeIssue({ description = '', buffer = null }) {
  const text = (description || '').toLowerCase();
  const seedSource = buffer && buffer.length ? buffer : Buffer.from(description || 'civicfix-default');
  const seed = hashSeed(seedSource);

  const entry = detectFromText(text) || detectFromHash(seed);

  // Severity: take the higher of the catalog baseline and any text signal
  const textSeverity = detectSeverityFromText(text, seed);
  const baseRank = SEVERITY_RANK[entry.baseSeverity];
  const textRank = textSeverity ? SEVERITY_RANK[textSeverity] : 0;
  // small deterministic variance so identical-category reports aren't all clones
  const varianceBump = seed % 5 === 0 ? 1 : 0;
  const finalRank = Math.min(4, Math.max(baseRank, textRank, entry.dangerAlways ? Math.max(baseRank, 3) : 0) + (textRank ? 0 : varianceBump));
  const severity = RANK_SEVERITY[Math.max(1, finalRank)];

  // Danger / self-fix eligibility
  const genericDanger = GENERIC_DANGER_KEYWORDS.some((kw) => text.includes(kw));
  const isDangerous = entry.dangerAlways || genericDanger || severity === 'Critical';

  const isSafeSelfFix = !isDangerous && entry.selfFixEligible && SEVERITY_RANK[severity] <= 2;

  const dangerReason = isDangerous
    ? entry.reason || 'This issue involves a potential safety hazard and should be handled by trained municipal staff.'
    : !entry.selfFixEligible
    ? entry.reason || 'This type of repair requires municipal tools/materials and trained staff.'
    : null;

  const confidence = 78 + (seed % 20); // 78-97

  return {
    detectedIssue: entry.label,
    issueType: entry.key,
    category: entry.category,
    departmentCode: entry.departmentCode,
    severity,
    priority: severity,
    confidence,
    isSafeSelfFix,
    selfFixSteps: isSafeSelfFix ? entry.selfFixSteps : [],
    dangerReason: isSafeSelfFix ? null : dangerReason,
  };
}

/**
 * Very small, self-contained duplicate-signal helper: given a category and
 * description, produce a normalized fingerprint (used alongside geo-proximity
 * for duplicate complaint detection in the controller).
 */
function fingerprint(category, description) {
  return crypto
    .createHash('md5')
    .update(`${category}|${(description || '').toLowerCase().trim()}`)
    .digest('hex');
}

module.exports = { analyzeIssue, fingerprint, CATALOG };
