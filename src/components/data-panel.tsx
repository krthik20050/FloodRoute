import { Beaker, ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import type { Dataset } from '@/lib/domain';
const sources = [
  {
    name: 'Kerala SDMA',
    type: 'Historical hazard maps & official guidance',
    url: 'https://sdma.kerala.gov.in/hazard-maps/',
  },
  {
    name: 'IMD Hydrology',
    type: 'Official hydrological information',
    url: 'https://hydro.imd.gov.in/national/',
  },
  {
    name: 'CWC FloodWatch India',
    type: 'Official river monitoring application',
    url: 'https://play.google.com/store/apps/details?id=in.gov.affcwc',
  },
];
export function DataPanel({ dataset }: { dataset: Dataset }) {
  return (
    <div className="data-panel">
      <div className="section-heading">
        <span className="section-icon">
          <FileText size={19} />
        </span>
        <div>
          <h2>Know your data</h2>
          <p>Origin, freshness and limitations.</p>
        </div>
      </div>
      <div className="data-source-block">
        <span className="small-tag">
          <Beaker size={12} /> Demo fixture
        </span>
        <h3>{dataset.provenance.source}</h3>
        <p>{dataset.provenance.description}</p>
        <dl>
          <dt>Fixture timestamp</dt>
          <dd>
            {new Date(dataset.provenance.generatedAt).toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            IST
          </dd>
          <dt>Live freshness</dt>
          <dd>Not applicable: synthetic data</dd>
          <dt>Coverage</dt>
          <dd>
            {dataset.nodes.length} nodes, {dataset.edges.length} illustrative roads
          </dd>
          <dt>Facility operation</dt>
          <dd>Unverified, fictional locations</dd>
          <dt>Flood shading</dt>
          <dd>Illustrative polygon, not a hazard model</dd>
        </dl>
      </div>
      <h3 className="source-links-heading">Official reference sources</h3>
      <p className="simulation-hint">Reference links only. These feeds are not connected.</p>
      <div className="source-links">
        {sources.map((source) => (
          <a href={source.url} key={source.name} target="_blank" rel="noreferrer">
            <span>
              <strong>{source.name}</strong>
              <small>{source.type}</small>
            </span>
            <ExternalLink size={15} />
          </a>
        ))}
      </div>
      <div className="assumptions">
        <ShieldCheck size={17} />
        <p>
          No official road status, operational shelter list or real-time warning feed has been
          verified for this demo. Missing reports never establish that a road is open.
        </p>
      </div>
      <details className="all-roads">
        <summary>Scenario report provenance</summary>
        <div>
          {dataset.incidents.map((incident) => (
            <article className="provenance-row" key={incident.id}>
              <h4>{incident.title}</h4>
              <p>{incident.source}</p>
              <small>{incident.observedAt} · simulated · active fixture</small>
              <p>{incident.description}</p>
            </article>
          ))}
        </div>
      </details>
    </div>
  );
}
