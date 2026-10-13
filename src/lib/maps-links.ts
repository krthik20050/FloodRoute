import type { NetworkNode } from './domain';

export function mapsLinks(start: NetworkNode, end: NetworkNode) {
  const web = `https://www.google.com/maps/dir/?${new URLSearchParams({
    api: '1',
    origin: `${start.lat},${start.lng}`,
    destination: `${end.lat},${end.lng}`,
    travelmode: 'driving',
  })}`;
  // A user-activated Android Chrome intent targets Maps instead of its web renderer.
  const android = `intent://${web.slice('https://'.length)}#Intent;scheme=https;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(web)};end`;
  return { web, android };
}
