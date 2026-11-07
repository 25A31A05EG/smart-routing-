/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CAMPUS_PRESET, CITY_PRESET, MapPreset } from './data/presetMaps';
import {
  AlgorithmResult,
  AlgorithmType,
  EdgeType,
  GraphEdge,
  GraphNode,
  TravelMode,
} from './types/graph';
import { AdjacencyListGraph } from './utils/dataStructures';
import {
  compareAllAlgorithms,
  runAStar,
  runBFS,
  runDFS,
  runDijkstra,
} from './utils/algorithms';
import { calculateRouteCost, generateTurnByTurn } from './utils/travelCost';
import { Header } from './components/Header';
import { MapCanvas } from './components/MapCanvas';
import { NavigationSidebar } from './components/NavigationSidebar';
import { DataStructuresInspector } from './components/DataStructuresInspector';
import { AlgorithmComparisonModal } from './components/AlgorithmComparisonModal';
import { AddNodeModal } from './components/AddNodeModal';

export default function App() {
  // Preset selection
  const [presetKey, setPresetKey] = useState<'campus' | 'city'>('campus');
  const currentPreset: MapPreset = presetKey === 'campus' ? CAMPUS_PRESET : CITY_PRESET;

  // Graph state (nodes and edges can be dragged or added in edit mode)
  const [nodes, setNodes] = useState<GraphNode[]>(currentPreset.nodes);
  const [edges, setEdges] = useState<GraphEdge[]>(currentPreset.edges);

  // Selected endpoints
  const [startNodeId, setStartNodeId] = useState<string>(currentPreset.defaultStartId);
  const [endNodeId, setEndNodeId] = useState<string>(currentPreset.defaultEndId);

  // Travel and Algorithm settings
  const [travelMode, setTravelMode] = useState<TravelMode>('walking');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('dijkstra');
  const [isStudentPass, setIsStudentPass] = useState<boolean>(true);

  // Simulation & Edit mode
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Modals & Stepper
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // When preset changes, reload nodes and edges
  const handleSelectPreset = (newPresetKey: 'campus' | 'city') => {
    setPresetKey(newPresetKey);
    const preset = newPresetKey === 'campus' ? CAMPUS_PRESET : CITY_PRESET;
    setNodes(preset.nodes);
    setEdges(preset.edges);
    setStartNodeId(preset.defaultStartId);
    setEndNodeId(preset.defaultEndId);
    setIsSimulating(false);
  };

  const handleResetMap = () => {
    const preset = presetKey === 'campus' ? CAMPUS_PRESET : CITY_PRESET;
    setNodes(preset.nodes);
    setEdges(preset.edges);
    setStartNodeId(preset.defaultStartId);
    setEndNodeId(preset.defaultEndId);
    setIsSimulating(false);
  };

  // Build Adjacency List Graph instance
  const graph = useMemo(() => {
    return new AdjacencyListGraph(nodes, edges);
  }, [nodes, edges]);

  // Execute selected algorithm
  const algorithmResult: AlgorithmResult | null = useMemo(() => {
    if (!startNodeId || !endNodeId || startNodeId === endNodeId) {
      return null;
    }

    switch (selectedAlgorithm) {
      case 'dijkstra':
        return runDijkstra(graph, startNodeId, endNodeId);
      case 'astar':
        return runAStar(graph, startNodeId, endNodeId);
      case 'bfs':
        return runBFS(graph, startNodeId, endNodeId);
      case 'dfs':
        return runDFS(graph, startNodeId, endNodeId);
      default:
        return runDijkstra(graph, startNodeId, endNodeId);
    }
  }, [graph, startNodeId, endNodeId, selectedAlgorithm]);

  // Keep stepper synchronized with algorithm changes
  useEffect(() => {
    if (algorithmResult) {
      // Default to final step so full path is shown initially
      setCurrentStepIndex(algorithmResult.steps.length - 1);
    } else {
      setCurrentStepIndex(0);
    }
  }, [algorithmResult]);

  // Compute travel cost and turn-by-turn guidance
  const shortestPath = algorithmResult?.path || [];
  const routeCost = useMemo(() => {
    if (!algorithmResult || !algorithmResult.success) return null;
    return calculateRouteCost(algorithmResult.totalDistance, travelMode, isStudentPass);
  }, [algorithmResult, travelMode, isStudentPass]);

  const turnInstructions = useMemo(() => {
    if (!algorithmResult || !algorithmResult.success) return [];
    return generateTurnByTurn(graph, algorithmResult.path, travelMode);
  }, [graph, algorithmResult, travelMode]);

  // Compare all algorithms for modal
  const comparisonResults = useMemo(() => {
    if (!isComparisonOpen || !startNodeId || !endNodeId || startNodeId === endNodeId) {
      return null;
    }
    return compareAllAlgorithms(graph, startNodeId, endNodeId);
  }, [isComparisonOpen, graph, startNodeId, endNodeId]);

  // Swap endpoints
  const handleSwapNodes = () => {
    const temp = startNodeId;
    setStartNodeId(endNodeId);
    setEndNodeId(temp);
    setIsSimulating(false);
  };

  // Node drag handler
  const handleNodeDragEnd = (nodeId: string, newX: number, newY: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, x: newX, y: newY } : n))
    );
  };

  // Add custom node and edge
  const handleAddNodeAndEdge = (
    newNode: GraphNode,
    connectedNodeId: string,
    edgeDistance: number,
    edgeType: EdgeType
  ) => {
    const newEdge: GraphEdge = {
      id: `edge_${Date.now()}`,
      from: newNode.id,
      to: connectedNodeId,
      distance: edgeDistance,
      type: edgeType,
      bidirectional: true,
    };

    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, newEdge]);
    setEndNodeId(newNode.id);
  };

  const activeStep = algorithmResult?.steps?.[currentStepIndex] || null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Header */}
      <Header
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onOpenComparison={() => setIsComparisonOpen(true)}
        onResetMap={handleResetMap}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onAddNewNode={() => setIsAddNodeOpen(true)}
      />

      {/* Main Workspace Split Layout */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6">
        {/* Left: Interactive Map Canvas */}
        <section className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 w-full h-[640px] lg:h-full min-h-[580px]">
            <MapCanvas
              nodes={nodes}
              edges={edges}
              startNodeId={startNodeId}
              endNodeId={endNodeId}
              onSelectStartNode={(id) => {
                setStartNodeId(id);
                setIsSimulating(false);
              }}
              onSelectEndNode={(id) => {
                setEndNodeId(id);
                setIsSimulating(false);
              }}
              shortestPath={shortestPath}
              activeStep={activeStep}
              travelMode={travelMode}
              isSimulating={isSimulating}
              onToggleSimulation={() => setIsSimulating(!isSimulating)}
              isEditMode={isEditMode}
              onNodeDragEnd={handleNodeDragEnd}
              presetCategory={currentPreset.category}
            />
          </div>
        </section>

        {/* Right: Route Planner & Analytics Sidebar */}
        <NavigationSidebar
          nodes={nodes}
          startNodeId={startNodeId}
          endNodeId={endNodeId}
          onSelectStartNode={(id) => {
            setStartNodeId(id);
            setIsSimulating(false);
          }}
          onSelectEndNode={(id) => {
            setEndNodeId(id);
            setIsSimulating(false);
          }}
          onSwapNodes={handleSwapNodes}
          travelMode={travelMode}
          onChangeTravelMode={(m) => setTravelMode(m)}
          selectedAlgorithm={selectedAlgorithm}
          onChangeAlgorithm={(algo) => setSelectedAlgorithm(algo)}
          isStudentPass={isStudentPass}
          onToggleStudentPass={() => setIsStudentPass(!isStudentPass)}
          routeCost={routeCost}
          turnInstructions={turnInstructions}
          onCalculateRoute={() => {
            // Recalculates automatically, but triggers fresh step focus
            if (algorithmResult) {
              setCurrentStepIndex(algorithmResult.steps.length - 1);
            }
          }}
          onOpenInspector={() => setIsInspectorOpen(true)}
          isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating(!isSimulating)}
          hasCalculatedRoute={Boolean(algorithmResult && algorithmResult.success)}
        />
      </main>

      {/* Data Structures Inspector Modal */}
      <DataStructuresInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        algorithmResult={algorithmResult}
        graph={graph}
        currentStepIndex={currentStepIndex}
        onSelectStepIndex={setCurrentStepIndex}
      />

      {/* Algorithm Comparison Modal */}
      <AlgorithmComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        results={comparisonResults}
        graph={graph}
        startNodeId={startNodeId}
        endNodeId={endNodeId}
      />

      {/* Add Custom Location / Node Modal */}
      <AddNodeModal
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        existingNodes={nodes}
        onAddNodeAndEdge={handleAddNodeAndEdge}
      />
    </div>
  );
}
