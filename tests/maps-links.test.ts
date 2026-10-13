import { describe, expect, it } from 'vitest';
import { mapsLinks } from '../src/lib/maps-links';
import type { NetworkNode } from '../src/lib/domain';
const start: NetworkNode = {
  id: 'start',
  name: 'Example',
  lat: 10.1076,
  lng: 76.3516,
  kind: 'settlement',
};
const end: NetworkNode = { ...start, id: 'end', lat: 10.111, lng: 76.387 };
describe('Maps Android handoff', () => {
  it('preserves coordinates and carries a correctly encoded HTTPS fallback', () => {
    const links = mapsLinks(start, end);
    expect(links.android).toContain('package=com.google.android.apps.maps;');
    expect(
      decodeURIComponent(links.android.split('S.browser_fallback_url=')[1].split(';end')[0]),
    ).toBe(links.web);
    const url = new URL(links.web);
    expect(url.searchParams.get('origin')).toBe('10.1076,76.3516');
    expect(url.searchParams.get('destination')).toBe('10.111,76.387');
    expect(url.searchParams.has('dir_action')).toBe(false);
  });
});
