import { expect, test } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';

test('baseline, bridge detour, hospital isolation and reset', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Simulate', exact: true }).click();
  await page.getByRole('button', { name: /^Bridge closure/ }).click();
  await page.getByRole('tab', { name: 'Plan a route', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
  await expect(page.getByText('12.4', { exact: false }).first()).toBeVisible();
  await page.getByRole('tab', { name: 'Simulate', exact: true }).click();
  await page.getByRole('button', { name: /^Hospital cutoff/ }).click();
  await page.getByRole('tab', { name: 'Plan a route', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'No connected route', exact: true }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Simulate', exact: true }).click();
  await page.getByRole('button', { name: 'Reset scenario', exact: true }).click();
  await page.getByRole('tab', { name: 'Plan a route', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
});

test('mobile fits the viewport and route selectors work by keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const origin = page.getByLabel('Starting point', { exact: true });
  await expect(origin).toBeVisible();
  await origin.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(origin).not.toHaveValue('aluva');
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('HTTP boundary exposes no incident-write API', async ({ request }) => {
  expect((await request.get('/api/network')).status()).toBe(200);
  expect(
    (
      await request.post('/api/analyze', {
        data: { origin: 'aluva', destination: 'hospital', closures: [] },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.post('/api/incidents', {
        data: { edgeId: 'hospital-access', status: 'active' },
      })
    ).status(),
  ).toBe(404);
  expect((await request.get('/api/analyze')).status()).toBe(405);
});

test('mobile data provenance and roving tabs work by keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
  const plan = page.getByRole('tab', { name: 'Plan a route', exact: true });
  await plan.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Simulate', exact: true })).toBeFocused();
  await page.keyboard.press('End');
  const data = page.getByRole('tab', { name: 'Data', exact: true });
  await expect(data).toBeFocused();
  await expect(data).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', { name: 'Know your data', exact: true })).toBeVisible();
  await expect(page.getByText('Not applicable: synthetic data', { exact: true })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(plan).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(data).toBeFocused();
  await page.keyboard.press('Home');
  await expect(plan).toBeFocused();
});

test('map survives tile failure and layer controls remain functional', async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
  await expect(page.getByText('Some map tiles could not load.', { exact: false })).toBeVisible();
  const roads = page.locator('path.leaflet-interactive[stroke="#94a2a5"]');
  await expect(roads).toHaveCount(8);
  await roads.first().click();
  await expect(page.getByText('1 simulated closure', { exact: false })).toBeVisible();
  await expect(page.getByText('12.4', { exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Layers', exact: true }).click();
  await page.getByLabel('Scenario roads', { exact: true }).uncheck();
  await expect(page.locator('path.leaflet-interactive[stroke="#94a2a5"]')).toHaveCount(0);
  await page.getByLabel('Scenario roads', { exact: true }).check();
  await expect(page.locator('path.leaflet-interactive[stroke="#94a2a5"]')).toHaveCount(7);
  await page.getByLabel('Illustrative flood zone', { exact: true }).uncheck();
  await expect(page.locator('path[fill="#9cc9e4"]')).toHaveCount(0);
  await page.getByLabel('Essential facilities', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Layers', exact: true }).click();
  await page.getByRole('button', { name: 'Hide basemap', exact: true }).click();
  await expect(page.getByText('Basemap hidden.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Fit network to map', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
});

test('saved closures restore and exported JSON identifies simulation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Simulate', exact: true }).click();
  await page.getByRole('button', { name: /^Compound flooding/ }).click();
  await page.getByRole('button', { name: 'Save locally', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Scenario saved on this browser.');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'No connected route', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('3 simulated closures', { exact: false })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export scenario', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('floodroute-scenario.json');
  const path = await download.path();
  expect(path).not.toBeNull();
  const exported = JSON.parse(await readFile(path!, 'utf8'));
  expect(exported.mode).toBe('simulation');
  expect(exported.closures).toEqual(['bridge-east', 'hospital-access', 'shelter-access']);
  expect(exported.analysis.route).toBeNull();
  expect(exported.disclaimer).toContain('Not verified travel guidance');
});

test('network failure offers retry and recovers', async ({ page }) => {
  let recovering = false;
  await page.route('**/api/network', async (route) => {
    if (!recovering) {
      await route.fulfill({ status: 503, json: { error: 'Unavailable' } });
    } else await route.continue();
  });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Network unavailable', exact: true }),
  ).toBeVisible();
  recovering = true;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
});

test('analysis loading, failure and retry preserve clear UI states', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let first = true;
  await page.route('**/api/analyze', async (route) => {
    if (first) {
      first = false;
      await gate;
      await route.fulfill({ status: 503, json: { error: 'Simulated analysis outage' } });
    } else await route.continue();
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Calculating…', exact: true })).toBeDisabled();
  await expect(
    page.getByText('Checking connections and facility access…', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export scenario', exact: true })).toBeDisabled();
  release();
  await expect(
    page.getByRole('heading', { name: 'Calculation unavailable', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Simulated analysis outage', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
});

test('capture desktop and mobile review screenshots', async ({ page }) => {
  await mkdir('docs/screenshots', { recursive: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
  await expect(page.locator('path.leaflet-interactive[stroke="#94a2a5"]')).toHaveCount(8);
  await page.screenshot({ path: 'docs/screenshots/desktop-baseline.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('tab', { name: 'Simulate', exact: true }).click();
  await page.getByRole('button', { name: /^Hospital cutoff/ }).click();
  await page.getByRole('tab', { name: 'Plan a route', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'No connected route', exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/mobile-hospital-cutoff.png', fullPage: true });
});
