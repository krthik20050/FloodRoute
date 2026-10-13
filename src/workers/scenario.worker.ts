import { analyze, analysisInput } from '../lib/analyze';
import { demoProvider } from '../lib/demo-data';
import type { Analysis, Dataset } from '../lib/domain';
export type WorkerRequest = { kind: 'network' } | { kind: 'analyze'; input: unknown };
export type WorkerReply = { ok: true; result: Analysis | Dataset } | { ok: false; error: string };
self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  try {
    const data = await demoProvider.load();
    const result =
      event.data.kind === 'network' ? data : analyze(analysisInput.parse(event.data.input), data);
    self.postMessage({ ok: true, result } satisfies WorkerReply);
  } catch {
    self.postMessage({
      ok: false,
      error: 'The simulated network could not be analyzed. Reset the scenario and try again.',
    } satisfies WorkerReply);
  }
});
