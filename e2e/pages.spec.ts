import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.skip(
  process.env.PLAYWRIGHT_STATIC_DEMO !== '1',
  'Static export validation is explicitly enabled.',
);
const staticURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3002/FloodRoute/';
const observed = new WeakMap<Page, { errors: string[]; api: string[]; brokenAssets: string[] }>();

test.beforeEach(async ({ page }) => {
  const evidence = { errors: [] as string[], api: [] as string[], brokenAssets: [] as string[] };
  observed.set(page, evidence);
  page.on('pageerror', (error) => evidence.errors.push(error.message));
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.includes('/api/')) evidence.api.push(request.url());
  });
  page.on('response', (response) => {
    if (response.url().includes('/_next/') && response.status() >= 400)
      evidence.brokenAssets.push(`${response.status()} ${response.url()}`);
  });
  await page.route('https://tile.openstreetmap.org/**', (route) => route.abort());
});

test.afterEach(async ({ page }) => {
  const evidence = observed.get(page)!;
  expect(evidence.errors, 'No uncaught browser errors').toEqual([]);
  expect(evidence.api, 'Static demo never needs a server API').toEqual([]);
  expect(evidence.brokenAssets, 'Bundled assets load successfully').toEqual([]);
});

test('Pages static baseline, bridge detour, hospital cutoff and reset', async ({ page }) => {
  await page.goto(staticURL);
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
  await expect(page.getByText('4.6', { exact: false }).first()).toBeVisible();
  await page.getByRole('tab', { name: 'Simulate', exact: true }).click();
  await page.getByRole('button', { name: /^Bridge closure/ }).click();
  await page.getByRole('tab', { name: 'Plan a route', exact: true }).click();
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
  await expect(page.getByText('4.6', { exact: false }).first()).toBeVisible();
});

test('Pages mobile keyboard, data provenance and asset base path', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(staticURL);
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
  const plan = page.getByRole('tab', { name: 'Plan a route', exact: true });
  await plan.focus();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Data', exact: true })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Know your data', exact: true })).toBeVisible();
  await expect(page.getByText('Not applicable: synthetic data', { exact: true })).toBeVisible();
  await page.keyboard.press('Home');
  await expect(plan).toBeFocused();
  const origin = page.getByLabel('Starting point', { exact: true });
  await origin.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(origin).not.toHaveValue('aluva');
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const basePath = new URL(staticURL).pathname.replace(/\/$/, '');
  const assetPaths = await page
    .locator('script[src], link[rel="stylesheet"]')
    .evaluateAll((elements) =>
      elements.map(
        (element) =>
          new URL(element.getAttribute('src') || element.getAttribute('href')!, location.href)
            .pathname,
      ),
    );
  expect(assetPaths.length).toBeGreaterThan(0);
  expect(assetPaths.every((path) => path.startsWith(`${basePath}/_next/`))).toBe(true);
  await expect(page.getByRole('link', { name: 'FloodRoute home', exact: true })).toHaveAttribute(
    'href',
    new RegExp(`^${basePath}/?$`),
  );
});

test('Pages saved closures restore and download remains a labelled simulation', async ({
  page,
}) => {
  await page.goto(staticURL);
  await expect(page.getByRole('heading', { name: 'Route available', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Simulate', exact: true }).click();
  await page.getByRole('button', { name: /^Compound flooding/ }).click();
  await page.getByRole('button', { name: 'Save locally', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Scenario saved on this browser');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'No connected route', exact: true }),
  ).toBeVisible();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export scenario', exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('floodroute-scenario.json');
  const file = await download.path();
  const data = JSON.parse(await readFile(file!, 'utf8'));
  expect(data.mode).toBe('simulation');
  expect(data.closures).toEqual(['bridge-east', 'hospital-access', 'shelter-access']);
  expect(data.analysis.route).toBeNull();
  expect(data.disclaimer).toContain('Not verified travel guidance');
});
