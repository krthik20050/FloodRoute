import { analyze, analysisInput } from './analyze';
import { demoProvider, getFreshnessMetadata, type DataProvider } from './data-provider';

const MAX_BYTES = 8192;
const unavailable = () =>
  Response.json({ error: 'Network data is unavailable. Try again later.' }, { status: 503 });
export function createNetworkHandler(provider: DataProvider = demoProvider) {
  return async function GET() {
    try {
      const data = await provider.load();
      const freshness = getFreshnessMetadata(data);
      return Response.json(data, {
        headers: {
          'X-FloodRoute-Mode': provider.mode,
          'X-FloodRoute-Freshness': freshness.state,
          'Cache-Control': 'no-store',
        },
      });
    } catch {
      return unavailable();
    }
  };
}

async function readBody(request: Request): Promise<unknown | Response> {
  if (Number(request.headers.get('content-length')) > MAX_BYTES)
    return Response.json({ error: 'Request body too large.' }, { status: 413 });
  if (!request.body) return Response.json({ error: 'A JSON body is required.' }, { status: 400 });
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) {
        await reader.cancel();
        return Response.json({ error: 'Request body too large.' }, { status: 413 });
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return Response.json({ error: 'Malformed JSON.' }, { status: 400 });
  }
}

export function createAnalyzeHandler(provider: DataProvider = demoProvider) {
  return async function POST(request: Request) {
    let body: unknown;
    try {
      body = await readBody(request);
    } catch {
      return Response.json({ error: 'Unable to read request body.' }, { status: 400 });
    }
    if (body instanceof Response) return body;
    const parsed = analysisInput.safeParse(body);
    if (!parsed.success)
      return Response.json(
        { error: 'Expected origin, destination and an array of road IDs.' },
        { status: 400 },
      );
    let data;
    try {
      data = await provider.load();
    } catch {
      return unavailable();
    }
    try {
      return Response.json(analyze(parsed.data, data), {
        headers: { 'Cache-Control': 'no-store' },
      });
    } catch (error) {
      if (error instanceof RangeError)
        return Response.json({ error: error.message }, { status: 400 });
      return unavailable();
    }
  };
}
