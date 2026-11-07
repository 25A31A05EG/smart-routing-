import {
  AlgorithmResult,
  AlgorithmStep,
  AlgorithmType,
  GraphNode,
  HeapItem,
} from '../types/graph';
import { AdjacencyListGraph, MinHeap } from './dataStructures';

// Helper to reconstruct path from parent pointers
function reconstructPath(
  parentMap: Record<string, string | null>,
  startId: string,
  endId: string
): string[] {
  const path: string[] = [];
  let curr: string | null = endId;

  while (curr !== null) {
    path.unshift(curr);
    if (curr === startId) break;
    curr = parentMap[curr] ?? null;
  }

  return path[0] === startId ? path : [];
}

// Calculate total path distance based on graph edges
function calculateTotalDistance(graph: AdjacencyListGraph, path: string[]): number {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = graph.getEdgeBetween(path[i], path[i + 1]);
    if (edge) {
      total += edge.distance;
    }
  }
  return total;
}

// Euclidean distance heuristic for A*
export function euclideanDistance(a: GraphNode, b: GraphNode, scaleFactor = 1.0): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy) * scaleFactor);
}

/**
 * 1. DIJKSTRA'S SHORTEST PATH ALGORITHM
 * Uses:
 * - Graph (Adjacency List)
 * - Priority Queue (Min Heap)
 * - HashMap (distances, parent map, visited set)
 * - Arrays (path reconstruction, step timeline)
 */
export function runDijkstra(
  graph: AdjacencyListGraph,
  startId: string,
  endId: string
): AlgorithmResult {
  const startTime = performance.now();
  const steps: AlgorithmStep[] = [];
  const nodes = graph.getAllNodes();

  // HashMap for distances: node id -> shortest distance from start
  const distances: Record<string, number> = {};
  const parentMap: Record<string, string | null> = {};
  const visited = new Set<string>();
  let peakQueueSize = 0;

  nodes.forEach((n) => {
    distances[n.id] = Infinity;
    parentMap[n.id] = null;
  });

  distances[startId] = 0;

  // Min Heap Priority Queue
  const minHeap = new MinHeap<HeapItem>();
  minHeap.insert({
    id: startId,
    name: graph.getNode(startId)?.name,
    priority: 0,
  });

  steps.push({
    stepIndex: steps.length,
    type: 'init',
    currentNodeId: startId,
    distances: { ...distances },
    visited: Array.from(visited),
    inQueue: [startId],
    queueItems: minHeap.toArray(),
    parentMap: { ...parentMap },
    activePath: [startId],
    explanation: `Initialized Dijkstra's algorithm. Distance to start node [${graph.getNode(startId)?.name}] set to 0m, all others to ∞. Start node inserted into Min-Heap with priority 0.`,
  });

  let reachedDestination = false;

  while (!minHeap.isEmpty()) {
    if (minHeap.size() > peakQueueSize) {
      peakQueueSize = minHeap.size();
    }

    const currentItem = minHeap.extractMin();
    if (!currentItem) break;

    const u = currentItem.id;
    const uNode = graph.getNode(u);

    // If already visited, continue (MinHeap can have duplicate insertions for lazy updates)
    if (visited.has(u)) {
      continue;
    }

    visited.add(u);

    steps.push({
      stepIndex: steps.length,
      type: 'extract_min',
      currentNodeId: u,
      distances: { ...distances },
      visited: Array.from(visited),
      inQueue: minHeap.toArray().map((item) => item.id),
      queueItems: minHeap.toArray(),
      parentMap: { ...parentMap },
      activePath: reconstructPath(parentMap, startId, u),
      explanation: `Extracted node [${uNode?.name}] with minimum distance ${distances[u]}m from Priority Queue (Min Heap). Marked as settled/visited.`,
    });

    // Check if reached destination
    if (u === endId) {
      reachedDestination = true;
      steps.push({
        stepIndex: steps.length,
        type: 'destination_reached',
        currentNodeId: u,
        distances: { ...distances },
        visited: Array.from(visited),
        inQueue: minHeap.toArray().map((item) => item.id),
        queueItems: minHeap.toArray(),
        parentMap: { ...parentMap },
        activePath: reconstructPath(parentMap, startId, endId),
        explanation: `Destination [${uNode?.name}] reached with shortest distance of ${distances[u]}m! Dijkstra guarantees this path is optimal.`,
      });
      break;
    }

    // Inspect all adjacent neighbors
    const neighbors = graph.getNeighbors(u);
    for (const neighbor of neighbors) {
      const v = neighbor.nodeId;
      const vNode = graph.getNode(v);
      const edgeWeight = neighbor.distance;

      if (visited.has(v)) {
        continue;
      }

      const altDistance = distances[u] + edgeWeight;

      // Relaxation step
      if (altDistance < distances[v]) {
        const prevDist = distances[v];
        distances[v] = altDistance;
        parentMap[v] = u;

        minHeap.insert({
          id: v,
          name: vNode?.name,
          priority: altDistance,
        });

        steps.push({
          stepIndex: steps.length,
          type: 'relax_edge',
          currentNodeId: u,
          neighborNodeId: v,
          examinedEdgeId: neighbor.edgeId,
          distances: { ...distances },
          visited: Array.from(visited),
          inQueue: minHeap.toArray().map((item) => item.id),
          queueItems: minHeap.toArray(),
          parentMap: { ...parentMap },
          activePath: reconstructPath(parentMap, startId, v),
          explanation: `Relaxed edge [${uNode?.name} → ${vNode?.name}] (${edgeWeight}m): Updated distance from ${prevDist === Infinity ? '∞' : prevDist + 'm'} to ${altDistance}m. Pushed to Min-Heap with priority ${altDistance}.`,
        });
      }
    }
  }

  const finalPath = reconstructPath(parentMap, startId, endId);
  const totalDist = calculateTotalDistance(graph, finalPath);
  const execTime = performance.now() - startTime;

  steps.push({
    stepIndex: steps.length,
    type: 'finished',
    currentNodeId: endId,
    distances: { ...distances },
    visited: Array.from(visited),
    inQueue: [],
    queueItems: [],
    parentMap: { ...parentMap },
    activePath: finalPath,
    explanation: reachedDestination
      ? `Completed Dijkstra. Shortest route length: ${totalDist}m across ${finalPath.length} nodes.`
      : `Search ended without finding a connected route to destination.`,
  });

  return {
    algorithm: 'dijkstra',
    path: finalPath,
    totalDistance: totalDist,
    executionTimeMs: Math.round(execTime * 100) / 100,
    nodesVisitedCount: visited.size,
    totalSteps: steps.length,
    peakQueueSize,
    steps,
    success: reachedDestination && finalPath.length > 0,
  };
}

