/**
 * Core Data Structures for Route Finding:
 * 1. Priority Queue (Min Heap)
 * 2. Graph (Adjacency List)
 * 3. HashMap / Map utility structures
 * 4. Arrays
 */

import { GraphEdge, GraphNode, HeapItem } from '../types/graph';

/**
 * Min Heap implementation for Priority Queue
 * Time Complexity:
 * - Insert: O(log N)
 * - ExtractMin: O(log N)
 * - Peek: O(1)
 */
export class MinHeap<T extends { id: string; priority: number }> {
  private heap: T[] = [];
  private itemIndexMap: Map<string, number> = new Map();

  constructor(initialItems?: T[]) {
    if (initialItems && initialItems.length > 0) {
      this.heap = [...initialItems];
      this.heap.forEach((item, index) => this.itemIndexMap.set(item.id, index));
      this.buildHeap();
    }
  }

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public peek(): T | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  public insert(item: T): void {
    this.heap.push(item);
    const index = this.heap.length - 1;
    this.itemIndexMap.set(item.id, index);
    this.bubbleUp(index);
  }

  public extractMin(): T | null {
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    this.itemIndexMap.delete(min.id);

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.itemIndexMap.set(last.id, 0);
      this.bubbleDown(0);
    }

    return min;
  }

  public decreaseKey(id: string, newPriority: number): boolean {
    const index = this.itemIndexMap.get(id);
    if (index === undefined) return false;

    if (newPriority >= this.heap[index].priority) {
      return false; // Can only decrease key in Min Heap
    }

    this.heap[index].priority = newPriority;
    this.bubbleUp(index);
    return true;
  }

  public contains(id: string): boolean {
    return this.itemIndexMap.has(id);
  }

  public toArray(): T[] {
    return [...this.heap];
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private leftChild(index: number): number {
    return 2 * index + 1;
  }

  private rightChild(index: number): number {
    return 2 * index + 2;
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;

    this.itemIndexMap.set(this.heap[i].id, i);
    this.itemIndexMap.set(this.heap[j].id, j);
  }

  private bubbleUp(index: number): void {
    let current = index;
    while (current > 0) {
      const p = this.parent(current);
      if (this.heap[current].priority < this.heap[p].priority) {
        this.swap(current, p);
        current = p;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number): void {
    let current = index;
    const length = this.heap.length;

    while (true) {
      let smallest = current;
      const left = this.leftChild(current);
      const right = this.rightChild(current);

      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }

      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }

      if (smallest !== current) {
        this.swap(current, smallest);
        current = smallest;
      } else {
        break;
      }
    }
  }

  private buildHeap(): void {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.bubbleDown(i);
    }
  }
}

export interface AdjacencyNeighbor {
  nodeId: string;
  distance: number;
  edgeId: string;
  edge: GraphEdge;
}

/**
 * Graph represented as an Adjacency List
 * node id -> Array of { nodeId, distance, edge }
 */
export class AdjacencyListGraph {
  public nodes: Map<string, GraphNode> = new Map();
  public edges: Map<string, GraphEdge> = new Map();
  public adjacencyList: Map<string, AdjacencyNeighbor[]> = new Map();

  constructor(nodes: GraphNode[] = [], edges: GraphEdge[] = []) {
    nodes.forEach((n) => this.addNode(n));
    edges.forEach((e) => this.addEdge(e));
  }

  public addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  public removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);

    // Remove any connected edges
    for (const [key, edge] of this.edges.entries()) {
      if (edge.from === nodeId || edge.to === nodeId) {
        this.edges.delete(key);
      }
    }

    // Clean up neighbors in adjacency list
    for (const [_, neighbors] of this.adjacencyList.entries()) {
      const filtered = neighbors.filter((n) => n.nodeId !== nodeId);
      this.adjacencyList.set(_, filtered);
    }
  }

  public addEdge(edge: GraphEdge): void {
    this.edges.set(edge.id, edge);

    if (!this.adjacencyList.has(edge.from)) {
      this.adjacencyList.set(edge.from, []);
    }
    this.adjacencyList.get(edge.from)!.push({
      nodeId: edge.to,
      distance: edge.distance,
      edgeId: edge.id,
      edge,
    });

    if (edge.bidirectional !== false) {
      if (!this.adjacencyList.has(edge.to)) {
        this.adjacencyList.set(edge.to, []);
      }
      this.adjacencyList.get(edge.to)!.push({
        nodeId: edge.from,
        distance: edge.distance,
        edgeId: edge.id,
        edge,
      });
    }
  }

  public getNeighbors(nodeId: string): AdjacencyNeighbor[] {
    return this.adjacencyList.get(nodeId) || [];
  }

  public getNode(nodeId: string): GraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getEdgeBetween(fromId: string, toId: string): GraphEdge | undefined {
    for (const edge of this.edges.values()) {
      if (
        (edge.from === fromId && edge.to === toId) ||
        (edge.bidirectional !== false && edge.from === toId && edge.to === fromId)
      ) {
        return edge;
      }
    }
    return undefined;
  }

  public getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  public getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Returns a clean JSON representation of the Adjacency List for the inspector
   */
  public getAdjacencyListSnapshot(): Record<string, Array<{ to: string; distance: number; type: string }>> {
    const result: Record<string, Array<{ to: string; distance: number; type: string }>> = {};
    for (const [nodeId, neighbors] of this.adjacencyList.entries()) {
      result[nodeId] = neighbors.map((n) => ({
        to: n.nodeId,
        distance: n.distance,
        type: n.edge.type,
      }));
    }
    return result;
  }
}
