export type Coordinate = [number, number];
export interface NetworkNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: 'settlement' | 'junction' | 'hospital' | 'shelter' | 'relief';
  description?: string;
}
export interface RoadEdge {
  id: string;
  from: string;
  to: string;
  name: string;
  coordinates: Coordinate[];
  weight: number;
}
export interface Incident {
  id: string;
  edgeId: string;
  title: string;
  description: string;
  severity: 'high' | 'moderate';
  source: string;
  observedAt: string;
  verification: 'simulated';
  status: 'active';
  lat: number;
  lng: number;
}
export interface Dataset {
  nodes: NetworkNode[];
  edges: RoadEdge[];
  incidents: Incident[];
  provenance: { mode: 'demo'; source: string; generatedAt: string; description: string };
}
export interface Route {
  nodeIds: string[];
  edgeIds: string[];
  coordinates: Coordinate[];
  weight: number;
}
export interface Analysis {
  baseline: Route | null;
  route: Route | null;
  facilities: { node: NetworkNode; reachable: boolean; baselineReachable: boolean }[];
  isolatedSettlements: NetworkNode[];
  components: number;
  explanations: string[];
  closedEdges: string[];
}