/**
 * 2. A* SEARCH ALGORITHM
 * Uses Euclidean Distance as an admissible heuristic:
 * f(n) = g(n) + h(n)
 * where g(n) is the exact distance from start, and h(n) is straight-line distance to goal.
 */
export function runAStar(
  graph: AdjacencyListGraph,
  startId: string,
  endId: string
): AlgorithmResult {
  const startTime = performance.now();
  const steps: AlgorithmStep[] = [];
  const nodes = graph.getAllNodes();
  const targetNode = graph.getNode(endId);

  if (!targetNode) {
    return runDijkstra(graph, startId, endId);
  }

  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  const parentMap: Record<string, string | null> = {};
  const visited = new Set<string>();
  let peakQueueSize = 0;

  nodes.forEach((n) => {
    gScore[n.id] = Infinity;
    fScore[n.id] = Infinity;
    parentMap[n.id] = null;
  });

  const startNode = graph.getNode(startId)!;
  gScore[startId] = 0;
  const initialH = euclideanDistance(startNode, targetNode);
  fScore[startId] = initialH;

  const openSet = new MinHeap<HeapItem>();
  openSet.insert({
    id: startId,
    name: startNode.name,
    priority: fScore[startId],
    gScore: 0,
    hScore: initialH,
  });

  steps.push({
    stepIndex: steps.length,
    type: 'init',
    currentNodeId: startId,
    distances: { ...gScore },
    visited: [],
    inQueue: [startId],
    queueItems: openSet.toArray(),
    parentMap: { ...parentMap },
    activePath: [startId],
    explanation: `Initialized A* Search. Computed Euclidean heuristic h(${startNode.name}) = ${initialH}m. f-score = g(0) + h(${initialH}) = ${initialH}. Added to Open Set.`,
  });

  let reachedDestination = false;

  while (!openSet.isEmpty()) {
    if (openSet.size() > peakQueueSize) {
      peakQueueSize = openSet.size();
    }

    const currentItem = openSet.extractMin();
    if (!currentItem) break;

    const u = currentItem.id;
    const uNode = graph.getNode(u);

    if (visited.has(u)) {
      continue;
    }

    visited.add(u);

    steps.push({
      stepIndex: steps.length,
      type: 'extract_min',
      currentNodeId: u,
      distances: { ...gScore },
      visited: Array.from(visited),
      inQueue: openSet.toArray().map((item) => item.id),
      queueItems: openSet.toArray(),
      parentMap: { ...parentMap },
      activePath: reconstructPath(parentMap, startId, u),
      explanation: `Extracted [${uNode?.name}] with lowest f-score = ${currentItem.priority} (g = ${gScore[u]}m, h = ${currentItem.hScore ?? 0}m). Exploring towards goal.`,
    });

    if (u === endId) {
      reachedDestination = true;
      steps.push({
        stepIndex: steps.length,
        type: 'destination_reached',
        currentNodeId: u,
        distances: { ...gScore },
        visited: Array.from(visited),
        inQueue: openSet.toArray().map((item) => item.id),
        queueItems: openSet.toArray(),
        parentMap: { ...parentMap },
        activePath: reconstructPath(parentMap, startId, endId),
        explanation: `Goal [${uNode?.name}] reached! A* targeted search finished visiting only ${visited.size} nodes.`,
      });
      break;
    }

    const neighbors = graph.getNeighbors(u);
    for (const neighbor of neighbors) {
      const v = neighbor.nodeId;
      const vNode = graph.getNode(v)!;
      const tentativeG = gScore[u] + neighbor.distance;

      if (tentativeG < gScore[v]) {
        parentMap[v] = u;
        gScore[v] = tentativeG;
        const h = euclideanDistance(vNode, targetNode);
        const f = tentativeG + h;
        fScore[v] = f;

        openSet.insert({
          id: v,
          name: vNode.name,
          priority: f,
          gScore: tentativeG,
          hScore: h,
        });

        steps.push({
          stepIndex: steps.length,
          type: 'relax_edge',
          currentNodeId: u,
          neighborNodeId: v,
          examinedEdgeId: neighbor.edgeId,
          distances: { ...gScore },
          visited: Array.from(visited),
          inQueue: openSet.toArray().map((item) => item.id),
          queueItems: openSet.toArray(),
          parentMap: { ...parentMap },
          activePath: reconstructPath(parentMap, startId, v),
          explanation: `Evaluated neighbor [${vNode.name}]: g = ${tentativeG}m, h = ${h}m → f = ${f}. Inserted into Min-Heap prioritized by f-score.`,
        });
      }
    }
  }

  const finalPath = reconstructPath(parentMap, startId, endId);
  const totalDist = calculateTotalDistance(graph, finalPath);
  const execTime = performance.now() - startTime;

  return {
    algorithm: 'astar',
    path: finalPath,
    totalDistance: totalDist,
    executionTimeMs: Math.round(execTime * 100) / 100,
    nodesVisitedCount: visited.size,
    totalSteps: steps.length,
    peakQueueSize,
    steps,
    success: reachedDestination && finalPath.length > 0,
  };
}

