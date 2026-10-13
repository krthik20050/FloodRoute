import { describe, expect, it } from 'vitest';
import { POST } from '../src/app/api/analyze/route';
import { GET } from '../src/app/api/network/route';

const valid = { origin: 'aluva', destination: 'hospital', closures: [] };
const request = (body?: string, headers?: HeadersInit) =>
  new Request('http://localhost/api/analyze', { method: 'POST', body, headers });

describe('public simulation API boundaries', () => {
  it('returns provenance and analysis without credentials', async () => {
    const network = await GET();
    expect(network.status).toBe(200);
    expect((await network.json()).provenance.mode).toBe('demo');
    const response = await POST(request(JSON.stringify(valid)));
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.route.weight).toBe(4.6);
    expect(result.explanations[0]).toContain('not a verified safe route');
  });
  it.each([undefined, '', '{', 'null', '[]'])(
    'rejects missing or malformed input %s',
    async (body) => {
      expect((await POST(request(body))).status).toBe(400);
    },
  );
  it.each([
    { ...valid, origin: 'unknown' },
    { ...valid, destination: 'unknown' },
    { ...valid, closures: ['unknown-road'] },
    { ...valid, closures: 'bridge-east' },
    { ...valid, admin: true },
    { ...valid, closures: Array(101).fill('bridge-east') },
  ])('rejects invalid IDs, types, extra fields and unbounded closure lists', async (body) => {
    expect((await POST(request(JSON.stringify(body)))).status).toBe(400);
  });
  it('bounds actual bytes even without a content-length header', async () => {
    expect((await POST(request(' '.repeat(8193)))).status).toBe(413);
    expect((await POST(request('雪'.repeat(3000)))).status).toBe(413);
    expect((await POST(request('{}', { 'content-length': '8193' }))).status).toBe(413);
  });
  it('does not mutate the fixture between callers', async () => {
    const closed = await (
      await POST(request(JSON.stringify({ ...valid, closures: ['hospital-access'] })))
    ).json();
    expect(closed.route).toBeNull();
    const fresh = await (await POST(request(JSON.stringify(valid)))).json();
    expect(fresh.route.weight).toBe(4.6);
    expect(fresh.closedEdges).toEqual([]);
  });
});
