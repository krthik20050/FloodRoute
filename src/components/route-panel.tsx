'use client';
import { useState, useSyncExternalStore } from 'react';
import { mapsLinks } from '@/lib/maps-links';
import {
  ArrowDownUp,
  ArrowRight,
  Check,
  ChevronRight,
  CircleDot,
  Flag,
  ExternalLink,
  Info,
  LoaderCircle,
  Navigation,
  Route as RouteIcon,
  TriangleAlert,
} from 'lucide-react';
import type { Analysis, Dataset } from '@/lib/domain';

interface Props {
  dataset: Dataset;
  analysis: Analysis | null;
  origin: string;
  destination: string;
  setOrigin: (id: string) => void;
  setDestination: (id: string) => void;
  loading: boolean;
  closures: string[];
  error: string;
  onRetry: () => void;
  onSimulate: () => void;
}
const subscribeToPlatform = () => () => {};
const androidChrome = () =>
  /Android/i.test(navigator.userAgent) && /Chrome\//i.test(navigator.userAgent);
const serverPlatform = () => false;
export function RoutePanel({
  dataset,
  analysis,
  origin,
  destination,
  setOrigin,
  setDestination,
  loading,
  closures,
  error,
  onRetry,
  onSimulate,
}: Props) {
  const locations = dataset.nodes.filter((n) => n.kind !== 'junction');
  const start = locations.find((node) => node.id === origin);
  const end = locations.find((node) => node.id === destination);
  const links = start && end ? mapsLinks(start, end) : null;
  const isAndroidChrome = useSyncExternalStore(subscribeToPlatform, androidChrome, serverPlatform);
  const [copyMessage, setCopyMessage] = useState('');
  async function copyMapsLink() {
    if (!links) return;
    try {
      await navigator.clipboard.writeText(links.web);
      setCopyMessage('Maps link copied. Paste it into Google Maps or another browser.');
    } catch {
      setCopyMessage('Copy unavailable. Press and hold the browser link to copy it.');
    }
  }
  const changed =
    analysis?.route &&
    analysis.baseline &&
    analysis.route.edgeIds.join() !== analysis.baseline.edgeIds.join();
  return (
    <>
      <form
        className="route-form"
        onSubmit={(e) => {
          e.preventDefault();
          onRetry();
        }}
      >
        <div className="route-inputs">
          <div className="origin-icon">
            <CircleDot size={17} />
            <span className="input-connector" />
          </div>
          <label className="location-input">
            Starting point
            <select
              aria-label="Starting point"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            >
              {locations.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="swap-button"
            aria-label="Swap starting point and destination"
            onClick={() => {
              setOrigin(destination);
              setDestination(origin);
            }}
          >
            <ArrowDownUp size={17} />
          </button>
          <div className="destination-icon">
            <Flag size={17} />
          </div>
          <label className="location-input">
            Destination
            <select
              aria-label="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            >
              {locations.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="transport-note">
          <Navigation size={14} />
          <span>Example places near Aluva</span>
          <span className="small-tag">Demo</span>
        </div>
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? <LoaderCircle size={17} className="spin" /> : <RouteIcon size={17} />}{' '}
          {loading ? 'Calculating…' : 'Check demo route'}
          <ArrowRight size={17} />
        </button>
      </form>
      <div className="route-result" aria-live="polite" aria-busy={loading}>
        {error ? (
          <div className="error-state">
            <TriangleAlert size={24} />
            <h2>Calculation unavailable</h2>
            <p>{error}</p>
            <button className="secondary-button" onClick={onRetry}>
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="result-loading">
            <span className="skeleton" />
            <span className="skeleton short" />
            <p>Checking connections and facility access…</p>
          </div>
        ) : (
          analysis && (
            <>
              <div className="result-heading">
                <span className={analysis.route ? 'result-symbol' : 'result-symbol warning'}>
                  {analysis.route ? <Check size={17} /> : <TriangleAlert size={17} />}
                </span>
                <div>
                  <h2>
                    {analysis.route
                      ? origin === destination
                        ? 'Already at destination'
                        : 'Route available'
                      : 'No connected route'}
                  </h2>
                  <p>
                    {analysis.route
                      ? changed
                        ? 'A detour is available in this demo.'
                        : 'The demo roads connect these places.'
                      : 'A closed demo road blocks this destination.'}
                  </p>
                </div>
              </div>
              {analysis.route && (
                <div className="route-comparison">
                  <div>
                    <span>{changed ? 'Demo detour' : 'Demo distance'}</span>
                    <strong>
                      {analysis.route.weight.toFixed(1)}
                      <small> scenario km</small>
                    </strong>
                  </div>
                  {changed && analysis.baseline && (
                    <div className="baseline-value">
                      <span>Before closures</span>
                      <strong>
                        {analysis.baseline.weight.toFixed(1)}
                        <small> scenario km</small>
                      </strong>
                    </div>
                  )}
                  {changed && analysis.baseline && (
                    <span className="detour-tag">
                      +{(analysis.route.weight - analysis.baseline.weight).toFixed(1)} km in
                      simulation
                    </span>
                  )}
                </div>
              )}
              {!analysis.route && (
                <p className="unreachable-help">
                  Choose another destination or reopen a road in the Simulate tab. This demo cannot
                  tell you whether a real journey is safe.
                </p>
              )}
              {links && origin !== destination && (
                <div className="maps-handoff">
                  <a
                    className="secondary-button maps-button"
                    href={isAndroidChrome ? links.android : links.web}
                    target={isAndroidChrome ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    aria-describedby="maps-disclaimer"
                  >
                    <ExternalLink size={17} /> Open in Google Maps
                  </a>
                  <div className="maps-alternatives">
                    {isAndroidChrome && (
                      <a href={links.web} target="_blank" rel="noopener noreferrer">
                        Open Maps in browser
                      </a>
                    )}
                    <button type="button" onClick={copyMapsLink}>
                      Copy Maps link
                    </button>
                  </div>
                  {copyMessage && <p role="status">{copyMessage}</p>}
                  {isAndroidChrome && (
                    <p>
                      Opens the Google Maps app if installed. If the browser map is blank, copy the
                      link and open it in the Maps app.
                    </p>
                  )}
                  <p id="maps-disclaimer">
                    Opens the selected demo coordinates, not a verified hospital or shelter. Google
                    Maps calculates its own directions; simulated closures are not included. Confirm
                    the real destination before travelling.
                  </p>
                </div>
              )}
              <details className="route-explanation">
                <summary>How this demo route was calculated</summary>
                {closures.length > 0 && (
                  <p>
                    {closures.length} simulated road{' '}
                    {closures.length === 1 ? 'closure is' : 'closures are'} excluded from this
                    calculation.
                  </p>
                )}
                {analysis.explanations.slice(1).map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
                {analysis.route && (
                  <details>
                    <summary>
                      View scenario connections <ChevronRight size={13} />
                    </summary>
                    <ol>
                      {analysis.route.edgeIds.map((id) => (
                        <li key={id}>{dataset.edges.find((e) => e.id === id)?.name}</li>
                      ))}
                    </ol>
                  </details>
                )}
              </details>
              <div className="uncertainty-note">
                <Info size={15} />
                <p>
                  A route on this map does not mean the road is safe. Distances are made-up demo
                  values. Check official advice before travelling.
                </p>
              </div>
            </>
          )
        )}
      </div>
      <button className="simulation-invite" onClick={onSimulate}>
        <span className="invite-icon">
          <RouteIcon size={21} />
        </span>
        <span>
          <strong>What if a bridge closes?</strong>
          <small>Test a scenario and see what changes.</small>
        </span>
        <ArrowRight size={16} />
      </button>
    </>
  );
}
