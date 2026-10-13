import { UndirectedGraph } from 'graphology';
import { dijkstra } from 'graphology-shortest-path';
import { z } from 'zod';
import type { Analysis, Dataset, Route } from './domain';
import { dataset } from './fixtures';

export const analysisInput = z
  .object({
    origin: z.string().min(1).max(80),
    destination: z.string().min(1).max(80),
    closures: z.array(z.string().min(1).max(80)).max(100),
  })
  .strict();
export function analyze(input: z.infer<typeof analysisInput>, data: Dataset = dataset): Analysis {
  const ids = new Set(data.nodes.map((node) => node.id));
  const edgeIds = new Set(data.edges.map((edge) => edge.id));
  if (
    !ids.has(input.origin) ||
    !ids.has(input.destination) ||
    input.closures.some((id) => !edgeIds.has(id))
  )
    throw new RangeError('Unknown origin, destination or road ID.');
  const closedEdges = [...new Set(input.closures)];
  const build = (closed: string[]) => {
    const graph = new UndirectedGraph();
    data.nodes.forEach((node) => graph.addNode(node.id));
    data.edges
      .filter((edge) => !closed.includes(edge.id))
      .forEach((edge) =>
        graph.addEdgeWithKey(edge.id, edge.from, edge.to, { weight: edge.weight }),
      );
    return graph;
  };
  const baselineGraph = build([]);
  const graph = build(closedEdges);
  const routeFor = (network: UndirectedGraph, destination: string): Route | null => {
    const nodeIds = dijkstra.bidirectional(network, input.origin, destination, 'weight');
    if (!nodeIds) return null;
    const edges = nodeIds
      .slice(1)
      .map(
        (node, index) => data.edges.find((edge) => edge.id === network.edge(nodeIds[index], node))!,
      );
    const coordinates = edges.flatMap((edge, index) => {
      const points =
        edge.from === nodeIds[index] ? edge.coordinates : [...edge.coordinates].reverse();
      return index === 0 ? points : points.slice(1);
    });
    if (!edges.length) {
      const node = data.nodes.find((node) => node.id === input.origin)!;
      coordinates.push([node.lat, node.lng]);
    }
    return {
      nodeIds,
      edgeIds: edges.map((edge) => edge.id),
      coordinates,
      weight: Math.round(edges.reduce((sum, edge) => sum + edge.weight, 0) * 10) / 10,
    };
  };
  const baseline = routeFor(baselineGraph, input.destination);
  const route = routeFor(graph, input.destination);
  const facilities = data.nodes
    .filter((node) => ['hospital', 'shelter', 'relief'].includes(node.kind))
    .map((node) => ({
      node,
      reachable: routeFor(graph, node.id) !== null,
      baselineReachable: routeFor(baselineGraph, node.id) !== null,
    }));
  const isolatedSettlements = data.nodes.filter(
    (node) => node.kind === 'settlement' && routeFor(graph, node.id) === null,
  );
  const visited = new Set<string>();
  let components = 0;
  for (const node of data.nodes) {
    if (visited.has(node.id)) continue;
    components++;
    const pending = [node.id];
    while (pending.length) {
      const id = pending.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      pending.push(...graph.neighbors(id).filter((id) => !visited.has(id)));
    }
  }
  const explanations = [
    'Demo analysis only: fictional network and simulated closures. A computed path is not a verified safe route.',
  ];
  if (!closedEdges.length)
    explanations.push('No closures selected. Showing the weighted baseline path.');
  if (!route) explanations.push('Selected closures disconnect the destination from the origin.');
  else if (baseline && route.weight > baseline.weight)
    explanations.push(
      `Closure-aware route adds ${(route.weight - baseline.weight).toFixed(1)} illustrative km to the baseline.`,
    );
  else explanations.push('The selected destination remains connected without a longer path.');
  facilities
    .filter((facility) => !facility.reachable)
    .forEach((facility) =>
      explanations.push(`${facility.node.name} is unreachable from the selected origin.`),
    );
  return {
    baseline,
    route,
    facilities,
    isolatedSettlements,
    components,
    explanations,
    closedEdges,
  };
}
