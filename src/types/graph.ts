export type NodeCategory =
  | 'academic'
  | 'residential'
  | 'dining'
  | 'transit'
  | 'library'
  | 'athletics'
  | 'medical'
  | 'civic'
  | 'recreation'
  | 'commercial';

export interface GraphNode {
  id: string;
  name: string;
  category: NodeCategory;
  x: number; // SVG canvas coordinate X
  y: number; // SVG canvas coordinate Y
  description?: string;
  buildingCode?: string;
}

export type EdgeType = 'walkway' | 'bikelane' | 'road' | 'transit_route';

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  distance: number; // in meters
  type: EdgeType;
  speedLimitKmH?: number; // default based on edge type
  bidirectional?: boolean;
}

export type TravelMode = 'walking' | 'cycling' | 'transit' | 'driving';

export type AlgorithmType = 'dijkstra' | 'astar' | 'bfs' | 'dfs';

export interface HeapItem {
  id: string;
  name?: string;
  priority: number; // distance for Dijkstra, f_score for A*
  gScore?: number; // used in A*
  hScore?: number; // heuristic used in A*
}

export type StepType =
  | 'init'
  | 'extract_min'
  | 'inspect_neighbor'
  | 'relax_edge'
  | 'skip_visited'
  | 'queue_push'
  | 'stack_push'
  | 'destination_reached'
  | 'finished';

export interface AlgorithmStep {
  stepIndex: number;
  type: StepType;
  currentNodeId: string | null;
  neighborNodeId?: string | null;
  examinedEdgeId?: string | null;
  distances: Record<string, number>; // HashMap of shortest distance so far
  visited: string[]; // Set of settled nodes
  inQueue: string[]; // Nodes currently in Priority Queue / FIFO / Stack
  queueItems: HeapItem[]; // Visual representation of Priority Queue
  parentMap: Record<string, string | null>; // HashMap of parent pointers
  activePath?: string[]; // tentative or current path
  explanation: string;
}

export interface AlgorithmResult {
  algorithm: AlgorithmType;
  path: string[]; // sequence of node IDs
  totalDistance: number; // in meters
  executionTimeMs: number;
  nodesVisitedCount: number;
  totalSteps: number;
  peakQueueSize: number;
  steps: AlgorithmStep[];
  success: boolean;
}

export interface TurnInstruction {
  index: number;
  instruction: string;
  fromNode: GraphNode;
  toNode: GraphNode;
  edgeType: EdgeType;
  distance: number; // meters
  cumulativeDistance: number;
  estimatedMinutes: number;
}

export interface RouteCostSummary {
  mode: TravelMode;
  distanceMeters: number;
  distanceKm: number;
  durationMinutes: number;
  formattedDuration: string;
  estimatedCost: number; // in USD
  costBreakdown: string;
  caloriesBurned: number;
  co2Grams: number;
  speedKmH: number;
}
