'use client';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocateFixed, Layers, Map as MapIcon } from 'lucide-react';
import type { Dataset, Analysis } from '@/lib/domain';
import 'leaflet/dist/leaflet.css';

interface Props {
  dataset: Dataset;
  analysis: Analysis | null;
  origin: string;
  destination: string;
  closures: string[];
  hazards: boolean;
  facilities: boolean;
  roads: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}
function label(text: string) {
  const element = document.createElement('span');
  element.textContent = text;
  return element;
}

export default function NetworkMap({
  dataset,
  analysis,
  origin,
  destination,
  closures,
  hazards,
  facilities,
  roads,
  onToggle,
  onSelect,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [tileError, setTileError] = useState(false);
  const [basemap, setBasemap] = useState(true);
  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current, {
      center: [10.115, 76.365],
      zoom: 12,
      zoomControl: false,
      scrollWheelZoom: true,
    });
    mapRef.current = map;
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(
      dataset.nodes.map((n) => [n.lat, n.lng] as [number, number]),
      { padding: [65, 65], maxZoom: 13, animate: false },
    );
  }, [dataset]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !basemap) return;
    const tile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    tile.on('tileerror', () => setTileError(true));
    return () => {
      tile.off();
      map.removeLayer(tile);
    };
  }, [basemap]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layers = L.layerGroup().addTo(map);
    const closed = new Set(closures);
    if (hazards)
      L.polygon(
        [
          [10.123, 76.315],
          [10.138, 76.338],
          [10.13, 76.37],
          [10.115, 76.392],
          [10.105, 76.377],
          [10.116, 76.35],
          [10.109, 76.326],
        ],
        {
          interactive: false,
          color: '#729ec2',
          fillColor: '#9cc9e4',
          fillOpacity: 0.3,
          weight: 1,
          dashArray: '5 7',
        },
      ).addTo(layers);
    if (roads)
      dataset.edges.forEach((edge) =>
        L.polyline(edge.coordinates, {
          color: closed.has(edge.id) ? '#d96746' : '#94a2a5',
          weight: closed.has(edge.id) ? 6 : 4,
          opacity: closed.has(edge.id) ? 1 : 0.7,
          dashArray: closed.has(edge.id) ? '8 8' : undefined,
        })
          .bindTooltip(
            label(
              edge.name +
                ' · ' +
                (closed.has(edge.id) ? 'Simulated closed' : 'Scenario connection') +
                ' · Click to toggle',
            ),
            { sticky: true },
          )
          .on('click', () => onToggle(edge.id))
          .addTo(layers),
      );
    if (analysis?.baseline && closures.length)
      L.polyline(analysis.baseline.coordinates, {
        interactive: false,
        color: '#9390b0',
        weight: 5,
        dashArray: '6 8',
        opacity: 0.65,
      }).addTo(layers);
    if (analysis?.route)
      L.polyline(analysis.route.coordinates, {
        interactive: false,
        color: '#6354cf',
        weight: 6,
        opacity: 0.95,
      }).addTo(layers);
    dataset.nodes
      .filter(
        (n) =>
          n.kind !== 'junction' &&
          (facilities || n.kind === 'settlement' || n.id === origin || n.id === destination),
      )
      .forEach((node) => {
        const endpoint = node.id === origin || node.id === destination;
        const unreachable =
          analysis?.facilities.some((f) => f.node.id === node.id && !f.reachable) ||
          analysis?.isolatedSettlements.some((n) => n.id === node.id);
        const fill = endpoint
          ? '#6354cf'
          : unreachable
            ? '#d96746'
            : node.kind === 'hospital'
              ? '#c65a63'
              : node.kind === 'settlement'
                ? '#6d8382'
                : '#34887a';
        L.circleMarker([node.lat, node.lng], {
          radius: endpoint ? 10 : 7,
          color: '#fdfdfb',
          weight: 3,
          fillColor: fill,
          fillOpacity: 1,
        })
          .bindTooltip(
            label(
              (node.id === origin ? 'Origin: ' : node.id === destination ? 'Destination: ' : '') +
                node.name +
                (unreachable ? ' · Unreachable in scenario' : ''),
            ),
            {
              direction: node.id === destination ? 'left' : 'top',
              offset: node.id === destination ? [-12, -32] : [0, -8],
              permanent: endpoint,
              className: 'place-label',
            },
          )
          .on('click', () => onSelect(node.id))
          .addTo(layers);
      });
    return () => {
      layers.clearLayers();
      map.removeLayer(layers);
    };
  }, [
    dataset,
    analysis,
    origin,
    destination,
    closures,
    hazards,
    facilities,
    roads,
    onToggle,
    onSelect,
  ]);
  function fitNetwork() {
    mapRef.current?.fitBounds(
      dataset.nodes.map((n) => [n.lat, n.lng] as [number, number]),
      { padding: [65, 65], maxZoom: 13, animate: false },
    );
  }
  return (
    <div className="map-canvas" aria-label="Interactive simulated road network near Aluva">
      <div ref={container} className="leaflet-map" />
      <div className="map-location">
        <MapIcon size={15} />
        <span>Aluva & the Periyar corridor</span>
        <span className="map-location-tag">Kerala</span>
      </div>
      <div className="map-tools">
        <button aria-label="Fit network to map" title="Fit network to map" onClick={fitNetwork}>
          <LocateFixed size={19} />
        </button>
        <button
          aria-label={basemap ? 'Hide basemap' : 'Show basemap'}
          aria-pressed={basemap}
          title="Toggle basemap"
          onClick={() => setBasemap((v) => !v)}
        >
          <Layers size={19} />
        </button>
      </div>
      {(tileError || !basemap) && (
        <div className="map-tile-notice">
          {basemap ? 'Some map tiles could not load.' : 'Basemap hidden.'} The scenario network
          remains interactive.
        </div>
      )}
      <div className="map-legend">
        <span>
          <i className="legend-line route" />
          Scenario route
        </span>
        <span>
          <i className="legend-line closure" />
          Simulated closure
        </span>
        {closures.length > 0 && (
          <span>
            <i className="legend-line baseline" />
            Original route
          </span>
        )}
        {hazards && (
          <span>
            <i className="legend-area" />
            Illustrative flood zone
          </span>
        )}
      </div>
      <div className="map-caption">Illustrative network. Lines are not surveyed road geometry.</div>
      <span className="sr-only">
        Road closures and destination selection are also available through the route and simulation
        controls.
      </span>
    </div>
  );
}
