import { expect, test } from '@playwright/test';

test('plain homepage and Google Maps handoff follow selected places', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'See how road closures change a journey.' }),
  ).toBeVisible();
  const maps = page.getByRole('link', { name: 'Open in Google Maps' });
  await expect(maps).toBeVisible();
  const url = new URL((await maps.getAttribute('href'))!);
  expect(url.origin).toBe('https://www.google.com');
  expect(url.searchParams.get('api')).toBe('1');
  expect(url.searchParams.get('origin')).toBe('10.1076,76.3516');
  expect(url.searchParams.get('destination')).toBe('10.111,76.387');
  expect(url.searchParams.has('waypoints')).toBe(false);
  await expect(maps).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(
    page.getByText('Google Maps calculates its own directions;', { exact: false }),
  ).toBeVisible();
  await page.getByLabel('Destination', { exact: true }).selectOption('shelter');
  await expect(maps).toHaveAttribute('href', /destination=10.141%2C76.333/);
  await page.getByRole('button', { name: 'Swap starting point and destination' }).click();
  await expect(maps).toHaveAttribute('href', /origin=10.141%2C76.333/);
  await expect(maps).toHaveAttribute('href', /destination=10.1076%2C76.3516/);
  await page.getByLabel('Destination', { exact: true }).selectOption('shelter');
  await expect(page.getByRole('heading', { name: 'Already at destination' })).toBeVisible();
  await expect(maps).toHaveCount(0);
});

test('Maps handoff never claims to bypass a simulated closure', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('tab', { name: 'Simulate', exact: true }).click();
  await page.getByRole('button', { name: /^Hospital cutoff/ }).click();
  await page.getByRole('tab', { name: 'Plan a route', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No connected route' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open in Google Maps' })).toBeVisible();
  await expect(
    page.getByText('simulated closures are not included.', { exact: false }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
