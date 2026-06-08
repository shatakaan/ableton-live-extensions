import {
  initialize,
  type ActivationContext,
  CuePoint,
} from "@ableton-extensions/sdk";
import * as fs from "fs/promises";
import * as path from "path";
// Verbose logger — wraps console.log with timestamp for Extension Host output
function flog(msg: string): void {
  console.log(msg);
}
// Types
// ═══════════════════════════════════════════════════════════

interface Section {
  beat: number;
  name: string;
}

interface Template {
  key: string;
  label: string;
  bpm: number;
  bars: number;
  sections: Section[];
}

interface Family {
  id: string;
  label: string;
  templates: Template[];
}

// ═══════════════════════════════════════════════════════════
// Genre Families — beat positions from section bar counts
// ═══════════════════════════════════════════════════════════

const FAMILIES: Family[] = [
  {
    id: "edm",
    label: "EDM / Dance",
    templates: [
      {
        key: "house", label: "House / Tech House", bpm: 125, bars: 112,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 64, name: "Verse" },
          { beat: 128, name: "Build" }, { beat: 160, name: "Drop" },
          { beat: 224, name: "Breakdown" }, { beat: 288, name: "Build 2" },
          { beat: 320, name: "Drop 2" }, { beat: 384, name: "Outro" },
        ],
      },
      {
        key: "techno", label: "Techno", bpm: 130, bars: 192,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 128, name: "Drop" },
          { beat: 256, name: "Break" }, { beat: 320, name: "Drop 2" },
          { beat: 448, name: "Break 2" }, { beat: 512, name: "Drop 3" },
          { beat: 640, name: "Outro" },
        ],
      },
      {
        key: "dubstep", label: "Dubstep / Brostep", bpm: 140, bars: 72,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 32, name: "Build" },
          { beat: 64, name: "Drop" }, { beat: 128, name: "Breakdown" },
          { beat: 160, name: "Build 2" }, { beat: 192, name: "Drop 2" },
          { beat: 256, name: "Outro" },
        ],
      },
      {
        key: "dnb", label: "Drum & Bass", bpm: 174, bars: 112,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 64, name: "Drop" },
          { beat: 192, name: "Breakdown" }, { beat: 256, name: "Drop 2" },
          { beat: 384, name: "Outro" },
        ],
      },
      {
        key: "trance", label: "Trance", bpm: 138, bars: 208,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 128, name: "Breakdown" },
          { beat: 192, name: "Build" }, { beat: 256, name: "Drop" },
          { beat: 384, name: "Main Break" }, { beat: 512, name: "Build 2" },
          { beat: 576, name: "Drop 2" }, { beat: 704, name: "Outro" },
        ],
      },
      {
        key: "futureBass", label: "Future Bass", bpm: 145, bars: 88,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 32, name: "Verse" },
          { beat: 96, name: "Build" }, { beat: 128, name: "Drop" },
          { beat: 192, name: "Verse 2" }, { beat: 224, name: "Build 2" },
          { beat: 256, name: "Drop 2" }, { beat: 320, name: "Outro" },
        ],
      },
      {
        key: "trap", label: "Trap / Hybrid", bpm: 140, bars: 80,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 32, name: "Build" },
          { beat: 64, name: "Drop" }, { beat: 128, name: "Breakdown" },
          { beat: 192, name: "Build 2" }, { beat: 224, name: "Drop 2" },
          { beat: 288, name: "Outro" },
        ],
      },
      {
        key: "hardstyle", label: "Hardstyle", bpm: 150, bars: 96,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 64, name: "Build" },
          { beat: 96, name: "Drop" }, { beat: 160, name: "Break" },
          { beat: 224, name: "Build 2" }, { beat: 256, name: "Drop 2" },
          { beat: 320, name: "Outro" },
        ],
      },
    ],
  },
  {
    id: "hiphop",
    label: "Hip-Hop / Beats",
    templates: [
      {
        key: "boombap", label: "Boom Bap", bpm: 90, bars: 56,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 16, name: "Verse" },
          { beat: 80, name: "Chorus" }, { beat: 112, name: "Verse 2" },
          { beat: 176, name: "Chorus" }, { beat: 208, name: "Outro" },
        ],
      },
      {
        key: "trapbeat", label: "Trap Beat", bpm: 140, bars: 68,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 16, name: "Verse" },
          { beat: 80, name: "Chorus" }, { beat: 112, name: "Verse 2" },
          { beat: 176, name: "Chorus" }, { beat: 208, name: "Bridge" },
          { beat: 224, name: "Chorus" }, { beat: 256, name: "Outro" },
        ],
      },
      {
        key: "drill", label: "Drill", bpm: 143, bars: 56,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 16, name: "Verse" },
          { beat: 80, name: "Chorus" }, { beat: 112, name: "Verse 2" },
          { beat: 176, name: "Chorus" }, { beat: 208, name: "Outro" },
        ],
      },
      {
        key: "lofi", label: "Lo-fi Hip-Hop", bpm: 80, bars: 40,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 16, name: "Verse" },
          { beat: 48, name: "Chorus" }, { beat: 80, name: "Verse 2" },
          { beat: 112, name: "Chorus" }, { beat: 144, name: "Outro" },
        ],
      },
      {
        key: "reggaeton", label: "Reggaeton", bpm: 95, bars: 80,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 32, name: "Verso" },
          { beat: 96, name: "Coro" }, { beat: 128, name: "Verso 2" },
          { beat: 192, name: "Coro" }, { beat: 224, name: "Puente" },
          { beat: 256, name: "Coro" }, { beat: 288, name: "Outro" },
        ],
      },
    ],
  },
  {
    id: "poprock",
    label: "Pop / Rock",
    templates: [
      {
        key: "pop", label: "Pop Standard", bpm: 120, bars: 64,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 16, name: "Verse" },
          { beat: 48, name: "Pre-Chorus" }, { beat: 64, name: "Chorus" },
          { beat: 96, name: "Verse 2" }, { beat: 128, name: "Pre-Chorus" },
          { beat: 144, name: "Chorus" }, { beat: 176, name: "Bridge" },
          { beat: 208, name: "Chorus" }, { beat: 240, name: "Outro" },
        ],
      },
      {
        key: "rock", label: "Rock", bpm: 130, bars: 56,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 16, name: "Verse" },
          { beat: 48, name: "Chorus" }, { beat: 80, name: "Verse 2" },
          { beat: 112, name: "Chorus" }, { beat: 144, name: "Solo" },
          { beat: 176, name: "Chorus" }, { beat: 208, name: "Outro" },
        ],
      },
      {
        key: "punk", label: "Punk", bpm: 180, bars: 36,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 8, name: "Verse" },
          { beat: 40, name: "Chorus" }, { beat: 72, name: "Verse 2" },
          { beat: 104, name: "Chorus" }, { beat: 136, name: "Outro" },
        ],
      },
      {
        key: "metal", label: "Metal", bpm: 160, bars: 72,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 16, name: "Verse" },
          { beat: 48, name: "Pre-Chorus" }, { beat: 64, name: "Chorus" },
          { beat: 96, name: "Verse 2" }, { beat: 128, name: "Pre-Chorus" },
          { beat: 144, name: "Chorus" }, { beat: 176, name: "Solo" },
          { beat: 240, name: "Chorus" }, { beat: 272, name: "Outro" },
        ],
      },
      {
        key: "indie", label: "Indie", bpm: 120, bars: 56,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 16, name: "Verse" },
          { beat: 48, name: "Chorus" }, { beat: 80, name: "Verse 2" },
          { beat: 112, name: "Chorus" }, { beat: 144, name: "Bridge" },
          { beat: 176, name: "Chorus" }, { beat: 208, name: "Outro" },
        ],
      },
      {
        key: "ballad", label: "Ballad", bpm: 72, bars: 64,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 16, name: "Verse" },
          { beat: 48, name: "Verse 2" }, { beat: 80, name: "Chorus" },
          { beat: 112, name: "Verse 3" }, { beat: 144, name: "Chorus" },
          { beat: 176, name: "Bridge" }, { beat: 208, name: "Chorus" },
          { beat: 240, name: "Outro" },
        ],
      },
    ],
  },
  {
    id: "ambient",
    label: "Ambient / Cinematic",
    templates: [
      {
        key: "ambient", label: "Ambient Drone", bpm: 60, bars: 128,
        sections: [
          { beat: 0, name: "Texture A" }, { beat: 128, name: "Texture B" },
          { beat: 256, name: "Texture A" }, { beat: 384, name: "Fade Out" },
        ],
      },
      {
        key: "cinematic", label: "Cinematic", bpm: 100, bars: 88,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 32, name: "Theme A" },
          { beat: 96, name: "Theme B" }, { beat: 160, name: "Theme A" },
          { beat: 224, name: "Climax" }, { beat: 288, name: "Outro" },
        ],
      },
      {
        key: "triphop", label: "Trip-Hop", bpm: 85, bars: 64,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 32, name: "Verse" },
          { beat: 96, name: "Chorus" }, { beat: 128, name: "Verse 2" },
          { beat: 192, name: "Chorus" }, { beat: 224, name: "Outro" },
        ],
      },
      {
        key: "downtempo", label: "Downtempo", bpm: 100, bars: 64,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 32, name: "Section A" },
          { beat: 96, name: "Section B" }, { beat: 160, name: "Section A" },
          { beat: 224, name: "Outro" },
        ],
      },
    ],
  },
  {
    id: "funk",
    label: "Funk / Soul / Disco",
    templates: [
      {
        key: "funk", label: "Funk", bpm: 110, bars: 56,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 16, name: "Verse" },
          { beat: 48, name: "Chorus" }, { beat: 80, name: "Verse 2" },
          { beat: 112, name: "Chorus" }, { beat: 144, name: "Bridge" },
          { beat: 176, name: "Chorus" }, { beat: 208, name: "Outro" },
        ],
      },
      {
        key: "disco", label: "Disco", bpm: 120, bars: 80,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 32, name: "Verse" },
          { beat: 96, name: "Chorus" }, { beat: 128, name: "Verse 2" },
          { beat: 192, name: "Chorus" }, { beat: 224, name: "Bridge" },
          { beat: 256, name: "Chorus" }, { beat: 288, name: "Outro" },
        ],
      },
      {
        key: "rnb", label: "R&B", bpm: 85, bars: 52,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 16, name: "Verse" },
          { beat: 48, name: "Chorus" }, { beat: 80, name: "Verse 2" },
          { beat: 112, name: "Chorus" }, { beat: 144, name: "Bridge" },
          { beat: 160, name: "Chorus" }, { beat: 192, name: "Outro" },
        ],
      },
      {
        key: "neosoul", label: "Neo-Soul", bpm: 88, bars: 48,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 16, name: "Verse" },
          { beat: 48, name: "Chorus" }, { beat: 80, name: "Verse 2" },
          { beat: 112, name: "Chorus" }, { beat: 144, name: "Bridge" },
          { beat: 176, name: "Outro" },
        ],
      },
      {
        key: "motown", label: "Motown", bpm: 120, bars: 56,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 16, name: "Verse" },
          { beat: 48, name: "Chorus" }, { beat: 80, name: "Verse 2" },
          { beat: 112, name: "Chorus" }, { beat: 144, name: "Bridge" },
          { beat: 176, name: "Chorus" }, { beat: 208, name: "Outro" },
        ],
      },
    ],
  },
  {
    id: "breaks",
    label: "Breaks / Bass",
    templates: [
      {
        key: "breakbeat", label: "Breakbeat", bpm: 135, bars: 56,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 32, name: "Drop" },
          { beat: 96, name: "Break" }, { beat: 128, name: "Drop 2" },
          { beat: 192, name: "Outro" },
        ],
      },
      {
        key: "ukgarage", label: "UK Garage", bpm: 132, bars: 144,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 64, name: "Breakdown" },
          { beat: 128, name: "Build" }, { beat: 160, name: "Drop" },
          { beat: 288, name: "Breakdown 2" }, { beat: 352, name: "Build" },
          { beat: 384, name: "Drop 2" }, { beat: 512, name: "Outro" },
        ],
      },
      {
        key: "jungle", label: "Jungle", bpm: 170, bars: 112,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 64, name: "Drop" },
          { beat: 192, name: "Break" }, { beat: 256, name: "Drop 2" },
          { beat: 384, name: "Outro" },
        ],
      },
      {
        key: "basshouse", label: "Bass House", bpm: 128, bars: 72,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 32, name: "Build" },
          { beat: 64, name: "Drop" }, { beat: 128, name: "Break" },
          { beat: 160, name: "Build 2" }, { beat: 192, name: "Drop 2" },
          { beat: 256, name: "Outro" },
        ],
      },
      {
        key: "bigbeat", label: "Big Beat", bpm: 130, bars: 64,
        sections: [
          { beat: 0, name: "Intro" }, { beat: 32, name: "Drop" },
          { beat: 96, name: "Break" }, { beat: 160, name: "Drop 2" },
          { beat: 224, name: "Outro" },
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// Custom template storage
// ═══════════════════════════════════════════════════════════

const STORAGE_FILE = "custom-templates.json";
let CUSTOM_FAMILIES: Family[] = [];

async function loadCustomFamilies(storageDir: string): Promise<Family[]> {
  const filePath = path.join(storageDir, STORAGE_FILE);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const families = JSON.parse(raw) as Family[];
    flog(`[Cue Templates] loadCustomFamilies: ${families.length} families loaded`);
    return families;
  } catch {
    return [];
  }
}

async function saveCustomFamilies(storageDir: string, families: Family[]): Promise<void> {
  const filePath = path.join(storageDir, STORAGE_FILE);
  await fs.writeFile(filePath, JSON.stringify(families, null, 2), "utf-8");
}

// ═══════════════════════════════════════════════════════════
// Flat lookup: key → { family, template }
// ═══════════════════════════════════════════════════════════

const LOOKUP: Record<string, { template: Template; sections: Section[]; isCustom?: boolean }> = {};
for (const fam of FAMILIES) {
  for (const t of fam.templates) {
    LOOKUP[t.key] = { template: t, sections: t.sections };
  }
}

function rebuildLookup(customFamilies: Family[]): void {
  for (const key of Object.keys(LOOKUP)) {
    if (LOOKUP[key]?.isCustom) delete LOOKUP[key];
  }
  for (const fam of customFamilies) {
    for (const t of fam.templates) {
      if (!t.key.startsWith("custom_")) {
        flog("[Cue Templates] rebuildLookup: skipping non-namespaced custom key " + t.key);
        continue;
      }
      LOOKUP[t.key] = { template: t, sections: t.sections, isCustom: true };
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Modal HTML builder — radio buttons + dynamic card grid
// ═══════════════════════════════════════════════════════════

function buildModalHtml(customFamilies: Family[], existingCues: Array<{ beat: number; name: string }>, returnTo?: string): string {
  const familiesJson = JSON.stringify(
    FAMILIES.map((f) => ({
      id: f.id,
      label: f.label,
      templates: f.templates.map((t) => ({
        key: t.key,
        label: t.label,
        bpm: t.bpm,
        bars: t.bars,
        sections: t.sections.map((s, i) => {
          const nextBeat = t.sections[i + 1]?.beat;
          const barLen = nextBeat != null
            ? (nextBeat - s.beat) / 4
            : t.bars - s.beat / 4;
          return `${s.name} (${barLen})`;
        }),
      })),
    })),
  );
  const customFamiliesJson = JSON.stringify(customFamilies);
  const existingCuesJson = JSON.stringify(existingCues);
  const returnToJson = JSON.stringify(returnTo ?? null);

  const radioButtons = FAMILIES.map(
    (f, i) =>
      `<label class="radio${i === 0 ? " checked" : ""}">` +
      `<input type="radio" name="family" value="${f.id}"${i === 0 ? " checked" : ""}>` +
      `${f.label}</label>`,
  ).join("");

  return `data:text/html;charset=utf-8,${encodeURIComponent(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Cue Templates</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{
    font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    background:#131313;color:#e2e2e2;padding:16px 20px;
    user-select:none;-webkit-user-select:none;overflow-y:auto;
  }
  h2{font-size:15px;font-weight:600;margin-bottom:2px}
  .sub{font-size:11px;color:#888;margin-bottom:10px}
  .tabs{display:flex;gap:4px;margin-bottom:10px;border-bottom:1px solid #2a2a2a;padding-bottom:8px}
  .tab{font-size:11px;color:#888;background:none;border:none;padding:4px 12px;cursor:pointer;border-radius:0;font-family:inherit}
  .tab.active{background:#1c2100;color:#d4ff00;box-shadow:0 0 4px rgba(212,255,0,0.25)}
  .tab:hover:not(.active){background:#1f1f1f}
  .radios{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
  .radio{font-size:11px;color:#888;background:#1f1f1f;border:1px solid #2a2a2a;border-radius:0;padding:5px 10px;cursor:pointer;transition:all .1s}
  .radio:hover{background:#2a2a2a;border-color:#444932}
  .radio.checked{background:#1c2100;border-color:#d4ff00;color:#d4ff00}
  .radio input{display:none}
  .tempo-toggle{font-size:11px;color:#888;display:flex;align-items:center;gap:6px;margin-bottom:10px;cursor:pointer}
  .tempo-toggle input{accent-color:#d4ff00}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
  .card{background:#1f1f1f;border:1px solid #2a2a2a;border-radius:0;padding:10px 12px;text-align:left;cursor:pointer;transition:all .1s;color:#e2e2e2;width:100%;display:flex;flex-direction:column;align-items:stretch;font-family:inherit}
  .card:hover{background:#2a2a2a;border-color:#d4ff00}
  .card:active{transform:scale(.98)}
  .card-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:4px;margin-bottom:6px}
  .card-title{font-weight:600;font-size:12px}
  .card-bpm{font-size:10px;color:#d4ff00;font-weight:500;font-family:'JetBrains Mono','Consolas',monospace}
  .card-sections{display:flex;flex-wrap:wrap;gap:4px;align-items:flex-start;margin-bottom:6px}
  .chip{background:#2a2a2a;color:#888;padding:2px 6px;border-radius:0;font-size:10px;white-space:nowrap;font-family:'JetBrains Mono','Consolas',monospace}
  .card-meta{font-size:9px;color:#444932}
  .badge-custom{background:#1c2100;color:#d4ff00;padding:2px 6px;border-radius:0;font-size:9px;font-weight:500;font-family:'JetBrains Mono','Consolas',monospace}
  .icon-btns{display:flex;gap:2px;margin-left:auto}
  .icon-btn{background:none;border:none;color:#888;cursor:pointer;font-size:11px;padding:2px 4px;border-radius:0;font-family:inherit;line-height:1}
  .icon-btn:hover{color:#d4ff00;background:#1c2100}
  .family-row{display:flex;align-items:center;gap:4px;margin-bottom:4px;font-size:12px;font-weight:600;color:#e2e2e2}
  .family-label{flex:1}
  .empty-state{text-align:center;padding:24px 0;color:#888;font-size:12px}
  .empty-state p{margin-bottom:12px}
  .btn-primary{font-size:11px;background:#1c2100;color:#d4ff00;border:1px solid #d4ff00;border-radius:0;padding:6px 14px;cursor:pointer;font-family:inherit}
  .btn-primary:hover{background:#2a3300;box-shadow:0 0 6px rgba(212,255,0,0.3)}
  .btn-secondary{font-size:11px;background:#1f1f1f;color:#888;border:1px solid #2a2a2a;border-radius:0;padding:6px 14px;cursor:pointer;font-family:inherit}
  .btn-secondary:hover{background:#2a2a2a}
  .form-group{margin-bottom:8px}
  .form-label{font-size:10px;color:#888;display:block;margin-bottom:3px}
  .form-input{width:100%;background:#1f1f1f;border:1px solid #2a2a2a;border-radius:0;padding:5px 8px;color:#e2e2e2;font-size:11px;font-family:inherit}
  .form-input:focus{outline:none;border-color:#d4ff00}
  .form-row{display:flex;gap:8px}
  .form-row .form-group{flex:1}
  .section-list{margin-bottom:4px}
  .section-row{display:flex;align-items:center;gap:4px;padding:5px 6px;background:#1f1f1f;border:1px solid #2a2a2a;border-radius:0;margin-bottom:4px;cursor:grab}
  .section-row.dragging{opacity:.4}
  .section-row.drag-over{border-color:#d4ff00;background:#1c2100}
  .drag-handle{color:#444932;font-size:13px;cursor:grab;user-select:none;padding-right:2px}
  .sec-name{flex:1;background:transparent;border:none;color:#e2e2e2;font-size:11px;font-family:inherit;outline:none;min-width:0;cursor:text}
  .sec-bars{background:transparent;border:1px solid #2a2a2a;color:#e2e2e2;border-radius:0;padding:2px 3px;font-size:10px;font-family:'JetBrains Mono','Consolas',monospace;text-align:center;width:46px;cursor:text}
  .sec-bars:focus{outline:none;border-color:#d4ff00}
  .bars-total{font-size:10px;color:#888;text-align:right;margin:2px 0 8px;font-family:'JetBrains Mono','Consolas',monospace}
  .section-actions{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap}
  .form-actions{display:flex;gap:6px;margin-top:12px}
  .add-top{margin-bottom:10px}
</style></head>
<body>
  <h2>Drop Cue Template</h2>
  <p class="sub">Pick a style — locators placed in arrangement</p>
  <div class="tabs">
    <button class="tab active" data-tab="builtin" onclick="switchTab('builtin')">Genre-Vorlagen</button>
    <button class="tab" data-tab="meine" onclick="switchTab('meine')">Meine Templates</button>
  </div>
  <div id="panel-builtin">
    <label class="tempo-toggle"><input type="checkbox" id="setTempo"> Set song tempo to match</label>
    <div class="radios" id="radios">${radioButtons}</div>
    <div class="grid" id="cards"></div>
  </div>
  <div id="panel-meine" style="display:none">
    <div id="meine-content"></div>
    <div id="form-panel" style="display:none">
      <div class="form-row">
        <div class="form-group" style="flex:2">
          <label class="form-label">Template-Name *</label>
          <input id="form-name" class="form-input" type="text" placeholder="z.B. Mein House-Set">
        </div>
        <div class="form-group" style="flex:1;max-width:72px">
          <label class="form-label">BPM</label>
          <input id="form-bpm" class="form-input" type="number" min="40" max="300" value="128">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Familie *</label>
        <div style="display:flex;gap:6px;align-items:center">
          <select id="form-fam-sel" class="form-input" style="flex:1" onchange="onFamSelChange()"></select>
          <input id="form-fam-new" class="form-input" style="flex:1;display:none" type="text" placeholder="Neue Familie benennen...">
        </div>
        <input id="form-fam-id" type="hidden" value="">
      </div>
      <div class="form-group">
        <label class="form-label">Sections</label>
        <div id="section-list" class="section-list"></div>
        <div id="bars-total" class="bars-total">0 bars gesamt</div>
        <div class="section-actions">
          <button class="btn-secondary" onclick="addSection()">+ Section hinzufügen</button>
          <button class="btn-secondary" onclick="importFromArrangement()">Aus Arrangement übernehmen</button>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-primary" onclick="saveTemplate()">Speichern</button>
        <button class="btn-secondary" onclick="closeForm()">Abbrechen</button>
      </div>
    </div>
  </div>
  <script>
    var families = ${familiesJson};
    var customFamilies = ${customFamiliesJson};
    var existingCues = ${existingCuesJson};
    var returnTo = ${returnToJson};
    var selectedFamily = families[0].id;
    var dragSrc = null;
    var sections = [];
    var editingFamilyId = null;
    var editingTemplateKey = null;

    function escHtml(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function sendAction(action) {
      var msg = { method: 'close_and_send', params: [JSON.stringify(action)] };
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.live) {
        window.webkit.messageHandlers.live.postMessage(msg);
      } else if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage(msg);
      }
    }

    function selectTemplate(key) {
      var setTempo = document.getElementById('setTempo').checked;
      sendAction({ action: 'drop', key: key, setTempo: setTempo });
    }

    function switchTab(name) {
      document.getElementById('panel-builtin').style.display = name === 'builtin' ? '' : 'none';
      document.getElementById('panel-meine').style.display = name === 'meine' ? '' : 'none';
      document.querySelectorAll('.tab').forEach(function(t) {
        t.className = 'tab' + (t.dataset.tab === name ? ' active' : '');
      });
    }

    function renderCards(familyId) {
      selectedFamily = familyId;
      var allFams = families.concat(customFamilies);
      var fam = allFams.find(function(f) { return f.id === familyId; });
      if (!fam) return;
      var isCustomFam = customFamilies.some(function(f) { return f.id === familyId; });
      var html = '';
      fam.templates.forEach(function(t) {
        var key = t.key;
        var famId = fam.id;
        html += '<button class="card" onclick="selectTemplate(\\''+key+'\\')">'
          + '<div class="card-top">'
          + '<span class="card-title">'+escHtml(t.label)+'</span>'
          + '<span class="card-bpm">'+t.bpm+' bpm</span>';
        if (isCustomFam) {
          html += '<span class="badge-custom">Eigenes</span>'
            + '<span class="icon-btns">'
            + '<button class="icon-btn" onclick="event.stopPropagation();editTemplate(\\''+famId+'\\',\\''+key+'\\')" title="Bearbeiten">&#9998;</button>'
            + '<button class="icon-btn" onclick="event.stopPropagation();confirmDelete(\\''+famId+'\\',\\''+key+'\\')" title="L&#246;schen">&#128465;</button>'
            + '</span>';
        }
        html += '</div><div class="card-sections">';
        var secs = t.sections || [];
        if (isCustomFam) {
          secs.forEach(function(s, i) {
            var nextBeat = secs[i+1] ? secs[i+1].beat : null;
            var bars = nextBeat != null ? Math.round((nextBeat-s.beat)/4) : 8;
            html += '<span class="chip">'+escHtml(s.name)+' ('+bars+')</span>';
          });
        } else {
          secs.forEach(function(s) {
            html += '<span class="chip">'+escHtml(String(s))+'</span>';
          });
        }
        html += '</div><div class="card-meta">'+t.bars+' bars total</div></button>';
      });
      document.getElementById('cards').innerHTML = html;
      document.querySelectorAll('.radio').forEach(function(r) {
        var inp = r.querySelector('input');
        r.className = 'radio' + (inp && inp.value === familyId ? ' checked' : '');
      });
    }

    function renderMeineTab() {
      var el = document.getElementById('meine-content');
      if (!customFamilies.length) {
        el.innerHTML = '<div class="empty-state"><p>Noch keine eigenen Templates.</p>'
          + '<button class="btn-primary" onclick="openCreateForm()">+ Neues Template</button></div>';
        return;
      }
      var html = '<div class="add-top"><button class="btn-primary" onclick="openCreateForm()">+ Neues Template</button></div>';
      customFamilies.forEach(function(fam) {
        var canDel = fam.templates.length === 0;
        html += '<div class="family-row">'
          + '<span class="family-label">'+escHtml(fam.label)+'</span>'
          + '<button class="icon-btn" onclick="renameFamily(\\''+fam.id+'\\')" title="Umbenennen">&#9998;</button>';
        if (canDel) {
          html += '<button class="icon-btn" onclick="deleteFamily(\\''+fam.id+'\\')" title="Familie l&#246;schen">&#128465;</button>';
        }
        html += '</div><div class="grid">';
        fam.templates.forEach(function(t) {
          var key = t.key; var famId = fam.id;
          html += '<button class="card" onclick="selectTemplate(\\''+key+'\\')">'
            + '<div class="card-top">'
            + '<span class="card-title">'+escHtml(t.label)+'</span>'
            + '<span class="card-bpm">'+t.bpm+' bpm</span>'
            + '<span class="badge-custom">Eigenes</span>'
            + '<span class="icon-btns">'
            + '<button class="icon-btn" onclick="event.stopPropagation();editTemplate(\\''+famId+'\\',\\''+key+'\\')" title="Bearbeiten">&#9998;</button>'
            + '<button class="icon-btn" onclick="event.stopPropagation();confirmDelete(\\''+famId+'\\',\\''+key+'\\')" title="L&#246;schen">&#128465;</button>'
            + '</span></div><div class="card-sections">';
          var secs = t.sections || [];
          secs.forEach(function(s, i) {
            var nextBeat = secs[i+1] ? secs[i+1].beat : null;
            var bars = nextBeat != null ? Math.round((nextBeat-s.beat)/4) : 8;
            html += '<span class="chip">'+escHtml(s.name)+' ('+bars+')</span>';
          });
          html += '</div><div class="card-meta">'+t.bars+' bars total</div></button>';
        });
        html += '</div>';
      });
      el.innerHTML = html;
    }

    function populateFamSelect(selectedId) {
      var sel = document.getElementById('form-fam-sel');
      var html = '';
      customFamilies.forEach(function(f) {
        html += '<option value="'+escHtml(f.id)+'"'+(f.id===selectedId?' selected':'')+'>'+escHtml(f.label)+'</option>';
      });
      html += '<option value="__new__"'+(selectedId===null?' selected':'')+'>+ Neue Familie...</option>';
      sel.innerHTML = html;
      onFamSelChange();
    }

    function onFamSelChange() {
      var sel = document.getElementById('form-fam-sel');
      var newInput = document.getElementById('form-fam-new');
      var idInput = document.getElementById('form-fam-id');
      if (sel.value === '__new__') {
        newInput.style.display = '';
        idInput.value = '';
      } else {
        newInput.style.display = 'none';
        idInput.value = sel.value;
      }
    }

    function openCreateForm(familyId, templateKey) {
      editingFamilyId = familyId || null;
      editingTemplateKey = templateKey || null;
      sections = [];
      var nameVal = '', bpmVal = 128;
      if (familyId && templateKey) {
        var cf = customFamilies.find(function(f) { return f.id === familyId; });
        if (cf) {
          var ct = cf.templates.find(function(t) { return t.key === templateKey; });
          if (ct) {
            nameVal = ct.label; bpmVal = ct.bpm;
            var scs = ct.sections || [];
            sections = scs.map(function(s, i) {
              var nextBeat = scs[i+1] ? scs[i+1].beat : null;
              return { name: s.name, bars: nextBeat != null ? Math.round((nextBeat-s.beat)/4) : 8 };
            });
          }
        }
      }
      document.getElementById('form-name').value = nameVal;
      document.getElementById('form-bpm').value = String(bpmVal);
      populateFamSelect(familyId || null);
      renderSectionList();
      document.getElementById('meine-content').style.display = 'none';
      document.getElementById('form-panel').style.display = '';
    }

    function closeForm() {
      document.getElementById('form-panel').style.display = 'none';
      document.getElementById('meine-content').style.display = '';
    }

    function renderSectionList() {
      var ul = document.getElementById('section-list');
      var html = '';
      sections.forEach(function(s, i) {
        html += '<div class="section-row" draggable="true" data-idx="'+i+'">'
          + '<span class="drag-handle">&#10783;</span>'
          + '<input class="sec-name" value="'+escHtml(s.name)+'" placeholder="Name" oninput="sections['+i+'].name=this.value">'
          + '<input class="sec-bars" type="number" min="1" value="'+s.bars+'" oninput="sections['+i+'].bars=parseInt(this.value)||1;updateBarsTotal()">'
          + '<button class="icon-btn" onclick="sections.splice('+i+',1);renderSectionList()">&#10005;</button>'
          + '</div>';
      });
      ul.innerHTML = html;
      ul.querySelectorAll('.section-row').forEach(function(row) { wireRow(row); });
      updateBarsTotal();
    }

    function updateBarsTotal() {
      var total = sections.reduce(function(n, s) { return n + (s.bars || 0); }, 0);
      document.getElementById('bars-total').textContent = total + ' bars gesamt';
    }

    function addSection() {
      sections.push({ name: '', bars: 8 });
      renderSectionList();
    }

    function importFromArrangement() {
      if (!existingCues.length) { alert('Keine Locators im Arrangement.'); return; }
      var sorted = existingCues.slice().sort(function(a, b) { return a.beat - b.beat; });
      // 4/4 assumption: bars = (nextBeat - curBeat) / 4
      sections = sorted.map(function(c, i) {
        var nextBeat = sorted[i+1] ? sorted[i+1].beat : null;
        return { name: c.name, bars: nextBeat != null ? Math.round((nextBeat - c.beat) / 4) : 8 };
      });
      renderSectionList();
    }

    function wireRow(row) {
      row.addEventListener('dragstart', function(e) {
        dragSrc = this; e.dataTransfer.effectAllowed = 'move'; this.classList.add('dragging');
      });
      row.addEventListener('dragover', function(e) {
        e.preventDefault(); e.dataTransfer.dropEffect = 'move'; this.classList.add('drag-over');
      });
      row.addEventListener('dragleave', function() { this.classList.remove('drag-over'); });
      row.addEventListener('drop', function(e) {
        e.stopPropagation(); this.classList.remove('drag-over');
        if (dragSrc !== this) {
          var si = parseInt(dragSrc.dataset.idx), di = parseInt(this.dataset.idx);
          var tmp = sections[si]; sections[si] = sections[di]; sections[di] = tmp;
          renderSectionList();
        }
        return false;
      });
      row.addEventListener('dragend', function() {
        this.classList.remove('dragging');
        document.querySelectorAll('.section-row').forEach(function(r) { r.classList.remove('drag-over'); });
      });
    }

    function saveTemplate() {
      var name = document.getElementById('form-name').value.trim();
      var bpm = parseInt(document.getElementById('form-bpm').value) || 128;
      var sel = document.getElementById('form-fam-sel');
      var famId = document.getElementById('form-fam-id').value.trim();
      var famLabel = '';
      if (sel.value === '__new__') {
        famLabel = document.getElementById('form-fam-new').value.trim();
        famId = famId || ('fam_' + Date.now());
      } else {
        famId = sel.value;
        var cf2 = customFamilies.find(function(f) { return f.id === famId; });
        famLabel = cf2 ? cf2.label : famId;
      }
      if (!name) { alert('Bitte Template-Namen eingeben.'); return; }
      if (!famLabel) { alert('Bitte Familie benennen.'); return; }
      var key = editingTemplateKey || ('custom_' + famId + '_' + Date.now());
      var beat = 0;
      var sectionList = sections.map(function(s) {
        var entry = { beat: beat, name: s.name };
        beat += (s.bars || 8) * 4;
        return entry;
      });
      var totalBars = sections.reduce(function(n, s) { return n + (s.bars || 8); }, 0);
      sendAction({ action: 'save_template', familyId: famId, familyLabel: famLabel,
        template: { key: key, label: name, bpm: bpm, bars: totalBars, sections: sectionList } });
    }

    function confirmDelete(familyId, key) {
      var cf = customFamilies.find(function(f) { return f.id === familyId; });
      var t = cf && cf.templates.find(function(t) { return t.key === key; });
      var label = t ? t.label : key;
      if (window.confirm("Template '" + label + "' wirklich löschen?")) {
        sendAction({ action: 'delete_template', familyId: familyId, key: key });
      }
    }

    function editTemplate(familyId, key) {
      switchTab('meine');
      openCreateForm(familyId, key);
    }

    function renameFamily(familyId) {
      var cf = customFamilies.find(function(f) { return f.id === familyId; });
      var cur = cf ? cf.label : '';
      var newLabel = window.prompt('Neuer Name für die Familie:', cur);
      if (newLabel && newLabel.trim()) {
        sendAction({ action: 'save_family', familyId: familyId, label: newLabel.trim() });
      }
    }

    function deleteFamily(familyId) {
      var cf = customFamilies.find(function(f) { return f.id === familyId; });
      var label = cf ? cf.label : familyId;
      if (window.confirm("Familie '" + label + "' löschen?")) {
        sendAction({ action: 'delete_family', familyId: familyId });
      }
    }

    function wireRadios() {
      customFamilies.forEach(function(f) {
        var lbl = document.createElement('label');
        lbl.className = 'radio';
        var inp = document.createElement('input');
        inp.type = 'radio'; inp.name = 'family'; inp.value = f.id;
        lbl.appendChild(inp);
        lbl.appendChild(document.createTextNode(f.label));
        document.getElementById('radios').appendChild(lbl);
      });
      document.querySelectorAll('input[name="family"]').forEach(function(input) {
        input.addEventListener('change', function() { renderCards(this.value); });
      });
    }

    wireRadios();
    renderCards(families[0].id);
    renderMeineTab();
    if (returnTo === 'meine-templates') switchTab('meine');
  </script>
</body></html>`)}`;
}

// ═══════════════════════════════════════════════════════════
// Extension entry point
// ═══════════════════════════════════════════════════════════

export function activate(activation: ActivationContext) {
  flog("[Cue Templates] activate() called");

  // Defer registration — Live's Song may not be ready at .ablx install startup
  setTimeout(async () => {
    flog("[Cue Templates] Deferred init starting");
    try {
      flog("[Cue Templates] Step 1: initialize...");
      const context = initialize(activation, "1.0.0");
      flog("[Cue Templates] Step 1 OK");

      flog("[Cue Templates] Step 2: resolve song...");
      const song = context.application.song;
      flog("[Cue Templates] Step 2 OK");

      // Touch cuePoints to verify song is alive; bail if it throws
      flog("[Cue Templates] Step 3: cuePoints sanity...");
      const cueCount = song.cuePoints.length;
      flog(`[Cue Templates] Step 3 OK — ${cueCount} locators`);

      // Step 3.5: load custom templates from disk
      const storageDir = context.environment.storageDirectory;
      if (storageDir) {
        CUSTOM_FAMILIES = await loadCustomFamilies(storageDir);
        rebuildLookup(CUSTOM_FAMILIES);
        flog("[Cue Templates] Loaded " + CUSTOM_FAMILIES.length + " custom families");
      } else {
        flog("[Cue Templates] No storage dir — skipping custom template load");
      }

    const CMD_DROP = "cueTemplates.drop";
    const CMD_CLEAR = "cueTemplates.clear";

  flog("[Cue Templates] Step 4: register context menus...");
  // Register context menu on track headers
  for (const scope of ["MidiTrack", "AudioTrack"] as const) {
    flog(`[Cue Templates]   Registering on ${scope}...`);
    context.ui
      .registerContextMenuAction(scope, "Drop Cue Template…", CMD_DROP)
      .then(() => flog(`[Cue Templates]   Drop on ${scope} OK`))
      .catch((err) =>
        flog(`[Cue Templates]   Drop on ${scope} FAILED: ${err}`),
      );
    context.ui
      .registerContextMenuAction(scope, "Clear All Locators", CMD_CLEAR)
      .then(() => flog(`[Cue Templates]   Clear on ${scope} OK`))
      .catch((err) =>
        flog(`[Cue Templates]   Clear on ${scope} FAILED: ${err}`),
      );
  }
  flog("[Cue Templates] Step 4 OK");

  flog("[Cue Templates] Step 5: register CMD_CLEAR...");
  // Command: clear all cue points
  context.commands.registerCommand(CMD_CLEAR, () =>
    void (async () => {
      flog("[Cue Templates] CMD_CLEAR fired");
      const cues = song.cuePoints;
      if (cues.length === 0) {
        flog("[Cue Templates] No locators to clear");
        return;
      }
      await context.withinTransaction(() =>
        Promise.all(cues.map((c) => song.deleteCuePoint(c))),
      );
      flog(`[Cue Templates] Cleared ${cues.length} locators`);
    })().catch((err) => flog(`[Cue Templates] Clear failed: ${err}`)),
  );
  flog("[Cue Templates] Step 5 OK");

  flog("[Cue Templates] Step 6: register CMD_DROP...");
  // Command: show modal → create cues or manage custom templates
  context.commands.registerCommand(CMD_DROP, () =>
    void (async () => {
      const storageDir = context.environment.storageDirectory;

      const openModal = async (returnTo?: string): Promise<string | null> => {
        const existingCues = song.cuePoints.map((c) => ({ beat: c.time, name: c.name }));
        return context.ui.showModalDialog(
          buildModalHtml(CUSTOM_FAMILIES, existingCues, returnTo),
          480,
          680,
        );
      };

      let returnTo: string | undefined = undefined;
      while (true) {
        const raw = await openModal(returnTo);
        returnTo = undefined;

        if (!raw) {
          flog("[Cue Templates] Cancelled");
          return;
        }

        const result = JSON.parse(raw) as {
          action: "drop" | "save_template" | "delete_template" | "save_family" | "delete_family" | "cancel";
          [k: string]: unknown;
        };

        if (result.action === "cancel") {
          flog("[Cue Templates] User cancelled");
          return;
        }

        if (result.action === "drop") {
          const key = result.key as string;
          const setTempo = result.setTempo as boolean;

          if (!LOOKUP[key]) {
            flog("[Cue Templates] Unknown genre: " + key);
            return;
          }

          const { template, sections } = LOOKUP[key]!;
          flog(
            `[Cue Templates] Dropping ${template.label} — ${sections.length} cues, ${template.bars} bars` +
              (setTempo ? `, tempo → ${template.bpm}` : ""),
          );

          if (setTempo) {
            song.tempo = template.bpm;
          }

          const newCues = (await context.withinTransaction(() =>
            Promise.all(sections.map((s) => song.createCuePoint(s.beat))),
          )) as CuePoint<"1.0.0">[];

          for (let i = 0; i < newCues.length; i++) {
            const cue = newCues[i];
            const section = sections[i];
            if (cue && section) cue.name = section.name;
          }

          flog("[Cue Templates] Done");
          return;
        }

        // All remaining actions require persistence
        if (!storageDir) {
          flog("[Cue Templates] No storage dir — cannot persist");
          return;
        }

        if (result.action === "save_template") {
          const familyId = result.familyId as string;
          const familyLabel = result.familyLabel as string;
          const template = result.template as Template;
          if (!template.key.startsWith("custom_")) {
            flog("[Cue Templates] save_template: skipping non-namespaced key " + template.key);
            returnTo = "meine-templates";
            continue;
          }
          const existingFamily = CUSTOM_FAMILIES.find((f) => f.id === familyId);
          if (existingFamily) {
            const idx = existingFamily.templates.findIndex((t) => t.key === template.key);
            if (idx >= 0) {
              existingFamily.templates[idx] = template;
            } else {
              existingFamily.templates.push(template);
            }
          } else {
            CUSTOM_FAMILIES.push({ id: familyId, label: familyLabel, templates: [template] });
          }
          await saveCustomFamilies(storageDir, CUSTOM_FAMILIES);
          rebuildLookup(CUSTOM_FAMILIES);
          flog("[Cue Templates] Template saved: " + template.key);
          returnTo = "meine-templates";
          continue;
        }

        if (result.action === "delete_template") {
          const familyId = result.familyId as string;
          const key = result.key as string;
          const family = CUSTOM_FAMILIES.find((f) => f.id === familyId);
          if (family) {
            family.templates = family.templates.filter((t) => t.key !== key);
          }
          await saveCustomFamilies(storageDir, CUSTOM_FAMILIES);
          rebuildLookup(CUSTOM_FAMILIES);
          flog("[Cue Templates] Template deleted: " + key);
          returnTo = "meine-templates";
          continue;
        }

        if (result.action === "save_family") {
          const familyId = result.familyId as string;
          const label = result.label as string;
          const existing = CUSTOM_FAMILIES.find((f) => f.id === familyId);
          if (existing) {
            existing.label = label;
          } else {
            CUSTOM_FAMILIES.push({ id: familyId, label, templates: [] });
          }
          await saveCustomFamilies(storageDir, CUSTOM_FAMILIES);
          rebuildLookup(CUSTOM_FAMILIES);
          flog("[Cue Templates] Family saved: " + familyId);
          returnTo = "meine-templates";
          continue;
        }

        if (result.action === "delete_family") {
          const familyId = result.familyId as string;
          const family = CUSTOM_FAMILIES.find((f) => f.id === familyId);
          if (family && family.templates.length === 0) {
            CUSTOM_FAMILIES = CUSTOM_FAMILIES.filter((f) => f.id !== familyId);
            await saveCustomFamilies(storageDir, CUSTOM_FAMILIES);
            rebuildLookup(CUSTOM_FAMILIES);
            flog("[Cue Templates] Family deleted: " + familyId);
          } else {
            flog("[Cue Templates] delete_family refused — family non-empty or not found: " + familyId);
          }
          returnTo = "meine-templates";
          continue;
        }
      }
    })().catch((err) => flog(`[Cue Templates] Failed: ${err}`)),
  );

  const total = FAMILIES.reduce((n, f) => n + f.templates.length, 0);
  flog(
    `[Cue Templates] Ready — ${FAMILIES.length} families, ${total} templates`,
  );
    } catch (err) {
      flog(`[Cue Templates] activate() crashed: ${err}`);
    }
  }, 500);
}
