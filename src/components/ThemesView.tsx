import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Layers, 
  Search, 
  RotateCcw, 
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

// Helper to split theme titles into two balanced lines without capsule truncation
function splitTitleIntoTwoLines(title: string): [string, string] {
  const words = title.split(' ');
  if (words.length <= 2) return [title, ''];
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(' ');
  const line2 = words.slice(mid).join(' ');
  return [line1, line2];
}

// Graceful quintic and back easing curves for the spiral petal bloom entrance
function easeOutQuint(x: number): number {
  return 1 - Math.pow(1 - x, 5);
}

function easeOutBack(x: number): number {
  const c1 = 1.25;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

interface SimNode {
  id: string;
  type: 'hub' | 'theme' | 'obs';
  label: string;
  line1?: string;
  line2?: string;
  subLabel?: string;
  x: number;
  y: number;
  homeX?: number;
  homeY?: number;
  vx: number;
  vy: number;
  scale?: number;
  opacity?: number;
  radius: number;
  themeId?: string;
  obsData?: ThemeObservation;
  obsCount?: number;
  orderIndex?: number;
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

  // Concept Graph Hybrid Simulation & Zoom State
  const [zoomedThemeId, setZoomedThemeId] = useState<string | null>(null);
  const [selectedObsId, setSelectedObsId] = useState<string | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [isBlooming, setIsBlooming] = useState(false);
  const nodesRef = useRef<SimNode[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // Active focused theme for graph micro-view
  const graphZoomedTheme = useMemo(() => {
    if (!zoomedThemeId) return null;
    return themes.find(t => t.id === zoomedThemeId) || null;
  }, [themes, zoomedThemeId]);

  // Observations for graph micro-view, sorted chronologically
  const graphZoomedObservations = useMemo(() => {
    if (!graphZoomedTheme) return [];
    return observations
      .filter(o => o.themeId === graphZoomedTheme.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [observations, graphZoomedTheme]);

  // Selected observation object
  const selectedObs = useMemo(() => {
    if (!selectedObsId) return null;
    return observations.find(o => o.id === selectedObsId) || null;
  }, [observations, selectedObsId]);

  // Helper to directly update SVG DOM elements without triggering full component re-renders
  const updateSVGElement = (node: SimNode) => {
    if (!svgRef.current) return;
    const g = (node.type === 'theme'
      ? svgRef.current.querySelector(`#theme-node-${node.themeId}`)
      : node.type === 'obs'
      ? svgRef.current.querySelector(`#obs-node-${node.obsData?.id}`)
      : svgRef.current.querySelector(`#node-group-${node.id}`)) as SVGGElement | null;

    if (g) {
      g.setAttribute('transform', `translate(${node.x.toFixed(1)}, ${node.y.toFixed(1)}) scale(${node.scale ?? 1})`);
      g.setAttribute('opacity', String(node.opacity !== undefined ? node.opacity : 1));
    }
    const line = svgRef.current.querySelector(`#link-${node.id}`) as SVGLineElement | null;
    if (line) {
      line.setAttribute('x2', node.x.toFixed(1));
      line.setAttribute('y2', node.y.toFixed(1));
      line.setAttribute('opacity', String(node.opacity !== undefined ? node.opacity * 0.85 : 0.85));
    }
  };

  // Graceful Spiral Petal Bloom entrance choreography
  const triggerSpiralBloom = (targetNodes: SimNode[]) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsBlooming(true);
    let bloomStartTime = 0;
    const center = { x: 380, y: 260 };

    const runBloomStep = (timestamp: number) => {
      if (!bloomStartTime) bloomStartTime = timestamp;
      const elapsed = (timestamp - bloomStartTime) / 1000;
      let allDone = true;

      for (let i = 1; i < nodesRef.current.length; i++) {
        const node = nodesRef.current[i];
        const delay = (node.orderIndex || 0) * 0.085; // 85ms staggered clockwise cascade
        const duration = 1.05; // 1.05s graceful glide
        const nodeTime = elapsed - delay;

        if (nodeTime < 0) {
          node.x = center.x;
          node.y = center.y;
          node.scale = 0.35;
          node.opacity = 0;
          allDone = false;
        } else if (nodeTime <= duration) {
          const progress = Math.min(1, Math.max(0, nodeTime / duration));
          const easedPos = easeOutBack(progress);
          const easedScale = 0.35 + (1 - 0.35) * easeOutQuint(progress);
          const easedOpacity = Math.min(1, progress * 1.6);

          node.x = center.x + ((node.homeX ?? center.x) - center.x) * easedPos;
          node.y = center.y + ((node.homeY ?? center.y) - center.y) * easedPos;
          node.scale = easedScale;
          node.opacity = easedOpacity;
          allDone = false;
        } else {
          node.x = node.homeX ?? center.x;
          node.y = node.homeY ?? center.y;
          node.scale = 1;
          node.opacity = 1;
        }
        updateSVGElement(node);
      }

      if (!allDone) {
        animFrameRef.current = requestAnimationFrame(runBloomStep);
      } else {
        setIsBlooming(false);
        animFrameRef.current = null;
        setNodes([...nodesRef.current]);
      }
    };

    animFrameRef.current = requestAnimationFrame(runBloomStep);
  };

  // Initialize nodes and trigger bloom when switching tabs or zooming
  useEffect(() => {
    if (activeTab !== 'graph') {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    if (!zoomedThemeId) {
      // Macro View: YOU hub + Themes
      const center = { x: 380, y: 260 };
      const newNodes: SimNode[] = [
        {
          id: 'hub-you',
          type: 'hub',
          label: 'YOU',
          x: center.x,
          y: center.y,
          homeX: center.x,
          homeY: center.y,
          vx: 0,
          vy: 0,
          scale: 1,
          opacity: 1,
          radius: 26
        }
      ];

      themes.forEach((theme, i) => {
        const total = Math.max(1, themes.length);
        const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
        const radius = Math.min(36, Math.max(22, 16 + (theme.observationCount || 1) * 3));
        const [line1, line2] = splitTitleIntoTwoLines(theme.title);
        const homeX = center.x + Math.cos(angle) * 175;
        const homeY = center.y + Math.sin(angle) * 175;

        newNodes.push({
          id: `theme-${theme.id}`,
          type: 'theme',
          themeId: theme.id,
          label: theme.title,
          line1,
          line2,
          obsCount: theme.observationCount || 0,
          orderIndex: i,
          x: center.x,
          y: center.y,
          homeX,
          homeY,
          vx: 0,
          vy: 0,
          scale: 0.35,
          opacity: 0,
          radius
        });
      });

      nodesRef.current = newNodes;
      setNodes([...newNodes]);
      triggerSpiralBloom(newNodes);
    } else {
      // Micro View: Zoomed Theme Sun + Observation Satellites
      const target = themes.find(t => t.id === zoomedThemeId);
      if (!target) return;

      const center = { x: 380, y: 260 };
      const obsList = observations
        .filter(o => o.themeId === target.id)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const newNodes: SimNode[] = [
        {
          id: `sun-${target.id}`,
          type: 'hub',
          themeId: target.id,
          label: target.title,
          obsCount: obsList.length,
          x: center.x,
          y: center.y,
          homeX: center.x,
          homeY: center.y,
          vx: 0,
          vy: 0,
          scale: 1,
          opacity: 1,
          radius: 32
        }
      ];

      obsList.forEach((obs, i) => {
        const total = Math.max(1, obsList.length);
        const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
        const homeX = center.x + Math.cos(angle) * 185;
        const homeY = center.y + Math.sin(angle) * 185;

        newNodes.push({
          id: `obs-${obs.id}`,
          type: 'obs',
          themeId: target.id,
          obsData: obs,
          orderIndex: i + 1,
          label: `Obs #${i + 1}`,
          subLabel: new Date(obs.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          x: homeX,
          y: homeY,
          homeX,
          homeY,
          vx: 0,
          vy: 0,
          scale: 1,
          opacity: 1,
          radius: 18
        });
      });

      nodesRef.current = newNodes;
      setNodes([...newNodes]);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [activeTab, zoomedThemeId, themes, observations]);

  // Liquid Physics Engine for Dragging Interaction
  const wakeLiquidPhysics = () => {
    if (animFrameRef.current || isBlooming) return;

    const center = { x: 380, y: 260 };
    const springK = 0.045;
    const damping = 0.88;

    const stepPhysics = () => {
      let maxMovement = 0;
      const currentNodes = nodesRef.current;

      for (let i = 1; i < currentNodes.length; i++) {
        const node = currentNodes[i];
        if (node.id === draggedNodeId) continue;

        let fx = 0;
        let fy = 0;

        // 1. Orbital spring toward home orbit ring
        const targetX = node.homeX ?? center.x;
        const targetY = node.homeY ?? center.y;
        const dx = node.x - center.x;
        const dy = node.y - center.y;
        const currentDist = Math.hypot(dx, dy) || 1;
        const targetDist = Math.hypot(targetX - center.x, targetY - center.y) || 175;
        const distDiff = currentDist - targetDist;
        fx -= (dx / currentDist) * distDiff * springK;
        fy -= (dy / currentDist) * distDiff * springK;

        // 2. Soft Coulomb Repulsion
        for (let j = 0; j < currentNodes.length; j++) {
          if (i === j) continue;
          const other = currentNodes[j];
          const rx = node.x - other.x;
          const ry = node.y - other.y;
          const rDist = Math.hypot(rx, ry) || 1;
          const minDist = node.radius + other.radius + 60;

          if (rDist < minDist) {
            const isDragged = other.id === draggedNodeId;
            const repStrength = (minDist - rDist) * (isDragged ? 0.28 : 0.16);
            fx += (rx / rDist) * repStrength;
            fy += (ry / rDist) * repStrength;
          }
        }

        node.vx = (node.vx + fx) * damping;
        node.vy = (node.vy + fy) * damping;
        node.x = Math.max(node.radius + 15, Math.min(745 - node.radius, node.x + node.vx));
        node.y = Math.max(node.radius + 15, Math.min(505 - node.radius, node.y + node.vy));

        const movement = Math.abs(node.vx) + Math.abs(node.vy);
        if (movement > maxMovement) maxMovement = movement;

        updateSVGElement(node);
      }

      if (maxMovement < 0.04 && !draggedNodeId) {
        // Settled into 100% stillness (0% CPU)
        animFrameRef.current = null;
        setNodes([...currentNodes]);
      } else {
        animFrameRef.current = requestAnimationFrame(stepPhysics);
      }
    };

    animFrameRef.current = requestAnimationFrame(stepPhysics);
  };

  // Pointer Drag Handlers
  const handlePointerDown = (nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    if (isBlooming) return;
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {}

    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!node || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 760;
    const y = ((e.clientY - rect.top) / rect.height) * 520;
    dragOffsetRef.current = { x: node.x - x, y: node.y - y };

    setDraggedNodeId(nodeId);
    wakeLiquidPhysics();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedNodeId || isBlooming || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 760;
    const y = ((e.clientY - rect.top) / rect.height) * 520;

    const node = nodesRef.current.find(n => n.id === draggedNodeId);
    if (node) {
      node.x = Math.max(node.radius + 15, Math.min(745 - node.radius, x + dragOffsetRef.current.x));
      node.y = Math.max(node.radius + 15, Math.min(505 - node.radius, y + dragOffsetRef.current.y));
      node.vx = 0;
      node.vy = 0;
      updateSVGElement(node);
      wakeLiquidPhysics();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggedNodeId) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {}
      const node = nodesRef.current.find(n => n.id === draggedNodeId);
      if (node) {
        node.vx = 0;
        node.vy = 0;
      }
      setDraggedNodeId(null);
      wakeLiquidPhysics();
    }
  };

  // Trigger Unpack Further with Dual-Mode Resilience Fallback
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

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.unpackResult) {
          setUnpackData(data.unpackResult);
          return;
        }
      }
      // If response not ok or backend is restarting, fall through to heuristic engine
      throw new Error('Server returned non-200 status');
    } catch {
      // Client-Side Dual-Mode Heuristic Fallback Engine
      const sortedObs = [...themeObs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const firstObs = sortedObs[0];
      const latestObs = sortedObs[sortedObs.length - 1];

      const heuristicResult: UnpackData = {
        themeId: theme.id,
        workingTitle: theme.title,
        thesis: theme.currentSynthesis || `A recurrent developmental arc spanning ${themeObs.length} reflections, reflecting evolving clarity in ${theme.title.toLowerCase()}.`,
        narrative: `Across ${themeObs.length} documented observations, this trajectory initially anchored in: "${firstObs?.observationText || 'early reflections'}" and progressed toward: "${latestObs?.observationText || 'recent insights'}". The continuity demonstrates progressive intellectual refinement and intentional focus over time.`,
        explorationPaths: [
          {
            pathTitle: "Divergence & Boundary Testing",
            description: `Examine the conditions under which ${theme.title.toLowerCase()} creates leverage versus cognitive friction.`,
            promptToExplore: `Reflecting on my recent patterns in ${theme.title.toLowerCase()}, where am I pushing boundaries, and what assumptions deserve re-testing?`
          },
          {
            pathTitle: "Longitudinal Integration",
            description: `Synthesize how lessons from ${theme.title.toLowerCase()} can anchor decisions across other personal domains.`,
            promptToExplore: `How does my progress in ${theme.title.toLowerCase()} influence my daily energy and priority allocation?`
          },
          {
            pathTitle: "Next Horizon Synthesis",
            description: `Project the next developmental milestone for this trajectory over the coming month.`,
            promptToExplore: `What would meaningful progression in ${theme.title.toLowerCase()} look like over my next 3 reflections?`
          }
        ]
      };

      setUnpackData(heuristicResult);
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
                      <div className="flex items-center justify-between text-xs text-text-muted mb-1 font-sans">
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
                      <p className="text-xs text-text-muted line-clamp-2 mt-1 leading-relaxed font-sans">
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
                    <Compass className="w-3.5 h-3.5" />
                    <span>Unpack Further</span>
                  </button>
                </div>

                {/* Rolling Synthesis */}
                <div className="bg-[#FAF9F6] border border-border-hairline/80 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-text-muted font-sans">
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
                            <div className="flex items-center justify-between text-xs text-text-muted font-sans">
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
        /* ================= MODE B: HYBRID CONCEPT GRAPH ================= */
        <div className="bg-surface border border-border-hairline rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          {/* Header & Zoom Breadcrumbs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
            {zoomedThemeId ? (
              <div className="flex items-center gap-3">
                <button
                  id="graph-back-to-constellation"
                  onClick={() => {
                    setZoomedThemeId(null);
                    setSelectedObsId(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border-hairline hover:border-accent-sage text-xs font-semibold text-accent-sage shadow-2xs transition-all cursor-pointer"
                  title="Return to Themes Constellation"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Themes Constellation</span>
                </button>
                <span className="text-xs font-medium text-text-muted font-sans">
                  Trajectory: <strong className="text-text-primary font-serif">{graphZoomedTheme?.title}</strong> ({graphZoomedObservations.length} observations)
                </span>
              </div>
            ) : (
              <div className="text-xs text-text-muted font-sans flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-accent-sage shrink-0" />
                <span>
                  <strong>Hybrid Concept Graph:</strong> Drag nodes to explore spring equilibrium. Double-click any theme node (or click Focus) to zoom into its observation trajectory.
                </span>
              </div>
            )}

            <div className="text-xs text-text-muted font-sans text-right">
              {zoomedThemeId ? (
                <span className="inline-flex items-center gap-1 text-accent-sage font-medium">
                  <TrendingUp className="w-3 h-3" />
                  Chronological Trajectory ($Obs_1 \rightarrow Obs_n$)
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{themes.length} {themes.length === 1 ? 'theme' : 'themes'} constellation</span>
                  <button
                    id="graph-rebloom-btn"
                    onClick={() => {
                      if (!isBlooming && nodesRef.current.length > 0) {
                        const center = { x: 380, y: 260 };
                        nodesRef.current.forEach(n => {
                          if (n.type === 'theme') {
                            n.x = center.x;
                            n.y = center.y;
                            n.scale = 0.35;
                            n.opacity = 0;
                            updateSVGElement(n);
                          }
                        });
                        triggerSpiralBloom(nodesRef.current);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface border border-border-hairline hover:border-accent-sage text-xs font-medium text-accent-sage transition-colors cursor-pointer"
                    title="Replay Spiral Petal Bloom"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Re-bloom</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative w-full h-[540px] bg-[#FAF9F6] border border-border-hairline rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
            {/* SVG Visual Graph */}
            <svg
              id="concept-graph-svg"
              ref={svgRef}
              viewBox="0 0 760 520"
              className="w-full h-full select-none cursor-grab active:cursor-grabbing"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <defs>
                {/* Directed Trajectory Arrowhead Marker */}
                <marker
                  id="trajectory-arrow"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3B7A57" />
                </marker>
              </defs>

              {/* 1. Edges / Springs Layer */}
              {(() => {
                const hubNode = nodes.find(n => n.type === 'hub');
                if (!hubNode) return null;

                if (!zoomedThemeId) {
                  // Macro Links: YOU hub to each Theme
                  return (
                    <g id="graph-links-macro">
                      {nodes
                        .filter(n => n.type === 'theme')
                        .map(themeNode => {
                          const isSelected = selectedTheme?.id === themeNode.themeId;
                          return (
                            <line
                              key={`link-${themeNode.id}`}
                              id={`link-${themeNode.id}`}
                              x1={hubNode.x}
                              y1={hubNode.y}
                              x2={themeNode.x}
                              y2={themeNode.y}
                              stroke={isSelected ? '#3B7A57' : '#E6E3DC'}
                              strokeWidth={isSelected ? 2 : 1.2}
                              strokeDasharray={isSelected ? 'none' : '4 4'}
                              opacity={themeNode.opacity !== undefined ? themeNode.opacity * 0.85 : 0.85}
                            />
                          );
                        })}
                    </g>
                  );
                }

                // Micro Links: Central Theme Sun to Observations + Chronological Vectors
                const obsNodes = nodes
                  .filter(n => n.type === 'obs')
                  .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

                return (
                  <g id="graph-links-micro">
                    {/* Radial lines from central Sun to observations */}
                    {obsNodes.map(obsNode => (
                      <line
                        key={`sun-link-${obsNode.id}`}
                        x1={hubNode.x}
                        y1={hubNode.y}
                        x2={obsNode.x}
                        y2={obsNode.y}
                        stroke="#E6E3DC"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        opacity={0.6}
                      />
                    ))}

                    {/* Chronological Directed Trajectory Vectors (Obs_i -> Obs_{i+1}) */}
                    {obsNodes.map((obsNode, idx) => {
                      if (idx >= obsNodes.length - 1) return null;
                      const nextNode = obsNodes[idx + 1];
                      return (
                        <g key={`traj-${obsNode.id}-${nextNode.id}`}>
                          <line
                            x1={obsNode.x}
                            y1={obsNode.y}
                            x2={nextNode.x}
                            y2={nextNode.y}
                            stroke="#3B7A57"
                            strokeWidth={2.2}
                            strokeDasharray="5 3"
                            markerEnd="url(#trajectory-arrow)"
                            opacity={0.9}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              })()}

              {/* 2. Nodes Layer */}
              {nodes.map(node => {
                const isHub = node.type === 'hub';
                const isTheme = node.type === 'theme';
                const isObs = node.type === 'obs';
                const isSelected = isTheme
                  ? selectedTheme?.id === node.themeId
                  : isObs
                  ? selectedObsId === node.obsData?.id
                  : false;
                const isDragged = draggedNodeId === node.id;

                if (isHub) {
                  return (
                    <g
                      key={node.id}
                      id={`node-group-${node.id}`}
                      className="cursor-pointer"
                      transform={`translate(${node.x}, ${node.y})`}
                    >
                      <circle cx={0} cy={0} r={node.radius + 12} fill="#3B7A57" opacity={0.12} />
                      <circle
                        cx={0}
                        cy={0}
                        r={node.radius}
                        fill="#3B7A57"
                        stroke="#2E6145"
                        strokeWidth={2}
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize={isHub && zoomedThemeId ? 9 : 10}
                        fontWeight="bold"
                        fontFamily="Inter, sans-serif"
                      >
                        {isHub && zoomedThemeId ? 'THEME' : 'YOU'}
                      </text>

                      {/* Pill Badge for Central Sun in Zoomed Mode */}
                      {zoomedThemeId && (
                        <g transform={`translate(0, ${node.radius + 6})`}>
                          <rect
                            x={-80}
                            y={0}
                            width={160}
                            height={22}
                            rx={11}
                            fill="#FFFFFF"
                            stroke="#3B7A57"
                            strokeWidth={1.5}
                          />
                          <text
                            x={0}
                            y={15}
                            textAnchor="middle"
                            fill="#232323"
                            fontSize={11}
                            fontWeight="600"
                            fontFamily="Source Serif 4, Georgia, serif"
                          >
                            {node.label.length > 20 ? `${node.label.slice(0, 18)}...` : node.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                }

                if (isTheme) {
                  return (
                    <g
                      key={node.id}
                      id={`theme-node-${node.themeId}`}
                      className="cursor-pointer select-none"
                      transform={`translate(${node.x}, ${node.y}) scale(${node.scale ?? 1})`}
                      opacity={node.opacity !== undefined ? node.opacity : 1}
                      onPointerDown={(e) => handlePointerDown(node.id, e)}
                      onClick={() => {
                        setSelectedThemeId(node.themeId!);
                        setSelectedObsId(null);
                      }}
                      onDoubleClick={() => {
                        setZoomedThemeId(node.themeId!);
                        setSelectedThemeId(node.themeId!);
                        setSelectedObsId(null);
                      }}
                    >
                      {/* Selection Ring */}
                      {isSelected && (
                        <circle
                          cx={0}
                          cy={0}
                          r={node.radius + 6}
                          fill="none"
                          stroke="#3B7A57"
                          strokeWidth={2}
                          strokeDasharray="4 3"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={0}
                        cy={0}
                        r={node.radius}
                        fill={isDragged ? '#DCEEE3' : '#FFFFFF'}
                        stroke={isSelected || isDragged ? '#3B7A57' : '#D5D0C7'}
                        strokeWidth={isSelected || isDragged ? 2.5 : 1.5}
                      />

                      {/* Observation Count inside circle */}
                      <text
                        x={0}
                        y={3}
                        textAnchor="middle"
                        fill={isSelected || isDragged ? '#3B7A57' : '#6B6B6B'}
                        fontSize={10}
                        fontWeight="600"
                        fontFamily="Inter, sans-serif"
                      >
                        {node.obsCount} obs
                      </text>

                      {/* Clean Floating 2-Line Serif Title (No Capsule Border) */}
                      <g
                        id={`theme-badge-${node.themeId}`}
                        transform={`translate(0, ${node.radius + 15})`}
                        className="pointer-events-none"
                      >
                        <text
                          textAnchor="middle"
                          fill={isSelected || isDragged ? '#3B7A57' : '#232323'}
                          stroke="#FAF9F6"
                          strokeWidth={3.5}
                          paintOrder="stroke fill"
                          strokeLinejoin="round"
                          fontSize={12}
                          fontWeight="600"
                          fontFamily="Source Serif 4, Georgia, serif"
                          style={{ textRendering: 'geometricPrecision' }}
                        >
                          <tspan x={0} y={0}>{node.line1 || node.label}</tspan>
                          {node.line2 && (
                            <tspan x={0} dy={15}>{node.line2}</tspan>
                          )}
                        </text>
                      </g>
                    </g>
                  );
                }

                // Observation Node (Micro View)
                return (
                  <g
                    key={node.id}
                    id={`obs-node-${node.obsData?.id}`}
                    className="cursor-pointer select-none"
                    transform={`translate(${node.x}, ${node.y}) scale(${node.scale ?? 1})`}
                    opacity={node.opacity !== undefined ? node.opacity : 1}
                    onPointerDown={(e) => handlePointerDown(node.id, e)}
                    onClick={() => setSelectedObsId(node.obsData?.id || null)}
                  >
                    {/* Selection Ring */}
                    {isSelected && (
                      <circle
                        cx={0}
                        cy={0}
                        r={node.radius + 6}
                        fill="none"
                        stroke="#3B7A57"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Satellite Observation Circle */}
                    <circle
                      cx={0}
                      cy={0}
                      r={node.radius}
                      fill={isSelected ? '#DCEEE3' : '#FFFFFF'}
                      stroke={isSelected ? '#3B7A57' : '#D5D0C7'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />

                    {/* Sequence Badge (#1, #2, #3...) */}
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill="#3B7A57"
                      fontSize={11}
                      fontWeight="bold"
                      fontFamily="Inter, sans-serif"
                    >
                      #{node.orderIndex}
                    </text>

                    {/* Date Pill Underneath */}
                    <g transform={`translate(0, ${node.radius + 5})`} className="pointer-events-none">
                      <rect
                        x={-36}
                        y={0}
                        width={72}
                        height={18}
                        rx={9}
                        fill="#FFFFFF"
                        stroke={isSelected ? '#3B7A57' : '#E6E3DC'}
                        strokeWidth={1}
                      />
                      <text
                        x={0}
                        y={13}
                        textAnchor="middle"
                        fill="#6B6B6B"
                        fontSize={10}
                        fontFamily="Inter, sans-serif"
                      >
                        {node.subLabel}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Floating Drawer: Theme or Observation Details */}
            {zoomedThemeId && selectedObs ? (
              /* Observation Dossier Card (Micro View) */
              <div className="absolute bottom-4 right-4 max-w-sm w-[calc(100%-2rem)] sm:w-80 bg-surface/95 backdrop-blur-md border border-border-hairline rounded-2xl p-4 shadow-lg space-y-3 animate-slide-up">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-accent-sage bg-accent-sage-tint px-2.5 py-0.5 rounded-full font-sans">
                    Observation #{graphZoomedObservations.findIndex(o => o.id === selectedObs.id) + 1} of {graphZoomedObservations.length}
                  </span>
                  <button
                    onClick={() => setSelectedObsId(null)}
                    className="p-1 text-text-muted hover:text-text-primary rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-text-muted font-sans flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent-sage" />
                  <span>{formatDate(selectedObs.timestamp)}</span>
                  {selectedObs.locationSnapshot && (
                    <>
                      <span>&middot;</span>
                      <span className="inline-flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-accent-sage" />
                        <span>{selectedObs.locationSnapshot}</span>
                      </span>
                    </>
                  )}
                </div>

                <p className="font-serif text-sm text-text-primary italic leading-relaxed bg-[#FAF9F6] p-3 rounded-xl border border-border-hairline/60">
                  "{selectedObs.observationText}"
                </p>

                {(() => {
                  const parentEntry = entryMap.get(selectedObs.entryId);
                  if (!parentEntry) return null;
                  return (
                    <button
                      onClick={() => onSelectEntry(parentEntry)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-accent-sage text-white text-xs font-semibold hover:bg-[#2E6145] transition-all cursor-pointer"
                    >
                      <span>Jump to Reflection Session</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  );
                })()}
              </div>
            ) : selectedTheme ? (
              /* Theme Dossier Card (Macro View) */
              <div className="absolute bottom-4 right-4 max-w-sm w-[calc(100%-2rem)] sm:w-80 bg-surface/95 backdrop-blur-md border border-border-hairline rounded-2xl p-4 shadow-lg space-y-2.5 animate-slide-up">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-accent-sage bg-accent-sage-tint px-2.5 py-0.5 rounded-full font-sans">
                    {selectedTheme.observationCount} observations
                  </span>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className="text-xs text-accent-sage font-medium hover:underline font-sans inline-flex items-center gap-0.5"
                  >
                    <span>View Timeline</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <h4 className="font-serif text-base font-semibold text-text-primary leading-snug">
                  {selectedTheme.title}
                </h4>
                <p className="text-xs text-text-muted line-clamp-3 leading-relaxed font-sans">
                  {selectedTheme.currentSynthesis}
                </p>
                <div className="pt-2 space-y-2">
                  <button
                    id="graph-focus-trajectory-btn"
                    onClick={() => {
                      setZoomedThemeId(selectedTheme.id);
                      setSelectedObsId(null);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-surface border border-border-hairline hover:border-accent-sage text-accent-sage text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Focus Trajectory &amp; Observations</span>
                  </button>

                  <button
                    onClick={() => handleUnpackTheme(selectedTheme)}
                    disabled={(selectedTheme.observationCount || 0) < 2}
                    className="w-full py-2 px-3 rounded-xl bg-accent-sage text-white text-xs font-semibold hover:bg-[#2E6145] transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    Unpack Longitudinal Trajectory
                  </button>
                </div>
              </div>
            ) : null}
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
                <span className="text-xs uppercase tracking-wider font-semibold text-accent-sage font-sans flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
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
                <div className="bg-surface border border-border-hairline p-4 rounded-xl shadow-2xs space-y-1">
                  <span className="text-xs uppercase tracking-wider font-semibold text-accent-sage block mb-1">
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
                  <div className="prose prose-sm text-xs sm:text-sm text-text-primary leading-relaxed font-sans space-y-2">
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
