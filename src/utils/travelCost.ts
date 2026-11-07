import {
  EdgeType,
  GraphNode,
  RouteCostSummary,
  TravelMode,
  TurnInstruction,
} from '../types/graph';
import { AdjacencyListGraph } from './dataStructures';

export interface TravelModeProfile {
  name: string;
  speedKmH: number;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  caloriesPerKm: number;
  co2GramsPerKm: number;
  description: string;
}

export const TRAVEL_PROFILES: Record<TravelMode, TravelModeProfile> = {
  walking: {
    name: 'Walking / Pedestrian',
    speedKmH: 4.8,
    baseFare: 0.0,
    perKmRate: 0.0,
    perMinuteRate: 0.0,
    caloriesPerKm: 62,
    co2GramsPerKm: 0,
    description: 'Zero emissions, healthy walk via pedestrian walkways & quads',
  },
  cycling: {
    name: 'Bicycle / Campus E-Bike',
    speedKmH: 18.0,
    baseFare: 0.5, // E-bike unlock
    perKmRate: 0.0,
    perMinuteRate: 0.15,
    caloriesPerKm: 28,
    co2GramsPerKm: 0,
    description: 'Fast, agile navigation using dedicated bike paths and campus lanes',
  },
  transit: {
    name: 'Campus Shuttle / Transit',
    speedKmH: 28.0,
    baseFare: 1.5, // Standard bus ticket
    perKmRate: 0.0,
    perMinuteRate: 0.0,
    caloriesPerKm: 6,
    co2GramsPerKm: 18,
    description: 'Electric campus express shuttle loop between major hubs',
  },
  driving: {
    name: 'Campus Taxi / Rideshare',
    speedKmH: 40.0,
    baseFare: 3.5,
    perKmRate: 1.85,
    perMinuteRate: 0.3,
    caloriesPerKm: 0,
    co2GramsPerKm: 165,
    description: 'Door-to-door vehicle ride along perimeter access roads',
  },
};

export function calculateRouteCost(
  distanceMeters: number,
  mode: TravelMode,
  isStudentPass = true
): RouteCostSummary {
  const profile = TRAVEL_PROFILES[mode];
  const distanceKm = distanceMeters / 1000;

  // Travel time = (Distance in km / speed in km/h) * 60 minutes
  const durationHours = distanceKm / profile.speedKmH;
  const durationMinutes = Math.max(1, Math.round(durationHours * 60));

  let cost = 0;
  let costBreakdown = '';

  if (mode === 'walking') {
    cost = 0;
    costBreakdown = 'Free (Active walking)';
  } else if (mode === 'transit') {
    if (isStudentPass) {
      cost = 0;
      costBreakdown = 'Free (100% Student / Staff Pass coverage)';
    } else {
      cost = profile.baseFare;
      costBreakdown = `$${profile.baseFare.toFixed(2)} standard campus transit fare`;
    }
  } else if (mode === 'cycling') {
    const rideCost = profile.baseFare + durationMinutes * profile.perMinuteRate;
    cost = Math.round(rideCost * 100) / 100;
    costBreakdown = `$${profile.baseFare.toFixed(2)} unlock + $${(durationMinutes * profile.perMinuteRate).toFixed(2)} (${durationMinutes} min @ $${profile.perMinuteRate}/min)`;
  } else if (mode === 'driving') {
    const distCharge = distanceKm * profile.perKmRate;
    const timeCharge = durationMinutes * profile.perMinuteRate;
    cost = Math.round((profile.baseFare + distCharge + timeCharge) * 100) / 100;
    costBreakdown = `$${profile.baseFare.toFixed(2)} base + $${distCharge.toFixed(2)} distance + $${timeCharge.toFixed(2)} time`;
  }

  const caloriesBurned = Math.round(distanceKm * profile.caloriesPerKm);
  const co2Grams = Math.round(distanceKm * profile.co2GramsPerKm);

  const mins = Math.floor(durationMinutes);
  const formattedDuration = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`;

  return {
    mode,
    distanceMeters,
    distanceKm: Math.round(distanceKm * 100) / 100,
    durationMinutes,
    formattedDuration,
    estimatedCost: cost,
    costBreakdown,
    caloriesBurned,
    co2Grams,
    speedKmH: profile.speedKmH,
  };
}

function getBearing(from: GraphNode, to: GraphNode): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y; // note SVG y increases downwards
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  if (angle >= -22.5 && angle < 22.5) return 'East';
  if (angle >= 22.5 && angle < 67.5) return 'South-East';
  if (angle >= 67.5 && angle < 112.5) return 'South';
  if (angle >= 112.5 && angle < 157.5) return 'South-West';
  if (angle >= 157.5 || angle < -157.5) return 'West';
  if (angle >= -157.5 && angle < -112.5) return 'North-West';
  if (angle >= -112.5 && angle < -67.5) return 'North';
  return 'North-East';
}

function getEdgeTypeName(type: EdgeType): string {
  switch (type) {
    case 'walkway':
      return 'Pedestrian Walkway';
    case 'bikelane':
      return 'Dedicated Bike Lane';
    case 'road':
      return 'Campus Access Road';
    case 'transit_route':
      return 'Express Transit Way';
    default:
      return 'Path';
  }
}

export function generateTurnByTurn(
  graph: AdjacencyListGraph,
  path: string[],
  mode: TravelMode
): TurnInstruction[] {
  if (path.length <= 1) return [];

  const instructions: TurnInstruction[] = [];
  let cumulativeDistance = 0;
  const profile = TRAVEL_PROFILES[mode];

  for (let i = 0; i < path.length - 1; i++) {
    const fromNode = graph.getNode(path[i]);
    const toNode = graph.getNode(path[i + 1]);
    const edge = graph.getEdgeBetween(path[i], path[i + 1]);

    if (!fromNode || !toNode) continue;

    const segmentDistance = edge ? edge.distance : 100;
    const edgeType = edge ? edge.type : 'walkway';
    cumulativeDistance += segmentDistance;

    const bearing = getBearing(fromNode, toNode);
    const pathTypeDesc = getEdgeTypeName(edgeType);
    const estimatedMinutes = Math.max(
      1,
      Math.round(((segmentDistance / 1000) / profile.speedKmH) * 60)
    );

    let instructionText = '';
    if (i === 0) {
      instructionText = `Depart from ${fromNode.name}. Head ${bearing} along ${pathTypeDesc} towards ${toNode.name} (${segmentDistance}m).`;
    } else if (i === path.length - 2) {
      instructionText = `Continue ${bearing} on ${pathTypeDesc} for ${segmentDistance}m. Arrive at destination: ${toNode.name}.`;
    } else {
      instructionText = `Turn ${bearing} onto ${pathTypeDesc} and proceed ${segmentDistance}m to ${toNode.name}.`;
    }

    instructions.push({
      index: i + 1,
      instruction: instructionText,
      fromNode,
      toNode,
      edgeType,
      distance: segmentDistance,
      cumulativeDistance,
      estimatedMinutes,
    });
  }

  return instructions;
}
