import { describe, expect, it } from 'vitest';
import { analyze } from '../src/server/analyze';
import { POST } from '../src/app/api/analyze/route';
const input = { origin: 'aluva', destination: 'hospital', closures: [] as string[] };
describe('closure-aware graph analysis', () => {
  it('uses the direct baseline and finds the bypass when the east bridge closes', () => {
    const baseline = analyze(input);
    expect(baseline.route?.edgeIds).toEqual(['bridge-east', 'hospital-access']);
    const result = analyze({ ...input, closures: ['bridge-east'] });
    expect(result.route?.edgeIds).toEqual([
      'west-road',
      'north-west',
      'north-east',
      'hospital-access',
    ]);
    expect(result.route!.weight).toBeGreaterThan(result.baseline!.weight);
    expect(result.components).toBe(1);
  });
  it('reports hospital and shelter cutoffs without inventing fallback paths', () => {
    const result = analyze({ ...input, closures: ['hospital-access', 'shelter-access'] });
    expect(result.route).toBeNull();
    expect(result.baseline).not.toBeNull();
    expect(result.components).toBe(3);
    expect(result.facilities.filter((f) => !f.reachable).map((f) => f.node.id)).toEqual([
      'hospital',
      'shelter',
    ]);
  });
  it('deduplicates closures, detects isolated settlement, and supports same-node paths', () => {
    const result = analyze({ ...input, closures: ['village-access', 'village-access'] });
    expect(result.closedEdges).toEqual(['village-access']);
    expect(result.isolatedSettlements.map((n) => n.id)).toEqual(['village']);
    expect(analyze({ ...input, destination: 'aluva' }).route?.weight).toBe(0);
  });
  it('rejects unknown identifiers', () => {
    expect(() => analyze({ ...input, closures: ['missing'] })).toThrow(RangeError);
  });
  it('orients coordinates correctly for a reversed edge traversal', () => {
    const result = analyze({ origin: 'hospital', destination: 'aluva', closures: [] });
    expect(result.route?.coordinates[0]).toEqual([10.111, 76.387]);
    expect(result.route?.coordinates.at(-1)).toEqual([10.1076, 76.3516]);
    expect(result.route?.edgeIds).toEqual(['hospital-access', 'bridge-east']);
  });
});
describe('analysis API input boundary', () => {
  const request = (body: string) =>
    new Request('http://localhost/api/analyze', { method: 'POST', body });
  it('returns analysis for a valid request', async () => {
    expect((await POST(request(JSON.stringify(input)))).status).toBe(200);
  });
  it('rejects malformed JSON, wrong types, unknown IDs and oversized bodies', async () => {
    expect((await POST(request('{'))).status).toBe(400);
    expect(
      (await POST(request(JSON.stringify({ ...input, closures: 'bridge-east' })))).status,
    ).toBe(400);
    expect((await POST(request(JSON.stringify({ ...input, origin: 'unknown' })))).status).toBe(400);
    expect((await POST(request(' '.repeat(9000)))).status).toBe(413);
  });
});