/**
 * 3. BREADTH-FIRST SEARCH (BFS)
 * Unweighted shortest path (finds route with minimum number of edge hops/transfers).
 * Uses FIFO Queue array.
 */
export function runBFS(
  graph: AdjacencyListGraph,
  startId: string,
  endId: string
): AlgorithmResult {
  const startTime = performance.now();
  const steps: AlgorithmStep[] = [];
  const nodes = graph.getAllNodes();

  const visited = new Set<string>();
  const parentMap: Record<string, string | null> = {};
  const distances: Record<string, number> = {};
  let peakQueueSize = 0;

  nodes.forEach((n) => {
    parentMap[n.id] = null;
    distances[n.id] = Infinity;
  });

  const queue: string[] = [startId];
  visited.add(startId);
  distances[startId] = 0;

  steps.push({
    stepIndex: steps.length,
    type: 'init',
    currentNodeId: startId,
    distances: { ...distances },
    visited: Array.from(visited),
    inQueue: [...queue],
    queueItems: [{ id: startId, priority: 0, name: graph.getNode(startId)?.name }],
    parentMap: { ...parentMap },
    activePath: [startId],
    explanation: `Initialized Breadth-First Search (BFS) using FIFO Queue. Starting node [${graph.getNode(startId)?.name}] queued.`,
  });

  let reachedDestination = false;

  while (queue.length > 0) {
    if (queue.length > peakQueueSize) {
      peakQueueSize = queue.length;
    }

    const u = queue.shift()!;
    const uNode = graph.getNode(u);

    steps.push({
      stepIndex: steps.length,
      type: 'extract_min',
      currentNodeId: u,
      distances: { ...distances },
      visited: Array.from(visited),
      inQueue: [...queue],
      queueItems: queue.map((id, idx) => ({ id, priority: idx, name: graph.getNode(id)?.name })),
      parentMap: { ...parentMap },
      activePath: reconstructPath(parentMap, startId, u),
      explanation: `Dequeued [${uNode?.name}] (Hop depth: ${distances[u]}). Exploring all immediate unvisited neighbors.`,
    });

    if (u === endId) {
      reachedDestination = true;
      steps.push({
        stepIndex: steps.length,
        type: 'destination_reached',
        currentNodeId: u,
        distances: { ...distances },
        visited: Array.from(visited),
        inQueue: [...queue],
        queueItems: queue.map((id, idx) => ({ id, priority: idx, name: graph.getNode(id)?.name })),
        parentMap: { ...parentMap },
        activePath: reconstructPath(parentMap, startId, endId),
        explanation: `Destination [${uNode?.name}] found via minimum hop count (${distances[u]} hops)!`,
      });
      break;
    }

    const neighbors = graph.getNeighbors(u);
    for (const neighbor of neighbors) {
      const v = neighbor.nodeId;
      if (!visited.has(v)) {
        visited.add(v);
        parentMap[v] = u;
        distances[v] = distances[u] + 1;
        queue.push(v);

        steps.push({
          stepIndex: steps.length,
          type: 'queue_push',
          currentNodeId: u,
          neighborNodeId: v,
          examinedEdgeId: neighbor.edgeId,
          distances: { ...distances },
          visited: Array.from(visited),
          inQueue: [...queue],
          queueItems: queue.map((id, idx) => ({
            id,
            priority: idx,
            name: graph.getNode(id)?.name,
          })),
          parentMap: { ...parentMap },
          activePath: reconstructPath(parentMap, startId, v),
          explanation: `Enqueued unvisited neighbor [${graph.getNode(v)?.name}] into FIFO Queue (Hop distance ${distances[v]}).`,
        });
      }
    }
  }

  const finalPath = reconstructPath(parentMap, startId, endId);
  const totalDist = calculateTotalDistance(graph, finalPath);
  const execTime = performance.now() - startTime;

  return {
    algorithm: 'bfs',
    path: finalPath,
    totalDistance: totalDist,
    executionTimeMs: Math.round(execTime * 100) / 100,
    nodesVisitedCount: visited.size,
    totalSteps: steps.length,
    peakQueueSize,
    steps,
    success: reachedDestination && finalPath.length > 0,
  };
}

