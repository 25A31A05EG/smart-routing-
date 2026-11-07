import React from 'react';
import {
  Compass,
  MapPin,
  Building2,
  GitCompare,
  Sliders,
  Sun,
  Moon,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';
import { MapPreset } from '../data/presetMaps';

interface HeaderProps {
  currentPreset: MapPreset;
  onSelectPreset: (presetId: 'campus' | 'city') => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenComparison: () => void;
  onResetMap: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onAddNewNode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  onSelectPreset,
  isEditMode,
  onToggleEditMode,
  onOpenComparison,
  onResetMap,
  darkMode,
  onToggleDarkMode,
  onAddNewNode,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
          <Compass className="w-5 h-5 animate-spin-slow" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            SmartRoute Navigator
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Graph Routing & Algorithm Visualizer
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation & Preset Tabs */}
      <nav className="hidden lg:flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          onClick={() => onSelectPreset('campus')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            currentPreset.id === 'campus'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Apex Tech Campus</span>
        </button>

        <button
          onClick={() => onSelectPreset('city')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
            currentPreset.id === 'city'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Metropolis Downtown</span>
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenComparison}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          title="Compare Dijkstra, A*, BFS, and DFS on current route"
        >
          <GitCompare className="w-3.5 h-3.5 text-blue-500" />
          <span>Compare Algorithms</span>
        </button>

        <button
          onClick={onToggleEditMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
            isEditMode
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/40'
              : 'text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
          }`}
          title="Toggle Map Editing: Drag nodes, add locations, connect edges"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isEditMode ? 'Editing Map' : 'Edit Graph'}</span>
        </button>

        {isEditMode && (
          <button
            onClick={onAddNewNode}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>
        )}

        <button
          onClick={onResetMap}
          className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Reset map to default coordinates"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleDarkMode}
          className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
