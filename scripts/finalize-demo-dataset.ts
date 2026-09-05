import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSampleDemoDataset } from '../src/services/demoSimulator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Entry Days Map based on PLANNED_ENTRIES
const ENTRY_DAYS_MAP: Record<string, number> = {
  'demo-entry-1': 28,
  'demo-entry-2': 26,
  'demo-entry-3': 24,
  'demo-entry-4': 22,
  'demo-entry-5': 20,
  'demo-entry-6': 18,
  'demo-entry-7': 16,
  'demo-entry-8': 14,
  'demo-entry-9': 12,
  'demo-entry-10': 10,
  'demo-entry-11': 8,
  'demo-entry-12': 7,
  'demo-entry-13': 5,
  'demo-entry-14': 3,
  'demo-entry-15': 1,
};

const current = getSampleDemoDataset();

// Clean entries
const cleanEntries = current.entries.map((e) => {
  const days = ENTRY_DAYS_MAP[e.id] ?? 1;
  return {
    ...e,
    createdAt: `__SUBDAYS_${days}__`,
    concludedAt: `__SUBDAYS_${days}__`,
    bodySealedAt: `__SUBDAYS_${days}__`,
    turns: e.turns.map((t) => ({
      ...t,
      timestamp: `__SUBDAYS_${days}__`,
    })),
  };
});

// Clean observations
const cleanObs = current.observations.map((o) => {
  const days = ENTRY_DAYS_MAP[o.entryId] ?? 1;
  return {
    ...o,
    timestamp: `__SUBDAYS_${days}__`,
  };
});

// Clean themes (omit embedding array to prevent bundle bloat)
const cleanThemes = current.themes.map((t) => {
  // Find initial and latest observation days
  const obsForTheme = cleanObs.filter((o) => o.themeId === t.id);
  const daysList = obsForTheme.map((o) => ENTRY_DAYS_MAP[o.entryId] ?? 1);
  const oldestDays = Math.max(...daysList, 28);
  const newestDays = Math.min(...daysList, 1);

  return {
    id: t.id,
    userId: t.userId,
    title: t.title,
    currentSynthesis: t.currentSynthesis,
    observationCount: t.observationCount,
    createdAt: `__SUBDAYS_${oldestDays}__`,
    updatedAt: `__SUBDAYS_${newestDays}__`,
    isDemo: true,
  };
});

let entriesJson = JSON.stringify(cleanEntries, null, 2);
let themesJson = JSON.stringify(cleanThemes, null, 2);
let obsJson = JSON.stringify(cleanObs, null, 2);

// Replace placeholders with subDays(N) function calls
const subDaysRegex = /"__SUBDAYS_(\d+)__"/g;
entriesJson = entriesJson.replace(subDaysRegex, 'subDays($1)');
themesJson = themesJson.replace(subDaysRegex, 'subDays($1)');
obsJson = obsJson.replace(subDaysRegex, 'subDays($1)');

const finalContent = `import { Entry, Theme, ThemeObservation } from '../types';

export const DEMO_USER_ID = 'demo-evaluator';

/**
 * AUTHENTIC STUDENT PERSONA DEMO DATASET ("First Month Away From Home")
 * Generated chronologically through the real Locus AI companion and synchronous synthesis pipeline.
 * Fully aligned with Locus-Demo-Data-Brief.md & Locus-Demo-Agent-Plan.md.
 */
export function getSampleDemoDataset(userId: string = DEMO_USER_ID): {
  entries: Entry[];
  themes: Theme[];
  observations: ThemeObservation[];
} {
  const now = new Date();
  const subDays = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  const entries: Entry[] = ${entriesJson};

  const themes: Theme[] = ${themesJson};

  const observations: ThemeObservation[] = ${obsJson};

  return { entries, themes, observations };
}
`;

const targetFile = path.resolve(__dirname, '../src/services/demoSimulator.ts');
fs.writeFileSync(targetFile, finalContent, 'utf-8');
console.log(`Cleanly formatted demoSimulator.ts with dynamic relative timestamps.`);
