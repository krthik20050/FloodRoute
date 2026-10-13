import type { Coordinate, Dataset, NetworkNode, RoadEdge } from './domain';

const nodes: NetworkNode[] = [
  { id: 'aluva', name: 'Aluva town · demo', lat: 10.1076, lng: 76.3516, kind: 'settlement' },
  { id: 'east', name: 'East bank junction', lat: 10.119, lng: 76.369, kind: 'junction' },
  { id: 'west', name: 'West bank junction', lat: 10.124, lng: 76.341, kind: 'junction' },
  { id: 'north', name: 'Northern bypass', lat: 10.145, lng: 76.358, kind: 'junction' },
  {
    id: 'village',
    name: 'Riverbank settlement · demo',
    lat: 10.138,
    lng: 76.38,
    kind: 'settlement',
  },
  { id: 'hospital', name: 'Demo district hospital', lat: 10.111, lng: 76.387, kind: 'hospital' },
  { id: 'shelter', name: 'Demo school shelter', lat: 10.141, lng: 76.333, kind: 'shelter' },
  { id: 'relief', name: 'Demo relief depot', lat: 10.096, lng: 76.333, kind: 'relief' },
];
const links: [string, string, string, string, number][] = [
  ['bridge-east', 'aluva', 'east', 'East bridge', 2.4],
  ['west-road', 'aluva', 'west', 'West bank road', 2.8],
  ['north-west', 'west', 'north', 'Northern approach', 3.6],
  ['north-east', 'north', 'east', 'Bypass bridge', 3.8],
  ['hospital-access', 'east', 'hospital', 'Hospital access road', 2.2],
  ['village-access', 'east', 'village', 'Riverbank access', 2.7],
  ['shelter-access', 'west', 'shelter', 'School access road', 2.1],
  ['relief-access', 'aluva', 'relief', 'Depot access road', 2.6],
];
const edges: RoadEdge[] = links.map(([id, from, to, name, weight]) => ({
  id,
  from,
  to,
  name,
  weight,
  coordinates: [from, to].map((id): Coordinate => {
    const node = nodes.find((n) => n.id === id);
    if (!node) throw new Error('Invalid fixture');
    return [node.lat, node.lng];
  }),
}));
export const dataset: Dataset = {
  nodes,
  edges,
  incidents: [
    {
      id: 'incident-bridge',
      edgeId: 'bridge-east',
      title: 'Bridge inundation scenario',
      description:
        'Simulated high water makes this bridge unavailable. Toggle the closure to compare connectivity.',
      severity: 'high',
      source: 'FloodRoute scenario fixture',
      observedAt: '2026-10-13T08:00:00Z',
      verification: 'simulated',
      status: 'active',
      lat: 10.1133,
      lng: 76.3603,
    },
    {
      id: 'incident-hospital',
      edgeId: 'hospital-access',
      title: 'Hospital approach scenario',
      description: 'Simulated access-road closure isolates the demo hospital.',
      severity: 'high',
      source: 'FloodRoute scenario fixture',
      observedAt: '2026-10-13T08:00:00Z',
      verification: 'simulated',
      status: 'active',
      lat: 10.115,
      lng: 76.378,
    },
    {
      id: 'incident-shelter',
      edgeId: 'shelter-access',
      title: 'Shelter approach scenario',
      description: 'Simulated access-road closure isolates the demo shelter.',
      severity: 'moderate',
      source: 'FloodRoute scenario fixture',
      observedAt: '2026-10-13T08:00:00Z',
      verification: 'simulated',
      status: 'active',
      lat: 10.1325,
      lng: 76.337,
    },
  ],
  provenance: {
    mode: 'demo',
    source: 'Synthetic Aluva / Periyar teaching network',
    generatedAt: '2026-10-13T08:00:00Z',
    description:
      'Illustrative coordinates near Aluva. All roads, facilities and reports are fictional; no live flood observations or verified safe routes.',
  },
};
