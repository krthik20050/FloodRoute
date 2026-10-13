'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRef, useState, type KeyboardEvent } from 'react';
import {
  Activity,
  ArrowRight,
  Beaker,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Compass,
  Download,
  ExternalLink,
  GitFork,
  Hospital,
  Info,
  Layers,
  LifeBuoy,
  LoaderCircle,
  MapPinned,
  RotateCcw,
  Route as RouteIcon,
  ShieldCheck,
  SlidersHorizontal,
  Tent,
  TriangleAlert,
  Waves,
  X,
} from 'lucide-react';
import type { NetworkNode } from '@/lib/domain';
import { useScenario } from '@/features/use-scenario';
import { RoutePanel } from './route-panel';
import { SimulationPanel } from './simulation-panel';
import { DataPanel } from './data-panel';

const NetworkMap = dynamic(() => import('./network-map'), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <LoaderCircle className="spin" /> Loading map workspace…
    </div>
  ),
});
type Tab = 'plan' | 'simulate' | 'data';
export function Workspace() {
  const {
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
  } = useScenario();
  const [tab, setTab] = useState<Tab>('plan');
  const [hazards, setHazards] = useState(true);
  const [facilities, setFacilities] = useState(true);
  const [roads, setRoads] = useState(true);
  const [layersOpen, setLayersOpen] = useState(false);
  const [about, setAbout] = useState(false);
  const plannerRef = useRef<HTMLDivElement>(null);
  function switchTabWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    const tabs: Tab[] = ['plan', 'simulate', 'data'];
    const current = tabs.indexOf(tab);
    let next = current;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setTab(tabs[next]);
    document.getElementById(`${tabs[next]}-tab`)?.focus();
  }
  function selectDestination(id: string) {
    setDestination(id);
    setTab('plan');
    if (window.innerWidth <= 700)
      plannerRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
  }
  const reachable = analysis?.facilities.filter((f) => f.reachable).length ?? 0;
  const total =
    analysis?.facilities.length ??
    dataset?.nodes.filter((n) => ['hospital', 'shelter', 'relief'].includes(n.kind)).length ??
    0;
  const isolated = analysis?.isolatedSettlements.length ?? 0;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#planner">
        Skip to route planner
      </a>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="FloodRoute home">
          <span className="brand-mark">
            <Waves size={24} />
          </span>
          <span>
            flood<span className="brand-light">route</span>
            <span className="brand-dot">.</span>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={tab !== 'data' ? 'active' : ''} onClick={() => setTab('plan')}>
            <MapPinned size={17} />
            Map workspace
          </button>
          <button className={tab === 'data' ? 'active' : ''} onClick={() => setTab('data')}>
            <Layers size={17} />
            Data & sources
          </button>
        </nav>
        <div className="top-actions">
          <span className="demo-badge">
            <Beaker size={14} />
            Simulation mode
          </span>
          <button
            className="help-button"
            aria-label="About FloodRoute"
            onClick={() => setAbout((v) => !v)}
          >
            <CircleHelp size={19} />
          </button>
        </div>
      </header>
      <div className="safety-banner">
        <ShieldCheck size={16} />
        <span>
          <strong>A planning prototype.</strong> Scenarios use illustrative data. Follow current
          official emergency instructions.
        </span>
        <a href="https://sdma.kerala.gov.in/" target="_blank" rel="noreferrer">
          KSDMA <ExternalLink size={12} />
        </a>
      </div>
      <main className="main-workspace">
        <aside className="planner" id="planner" ref={plannerRef}>
          <div className="planner-intro">
            <span className="region-label">
              <span /> Kerala, India
            </span>
            <h1>
              Every connection
              <br />
              matters.
            </h1>
            <p>
              Explore the routes that keep
              <br className="desktop-break" /> communities connected.
            </p>
          </div>
          <div
            className="panel-tabs"
            role="tablist"
            aria-label="Workspace tools"
            onKeyDown={switchTabWithKeyboard}
          >
            <button
              id="plan-tab"
              role="tab"
              tabIndex={tab === 'plan' ? 0 : -1}
              aria-selected={tab === 'plan'}
              aria-controls="tool-panel"
              onClick={() => setTab('plan')}
            >
              <RouteIcon size={15} />
              Plan a route
            </button>
            <button
              id="simulate-tab"
              role="tab"
              tabIndex={tab === 'simulate' ? 0 : -1}
              aria-selected={tab === 'simulate'}
              aria-controls="tool-panel"
              onClick={() => setTab('simulate')}
            >
              <SlidersHorizontal size={15} />
              Simulate
            </button>
            <button
              id="data-tab"
              role="tab"
              tabIndex={tab === 'data' ? 0 : -1}
              aria-selected={tab === 'data'}
              aria-controls="tool-panel"
              onClick={() => setTab('data')}
            >
              <Info size={15} />
              Data
            </button>
          </div>
          <div
            id="tool-panel"
            role="tabpanel"
            aria-labelledby={`${tab}-tab`}
            className="tool-panel"
          >
            {networkError ? (
              <div className="error-state">
                <TriangleAlert />
                <h2>Network unavailable</h2>
                <p>{networkError}</p>
                <button className="primary-button" onClick={() => setRetry((v) => v + 1)}>
                  Try again
                </button>
              </div>
            ) : !dataset ? (
              <div className="panel-loading">
                <LoaderCircle className="spin" />
                Loading scenario network…
              </div>
            ) : tab === 'plan' ? (
              <RoutePanel
                dataset={dataset}
                analysis={analysis}
                origin={origin}
                destination={destination}
                setOrigin={setOrigin}
                setDestination={setDestination}
                loading={loading}
                closures={closures}
                error={error}
                onRetry={() => setRetry((v) => v + 1)}
                onSimulate={() => setTab('simulate')}
              />
            ) : tab === 'simulate' ? (
              <SimulationPanel
                dataset={dataset}
                closures={closures}
                toggleClosure={toggleClosure}
                setClosures={setClosures}
                onSave={saveScenario}
              />
            ) : (
              <DataPanel dataset={dataset} />
            )}
          </div>
          <div className="sidebar-footer">
            <Info size={15} />
            <p>
              No live flood feed connected.
              <br />
              <button onClick={() => setTab('data')}>
                Inspect data & assumptions <ChevronRight size={13} />
              </button>
            </p>
          </div>
        </aside>
        <section className="map-workspace" aria-label="Network and accessibility">
          <div className="workspace-toolbar">
            <div>
              <span className="workspace-kicker">Community accessibility lab</span>
              <h2>
                {tab === 'simulate'
                  ? 'Change the network. See the impact.'
                  : 'A clearer view of what connects us.'}
              </h2>
            </div>
            <div className="workspace-tools">
              <div className="layer-control">
                <button
                  className="secondary-button"
                  aria-label="Layers"
                  aria-expanded={layersOpen}
                  onClick={() => setLayersOpen((v) => !v)}
                >
                  <Layers size={16} />
                  <span>Layers</span>
                  <ChevronDown size={14} />
                </button>
                {layersOpen && (
                  <div className="layer-popover">
                    <strong>Map layers</strong>
                    <label>
                      <input
                        type="checkbox"
                        checked={roads}
                        onChange={(e) => setRoads(e.target.checked)}
                      />
                      Scenario roads
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={facilities}
                        onChange={(e) => setFacilities(e.target.checked)}
                      />
                      Essential facilities
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={hazards}
                        onChange={(e) => setHazards(e.target.checked)}
                      />
                      Illustrative flood zone
                    </label>
                  </div>
                )}
              </div>
              <button
                className="secondary-button export-button"
                aria-label="Export scenario"
                onClick={exportScenario}
                disabled={!analysis}
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
          <div className="map-frame">
            {dataset ? (
              <NetworkMap
                dataset={dataset}
                analysis={analysis}
                origin={origin}
                destination={destination}
                closures={closures}
                hazards={hazards}
                facilities={facilities}
                roads={roads}
                onToggle={toggleClosure}
                onSelect={selectDestination}
              />
            ) : (
              <div className="map-loading">
                <Compass size={36} />
                <p>
                  {networkError
                    ? 'Map requires the scenario network.'
                    : 'Preparing the Periyar workspace…'}
                </p>
              </div>
            )}
            <div className="scenario-status">
              <span className={closures.length ? 'status-dot orange' : 'status-dot'} />
              <span>
                {closures.length
                  ? `${closures.length} simulated ${closures.length === 1 ? 'closure' : 'closures'}`
                  : 'Baseline network'}
                <small>
                  {loading
                    ? 'Calculating accessibility…'
                    : 'Click a road or use the simulation controls'}
                </small>
              </span>
              {closures.length > 0 && (
                <button
                  title="Reset closures"
                  aria-label="Reset all closures"
                  onClick={() => setClosures([])}
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
          </div>
          <section className="accessibility-strip" aria-labelledby="accessibility-heading">
            <div className="accessibility-title">
              <span className="section-icon">
                <GitFork size={20} />
              </span>
              <div>
                <h2 id="accessibility-heading">Access to essentials</h2>
                <p>From {dataset?.nodes.find((n) => n.id === origin)?.name ?? 'your origin'}</p>
              </div>
              <span className="access-count">
                {loading ? '…' : `${reachable}/${total}`}
                <small>reachable</small>
              </span>
            </div>
            <div className="facility-list">
              {analysis?.facilities.map(({ node, reachable, baselineReachable }) => (
                <FacilityItem
                  key={node.id}
                  node={node}
                  reachable={reachable}
                  lost={baselineReachable && !reachable}
                  onClick={() => selectDestination(node.id)}
                />
              ))}
              {!analysis && (
                <p className="muted">
                  {error
                    ? 'Analysis unavailable. Retry the route calculation.'
                    : 'Calculating facility reachability…'}
                </p>
              )}
            </div>
            {analysis && (
              <div className="connectivity-note">
                <span>
                  <Activity size={14} />
                  {analysis.components} network{' '}
                  {analysis.components === 1 ? 'component' : 'components'}
                </span>
                <span className={isolated ? 'text-warning' : ''}>
                  {isolated
                    ? `${isolated} settlements disconnected from origin`
                    : 'All configured settlements connected to origin'}
                </span>
              </div>
            )}
          </section>
        </section>
      </main>
      {about && (
        <aside className="about-panel" aria-label="About FloodRoute">
          <button className="close-about" aria-label="Close about" onClick={() => setAbout(false)}>
            <X size={18} />
          </button>
          <span className="brand-mark">
            <Waves size={24} />
          </span>
          <h2>
            Understand the impact
            <br />
            of a broken connection.
          </h2>
          <p>
            FloodRoute explores how road and bridge closures affect access to hospitals, shelters
            and relief points.
          </p>
          <p>
            This MVP uses a small, fictional network near Aluva. Facilities, road geometry and flood
            extents are illustrative. A connected route does not establish travel safety.
          </p>
          <button
            className="primary-button"
            onClick={() => {
              setAbout(false);
              setTab('simulate');
            }}
          >
            Open simulation lab <ArrowRight size={16} />
          </button>
        </aside>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

function FacilityItem({
  node,
  reachable,
  lost,
  onClick,
}: {
  node: NetworkNode;
  reachable: boolean;
  lost: boolean;
  onClick: () => void;
}) {
  const Icon = node.kind === 'hospital' ? Hospital : node.kind === 'shelter' ? Tent : LifeBuoy;
  return (
    <button className={`facility-item ${reachable ? '' : 'unreachable'}`} onClick={onClick}>
      <span className="facility-icon">
        <Icon size={19} />
      </span>
      <span>
        <strong>{node.name}</strong>
        <small>
          {reachable
            ? 'Connected in scenario'
            : lost
              ? 'Access lost in this scenario'
              : 'Unreachable from origin'}
        </small>
      </span>
      {reachable ? <Check size={15} /> : <TriangleAlert size={15} />}
    </button>
  );
}
