import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sliders,
  Database,
  Network,
  ListTree,
  TableProperties,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  AlgorithmResult,
  AlgorithmStep,
  GraphNode,
} from '../types/graph';
import { AdjacencyListGraph } from '../utils/dataStructures';

interface DataStructuresInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  algorithmResult: AlgorithmResult | null;
  graph: AdjacencyListGraph;
  currentStepIndex: number;
  onSelectStepIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const DataStructuresInspector: React.FC<DataStructuresInspectorProps> = ({
  isOpen,
  onClose,
  algorithmResult,
  graph,
  currentStepIndex,
  onSelectStepIndex,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5x, 1x, 2x
  const [activeTab, setActiveTab] = useState<'heap' | 'adjacency' | 'hashmap' | 'arrays'>('heap');

  const steps = algorithmResult?.steps || [];
  const totalSteps = steps.length;
  const currentStep: AlgorithmStep | undefined = steps[currentStepIndex];

  // Auto-play stepper
  useEffect(() => {
    if (!isPlaying || totalSteps <= 1) return;

    const intervalMs = Math.round(1200 / playbackSpeed);
    const timer = setInterval(() => {
      onSelectStepIndex((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, totalSteps, playbackSpeed, onSelectStepIndex]);

  if (!isOpen || !algorithmResult) return null;

  const nodeMap = graph.nodes;
  const allNodes = graph.getAllNodes();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Data Structures & Execution Stepper</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                  {algorithmResult.algorithm.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live inspection of Graph (Adjacency List), Priority Queue (Min Heap), HashMap, and Arrays
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playback & Step Controls Bar */}
        <div className="px-6 py-3.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsPlaying(false);
                onSelectStepIndex(0);
              }}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              title="First Step"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                onSelectStepIndex(Math.max(0, currentStepIndex - 1));
              }}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              title="Step Backward"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                onSelectStepIndex(Math.min(totalSteps - 1, currentStepIndex + 1));
              }}
              disabled={currentStepIndex >= totalSteps - 1}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              title="Step Forward"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Playback speed selector */}
            <div className="flex items-center gap-1 ml-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5 text-[11px] font-mono">
              {[0.5, 1, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded ${
                    playbackSpeed === speed
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Timeline slider & index display */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className="text-xs font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Step {currentStepIndex + 1} / {totalSteps}
            </span>
            <input
              type="range"
              min="0"
              max={totalSteps - 1}
              value={currentStepIndex}
              onChange={(e) => {
                setIsPlaying(false);
                onSelectStepIndex(Number(e.target.value));
              }}
              className="w-full accent-blue-600 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Step Explanation Banner */}
        <div className="px-6 py-3 bg-blue-50/70 dark:bg-blue-950/20 border-b border-blue-200/50 dark:border-blue-900/30 flex items-start gap-2.5">
          <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
          <p className="text-xs font-medium text-slate-800 dark:text-blue-100 leading-relaxed">
            {currentStep?.explanation || 'Executing algorithm...'}
          </p>
        </div>

        {/* Data Structure Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('heap')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs transition-colors ${
              activeTab === 'heap'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ListTree className="w-4 h-4" />
            <span>Priority Queue (Min Heap) [{currentStep?.queueItems?.length || 0}]</span>
          </button>

          <button
            onClick={() => setActiveTab('hashmap')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs transition-colors ${
              activeTab === 'hashmap'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>HashMap (Distances & Parents)</span>
          </button>

          <button
            onClick={() => setActiveTab('adjacency')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs transition-colors ${
              activeTab === 'adjacency'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Graph (Adjacency List)</span>
          </button>

          <button
            onClick={() => setActiveTab('arrays')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold text-xs transition-colors ${
              activeTab === 'arrays'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>Arrays (Visited & Path)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[480px]">
          {/* TAB 1: PRIORITY QUEUE (MIN HEAP) */}
          {activeTab === 'heap' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Binary Min-Heap array state. Root element at index 0 has the lowest priority value.
                </span>
                <span className="font-mono">Peak size: {algorithmResult.peakQueueSize}</span>
              </div>

              {(!currentStep?.queueItems || currentStep.queueItems.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  Priority Queue is empty at this step.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {currentStep.queueItems.map((item, idx) => {
                    const node = nodeMap.get(item.id);
                    const isRoot = idx === 0;
                    return (
                      <div
                        key={`heap-item-${item.id}-${idx}`}
                        className={`p-3 rounded-xl border transition-all ${
                          isRoot
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                            Index [{idx}] {isRoot && '· Root (Min)'}
                          </span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            P: {item.priority}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {node?.name || item.id}
                        </p>
                        {item.gScore !== undefined && (
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                            <span>g: {item.gScore}m</span>
                            <span>·</span>
                            <span>h: {item.hScore}m</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HASHMAP (DISTANCES & PARENT POINTERS) */}
          {activeTab === 'hashmap' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                HashMap key-value mappings for each node. Distances update as shorter paths are relaxed.
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <tr>
                      <th className="p-3 font-semibold">Node Key</th>
                      <th className="p-3 font-semibold">Building Code</th>
                      <th className="p-3 font-semibold">Distance Value (meters)</th>
                      <th className="p-3 font-semibold">Parent / Predecessor</th>
                      <th className="p-3 font-semibold">Settled Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {allNodes.map((node) => {
                      const dist = currentStep?.distances?.[node.id];
                      const parentId = currentStep?.parentMap?.[node.id];
                      const parentNode = parentId ? nodeMap.get(parentId) : null;
                      const isVisited = currentStep?.visited?.includes(node.id);
                      const isCurrent = currentStep?.currentNodeId === node.id;

                      return (
                        <tr
                          key={`hashmap-${node.id}`}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 font-mono ${
                            isCurrent
                              ? 'bg-amber-50 dark:bg-amber-950/20 font-semibold'
                              : isVisited
                              ? 'bg-slate-50/30 dark:bg-slate-800/10'
                              : ''
                          }`}
                        >
                          <td className="p-3 font-sans font-medium text-slate-900 dark:text-white">
                            {node.name}
                          </td>
                          <td className="p-3 text-slate-500">{node.buildingCode || '-'}</td>
                          <td className="p-3 font-bold tabular-nums">
                            {dist === Infinity ? (
                              <span className="text-slate-400">∞ (Unreached)</span>
                            ) : (
                              <span className="text-blue-600 dark:text-blue-400">{dist}m</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">
                            {parentNode ? `${parentNode.name}` : parentId === null && dist === 0 ? 'Start (Self)' : 'None'}
                          </td>
                          <td className="p-3">
                            {isVisited ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-sans font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Visited</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px] font-sans">Unvisited</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: GRAPH (ADJACENCY LIST) */}
          {activeTab === 'adjacency' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Adjacency List representing the directed / undirected graph connectivity.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allNodes.map((node) => {
                  const neighbors = graph.getNeighbors(node.id);
                  return (
                    <div
                      key={`adj-${node.id}`}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {node.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Degree: {neighbors.length}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {neighbors.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">No connections</span>
                        ) : (
                          neighbors.map((n, i) => {
                            const target = nodeMap.get(n.nodeId);
                            return (
                              <div
                                key={`adj-${node.id}-${n.nodeId}-${i}`}
                                className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60"
                              >
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                                  → {target?.name || n.nodeId}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 shrink-0">
                                  <span>{n.distance}m</span>
                                  <span>·</span>
                                  <span className="capitalize">{n.edge.type}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ARRAYS (VISITED SEQUENCE & PATH) */}
          {activeTab === 'arrays' && (
            <div className="space-y-6">
              {/* Visited Sequence Array */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Visited / Settled Order Array ({currentStep?.visited?.length || 0} nodes)
                </span>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl">
                  {(!currentStep?.visited || currentStep.visited.length === 0) ? (
                    <span className="text-xs text-slate-400 italic">No nodes settled yet.</span>
                  ) : (
                    currentStep.visited.map((nodeId, idx) => {
                      const node = nodeMap.get(nodeId);
                      return (
                        <div
                          key={`visited-arr-${nodeId}-${idx}`}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs"
                        >
                          <span className="font-mono text-slate-400 text-[10px]">#{idx + 1}</span>
                          <span>{node?.name || nodeId}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Current Active Path Array */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Reconstructed Path Array [{currentStep?.activePath?.length || 0} nodes]
                </span>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 rounded-xl">
                  {(!currentStep?.activePath || currentStep.activePath.length === 0) ? (
                    <span className="text-xs text-slate-400 italic">No path reconstructed yet.</span>
                  ) : (
                    currentStep.activePath.map((nodeId, idx) => {
                      const node = nodeMap.get(nodeId);
                      const isLast = idx === (currentStep.activePath?.length || 0) - 1;
                      return (
                        <React.Fragment key={`path-arr-${nodeId}-${idx}`}>
                          <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300 shadow-xs">
                            {node?.name || nodeId}
                          </div>
                          {!isLast && <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
