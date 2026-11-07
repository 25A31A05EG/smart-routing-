import React from 'react';
import {
  Navigation,
  ArrowRightLeft,
  Footprints,
  Bike,
  Bus,
  Car,
  Clock,
  DollarSign,
  Flame,
  Leaf,
  Layers,
  ChevronRight,
  Play,
  Pause,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import {
  AlgorithmType,
  GraphNode,
  RouteCostSummary,
  TravelMode,
  TurnInstruction,
} from '../types/graph';

interface NavigationSidebarProps {
  nodes: GraphNode[];
  startNodeId: string;
  endNodeId: string;
  onSelectStartNode: (id: string) => void;
  onSelectEndNode: (id: string) => void;
  onSwapNodes: () => void;
  travelMode: TravelMode;
  onChangeTravelMode: (mode: TravelMode) => void;
  selectedAlgorithm: AlgorithmType;
  onChangeAlgorithm: (algo: AlgorithmType) => void;
  isStudentPass: boolean;
  onToggleStudentPass: () => void;
  routeCost: RouteCostSummary | null;
  turnInstructions: TurnInstruction[];
  onCalculateRoute: () => void;
  onOpenInspector: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  hasCalculatedRoute: boolean;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  nodes,
  startNodeId,
  endNodeId,
  onSelectStartNode,
  onSelectEndNode,
  onSwapNodes,
  travelMode,
  onChangeTravelMode,
  selectedAlgorithm,
  onChangeAlgorithm,
  isStudentPass,
  onToggleStudentPass,
  routeCost,
  turnInstructions,
  onCalculateRoute,
  onOpenInspector,
  isSimulating,
  onToggleSimulation,
  hasCalculatedRoute,
}) => {
  return (
    <aside className="w-full lg:w-[420px] shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-5 shadow-sm overflow-y-auto max-h-[calc(100vh-100px)]">
      {/* Route Inputs Card */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            Route Planner
          </span>
          <button
            onClick={onSwapNodes}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            title="Swap source and destination"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>
        </div>

        {/* Source selector */}
        <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Start Location
            </label>
            <select
              value={startNodeId}
              onChange={(e) => onSelectStartNode(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none truncate cursor-pointer"
            >
              <option value="" disabled className="dark:bg-slate-800">
                Choose start location...
              </option>
              {nodes.map((node) => (
                <option key={`start-${node.id}`} value={node.id} className="dark:bg-slate-800">
                  {node.name} {node.buildingCode ? `(${node.buildingCode})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Destination selector */}
        <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl">
          <div className="w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20 shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Destination Location
            </label>
            <select
              value={endNodeId}
              onChange={(e) => onSelectEndNode(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none truncate cursor-pointer"
            >
              <option value="" disabled className="dark:bg-slate-800">
                Choose destination...
              </option>
              {nodes.map((node) => (
                <option key={`end-${node.id}`} value={node.id} className="dark:bg-slate-800">
                  {node.name} {node.buildingCode ? `(${node.buildingCode})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Travel Mode Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
          Travel Mode
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => onChangeTravelMode('walking')}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all ${
              travelMode === 'walking'
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Footprints className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-semibold leading-tight">Walk</span>
            <span className="text-[9px] text-slate-400">4.8 km/h</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTravelMode('cycling')}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all ${
              travelMode === 'cycling'
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Bike className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-semibold leading-tight">E-Bike</span>
            <span className="text-[9px] text-slate-400">18 km/h</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTravelMode('transit')}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all ${
              travelMode === 'transit'
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Bus className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-semibold leading-tight">Shuttle</span>
            <span className="text-[9px] text-slate-400">28 km/h</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTravelMode('driving')}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all ${
              travelMode === 'driving'
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Car className="w-4 h-4 mb-1" />
            <span className="text-[11px] font-semibold leading-tight">Taxi</span>
            <span className="text-[9px] text-slate-400">40 km/h</span>
          </button>
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            Graph Algorithm
          </label>
          <span className="text-[11px] text-slate-400 font-mono">Adjacency List + Min Heap</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChangeAlgorithm('dijkstra')}
            className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
              selectedAlgorithm === 'dijkstra'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-xs font-bold">Dijkstra's Shortest</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Min-Heap Priority Queue
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeAlgorithm('astar')}
            className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
              selectedAlgorithm === 'astar'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-xs font-bold">A* Heuristic Search</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Euclidean Goal Directed
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeAlgorithm('bfs')}
            className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
              selectedAlgorithm === 'bfs'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-xs font-bold">Breadth-First (BFS)</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Minimum Node Hops
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeAlgorithm('dfs')}
            className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
              selectedAlgorithm === 'dfs'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-xs font-bold">Depth-First (DFS)</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Deep Branch Exploration
            </span>
          </button>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={onCalculateRoute}
          disabled={!startNodeId || !endNodeId || startNodeId === endNodeId}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <Navigation className="w-4 h-4" />
          <span>Calculate Shortest Path</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenInspector}
            disabled={!hasCalculatedRoute}
            className="py-2 px-3 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Step-by-Step Visualizer</span>
          </button>

          <button
            onClick={onToggleSimulation}
            disabled={!hasCalculatedRoute}
            className={`py-2 px-3 border text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
              isSimulating
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:opacity-50'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Pause Journey' : 'Simulate Route'}</span>
          </button>
        </div>
      </div>

      {/* Route Distance & Cost Summary Cards */}
      {routeCost && hasCalculatedRoute && (
        <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              Trip Analytics & Travel Cost
            </span>
            <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isStudentPass}
                onChange={onToggleStudentPass}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Student / Staff Waiver</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Distance Card */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Total Distance
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {routeCost.distanceMeters}
                </span>
                <span className="text-xs text-slate-500">m</span>
                <span className="text-[11px] text-slate-400 ml-1">({routeCost.distanceKm} km)</span>
              </div>
            </div>

            {/* Travel Time Card */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Estimated Time</span>
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
                  {routeCost.formattedDuration}
                </span>
              </div>
            </div>

            {/* Estimated Travel Cost Card */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-500" />
                <span>Travel Fare / Cost</span>
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  ${routeCost.estimatedCost.toFixed(2)}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 truncate block mt-0.5">
                {routeCost.costBreakdown}
              </span>
            </div>

            {/* Calories / Eco Impact */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                {travelMode === 'walking' || travelMode === 'cycling' ? (
                  <>
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>Active Calories</span>
                  </>
                ) : (
                  <>
                    <Leaf className="w-3 h-3 text-emerald-500" />
                    <span>Emissions</span>
                  </>
                )}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {travelMode === 'walking' || travelMode === 'cycling'
                    ? routeCost.caloriesBurned
                    : routeCost.co2Grams}
                </span>
                <span className="text-xs text-slate-500">
                  {travelMode === 'walking' || travelMode === 'cycling' ? 'kcal' : 'g CO₂'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Turn-by-Turn Directions List */}
      {hasCalculatedRoute && turnInstructions.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Turn-by-Turn Navigation ({turnInstructions.length} legs)
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {turnInstructions.map((instruction) => (
              <div
                key={`inst-${instruction.index}`}
                className="flex items-start gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {instruction.index}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    {instruction.instruction}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>{instruction.distance}m</span>
                    <span>·</span>
                    <span>~{instruction.estimatedMinutes} min</span>
                    <span>·</span>
                    <span>Leg total: {instruction.cumulativeDistance}m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
