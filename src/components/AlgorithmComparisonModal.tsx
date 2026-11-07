import React from 'react';
import {
  X,
  GitCompare,
  Trophy,
  Zap,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AlgorithmResult, AlgorithmType } from '../types/graph';
import { AdjacencyListGraph } from '../utils/dataStructures';

interface AlgorithmComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: Record<AlgorithmType, AlgorithmResult> | null;
  graph: AdjacencyListGraph;
  startNodeId: string;
  endNodeId: string;
}

const ALGO_METADATA: Record<
  AlgorithmType,
  { name: string; complexity: string; optimality: string; dataStructure: string }
> = {
  dijkstra: {
    name: "Dijkstra's Shortest Path",
    complexity: 'O((V + E) log V)',
    optimality: 'Guaranteed Optimal for non-negative weights',
    dataStructure: 'Min-Heap Priority Queue + Adjacency List',
  },
  astar: {
    name: 'A* Heuristic Search',
    complexity: 'O(E) best, O(V log V) worst',
    optimality: 'Guaranteed Optimal with admissible heuristic',
    dataStructure: 'Min-Heap Priority Queue with f(n) = g(n) + h(n)',
  },
  bfs: {
    name: 'Breadth-First Search (BFS)',
    complexity: 'O(V + E)',
    optimality: 'Optimal for unweighted (minimum edge hops)',
    dataStructure: 'FIFO Queue Array',
  },
  dfs: {
    name: 'Depth-First Search (DFS)',
    complexity: 'O(V + E)',
    optimality: 'Not guaranteed optimal (exploratory)',
    dataStructure: 'LIFO Stack Array',
  },
};

export const AlgorithmComparisonModal: React.FC<AlgorithmComparisonModalProps> = ({
  isOpen,
  onClose,
  results,
  graph,
  startNodeId,
  endNodeId,
}) => {
  if (!isOpen || !results) return null;

  const startNode = graph.getNode(startNodeId);
  const endNode = graph.getNode(endNodeId);

  // Find shortest distance across results
  const minDistance = Math.min(
    ...Object.values(results)
      .filter((r) => r.success)
      .map((r) => r.totalDistance)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Algorithm Comparison & Benchmarking
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Route from <span className="font-semibold text-slate-700 dark:text-slate-200">{startNode?.name}</span> to{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{endNode?.name}</span>
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

        {/* Content Table */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="p-3.5 font-semibold">Algorithm</th>
                  <th className="p-3.5 font-semibold">Total Distance</th>
                  <th className="p-3.5 font-semibold">Nodes Visited</th>
                  <th className="p-3.5 font-semibold">Execution Steps</th>
                  <th className="p-3.5 font-semibold">Peak Queue Size</th>
                  <th className="p-3.5 font-semibold">Optimality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {(Object.keys(results) as AlgorithmType[]).map((algoKey) => {
                  const res = results[algoKey];
                  const meta = ALGO_METADATA[algoKey];
                  const isOptimalDistance = res.totalDistance === minDistance;
                  const isFewestVisited =
                    res.nodesVisitedCount ===
                    Math.min(...Object.values(results).map((r) => r.nodesVisitedCount));

                  return (
                    <tr
                      key={algoKey}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{meta.name}</span>
                          {algoKey === 'astar' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                              Heuristic
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {meta.dataStructure}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono tabular-nums">
                        <span
                          className={`text-sm font-bold ${
                            isOptimalDistance
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {res.totalDistance}m
                        </span>
                        {isOptimalDistance && (
                          <span className="ml-1.5 text-[10px] font-sans font-semibold text-emerald-600 dark:text-emerald-400">
                            (Shortest)
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {res.nodesVisitedCount}
                          </span>
                          {isFewestVisited && (
                            <span className="text-[10px] font-sans text-blue-600 dark:text-blue-400 font-semibold">
                              (Most focused)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {res.totalSteps}
                      </td>

                      <td className="p-3.5 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {res.peakQueueSize}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                            isOptimalDistance
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {isOptimalDistance ? <CheckCircle className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
                          <span>{isOptimalDistance ? 'Optimal Shortest' : 'Suboptimal / Exploratory'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Educational Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Why A* vs Dijkstra?</span>
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Both Dijkstra and A* produce the guaranteed optimal shortest route. However, A* uses Euclidean distance to the goal as an admissible heuristic $h(n)$, pruning irrelevant exploration in the opposite direction and visiting fewer total nodes.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>BFS vs DFS in Navigation</span>
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Breadth-First Search (BFS) minimizes the number of transfer segments/hops without accounting for physical distances. Depth-First Search (DFS) follows branches to the end, demonstrating how greedy exploration diverges from true distance optimality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
