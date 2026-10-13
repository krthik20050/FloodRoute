import type { Analysis, Dataset } from '../lib/domain';
import type { WorkerReply, WorkerRequest } from '../workers/scenario.worker';
function run<T extends Dataset | Analysis>(
  message: WorkerRequest,
  signal: AbortSignal,
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const worker = new Worker(new URL('../workers/scenario.worker.ts', import.meta.url));
    const cleanup = () => {
      worker.terminate();
      signal.removeEventListener('abort', abort);
    };
    const abort = () => {
      cleanup();
      reject(signal.reason);
    };
    signal.addEventListener('abort', abort, { once: true });
    worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      cleanup();
      if (event.data.ok) resolve(event.data.result as T);
      else reject(new Error(event.data.error));
    };
    worker.onerror = () => {
      cleanup();
      reject(new Error('Simulation worker could not start. Reload the page and try again.'));
    };
    worker.postMessage(message);
  });
}
export const loadStaticNetwork = (signal: AbortSignal) => run<Dataset>({ kind: 'network' }, signal);
export const analyzeStaticScenario = (input: unknown, signal: AbortSignal) =>
  run<Analysis>({ kind: 'analyze', input }, signal);
