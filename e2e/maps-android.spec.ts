import { expect, test } from '@playwright/test';

test.use({
  userAgent:
    'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  viewport: { width: 390, height: 844 },
});

test('Android Chrome offers an app intent with exact route and browser fallback', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(
    process.env.PLAYWRIGHT_STATIC_DEMO === '1' ? process.env.PLAYWRIGHT_BASE_URL! : '/',
  );
  const app = page.getByRole('link', { name: 'Open in Google Maps', exact: true });
  await expect(app).toHaveAttribute('href', /^intent:\/\/www.google.com\/maps\/dir\//);
  const intent = (await app.getAttribute('href'))!;
  expect(intent).toContain('package=com.google.android.apps.maps');
  const fallback = decodeURIComponent(intent.split('S.browser_fallback_url=')[1].split(';end')[0]);
  const web = page.getByRole('link', { name: 'Open Maps in browser', exact: true });
  await expect(web).toHaveAttribute('href', fallback);
  expect(new URL(fallback).searchParams.get('origin')).toBe('10.1076,76.3516');
  expect(new URL(fallback).searchParams.get('destination')).toBe('10.111,76.387');
  expect(await app.getAttribute('target')).toBeNull();
  await page.getByRole('button', { name: 'Copy Maps link', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Maps link copied.' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(fallback);
  await page.getByLabel('Destination', { exact: true }).selectOption('shelter');
  await expect(app).toHaveAttribute('href', /destination=10.141%2C76.333/);
});
