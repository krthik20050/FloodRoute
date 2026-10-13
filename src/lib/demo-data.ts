import { z } from 'zod';
import type { Dataset } from './domain';
import { dataset } from './fixtures';

const id = z.string().trim().min(1).max(80);
const latitude = z.number().finite().min(-90).max(90);
const longitude = z.number().finite().min(-180).max(180);
const coordinate = z.tuple([latitude, longitude]);
const timestamp = z.iso.datetime({ offset: true });
const nodeSchema = z
  .object({
    id,
    name: z.string().min(1).max(200),
    lat: latitude,
    lng: longitude,
    kind: z.enum(['settlement', 'junction', 'hospital', 'shelter', 'relief']),
    description: z.string().max(2000).optional(),
  })
  .strict();
const edgeSchema = z
  .object({
    id,
    from: id,
    to: id,
    name: z.string().min(1).max(200),
    coordinates: z.array(coordinate).min(2).max(10000),
    weight: z.number().finite().nonnegative(),
  })
  .strict();
const incidentSchema = z
  .object({
    id,
    edgeId: id,
    title: z.string().min(1).max(200),
    description: z.string().max(2000),
    severity: z.enum(['high', 'moderate']),
    source: z.string().min(1).max(500),
    observedAt: timestamp,
    verification: z.literal('simulated'),
    status: z.literal('active'),
    lat: latitude,
    lng: longitude,
  })
  .strict();

/** Only the explicitly simulated MVP contract is accepted by this provider. */
export const datasetSchema = z
  .object({
    nodes: z.array(nodeSchema).min(1).max(10000),
    edges: z.array(edgeSchema).max(30000),
    incidents: z.array(incidentSchema).max(10000),
    provenance: z
      .object({
        mode: z.literal('demo'),
        source: z.string().min(1).max(500),
        generatedAt: timestamp,
        description: z.string().min(1).max(2000),
      })
      .strict(),
  })
  .strict()
  .superRefine((data, context) => {
    const fail = (path: (string | number)[], message: string) =>
      context.addIssue({ code: 'custom', path, message });
    const unique = (records: { id: string }[], name: string) => {
      const seen = new Set<string>();
      records.forEach((record, index) => {
        if (seen.has(record.id)) fail([name, index, 'id'], 'Duplicate ID.');
        seen.add(record.id);
      });
    };
    unique(data.nodes, 'nodes');
    unique(data.edges, 'edges');
    unique(data.incidents, 'incidents');
    const nodes = new Map(data.nodes.map((node) => [node.id, node]));
    const edges = new Set(data.edges.map((edge) => edge.id));
    const pairs = new Set<string>();
    data.edges.forEach((edge, index) => {
      const from = nodes.get(edge.from);
      const to = nodes.get(edge.to);
      if (!from) fail(['edges', index, 'from'], 'Road origin node is missing.');
      if (!to) fail(['edges', index, 'to'], 'Road destination node is missing.');
      if (edge.from === edge.to) fail(['edges', index, 'to'], 'Self-loop roads are unsupported.');
      const pair = JSON.stringify([edge.from, edge.to].sort());
      if (pairs.has(pair))
        fail(['edges', index], 'Parallel roads are unsupported by this simple graph.');
      pairs.add(pair);
      const start = edge.coordinates[0];
      const end = edge.coordinates.at(-1);
      if (from && (start[0] !== from.lat || start[1] !== from.lng))
        fail(
          ['edges', index, 'coordinates', 0],
          'Geometry must start at its origin node (latitude, longitude).',
        );
      if (to && end && (end[0] !== to.lat || end[1] !== to.lng))
        fail(
          ['edges', index, 'coordinates', edge.coordinates.length - 1],
          'Geometry must end at its destination node (latitude, longitude).',
        );
    });
    data.incidents.forEach((incident, index) => {
      if (!edges.has(incident.edgeId))
        fail(['incidents', index, 'edgeId'], 'Incident road is missing.');
    });
  });

export interface DataProvider {
  readonly mode: 'demo';
  load(): Promise<Dataset>;
}
export class DemoProvider implements DataProvider {
  readonly mode = 'demo' as const;
  constructor(private readonly fixture: unknown = dataset) {}
  async load(): Promise<Dataset> {
    return datasetSchema.parse(this.fixture);
  }
}
export const demoProvider: DataProvider = new DemoProvider();

export interface FreshnessMetadata {
  state: 'recent' | 'stale' | 'missing' | 'invalid' | 'future';
  generatedAt: string | null;
  oldestObservationAt: string | null;
  ageMinutes: number | null;
  simulated: true;
  operationallyVerified: false;
  message: string;
}
/** Timestamp recency cannot establish observation truth or route safety. */
export function getFreshnessMetadata(
  value: unknown,
  now: Date = new Date(),
  maxAgeMinutes = 60,
): FreshnessMetadata {
  const record = z
    .object({
      provenance: z.object({ generatedAt: z.unknown().optional() }).optional(),
      incidents: z.array(z.object({ observedAt: z.unknown().optional() })).optional(),
    })
    .safeParse(value);
  const base = {
    generatedAt: null,
    oldestObservationAt: null,
    ageMinutes: null,
    simulated: true as const,
    operationallyVerified: false as const,
  };
  if (!record.success)
    return {
      ...base,
      state: 'invalid',
      message: 'Freshness metadata is malformed. This demo is not operationally verified.',
    };
  const generated = record.data.provenance?.generatedAt;
  const observations = (record.data.incidents ?? []).map((incident) => incident.observedAt);
  if (!generated || observations.some((observed) => !observed))
    return {
      ...base,
      state: 'missing',
      message:
        'A generation or observation timestamp is missing; freshness is unknown. Demo data is simulated.',
    };
  const timestamps = [generated, ...observations];
  if (
    timestamps.some((value) => !timestamp.safeParse(value).success) ||
    !Number.isFinite(now.getTime()) ||
    !Number.isFinite(maxAgeMinutes) ||
    maxAgeMinutes < 0
  )
    return {
      ...base,
      state: 'invalid',
      message:
        'A timestamp or freshness threshold is invalid; freshness is unknown. Demo data is simulated.',
    };
  const parsed = timestamps.map((value) => Date.parse(value as string));
  const oldest = Math.min(...parsed);
  const ageMinutes = (now.getTime() - oldest) / 60000;
  const common = {
    ...base,
    generatedAt: generated as string,
    oldestObservationAt: observations.length
      ? new Date(Math.min(...parsed.slice(1))).toISOString()
      : null,
    ageMinutes: Math.max(0, Math.round(ageMinutes)),
  };
  if (parsed.some((time) => time > now.getTime()))
    return {
      ...common,
      state: 'future',
      message: 'A timestamp is in the future; recency cannot be trusted. Demo data is simulated.',
    };
  if (ageMinutes > maxAgeMinutes)
    return {
      ...common,
      state: 'stale',
      message:
        'Demo timestamps exceed the freshness threshold. No live flood conditions are available.',
    };
  return {
    ...common,
    state: 'recent',
    message: 'Demo timestamps are recent, but all observations remain simulated and unverified.',
  };
}
