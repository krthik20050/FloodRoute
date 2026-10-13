'use client';
import { useEffect, useRef, useState } from 'react';
import type { Dataset, Analysis } from '@/lib/domain';
import { loadNetwork, calculateScenario } from './scenario-client';
const STORAGE_KEY = 'floodroute-scenario-v1';
export function useScenario() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [origin, setOrigin] = useState('aluva');
  const [destination, setDestination] = useState('hospital');
  const [closures, setClosures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [networkError, setNetworkError] = useState('');
  const [toast, setToast] = useState('');
  const [retry, setRetry] = useState(0);
  const restored = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const network = await loadNetwork(
          AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
        );
        setDataset(network);
        setNetworkError('');
        if (!restored.current) {
          restored.current = true;
          try {
            const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
            if (
              saved &&
              typeof saved === 'object' &&
              'closures' in saved &&
              Array.isArray(saved.closures)
            ) {
              setClosures(
                saved.closures.filter(
                  (id): id is string =>
                    typeof id === 'string' && network.edges.some((e) => e.id === id),
                ),
              );
            }
          } catch {
            setToast('Saved scenario could not be restored. Starting fresh.');
          }
        }
      } catch (e) {
        if (!controller.signal.aborted) {
          setNetworkError(e instanceof Error ? e.message : 'Could not load the network.');
          setLoading(false);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [retry]);

  useEffect(() => {
    if (!dataset) return;
    const controller = new AbortController();
    async function calculate() {
      setLoading(true);
      setError('');
      setAnalysis(null);
      try {
        const result = await calculateScenario(
          { origin, destination, closures },
          AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
        );
        if (!controller.signal.aborted) setAnalysis(result);
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : 'Route analysis failed. Try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void calculate();
    return () => controller.abort();
  }, [dataset, origin, destination, closures, retry]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  function toggleClosure(id: string) {
    setClosures((current) =>
      current.includes(id) ? current.filter((e) => e !== id) : [...current, id],
    );
  }
  function saveScenario() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ closures }));
      setToast('Scenario saved on this browser.');
    } catch {
      setToast('Browser storage unavailable. You can export the scenario instead.');
    }
  }
  function exportScenario() {
    const payload = {
      product: 'FloodRoute',
      mode: 'simulation',
      exportedAt: new Date().toISOString(),
      origin,
      destination,
      closures,
      analysis,
      disclaimer: 'Illustrative scenario only. Not verified travel guidance.',
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'floodroute-scenario.json';
    link.click();
    URL.revokeObjectURL(url);
    setToast('Scenario exported as JSON.');
  }
  return {
    dataset,
    analysis,
    origin,
    setOrigin,
    destination,
    setDestination,
    closures,
    setClosures,
    loading,
    error,
    networkError,
    toast,
    setRetry,
    toggleClosure,
    saveScenario,
    exportScenario,
  };
}
