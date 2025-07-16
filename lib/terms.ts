// lib/terms.ts
// Minimal Albanian construction dictionary used to "prime" the model.
// Add/extend freely. Keep definitions SHORT (the model will expand).
// NOTE: All strings are plain UTF-8; no need to escape ë/ç in TS files.

export type TermDef = {
  term: string;          // Display (Albanian)
  en?: string;           // English technical label
  short: string;         // 1-2 sentence plain-language definition
  safety?: string;       // Optional safety tip
  aka?: string[];        // Synonyms / variant spellings users might type
};

type Dict = Record<string, TermDef>; // keyed by slug

export const TERMS: Dict = {
  // lacquer / clear coat
  llak: {
    term: "llak",
    en: "lacquer / clear protective finish",
    short:
      "Shtresë mbrojtëse e hollë që aplikohet mbi dru (ose sipërfaqe të tjera) për shkëlqim dhe mbrojtje nga lagështia / gërvishtjet.",
    safety: "Puno në vend të ajrosur mirë; avujt mund të jenë toksikë.",
    aka: ["llaku", "lak", "lakuri"], // add slang as needed
  },

  // epoxy / epoksit
  epoksi: {
    term: "epoksi",
    en: "epoxy resin / epoxy adhesive",
    short:
      "Ngjitës ose shtresë me dy përbërës (rrëshirë + ngurtësues) që forcohet në material shumë të fortë dhe rezistent kimikisht.",
    safety: "Përdor doreza; disa komponime irrituese para ngurtësimit.",
    aka: ["epoksit", "epoxy", "epox", "rrëshirë epoksi"],
  },

  // mesh used in plaster / concrete
  rrjeta: {
    term: "rrjetë përforcuese",
    en: "reinforcing mesh / wire mesh",
    short:
      "Rrjetë metalike ose fibër që vendoset në suva, stuko ose beton të hollë për të parandaluar çarje dhe për të shpërndarë ngarkesën.",
    safety: "Prerjet mund të jenë të mprehta; përdor doreza mbrojtëse.",
    aka: ["rrjeta", "mrezha", "mesh", "rrjet metalik"],
  },

  // tile grout / joint gap
  fuga: {
    term: "fugë",
    en: "grout joint / gap between tiles",
    short:
      "Hapësira ndërmjet pllakave që mbushet me material fugues për stabilitet, pamje dhe për të mos hyrë papastërti apo ujë.",
    safety: "Mbaj gropat të pastra para fuguimit për ngjitje të mirë.",
    aka: ["fuga", "fuge", "fugimi", "fugues"],
  },

  // plastering
  suva: {
    term: "suva / suvatim",
    en: "plaster / render",
    short:
      "Shtresë llaçi e hollë që aplikohet në mure (shpesh tulla ose blloqe) për t'i rrafshuar dhe përgatitur për bojë ose përfundim tjetër.",
    aka: ["suvatim", "suvaje", "suvë"],
  },

  // concrete (basic)
  beton: {
    term: "beton",
    en: "concrete",
    short:
      "Përzierje çimentoje, rëre, zhavorri dhe uji që ngurtësohet në material strukturor shumë të fortë.",
    aka: ["betoni"],
  },
};

// Build a quick lookup table from all names + synonyms -> slug
const LOOKUP: Record<string, string> = {};
for (const [slug, def] of Object.entries(TERMS)) {
  LOOKUP[slug.toLowerCase()] = slug;
  LOOKUP[def.term.toLowerCase()] = slug;
  def.aka?.forEach((alt) => {
    LOOKUP[alt.toLowerCase()] = slug;
  });
}

// Normalize Albanian chars (strip diacritics to widen matches)
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ë/g, "e")
    .replace(/ç/g, "c");
}
const LOOKUP_NORM: Record<string, string> = {};
for (const key of Object.keys(LOOKUP)) {
  LOOKUP_NORM[normalize(key)] = LOOKUP[key];
}

/**
 * Return matching term slugs found in free text, in source order, deduped.
 */
export function matchTerms(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  const words = text.split(/[\s,.;:!?()'"-]+/).filter(Boolean);
  for (const w of words) {
    const wl = w.toLowerCase();
    let slug = LOOKUP[wl];
    if (!slug) slug = LOOKUP_NORM[normalize(wl)];
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      found.push(slug);
    }
  }
  return found;
}

/**
 * Build context notes (short bullet list) to prepend to model prompt.
 */
export function buildContext(slugs: string[]): string {
  if (!slugs.length) return "";
  const lines: string[] = [];
  for (const s of slugs) {
    const d = TERMS[s];
    if (!d) continue;
    const name = d.en ? `${d.term} (${d.en})` : d.term;
    lines.push(`• ${name}: ${d.short}`);
    if (d.safety) lines.push(`  Siguria: ${d.safety}`);
  }
  return lines.join("\n");
}
