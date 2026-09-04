import { Theme, ThemeObservation } from '../../types';

export interface ExplorationPath {
  pathTitle: string;
  promptStarter: string;
  creativePrompt?: string; // Ergonomic alias for promptStarter
  inquiries: string[];
}

export interface UnpackResult {
  themeId: string;
  workingTitle: string;
  thesis: string;
  evolutionaryThesis?: string; // Ergonomic alias for thesis
  narrative: string;
  narrativeArc?: string; // Ergonomic alias for narrative
  explorationPaths: ExplorationPath[];
  generatedAt: string;
  modelUsed?: string;
}

export interface UnpackParams {
  theme: Theme;
  observations: ThemeObservation[];
}
