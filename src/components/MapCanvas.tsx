import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Compass,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Coffee,
  Home,
  GraduationCap,
  HeartPulse,
  Sparkles,
  Trophy,
  Trees,
  Briefcase,
  Layers,
} from 'lucide-react';
import {
  AlgorithmStep,
  GraphEdge,
  GraphNode,
  NodeCategory,
  TravelMode,
} from '../types/graph';

interface MapCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startNodeId: string;
  endNodeId: string;
  onSelectStartNode: (id: string) => void;
  onSelectEndNode: (id: string) => void;
  shortestPath: string[];
  activeStep?: AlgorithmStep | null;
  travelMode: TravelMode;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  isEditMode: boolean;
  onNodeDragEnd: (nodeId: string, newX: number, newY: number) => void;
  onConnectNodes?: (fromId: string, toId: string) => void;
  presetCategory: 'campus' | 'city';
}

// Icon helper by category
const getCategoryIcon = (category: NodeCategory) => {
  switch (category) {
    case 'library':
      return <BookOpen className="w-4 h-4" />;
    case 'dining':
      return <Coffee className="w-4 h-4" />;
    case 'residential':
      return <Home className="w-4 h-4" />;
    case 'academic':
      return <GraduationCap className="w-4 h-4" />;
    case 'medical':
      return <HeartPulse className="w-4 h-4" />;
    case 'athletics':
      return <Trophy className="w-4 h-4" />;
    case 'recreation':
      return <Trees className="w-4 h-4" />;
    case 'commercial':
    case 'civic':
      return <Briefcase className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: NodeCategory) => {
  switch (category) {
    case 'academic':
      return 'bg-blue-500 text-white border-blue-400';
    case 'library':
      return 'bg-indigo-500 text-white border-indigo-400';
    case 'residential':
      return 'bg-amber-500 text-white border-amber-400';
    case 'dining':
      return 'bg-orange-500 text-white border-orange-400';
    case 'medical':
      return 'bg-rose-500 text-white border-rose-400';
    case 'athletics':
      return 'bg-emerald-500 text-white border-emerald-400';
    case 'transit':
      return 'bg-sky-500 text-white border-sky-400';
    case 'recreation':
      return 'bg-teal-500 text-white border-teal-400';
    default:
      return 'bg-slate-600 text-white border-slate-500';
  }
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  nodes,
  edges,
  startNodeId,
  endNodeId,
  onSelectStartNode,
  onSelectEndNode,
  shortestPath,
  activeStep,
  travelMode,
  isSimulating,
  onToggleSimulation,
  isEditMode,
  onNodeDragEnd,
  presetCategory,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Pan and Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Hovered & Selected Node
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Simulation traveler animation position
  const [simProgress, setSimProgress] = useState(0); // 0 to 1 along path

  // Map node lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Set of edge segments on the shortest path
  const shortestEdgeKeys = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < shortestPath.length - 1; i++) {
      const u = shortestPath[i];
      const v = shortestPath[i + 1];
      set.add(`${u}-${v}`);
      set.add(`${v}-${u}`);
    }
    return set;
  }, [shortestPath]);

  // Active step highlights
  const stepVisitedSet = useMemo(() => new Set(activeStep?.visited || []), [activeStep]);
  const stepQueueSet = useMemo(() => new Set(activeStep?.inQueue || []), [activeStep]);
  const stepCurrentNodeId = activeStep?.currentNodeId;
  const stepNeighborId = activeStep?.neighborNodeId;

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggedNodeId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - pan.y) / zoom;
      const clampedX = Math.max(40, Math.min(1060, rawX - dragOffset.x));
      const clampedY = Math.max(40, Math.min(660, rawY - dragOffset.y));
      onNodeDragEnd(draggedNodeId, Math.round(clampedX), Math.round(clampedY));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.max(0.6, Math.min(2.5, prev * zoomFactor)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Node drag start in Edit Mode
  const handleNodeMouseDown = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    if (isEditMode) {
      setDraggedNodeId(node.id);
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const cursorX = (e.clientX - rect.left - pan.x) / zoom;
        const cursorY = (e.clientY - rect.top - pan.y) / zoom;
        setDragOffset({ x: cursorX - node.x, y: cursorY - node.y });
      }
    }
  };

  // Node click: Set Start or Destination
  const handleNodeClick = (nodeId: string) => {
    if (draggedNodeId) return;

    if (!startNodeId || (startNodeId && endNodeId)) {
      onSelectStartNode(nodeId);
    } else if (startNodeId === nodeId) {
      // Clicked same node, keep start
    } else {
      onSelectEndNode(nodeId);
    }
  };

  // Traveler animation along shortest path
  useEffect(() => {
    if (!isSimulating || shortestPath.length < 2) {
      setSimProgress(0);
      return;
    }

    let animationFrameId: number;
    let startTime: number | null = null;
    const duration = Math.max(3000, shortestPath.length * 1200); // smooth journey duration

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      setSimProgress(progress);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Loop or finish
        setTimeout(() => {
          if (isSimulating) {
            startTime = null;
            animationFrameId = requestAnimationFrame(animate);
          }
        }, 1200);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSimulating, shortestPath]);

  // Compute traveler current position along multi-segment path
  const travelerCoord = useMemo(() => {
    if (shortestPath.length < 2) return null;

    const totalSegments = shortestPath.length - 1;
    const currentSegmentIndex = Math.min(
      totalSegments - 1,
      Math.floor(simProgress * totalSegments)
    );
    const segmentProgress = (simProgress * totalSegments) - currentSegmentIndex;

    const fromNode = nodeMap.get(shortestPath[currentSegmentIndex]);
    const toNode = nodeMap.get(shortestPath[currentSegmentIndex + 1]);

    if (!fromNode || !toNode) return null;

    const x = fromNode.x + (toNode.x - fromNode.x) * segmentProgress;
    const y = fromNode.y + (toNode.y - fromNode.y) * segmentProgress;
    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x) * (180 / Math.PI);

    return { x, y, angle };
  }, [simProgress, shortestPath, nodeMap]);

  return (
    <div
      className="relative w-full h-full min-h-[580px] bg-slate-900 overflow-hidden select-none cursor-grab active:cursor-grabbing border border-slate-800 rounded-2xl shadow-inner"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* HUD Overlay: Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 shadow-lg">
        <span className="font-semibold text-white">
          {presetCategory === 'campus' ? '🎓 Campus Map' : '🏙️ Downtown Grid'}
        </span>
        <span className="text-slate-600">·</span>
        <span>{nodes.length} Locations</span>
        <span className="text-slate-600">·</span>
        <span>{edges.length} Edges</span>
        {isEditMode && (
          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Drag Nodes Mode
          </span>
        )}
      </div>

      {/* Floating Zoom & Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        {shortestPath.length > 1 && (
          <button
            onClick={onToggleSimulation}
            className={`p-2 rounded-lg transition-all ${
              isSimulating
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={isSimulating ? 'Pause Journey' : 'Simulate Traveler Movement'}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30" />
          <span>Source</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
          <span>Destination</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400" />
          <span>Shortest Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 border-t border-dashed border-slate-500" />
          <span>Walk / Bike Path</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox="0 0 1100 700"
        className="w-full h-full pointer-events-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
            />
          </pattern>

          {/* Glowing filter for shortest path */}
          <filter id="glow-path" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <linearGradient id="relaxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Background Grid */}
          <rect width="1100" height="700" fill="#090d16" />
          <rect width="1100" height="700" fill="url(#grid-pattern)" />

          {/* Aesthetic environmental shapes */}
          {presetCategory === 'campus' ? (
            <g className="opacity-25 pointer-events-none">
              {/* Campus Quad Lawn */}
              <path
                d="M 420 380 Q 560 320 620 440 Q 580 560 460 520 Z"
                fill="#064e3b"
                stroke="#047857"
                strokeWidth="1.5"
              />
              {/* Campus Water Pond */}
              <ellipse cx="880" cy="270" rx="60" ry="38" fill="#0c4a6e" stroke="#0284c7" strokeWidth="1" />
              {/* North Quad Gardens */}
              <circle cx="280" cy="180" r="45" fill="#064e3b" opacity="0.6" />
            </g>
          ) : (
            <g className="opacity-25 pointer-events-none">
              {/* River promenade */}
              <path
                d="M 0 620 Q 300 590 600 630 T 1100 600"
                fill="none"
                stroke="#0284c7"
                strokeWidth="36"
                strokeLinecap="round"
              />
              <path
                d="M 0 620 Q 300 590 600 630 T 1100 600"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeDasharray="8 6"
              />
            </g>
          )}

          {/* EDGES LAYER */}
          <g className="edges-group">
            {edges.map((edge) => {
              const u = nodeMap.get(edge.from);
              const v = nodeMap.get(edge.to);
              if (!u || !v) return null;

              const isShortestPath =
                shortestEdgeKeys.has(`${edge.from}-${edge.to}`) ||
                shortestEdgeKeys.has(`${edge.to}-${edge.from}`);

              const isExaminedInStep =
                activeStep &&
                ((stepCurrentNodeId === edge.from && stepNeighborId === edge.to) ||
                  (stepCurrentNodeId === edge.to && stepNeighborId === edge.from));

              // Edge styling
              let strokeColor = '#334155';
              let strokeDasharray = 'none';
              let strokeWidth = 2.5;

              if (edge.type === 'walkway') {
                strokeDasharray = '4 4';
                strokeColor = '#475569';
                strokeWidth = 2;
              } else if (edge.type === 'bikelane') {
                strokeDasharray = '6 3';
                strokeColor = '#059669';
                strokeWidth = 2.5;
              } else if (edge.type === 'transit_route') {
                strokeDasharray = '8 4';
                strokeColor = '#0284c7';
                strokeWidth = 3;
              } else {
                strokeColor = '#475569';
                strokeWidth = 3;
              }

              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;

              return (
                <g key={edge.id} className="transition-all duration-200">
                  {/* Base edge line */}
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                  />

                  {/* Active relaxing animation during step playback */}
                  {isExaminedInStep && (
                    <line
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke="url(#relaxGradient)"
                      strokeWidth={4.5}
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                  )}

                  {/* Distance label pill on edge */}
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    className="pointer-events-none select-none opacity-80 hover:opacity-100"
                  >
                    <rect
                      x="-20"
                      y="-9"
                      width="40"
                      height="18"
                      rx="9"
                      fill="#0f172a"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="500"
                    >
                      {edge.distance}m
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* HIGHLIGHTED SHORTEST PATH OVERLAY */}
          {shortestPath.length > 1 && (
            <g className="shortest-path-group" filter="url(#glow-path)">
              {/* Outer soft glow */}
              {shortestPath.map((nodeId, idx) => {
                if (idx === shortestPath.length - 1) return null;
                const u = nodeMap.get(nodeId);
                const v = nodeMap.get(shortestPath[idx + 1]);
                if (!u || !v) return null;

                return (
                  <line
                    key={`glow-${nodeId}-${v.id}`}
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#38bdf8"
                    strokeWidth="8"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Core animated gradient line */}
              {shortestPath.map((nodeId, idx) => {
                if (idx === shortestPath.length - 1) return null;
                const u = nodeMap.get(nodeId);
                const v = nodeMap.get(shortestPath[idx + 1]);
                if (!u || !v) return null;

                return (
                  <g key={`core-${nodeId}-${v.id}`}>
                    <line
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke="url(#pathGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    {/* Marching ants effect */}
                    <line
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeDasharray="6 8"
                      strokeLinecap="round"
                      className="animate-dash"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* SIMULATED TRAVELER MARKER */}
          {travelerCoord && (
            <g
              transform={`translate(${travelerCoord.x}, ${travelerCoord.y})`}
              className="pointer-events-none transition-transform duration-75"
            >
              {/* Radiating beacon pulse */}
              <circle r="18" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
              <circle r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" />
              <g transform={`rotate(${travelerCoord.angle})`}>
                <polygon points="6,0 -4,-5 -2,0 -4,5" fill="#ffffff" />
              </g>
            </g>
          )}

          {/* NODES LAYER */}
          <g className="nodes-group">
            {nodes.map((node) => {
              const isStart = node.id === startNodeId;
              const isEnd = node.id === endNodeId;
              const isCurrentStep = stepCurrentNodeId === node.id;
              const isInQueue = stepQueueSet.has(node.id);
              const isVisited = stepVisitedSet.has(node.id);
              const isOnShortestPath = shortestPath.includes(node.id);
              const isHovered = hoveredNodeId === node.id;

              const distanceSoFar = activeStep?.distances?.[node.id];

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-transform duration-150"
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onClick={() => handleNodeClick(node.id)}
                >
                  {/* Outer status halos */}
                  {isStart && (
                    <circle
                      r="26"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      className="animate-spin-slow opacity-80"
                    />
                  )}

                  {isEnd && (
                    <circle
                      r="26"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      className="animate-spin-slow opacity-80"
                    />
                  )}

                  {isCurrentStep && (
                    <circle
                      r="24"
                      fill="rgba(245, 158, 11, 0.25)"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      className="animate-pulse"
                    />
                  )}

                  {isInQueue && !isCurrentStep && !isStart && !isEnd && (
                    <circle
                      r="22"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      className="animate-pulse opacity-90"
                    />
                  )}

                  {/* Core Node Circle */}
                  <circle
                    r={isHovered || isStart || isEnd ? 18 : 15}
                    fill={
                      isStart
                        ? '#059669'
                        : isEnd
                        ? '#e11d48'
                        : isOnShortestPath
                        ? '#2563eb'
                        : isVisited
                        ? '#1e293b'
                        : '#0f172a'
                    }
                    stroke={
                      isStart
                        ? '#6ee7b7'
                        : isEnd
                        ? '#fda4af'
                        : isOnShortestPath
                        ? '#60a5fa'
                        : isVisited
                        ? '#475569'
                        : '#334155'
                    }
                    strokeWidth={isHovered ? 2.5 : 1.8}
                    className="transition-all duration-150 shadow-md"
                  />

                  {/* Icon or Building code text */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill="#ffffff"
                    fontSize={node.buildingCode ? '9' : '10'}
                    fontWeight="600"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    className="pointer-events-none select-none"
                  >
                    {node.buildingCode || node.name.slice(0, 2).toUpperCase()}
                  </text>

                  {/* Label under node */}
                  <text
                    y="27"
                    textAnchor="middle"
                    fill={isStart ? '#34d399' : isEnd ? '#fb7185' : '#cbd5e1'}
                    fontSize="11"
                    fontWeight={isStart || isEnd || isHovered ? '700' : '500'}
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    className="pointer-events-none select-none drop-shadow-md"
                  >
                    {node.name}
                  </text>

                  {/* Distance badge if algorithm is inspecting */}
                  {distanceSoFar !== undefined && distanceSoFar !== Infinity && (
                    <g transform="translate(0, -22)" className="pointer-events-none">
                      <rect
                        x="-18"
                        y="-8"
                        width="36"
                        height="16"
                        rx="8"
                        fill="#0284c7"
                        stroke="#38bdf8"
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        dy="3.5"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="600"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {distanceSoFar}m
                      </text>
                    </g>
                  )}

                  {/* Role indicator badge for Start/End */}
                  {isStart && (
                    <g transform="translate(0, -24)" className="pointer-events-none">
                      <rect
                        x="-20"
                        y="-8"
                        width="40"
                        height="15"
                        rx="4"
                        fill="#059669"
                        stroke="#6ee7b7"
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        dy="3"
                        fill="#ffffff"
                        fontSize="8"
                        fontWeight="700"
                        letterSpacing="0.5"
                      >
                        START
                      </text>
                    </g>
                  )}

                  {isEnd && (
                    <g transform="translate(0, -24)" className="pointer-events-none">
                      <rect
                        x="-22"
                        y="-8"
                        width="44"
                        height="15"
                        rx="4"
                        fill="#e11d48"
                        stroke="#fda4af"
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        dy="3"
                        fill="#ffffff"
                        fontSize="8"
                        fontWeight="700"
                        letterSpacing="0.5"
                      >
                        DESTINATION
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
};