/**
 * 4. DEPTH-FIRST SEARCH (DFS)
 * Explores along each branch as deeply as possible before backtracking.
 * Useful for cycle detection, full connectivity, and seeing how greedy non-shortest paths diverge.
 */
export function runDFS(
  graph: AdjacencyListGraph,
  startId: string,
  endId: string
): AlgorithmResult {
  const startTime = performance.now();
  const steps: AlgorithmStep[] = [];
  const nodes = graph.getAllNodes();

  const visited = new Set<string>();
  const parentMap: Record<string, string | null> = {};
  const distances: Record<string, number> = {};
  let peakQueueSize = 0;

  nodes.forEach((n) => {
    parentMap[n.id] = null;
    distances[n.id] = Infinity;
  });

  const stack: string[] = [startId];
  distances[startId] = 0;

  steps.push({
    stepIndex: steps.length,
    type: 'init',
    currentNodeId: startId,
    distances: { ...distances },
    visited: [],
    inQueue: [...stack],
    queueItems: [{ id: startId, priority: 0, name: graph.getNode(startId)?.name }],
    parentMap: { ...parentMap },
    activePath: [startId],
    explanation: `Initialized Depth-First Search (DFS) using LIFO Stack. Pushed start node [${graph.getNode(startId)?.name}].`,
  });

  let reachedDestination = false;

  while (stack.length > 0) {
    if (stack.length > peakQueueSize) {
      peakQueueSize = stack.length;
    }

    const u = stack.pop()!;
    const uNode = graph.getNode(u);

    if (visited.has(u)) {
      continue;
    }

    visited.add(u);

    steps.push({
      stepIndex: steps.length,
      type: 'extract_min',
      currentNodeId: u,
      distances: { ...distances },
      visited: Array.from(visited),
      inQueue: [...stack],
      queueItems: stack.map((id, idx) => ({ id, priority: idx, name: graph.getNode(id)?.name })),
      parentMap: { ...parentMap },
      activePath: reconstructPath(parentMap, startId, u),
      explanation: `Popped [${uNode?.name}] from LIFO stack. Exploring branch deeply.`,
    });

    if (u === endId) {
      reachedDestination = true;
      steps.push({
        stepIndex: steps.length,
        type: 'destination_reached',
        currentNodeId: u,
        distances: { ...distances },
        visited: Array.from(visited),
        inQueue: [...stack],
        queueItems: stack.map((id, idx) => ({ id, priority: idx, name: graph.getNode(id)?.name })),
        parentMap: { ...parentMap },
        activePath: reconstructPath(parentMap, startId, endId),
        explanation: `Destination [${uNode?.name}] reached via DFS deep traversal path!`,
      });
      break;
    }

    const neighbors = graph.getNeighbors(u);
    // Reverse neighbors order so earlier adjacent nodes are processed first
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const v = neighbors[i].nodeId;
      if (!visited.has(v)) {
        if (parentMap[v] === null && v !== startId) {
          parentMap[v] = u;
          distances[v] = distances[u] + neighbors[i].distance;
        }
        stack.push(v);

        steps.push({
          stepIndex: steps.length,
          type: 'stack_push',
          currentNodeId: u,
          neighborNodeId: v,
          examinedEdgeId: neighbors[i].edgeId,
          distances: { ...distances },
          visited: Array.from(visited),
          inQueue: [...stack],
          queueItems: stack.map((id, idx) => ({
            id,
            priority: idx,
            name: graph.getNode(id)?.name,
          })),
          parentMap: { ...parentMap },
          activePath: reconstructPath(parentMap, startId, v),
          explanation: `Pushed unvisited neighbor [${graph.getNode(v)?.name}] onto LIFO stack.`,
        });
      }
    }
  }

  const finalPath = reconstructPath(parentMap, startId, endId);
  const totalDist = calculateTotalDistance(graph, finalPath);
  const execTime = performance.now() - startTime;

  return {
    algorithm: 'dfs',
    path: finalPath,
    totalDistance: totalDist,
    executionTimeMs: Math.round(execTime * 100) / 100,
    nodesVisitedCount: visited.size,
    totalSteps: steps.length,
    peakQueueSize,
    steps,
    success: reachedDestination && finalPath.length > 0,
  };
}

/**
 * Compare all 4 algorithms on the same graph and start/destination
 */
export function compareAllAlgorithms(
  graph: AdjacencyListGraph,
  startId: string,
  endId: string
): Record<AlgorithmType, AlgorithmResult> {
  return {
    dijkstra: runDijkstra(graph, startId, endId),
    astar: runAStar(graph, startId, endId),
    bfs: runBFS(graph, startId, endId),
    dfs: runDFS(graph, startId, endId),
  };
}
