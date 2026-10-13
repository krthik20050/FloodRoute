import type { Dataset, Analysis } from '../lib/domain';
export async function loadNetwork(signal: AbortSignal): Promise<Dataset> {
  if (process.env.NEXT_PUBLIC_STATIC_DEMO === '1') {
    const { loadStaticNetwork } = await import('./static-scenario');
    return loadStaticNetwork(signal);
  }
  const response = await fetch('/api/network', { signal });
  if (!response.ok) throw new Error('The scenario network could not load.');
  return response.json();
}
export async function calculateScenario(
  input: { origin: string; destination: string; closures: string[] },
  signal: AbortSignal,
): Promise<Analysis> {
  if (process.env.NEXT_PUBLIC_STATIC_DEMO === '1') {
    const { analyzeStaticScenario } = await import('./static-scenario');
    return analyzeStaticScenario(input, signal);
  }
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(typeof result.error === 'string' ? result.error : 'Route analysis failed.');
  return result;
}
