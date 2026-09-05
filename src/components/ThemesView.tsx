import React, { useState, useMemo, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Compass, 
  Network, 
  Calendar,
  X,
  FileText,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { Theme, ThemeObservation, Entry } from '../types';

interface ThemesViewProps {
  themes: Theme[];
  observations: ThemeObservation[];
  entries: Entry[];
  onSelectEntry: (entry: Entry) => void;
  onNewReflectionWithPrompt?: (prompt: string) => void;
  isLoading?: boolean;
}

interface UnpackData {
  themeId: string;
  workingTitle: string;
  thesis: string;
  narrative: string;
  explorationPaths: {
    pathTitle: string;
    description: string;
    promptToExplore: string;
  }[];
}

export const ThemesView: React.FC<ThemesViewProps> = ({
  themes,
  observations,
  entries,
  onSelectEntry,
  onNewReflectionWithPrompt,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'graph'>('timeline');
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // Unpack modal state
  const [isUnpackOpen, setIsUnpackOpen] = useState(false);
  const [unpackLoading, setUnpackLoading] = useState(false);
  const [unpackError, setUnpackError] = useState<string | null>(null);
  const [unpackData, setUnpackData] = useState<UnpackData | null>(null);

  // Default select first theme on load
  useEffect(() => {
    if (!selectedThemeId && themes.length > 0) {
      setSelectedThemeId(themes[0].id);
    }
  }, [themes, selectedThemeId]);

  // Filtered themes
  const filteredThemes = useMemo(() => {
    return themes.filter(t => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.currentSynthesis || '').toLowerCase().includes(q)
      );
    });
  }, [themes, searchTerm]);

  // Currently active selected theme
  const selectedTheme = useMemo(() => {
    return themes.find(t => t.id === selectedThemeId) || themes[0] || null;
  }, [themes, selectedThemeId]);

  // Observations for the active selected theme
  const selectedObservations = useMemo(() => {
    if (!selectedTheme) return [];
    return observations
      .filter(obs => obs.themeId === selectedTheme.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [observations, selectedTheme]);

  // Map entry titles for backlinks
  const entryMap = useMemo(() => {
    const map = new Map<string, Entry>();
    entries.forEach(e => map.set(e.id, e));
    return map;
  }, [entries]);

  // Trigger Unpack Further
  const handleUnpackTheme = async (theme: Theme) => {
    const themeObs = observations.filter(o => o.themeId === theme.id);
    if (themeObs.length < 2) return;

    setIsUnpackOpen(true);
    setUnpackLoading(true);
    setUnpackError(null);

    try {
      const response = await fetch(`/api/themes/${theme.id}/unpack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          observations: themeObs
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to unpack longitudinal patterns');
      }

      setUnpackData(data.unpackResult);
    } catch (err: any) {
      setUnpackError(err.message || 'Error communicating with unpack engine');
    } finally {
      setUnpackLoading(false);
    }
  };

  const handleSelectThemeCard = (themeId: string) => {
    setSelectedThemeId(themeId);
    setIsMobileDetailOpen(true);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-full bg-canvas text-text-primary px-3.5 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-5">
      {/* 1. Header & Segmented Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-hairline pb-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Themes & Trajectories
          </h1>
          <p className="text-xs text-text-muted mt-0.5 font-sans">
            Longitudinal intellectual and emotional patterns synthesized across your reflections.
          </p>
        </div>

        {/* Segmented View Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-surface border border-border-hairline shadow-2xs">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-accent-sage text-white font-semibold shadow-2xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'graph'
                ? 'bg-accent-sage text-white font-semibold shadow-2xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Concept Graph</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      {isLoading ? (
        <div className="text-center py-20 text-text-muted text-sm font-sans">
          Loading your synthesized themes...
        </div>
      ) : themes.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border-hairline rounded-2xl p-8 bg-surface space-y-3">
          <div className="w-10 h-10 rounded-full bg-accent-sage-tint text-accent-sage flex items-center justify-center mx-auto">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-text-primary">
            No Themes Synthesized Yet
          </h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto font-sans leading-relaxed">
            Themes automatically emerge and accumulate observations as you conclude reflection sessions.
          </p>
        </div>
      ) : activeTab === 'timeline' ? (
        /* ================= MODE A: TIMELINE MASTER-DETAIL ================= */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Rail: Themes Master List */}
          <div className={`md:col-span-4 space-y-3 ${isMobileDetailOpen ? 'hidden md:block' : 'block'}`}>
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search themes..."
                className="w-full pl-9 pr-4 py-2 bg-surface border border-border-hairline rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-sage transition-all font-sans"
              />
            </div>

            {/* Themes Vertical List */}
            <div className="space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {filteredThemes.map(theme => {
                const isSelected = selectedTheme?.id === theme.id;
                const obsCount = theme.observationCount || 0;

                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectThemeCard(theme.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-left group ${
                      isSelected
                        ? 'bg-surface border-accent-sage shadow-xs ring-1 ring-accent-sage/20'
                        : 'bg-surface border-border-hairline hover:border-[#D5D0C7]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-text-muted mb-1 font-sans">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-accent-sage-tint text-accent-sage">
                          {obsCount} {obsCount === 1 ? 'observation' : 'observations'}
                        </span>
                        <span>{formatDate(theme.updatedAt)}</span>
                      </div>
                      <h3 className={`font-serif text-sm sm:text-base font-semibold transition-colors line-clamp-1 ${
                        isSelected ? 'text-accent-sage' : 'text-text-primary group-hover:text-accent-sage'
                      }`}>
                        {theme.title}
                      </h3>
                      <p className="text-xs text-[#4A4A4A] line-clamp-2 mt-1 leading-relaxed font-sans">
                        {theme.currentSynthesis || 'Evolving reflection theme.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Rail: Selected Theme Dossier & Timeline */}
          {selectedTheme && (
            <div className={`md:col-span-8 space-y-6 ${isMobileDetailOpen ? 'block' : 'hidden md:block'}`}>
              {/* Mobile Back Button */}
              <button
                onClick={() => setIsMobileDetailOpen(false)}
                className="md:hidden inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-medium mb-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to all themes</span>
              </button>

              {/* Selected Theme Card Header */}
              <div className="bg-surface border border-border-hairline rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-text-muted font-sans mb-1">
                      <span>Thread established {formatDate(selectedTheme.createdAt)}</span>
                      <span>&middot;</span>
                      <span className="text-accent-sage font-medium">
                        {selectedObservations.length} total touchpoints
                      </span>
                    </div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                      {selectedTheme.title}
                    </h2>
                  </div>

                  {/* Unpack Button */}
                  <button
                    onClick={() => handleUnpackTheme(selectedTheme)}
                    disabled={selectedObservations.length < 2}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      selectedObservations.length >= 2
                        ? 'bg-accent-sage text-white hover:opacity-95 shadow-xs cursor-pointer'
                        : 'bg-[#F2EFEB] text-text-muted cursor-not-allowed'
                    }`}
                    title={
                      selectedObservations.length < 2
                        ? 'Requires at least 2 observations to unpack trajectory'
                        : 'Unpack longitudinal patterns and exploration prompts'
                    }
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Unpack Further</span>
                  </button>
                </div>

                {/* Rolling Synthesis */}
                <div className="bg-[#FAF9F6] border border-border-hairline/80 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-text-muted font-sans">
                    <TrendingUp className="w-3.5 h-3.5 text-accent-sage" />
                    <span>Current Rolling Synthesis</span>
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-text-primary leading-relaxed">
                    {selectedTheme.currentSynthesis || 'No synthesis accumulated yet.'}
                  </p>
                </div>
              </div>

              {/* Chronological Observation Timeline Feed */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-text-muted font-sans px-1">
                  Observation Timeline ({selectedObservations.length})
                </h3>

                {selectedObservations.length === 0 ? (
                  <div className="p-8 text-center bg-surface border border-border-hairline rounded-xl text-xs text-text-muted">
                    No discrete observations recorded yet for this theme.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-hairline">
                    {selectedObservations.map((obs, index) => {
                      const parentEntry = entryMap.get(obs.entryId);

                      return (
                        <div key={obs.id || index} className="relative group">
                          {/* Timeline Dot */}
                          <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-surface border-2 border-accent-sage flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-sage" />
                          </div>

                          {/* Observation Card */}
                          <div className="bg-surface border border-border-hairline rounded-xl p-4 shadow-2xs hover:border-[#D5D0C7] transition-all space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-text-muted font-sans">
                              <span>{formatDate(obs.timestamp)}</span>
                              {obs.locationSnapshot && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span>{obs.locationSnapshot}</span>
                                </span>
                              )}
                            </div>

                            {/* Observation Text */}
                            <p className="font-serif text-sm text-text-primary leading-relaxed">
                              "{obs.observationText}"
                            </p>

                            {/* Backlink to parent entry */}
                            {parentEntry && (
                              <div className="pt-2 border-t border-border-hairline/60 flex items-center justify-between">
                                <button
                                  onClick={() => onSelectEntry(parentEntry)}
                                  className="text-xs text-accent-sage hover:underline font-medium inline-flex items-center gap-1 cursor-pointer font-sans"
                                >
                                  <span>Reflected in: {parentEntry.title || 'Untitled Session'}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= MODE B: CONCEPT GRAPH ================= */
        <div className="bg-surface border border-border-hairline rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-text-muted font-sans">
              Interactive Concept Graph: Click any theme node to examine its connections and satellite observations.
            </div>
          </div>

          <div className="relative w-full h-[520px] bg-[#FAF9F6] border border-border-hairline rounded-xl overflow-hidden flex items-center justify-center">
            {/* SVG Visual Graph */}
            <svg id="concept-graph-svg" viewBox="0 0 700 520" className="w-full h-full">
              {/* Radial Links between themes */}
              {themes.map((theme, i) => {
                const total = themes.length;
                const angle = (i / total) * 2 * Math.PI;
                const cx = 350 + Math.cos(angle) * 160;
                const cy = 260 + Math.sin(angle) * 160;
                const isSelected = selectedTheme?.id === theme.id;

                return (
                  <g key={`link-${theme.id}`}>
                    <line
                      x1={350}
                      y1={260}
                      x2={cx}
                      y2={cy}
                      stroke={isSelected ? '#3B7A57' : '#E6E3DC'}
                      strokeWidth={isSelected ? 2 : 1}
                      strokeDasharray={isSelected ? 'none' : '4 4'}
                    />
                  </g>
                );
              })}

              {/* Center Hub: The Self / Reflection Core */}
              <circle cx={350} cy={260} r={28} fill="#3B7A57" opacity={0.15} />
              <circle cx={350} cy={260} r={18} fill="#3B7A57" />
              <text
                x={350}
                y={264}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize={10}
                fontWeight="bold"
                fontFamily="Inter, sans-serif"
              >
                YOU
              </text>

              {/* Theme Nodes */}
              {themes.map((theme, i) => {
                const total = themes.length;
                const angle = (i / total) * 2 * Math.PI;
                const cx = 350 + Math.cos(angle) * 160;
                const cy = 260 + Math.sin(angle) * 160;
                const isSelected = selectedTheme?.id === theme.id;
                const obsCount = theme.observationCount || 1;
                const radius = Math.min(38, Math.max(22, 16 + obsCount * 4));

                return (
                  <g
                    key={`node-${theme.id}`}
                    className="cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setSelectedThemeId(theme.id)}
                  >
                    {/* Ring if selected */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius + 6}
                        fill="none"
                        stroke="#3B7A57"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="#FFFFFF"
                      stroke={isSelected ? '#3B7A57' : '#D5D0C7'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="shadow-xs"
                    />
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      fill="#232323"
                      fontSize={11}
                      fontWeight="600"
                      fontFamily="Source Serif 4, Georgia, serif"
                    >
                      {theme.title.slice(0, 12)}...
                    </text>
                    <text
                      x={cx}
                      y={cy + radius + 14}
                      textAnchor="middle"
                      fill="#6B6B6B"
                      fontSize={10}
                      fontFamily="Inter, sans-serif"
                    >
                      {obsCount} obs
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected Node Floating Dossier Drawer (bottom-right) */}
            {selectedTheme && (
              <div className="absolute bottom-4 right-4 max-w-sm bg-surface/95 backdrop-blur-md border border-border-hairline rounded-xl p-4 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-accent-sage bg-accent-sage-tint px-2 py-0.5 rounded-full">
                    {selectedTheme.observationCount} observations
                  </span>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className="text-xs text-accent-sage font-medium hover:underline"
                  >
                    View Timeline &rarr;
                  </button>
                </div>
                <h4 className="font-serif text-base font-semibold text-text-primary">
                  {selectedTheme.title}
                </h4>
                <p className="text-xs text-[#4A4A4A] line-clamp-3 leading-relaxed">
                  {selectedTheme.currentSynthesis}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleUnpackTheme(selectedTheme)}
                    disabled={(selectedTheme.observationCount || 0) < 2}
                    className="w-full py-1.5 px-3 rounded-lg bg-accent-sage text-white text-xs font-semibold hover:opacity-95 transition-opacity disabled:opacity-50"
                  >
                    Unpack Longitudinal Trajectory
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Unpack Further Modal / Drawer */}
      {isUnpackOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border-hairline rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border-hairline pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-accent-sage font-sans flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Longitudinal Theme Unpack
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary mt-1">
                  {unpackData?.workingTitle || selectedTheme?.title}
                </h2>
              </div>
              <button
                onClick={() => setIsUnpackOpen(false)}
                className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-canvas transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            {unpackLoading ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-accent-sage border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-text-muted font-sans">
                  Synthesizing evolutionary thesis and exploration paths across observations...
                </p>
              </div>
            ) : unpackError ? (
              <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl">
                {unpackError}
              </div>
            ) : unpackData ? (
              <div className="space-y-6">
                {/* 1. Core Working Thesis */}
                <div className="bg-accent-sage-tint/40 border-l-4 border-accent-sage p-4 rounded-r-xl">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-accent-sage block mb-1">
                    Central Thesis
                  </span>
                  <p className="font-serif text-base text-text-primary italic leading-relaxed">
                    "{unpackData.thesis}"
                  </p>
                </div>

                {/* 2. Evolution Narrative */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-text-muted font-sans">
                    Evolutionary Narrative
                  </h4>
                  <div className="prose prose-sm text-xs sm:text-sm text-[#333] leading-relaxed font-sans space-y-2">
                    {unpackData.narrative.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                {/* 3. Exploration Paths */}
                {unpackData.explorationPaths && unpackData.explorationPaths.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-text-muted font-sans">
                      Forward Exploration Paths
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {unpackData.explorationPaths.map((path, idx) => (
                        <div
                          key={idx}
                          className="bg-[#FAF9F6] border border-border-hairline rounded-xl p-4 space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <h5 className="font-serif text-sm font-semibold text-text-primary">
                              {path.pathTitle}
                            </h5>
                            <p className="text-xs text-text-muted line-clamp-2 mt-1 leading-relaxed font-sans">
                              {path.description}
                            </p>
                          </div>
                          <div className="pt-2">
                            <p className="text-xs italic text-text-primary mb-2 font-serif">
                              "{path.promptToExplore}"
                            </p>
                            {onNewReflectionWithPrompt && (
                              <button
                                onClick={() => {
                                  setIsUnpackOpen(false);
                                  onNewReflectionWithPrompt(path.promptToExplore);
                                }}
                                className="w-full py-1.5 px-3 rounded-lg bg-accent-sage text-white text-xs font-semibold hover:opacity-95 transition-opacity"
                              >
                                Reflect on this &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
