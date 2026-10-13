import { describe, expect, it } from 'vitest';
import { dataset } from '../src/lib/fixtures';
import {
  datasetSchema,
  DemoProvider,
  getFreshnessMetadata,
  type DataProvider,
} from '../src/server/data-provider';
import { createAnalyzeHandler, createNetworkHandler } from '../src/server/http';

describe('trusted demo provider validation', () => {
  it('accepts the complete fixture and returns a separate parsed snapshot', async () => {
    const result = await new DemoProvider().load();
    expect(result).toEqual(dataset);
    expect(result).not.toBe(dataset);
  });
  it('rejects missing metadata and malformed timestamps', () => {
    const missing = structuredClone(dataset);
    Reflect.deleteProperty(missing.provenance, 'generatedAt');
    expect(datasetSchema.safeParse(missing).success).toBe(false);
    const malformed = structuredClone(dataset);
    malformed.incidents[0].observedAt = 'yesterday';
    expect(datasetSchema.safeParse(malformed).success).toBe(false);
  });
  it.each([
    'negative weight',
    'infinite weight',
    'missing endpoint',
    'bad geometry',
    'duplicate node',
    'duplicate road',
    'parallel road',
    'unknown incident road',
  ])('rejects %s', (defect) => {
    const copy = structuredClone(dataset);
    if (defect === 'negative weight') copy.edges[0].weight = -1;
    if (defect === 'infinite weight') copy.edges[0].weight = Infinity;
    if (defect === 'missing endpoint') copy.edges[0].from = 'missing';
    if (defect === 'bad geometry') copy.edges[0].coordinates[0] = [91, 10];
    if (defect === 'duplicate node') copy.nodes.push(copy.nodes[0]);
    if (defect === 'duplicate road') copy.edges.push(copy.edges[0]);
    if (defect === 'parallel road') copy.edges.push({ ...copy.edges[0], id: 'parallel' });
    if (defect === 'unknown incident road') copy.incidents[0].edgeId = 'unknown';
    expect(datasetSchema.safeParse(copy).success).toBe(false);
  });
  it('rejects valid-range geometry with reversed endpoint coordinates', () => {
    const copy = structuredClone(dataset);
    copy.edges[0].coordinates.reverse();
    expect(datasetSchema.safeParse(copy).success).toBe(false);
  });
  it('accepts zero weights without creating a negative path', () => {
    const copy = structuredClone(dataset);
    copy.edges[0].weight = 0;
    expect(datasetSchema.safeParse(copy).success).toBe(true);
  });
});

describe('honest freshness metadata', () => {
  const now = new Date('2026-10-13T08:30:00Z');
  it('marks recent demo records as simulated and operationally unverified', () => {
    expect(getFreshnessMetadata(dataset, now)).toMatchObject({
      state: 'recent',
      ageMinutes: 30,
      simulated: true,
      operationallyVerified: false,
    });
  });
  it('marks stale records without updating their timestamps', () => {
    expect(getFreshnessMetadata(dataset, new Date('2026-10-14T08:00:00Z'))).toMatchObject({
      state: 'stale',
      generatedAt: '2026-10-13T08:00:00Z',
      ageMinutes: 1440,
    });
  });
  it('distinguishes missing, invalid and future timestamps', () => {
    expect(getFreshnessMetadata({}, now).state).toBe('missing');
    expect(getFreshnessMetadata({ provenance: { generatedAt: 'bad' } }, now).state).toBe('invalid');
    expect(getFreshnessMetadata(dataset, new Date('2026-10-12T08:00:00Z')).state).toBe('future');
    expect(
      getFreshnessMetadata({ provenance: dataset.provenance, incidents: [{}] }, now).state,
    ).toBe('missing');
  });
});

describe('provider failure boundaries', () => {
  const failingProvider: DataProvider = {
    mode: 'demo',
    async load() {
      throw new Error('Private provider diagnostic');
    },
  };
  it('returns sanitized 503 responses without pretending data is available', async () => {
    const networkResponse = await createNetworkHandler(failingProvider)();
    const analysisResponse = await createAnalyzeHandler(failingProvider)(
      new Request('http://localhost/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ origin: 'aluva', destination: 'hospital', closures: [] }),
      }),
    );
    expect(networkResponse.status).toBe(503);
    expect(analysisResponse.status).toBe(503);
    expect(await networkResponse.text()).not.toContain('Private');
  });
  it('rejects malformed provider fixtures before graph computation', async () => {
    const response = await createNetworkHandler(new DemoProvider({ nodes: [] }))();
    expect(response.status).toBe(503);
  });
  it('preserves network JSON shape and adds honest metadata headers', async () => {
    const response = await createNetworkHandler()();
    expect(await response.json()).toEqual(dataset);
    expect(response.headers.get('X-FloodRoute-Mode')).toBe('demo');
    expect(response.headers.get('X-FloodRoute-Freshness')).toBeTruthy();
  });
});
