'use client';
import {
  ArrowRight,
  Beaker,
  ChevronDown,
  GitFork,
  RotateCcw,
  Save,
  TriangleAlert,
} from 'lucide-react';
import type { Dataset } from '@/lib/domain';

interface Props {
  dataset: Dataset;
  closures: string[];
  toggleClosure: (id: string) => void;
  setClosures: (ids: string[]) => void;
  onSave: () => void;
}
const presets = [
  {
    name: 'Bridge closure',
    description: 'Reroute through the northern bypass.',
    closures: ['bridge-east'],
  },
  {
    name: 'Hospital cutoff',
    description: 'Remove the hospital’s only approach.',
    closures: ['hospital-access'],
  },
  {
    name: 'Compound flooding',
    description: 'Bridge, hospital and shelter affected.',
    closures: ['bridge-east', 'hospital-access', 'shelter-access'],
  },
];
export function SimulationPanel({ dataset, closures, toggleClosure, setClosures, onSave }: Props) {
  return (
    <div className="simulation-panel">
      <div className="section-heading">
        <span className="section-icon">
          <Beaker size={19} />
        </span>
        <div>
          <h2>Try a disruption</h2>
          <p>Close an example road and see which routes change.</p>
        </div>
      </div>
      <div className="scenario-presets">
        {presets.map((preset) => (
          <button
            key={preset.name}
            className={
              closures.slice().sort().join() === preset.closures.slice().sort().join()
                ? 'selected'
                : ''
            }
            onClick={() => setClosures(preset.closures)}
          >
            <span>
              <strong>{preset.name}</strong>
              <small>{preset.description}</small>
            </span>
            <ArrowRight size={16} />
          </button>
        ))}
      </div>
      <div className="simulation-subhead">
        <h3>Example road closures</h3>
        <span>{closures.length} closures</span>
      </div>
      <p className="simulation-hint">Switch on a closure below, then return to Plan a route.</p>
      <div className="incident-list">
        {dataset.incidents.map((incident) => {
          const active = closures.includes(incident.edgeId);
          return (
            <label className={`incident-row ${active ? 'incident-active' : ''}`} key={incident.id}>
              <div className={`incident-symbol ${incident.severity}`}>
                <TriangleAlert size={17} />
              </div>
              <div>
                <strong>{incident.title}</strong>
                <small>{dataset.edges.find((edge) => edge.id === incident.edgeId)?.name}</small>
                <span className="incident-meta">Simulated · {incident.severity} disruption</span>
              </div>
              <input
                className="switch-input"
                type="checkbox"
                aria-label={incident.title}
                checked={active}
                onChange={() => toggleClosure(incident.edgeId)}
              />
              <span className="switch-track" aria-hidden="true" />
            </label>
          );
        })}
      </div>
      <details className="all-roads">
        <summary>
          Choose any demo road <ChevronDown size={14} />
        </summary>
        <div>
          {dataset.edges.map((edge) => (
            <label key={edge.id}>
              <input
                type="checkbox"
                checked={closures.includes(edge.id)}
                onChange={() => toggleClosure(edge.id)}
              />
              <span>
                {edge.name}
                <small>
                  {closures.includes(edge.id) ? 'Removed from scenario' : 'Included in scenario'}
                </small>
              </span>
            </label>
          ))}
        </div>
      </details>
      <div className="simulation-actions">
        <button
          className="secondary-button"
          onClick={() => setClosures([])}
          disabled={!closures.length}
        >
          <RotateCcw size={15} />
          Reset scenario
        </button>
        <button className="secondary-button" onClick={onSave}>
          <Save size={15} />
          Save locally
        </button>
      </div>
      <div className="assumptions">
        <GitFork size={16} />
        <p>
          Closing a road blocks both directions in this demo. Blue flood shading is only an example;
          it does not close any roads by itself.
        </p>
      </div>
    </div>
  );
}
